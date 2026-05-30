/** ~2 lines / ~280 chars for Dispatch paper list teasers. */
export function dispatchExcerpt(text: string | undefined, maxLen = 280): string | undefined {
	const a = text?.trim();
	if (!a) return undefined;
	const parts = a.split(/(?<=[.!?])\s+/);
	const firstTwo = parts.slice(0, 2).join(' ');
	if (firstTwo.length <= maxLen) return firstTwo;
	if (a.length <= maxLen) return a;
	return `${a.slice(0, maxLen - 1).trimEnd()}…`;
}
