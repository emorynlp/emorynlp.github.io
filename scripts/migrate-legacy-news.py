#!/usr/bin/env python3
"""
Migration: emorynlp.org/news/* → src/content/news/*.md

For each legacy page:
  1. Fetch HTML via curl
  2. Extract title, date, tags, body HTML from structured data + DOM
  3. Download content (normal_*) images; skip legacy cover image variants (800_*, 2000_*)
  4. Convert images to WebP via the project's resize-media-photo.mjs script
  5. Convert body HTML → clean Markdown
  6. Write src/content/news/YYYYMMDD-slug.md
"""

import os
import re
import json
import html as htmllib
import subprocess
import time
from pathlib import Path

WORKSPACE = Path("/Users/jdchoi/Workspace/emorynlp.github.io")
HIGHLIGHTS_DIR = WORKSPACE / "src/content/news"
PUBLIC_DIR = WORKSPACE / "public/news"
OLD_BASE = "https://www.emorynlp.org"

# All 123 legacy slugs (in order as they appear on the listing pages)
SLUGS = [
    # Page 1
    "acl-2025",
    "awards-2025",
    "ms-theses-2025",
    "honors-students-2025",
    "nsf-panel-2025-copy",       # = Emory Hacks 2025
    "nih-panel-2024-copy",       # = NSF Panel 2025
    "korea-ai-2023-copy",        # = AI4Research Keynote 2025
    "naclo-2025",
    "coling-paper-2025",
    "thanksgiving-lunch-2024",
    "emnlp-papers-2024",
    "information-papers-2024",
    # Page 2
    "bowling-night-2024",
    "sigdial-papers-2024",
    "snu-seminar-2024",
    "graduation-2024",
    "social-night-2024",
    "emory-cs-awards-2024",
    "photo-shoot-2024",
    "southnlp-2024",
    "doctor-of-philosophy-2024",
    "honors-students-2024",
    "qualifying-exam-2024",
    "coling-lrec-paper-2024",
    # Page 3
    "nih-panel-2024",
    "naclo-2024",
    "social-night-2023",
    "korea-ai-2023",
    "tacl-paper-2024",
    "emnlp-paper-2023",
    "ictai-paper-2023",
    "information-paper-2023",
    "cjo-paper-2023",
    "sec-seminar-2023",
    "sigdial-paper-2023",
    "acl-2023",
    # Page 4
    "bowling-night-2023",
    "graduation-2023",
    "acl-papers-2023",
    "honors-students-2023",
    "photo-shoot-2023",
    "ldc-2023",
    "emory-cs-awards-2023",
    "easter-dinner-2023",
    "korean-culture-night-2023",
    "icpc-southeast-regional-2022",
    "tacl-paper-2023",
    "naclo-2023",
    # Page 5
    "dadm-paper-2023",
    "emory-ai-ethics-2022",
    "kir-paper-2023",
    "thanksgiving-lunch-2022",
    "emnlp-ws-paper-2023",
    "coling-paper-2022",
    "emory-kp-collaboration-2022",
    "korea-seminars-2022",
    "bowling-night-2022",
    "kaist-colloquium-2022",
    "law-papers-2022",
    "sem-paper-2022",
    # Page 6
    "emory-math-cs-awards-2022",
    "easter-lunch-2022",
    "emory-alexaai-collaboration-2022",
    "naacl-paper-2022",
    "icpc-southeast-regional-2021",
    "honors-theses-2022",
    "tedxemory-2022",
    "syntaxfest-2022",
    "icassp-paper-2022",
    "emory-initialview-collaboration-2022",
    "cpdr-paper-2022",
    "aaai-paper-2022",
    # Page 7
    "thanksgiving-lunch-2021",
    "iwsds-2021",
    "emory-board-of-visitors-2021",
    "disney-research-s-visit-2021",
    "the-podcast-at-emory-2036",
    "global-ai-forum-2021",
    "emory-initialview-collaboration-2021",
    "georgia-tech-linguistics-talk-2021",
    "emnlp-ws-dm-st-papers-2021",
    "atlanta-journal-constitution-2021",
    "phd-qualifying-exams-2021",
    "dr-liu-s-visit-2021",
    # Page 8
    "dr-provost-s-visit-2021",
    "tenure-promotion-2021",
    "emnlp-papers-2021",
    "emora-s-vision-2021",
    "postech-ai-seminar-2021",
    "acl-ijcnlp-appreciation-2021",
    "alexa-prize-finals-2021",
    "nsf-future-workshop-2021",
    "snu-linguistics-colloquium-2021",
    "emory-qtm-datablitz-2021",
    "emory-cs-awards-2021",
    "acm-programming-contest-2020",
    # Page 9
    "humanitarian-ai-2020",
    "cmu-lti-colloquium-2020",
    "professor-of-the-year-award-2020",
    "alexa-prize-finals-2020",
    "laney-graduate-awards-2020",
    "emory-cs-awards-2020",
    "icpc-north-america-championship-2019",
    "confluence-2020",
    "naclo-2020",
    "dinner-at-hai-chinese-restaurant",
    "acm-programming-contest-2019",
    "dinner-at-golden-buddha-restaurant",
    # Page 10
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
    # Page 11
    "emory-cs-awards-2016",
    "acm-programming-contest-2015",
    "thanksgiving-dinner-at-dr-choi-s-place",
]


