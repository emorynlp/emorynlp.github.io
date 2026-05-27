/** Row accent + filter stats on theses & seminars index lists (PhD red · MS blue · undergrad green). */
export type DegreeListKind = 'phd' | 'ms' | 'undergrad' | 'other';

export function thesisDegreeKind(degree: string): DegreeListKind {
	if (degree === 'PhD' || degree === 'Dissertation') return 'phd';
	if (degree === 'MS' || degree === 'Masters Thesis') return 'ms';
	if (
		degree === 'Undergraduate Honors' ||
		degree === 'Undergraduate Thesis' ||
		degree === 'BS' ||
		degree === 'BA'
	) {
		return 'undergrad';
	}
	return 'other';
}

/** Infer degree tier from seminar slug when there is no `degree` field. */
export function seminarDegreeKind(slug: string): DegreeListKind {
	if (/^phd-|(?:^|-)phd(?:-copy)?$/.test(slug)) return 'phd';
	if (/-ms(?:-copy)?$/.test(slug)) return 'ms';
	if (
		/^honors-|^undergrad-|^bs-|(?:^|-)(?:bs|ba)(?:-copy)?$/.test(slug)
	) {
		return 'undergrad';
	}
	return 'other';
}
