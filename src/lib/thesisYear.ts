import { thesisDegreeKind } from './degreeListKind';

/** Year for sorting and filters when thesis entries have no calendar `date`. Prefers a year in `term`, otherwise the thesis year encoded in `entryId` (e.g. `2024-honors-foo`). */
export function thesisSortYear(term: string | undefined, entryId: string): number {
	if (term) {
		const m = term.match(/\b((?:19|20)\d{2})\b/);
		if (m) return parseInt(m[1], 10);
	}
	const m2 = entryId.match(/(?:^|-)((?:19|20)\d{2})(?:-|$)/);
	if (m2) return parseInt(m2[1], 10);
	return 2000;
}

/**
 * Season rank for listing sort within the same year: **descending** order is Fall → Summer → Spring.
 * Unknown / missing season sorts after Spring (rank 0).
 */
export function thesisTermSeasonRank(term: string | undefined): number {
	const t = term?.trim();
	if (!t) return 0;
	if (/\bFall\b/i.test(t)) return 3;
	if (/\bSummer\b/i.test(t)) return 2;
	if (/\bSpring\b/i.test(t)) return 1;
	return 0;
}

const authorSortLocale = 'en';

/** Last token → family name; preceding tokens → given names (matches current thesis `author: "Given Family"` style). */
export function thesisAuthorNameSortKeys(author: string): { first: string; last: string } {
	const parts = author
		.trim()
		.normalize('NFC')
		.split(/\s+/)
		.filter(Boolean);
	if (parts.length === 0) return { first: '', last: '' };
	if (parts.length === 1) return { first: '', last: parts[0] };
	return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

function localeCompareThesis(a: string, b: string): number {
	return a.localeCompare(b, authorSortLocale, { sensitivity: 'base', numeric: true });
}

/**
 * Thesis list order: year desc, term season desc (Fall → Summer → Spring), author last name asc, first name asc.
 */
export function compareThesesListingOrder(
	a: { id: string; data: { term?: string; author: string } },
	b: { id: string; data: { term?: string; author: string } },
): number {
	const ya = thesisSortYear(a.data.term, a.id);
	const yb = thesisSortYear(b.data.term, b.id);
	if (yb !== ya) return yb - ya;

	const sa = thesisTermSeasonRank(a.data.term);
	const sb = thesisTermSeasonRank(b.data.term);
	if (sb !== sa) return sb - sa;

	const fa = thesisAuthorNameSortKeys(a.data.author);
	const fb = thesisAuthorNameSortKeys(b.data.author);
	const lastCmp = localeCompareThesis(fa.last, fb.last);
	if (lastCmp !== 0) return lastCmp;
	return localeCompareThesis(fa.first, fb.first);
}

/** Dispatch issue list: PhD → MS → undergraduate, then author last name, then first name. */
export function thesisDegreeTierRank(degree: string): number {
	switch (thesisDegreeKind(degree)) {
		case 'phd':
			return 0;
		case 'ms':
			return 1;
		case 'undergrad':
			return 2;
		default:
			return 3;
	}
}

export function compareDispatchThesesOrder(
	a: { entry: { data: { degree: string; author: string } } },
	b: { entry: { data: { degree: string; author: string } } },
): number {
	const tierCmp = thesisDegreeTierRank(a.entry.data.degree) - thesisDegreeTierRank(b.entry.data.degree);
	if (tierCmp !== 0) return tierCmp;

	const fa = thesisAuthorNameSortKeys(a.entry.data.author);
	const fb = thesisAuthorNameSortKeys(b.entry.data.author);
	const lastCmp = localeCompareThesis(fa.last, fb.last);
	if (lastCmp !== 0) return lastCmp;
	return localeCompareThesis(fa.first, fb.first);
}

/** Term shown in parentheses on people profiles; falls back to year from `entryId` when `term` is omitted (same idea as thesis index cards). */
export function thesisTermNoteLabel(term: string | undefined, entryId: string): string {
	const t = term?.trim();
	return t || String(thesisSortYear(undefined, entryId));
}
