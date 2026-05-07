/** One achievement row from people frontmatter (subset of fields). */
export type AchievementDisplayInput = {
	title: string;
	when?: string | undefined;
	issuer?: string | undefined;
};

/**
 * Headline, optional awarding body, and optional timing note for profile lists.
 * Prefer explicit `when` / `issuer` in frontmatter; otherwise dates may be split from `title` heuristically.
 */
export function achievementHeadlineAndNote(a: AchievementDisplayInput): {
	headline: string;
	issuer: string | null;
	note: string | null;
} {
	const issuer = a.issuer?.trim() || null;
	const explicitWhen = a.when?.trim();
	if (explicitWhen) {
		return { headline: a.title.trim(), issuer, note: explicitWhen };
	}
	const split = splitAchievementTitleForDisplay(a.title);
	return { headline: split.headline, issuer, note: split.note };
}

/**
 * Split `title` into a headline and an optional trailing when/date note.
 * Matches the last `(...)`: only if inner text looks like ISO-ish dates / terms used in profiles
 * (`mm/yyyy`, ranges with `~`, year or year span, Dean's List / honor list style semesters).
 */
export function splitAchievementTitleForDisplay(title: string): { headline: string; note: string | null } {
	const t = title.trim();
	const m = t.match(/^(.*)\s*\(([^()]*)\)\s*$/);
	if (!m) return { headline: t, note: null };
	const inner = m[2].trim();
	if (!achievementNoteLooksLikeWhen(inner)) return { headline: t, note: null };
	return { headline: m[1].trim(), note: inner };
}

function achievementNoteLooksLikeWhen(s: string): boolean {
	if (!s) return false;
	// mm/yyyy or mm/yyyy ~ mm/yyyy
	if (/^\d{2}\/\d{4}(\s*~\s*\d{2}\/\d{4})?$/.test(s)) return true;
	// single year e.g. (2023)
	if (/^\d{4}$/.test(s)) return true;
	// year span — hyphen or en dash
	if (/^\d{4}\s*[-–\u2013]\s*\d{4}$/.test(s)) return true;
	// Dean's List style: 2022 Fall, 2023 Spring, …
	if (/^\d{4}\s+(?:Fall|Spring)(?:\s*,\s*\d{4}\s+(?:Fall|Spring))*$/.test(s)) return true;
	// Honor / Dean's lists: Fall 2020, Spring 2019, …
	if (/^(?:Fall|Spring)\s+\d{4}(?:\s*,\s*(?:Fall|Spring)\s+\d{4})*$/.test(s)) return true;
	return false;
}
