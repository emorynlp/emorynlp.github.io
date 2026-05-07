import type { CollectionEntry } from 'astro:content';

export function normalizePersonKey(raw: string): string {
	return raw
		.trim()
		.toLowerCase()
		.replace(/\./g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Drop single-letter tokens between first and last (e.g. "jinho d choi" → "jinho choi"). */
function collapseMiddleInitialKeys(key: string): string {
	const parts = key.split(' ').filter(Boolean);
	if (parts.length <= 2) {
		return key;
	}
	const kept = parts.filter((p, i) => {
		if (i === 0 || i === parts.length - 1) {
			return true;
		}
		return p.length > 1;
	});
	return kept.join(' ');
}

function nameVariants(primary: string, aliases?: string[]): string[] {
	const set = new Set<string>();
	const add = (s: string) => {
		const k = normalizePersonKey(s);
		if (!k) return;
		set.add(k);
		set.add(collapseMiddleInitialKeys(k));
	};
	add(primary);
	for (const a of aliases ?? []) {
		add(a);
	}
	return [...set];
}

/**
 * Maps normalized author strings (plus collapsed-initial variants) to people IDs.
 */
export function buildPublicationAuthorSlugLookup(
	people: CollectionEntry<'people'>[],
): Map<string, string> {
	const map = new Map<string, string>();
	for (const p of people) {
		const slug = p.id;
		const pubAliases = [...(p.data.aliases ?? []), ...(p.data.publicationAuthorAliases ?? [])];
		for (const v of nameVariants(p.data.name, pubAliases)) {
			if (!map.has(v)) {
				map.set(v, slug);
			}
		}
	}
	return map;
}

/** Stable key for grouping author lines that match people lookup (`slugForPublicationAuthor`). */
export function publicationAuthorGroupKey(raw: string): string {
	const k = normalizePersonKey(raw);
	if (!k) return '';
	return collapseMiddleInitialKeys(k);
}

export function slugForPublicationAuthor(
	name: string,
	lookup: Map<string, string>,
): string | undefined {
	const k = normalizePersonKey(name);
	return lookup.get(k) ?? lookup.get(collapseMiddleInitialKeys(k));
}
