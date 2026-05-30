import type { CollectionEntry } from 'astro:content';
import { formatCalendarDateLongMonth } from '../dates';
import { resolvePeoplePhotoPublicHref } from '../peoplePhotos';
import { siteHref } from '../siteHref';

function assertColumnSlug(
	label: string,
	slug: string,
	map: Map<string, CollectionEntry<'dispatchColumns'>>,
	issueId: string,
): CollectionEntry<'dispatchColumns'> {
	const entry = map.get(slug);
	if (!entry) {
		throw new Error(`[dispatch:${issueId}] ${label} references unknown slug "${slug}"`);
	}
	if (entry.data.issue !== issueId) {
		throw new Error(
			`[dispatch:${issueId}] ${label} "${slug}" belongs to issue "${entry.data.issue}"`,
		);
	}
	return entry;
}

type DispatchColumnData = CollectionEntry<'dispatchColumns'>['data'];

type ResolvedColumnBase = {
	entry: CollectionEntry<'dispatchColumns'>;
	headline: string;
	byline: string;
	avatarHref?: string;
	coverImageSrc?: string;
	coverImagePosition?: string;
	published?: Date;
	publishedLabel?: string;
};

export type ResolvedColumnFull = ResolvedColumnBase & {
	format: 'full';
	pullQuote: string;
};

export type ResolvedColumnExternal = ResolvedColumnBase & {
	format: 'external';
	subtitle: string;
	tagline?: string;
	summary: string;
	seoDescription?: string;
	sourceUrl: string;
	sourceLabel?: string;
	embedUrl?: string;
	note?: string;
};

export type ResolvedColumn = ResolvedColumnFull | ResolvedColumnExternal;

function resolveColumnAvatar(data: DispatchColumnData): string | undefined {
	const avatar = data.avatar?.trim();
	return (
		(avatar ? siteHref(avatar) : undefined) ??
		resolvePeoplePhotoPublicHref('jinho-choi') ??
		undefined
	);
}

function resolveColumnBase(
	entry: CollectionEntry<'dispatchColumns'>,
): ResolvedColumnBase {
	const data = entry.data;
	const coverImage = data.coverImage?.trim();
	return {
		entry,
		headline: data.headline,
		byline: data.byline ?? 'Jinho D. Choi, Associate Professor of Computer Science',
		avatarHref: resolveColumnAvatar(data),
		coverImageSrc: coverImage ? siteHref(coverImage) : undefined,
		coverImagePosition: data.coverImagePosition?.trim() || undefined,
		published: data.published,
		publishedLabel: data.published
			? formatCalendarDateLongMonth(data.published)
			: undefined,
	};
}

export function resolveDispatchColumns(
	slugs: string[],
	columnMap: Map<string, CollectionEntry<'dispatchColumns'>>,
	issueId: string,
): ResolvedColumn[] {
	return slugs.map((slug, i) => {
		const entry = assertColumnSlug(`columns[${i}]`, slug, columnMap, issueId);
		const data = entry.data;
		const base = resolveColumnBase(entry);

		if (data.format === 'external') {
			return {
				...base,
				format: 'external',
				subtitle: data.subtitle!,
				tagline: data.tagline?.trim() || undefined,
				summary: data.summary!,
				seoDescription: data.seoDescription?.trim() || undefined,
				sourceUrl: data.sourceUrl!,
				sourceLabel: data.sourceLabel,
				embedUrl: data.embedUrl,
				note: data.note?.trim() || undefined,
			};
		}

		return {
			...base,
			format: 'full',
			pullQuote: data.pullQuote!,
		};
	});
}
