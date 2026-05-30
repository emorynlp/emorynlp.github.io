/**
 * Plain-text teaser derived from Markdown body — strips common syntax and truncates.
 * Used by news listings and home news strip cards.
 */
export function plainTextFromMarkdownBody(body: string | undefined): string {
	if (!body?.trim()) return '';

	return body
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/__([^_]+)__/g, '$1')
		.replace(/\*([^*\n]+)\*/g, '$1')
		.replace(/_([^_\n]+)_/g, '$1')
		.replace(/~~([^~]+)~~/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/^[\-*+]\s+/gm, '')
		.replace(/^>\s+/gm, '')
		.trim()
		.replace(/\s+/g, ' ');
}

export function teaserFromNewsBody(body: string | undefined, maxLen = 220): string {
	const raw = plainTextFromMarkdownBody(body);
	if (!raw.length) return '';
	return raw.length > maxLen ? `${raw.slice(0, Math.max(0, maxLen - 1)).trim()}…` : raw;
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** First non-empty paragraph, skipping standalone image lines. */
function firstParagraphMarkdown(body: string): string {
	for (const block of body.split(/\n\s*\n/)) {
		const paragraph = block
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line && !/^!\[[^\]]*\]\([^)]*\)\s*$/.test(line))
			.join(' ')
			.trim();
		if (paragraph) return paragraph;
	}
	return '';
}

function cleanupPartialMarkdown(markdown: string): string {
	return markdown
		.replace(/\*\*[^*]*$/, '')
		.replace(/(?<!\*)\*(?!\*)[^*\n]*$/, '')
		.replace(/__[^_]*$/, '')
		.replace(/(?<!_)_(?!_)[^_\n]*$/, '')
		.replace(/\[[^\]]*$/, '')
		.trimEnd();
}

function truncateMarkdownForTeaser(markdown: string, maxLen: number): string {
	const plain = plainTextFromMarkdownBody(markdown);
	if (plain.length <= maxLen) return markdown;

	let low = 0;
	let high = markdown.length;
	while (low < high) {
		const mid = Math.ceil((low + high) / 2);
		if (plainTextFromMarkdownBody(markdown.slice(0, mid)).length <= maxLen) {
			low = mid;
		} else {
			high = mid - 1;
		}
	}

	return `${cleanupPartialMarkdown(markdown.slice(0, low))}…`;
}

/** Inline markdown → HTML for short teasers (bold, italic; links become formatted text only). */
function inlineMarkdownToHtml(input: string): string {
	let html = '';
	let index = 0;

	while (index < input.length) {
		const rest = input.slice(index);

		const boldMatch = rest.match(/^\*\*([^*]+)\*\*/);
		if (boldMatch) {
			html += `<strong>${escapeHtml(boldMatch[1])}</strong>`;
			index += boldMatch[0].length;
			continue;
		}

		const underlineBoldMatch = rest.match(/^__([^_]+)__/);
		if (underlineBoldMatch) {
			html += `<strong>${escapeHtml(underlineBoldMatch[1])}</strong>`;
			index += underlineBoldMatch[0].length;
			continue;
		}

		const italicMatch = rest.match(/^\*([^*\n]+)\*/);
		if (italicMatch) {
			html += `<em>${escapeHtml(italicMatch[1])}</em>`;
			index += italicMatch[0].length;
			continue;
		}

		const underlineItalicMatch = rest.match(/^_([^_\n]+)_/);
		if (underlineItalicMatch) {
			html += `<em>${escapeHtml(underlineItalicMatch[1])}</em>`;
			index += underlineItalicMatch[0].length;
			continue;
		}

		const linkMatch = rest.match(/^\[([^\]]+)\]\([^)]*\)/);
		if (linkMatch) {
			html += inlineMarkdownToHtml(linkMatch[1]);
			index += linkMatch[0].length;
			continue;
		}

		html += escapeHtml(input[index] ?? '');
		index += 1;
	}

	return html;
}

/** HTML teaser for contexts that render inline markdown (e.g. home slideshow). */
export function teaserHtmlFromNewsBody(body: string | undefined, maxLen = 220): string {
	if (!body?.trim()) return '';

	const paragraph = firstParagraphMarkdown(body.trim());
	if (!paragraph) return '';

	return inlineMarkdownToHtml(truncateMarkdownForTeaser(paragraph, maxLen));
}
