/** Emory‑local assumption for shorthand `YYYY-MM-DD-HH:MM` in news frontmatter. */
const NEWS_WALL_ZONE = 'America/New_York';

export function formatDate(d: Date): string {
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	});
}

function isUtcMidnight(d: Date): boolean {
	return (
		d.getUTCHours() === 0 &&
		d.getUTCMinutes() === 0 &&
		d.getUTCSeconds() === 0 &&
		d.getUTCMilliseconds() === 0
	);
}

/** Calendar date only (no clock time). Timed frontmatter still sorts correctly; display uses Eastern date for non–UTC-midnight instants. */
export function formatNewsDate(d: Date): string {
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: isUtcMidnight(d) ? 'UTC' : NEWS_WALL_ZONE,
	});
}

/** Like `formatNewsDate`, but spells the month in full (e.g. March 10, 2026). */
export function formatCalendarDateLongMonth(d: Date): string {
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: isUtcMidnight(d) ? 'UTC' : NEWS_WALL_ZONE,
	});
}

/** `YYYY-MM-DD-HH:MM` (minutes; Eastern wall clock) — disambiguates same calendar day. */
const NEWS_DATE_AND_TIME_RE = /^(\d{4})-(\d{2})-(\d{2})-(\d{2}):(\d{2})$/;

/** `YYYY-MM-DD` only — interpreted as UTC midnight (stable sort tie-break vs Eastern times). */
const NEWS_DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function tzCalendarParts(epochMs: number, timeZone: string) {
	const f = new Intl.DateTimeFormat('en-US', {
		timeZone,
		calendar: 'gregory',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		hourCycle: 'h23',
	});
	let y = '';
	let mo = '';
	let d = '';
	let h = '';
	let mi = '';
	for (const p of f.formatToParts(new Date(epochMs))) {
		if (p.type === 'year') y = p.value;
		else if (p.type === 'month') mo = p.value;
		else if (p.type === 'day') d = p.value;
		else if (p.type === 'hour') h = p.value;
		else if (p.type === 'minute') mi = p.value;
	}
	return {
		y: Number(y),
		m: Number(mo),
		d: Number(d),
		h: Number(h),
		mi: Number(mi),
	};
}

/** Map Eastern wall-clock to a UTC `Date`; `null` if that local time never occurs (DST gap). */
function easternWallClockToUtcInstant(
	y: number,
	m: number,
	d: number,
	h: number,
	mi: number,
): Date | null {
	const anchor = Date.UTC(y, m - 1, d, 12, 0, 0, 0);
	for (let delta = -48 * 60; delta <= 48 * 60; delta++) {
		const ms = anchor + delta * 60_000;
		const p = tzCalendarParts(ms, NEWS_WALL_ZONE);
		if (p.y === y && p.m === m && p.d === d && p.h === h && p.mi === mi) {
			return new Date(ms);
		}
	}
	return null;
}

function assertRange(label: string, n: number, lo: number, hi: number) {
	if (!Number.isInteger(n) || n < lo || n > hi) {
		throw new Error(`${label} out of range for news date (${lo}–${hi}): ${n}`);
	}
}

function daysInMonth(year: number, month1based: number) {
	return new Date(Date.UTC(year, month1based, 0)).getUTCDate();
}

/**
 * Parses news frontmatter values:
 * - `YYYY-MM-DD-HH:MM` — Eastern (America/New_York) wall-clock
 * - `YYYY-MM-DD` — UTC midnight
 * - other strings — delegated to `new Date()`
 */
export function parseNewsFrontmatterDate(input: unknown): Date {
	if (input instanceof Date) {
		if (Number.isNaN(input.getTime())) throw new Error('Invalid Date object in news frontmatter');
		return input;
	}
	if (typeof input !== 'string') {
		throw new Error(`News date must be a string or Date, got ${typeof input}`);
	}
	const trimmed = input.trim();

	const wall = NEWS_DATE_AND_TIME_RE.exec(trimmed);
	if (wall) {
		const y = Number(wall[1]);
		const m = Number(wall[2]);
		const d = Number(wall[3]);
		const h = Number(wall[4]);
		const mi = Number(wall[5]);
		assertRange('Month', m, 1, 12);
		const dim = daysInMonth(y, m);
		assertRange('Day', d, 1, dim);
		assertRange('Hour', h, 0, 23);
		assertRange('Minute', mi, 0, 59);
		const instant = easternWallClockToUtcInstant(y, m, d, h, mi);
		if (!instant) {
			throw new Error(
				`No valid instant for Eastern local ${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')} (invalid or DST gap)`,
			);
		}
		return instant;
	}

	const dayOnly = NEWS_DATE_ONLY_RE.exec(trimmed);
	if (dayOnly) {
		return new Date(trimmed);
	}

	const fb = new Date(trimmed);
	if (Number.isNaN(fb.getTime())) throw new Error(`Unrecognized news date: ${trimmed}`);
	return fb;
}
