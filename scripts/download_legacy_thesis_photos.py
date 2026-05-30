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
	"honors-thesis-2026-natalie-hu": "2026-honors-yutong-hu",
	"honors-thesis-2025-molly-han": "2025-honors-junzhi-han",
	"honors-thesis-2024-zinc-zhao": "2024-honors-boxin-zhao",
	"honors-thesis-2017-henry-y-chen": "2017-honors-henry-chen",
	# Legacy URL uses “calviño”; local slug is ASCII
	"honors-thesis-2023-camila-calviño": "2023-honors-camila-calvino",
}

URLS_TEXT = """
https://www.emorynlp.org/theses-dissertations/2026-ms-chunyao-zhao?c=2026-2030
https://www.emorynlp.org/theses-dissertations/2026-honors-noah-reicin?c=2026-2030
https://www.emorynlp.org/theses-dissertations/honors-thesis-2026-natalie-hu?c=2026-2030
https://www.emorynlp.org/theses-dissertations/2026-honors-henry-gao?c=2026-2030
https://www.emorynlp.org/theses-dissertations/2025-ms-mutian-li?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2025-honors-michelle-kim?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2025-molly-han?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2025-honors-tung-dinh?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2025-honors-andrew-chung?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2024-ms-catherine-baker?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2024-phd-james-finch?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2024-phd-sarah-finch?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2024-honors-jacob-choi?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2024-honors-ellie-paek?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2024-honors-peilin-wu?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2024-zinc-zhao?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2023-phd-han-he?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2023-phd-liyan-xu?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2023-phd-zihao-wang?c=2021-2025
https://www.emorynlp.org/theses-dissertations/honors-thesis-2023-camila-calvi%C3%B1o?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2023-honors-chen-gong?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2023-honors-alexandru-rudi?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2022-honors-angela-cao?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2022-honors-yingying-chen?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2022-honors-xiaoyuan-huang?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2022-honors-william-hutsell?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2022-honors-daniil-huryn?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2022-honors-yuxin-ji?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2021-ms-xiangjue-dong?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2021-honors-lydia-feng?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2021-honors-ran-xu?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2021-honors-xinman-zhang?c=2021-2025
https://www.emorynlp.org/theses-dissertations/2020-honors-chenxi-xu?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2020-ms-zhexiong-liu?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2020-ms-changmao-li?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2020-honors-haoqi-gu?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2020-honors-chloe-lee?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2020-honors-renxuan-li?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2020-honors-ruixiang-qi?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2019-honors-jose-coves?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2019-honors-shen-gao?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2019-honors-xinyi-jiang?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2019-honors-mengmei-li?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2019-honors-zhengzhe-yang?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2018-honors-kaixin-ma?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2018-honors-jayeol-chun?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2018-honors-lindsay-hexter?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2018-honors-hang-jiang?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2018-honors-ethan-zhou?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2017-honors-tarrek-shaban?c=2015-2020
https://www.emorynlp.org/theses-dissertations/honors-thesis-2017-henry-y-chen?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2017-phd-tomasz-jurczyk?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2016-honors-meera-hahn?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2016-honors-reid-kilgore?c=2015-2020
https://www.emorynlp.org/theses-dissertations/2015-honors-austin-blodgett?c=2015-2020
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
