#!/usr/bin/env python3
"""
One-off: fetch legacy emorynlp.org publication pages and write
`src/content/publications/{year}-{venue}-{first_author}.md` entries.

Parses <h2>, <h4> authors, Abstract / Venue / Year / Links from the legacy HTML.
"""

from __future__ import annotations

import html as html_lib
import re
import ssl
import textwrap
import time
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src/content/publications"

URLS = """
https://www.emorynlp.org/publications/aacl-2020-li-et-al?c=2015-2020
https://www.emorynlp.org/publications/aaai-sap-2016-zhai-et-al?c=2015-2020
https://www.emorynlp.org/publications/aaai-sap-2020-jiang-et-al-1?c=2015-2020
https://www.emorynlp.org/publications/aaai-sap-2020-jiang-et-al?c=2015-2020
https://www.emorynlp.org/publications/acl-2015-choi-et-al?c=2015-2020
https://www.emorynlp.org/publications/acl-2020-li-and-choi?c=2015-2020
https://www.emorynlp.org/publications/acl-srw-2016-lee-et-al?c=2015-2020
https://www.emorynlp.org/publications/acl-srw-2017-ma-et-al?c=2015-2020
https://www.emorynlp.org/publications/affcon-2018-zahiri-and-choi?c=2015-2020
https://www.emorynlp.org/publications/alexa-prize-2020-finch-et-al?c=2015-2020
https://www.emorynlp.org/publications/arxiv-2016-jurczyk-and-choi?c=2015-2020
https://www.emorynlp.org/publications/arxiv-2018-jurczyk-et-al?c=2015-2020
https://www.emorynlp.org/publications/arxiv-2019-li-et-al?c=2015-2020
https://www.emorynlp.org/publications/bhi-2019-shin-et-al?c=2015-2020
https://www.emorynlp.org/publications/bionlp-2020-xu-et-al?c=2015-2020
https://www.emorynlp.org/publications/biorxiv-2017-chokshi-et-al?c=2015-2020
https://www.emorynlp.org/publications/blgnlp-2017-jurczyk-and-choi?c=2015-2020
https://www.emorynlp.org/publications/coling-2018-zhou-and-choi?c=2015-2020
https://www.emorynlp.org/publications/conll-2017-chen-et-al?c=2015-2020
https://www.emorynlp.org/publications/dmr-2019-choi-et-al?c=2015-2020
https://www.emorynlp.org/publications/emnlp-2020-li-et-al?c=2015-2020
https://www.emorynlp.org/publications/emnlp-2020-xu-and-choi?c=2015-2020
https://www.emorynlp.org/publications/figlang-st-2020-dong-et-al?c=2015-2020
https://www.emorynlp.org/publications/flairs-2020-he-and-choi?c=2015-2020
https://www.emorynlp.org/publications/ictai-2016-jurczyk-et-al?c=2015-2020
https://www.emorynlp.org/publications/ijcai-2019-shin-et-al?c=2015-2020
https://www.emorynlp.org/publications/ijcnn-2017-shin-et-al?c=2015-2020
https://www.emorynlp.org/publications/iui-2015-liu-et-al?c=2015-2020
https://www.emorynlp.org/publications/iwpt-2020-oh-et-al?c=2015-2020
https://www.emorynlp.org/publications/iwpt-st-2020-he-and-choi?c=2015-2020
https://www.emorynlp.org/publications/lrec-2018-chun-et-al?c=2015-2020
https://www.emorynlp.org/publications/naacl-2016-choi?c=2015-2020
https://www.emorynlp.org/publications/naacl-2018-ma-et-al?c=2015-2020
https://www.emorynlp.org/publications/naacl-srw-2015-jurczyk-and-choi?c=2015-2020
https://www.emorynlp.org/publications/naacl-srw-2015-nie-et-al?c=2015-2020
https://www.emorynlp.org/publications/semeval-2018-choi-and-chen?c=2015-2020
https://www.emorynlp.org/publications/semeval-2020-dong-and-choi?c=2015-2020
https://www.emorynlp.org/publications/sigdial-2016-chen-and-choi?c=2015-2020
https://www.emorynlp.org/publications/sigdial-2019-yang-and-choi?c=2015-2020
https://www.emorynlp.org/publications/sigdial-2020-finch-and-choi?c=2015-2020
https://www.emorynlp.org/publications/sigdial-demo-2020-finch-and-choi?c=2015-2020
https://www.emorynlp.org/publications/socinfo-2017-shaban-et-al?c=2015-2020
https://www.emorynlp.org/publications/tech-report-2018-lai-et-al?c=2015-2020
https://www.emorynlp.org/publications/tlt-2017-choi?c=2015-2020
https://www.emorynlp.org/publications/udw-2018-kanayama-et-al?c=2015-2020
https://www.emorynlp.org/publications/wassa-2017-shin-et-al?c=2015-2020
https://www.emorynlp.org/publications/wnut-2017-jang-et-al?c=2015-2020
https://www.emorynlp.org/publications/aaai-2022-xu-et-al?c=2021-2025
https://www.emorynlp.org/publications/aaai-demo-2023-he-et-al?c=2021-2025
https://www.emorynlp.org/publications/acl-2023-finch-et-al?c=2021-2025
https://www.emorynlp.org/publications/acl-2023-xu-et-al?c=2021-2025
https://www.emorynlp.org/publications/acl-2025-finch-et-al?c=2021-2025
https://www.emorynlp.org/publications/acl-findings-2025-byun-and-choi?c=2021-2025
https://www.emorynlp.org/publications/adbis-2021-zhang-et-al?c=2021-2025
https://www.emorynlp.org/publications/alexa-prize-2021-finch-et-al?c=2021-2025
https://www.emorynlp.org/publications/arxiv-2021-choi-and-williamson?c=2021-2025
https://www.emorynlp.org/publications/arxiv-2021-he-et-al?c=2021-2025
https://www.emorynlp.org/publications/arxiv-2022-feng-et-al?c=2021-2025
https://www.emorynlp.org/publications/arxiv-2022-mehri-et-al?c=2021-2025
https://www.emorynlp.org/publications/bea-2025-han-and-choi?c=2021-2025
https://www.emorynlp.org/publications/cikm-2025-choi-et-al?c=2021-2025
https://www.emorynlp.org/publications/cmcl-2021-guo-and-choi?c=2021-2025
https://www.emorynlp.org/publications/coling-2022-huryn-et-al?c=2021-2025
https://www.emorynlp.org/publications/coling-2025-finch-and-choi?c=2021-2025
https://www.emorynlp.org/publications/coling-lrec-2024-finch-et-al?c=2021-2025
https://www.emorynlp.org/publications/cpdr-2021-min-et-al?c=2021-2025
https://www.emorynlp.org/publications/crac-2021-han-et-al?c=2021-2025
https://www.emorynlp.org/publications/crac-st-2021-xu-and-choi?c=2021-2025
https://www.emorynlp.org/publications/cjo-2023-lyons-et-al?c=2021-2025
https://www.emorynlp.org/publications/dadm-2023-hajjar-et-al?c=2021-2025
https://www.emorynlp.org/publications/emnlp-2021-he-and-choi?c=2021-2025
https://www.emorynlp.org/publications/emnlp-2021-xu-et-al?c=2021-2025
https://www.emorynlp.org/publications/emnlp-2023-shin-et-al?c=2021-2025
https://www.emorynlp.org/publications/emnlp-2025-hong-et-al?c=2021-2025
https://www.emorynlp.org/publications/emnlp-demo-2021-zhao-et-al?c=2021-2025
https://www.emorynlp.org/publications/emnlp-findings-2024-finch-et-al?c=2021-2025
https://www.emorynlp.org/publications/emnlp-findings-2024-xu-et-al?c=2021-2025
https://www.emorynlp.org/publications/emnlp-industry-track-2024-choi-et-al?c=2021-2025
https://www.emorynlp.org/publications/emnlp-industry-track-2024-kwon-et-al?c=2021-2025
https://www.emorynlp.org/publications/flairs-2021-lu-and-choi?c=2021-2025
https://www.emorynlp.org/publications/future-internet-2025-ascoli-et-al-copy?c=2021-2025
https://www.emorynlp.org/publications/future-internet-2025-ascoli-et-al?c=2021-2025
https://www.emorynlp.org/publications/healthcare-informatics-research-2025-seo-et-al?c=2021-2025
https://www.emorynlp.org/publications/icassp-2022-xu-et-al?c=2021-2025
https://www.emorynlp.org/publications/ictai-2023-gong-et-al?c=2021-2025
https://www.emorynlp.org/publications/information-2023-wang-et-al?c=2021-2025
https://www.emorynlp.org/publications/information-2023-williamson-et-al?c=2021-2025
https://www.emorynlp.org/publications/information-2024-paek-et-al?c=2021-2025
https://www.emorynlp.org/publications/information-2024-yu-et-al?c=2021-2025
https://www.emorynlp.org/publications/information-2025-byun-et-al?c=2021-2025
https://www.emorynlp.org/publications/iwsds-2023-wang-et-al?c=2021-2025
https://www.emorynlp.org/publications/iwpt-2021-he-and-choi?c=2021-2025
https://www.emorynlp.org/publications/kir-2023-arenson-et-al?c=2021-2025
https://www.emorynlp.org/publications/law-2022-cao-et-al?c=2021-2025
https://www.emorynlp.org/publications/law-2022-ji-et-al?c=2021-2025
https://www.emorynlp.org/publications/law-dmr-2021-williamson-et-al?c=2021-2025
https://www.emorynlp.org/publications/louhi-2022-tu-et-al?c=2021-2025
https://www.emorynlp.org/publications/mrl-2021-kim-et-al?c=2021-2025
https://www.emorynlp.org/publications/naacl-2022-xu-et-al?c=2021-2025
https://www.emorynlp.org/publications/nejlt-2023-dhole-et-al?c=2021-2025
https://www.emorynlp.org/publications/nlp4convai-2021-finch-et-al?c=2021-2025
https://www.emorynlp.org/publications/sem-2022-xu-et-al?c=2021-2025
https://www.emorynlp.org/publications/sigdial-2023-finch-et-al?c=2021-2025
https://www.emorynlp.org/publications/sigdial-2024-finch-et-al?c=2021-2025
https://www.emorynlp.org/publications/sigdial-2024-tu-et-al?c=2021-2025
https://www.emorynlp.org/publications/smm4h-2021-karisani-et-al?c=2021-2025
https://www.emorynlp.org/publications/tacl-2023-he-and-choi?c=2021-2025
https://www.emorynlp.org/publications/tacl-2024-finch-and-choi?c=2021-2025
""".strip().splitlines()

