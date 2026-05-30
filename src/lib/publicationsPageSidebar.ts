import type { CollectionEntry } from 'astro:content';
import { publicationAuthorGroupKey, slugForPublicationAuthor } from './publicationAuthorLinks';
import {
	publicationListingKind,
	publicationVenueAbbrev,
	type PublicationListingKind,
} from './publicationListing';
import { resolvePeoplePhotoPublicHref } from './peoplePhotos';
import { publicAssetUrl, siteHref } from './siteHref';

export type PublicationsChartBucket = 'journal' | 'conference' | 'workshopDemoPreprint';

export type YearlyPublicationStack = {
	year: number;
	journal: number;
	conference: number;
	workshopDemoPreprint: number;
	total: number;
};

export type SidebarAuthorPaper = {
	title: string;
	href: string;
	year: number;
	railAbbrev: string;
};

export type SidebarAuthorRow = {
	displayName: string;
	groupKey: string;
	slug?: string;
	photoHref?: string;
	count: number;
	papers: SidebarAuthorPaper[];
};

function kindToChartBucket(kind: PublicationListingKind): PublicationsChartBucket {
	switch (kind) {
		case 'journal':
			return 'journal';
		case 'conference':
			return 'conference';
		case 'workshop':
		case 'preprint':
		case 'other':
		default:
			return 'workshopDemoPreprint';
	}
}

export function publicationChartBucketLabel(bucket: PublicationsChartBucket): string {
	switch (bucket) {
		case 'journal':
			return 'Journals';
		case 'conference':
			return 'Conferences';
		case 'workshopDemoPreprint':
			return 'Workshops / demos / preprints';
	}
}

function pickCanonicalDisplayName(prev: string, next: string): string {
	const a = prev.trim();
	const b = next.trim();
	if (!a) return b;
	if (!b) return a;
	if (b.length > a.length) return b;
	return a;
}

/**
 * Per-year stacked counts and author index for the `/papers/` sidebar.
 */
export function buildPublicationsSidebarModel(
	papers: CollectionEntry<'papers'>[],
	authorSlugLookup: Map<string, string>,
	people: CollectionEntry<'people'>[],
): {
	years: YearlyPublicationStack[];
	totalsByBucket: Record<PublicationsChartBucket, number>;
	authors: SidebarAuthorRow[];
} {
	const photoHrefBySlug = new Map<string, string | undefined>();
	for (const p of people) {
		const raw = resolvePeoplePhotoPublicHref(p.id, p.data.photo);
		photoHrefBySlug.set(p.id, raw ? publicAssetUrl(raw) : undefined);
	}

	const byYear = new Map<number, YearlyPublicationStack>();
	const totalsByBucket: Record<PublicationsChartBucket, number> = {
		journal: 0,
		conference: 0,
		workshopDemoPreprint: 0,
	};

	type AuthorAcc = {
		displayName: string;
		papers: SidebarAuthorPaper[];
	};
	const byAuthorKey = new Map<string, AuthorAcc>();

	for (const entry of papers) {
		const d = entry.data;
		const kind = publicationListingKind(d);
		const bucket = kindToChartBucket(kind);

		let row = byYear.get(d.year);
		if (!row) {
			row = {
				year: d.year,
				journal: 0,
				conference: 0,
				workshopDemoPreprint: 0,
				total: 0,
			};
			byYear.set(d.year, row);
		}
		row[bucket] += 1;
		row.total += 1;
		totalsByBucket[bucket] += 1;

		const href = siteHref(`/papers/${entry.id}/`);
		const railAbbrev = publicationVenueAbbrev(d);

		for (const rawName of d.authors) {
			const gk = publicationAuthorGroupKey(rawName);
			if (!gk) continue;
			let acc = byAuthorKey.get(gk);
			if (!acc) {
				acc = { displayName: rawName.trim(), papers: [] };
				byAuthorKey.set(gk, acc);
			}
			acc.displayName = pickCanonicalDisplayName(acc.displayName, rawName);
			acc.papers.push({
				title: d.title,
				href,
				year: d.year,
				railAbbrev,
			});
		}
	}

	const filledYears: YearlyPublicationStack[] = [];
	if (byYear.size > 0) {
		const ys = [...byYear.keys()];
		const yMin = Math.min(...ys);
		const yMax = Math.max(...ys);
		for (let y = yMin; y <= yMax; y++) {
			filledYears.push(
				byYear.get(y) ?? {
					year: y,
					journal: 0,
					conference: 0,
					workshopDemoPreprint: 0,
					total: 0,
				},
			);
		}
	}
	const years = filledYears;

	const authors: SidebarAuthorRow[] = [...byAuthorKey.entries()].map(([groupKey, acc]) => {
		const uniq = dedupeSidebarPapers(acc.papers);
		const slug = slugForPublicationAuthor(acc.displayName, authorSlugLookup);
		const photoHref = slug ? photoHrefBySlug.get(slug) : undefined;
		return {
			displayName: acc.displayName,
			groupKey,
			slug,
			photoHref,
			count: uniq.length,
			papers: uniq.sort((p, q) => q.year - p.year || p.title.localeCompare(q.title)),
		};
	});

	authors.sort((a, b) => b.count - a.count || a.displayName.localeCompare(b.displayName));

	return { years, totalsByBucket, authors };
}

