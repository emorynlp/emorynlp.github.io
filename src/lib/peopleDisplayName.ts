/**
 * Renders the public heading / bio name when `aliases` carry a preferred or alternate form.
 * - Same family name: `Yutong (Natalie) Hu`, `Grace (Sungjoo) Byun`
 * - Different family name (single alternate): `Chunyao Zhao (Timothy Xu)`
 * - Expansions like `Jinho D. Choi` vs `Jinho Choi`: keep canonical `name` only (no noisy parenthetical)
 */
export function formatPeopleProfileDisplayName(
	name: string,
	aliases: readonly string[] | undefined,
): string {
	const n = name.trim();
	const nameWords = n.split(/\s+/).filter(Boolean);
	if (!n || nameWords.length < 2 || !aliases?.length) return n;

	const lastNorm = nameWords[nameWords.length - 1]!.toLowerCase();

	for (const alias of aliases) {
		const raw = alias.trim();
		const aw = raw.split(/\s+/).filter(Boolean);
		if (aw.length < 2) continue;

		const aliasLast = aw[aw.length - 1]!.toLowerCase();
		if (aliasLast !== lastNorm) continue;

		const aFirst = aw[0]!;
		const nFirst = nameWords[0]!;
		const sameLegalFirst = aFirst.toLowerCase() === nFirst.toLowerCase();
		const abbreviatedFirst = aFirst.length <= 2 && /^\w\.?$/.test(aFirst);

		if (sameLegalFirst || abbreviatedFirst) continue;

		const rest = nameWords.slice(1).join(' ');
		return `${nFirst} (${aFirst}) ${rest}`;
	}

	const firstAlt = aliases[0]!.trim();
	if (!firstAlt || firstAlt.toLowerCase() === n.toLowerCase()) return n;

	const fw = firstAlt.split(/\s+/).filter(Boolean);
	const altLastNorm = fw.length >= 2 ? fw[fw.length - 1]!.toLowerCase() : '';

	/* Same surname: do not emit `Legal (Legal D. Expanded) Surname`. */
	const isSameFamilyExpansion = fw.length >= 2 && altLastNorm === lastNorm;
	if (isSameFamilyExpansion) return n;

	return `${n} (${firstAlt})`;
}

/**
 * Show the muted “Directory name: …” line under the profile `<h1>` only when the heading
 * does not already visibly include every whitespace-separated token from the canonical {@link name}.
 * Avoids redundancy for headings like {@code Junzhi (Molly) Han} or {@code Yutong (Natalie) Hu}.
 */
export function peopleProfileShowLegalDirectorySubtitle(
	name: string,
	displayHeading: string,
): boolean {
	const n = name.trim();
	const h = displayHeading.trim().toLowerCase();
	if (!n || n.toLowerCase() === h) return false;

	const tokens = n.split(/\s+/).filter((t) => t.length > 0);
	if (tokens.length === 0) return false;

	for (const t of tokens) {
		const needle = t.toLowerCase();
		if (!h.includes(needle)) return true;
	}
	return false;
}
