#!/usr/bin/env python3
"""Re-generate the 16 highlight files that had concatenated list items."""

import importlib.util, time
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "migrate_legacy_news",
    Path(__file__).parent / "migrate-legacy-news.py",
)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

REGEN_SLUGS = [
    "alexa-prize-finals-2020",
    "nsf-future-workshop-2021",
    "emnlp-papers-2021",
    "emnlp-ws-dm-st-papers-2021",
    "cpdr-paper-2022",
    "honors-theses-2022",
    "law-papers-2022",
    "kir-paper-2023",
    "dadm-paper-2023",
    "graduation-2023",
    "information-paper-2023",
    "emnlp-paper-2023",
    "sigdial-papers-2024",
    "emnlp-papers-2024",
    "information-papers-2024",
    "acl-2025",
]

HIGHLIGHTS_DIR = Path("/Users/jdchoi/Workspace/emorynlp.github.io/src/content/news")

total = len(REGEN_SLUGS)
for n, slug in enumerate(REGEN_SLUGS, start=1):
    print(f"[{n}/{total}]", end="", flush=True)
    # Delete the existing file so process_page will regenerate it
    html = m.fetch_html(slug)
    import re, json, html as htmllib
    for jld in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.DOTALL):
        try:
            d = json.loads(jld)
            if d.get('@type') == 'BlogPosting':
                title = htmllib.unescape(d.get('headline', '').strip())
                date_str = m.parse_date(d.get('datePublished', ''))
                if title and date_str:
                    file_stem = f"{date_str.replace('-', '')}-{m.slugify(title)}"
                    md_path = HIGHLIGHTS_DIR / f"{file_stem}.md"
                    if md_path.exists():
                        md_path.unlink()
                        print(f" deleted {md_path.name}", flush=True)
        except Exception as e:
            print(f" ERROR: {e}")
    m.process_page(slug)
    time.sleep(2)

print("\n✓ Regen complete!")
