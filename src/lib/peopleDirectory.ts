/** Sort keys and short display strings for the People listing and profile meta. */

const TERM_PARSE = /^(\w+)\s+(\d{4})$/;

/** Frontmatter quirks / loose parsing can yield numbers or non-strings; never `.trim()` blindly. */
export function normalizeOptionalTermString(value: unknown): string | undefined {
	if (value == null || typeof value === 'boolean') return undefined;
	if (typeof value === 'string') {
		const t = value.trim();
		return t.length > 0 ? t : undefined;
	}
	if (typeof value === 'number' && Number.isFinite(value)) return String(value);
	const t = String(value).trim();
	return t.length > 0 ? t : undefined;
}

/**
 * Explicit semester order within a calendar year for roster sorting: Spring → Summer → Fall.
 * (Winter is not used at Emory NLP; unknown seasons sort like missing `startTerm`.)
 */
const SEMESTER_RANK: Record<string, number> = {
	spring: 0,
	summer: 1,
	fall: 2,
};

function parseStartTermPieces(termRaw: unknown): { year: number; semester: number } | null {
	const term = normalizeOptionalTermString(termRaw);
	if (!term) return null;
	const m = TERM_PARSE.exec(term);
	if (!m) return null;
	const season = m[1].toLowerCase();
	const year = Number.parseInt(m[2], 10);
	const semester = SEMESTER_RANK[season];
	if (!Number.isFinite(year) || semester === undefined) return null;
	return { year, semester };
}

function lastWhitespaceTokenLower(displayName: string): string {
	const parts = displayName.trim().split(/\s+/);
	const last = parts.at(-1) ?? '';
	return last.toLocaleLowerCase('en');
}

/** Normalize content `id` / path to hyphen slug (`jinho-choi`, nested ok). */
function slugStemFromPersonId(sortId: string | undefined): string {
	if (!sortId?.trim()) return '';
	let s = sortId.trim().replace(/\.md$/i, '');
	s = (s.split(/[/\\]/).pop() ?? s).trim();
	return s;
}

/**
 * Family-name sort key: `given-family` slug → `family`; multi-segment hyphenated surname slugs (`given-hyphen surname`) collapse to slug tail.
 * Matches how files are named (`andrew-jaffe-berkowitz` ⇒ `jaffe-berkowitz`). If slug has no extra
 * segments (or is missing), fall back to last whitespace-separated token from `displayName`.
 */
export function directoryFamilySortKey(sortId: string | undefined, displayName: string): string {
	const slug = slugStemFromPersonId(sortId);
	const segs = slug.split('-').filter(Boolean);
	const rest = segs.length > 1 ? segs.slice(1).join('-') : '';
	if (rest.length > 0) return rest.toLocaleLowerCase('en');
	return lastWhitespaceTokenLower(displayName);
}

const nameLocaleOpts: Intl.CollatorOptions = { sensitivity: 'base', numeric: true };

/** Inputs for roster ordering (people page, alumni page, lab rosters). */
export type PersonDirectorySortInput = {
	name: string;
	startTerm?: unknown;
	/** People entry `id` (slug), e.g. `jinho-choi` — used for hyphenated surnames; optional. */
	sortId?: string;
};

/**
 * Primary: `startTerm` — calendar year ascending, then Spring → Summer → Fall within the year.
 * Anyone without a parsable `startTerm` sorts after entries that have one.
 * Then: `directoryFamilySortKey(sortId, name)`, then full-name collator order.
 */
export function comparePeopleDirectory(a: PersonDirectorySortInput, b: PersonDirectorySortInput): number {
	const pa = parseStartTermPieces(a.startTerm);
	const pb = parseStartTermPieces(b.startTerm);
	if (pa && pb) {
		if (pa.year !== pb.year) return pa.year - pb.year;
		if (pa.semester !== pb.semester) return pa.semester - pb.semester;
	} else if (pa && !pb) return -1;
	else if (!pa && pb) return 1;

	const fa = directoryFamilySortKey(a.sortId, a.name);
	const fb = directoryFamilySortKey(b.sortId, b.name);
	const lk = fa.localeCompare(fb, 'en', nameLocaleOpts);
	if (lk !== 0) return lk;
	return a.name.localeCompare(b.name, 'en', nameLocaleOpts);
}

/** Roster grids (`/people/`, `/people/former-members/`): compare by `endTerm` first, then name. */
export type PersonRosterSortInput = {
	name: string;
	endTerm?: unknown;
	/** Alumni vs active; omit or true = member is still active (unless `endTerm` is set). */
	current?: boolean;
	sortId?: string;
};

/**
 * Roster grids: sort primarily by **`endTerm`** descending (year, then Fall → Summer → Spring).
 * Active members without parsable **`endTerm`** use an open-ended key (still here; listed first vs dated ends).
 * Alumni without parsable **`endTerm`** sort last.
 * Tie-break: **`directoryFamilySortKey`** (last name / slug stem) ascending, then full **`name`**.
 */
export function comparePeopleDirectoryByEndThenName(a: PersonRosterSortInput, b: PersonRosterSortInput): number {
	function endRank(input: PersonRosterSortInput): { y: number; s: number } {
		const pe = parseStartTermPieces(input.endTerm);
		const active = input.current !== false;
		if (active) {
			if (pe) return { y: pe.year, s: pe.semester };
			return { y: Number.POSITIVE_INFINITY, s: Number.POSITIVE_INFINITY };
		}
		if (pe) return { y: pe.year, s: pe.semester };
		return { y: Number.NEGATIVE_INFINITY, s: Number.NEGATIVE_INFINITY };
	}

	const ea = endRank(a);
	const eb = endRank(b);
	if (ea.y !== eb.y) return eb.y - ea.y;
	if (ea.s !== eb.s) return eb.s - ea.s;

	const fa = directoryFamilySortKey(a.sortId, a.name);
	const fb = directoryFamilySortKey(b.sortId, b.name);
	const lk = fa.localeCompare(fb, 'en', nameLocaleOpts);
	if (lk !== 0) return lk;
	return a.name.localeCompare(b.name, 'en', nameLocaleOpts);
}

/**
 * Secondary line under `role` on directory cards — matches profile hero precedence
 * (`directoryMeta` replaces the computed term range when set).
 */
export function formatPeopleListingMeta(input: {
	directoryMeta?: unknown;
	startTerm?: unknown;
	endTerm?: unknown;
	cohort?: unknown;
	current?: boolean;
}): string | undefined {
	const dm = normalizeOptionalTermString(input.directoryMeta);
	if (dm) return dm;
	return formatPeopleTermRange(input);
}

/** e.g. `Fall 2021 ~ Present`; falls back to `cohort` when no start term. */
export function formatPeopleTermRange(input: {
	startTerm?: unknown;
	endTerm?: unknown;
	cohort?: unknown;
	current?: boolean;
}): string | undefined {
	const start = normalizeOptionalTermString(input.startTerm);
	if (start) {
		const explicitEnd = normalizeOptionalTermString(input.endTerm);
		const end =
			explicitEnd ?? (input.current !== false ? 'Present' : undefined);
		return end ? `${start} ~ ${end}` : start;
	}
	const cohort = normalizeOptionalTermString(input.cohort);
	return cohort || undefined;
}
