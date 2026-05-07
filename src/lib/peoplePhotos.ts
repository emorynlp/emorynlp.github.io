import fs from 'node:fs';
import path from 'node:path';

const EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const;

/**
 * Resolves `public/people/{slug}.{ext}` if present, otherwise returns `explicit` when set
 * (path under site root, e.g. `/people/foo.jpg`).
 */
export function resolvePeoplePhotoPublicHref(slug: string, explicit?: string | null): string | undefined {
	const trimmed = explicit?.trim();
	if (trimmed) return trimmed;
	const dir = path.join(process.cwd(), 'public', 'people');
	if (!fs.existsSync(dir)) return undefined;
	for (const ext of EXTS) {
		const file = path.join(dir, `${slug}${ext}`);
		if (fs.existsSync(file)) return `/people/${slug}${ext}`;
	}
	return undefined;
}
