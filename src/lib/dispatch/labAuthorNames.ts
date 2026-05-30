import type { CollectionEntry } from 'astro:content';
import { normalizePersonKey } from '../publicationAuthorLinks';

/** Normalized author strings for current lab members (bold in Dispatch). */
export function buildLabAuthorKeySet(people: CollectionEntry<'people'>[]): Set<string> {
	const keys = new Set<string>();
	for (const p of people) {
		if (!p.data.current) continue;
		keys.add(normalizePersonKey(p.data.name));
		for (const a of p.data.aliases ?? []) {
			keys.add(normalizePersonKey(a));
		}
		for (const a of p.data.publicationAuthorAliases ?? []) {
			keys.add(normalizePersonKey(a));
		}
	}
	return keys;
}

export function isLabAuthorName(name: string, labKeys: Set<string>): boolean {
	return labKeys.has(normalizePersonKey(name));
}
