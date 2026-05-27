import fs from 'node:fs';
import path from 'node:path';
import { normalizePersonKey, slugForPublicationAuthor } from './publicationAuthorLinks';
import { resolvePeoplePhotoPublicHref } from './peoplePhotos';

const EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const;

/**
 * Resolves `public/seminars/{slug}.{ext}` when present.
 */
export function resolveSeminarCoverPublicHref(slug: string): string | undefined {
	const dir = path.join(process.cwd(), 'public', 'seminars');
	if (!fs.existsSync(dir)) return undefined;

	for (const ext of EXTS) {
		const file = path.join(dir, `${slug}${ext}`);
		if (fs.existsSync(file)) return `/seminars/${slug}${ext}`;
	}

	return undefined;
}

/**
 * Thumbnail for seminar listing cards: explicit `coverImage`, then `public/seminars/{slug}`
 * (single-speaker only — wide multi-face banners crop poorly in the square thumb),
 * then the first speaker's people photo when there is exactly one presenter.
 * Multi-speaker talks use {@link resolveSeminarSpeakerCollageHrefs} on the list page.
 */
export function resolveSeminarCoverHref(
	slug: string,
	coverImage: string | undefined,
	speakerCount: number,
	speakerPeopleSlug: string | undefined,
	primarySpeakerName?: string,
): string | undefined {
	const explicit = coverImage?.trim();
	if (explicit) return explicit;

	if (speakerCount >= 2) {
		return undefined;
	}

	const seminarAsset = resolveSeminarCoverPublicHref(slug);
	if (seminarAsset) return seminarAsset;

	if (speakerCount === 1) {
		const peopleSlug =
			speakerPeopleSlug ??
			(primarySpeakerName ? peopleSlugFromSpeakerName(primarySpeakerName) : undefined);
		if (peopleSlug) {
			return resolvePeoplePhotoPublicHref(peopleSlug);
		}
	}

	return undefined;
}

/** Fallback when author lookup misses but `public/people/{slug}.webp` exists (e.g. broken profile frontmatter). */
function peopleSlugFromSpeakerName(name: string): string {
	return normalizePersonKey(name).replace(/\s+/g, '-');
}

function resolveSpeakerPeoplePhotoHref(
	name: string,
	authorSlugLookup: Map<string, string>,
): string | undefined {
	const slug =
		slugForPublicationAuthor(name, authorSlugLookup) ?? peopleSlugFromSpeakerName(name);
	return resolvePeoplePhotoPublicHref(slug);
}

/** One slot per speaker (max 4), in speaker order; `undefined` when no photo file exists. */
export function resolveSeminarSpeakerCollageHrefs(
	speakers: string[],
	authorSlugLookup: Map<string, string>,
	max = 4,
): (string | undefined)[] {
	return speakers.slice(0, max).map((name) => resolveSpeakerPeoplePhotoHref(name, authorSlugLookup));
}

/** People photos for multi-speaker list thumbnails (max 4, order matches `speakers`). */
export function resolveSeminarSpeakerPhotoHrefs(
	speakers: string[],
	authorSlugLookup: Map<string, string>,
	max = 4,
): string[] {
	return resolveSeminarSpeakerCollageHrefs(speakers, authorSlugLookup, max).filter(
		(href): href is string => href !== undefined,
	);
}
