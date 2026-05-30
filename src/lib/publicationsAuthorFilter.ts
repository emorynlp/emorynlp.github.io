import type { CollectionEntry } from 'astro:content';
import { slugForPublicationAuthor } from './publicationAuthorLinks';
import type { SidebarAuthorRow } from './publicationsPageSidebar';

export type MemberAuthorFilterOption = {
	slug: string;
	name: string;
	count: number;
	photoHref?: string;
};

/** Last token, lowercased — used for directory-style sort. */
export function lastNameSortKey(displayName: string): string {
	const parts = displayName.trim().split(/\s+/).filter(Boolean);
	return (parts[parts.length - 1] ?? '').toLowerCase();
}

/** People slugs on this paper that appear in the lab roster (matched author strings). */
export function memberSlugsOnPublicationPaper(
	paper: CollectionEntry<'papers'>,
	authorSlugLookup: Map<string, string>,
): string[] {
	const set = new Set<string>();
	for (const raw of paper.data.authors) {
		const s = slugForPublicationAuthor(raw, authorSlugLookup);
		if (s) set.add(s);
	}
	return [...set];
}

/**
 * Authors who appear on at least one publication and resolve to a people profile,
 * sorted by last name then full name.
 */
export function buildMemberAuthorFilterOptions(
	sidebarAuthors: SidebarAuthorRow[],
	people: CollectionEntry<'people'>[],
): MemberAuthorFilterOption[] {
	const bySlug = new Map(people.map((p) => [p.id, p]));
	const rows: MemberAuthorFilterOption[] = [];
	for (const a of sidebarAuthors) {
		if (!a.slug) continue;
		const person = bySlug.get(a.slug);
		const name = person?.data.name ?? a.displayName;
		rows.push({
			slug: a.slug,
			name,
			count: a.count,
			photoHref: a.photoHref,
		});
	}
	rows.sort(
		(x, y) =>
			lastNameSortKey(x.name).localeCompare(lastNameSortKey(y.name)) || x.name.localeCompare(y.name),
	);
	return rows;
}
