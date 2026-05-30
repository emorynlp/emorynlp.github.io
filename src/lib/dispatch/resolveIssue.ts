import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { formatCalendarDateLongMonth } from '../dates';
import { resolvePeoplePhotoPublicHref } from '../peoplePhotos';
import { buildPublicationAuthorSlugLookup, slugForPublicationAuthor } from '../publicationAuthorLinks';
import { resolvePublicationPresenterPhotoPublicHref } from '../publicationPresenterPhotos';
import {
	formatPublicationVenueLine,
	formatPaperPublishedDisplayLine,
	publicationDek,
	publicationListingKind,
	publicationVenueAbbrev,
} from '../publicationListing';
import { siteHref } from '../siteHref';
import { resolveThesisTopics, type ResolvedPaperTopic } from './paperTopics';
import { compareDispatchThesesOrder } from '../thesisYear';
import { dispatchExcerpt } from './excerpt';
import { buildLabAuthorKeySet, isLabAuthorName } from './labAuthorNames';
import { pickHeroVisual, type HeroVisual } from './heroDiagram';
import { resolveFeaturedFromSource, type ResolvedFeaturedItem } from './resolveFeatured';
import {
	findFeaturedActivityRow,
	findFeaturedDistinctionRow,
	findFeaturedPublicationRef,
	findFeaturedThesisRef,
	normalizePublicationRef,
	normalizeThesisRef,
} from './sectionRefs';
import { resolveDispatchColumns, type ResolvedColumn } from './resolveColumns';

function assertSlug<T extends { id: string }>(
	label: string,
	slug: string,
	map: Map<string, T>,
	issueId: string,
): T {
	const entry = map.get(slug);
	if (!entry) {
		throw new Error(`[dispatch:${issueId}] ${label} references unknown slug "${slug}"`);
	}
	return entry;
}

export type DispatchAuthorLink = { name: string; href?: string; isLab: boolean };

export type ResolvedPublication = {
	entry: CollectionEntry<'papers'>;
	href: string;
	venueLine: string;
	venueAbbrev: string;
	publishedLine?: string;
	kind: ReturnType<typeof publicationListingKind>;
	excerpt: string | undefined;
	authorLinks: DispatchAuthorLink[];
};

export type ResolvedThesis = {
	entry: CollectionEntry<'theses'>;
	href: string;
	authorLinks: DispatchAuthorLink[];
	/** Degree, department, term (author rendered separately). */
	detailSuffix: string;
	topics: ResolvedPaperTopic[];
};

export type ResolvedReadingItem = {
	title: string;
	authorsLine: string | undefined;
	venueLine: string | undefined;
	why: string;
	url: string | undefined;
	href: string | undefined;
};

export type ResolvedHomepageHighlight = {
	kind: string;
	label: string;
	tagTone: 'core' | 'code' | 'apps' | 'seminar' | 'neutral';
	title: string;
	meta: string | undefined;
	href: string | undefined;
	coverImageSrc?: string;
	coverImagePosition?: string;
};

export type ResolvedActivityItem = {
	date: Date;
	text: string;
	title: string;
	/** From linked news `labels` when `highlight` is set. */
	labels: string[];
	kind?: CollectionEntry<'dispatch'>['data']['activityNews'][number]['kind'];
	featured?: boolean;
	href: string | undefined;
	coverImageSrc?: string;
	coverImagePosition?: string;
	imageAlt: string;
};

function resolveActivityItems(
	rows: CollectionEntry<'dispatch'>['data']['activityNews'],
	newsMap: Map<string, CollectionEntry<'news'>>,
	issueId: string,
): ResolvedActivityItem[] {
	return rows.map((item, i) => {
		let href: string | undefined;
		let title = item.text;
		let coverImageSrc: string | undefined;
		let coverImagePosition: string | undefined;
		let labels: string[] = [];
		if (item.highlight) {
			const entry = assertSlug(`activityNews[${i}].highlight`, item.highlight, newsMap, issueId);
			href = siteHref(`/news/${entry.id}/`);
			title = entry.data.title;
			labels = entry.data.labels ?? [];
			if (entry.data.coverImage) {
				coverImageSrc = siteHref(entry.data.coverImage);
				coverImagePosition = entry.data.coverImagePosition?.trim() || undefined;
			}
		}
		return {
			date: item.date,
			text: item.text,
			title,
			labels,
			kind: item.kind,
			featured: item.featured === true,
			href,
			coverImageSrc,
			coverImagePosition,
			imageAlt: title,
		};
	});
}

