#!/usr/bin/env python3
"""
Set thesis `author` to canonical people `name` when matched, and set honors `degree` to BS/BA
from people education (or legacy HTML Degree / Year).
"""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
PEOPLE_DIR = ROOT / 'src/content/people'
THESES_DIR = ROOT / 'src/content/theses'


def norm_key(raw: str) -> str:
	s = raw.strip().lower().replace('.', ' ').replace('\u00a0', ' ')
	return re.sub(r'\s+', ' ', s).strip()


def collapse_middle_initial_keys(key: str) -> str:
	parts = [p for p in key.split(' ') if p]
	if len(parts) <= 2:
		return key
	kept = [p for i, p in enumerate(parts) if i == 0 or i == len(parts) - 1 or len(p) > 1]
	return ' '.join(kept)


def name_variants(primary: str, aliases: list | None) -> list[str]:
	out: set[str] = set()

	def add(s: str):
		k = norm_key(s)
		if not k:
			return
		out.add(k)
		out.add(collapse_middle_initial_keys(k))

	add(primary)
	for a in aliases or []:
		add(a)
	return list(out)


def fetch_html(url: str) -> str:
	return subprocess.check_output(['curl', '-ksL', url], text=True)


def parse_legacy_degree_prefix(html: str) -> str | None:
	m = re.search(r'<h3>\s*Degree / Year\s*</h3>\s*<p[^>]*>(.*?)</p>', html, re.I | re.S)
	if not m:
		return None
	from bs4 import BeautifulSoup

	t = BeautifulSoup(m.group(1), 'html.parser').get_text(' ', strip=True)
	leading = t.split('/')[0].strip().upper()
	if leading.startswith('BS') or leading.startswith('B.S'):
		return 'BS'
	if leading.startswith('BA') or leading.startswith('B.A'):
		return 'BA'
	return None


def first_undergrad_abbrev(education: list | None) -> str | None:
	if not education:
		return None
	for entry in education:
		deg = (entry.get('degree') or '').strip()
		for part in re.split(r'\s*;\s*', deg):
			p = part.strip().upper()
			if p.startswith('BS') or p.startswith('B.S'):
				return 'BS'
			if p.startswith('BA') or p.startswith('B.A'):
				return 'BA'
	return None


def main() -> None:
	lookup: dict[str, tuple[str, dict]] = {}
	for p in sorted(PEOPLE_DIR.glob('*.md')):
		fm = yaml.safe_load(p.read_text(encoding='utf-8').split('---', 2)[1])
		slug = p.stem
		for v in name_variants(fm.get('name', ''), fm.get('aliases')):
			if v not in lookup:
				lookup[v] = (slug, fm)

	updated = 0
	for md in sorted(THESES_DIR.glob('*.md')):
		raw = md.read_text(encoding='utf-8')
		if not raw.startswith('---'):
			continue
		parts = raw.split('---', 2)
		if len(parts) < 3:
			continue
		fm = parts[1].strip('\n')
		body = parts[2]
		meta = yaml.safe_load(fm)
		author = (meta.get('author') or '').strip()
		deg = meta.get('degree')
		if not author:
			continue

		k = norm_key(author)
		k2 = collapse_middle_initial_keys(k)
		hit = lookup.get(k) or lookup.get(k2)
		new_author = author
		new_degree = deg

		if hit:
			_, person = hit
			new_author = person.get('name') or author
			if deg in ('Undergraduate Honors', 'Undergraduate Thesis'):
				u = first_undergrad_abbrev(person.get('education'))
				if u:
					new_degree = u

		if deg in ('Undergraduate Honors', 'Undergraduate Thesis') and new_degree == deg:
			url = meta.get('sourceUrl')
			if url:
				try:
					html = fetch_html(str(url))
					u = parse_legacy_degree_prefix(html)
					if u:
						new_degree = u
				except Exception as e:
					print('WARN fetch', md.name, e)

		if new_author == author and new_degree == deg:
			continue

		fm_lines = fm.split('\n')
		out_lines: list[str] = []
		seen_a = seen_d = False
		for line in fm_lines:
			if re.match(r'^author:\s', line):
				out_lines.append(f'author: {json.dumps(new_author)}')
				seen_a = True
			elif re.match(r'^degree:\s', line):
				out_lines.append(f'degree: {json.dumps(new_degree)}')
				seen_d = True
			else:
				out_lines.append(line)
		if not seen_a or not seen_d:
			print('SKIP bad fm', md.name)
			continue

		new_raw = '---\n' + '\n'.join(out_lines) + '\n---' + body
		md.write_text(new_raw, encoding='utf-8')
		print('UPD', md.name, '|', author, '->', new_author, '|', deg, '->', new_degree)
		updated += 1

	print('done, updated', updated)


if __name__ == '__main__':
	main()
