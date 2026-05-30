import type { CollectionEntry } from 'astro:content';

/** Past seminars shown below the featured upcoming row on the home agenda. */
export const DEFAULT_SEMINAR_AGENDA_PAST_COUNT = 4;

export type SeminarAgendaSections = {
	/** Soonest seminar on or after today; shown first when present. */
	upcoming: CollectionEntry<'seminars'> | null;
	/** Most recent past seminars, newest first. */
	past: CollectionEntry<'seminars'>[];
};

export function utcCalendarDay(d: Date): Date {
	return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function seminarsForHomeAgenda(
	seminars: CollectionEntry<'seminars'>[],
	pastCount = DEFAULT_SEMINAR_AGENDA_PAST_COUNT,
	now = new Date(),
): SeminarAgendaSections {
	const today = utcCalendarDay(now);
	const sorted = [...seminars].sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());

	const past: CollectionEntry<'seminars'>[] = [];
	const onOrAfterToday: CollectionEntry<'seminars'>[] = [];

	for (const entry of sorted) {
		const day = utcCalendarDay(entry.data.date);
		if (day < today) past.push(entry);
		else onOrAfterToday.push(entry);
	}

	return {
		upcoming: onOrAfterToday[0] ?? null,
		past: [...past.slice(-pastCount)].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf()),
	};
}

export function formatSeminarAgendaDate(d: Date): { primary: string; secondary: string } {
	return {
		primary: d.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			timeZone: 'UTC',
		}),
		secondary: String(d.getUTCFullYear()),
	};
}

export function seminarAgendaMeta(
	speakers: string[] | undefined,
	time?: string,
	location?: string,
	term?: string,
): string {
	const parts = [
		speakers?.length ? speakers.join(', ') : undefined,
		time?.trim(),
		location?.trim(),
		term?.trim(),
	].filter(Boolean);
	return parts.join(' · ');
}

export function seminarAgendaDayKind(
	date: Date,
	now = new Date(),
): 'past' | 'today' | 'upcoming' {
	const today = utcCalendarDay(now);
	const day = utcCalendarDay(date);
	if (day < today) return 'past';
	if (day > today) return 'upcoming';
	return 'today';
}