export type ResolvedDistinctionItem = {
	date: Date;
	text: string;
	title: string;
	kind: NonNullable<CollectionEntry<'dispatch'>['data']['distinctions']>[number]['kind'];
	kindLabel: string;
	href: string | undefined;
	coverImageSrc?: string;
	coverImagePosition?: string;
	imageAlt: string;
};

type FeaturedCatalog = {
	pubMap: Map<string, CollectionEntry<'papers'>>;
	thesisMap: Map<string, CollectionEntry<'theses'>>;
	newsMap: Map<string, CollectionEntry<'news'>>;
	authorSlugLookup: Map<string, string>;
};

export type ResolvedDispatchIssue = {
	entry: CollectionEntry<'dispatch'>;
	id: string;
	featuredPaper?: ResolvedFeaturedItem;
	featuredDistinction?: ResolvedFeaturedItem;
	featuredThesis?: ResolvedFeaturedItem;
	papers: ResolvedPublication[];
	theses: ResolvedThesis[];
	homepageHighlights: ResolvedHomepageHighlight[];
	readingList: ResolvedReadingItem[];
	activityNews: ResolvedActivityItem[];
	distinctions: ResolvedDistinctionItem[];
	columns: ResolvedColumn[];
	heroVisual: HeroVisual;
	issueHref: string;
	counts: { papers: number; theses: number; distinctions: number; columns: number };
};

function distinctionKindLabel(
	kind: NonNullable<CollectionEntry<'dispatch'>['data']['distinctions']>[number]['kind'],
): string {
	if (kind === 'award') return 'Award';
	if (kind === 'honor') return 'Honor';
	return 'Recognition';
}

function resolveDistinctionItems(
	rows: NonNullable<CollectionEntry<'dispatch'>['data']['distinctions']>,
	newsMap: Map<string, CollectionEntry<'news'>>,
	issueId: string,
): ResolvedDistinctionItem[] {
	return rows
		.filter((item) => item.featured !== true)
		.map((item, i) => {
			let href: string | undefined;
			let title = item.text;
			let coverImageSrc: string | undefined;
			let coverImagePosition: string | undefined;
			if (item.highlight) {
				const entry = assertSlug(`distinctions[${i}].highlight`, item.highlight, newsMap, issueId);
				href = siteHref(`/news/${entry.id}/`);
				title = entry.data.title;
				if (entry.data.coverImage) {
					coverImageSrc = siteHref(entry.data.coverImage);
					coverImagePosition = entry.data.coverImagePosition?.trim() || undefined;
				}
			}
			return {
				date: item.date,
				text: item.text,
				title,
				kind: item.kind,
				kindLabel: distinctionKindLabel(item.kind),
				href,
				coverImageSrc,
				coverImagePosition,
				imageAlt: title,
			};
		});
}

function resolveDispatchNewsLines<Kind>(
	section: string,
	rows: Array<{
		date: Date;
		text: string;
		kind: Kind;
		highlight?: string;
		featured?: boolean;
	}>,
	newsMap: Map<string, CollectionEntry<'news'>>,
	issueId: string,
): Array<{ date: Date; text: string; kind: Kind; href: string | undefined }> {
	return rows
		.filter((item) => item.featured !== true)
		.map((item, i) => {
			let href: string | undefined;
			if (item.highlight) {
				assertSlug(`${section}[${i}].highlight`, item.highlight, newsMap, issueId);
				href = siteHref(`/news/${item.highlight}/`);
			}
			return { date: item.date, text: item.text, kind: item.kind, href };
		});
}

function resolvePublication(
	entry: CollectionEntry<'papers'>,
	authorSlugLookup: Map<string, string>,
	labKeys: Set<string>,
): ResolvedPublication {
	return {
		entry,
		href: siteHref(`/papers/${entry.id}/`),
		venueLine: formatPublicationVenueLine(entry.data),
		venueAbbrev: publicationVenueAbbrev(entry.data),
		publishedLine: formatPaperPublishedDisplayLine(entry.data),
		kind: publicationListingKind(entry.data),
		excerpt: dispatchExcerpt(publicationDek(entry.data) ?? entry.data.abstract),
		authorLinks: entry.data.authors.map((name) => {
			const slug = slugForPublicationAuthor(name, authorSlugLookup);
			return {
				name,
				href: slug ? siteHref(`/people/${slug}/`) : undefined,
				isLab: isLabAuthorName(name, labKeys),
			};
		}),
	};
}

