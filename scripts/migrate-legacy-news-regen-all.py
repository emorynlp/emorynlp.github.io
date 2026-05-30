#!/usr/bin/env python3
"""
Delete and regenerate all 123 migration-created highlight MD files.
Pre-existing files (git-tracked) are skipped.
Images are already present and will be reused.
"""

import importlib.util, time
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "migrate_legacy_news",
    Path(__file__).parent / "migrate-legacy-news.py",
)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

# Files that existed before the migration (git-tracked) — do not touch
PROTECTED = {
    "20260402-innovation-of-the-year",
    "20260424-group-photo",
    "20260424-wild-heaven-bear-dinner",
    "20260503-undergraduate-honors-2026",
}

HIGHLIGHTS_DIR = Path("/Users/jdchoi/Workspace/emorynlp.github.io/src/content/news")

import re, json
import html as htmllib

total = len(m.SLUGS)
for n, slug in enumerate(m.SLUGS, start=1):
    print(f"[{n}/{total}]", end="", flush=True)

    # Determine the expected filename from the remote page
    html = m.fetch_html(slug)
    if not html or len(html) < 500:
        print(f" FETCH_FAILED: {slug}", flush=True)
        time.sleep(3)
        continue

    meta = m.extract_metadata(html)
    if not meta:
        print(f" NO_META: {slug}", flush=True)
        continue

    title = htmllib.unescape(meta.get("headline", "").strip())
    date_str = m.parse_date(meta.get("datePublished", ""))
    if not title or not date_str:
        print(f" NO_DATE: {slug}", flush=True)
        continue

    file_stem = f"{date_str.replace('-', '')}-{m.slugify(title)}"

    if file_stem in PROTECTED:
        print(f" PROTECTED: {file_stem}", flush=True)
        continue

    md_path = HIGHLIGHTS_DIR / f"{file_stem}.md"
    if md_path.exists():
        md_path.unlink()

    m.process_page(slug)
    time.sleep(1.5)

print("\n✓ Full regen complete!")
