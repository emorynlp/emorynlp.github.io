#!/usr/bin/env python3
"""
Fetch legacy emorynlp.org thesis pages and add `paperUrl` from the "Anthology" link (ETD catalog
or ACL Anthology). PDF download links from the legacy "Paper" anchor are not persisted.
"""

from __future__ import annotations

import importlib.util
import re
import ssl
import time
import urllib.request
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
THESES_DIR = ROOT / "src/content/theses"

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE


def _load_photo_script():
    spec = importlib.util.spec_from_file_location(
        "legacy_thesis_photos",
        ROOT / "scripts/download_legacy_thesis_photos.py",
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod


_PHOTO_MOD = _load_photo_script()
URLS_TEXT: str = _PHOTO_MOD.URLS_TEXT
LEGACY_SLUG_TO_LOCAL: dict[str, str] = _PHOTO_MOD.LEGACY_SLUG_TO_LOCAL


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "EmoryNLP-thesis-link-import/1.0"})
    with urllib.request.urlopen(req, context=SSL_CTX, timeout=55) as r:
        return r.read().decode("utf-8", "replace")


def abs_url(href: str) -> str | None:
    href = href.strip()
    if href.startswith(("http://", "https://")):
        return href
    if href.startswith("/"):
        return "https://www.emorynlp.org" + href
    return None


def parse_links_paragraph(html: str) -> str | None:
    """First <h3>Links</h3><p>...</p> on the page (full HTML; not confined to editor block)."""
    m = re.search(r"<h3>Links</h3>\s*<p>(.*?)</p>", html, re.I | re.S)
    return m.group(1) if m else None


def parse_anchor_pairs(p_inner: str) -> list[tuple[str, str]]:
    pairs: list[tuple[str, str]] = []
    for m in re.finditer(r"<a\s+href=\"([^\"]+)\"[^>]*>([^<]+)</a>", p_inner, re.I):
        href = abs_url(m.group(1).strip()) or m.group(1).strip()
        lab = m.group(2).strip()
        pairs.append((href, lab))
    return pairs


def pick_paper_url(pairs: list[tuple[str, str]]) -> str | None:
    """Legacy: label \"Anthology\" → ETD catalog or ACL landing page."""
    by_label: dict[str, str] = {}
    for href, lab in pairs:
        key = lab.strip().lower()
        if key not in by_label:
            by_label[key] = href

    paper: str | None = None
    if "anthology" in by_label:
        u = by_label["anthology"]
        if u.endswith(".pdf"):
            u = u[:-4]
        paper = u

    for href, _lab in pairs:
        lo = href.lower()
        if "aclanthology.org" in lo and "/volumes/" not in lo:
            if paper is None or "etd.library.emory.edu" in (paper or "").lower():
                u = href
                if u.endswith(".pdf"):
                    u = u[:-4]
                paper = u
            break

    return paper


def yaml_double_quoted(s: str) -> str:
    back = s.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{back}"'


def local_stem_from_legacy_url(url: str) -> str:
    path = urlparse(url).path.rstrip("/")
    legacy = unquote(path.split("/")[-1])
    return LEGACY_SLUG_TO_LOCAL.get(legacy, legacy)


def inject_yaml_fields(fm_lines: list[str], paper: str | None) -> list[str]:
    keys = {ln.split(":", 1)[0].strip() for ln in fm_lines if re.match(r"^[a-zA-Z_]+\s*:", ln)}
    to_add: list[str] = []
    if paper and "paperUrl" not in keys:
        to_add.append(f"paperUrl: {yaml_double_quoted(paper)}")
    if not to_add:
        return fm_lines

    anchor = None
    for i, ln in enumerate(fm_lines):
        if re.match(r"^(committee|honorsLevel|photo|sourceUrl)\s*:", ln):
            anchor = i
            break
    if anchor is None:
        anchor = len(fm_lines)

    return fm_lines[:anchor] + to_add + fm_lines[anchor:]


def patch_thesis_md(path: Path, paper: str | None) -> bool:
    raw = path.read_text()
    if not raw.startswith("---\n"):
        return False
    end = raw.find("\n---\n", 4)
    if end == -1:
        return False
    fm_body = raw[4:end]
    body_start = end + len("\n---\n")
    tail = raw[body_start:]

    fm_lines = fm_body.split("\n")
    new_fm_lines = inject_yaml_fields(fm_lines, paper)
    if new_fm_lines == fm_lines:
        return False
    new_raw = "---\n" + "\n".join(new_fm_lines) + "\n---\n" + tail
    path.write_text(new_raw)
    return True


def main() -> None:
    urls = [ln.strip() for ln in URLS_TEXT.splitlines() if ln.strip().startswith("http")]
    patched = 0
    skips = 0
    errs: list[tuple[str, str]] = []

    for url in urls:
        stem = local_stem_from_legacy_url(url)
        md_path = THESES_DIR / f"{stem}.md"
        if not md_path.is_file():
            errs.append((url, f"missing {md_path.relative_to(ROOT)}"))
            continue
        try:
            html = fetch(url)
            time.sleep(0.35)
            lp = parse_links_paragraph(html)
            if not lp:
                errs.append((url, "no Links paragraph"))
                continue
            paper = pick_paper_url(parse_anchor_pairs(lp))
            if not paper:
                errs.append((url, "no Anthology/catalog link parsed"))
                continue
            if patch_thesis_md(md_path, paper):
                print("patched", stem)
                patched += 1
            else:
                skips += 1
        except Exception as e:
            errs.append((url, str(e)))

    print(f"\ndone: patched {patched}, skipped up-to-date {skips}, errors {len(errs)}")
    for u, msg in errs:
        print(f"ERR {msg} :: {u}")


if __name__ == "__main__":
    main()