def slugify(text: str) -> str:
    s = text.lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")


def fetch_html(url_slug: str) -> str:
    url = f"{OLD_BASE}/news/{url_slug}"
    result = subprocess.run(
        ["curl", "-s", "-L", "--max-time", "30", url],
        capture_output=True, text=True, timeout=35,
    )
    return result.stdout


def extract_metadata(html: str) -> dict:
    for jld in re.findall(
        r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.DOTALL
    ):
        try:
            d = json.loads(jld)
            if d.get("@type") == "BlogPosting":
                return d
        except Exception:
            pass
    return {}


def extract_tags(html: str) -> list[str]:
    return re.findall(r'href="/news/tag/([^"]+)"', html)


def parse_date(date_str: str) -> str | None:
    """'2025-07-30UTC12:28 PM' → '2025-07-30'"""
    m = re.match(r"(\d{4}-\d{2}-\d{2})", date_str)
    return m.group(1) if m else None


def extract_body_html(html: str) -> str:
    m = re.search(
        r'class="[^"]*contentDiv[^"]*"[^>]*>(.*?)'
        r'(?:<div[^>]*class="[^"]*(?:blogTags|tag)[^"]*")',
        html, re.DOTALL,
    )
    return m.group(1) if m else ""


def extract_images_with_captions(body_html: str):
    """
    Find all editorBox image blocks, extract (img_url, caption) pairs,
    and replace each block + its following center-aligned caption with [IMAGE_N].
    Returns (pairs, processed_html).
    """
    pairs: list[tuple[str, str]] = []

    def replace_img_block(m):
        img_url_m = re.search(
            r'<img[^>]+src="(https://files\.cdn-files-a\.com/[^"]+)"', m.group(0)
        )
        if img_url_m:
            pairs.append((img_url_m.group(1), ""))
            return f"[IMAGE_{len(pairs)}]"
        return ""

    processed = re.sub(
        r'<div[^>]*class="[^"]*editorBox[^"]*"[^>]*>.*?</div>',
        replace_img_block,
        body_html,
        flags=re.DOTALL,
    )

    # Capture the caption paragraph that immediately follows each placeholder
    def absorb_caption(m):
        placeholder = m.group(1)
        idx = int(re.search(r"\d+", placeholder).group()) - 1
        caption = htmllib.unescape(re.sub(r"<[^>]+>", "", m.group(2))).strip()
        if idx < len(pairs):
            pairs[idx] = (pairs[idx][0], caption)
        return placeholder

    processed = re.sub(
        r"(\[IMAGE_\d+\])\s*<p[^>]*style=\"[^\"]*text-align:\s*center[^\"]*\"[^>]*>(.*?)</p>",
        absorb_caption,
        processed,
        flags=re.DOTALL,
    )

    return pairs, processed


