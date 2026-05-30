import type { CollectionEntry } from 'astro:content';
import { slugForPublicationAuthor } from '../publicationAuthorLinks';
import { formatCalendarDateLongMonth } from '../dates';
import { publicationAbstractParagraphs } from '../publicationAbstract';
import { formatPaperPublishedDisplayLine } from '../publicationListing';
import { siteHref } from '../siteHref';
import { resolvePeoplePhotoPublicHref } from '../peoplePhotos';
import { dispatchExcerpt } from './excerpt';
import { resolveStructuredTopics, resolveThesisTopics, type ResolvedPaperTopic } from './paperTopics';
import type { FeaturedSource } from './sectionRefs';

export type FeaturedTone = 'publication' | 'news' | 'seminar' | 'award' | 'thesis' | 'neutral';

export type ResolvedFeaturedLink = { label: string; href: string };

export type FeaturedAuthorPortrait = {
	name: string;
	href?: string;
	photoSrc?: string;
	initials: string;
};

export type ResolvedFeaturedItem = {
	kindLabel: string;
	tone: FeaturedTone;
	title: string;
	/** Venue name (featured publication cards). */
	meta?: string;
	/** Formatted publish date (featured publication cards). */
	publishedLine?: string;
	/** Full abstract paragraphs (featured publication cards). */
	abstractParagraphs?: string[];
	/** Color-coded topic tags from paper `topics`. */
	topics?: ResolvedPaperTopic[];
	summary?: string;
	href?: string;
	imageSrc?: string;
	imageAlt?: string;
	coverImagePosition?: string;
	authorPortraits?: FeaturedAuthorPortrait[];
	venueAbbrev?: string;
	/** Set on featured thesis cards (for section heading logic). */
	thesisDegree?: string;
	links: ResolvedFeaturedLink[];
};

type Catalog = {
	pubMap: Map<string, CollectionEntry<'papers'>>;
	thesisMap: Map<string, CollectionEntry<'theses'>>;
	newsMap: Map<string, CollectionEntry<'news'>>;
	authorSlugLookup: Map<string, string>;
};

function highlightKindLabel(entry: CollectionEntry<'news'>): string {
	const labels = entry.data.labels ?? [];
	if (labels.includes('achievements')) return 'Award';
	if (labels.includes('media')) return 'Media';
	if (labels.includes('seminars')) return 'Seminar';
	if (labels.includes('conferences')) return 'Conference';
	return 'News';
}

function highlightTone(entry: CollectionEntry<'news'>): FeaturedTone {
	const labels = entry.data.labels ?? [];
	if (labels.includes('achievements')) return 'award';
	return 'news';
}

function initialsFromName(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
	}
	return name.trim().slice(0, 2).toUpperCase();
}

function portraitsForPublication(
	entry: CollectionEntry<'papers'>,
	authorSlugLookup: Map<string, string>,
): FeaturedAuthorPortrait[] {
	return entry.data.authors.map((name) => {
		const slug = slugForPublicationAuthor(name, authorSlugLookup);
		return {
			name,
			href: slug ? siteHref(`/people/${slug}/`) : undefined,
			photoSrc: slug ? resolvePeoplePhotoPublicHref(slug) : undefined,
			initials: initialsFromName(name),
		};
	});
}

function resolveFeaturedPublication(
	slug: string,
	blurb: string | undefined,
	issueId: string,
	catalog: Catalog,
): ResolvedFeaturedItem {
	const entry = catalog.pubMap.get(slug);
	if (!entry) {
		throw new Error(`[dispatch:${issueId}] featured publication unknown slug "${slug}"`);
	}
	const d = entry.data;
	const href = siteHref(`/papers/${entry.id}/`);
	return {
		kindLabel: 'Publication',
		tone: 'publication',
		title: d.title,
		meta: d.venue.trim(),
		publishedLine: formatPaperPublishedDisplayLine(d),
		abstractParagraphs: blurb
			? [blurb]
			: publicationAbstractParagraphs(d.abstract),
		topics: (() => {
			const topics = resolveStructuredTopics(d.topics);
			return topics.length > 0 ? topics : undefined;
		})(),
		href,
		authorPortraits: portraitsForPublication(entry, catalog.authorSlugLookup),
		links: [],
	};
}

function resolveFeaturedHighlight(
	slug: string,
	blurb: string | undefined,
	issueId: string,
	catalog: Catalog,
): ResolvedFeaturedItem {
	const entry = catalog.newsMap.get(slug);
	if (!entry) {
		throw new Error(`[dispatch:${issueId}] featured highlight unknown slug "${slug}"`);
	}
	const href = siteHref(`/news/${entry.id}/`);
	return {
		kindLabel: highlightKindLabel(entry),
		tone: highlightTone(entry),
		title: entry.data.title,
		meta: formatCalendarDateLongMonth(entry.data.date),
		summary: blurb ?? entry.data.title,
		href,
		imageSrc: entry.data.coverImage ? siteHref(entry.data.coverImage) : undefined,
		imageAlt: entry.data.title,
		coverImagePosition: entry.data.coverImagePosition?.trim() || undefined,
		links: [{ label: 'Read story', href }],
	};
}

function resolveFeaturedThesis(
	slug: string,
	blurb: string | undefined,
	issueId: string,
	catalog: Catalog,
): ResolvedFeaturedItem {
	const entry = catalog.thesisMap.get(slug);
	if (!entry) {
		throw new Error(`[dispatch:${issueId}] featured thesis unknown slug "${slug}"`);
	}
	const d = entry.data;
	const href = siteHref(`/papers/theses/${entry.id}/`);
	const metaParts = [d.author, d.degree];
	if (d.department?.trim()) metaParts.push(d.department.trim());
	if (d.term?.trim()) metaParts.push(d.term.trim());
	const topics = resolveThesisTopics(d.topics, { title: d.title, abstract: d.abstract });
	return {
		kindLabel: d.degree === 'PhD' ? 'Dissertation' : 'Thesis',
		tone: 'thesis',
		title: d.title,
		meta: metaParts.join(' · '),
		topics: topics.length > 0 ? topics : undefined,
		thesisDegree: d.degree,
		summary: blurb ?? dispatchExcerpt(d.abstract, 220),
		href,
		imageSrc: d.photo ? siteHref(d.photo) : undefined,
		imageAlt: d.title,
		links: [{ label: 'Thesis page', href }],
	};
}

export function resolveFeaturedFromSource(
	source: FeaturedSource,
	issueId: string,
	catalog: Catalog,
): ResolvedFeaturedItem {
	switch (source.section) {
		case 'papers':
			return resolveFeaturedPublication(source.slug, source.blurb, issueId, catalog);
		case 'activityNews':
		case 'distinctions':
			return resolveFeaturedHighlight(source.slug, source.blurb, issueId, catalog);
		case 'theses':
			return resolveFeaturedThesis(source.slug, source.blurb, issueId, catalog);
		default:
			throw new Error(`[dispatch:${issueId}] featured has unknown section`);
	}
}
