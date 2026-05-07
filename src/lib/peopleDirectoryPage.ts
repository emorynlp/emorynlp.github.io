import type { CollectionEntry } from 'astro:content';
import { comparePeopleDirectoryByEndThenName } from './peopleDirectory';

export const TIER_ORDER = [
	'faculty',
	'postdoc',
	'phd',
	'ms',
	'undergrad',
	'research_assistant',
	'visitor',
] as const;

export type PeopleTier = (typeof TIER_ORDER)[number];

export const CURRENT_TIER_HEADINGS: Record<PeopleTier, string> = {
	faculty: 'Faculty',
	postdoc: 'Postdoctoral Fellows',
	phd: 'PhD Students',
	ms: 'Master\'s Students',
	undergrad: 'Undergraduates',
	research_assistant: 'Research Assistants & Engineers',
	visitor: 'Visiting Scholars',
};

export const ALUMNI_TIER_HEADINGS: Record<PeopleTier, string> = {
	faculty: 'Faculty',
	postdoc: 'Postdoctoral Fellows',
	phd: 'PhD Alumni',
	ms: "Master\'s Alumni",
	undergrad: 'Undergraduate Alumni',
	research_assistant: 'Research Assistants & Engineers',
	visitor: 'Visiting Scholars',
};

export function tierOf(entry: CollectionEntry<'people'>): PeopleTier {
	return entry.data.peopleTier as PeopleTier;
}

export function sortInTier(a: CollectionEntry<'people'>, b: CollectionEntry<'people'>): number {
	return comparePeopleDirectoryByEndThenName({
		name: a.data.name,
		endTerm: a.data.endTerm,
		current: a.data.current,
		sortId: a.id,
	}, {
		name: b.data.name,
		endTerm: b.data.endTerm,
		current: b.data.current,
		sortId: b.id,
	});
}

export function bucketByTier(entries: CollectionEntry<'people'>[]): Map<PeopleTier, CollectionEntry<'people'>[]> {
	const map = new Map<PeopleTier, CollectionEntry<'people'>[]>(TIER_ORDER.map((t) => [t, []]));
	for (const p of entries) {
		const t = tierOf(p);
		let bucket = map.get(t);
		if (!bucket) {
			bucket = [];
			map.set(t, bucket);
		}
		bucket.push(p);
	}
	for (const t of map.keys()) {
		map.get(t)!.sort(sortInTier);
	}
	return map;
}

export function tierSectionId(kind: 'current' | 'alumni', tier: PeopleTier): string {
	return `${kind}-${tier}`;
}
