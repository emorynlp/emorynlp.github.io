/**
 * Prefix a root-relative path with `import.meta.env.BASE_URL` so links and public
 * asset URLs resolve when Astro `base` is not `/` (e.g. GitHub Pages project sites).
 */
export function siteHref(path: string): string {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	const raw = import.meta.env.BASE_URL;
	if (!raw || raw === '/') return normalized;
	const base = raw.endsWith('/') ? raw.slice(0, -1) : raw;
	return `${base}${normalized}`;
}

/** Paths under `public/` (often start with `/`). Pass-through for `https:` etc. */
export function publicAssetUrl(path: string): string {
	if (path.startsWith('/')) return siteHref(path);
	return path;
}
