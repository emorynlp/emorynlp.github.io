#!/usr/bin/env python3
"""
Fetch thesis hero/thumbnail images from legacy emorynlp.org thesis pages and
write `public/theses/{local-slug}.webp`.

URLs: same list as Untitled-2 (honors/ms/phd dissertation pages).

Renamed local slugs (after site migration) are mapped from legacy path segments.
"""

from __future__ import annotations

import io
import re
import ssl
import tempfile
import time
import urllib.request
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "theses"

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

# Legacy /theses-dissertations/{slug} path segment → `public/theses/{slug}.webp`
LEGACY_SLUG_TO_LOCAL: dict[str, str] = {
	"honors-thesis-2026-natalie-hu": "honors-thesis-2026-yutong-hu",
	"honors-thesis-2025-molly-han": "honors-thesis-2025-junzhi-han",
	"honors-thesis-2024-zinc-zhao": "honors-thesis-2024-boxin-zhao",
	"honors-thesis-2017-henry-y-chen": "honors-thesis-2017-henry-chen",
	# Legacy URL uses “calviño”; local slug is ASCII
	"honors-thesis-2023-camila-calviño": "honors-thesis-2023-camila-calvino",
}

URLS_TEXT = """
https://www.emorynlp.org/theses-dissertations/ms-thesis-2026-chunyao-zhao?c=2026-2030
https://www.emorynlp.org/theses-dissertations/honors-thesis-2026-noah-reicin?c=2026-2030
https://www.emorynlp.org/theses-dissertations/honors-thesis-2026-natalie-hu?c=2026-2030
https://www.emorynlp.org/theses-dissertations/honors-thesis-2026-henry-gao?c=2026-2030
https://www.emorynlp.org/theses-dissertations/ms-thesis-2025-mutian-li?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2025-michelle-kim?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2025-molly-han?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2025-tung-dinh?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2025-andrew-chung?c=2021-2025
https://www.emorynlp.org/theses-dissertations/ms-thesis-2024-catherine-baker?c=2021-2025
https://www.emorynlp.org/theses-dissertations/phd-dissertation-2024-james-finch?c=2021-2025
https://www.emorynlp.org/theses-dissertations/phd-dissertation-2024-sarah-finch?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2024-jacob-choi?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2024-ellie-paek?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2024-peilin-wu?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2024-zinc-zhao?c=2021-2025
https://www.emorynlp.org/theses-dissertations/phd-dissertation-2023-han-he?c=2021-2025
https://www.emorynlp.org/theses-dissertations/phd-dissertation-2023-liyan-xu?c=2021-2025
https://www.emorynlp.org/theses-dissertations/phd-dissertation-2023-zihao-wang?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2023-camila-calvi%C3%B1o?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2023-chen-gong?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2023-alexandru-rudi?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2022-angela-cao?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2022-yingying-chen?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2022-xiaoyuan-huang?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2022-william-hutsell?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2022-daniil-huryn?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2022-yuxin-ji?c=2021-2025
https://www.emorynlp.org/theses-dissertations/ms-thesis-2021-xiangjue-dong?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2021-lydia-feng?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2021-ran-xu?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2021-xinman-zhang?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2020-chenxi-xu?c=2015-2020
https://www.emorynlp.org/theses-dissertations/ms-thesis-2020-zhexiong-liu?c=2015-2020
https://www.emorynlp.org/theses-dissertations/ms-thesis-2020-changmao-li?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2020-haoqi-gu?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2020-chloe-lee?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2020-renxuan-li?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2020-ruixiang-qi?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2019-jose-coves?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2019-shen-gao?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2019-xinyi-jiang?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2019-mengmei-li?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2019-zhengzhe-yang?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2018-kaixin-ma?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2018-jayeol-chun?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2018-lindsay-hexter?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2018-hang-jiang?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2018-ethan-zhou?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2017-tarrek-shaban?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2017-henry-y-chen?c=2015-2020
https://www.emorynlp.org/theses-dissertations/phd-dissertation-2017-tomasz-jurczyk?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2016-meera-hahn?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2016-reid-kilgore?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2015-austin-blodgett?c=2015-2020
""".strip()


def fetch(url: str) -> bytes:
	req = urllib.request.Request(url, headers={"User-Agent": "EmoryNLP-thesis-photo-import/1.0"})
	with urllib.request.urlopen(req, context=SSL_CTX, timeout=60) as r:
		return r.read()


def fetch_text(url: str) -> str:
	return fetch(url).decode("utf-8", "replace")


def legacy_slug_from_url(url: str) -> str:
	path = urlparse(url).path.rstrip("/")
	seg = unquote(path.split("/")[-1])
	return seg


def pick_thesis_photo_url(html: str) -> str | None:
	found: list[str] = []
	for m in re.finditer(r'(https://(?:files|images)\.cdn-files-a\.com/uploads/4165719/[^"\'\s<>]+)', html):
		u = m.group(1).split("&")[0].split("?")[0]
		if "filter_nobg" in u or "ready_uploads/svg" in u:
			continue
		found.append(u)
	dedup: list[str] = []
	seen = set()
	for u in found:
		if u not in seen:
			seen.add(u)
			dedup.append(u)
	for u in dedup:
		if "/normal_" in u.lower():
			return u
	best = None
	best_w = -1
	for u in dedup:
		mm = re.search(r"/(\d+)_[a-f0-9]+\.(jpg|jpeg|png|webp)$", u, re.I)
		if mm:
			w = int(mm.group(1))
			if mm.group(2).lower() in ("jpg", "jpeg", "png", "webp") and w > best_w:
				best_w = w
				best = u
	return best


def to_webp(data: bytes, dest: Path) -> None:
	from PIL import Image

	im = Image.open(io.BytesIO(data))
	rgb = im.convert("RGBA") if im.mode in ("RGBA", "P") else im.convert("RGB")
	tmp = rgb if rgb.mode == "RGB" else Image.new("RGB", rgb.size, (255, 255, 255))
	if rgb.mode == "RGBA":
		tmp.paste(rgb, mask=rgb.split()[3])
	else:
		tmp = rgb
	tmp.save(dest, "WEBP", quality=88, method=6)


def local_stem_from_legacy(legacy_slug: str) -> str:
	return LEGACY_SLUG_TO_LOCAL.get(legacy_slug, legacy_slug)


def main() -> None:
	OUT_DIR.mkdir(parents=True, exist_ok=True)
	ok = 0
	errs: list[tuple[str, str]] = []
	for raw in URLS_TEXT.splitlines():
		url = raw.strip()
		if not url:
			continue
		legacy = legacy_slug_from_url(url)
		stem = local_stem_from_legacy(legacy)
		dest = OUT_DIR / f"{stem}.webp"
		try:
			html = fetch_text(url)
			time.sleep(0.35)
			img_url = pick_thesis_photo_url(html)
			if not img_url:
				errs.append((url, "no image URL matched"))
				continue
			img_bytes = fetch(img_url)
			time.sleep(0.35)
			to_webp(img_bytes, dest)
			print("OK", stem, "<-", img_url)
			ok += 1
		except Exception as e:
			errs.append((url, str(e)))

	print(f"\ndone: {ok} written to {OUT_DIR.relative_to(ROOT)}")
	for u, msg in errs:
		print(f"ERR {msg} :: {u}")


if __name__ == "__main__":
	main()