def _convert_link(href: str, inner_html: str) -> str:
    """Convert a single <a> element to Markdown, given its href and inner HTML."""
    # Strip nested tags to get link text
    text = re.sub(r"<[^>]+>", " ", inner_html)
    text = re.sub(r"\s+", " ", text).strip()
    text = htmllib.unescape(text)
    if not text:
        return ""
    if href.startswith("/publications"):
        return f"[{text}](https://www.emorynlp.org{href})"
    if href.startswith(("/faculty/", "/people/")):
        return text
    if href.startswith("/news/"):
        return text
    if href.startswith(("http://", "https://")):
        return f"[{text}]({href})"
    return f"[{text}](https://www.emorynlp.org{href})"


def _convert_links_in_html(fragment: str) -> str:
    """Replace all <a href="...">...</a> in a fragment with Markdown links."""
    return re.sub(
        r'<a[^>]+href="([^"]*)"[^>]*>(.*?)</a>',
        lambda m: _convert_link(m.group(1), m.group(2)),
        fragment,
        flags=re.DOTALL,
    )


def html_to_markdown(html_content: str) -> str:
    h = html_content

    # 1. Convert ordered lists (<ol>) → numbered Markdown items
    def convert_ol(m):
        items = re.findall(r"<li[^>]*>(.*?)</li>", m.group(1), re.DOTALL)
        lines = []
        for i, item in enumerate(items, 1):
            item = _convert_links_in_html(item)
            text = re.sub(r"<[^>]+>", " ", item)
            text = htmllib.unescape(re.sub(r"\s+", " ", text).strip())
            if text:
                lines.append(f"{i}. {text}")
        return "\n\n" + "\n".join(lines) + "\n\n"

    h = re.sub(r"<ol[^>]*>(.*?)</ol>", convert_ol, h, flags=re.DOTALL)

    # 2. Convert unordered lists (<ul>) → bulleted Markdown items
    def convert_ul(m):
        items = re.findall(r"<li[^>]*>(.*?)</li>", m.group(1), re.DOTALL)
        lines = []
        for item in items:
            item = _convert_links_in_html(item)
            text = re.sub(r"<[^>]+>", " ", item)
            text = htmllib.unescape(re.sub(r"\s+", " ", text).strip())
            if text:
                lines.append(f"- {text}")
        return "\n\n" + "\n".join(lines) + "\n\n"

    h = re.sub(r"<ul[^>]*>(.*?)</ul>", convert_ul, h, flags=re.DOTALL)

    # 3. Convert remaining hyperlinks
    h = _convert_links_in_html(h)

    # 4. Bold / italic
    h = re.sub(r"<(?:strong|b)[^>]*>(.*?)</(?:strong|b)>", r"**\1**", h, flags=re.DOTALL)
    h = re.sub(r"<(?:em|i)[^>]*>(.*?)</(?:em|i)>", r"*\1*", h, flags=re.DOTALL)

    # 5. Paragraphs and line breaks
    h = re.sub(r"<br\s*/?>", "\n", h)
    h = re.sub(r"<p[^>]*>(.*?)</p>", r"\1\n\n", h, flags=re.DOTALL)
    h = re.sub(r"<h[1-6][^>]*>(.*?)</h[1-6]>", r"**\1**\n\n", h, flags=re.DOTALL)

    # 6. Strip remaining tags
    h = re.sub(r"<[^>]+>", "", h)

    # 7. Unescape HTML entities
    h = htmllib.unescape(h)

    # 8. Normalise whitespace line by line
    lines = []
    for line in h.splitlines():
        line = re.sub(r"[ \t]+", " ", line).strip()
        lines.append(line)
    h = "\n".join(lines)
    h = re.sub(r"\n{3,}", "\n\n", h)

    return h.strip()


def download_image(url: str, dest: Path) -> bool:
    result = subprocess.run(
        ["curl", "-s", "-L", "--max-time", "60", "-o", str(dest), url],
        capture_output=True, timeout=65,
    )
    return result.returncode == 0 and dest.exists() and dest.stat().st_size > 1000


def convert_to_webp(filepath: Path) -> Path | None:
    """Run the project's resize/convert script; returns the .webp path on success."""
    result = subprocess.run(
        ["node", "scripts/resize-media-photo.mjs", str(filepath)],
        capture_output=True, text=True,
        cwd=str(WORKSPACE), timeout=60,
    )
    if result.returncode == 0:
        webp = filepath.with_suffix(".webp")
        if webp.exists():
            return webp
    return None


