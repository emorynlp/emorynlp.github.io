import type { CollectionEntry } from 'astro:content';
import { siteHref } from './siteHref';

const ROSTER_LAB_ROLES = new Set(['student', 'postdoc']);

export type ParticipantRef = {
	slug: string;
	name: string;
	/** Present when `src/content/people/{slug}.md` exists */
	href: string | null;
};

/** Fallback display name when no people profile exists (Title-Case hyphen segments). */
export function participantNameFromSlug(slug: string): string {
	return slug
		.split('-')
		.map((segment) =>
			segment.length ? segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase() : '',
		)
		.filter(Boolean)
		.join(' ');
}

export function rosterForNewsTags(
	people: CollectionEntry<'people'>[],
): { id: string; name: string; role: string; labRole: string | undefined }[] {
	return people
		.filter(
			(p) =>
				p.data.current &&
				p.data.labRole !== undefined &&
				ROSTER_LAB_ROLES.has(p.data.labRole),
		)
		.map((p) => ({
			id: p.id,
			name: p.data.name,
			role: p.data.role,
			labRole: p.data.labRole,
		}))
		.sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

export function resolveNewsParticipants(
	allPeople: CollectionEntry<'people'>[],
	participantSlugs: string[] | undefined,
	opts?: { slug?: string; title?: string },
): ParticipantRef[] {
	const map = Object.fromEntries(allPeople.map((p) => [p.id, p]));
	const refs: ParticipantRef[] = [];
	const stubs: string[] = [];
	for (const slug of participantSlugs ?? []) {
		const entry = map[slug];
		if (entry) {
			refs.push({ slug, name: entry.data.name, href: siteHref(`/people/${slug}/`) });
		} else {
			stubs.push(slug);
			refs.push({
				slug,
				name: participantNameFromSlug(slug),
				href: null,
			});
		}
	}
	if (
		stubs.length &&
		typeof import.meta !== 'undefined' &&
		import.meta.env?.DEV &&
		opts?.slug != null
	) {
		console.info(
			`[news/${opts.slug}] Participant(s) listed without a people profile (showing hyphenated names only): ${stubs.join(', ')}. Add matching files under src/content/people/.`,
			opts.title ?? '',
		);
	}
	return refs;
}
