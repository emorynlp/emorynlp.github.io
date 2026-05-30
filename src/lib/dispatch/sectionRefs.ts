import type { CollectionEntry } from 'astro:content';

export type DispatchPublicationRef = CollectionEntry<'dispatch'>['data']['papers'][number];
export type DispatchThesisRef = NonNullable<CollectionEntry<'dispatch'>['data']['theses']>[number];

export type NormalizedPublicationRef = {
	slug: string;
	featured: boolean;
	blurb?: string;
};

export type NormalizedThesisRef = {
	slug: string;
	featured: boolean;
	blurb?: string;
};

export function normalizePublicationRef(raw: DispatchPublicationRef): NormalizedPublicationRef {
	if (typeof raw === 'string') {
		return { slug: raw, featured: false };
	}
	return {
		slug: raw.publication,
		featured: raw.featured === true,
		blurb: raw.blurb,
	};
}

export function normalizeThesisRef(raw: DispatchThesisRef): NormalizedThesisRef {
	if (typeof raw === 'string') {
		return { slug: raw, featured: false };
	}
	return {
		slug: raw.thesis,
		featured: raw.featured === true,
		blurb: raw.blurb,
	};
}

function assertAtMostOneFeatured<T extends { featured: boolean }>(
	section: string,
	items: T[],
	issueId: string,
	label: (item: T) => string,
): T | undefined {
	const featured = items.filter((item) => item.featured);
	if (featured.length > 1) {
		const labels = featured.map(label).join(', ');
		throw new Error(
			`[dispatch:${issueId}] at most one featured item in ${section} (found: ${labels})`,
		);
	}
	return featured[0];
}

export function findFeaturedPublicationRef(
	d: CollectionEntry<'dispatch'>['data'],
	issueId: string,
): NormalizedPublicationRef | undefined {
	return assertAtMostOneFeatured(
		'papers',
		d.papers.map(normalizePublicationRef),
		issueId,
		(ref) => ref.slug,
	);
}

export function findFeaturedActivityRow(
	d: CollectionEntry<'dispatch'>['data'],
	issueId: string,
): CollectionEntry<'dispatch'>['data']['activityNews'][number] | undefined {
	const row = assertAtMostOneFeatured('activityNews', d.activityNews, issueId, (item) => item.text);
	if (row?.featured === true && !row.highlight) {
		throw new Error(
			`[dispatch:${issueId}] activityNews featured item must include highlight slug`,
		);
	}
	return row;
}

export type DispatchDistinctionItem = NonNullable<
	CollectionEntry<'dispatch'>['data']['distinctions']
>[number];

export function findFeaturedDistinctionRow(
	d: CollectionEntry<'dispatch'>['data'],
	issueId: string,
): DispatchDistinctionItem | undefined {
	const items = d.distinctions ?? [];
	if (items.length === 0) return undefined;
	const row = assertAtMostOneFeatured('distinctions', items, issueId, (item) => item.text);
	if (row?.featured === true && !row.highlight) {
		throw new Error(
			`[dispatch:${issueId}] distinctions featured item must include highlight slug`,
		);
	}
	return row;
}

export type FeaturedSource =
	| { section: 'papers'; slug: string; blurb?: string }
	| { section: 'activityNews'; slug: string; blurb?: string }
	| { section: 'distinctions'; slug: string; blurb?: string }
	| { section: 'theses'; slug: string; blurb?: string };

export function findFeaturedThesisRef(
	d: CollectionEntry<'dispatch'>['data'],
	issueId: string,
): NormalizedThesisRef | undefined {
	const refs = d.theses ?? [];
	if (refs.length === 0) return undefined;
	return assertAtMostOneFeatured('theses', refs.map(normalizeThesisRef), issueId, (ref) => ref.slug);
}