function resolveThesis(
	entry: CollectionEntry<'theses'>,
	authorSlugLookup: Map<string, string>,
	labKeys: Set<string>,
): ResolvedThesis {
	const d = entry.data;
	const authorSlug = slugForPublicationAuthor(d.author, authorSlugLookup);
	const detailParts: string[] = [d.degree];
	if (d.department?.trim()) detailParts.push(d.department.trim());
	if (d.term?.trim()) detailParts.push(d.term.trim());
	return {
		entry,
		href: siteHref(`/papers/theses/${entry.id}/`),
		authorLinks: [
			{
				name: d.author,
				href: authorSlug ? siteHref(`/people/${authorSlug}/`) : undefined,
				isLab: isLabAuthorName(d.author, labKeys),
			},
		],
		detailSuffix: detailParts.join(' · '),
		topics: resolveThesisTopics(d.topics, { title: d.title, abstract: d.abstract }),
	};
}

function resolveSectionFeatured(
	catalog: FeaturedCatalog,
	issueId: string,
	source: Parameters<typeof resolveFeaturedFromSource>[0],
): ResolvedFeaturedItem {
	return resolveFeaturedFromSource(source, issueId, catalog);
}

export async function loadDispatchCatalog() {
	const [issues, publications, theses, newsEntries, people, columns] = await Promise.all([
		getCollection('dispatch'),
		getCollection('papers'),
		getCollection('theses'),
		getCollection('news'),
		getCollection('people'),
		getCollection('dispatchColumns'),
	]);
	const pubMap = new Map(publications.map((p) => [p.id, p]));
	const thesisMap = new Map(theses.map((t) => [t.id, t]));
	const newsMap = new Map(newsEntries.map((h) => [h.id, h]));
	const columnMap = new Map(columns.map((c) => [c.id, c]));
	const authorSlugLookup = buildPublicationAuthorSlugLookup(people);
	const labKeys = buildLabAuthorKeySet(people);
	return { issues, pubMap, thesisMap, newsMap, columnMap, authorSlugLookup, labKeys };
}

