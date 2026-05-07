export type PublicationListingFields = {
	venue: string;
	venueAbbrev?: string;
	year: number;
	/** When set, `/publications/` sort uses this (UTC); see `publicationSortInstant`. */
	published?: Date;
	/** Accepted / in press — omitted `published` is OK; sort uses end of `year`. */
	forthcoming?: boolean;
	publicationType?: 'conference' | 'journal' | 'preprint' | 'workshop' | 'other';
	masthead?: string;
	mastheadTopics?: string[];
	abstract?: string;
	dek?: string;
};

export type PublicationListingKind =
	| 'conference'
	| 'journal'
	| 'preprint'
	| 'workshop'
	| 'other';

/**
 * Venue type for styling / rail label. Uses `publicationType` when set,
 * otherwise light heuristics on `venue` text.
 */
export function publicationListingKind(d: PublicationListingFields): PublicationListingKind {
	const t = d.publicationType;
	if (t === 'conference' || t === 'journal' || t === 'preprint' || t === 'workshop' || t === 'other') {
		return t;
	}
	const v = d.venue;
	if (/workshop\b|Workshops?\b|\b[I]JCNLP\b.*[Ww]orkshop/i.test(v)) {
		return 'workshop';
	}
	if (
		/\bJournal of\b|The Lancet\b|JAMIA\b|\bIEEE\b\s+Journal\b|TACL|^Transactions\b|Nature\b.*\(|Cell\b.*\(|\bACM\b\s+.+Transactions/i.test(v)
	) {
		return 'journal';
	}
	if (/arXiv\b|bioRxiv\b|medRxiv\b|ChemRxiv\b|Preprint\b/i.test(v)) {
		return 'preprint';
	}
	if (/Proceedings of|^Conference\b|Congress\b|Symposium on\b/i.test(v)) {
		return 'conference';
	}
	return 'other';
}

export function publicationListingKindShortLabel(kind: PublicationListingKind): string {
	switch (kind) {
		case 'conference':
			return 'CONF';
		case 'journal':
			return 'JRNL';
		case 'workshop':
			return 'WS';
		case 'preprint':
			return 'PRE';
		default:
			return 'META';
	}
}

/** Short venue label for the listing rail (e.g. ACL, TACL, ACL·F). */
export function publicationVenueAbbrev(
	d: Pick<PublicationListingFields, 'venue' | 'publicationType' | 'venueAbbrev'>,
): string {
	const override = d.venueAbbrev?.trim();
	if (override) {
		return override;
	}
	const v = d.venue.trim();
	if (/ACL[\s\S]{0,140}Findings/i.test(v) || /\):\s*Findings/i.test(v)) {
		return 'ACL·F';
	}
	if (/\bACL\b/i.test(v)) {
		return 'ACL';
	}
	if (/\bEACL\b/i.test(v)) {
		return 'EACL';
	}
	if (/\bEMNLP\b/i.test(v)) {
		return 'EMNLP';
	}
	if (/\bNAACL\b/i.test(v)) {
		return 'NAACL';
	}
	if (/TACL/i.test(v)) {
		return 'TACL';
	}
	if (/JAMIA/i.test(v)) {
		return 'JAMIA';
	}
	if (/HeaLing/i.test(v)) {
		return 'Heal';
	}
	if (/NeurIPS|NIPS\b/i.test(v)) {
		return 'NeurIPS';
	}
	if (/arXiv/i.test(v)) {
		return 'arXiv';
	}
	if (/\bICLR\b/i.test(v)) {
		return 'ICLR';
	}
	if (/\bICML\b/i.test(v)) {
		return 'ICML';
	}
	if (/\bAAAI\b/i.test(v)) {
		return 'AAAI';
	}
	if (/\bCOLING\b/i.test(v)) {
		return 'COLING';
	}
	const ac = v.match(/\b[A-Z]{2,}(?:[+&\-][A-Z]{2,})?\b/g);
	if (ac && ac.length > 0) {
		const first = ac[0]!;
		return first.length > 12 ? `${first.slice(0, 10)}…` : first;
	}
	const kind =
		d.publicationType === 'journal'
			? 'JRN'
			: d.publicationType === 'workshop'
				? 'WS'
				: d.publicationType === 'preprint'
					? 'PRE'
					: 'PUB';
	return kind;
}

/** Lowercase string for client-side filtering: title, full venue, and badge acronym (explicit or inferred). */
export function publicationSearchHaystack(
	d: Pick<PublicationListingFields, 'venue' | 'venueAbbrev' | 'publicationType'> & { title: string },
): string {
	const abbrev = publicationVenueAbbrev(d);
	const parts = [d.title, d.venue, abbrev].map((s) => String(s).trim()).filter(Boolean);
	return parts.join(' ').toLowerCase().replace(/\s+/g, ' ');
}

/** Full citation-style venue on listings (below title, before authors). */
export function formatPublicationVenueLine(d: Pick<PublicationListingFields, 'venue' | 'year'>): string {
	return `${d.venue}, ${d.year}`;
}

/**
 * Listing teaser: uses `dek` frontmatter when set.
 * Otherwise, if `abstract` exists, shows the first sentence (split at `.!?` + space),
 * or trims to ~280 chars with an ellipsis when there is no sentence break.
 */
export function publicationDek(d: Pick<PublicationListingFields, 'dek' | 'abstract'>): string | undefined {
	if (d.dek?.trim()) {
		return d.dek.trim();
	}
	const a = d.abstract?.trim();
	if (!a) {
		return undefined;
	}
	const parts = a.split(/(?<=[.!?])\s+/);
	const first = parts[0];
	if (first && first.length <= 320) {
		return first;
	}
	return a.length <= 320 ? a : `${a.slice(0, 280).trimEnd()}…`;
}

/**
 * Listing sort timestamp (newer first).
 * - `forthcoming`: end of `year` UTC (ranks after same-year items with a concrete `published` date).
 * - else `published` if valid
 * - else Jan 1 UTC of `year`
 */
export function publicationSortInstant(d: PublicationListingFields): number {
	if (d.forthcoming) {
		return Date.UTC(d.year, 11, 31, 23, 59, 59, 999);
	}
	const p = d.published;
	if (p instanceof Date && !Number.isNaN(p.getTime())) return p.getTime();
	return Date.UTC(d.year, 0, 1);
}