function dedupeSidebarPapers(papers: SidebarAuthorPaper[]): SidebarAuthorPaper[] {
	const seen = new Set<string>();
	const out: SidebarAuthorPaper[] = [];
	for (const p of papers) {
		const k = `${p.href}`;
		if (seen.has(k)) continue;
		seen.add(k);
		out.push(p);
	}
	return out;
}

export type StackedBarSvgModel = {
	viewW: number;
	viewH: number;
	bars: { year: number; x: number; w: number; segments: { y: number; h: number; bucket: PublicationsChartBucket }[] }[];
	yTicks: { y: number; label: string }[];
};

const CHART_COLORS: Record<PublicationsChartBucket, string> = {
	journal: '#0d9488',
	conference: '#2563eb',
	workshopDemoPreprint: '#7c3aed',
};

export function stackedBarSvgModel(
	years: YearlyPublicationStack[],
	opts?: { viewW?: number; viewH?: number },
): { model: StackedBarSvgModel; colors: typeof CHART_COLORS } {
	const viewW = opts?.viewW ?? 280;
	const viewH = opts?.viewH ?? 168;
	const padL = 6;
	const padR = 36;
	const padT = 6;
	const padB = 28;

	if (years.length === 0) {
		return {
			model: { viewW, viewH, bars: [], yTicks: [] },
			colors: CHART_COLORS,
		};
	}

	const innerW = viewW - padL - padR;
	const innerH = viewH - padT - padB;
	const maxY = Math.max(...years.map((y) => y.total), 1);
	const n = years.length;
	const gap = Math.min(6, innerW / (n * 6));
	const barW = Math.max(4, (innerW - gap * (n - 1)) / n);

	const bars: StackedBarSvgModel['bars'] = [];
	for (let i = 0; i < n; i++) {
		const yd = years[i]!;
		const x = padL + i * (barW + gap);
		const scale = innerH / maxY;
		const totalH = yd.total * scale;
		const baseY = padT + innerH - totalH;

		const segs: { y: number; h: number; bucket: PublicationsChartBucket }[] = [];
		let accH = 0;
		const stackOrder: PublicationsChartBucket[] = ['conference', 'journal', 'workshopDemoPreprint'];
		for (const bucket of stackOrder) {
			const c = yd[bucket];
			if (c <= 0) continue;
			const h = c * scale;
			segs.push({ y: baseY + accH, h, bucket });
			accH += h;
		}

		bars.push({ year: yd.year, x, w: barW, segments: segs });
	}

	const tickCount = 4;
	const yTicks: { y: number; label: string }[] = [];
	for (let t = 0; t <= tickCount; t++) {
		const v = Math.round((maxY * t) / tickCount);
		const y = padT + innerH - (v / maxY) * innerH;
		yTicks.push({ y, label: String(v) });
	}

	return {
		model: { viewW, viewH, bars, yTicks },
		colors: CHART_COLORS,
	};
}