SKIP_PREFIXES = ("2026-",)  # keep manually curated newer entries

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "EmoryNLP-site-import/1.0"})
    with urllib.request.urlopen(req, context=SSL_CTX, timeout=45) as r:
        return r.read().decode("utf-8", "replace")


def strip_tags(s: str) -> str:
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    return html_lib.unescape(s)


def parse_editor_block(html: str) -> str | None:
    m = re.search(r'<div class="s123-editor">(.*?)</div>\s*</div>\s*</div>\s*</div>\s*</div>', html, re.S)
    if not m:
        m = re.search(r'<div class="s123-editor">(.*?)</div>\s*</div>', html, re.S)
    return m.group(1) if m else None


def parse_h2_h4(editor: str) -> tuple[str | None, str | None]:
    h2 = re.search(r"<h2>([^<]*)</h2>", editor)
    h4 = re.search(r"<h4>(.*?)</h4>", editor, re.S)
    return (h2.group(1).strip() if h2 else None, h4.group(1) if h4 else None)


def authors_from_h4(h4: str) -> list[str]:
    chunks = re.split(r"\s*,\s*", h4)
    out: list[str] = []
    for ch in chunks:
        m = re.search(r"<a[^>]*>([^<]*)</a>", ch)
        if m:
            name = m.group(1).strip()
            if name:
                out.append(name)
            continue
        t = strip_tags(ch).strip()
        if t:
            out.append(t)
    return out


