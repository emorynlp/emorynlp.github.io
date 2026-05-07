/** Split headings like "Discussion: … Conclusions: …" that were fused on one line. */
const STRUCTURED_SPLIT = new RegExp(
	[
		'(?=', // lookahead only (split keeps delimiters attached to following chunk)
		'(?:Materials\\s+and\\s+Methods|Results|Discussion|Conclusions)',
		'\\s*',
		'[:.]',
		'(?:\\s+|$)',
		')',
	].join(''),
	'gi',
);

/**
 * Split frontmatter `abstract` into paragraphs for `<p>` blocks.
 * Respects YAML literal blocks (`|`) via blank-line breaks; falls back to IMRaD-style
 * headings when YAML folding (`>`) yields a single run-on paragraph.
 */
export function publicationAbstractParagraphs(raw: string | undefined): string[] {
	const t = raw?.trim().replace(/\r\n/g, '\n');
	if (!t) return [];

	const byBlank = t
		.split(/\n{2,}/)
		.map((b) => b.trim())
		.filter(Boolean);

	if (byBlank.length > 1) return byBlank;

	const slab = byBlank[0];
	if (!slab) return [];

	const subdivided = slab
		.split(STRUCTURED_SPLIT)
		.map((b) => b.trim())
		.filter(Boolean);
	return subdivided.length > 1 ? subdivided : byBlank;
}
