import fs from 'node:fs';
import path from 'node:path';

const EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const;

/**
 * Resolves `public/papers/{slug}.{ext}` when present.
 * Used for presenter photos on `/papers/[slug]/` pages.
 */
export function resolvePublicationPresenterPhotoPublicHref(slug: string): string | undefined {
	const dir = path.join(process.cwd(), 'public', 'papers');
	if (!fs.existsSync(dir)) return undefined;

	for (const ext of EXTS) {
		const file = path.join(dir, `${slug}${ext}`);
		if (fs.existsSync(file)) return `/papers/${slug}${ext}`;
	}

	return undefined;
}