export function resolveDispatchIssue(
	issue: CollectionEntry<'dispatch'>,
	catalog: Awaited<ReturnType<typeof loadDispatchCatalog>>,
): ResolvedDispatchIssue {
	const { pubMap, thesisMap, newsMap, columnMap, authorSlugLookup, labKeys } = catalog;
	const d = issue.data;
	const id = issue.id;

	const featuredCatalog: FeaturedCatalog = {
		pubMap,
		thesisMap,
		newsMap,
		authorSlugLookup,
	};

	const featuredPaperRef = findFeaturedPublicationRef(d, id);
	const featuredPaper = featuredPaperRef
		? resolveSectionFeatured(featuredCatalog, id, {
				section: 'papers',
				slug: featuredPaperRef.slug,
				blurb: featuredPaperRef.blurb,
			})
		: undefined;

	findFeaturedActivityRow(d, id);

	const featuredDistinctionRow = findFeaturedDistinctionRow(d, id);
	const featuredDistinction = featuredDistinctionRow?.highlight
		? resolveSectionFeatured(featuredCatalog, id, {
				section: 'distinctions',
				slug: featuredDistinctionRow.highlight,
				blurb: featuredDistinctionRow.blurb ?? featuredDistinctionRow.text,
			})
		: undefined;

	const featuredThesisRef = findFeaturedThesisRef(d, id);
	const featuredThesis = featuredThesisRef
		? resolveSectionFeatured(featuredCatalog, id, {
				section: 'theses',
				slug: featuredThesisRef.slug,
				blurb: featuredThesisRef.blurb,
			})
		: undefined;

	const papers = d.papers
		.map(normalizePublicationRef)
		.filter((ref) => !ref.featured)
		.map((ref, i) => {
			const entry = assertSlug(`papers[${i}]`, ref.slug, pubMap, id);
			return resolvePublication(entry, authorSlugLookup, labKeys);
		});

	const theses = (d.theses ?? [])
		.map(normalizeThesisRef)
		.filter((ref) => !ref.featured)
		.map((ref, i) => {
			const entry = assertSlug(`theses[${i}]`, ref.slug, thesisMap, id);
			return resolveThesis(entry, authorSlugLookup, labKeys);
		})
		.sort(compareDispatchThesesOrder);

	const homepageHighlights: ResolvedHomepageHighlight[] = (d.homepageHighlights ?? []).map((item, i) => {
		let title = item.label ?? item.kind;
		let meta: string | undefined;
		let href: string | undefined;
		let coverImageSrc: string | undefined;
		let coverImagePosition: string | undefined;
		if (item.publication) {
			const pub = assertSlug(`homepageHighlights[${i}].publication`, item.publication, pubMap, id);
			title = pub.data.title;
			meta = pub.data.authors.slice(0, 3).join(' · ') + ` · ${publicationVenueAbbrev(pub.data)} ${pub.data.year}`;
			href = siteHref(`/papers/${pub.id}/`);
			const paperPhoto = resolvePublicationPresenterPhotoPublicHref(pub.id);
			if (paperPhoto) {
				coverImageSrc = siteHref(paperPhoto);
			} else if (pub.data.presenter) {
				const slug = slugForPublicationAuthor(pub.data.presenter, authorSlugLookup);
				const peoplePhoto = slug ? resolvePeoplePhotoPublicHref(slug) : undefined;
				if (peoplePhoto) coverImageSrc = siteHref(peoplePhoto);
			}
		} else if (item.column) {
			const column = assertSlug(`homepageHighlights[${i}].column`, item.column, columnMap, id);
			title = column.data.headline;
			meta =
				column.data.byline?.trim() ||
				column.data.sourceLabel?.trim() ||
				(column.data.published
					? formatCalendarDateLongMonth(column.data.published)
					: undefined);
			href = siteHref(`/dispatch/issues/${id}/#column-${column.id}`);
			if (column.data.coverImage) {
				coverImageSrc = siteHref(column.data.coverImage);
				coverImagePosition = column.data.coverImagePosition?.trim() || undefined;
			}
		} else if (item.highlight) {
			const news = assertSlug(`homepageHighlights[${i}].highlight`, item.highlight, newsMap, id);
			title = news.data.title;
			meta = formatCalendarDateLongMonth(news.data.date);
			href = siteHref(`/news/${news.id}/`);
			if (news.data.coverImage) {
				coverImageSrc = siteHref(news.data.coverImage);
				coverImagePosition = news.data.coverImagePosition?.trim() || undefined;
			}
		}
		return {
			kind: item.kind,
			label: item.label ?? item.kind,
			tagTone: item.tagTone ?? 'neutral',
			title,
			meta,
			href,
			coverImageSrc,
			coverImagePosition,
		};
	});

	const readingList: ResolvedReadingItem[] = (d.readingList ?? []).map((item, i) => {
		if (item.publication) {
			const pub = assertSlug(`readingList[${i}].publication`, item.publication, pubMap, id);
			return {
				title: pub.data.title,
				authorsLine: pub.data.authors.join(', '),
				venueLine: formatPublicationVenueLine(pub.data),
				why: item.why,
				url: item.url ?? pub.data.paperUrl,
				href: siteHref(`/papers/${pub.id}/`),
			};
		}
		return {
			title: item.title ?? 'Untitled',
			authorsLine: item.authors,
			venueLine: item.venue,
			why: item.why,
			url: item.url,
			href: item.url,
		};
	});

	const activityNews = resolveActivityItems(d.activityNews, newsMap, id);

	const distinctions = resolveDistinctionItems(d.distinctions ?? [], newsMap, id);
	const columns = resolveDispatchColumns(d.columns, columnMap, id);

	return {
		entry: issue,
		id,
		featuredPaper,
		featuredDistinction,
		featuredThesis,
		papers,
		theses,
		homepageHighlights,
		readingList,
		activityNews,
		distinctions,
		columns,
		heroVisual: pickHeroVisual(id, d.heroVisual),
		issueHref: siteHref(`/dispatch/issues/${id}/`),
		counts: {
			papers: d.papers.length,
			theses: (d.theses ?? []).length,
			distinctions: (d.distinctions ?? []).length,
			columns: d.columns.length,
		},
	};
}