def parse_section_paragraph(editor: str, heading: str) -> str | None:
    m = re.search(rf"<h3>{re.escape(heading)}</h3>\s*<p>(.*?)</p>", editor, re.S)
    if not m:
        return None
    return m.group(1)


def venue_url_from_p(p_html: str) -> tuple[str | None, str]:
    """First external http(s) link href + plain venue line."""
    m = re.search(r'href="(https?://[^"]+)"', p_html)
    href = m.group(1) if m else None
    line = " ".join(strip_tags(p_html).split())
    return href, line


def parse_links_p(p_html: str) -> list[tuple[str, str]]:
    pairs: list[tuple[str, str]] = []
    for m in re.finditer(r'<a\s+href="([^"]+)"[^>]*>([^<]+)</a>', p_html):
        pairs.append((m.group(1).strip(), m.group(2).strip()))
    return pairs


def normalize_abstract(ab_html: str) -> str:
    t = strip_tags(ab_html)
    t = re.sub(r"(\w)-\s+(\w)", r"\1\2", t)
    return " ".join(t.split()).strip()


def slug_parts_from_legacy_url(url: str) -> tuple[str, int, str, str]:
    """
    Returns (legacy_slug, year, venue_slug, first_author_slug).
    """
    path = urlparse(url).path.rstrip("/")
    legacy_slug = path.rsplit("/", 1)[-1]
    parts = legacy_slug.split("-")
    year_idx = next((i for i, p in enumerate(parts) if re.fullmatch(r"\d{4}", p)), None)
    if year_idx is None:
        raise ValueError(f"No year in slug: {legacy_slug}")
    year = int(parts[year_idx])
    venue_slug = "-".join(parts[:year_idx])
    tail = parts[year_idx + 1 :]
    if not tail:
        raise ValueError(f"No author tail: {legacy_slug}")
    first = tail[0]
    # disambiguate duplicate future-internet ascoli CMS copy
    if legacy_slug.endswith("-copy"):
        first = f"{first}-copy"
    # e.g. aaai-sap-2020-jiang-et-al-1 shares first author token with sibling URL
    if len(tail) >= 4 and tail[-1] == "1" and tail[-2] == "al" and tail[-3] == "et":
        first = f"{tail[0]}-1"
    return legacy_slug, year, venue_slug, first


