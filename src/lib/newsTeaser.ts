/**
 * Plain-text teaser derived from Markdown body — strips common syntax and truncates.
 * Used by news listings and home news strip cards.
 */
export function teaserFromNewsBody(body: string | undefined, maxLen = 220): string {
	if (!body?.trim()) return '';

	let raw = body
		.replace(/\*\*|`|__/g, '')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

	raw = raw
		.trim()
		.replace(/\s+/g, ' ');

	if (!raw.length) return '';
	return raw.length > maxLen ? `${raw.slice(0, Math.max(0, maxLen - 1)).trim()}…` : raw;
}
