import { normalizeOptionalTermString } from './peopleDirectory';

const TERM_PARSE = /^(\w+)\s+(\d{4})$/;

/** Calendar year from a semester end term such as `Spring 2024`. */
export function classYearFromEndTerm(endTerm: unknown): number | undefined {
	const term = normalizeOptionalTermString(endTerm);
	if (!term) return undefined;
	const m = TERM_PARSE.exec(term);
	if (!m) return undefined;
	const year = Number.parseInt(m[2], 10);
	return Number.isFinite(year) ? year : undefined;
}

export type PeopleListingClassYearInput = {
	current?: boolean;
	endTerm?: unknown;
};

/** Class year for alumni (`current: false`); active members have no class year. */
export function peopleListingClassYear(input: PeopleListingClassYearInput): number | undefined {
	if (input.current !== false) return undefined;
	return classYearFromEndTerm(input.endTerm);
}

/** Lowercase tokens for client-side search: first name, last name, full name, aliases. */
export function peopleListingSearchHaystack(name: string, aliases?: string[] | undefined): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	const first = parts[0] ?? '';
	const last = parts.length > 1 ? (parts.at(-1) ?? '') : '';
	const tokens = [first, last, name.trim(), ...(aliases ?? []).map((alias) => alias.trim()).filter(Boolean)];
	const seen = new Set<string>();
	const normalized: string[] = [];
	for (const token of tokens) {
		const lower = token.toLowerCase();
		if (!lower || seen.has(lower)) continue;
		seen.add(lower);
		normalized.push(lower);
	}
	return normalized.join(' ');
}

export function peopleListingSearchMatches(haystack: string, query: string): boolean {
	const q = query.trim().toLowerCase();
	if (!q) return true;
	return haystack.includes(q);
}

export type ClassYearOption = { year: number; count: number };

export function buildClassYearCatalog(rows: PeopleListingClassYearInput[]): ClassYearOption[] {
	const counts = new Map<number, number>();
	for (const row of rows) {
		const year = peopleListingClassYear(row);
		if (year === undefined) continue;
		counts.set(year, (counts.get(year) ?? 0) + 1);
	}
	return [...counts.entries()]
		.sort((a, b) => b[0] - a[0])
		.map(([year, count]) => ({ year, count }));
}

export type MembersFilterState = {
	all: boolean;
	current: boolean;
	classYears: Set<number>;
};

export function membersFilterIncludesPerson(
	state: MembersFilterState,
	person: PeopleListingClassYearInput,
): boolean {
	if (state.all) return true;
	if (person.current !== false && state.current) return true;
	const classYear = peopleListingClassYear(person);
	if (classYear !== undefined && state.classYears.has(classYear)) return true;
	return false;
}