def abs_url(href: str) -> str | None:
    href = href.strip()
    if href.startswith("http://") or href.startswith("https://"):
        return href
    if href.startswith("/"):
        return "https://www.emorynlp.org" + href
    return None


def pick_paper_url(links: list[tuple[str, str]]) -> str | None:
    """Prefer Anthology landing (non-PDF); else Paper if URL; else DOI."""
    by_label = {lab.lower(): href for href, lab in links}
    if "anthology" in by_label:
        u = by_label["anthology"]
        if u.endswith(".pdf"):
            u = u[:-4]
        return u
    if "paper" in by_label:
        u = by_label["paper"]
        if "aclanthology.org" in u and u.endswith(".pdf"):
            return u[:-4]
        return u
    if "doi" in by_label:
        return abs_url(by_label["doi"]) or by_label["doi"]
    return None


def pick_resource_url(links: list[tuple[str, str]]) -> str | None:
    for href, lab in links:
        l = lab.lower()
        if "github" in l or "github.com" in href:
            return abs_url(href) or href
    for href, lab in links:
        if "huggingface" in href.lower() or "hf.co" in href:
            return href
    return None


def pick_link_by_label(links: list[tuple[str, str]], label: str) -> str | None:
    want = label.strip().lower()
    for href, lab in links:
        if lab.strip().lower() == want:
            u = abs_url(href) or href
            return u if u.startswith("http://") or u.startswith("https://") else None
    return None


def extra_material_markdown(links: list[tuple[str, str]]) -> str:
    """Links not shown in the detail page link row (Poster/Slides use frontmatter)."""
    lines: list[str] = []
    skip_exact = {"anthology", "paper", "github", "bibtex", "poster", "slides"}
    for href, lab in links:
        l = lab.strip().lower()
        if l in skip_exact:
            continue
        h = abs_url(href) or href
        if href.startswith("/") and "bibtex" in l:
            h = "https://www.emorynlp.org" + href
        if l in ("slide",):
            continue
        if any(k in l for k in ("video", "dataset", "data", "demo", "website", "project")):
            lines.append(f"- [{lab}]({h})")
        elif href.startswith("/") and "bibtex" in l:
            lines.append(f"- [{lab}]({h})")
    return "\n".join(lines)


