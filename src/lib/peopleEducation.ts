/** One degree or comparable qualification on a people profile. */

export type PersonEducationEntry = {
	degree: string;
	institution: string;
	/** Optional; composed-bio chronological sort; not shown on the Education list. */
	startTerm?: string;
	/** Optional; composed-bio wording (full term) when set; Education list still shows `endYear` only. */
	endTerm?: string;
	/** Graduation/completion calendar year — higher values sort earlier (reverse chronological). */
	endYear?: number;
	/** In progress — sorts with other ongoing entries ahead of dated completions within the same “open” band. */
	ongoing?: boolean;
	/** Location (country), cohort, honors, etc. shown after the institution line. */
	notes?: string;
};

/** Lower means further back in time / less recent (after sorting descending). */
function educationSortRank(entry: PersonEducationEntry): number {
	if (entry.ongoing) {
		return Number.POSITIVE_INFINITY;
	}
	if (entry.endYear != null && Number.isFinite(entry.endYear)) {
		return entry.endYear;
	}
	return Number.NEGATIVE_INFINITY;
}

/**
 * Stable reverse-chronological order: newest completions first;
 * **`ongoing: true`** before entries with missing **`endYear`** without **`ongoing`**.
 */
export function sortEducationReverseChronological(entries: PersonEducationEntry[]): PersonEducationEntry[] {
	return [...entries].sort((a, b) => {
		const rb = educationSortRank(b);
		const ra = educationSortRank(a);
		if (rb !== ra) return rb - ra;
		return 0;
	});
}
