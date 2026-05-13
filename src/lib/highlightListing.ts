import { plainTextFromMarkdownBody } from './newsTeaser';

/** Lowercase string for client-side filtering: title plus full Markdown body as plain text. */
export function highlightListingSearchHaystack(title: string, body: string | undefined): string {
	const parts = [title, plainTextFromMarkdownBody(body)].map((s) => String(s).trim()).filter(Boolean);
	return parts.join(' ').toLowerCase().replace(/\s+/g, ' ');
}
