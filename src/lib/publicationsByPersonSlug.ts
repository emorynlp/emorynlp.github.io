import type { CollectionEntry } from 'astro:content';
import { slugForPublicationAuthor } from './publicationAuthorLinks';
import { publicationSortInstant } from './publicationListing';

/**
 * Publications on which this person appears as an author (matched via `buildPublicationAuthorSlugLookup`),
 * newest first (same sort as `/papers/`).
 */
export function publicationsForPersonSlug(
	publications: CollectionEntry<'papers'>[],
	personSlug: string,
	authorSlugLookup: Map<string, string>,
): CollectionEntry<'papers'>[] {
	const matched = publications.filter((p) =>
		p.data.authors.some((a) => slugForPublicationAuthor(a, authorSlugLookup) === personSlug),
	);
	matched.sort((a, b) => {
		const ta = publicationSortInstant(a.data);
		const tb = publicationSortInstant(b.data);
		const cmp = tb - ta;
		return cmp !== 0 ? cmp : a.data.title.localeCompare(b.data.title);
	});
	return matched;
}
