import { getCollection } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';

/** Dispatch issue ids from disk when the content store is empty (e.g. dev before sync). */
export function dispatchIssueSlugsFromDisk(): string[] {
	const dir = path.join(process.cwd(), 'src/content/dispatch');
	if (!fs.existsSync(dir)) return [];
	return fs
		.readdirSync(dir)
		.filter((name) => name.endsWith('.md'))
		.map((name) => name.slice(0, -'.md'.length))
		.sort();
}

/** Issue slugs for static paths — prefers the content collection, falls back to filenames. */
export async function listDispatchIssueSlugs(): Promise<string[]> {
	const issues = await getCollection('dispatch');
	if (issues.length > 0) {
		return issues.map((entry) => entry.id);
	}
	return dispatchIssueSlugsFromDisk();
}
