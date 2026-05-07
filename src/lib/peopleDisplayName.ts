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
