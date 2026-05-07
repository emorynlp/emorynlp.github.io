import type { CollectionEntry } from 'astro:content';

import { slugForPublicationAuthor } from './publicationAuthorLinks';
import { compareThesesListingOrder } from './thesisYear';

/**
 * Thesis entries whose `author` resolves to `personSlug` via the same lookup as publications/theses listings.
 */
export function thesesForPersonSlug(
	theses: CollectionEntry<'theses'>[],
	personSlug: string,
	authorSlugLookup: Map<string, string>,
): CollectionEntry<'theses'>[] {
	const matched = theses.filter(
		(t) => slugForPublicationAuthor(t.data.author, authorSlugLookup) === personSlug,
	);
	matched.sort(compareThesesListingOrder);
	return matched;
}
