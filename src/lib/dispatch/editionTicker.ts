import { formatCalendarDateLongMonth } from '../dates';
import type { ResolvedDispatchIssue } from './resolveIssue';

/** e.g. `Volume 1 · Issue 1 (Spring 2026)` */
export function formatDispatchVolumeIssue(
	volume: number,
	issue: number,
	periodLabel: string,
): string {
	return `Volume ${volume} · Issue ${issue} (${periodLabel})`;
}

/** e.g. `Volume 1 · Issue 1` — cover footer and compact labels. */
export function formatDispatchVolumeIssueLine(volume: number, issue: number): string {
	return `Volume ${volume} · Issue ${issue}`;
}

/** Issue page masthead — volume, issue number, and season label. */
export function dispatchIssueTagline(resolved: ResolvedDispatchIssue): string {
	const d = resolved.entry.data;
	return formatDispatchVolumeIssue(d.volume, d.issue, d.periodLabel);
}

function formatCount(count: number, singular: string, plural: string): string {
	return `${count} ${count === 1 ? singular : plural}`;
}

/** Scrolling strip below the hub hero (and issue header when used). */
export function buildDispatchEditionTickerItems(
	resolved: ResolvedDispatchIssue,
): string[] {
	const d = resolved.entry.data;
	const counts: string[] = [];

	const { distinctions, papers, theses } = resolved.counts;
	if (distinctions > 0) {
		counts.push(formatCount(distinctions, 'distinction', 'distinctions'));
	}
	if (papers > 0) {
		counts.push(formatCount(papers, 'paper', 'papers'));
	}
	if (theses > 0) {
		counts.push(formatCount(theses, 'thesis', 'theses'));
	}
	if (resolved.counts.columns > 0) {
		counts.push(formatCount(resolved.counts.columns, 'opinion', 'opinions'));
	}
	const activities = d.activityNews.length;
	if (activities > 0) {
		counts.push(formatCount(activities, 'activity', 'activities'));
	}

	const released = `${formatCalendarDateLongMonth(d.published)}`;
	const summary =
		counts.length > 0 ? `${released} — ${counts.join(' | ')}` : released;

	return [summary];
}
