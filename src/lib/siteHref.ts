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

/** Absolute URL for Open Graph / Twitter cards (crawlers require `https://…`). */
export function absoluteSiteUrl(path: string, site: string | URL): string {
	return new URL(siteHref(path), site).href;
}

/**
 * `http(s)` URLs for this site’s GitHub Pages host (and localhost for dev).
 * Legacy `emorynlp.org` is excluded — do not treat it as first-party for auto-linking.
 */
export function isLabSiteHttpUrl(href: string): boolean {
	try {
		const u = new URL(href);
		if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
		const host = u.hostname.toLowerCase();
		if (host === 'localhost' || host === '127.0.0.1') return true;
		return host === 'emorynlp.github.io' || host === 'emorynlp.org';
	} catch {
		return false;
	}
}
