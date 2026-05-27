#!/usr/bin/env python3
"""
One-off: fetch legacy emorynlp.org seminar pages and write
`src/content/seminars/{legacy-slug}.md` entries.

Semester listing pages:
  https://www.emorynlp.org/seminars/.c/{fall-2021,spring-2022,...}
"""

from __future__ import annotations

import re
import ssl
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src/content/seminars"
PUBLIC = ROOT / "public/seminars"
OLD_BASE = "https://www.emorynlp.org"
JINA_PREFIX = "https://r.jina.ai/"

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

TERM_PAGES = [
    "fall-2021",
    "spring-2022",
    "fall-2022",
    "spring-2023",
    "fall-2023",
    "spring-2024",
    "fall-2024",
    "spring-2025",
    "fall-2025",
    "spring-2026",
]


def fetch_markdown(url: str) -> str:
    reader_url = JINA_PREFIX + url
    req = urllib.request.Request(
        reader_url,
        headers={"User-Agent": "EmoryNLP-site-import/1.0", "Accept": "text/plain"},
    )
    last_error: Exception | None = None
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=90, context=SSL_CTX) as response:
                return response.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as exc:
            last_error = exc
            if exc.code == 429 and attempt < 5:
                time.sleep(4 + attempt * 4)
                continue
            raise
        except urllib.error.URLError as exc:
            last_error = exc
            if attempt < 5:
                time.sleep(2 + attempt * 2)
                continue
            raise
    if last_error:
        raise last_error
    raise RuntimeError(f"failed to fetch {url}")


def term_label(term_slug: str) -> str:
    season, year = term_slug.split("-", 1)
    season = season[:1].upper() + season[1:]
    return f"{season} {year}"


def collect_term_slugs(term_slug: str) -> list[str]:
    slugs: set[str] = set()
    for page in range(1, 8):
        suffix = "" if page == 1 else f"/-page/{page}"
        url = f"{OLD_BASE}/seminars/.c/{term_slug}{suffix}"
        try:
            md = fetch_markdown(url)
        except urllib.error.URLError:
            break
        found = re.findall(rf"/seminars/([a-z0-9-]+)\?c={re.escape(term_slug)}", md)
        if not found and page > 1:
            break
        slugs.update(found)
        time.sleep(1.2)
    return sorted(slugs)


def markdown_links(line: str) -> list[str]:
    names: list[str] = []
    for match in re.finditer(r"\[([^\]]+)\]\([^)]+\)", line):
        name = match.group(1).strip()
        if name:
            names.append(name)
    if names:
        return names
    plain = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", line)
    return [part.strip() for part in re.split(r"\s*,\s*", plain) if part.strip()]


def parse_date_time(date_line: str) -> tuple[str | None, str | None]:
    line = " ".join(date_line.split())
    match = re.match(r"Date:\s*(\d{4}-\d{2}-\d{2})\s*/\s*(.+)$", line, re.I)
    if not match:
        match = re.match(r"(\d{4}-\d{2}-\d{2})", line)
        if not match:
            return None, None
        return match.group(1), None
    return match.group(1), match.group(2).replace("~", "-").strip() or None


def parse_location(line: str) -> str | None:
    match = re.match(r"Location:\s*(.+)$", line.strip(), re.I)
    if not match:
        return None
    value = match.group(1).strip()
    link = re.search(r"\((https?://[^)]+)\)", value)
    if link:
        return link.group(1).strip()
    return re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value).strip() or None


def section_value(lines: list[str], start: int, heading: str) -> tuple[str, int]:
    if start >= len(lines) or lines[start].strip().lower() != heading.lower():
        return "", start
    body: list[str] = []
    index = start + 1
    while index < len(lines):
        stripped = lines[index].strip()
        if stripped.startswith("#"):
            break
        if stripped:
            body.append(stripped)
        index += 1
    return " ".join(" ".join(body).split()), index


def detail_body(md: str) -> str:
    marker = "Markdown Content:"
    if marker in md:
        return md.split(marker, 1)[1].strip()
    return md.strip()


def page_presenter_name(body: str) -> str | None:
    for line in body.splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            label = stripped[2:].strip()
            if ":" in label:
                return label.rsplit(":", 1)[-1].strip()
            return label
    return None


def page_cover_image(body: str) -> str | None:
    match = re.search(r"!\[[^\]]*\]\((https?://[^)]+)\)", body)
    return match.group(1) if match else None