def process_page(url_slug: str) -> None:
    print(f"\n→ {url_slug}")

    html = fetch_html(url_slug)
    if not html or len(html) < 500:
        print("  SKIP: empty or too-short response")
        return

    meta = extract_metadata(html)
    if not meta:
        print("  SKIP: no BlogPosting JSON-LD found")
        return

    title = htmllib.unescape(meta.get("headline", "").strip())
    date_raw = meta.get("datePublished", "")
    date_str = parse_date(date_raw)

    if not title or not date_str:
        print(f"  SKIP: missing title ({title!r}) or date ({date_raw!r})")
        return

    date_compact = date_str.replace("-", "")   # YYYYMMDD
    title_slug = slugify(title)
    file_stem = f"{date_compact}-{title_slug}"
    md_path = HIGHLIGHTS_DIR / f"{file_stem}.md"

    if md_path.exists():
        print(f"  SKIP: already exists → {md_path.name}")
        return

    tags = extract_tags(html)
    body_html = extract_body_html(html)
    img_pairs, processed_body = extract_images_with_captions(body_html)

    # Download + convert content images
    downloaded: list[tuple[int, str, str]] = []   # (1-based index, caption, filename)
    for i, (img_url, caption) in enumerate(img_pairs, start=1):
        # Only download normal_ images (skip 800_/2000_ cover variants)
        if not re.search(r"/normal_", img_url):
            continue

        ext_m = re.search(r"\.(jpg|jpeg|png|gif|webp)(\?|$)", img_url, re.IGNORECASE)
        ext = ext_m.group(1).lower() if ext_m else "jpg"

        raw_dest = PUBLIC_DIR / f"{file_stem}-{i}.{ext}"
        webp_dest = PUBLIC_DIR / f"{file_stem}-{i}.webp"

        if webp_dest.exists():
            print(f"  Image {i} already converted → {webp_dest.name}")
            downloaded.append((i, caption, webp_dest.name))
            continue

        print(f"  Downloading image {i}/{len(img_pairs)} …")
        if not download_image(img_url, raw_dest):
            print(f"  WARNING: download failed for image {i}")
            continue

        if ext == "webp":
            downloaded.append((i, caption, raw_dest.name))
        else:
            webp = convert_to_webp(raw_dest)
            if webp:
                print(f"  Converted → {webp.name}")
                downloaded.append((i, caption, webp.name))
            else:
                # Conversion failed; keep original
                print(f"  WARNING: webp conversion failed; keeping {raw_dest.name}")
                downloaded.append((i, caption, raw_dest.name))

        time.sleep(0.1)

    # Convert body HTML → Markdown
    md_body = html_to_markdown(processed_body)

    # Substitute [IMAGE_N] placeholders
    for idx, caption, filename in downloaded:
        alt = caption if caption else f"{title}, {date_str}"
        img_md = f"\n![{alt}](/news/{filename})\n"
        md_body = md_body.replace(f"[IMAGE_{idx}]", img_md)

    # Drop unresolved placeholders (images that failed to download)
    md_body = re.sub(r"\[IMAGE_\d+\]", "", md_body)
    md_body = re.sub(r"\n{3,}", "\n\n", md_body).strip()

    # Cover image = first successfully downloaded content image
    cover_image = f"/news/{downloaded[0][2]}" if downloaded else None

    # Build frontmatter
    fm: list[str] = ["---", f"title: {title}", f"date: '{date_str}'"]
    if cover_image:
        fm.append(f"coverImage: {cover_image}")
    if tags:
        fm.append("labels:")
        for tag in tags:
            fm.append(f"  - {tag}")
    fm.append("---")

    content = "\n".join(fm) + "\n\n" + md_body + "\n"

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(content)

    imgs_info = f", {len(downloaded)} image(s)" if downloaded else ", no images"
    print(f"  ✓ {md_path.name}{imgs_info}")


def main() -> None:
    HIGHLIGHTS_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    total = len(SLUGS)
    for n, slug in enumerate(SLUGS, start=1):
        print(f"[{n}/{total}]", end="")
        process_page(slug)
        time.sleep(0.4)   # polite delay between requests

    print("\n\n✓ Migration complete!")


if __name__ == "__main__":
    main()