def infer_publication_type(venue_line: str, paper_url: str | None) -> str:
    v = venue_line.lower()
    u = (paper_url or "").lower()
    if "arxiv" in v or "biorxiv" in v or "arxiv" in u or "biorxiv" in u:
        return "preprint"
    if "workshop" in v or re.search(r"\b(wassa|wnut|bea|smm4h|nlp4convai|semeval|figlang|iwpt|law|cmcl|crac|nlp4convai|affcon|blgnlp|socinfo)\b", v):
        return "workshop"
    if "transactions" in v or re.search(
        r"\b(journal of|information:|information,|tacl|jamia|future internet|healthcare informatics|patterns|ieee)\b",
        v,
    ):
        return "journal"
    if "tech report" in v or "technical report" in v:
        return "other"
    return "conference"


def yaml_escape(s: str) -> str:
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    if "\n" in s:
        return ">- \n  " + "\n  ".join(s.split("\n"))
    if any(c in s for c in (":", "'", '"', "\\", "#")) or s.startswith((" ", "-", ">", "@")):
        return "'" + s.replace("'", "''") + "'"
    return s


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    written: list[str] = []
    errors: list[tuple[str, str]] = []

    for url in URLS:
        url = url.strip()
        if not url:
            continue
        try:
            legacy_slug, year, venue_slug, first_slug = slug_parts_from_legacy_url(url)
            stem = f"{year}-{venue_slug}-{first_slug}"
            if any(stem.startswith(p) for p in SKIP_PREFIXES):
                continue
            dest = OUT / f"{stem}.md"
            if dest.exists():
                # allow overwrite for this import
                pass

            raw = fetch(url)
            time.sleep(0.35)
            editor = parse_editor_block(raw)
            if not editor:
                raise RuntimeError("no s123-editor block")

            title, h4 = parse_h2_h4(editor)
            if not title:
                raise RuntimeError("no title h2")
            authors = authors_from_h4(h4 or "") if h4 else []

            ab_html = parse_section_paragraph(editor, "Abstract") or ""
            abstract = normalize_abstract(ab_html) if ab_html else ""

            venue_p = parse_section_paragraph(editor, "Venue / Year") or ""
            venue_url, venue_line = venue_url_from_p(venue_p)
            venue_text = strip_tags(re.sub(r"\s*/\s*\d{4}\s*$", "", venue_line)).strip()
            if not venue_text:
                venue_text = strip_tags(venue_line).strip() or "Publication venue"

            links_p = parse_section_paragraph(editor, "Links") or ""
            links = parse_links_p(links_p)
            paper_url = pick_paper_url(links)
            resource_url = pick_resource_url(links)
            poster_url = pick_link_by_label(links, "Poster")
            slides_url = pick_link_by_label(links, "Slides")
            extra_md = extra_material_markdown(links)
            pub_type = infer_publication_type(venue_line + " " + (venue_text or ""), paper_url)

            fm: list[str] = [
                "---",
                f"title: {yaml_escape(title)}",
                "authors:",
            ]
            for a in authors:
                fm.append(f"  - {yaml_escape(a)}")
            fm.append(f"venue: {yaml_escape(venue_text or venue_line)}")
            fm.append(f"year: {year}")
            if pub_type:
                fm.append(f"publicationType: {pub_type}")
            if venue_url:
                fm.append(f"venueUrl: '{venue_url}'")
            if paper_url:
                fm.append(f"paperUrl: '{paper_url}'")
            if resource_url:
                fm.append(f"resourceUrl: '{resource_url}'")
            if poster_url:
                fm.append(f"posterUrl: '{poster_url}'")
            if slides_url:
                fm.append(f"slidesUrl: '{slides_url}'")
            if abstract:
                wrapped = textwrap.fill(abstract, width=92, break_long_words=False, replace_whitespace=False)
                fm.append("abstract: >-\n  " + "\n  ".join(wrapped.splitlines()))
            fm.append("---")
            body = ""
            if extra_md:
                body = "\n## Additional materials\n\n" + extra_md + "\n"
            dest.write_text("\n".join(fm) + "\n" + body, encoding="utf-8")
            written.append(str(dest.relative_to(ROOT)))
        except Exception as e:  # noqa: BLE001
            errors.append((url, f"{type(e).__name__}: {e}"))

    print("written", len(written))
    for w in sorted(written)[:15]:
        print(" ", w)
    if len(written) > 15:
        print(" ...")
    if errors:
        print("ERRORS", len(errors))
        for u, msg in errors:
            print(u, msg)


if __name__ == "__main__":
    main()
