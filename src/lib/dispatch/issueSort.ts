import type { CollectionEntry } from 'astro:content';

export function compareDispatchIssues(
	a: CollectionEntry<'dispatch'>,
	b: CollectionEntry<'dispatch'>,
): number {
	const pa = a.data.published.valueOf();
	const pb = b.data.published.valueOf();
	if (pb !== pa) return pb - pa;
	if (b.data.volume !== a.data.volume) return b.data.volume - a.data.volume;
	return b.data.issue - a.data.issue;
}

export function pickCurrentDispatchIssue(
	issues: CollectionEntry<'dispatch'>[],
): CollectionEntry<'dispatch'> | undefined {
	if (issues.length === 0) return undefined;
	return [...issues].sort(compareDispatchIssues)[0];
}
