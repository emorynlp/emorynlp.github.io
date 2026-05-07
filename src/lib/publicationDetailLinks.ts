/** ACL Anthology canonical paper page (`…/id/`) for venue fallback when `paperUrl` points at ACL hosts. */

export type PublicationPaperFields = {
	paperUrl?: string;
};

function normalizeAclPaperPageUrl(href: string): string | undefined {
	try {
		const u = new URL(href);
		if (u.hostname !== 'aclanthology.org' && u.hostname !== 'www.aclanthology.org') {
			return undefined;
		}
		let path = u.pathname.replace(/^\/+|\/+$/g, '');
		if (!path) return undefined;
		if (path.endsWith('.pdf')) {
			path = path.slice(0, -4);
		}
		if (path.endsWith('.bib')) {
			path = path.slice(0, -4);
		}
		return `https://aclanthology.org/${path}/`;
	} catch {
		return undefined;
	}
}

/** ACL landing (`https://aclanthology.org/…/`) when `paperUrl` is an anthology URL/path; ignores DOIs and other hosts. */
export function resolveAclPaperLandingPage(d: PublicationPaperFields): string | undefined {
	const raw = d.paperUrl?.trim();
	if (!raw) return undefined;
	return normalizeAclPaperPageUrl(raw);
}

/**
 * Href shown as “Paper”: ACL `.pdf`/`.bib` anthology URLs normalize to the abstract page;
 * DOI/arXiv/etc. stay verbatim.
 */
export function canonicalPublicationPaperHref(raw?: string): string | undefined {
	const trimmed = raw?.trim();
	if (!trimmed) return undefined;
	const aclLanding = normalizeAclPaperPageUrl(trimmed);
	return aclLanding ?? trimmed;
}
