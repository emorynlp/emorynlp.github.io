/**
 * Copies for thesis home affiliation: doctoral degrees are conferred through Laney's
 * doctoral program in CS+Informatics; MS and undergrad work is listed under departmental units.
 */

export type ThesisAwardingRow = { label: string; value: string };

function isDoctoralDegree(degree: string): boolean {
	return degree === 'PhD' || degree === 'Dissertation';
}

/** Label + short value shown in thesis detail meta grid. */
export function thesisAwardingUnitRow(
	degree: string,
	department: string | undefined,
): ThesisAwardingRow | undefined {
	const raw = department?.trim();
	if (!raw) {
		return undefined;
	}

	if (isDoctoralDegree(degree)) {
		const value = /computer science\s+and\s+informatics/i.test(raw)
			? 'Computer Science and Informatics'
			: raw;
		return {
			label: 'Program',
			value,
		};
	}

	return {
		label: 'Department',
		value: raw === 'Computer Science' ? 'Department of Computer Science' : raw,
	};
}

/** One-line muted text on thesis index cards (PhD vs department line). */
export function thesisAwardingSubtitle(degree: string, department: string | undefined): string | undefined {
	const row = thesisAwardingUnitRow(degree, department);
	if (!row) {
		return undefined;
	}

	if (isDoctoralDegree(degree)) {
		const raw = (department ?? '').trim();
		if (/computer science\s+and\s+informatics/i.test(raw)) {
			return 'Program in Computer Science and Informatics';
		}
		return `Program in ${raw}`;
	}

	return row.value;
}

/** Undergrad honors-style thesis entries carry optional `honorsLevel` on the thesis record. */
export function thesisDegreeSupportsHonorsLevel(degree: string): boolean {
	return (
		degree === 'Undergraduate Honors' ||
		degree === 'Undergraduate Thesis' ||
		degree === 'BS' ||
		degree === 'BA'
	);
}

/** Short work-type line on `/people/{slug}/` (not degree/term details). */
export function thesisPeoplePageWorkLabel(degree: string): string {
	if (isDoctoralDegree(degree)) return 'PhD Dissertation';
	if (degree === 'MS' || degree === 'Masters Thesis') return 'MS Thesis';
	if (thesisDegreeSupportsHonorsLevel(degree)) return 'Honors Thesis';
	return 'Thesis';
}

function pluralizeThesisSectionTitle(singular: string): string {
	switch (singular) {
		case 'PhD Dissertation':
			return 'PhD Dissertations';
		case 'MS Thesis':
			return 'MS Theses';
		case 'Honors Thesis':
			return 'Honors Theses';
		default:
			return 'Theses';
	}
}

/** Section `<h2>` on `/people/{slug}/`: specific title when all entries share one work type. */
export function thesisPeopleSectionHeading(degrees: string[]): string {
	if (degrees.length === 0) return 'Theses & dissertations';

	const labels = degrees.map((deg) => thesisPeoplePageWorkLabel(deg));
	const uniq = [...new Set(labels)];
	if (uniq.length !== 1) {
		return 'Theses & dissertations';
	}
	const singular = uniq[0]!;
	return degrees.length === 1 ? singular : pluralizeThesisSectionTitle(singular);
}