def parse_talk_sections(body: str) -> list[dict]:
    cover = page_cover_image(body)
    fallback_presenter = page_presenter_name(body)
    chunks = re.split(r"\n\* \* \*\n", body)
    talks: list[dict] = []
    for chunk in chunks:
        lines = [line.rstrip() for line in chunk.splitlines()]
        title = ""
        speakers: list[str] = []
        date: str | None = None
        time: str | None = None
        location: str | None = None
        abstract = ""
        slides: str | None = None
        bio = ""
        index = 0
        while index < len(lines):
            line = lines[index].strip()
            if line.startswith("## "):
                title = line[3:].strip()
            elif line.startswith("#### "):
                speakers = markdown_links(line[5:])
            elif line.lower().startswith("date:"):
                date, time = parse_date_time(line)
            elif line.lower().startswith("location:"):
                location = parse_location(line)
            elif line == "### Abstract":
                abstract, index = section_value(lines, index, "### Abstract")
                continue
            elif line == "### Link":
                link_text, index = section_value(lines, index, "### Link")
                link_match = re.search(r"\((https?://[^)]+)\)", link_text)
                slides = link_match.group(1) if link_match else None
                continue
            elif line == "### Bio":
                bio, index = section_value(lines, index, "### Bio")
                continue
            index += 1

        if not title and talks:
            previous = talks[-1]
            if abstract:
                previous["abstract"] = abstract
            if slides:
                previous["slides"] = slides
            if bio:
                previous["bio"] = (previous.get("bio", "") + "\n\n" + bio).strip()
            continue

        if not title:
            continue

        if not speakers and fallback_presenter:
            speakers = [fallback_presenter]

        talks.append(
            {
                "title": title,
                "speakers": speakers,
                "date": date,
                "time": time,
                "location": location,
                "abstract": abstract,
                "slides": slides,
                "bio": bio,
                "cover": cover,
            }
        )
    return talks


def yaml_escape(value: str) -> str:
    value = value.replace("\r\n", "\n").replace("\r", "\n")
    if "\n" in value:
        return "|-\n  " + "\n  ".join(value.split("\n"))
    if any(char in value for char in (":", "'", '"', "\\", "#")) or value.startswith((" ", "-", ">", "@")):
        return "'" + value.replace("'", "''") + "'"
    return value


def download_image(url: str, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        ["curl", "-s", "-L", "--max-time", "60", "-o", str(dest), url],
        capture_output=True,
        text=True,
        timeout=65,
    )
    return result.returncode == 0 and dest.exists() and dest.stat().st_size > 0


def convert_to_webp(src: Path) -> Path | None:
    result = subprocess.run(
        ["node", str(ROOT / "scripts/resize-media-photo.mjs"), str(src)],
        capture_output=True,
        text=True,
        timeout=120,
    )
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr)
    webp = src.with_suffix(".webp")
    return webp if webp.exists() else None


def write_markdown(
    stem: str,
    *,
    title: str,
    date: str,
    term: str,
    speakers: list[str],
    time: str | None,
    location: str | None,
    abstract: str | None,
    slides: str | None,
    cover_image: str | None,
    source_url: str,
    body: str,
) -> None:
    lines = [
        "---",
        f"title: {yaml_escape(title)}",
        f"date: {yaml_escape(date)}",
        f"term: {yaml_escape(term)}",
    ]
    if time:
        lines.append(f"time: {yaml_escape(time)}")
    if speakers:
        lines.append("speakers:")
        for speaker in speakers:
            lines.append(f"  - {yaml_escape(speaker)}")
    if location:
        lines.append(f"location: {yaml_escape(location)}")
    if abstract:
        lines.append(f"abstract: {yaml_escape(abstract)}")
    if slides:
        lines.append(f"slidesUrl: {yaml_escape(slides)}")
    if cover_image:
        lines.append(f"coverImage: {yaml_escape(cover_image)}")
    lines.append(f"sourceUrl: {yaml_escape(source_url)}")
    lines.append("---")
    if body.strip():
        lines.extend(["", body.strip(), ""])
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / f"{stem}.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def needs_refresh(path: Path) -> bool:
    return True


def main() -> None:
    slug_terms: dict[str, str] = {}
    for term_slug in TERM_PAGES:
        for slug in collect_term_slugs(term_slug):
            slug_terms.setdefault(slug, term_slug)
        time.sleep(1.2)

    written: list[str] = []
    errors: list[tuple[str, str]] = []

    for slug, term_slug in sorted(slug_terms.items()):
        source_url = f"{OLD_BASE}/seminars/{slug}"
        try:
            md = fetch_markdown(source_url)
        except urllib.error.URLError as exc:
            errors.append((slug, f"fetch failed: {exc}"))
            continue

        talks = parse_talk_sections(detail_body(md))
        if not talks:
            errors.append((slug, "no talk sections"))
            continue

        term = term_label(term_slug)
        for index, talk in enumerate(talks):
            stem = slug if len(talks) == 1 else f"{slug}-part-{index + 1}"
            if not talk.get("date"):
                errors.append((stem, "missing date"))
                continue
            if not needs_refresh(OUT / f"{stem}.md"):
                continue

            cover_image: str | None = None
            speakers = talk["speakers"]
            if len(speakers) > 1 and talk.get("cover"):
                raw = PUBLIC / f"{stem}.jpg"
                if download_image(talk["cover"], raw):
                    webp = convert_to_webp(raw)
                    if webp:
                        cover_image = f"/seminars/{webp.name}"
                    raw.unlink(missing_ok=True)

            write_markdown(
                stem,
                title=talk["title"],
                date=talk["date"],
                term=term,
                speakers=speakers,
                time=talk.get("time"),
                location=talk.get("location"),
                abstract=talk.get("abstract") or None,
                slides=talk.get("slides"),
                cover_image=cover_image,
                source_url=source_url,
                body=talk.get("bio") or "",
            )
            written.append(stem)
        time.sleep(1.2)

    print(f"Wrote {len(written)} seminar entries under {OUT}")
    if errors:
        print(f"Errors ({len(errors)}):")
        for slug, message in errors:
            print(f"  {slug}: {message}")


if __name__ == "__main__":
    main()
