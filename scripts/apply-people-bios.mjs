/**
 * Overwrites markdown body (below frontmatter) for each profile from `peopleBioMapPart*.mjs`.
 * Run: node scripts/apply-people-bios.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { peopleBioMapPart1 } from './peopleBioMapPart1.mjs';
import { peopleBioMapPart2 } from './peopleBioMapPart2.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'src/content/people');

const BIOS = { ...peopleBioMapPart1, ...peopleBioMapPart2 };

const missing = [];

for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.md'))) {
	const slug = file.replace(/\.md$/, '');
	const bio = BIOS[slug];
	if (bio === undefined) {
		missing.push(slug);
		continue;
	}
	const full = fs.readFileSync(path.join(DIR, file), 'utf8');
	if (!full.startsWith('---\n')) throw new Error(`No frontmatter: ${file}`);
	const end = full.indexOf('\n---\n', 4);
	if (end === -1) throw new Error(`Unclosed frontmatter: ${file}`);
	const fmBlock = full.slice(0, end + 5);
	const out = `${fmBlock}${bio.trimEnd()}\n`;
	fs.writeFileSync(path.join(DIR, file), out);
}

if (missing.length) {
	console.error('Missing bios for:', missing.join(', '));
	process.exit(1);
}

const count = fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).length;
console.error(`Updated ${count} people markdown bodies.`);
