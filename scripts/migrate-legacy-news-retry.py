#!/usr/bin/env python3
"""Retry the 19 rate-limited legacy pages with longer delays."""

import importlib.util, sys, time
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "migrate_legacy_news",
    Path(__file__).parent / "migrate-legacy-news.py",
)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

RETRY_SLUGS = [
    "naclo-2020",
    "dinner-at-hai-chinese-restaurant",
    "acm-programming-contest-2019",
    "dinner-at-golden-buddha-restaurant",
    "bowling-night-at-comet-pub-lanes",
    "emory-cs-awards-2019",
    "dinner-at-nakato-japanese-restaurant",
    "naclo-2019",
    "aws-re-invent-2018",
    "dinner-at-crema-coffee-bar",
    "acm-programming-contest-2018",
    "emory-cs-awards-2018",
    "acm-programming-contest-2017",
    "bowling-night-at-comet-pub-lanes-1",
    "emory-cs-awards-2017",
    "acm-programming-contest-2016",
    "emory-cs-awards-2016",
    "acm-programming-contest-2015",
    "thanksgiving-dinner-at-dr-choi-s-place",
]

total = len(RETRY_SLUGS)
for n, slug in enumerate(RETRY_SLUGS, start=1):
    print(f"[{n}/{total}]", end="", flush=True)
    m.process_page(slug)
    time.sleep(3)

print("\n✓ Retry complete!")
