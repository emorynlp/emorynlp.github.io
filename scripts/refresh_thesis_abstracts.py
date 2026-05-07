#!/usr/bin/env python3
"""Re-fetch legacy thesis pages and fix `abstract` frontmatter (all <p> blocks under Abstract)."""

from __future__ import annotations

import re
import subprocess
import time
from pathlib import Path

import yaml
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
THESES_DIR = ROOT / 'src/content/theses'

ABSTRACT_FM_RE = re.compile(
	r'^abstract:\s*\|\n(?:^[ \t].*(?:\n|$)|^\n)+',
	re.MULTILINE,
)


def fetch_html(url: str) -> str:
	return subprocess.check_output(['curl', '-ksL', url], text=True)


def extract_abstract_paragraphs(html: str) -> str | None:
	soup = BeautifulSoup(html, 'html.parser')
	for h in soup.find_all('h3'):
		if h.get_text(strip=True) != 'Abstract':
			continue
		paras: list[str] = []
		for sib in h.next_siblings:
			if getattr(sib, 'name', None) == 'h3':
				break
			if getattr(sib, 'name', None) == 'p':
				t = sib.get_text(' ', strip=True)
				if t:
					paras.append(t)
		if not paras:
			return None
		return '\n\n'.join(paras)
	return None


def abstract_to_yaml_block(text: str) -> str:
	paras = [p.strip() for p in text.strip().split('\n\n') if p.strip()]
	lines = ['abstract: |']
	for i, p in enumerate(paras):
		for line in p.split('\n'):
			lines.append('  ' + line.strip())
		if i < len(paras) - 1:
			lines.append('  ')
	return '\n'.join(lines) + '\n'


def replace_abstract_fm(fm: str, new_abstract: str) -> str:
	block = abstract_to_yaml_block(new_abstract)
	if ABSTRACT_FM_RE.search(fm):
		return ABSTRACT_FM_RE.sub(block, fm, count=1)
	raise ValueError('abstract: | block not found in frontmatter')


def main() -> None:
	paths = sorted(THESES_DIR.glob('*.md'))
	updated = 0
	skipped = 0
	errors = 0

	for md_path in paths:
		raw = md_path.read_text(encoding='utf-8')
		if not raw.startswith('---\n'):
			print('skip (no fm)', md_path.name)
			skipped += 1
			continue
		try:
			_, fm, body = raw.split('---', 2)
		except ValueError:
			print('skip (bad split)', md_path.name)
			skipped += 1
			continue

		fm = fm.strip('\n')
		meta = yaml.safe_load(fm) or {}
		url = meta.get('sourceUrl')
		if not url:
			print('skip (no sourceUrl)', md_path.name)
			skipped += 1
			continue

		try:
			html = fetch_html(str(url))
			new_abs = extract_abstract_paragraphs(html)
		except Exception as e:
			print('ERR fetch', md_path.name, e)
			errors += 1
			continue

		if not new_abs:
			print('WARN no abstract paragraphs', md_path.name)
			errors += 1
			continue

		old_abs = meta.get('abstract')
		old_norm = None if old_abs is None else ' '.join(old_abs.split()).strip()
		new_norm = ' '.join(new_abs.split()).strip()

		if old_norm == new_norm:
			print('ok ', md_path.name)
			time.sleep(0.08)
			continue

		try:
			fm_new = replace_abstract_fm(fm + '\n', new_abs)
		except ValueError as e:
			print('ERR fm', md_path.name, e)
			errors += 1
			continue

		body_norm = body if body.startswith('\n') else '\n' + body
		out = '---\n' + fm_new.rstrip('\n') + '\n---' + body_norm
		md_path.write_text(out, encoding='utf-8')
		print('UPD', md_path.name)
		updated += 1
		time.sleep(0.12)

	print('done: updated=', updated, 'skipped=', skipped, 'errors=', errors)


if __name__ == '__main__':
	main()
