/**
 * 1. Fix glued frontmatter delimiter after a double-quoted scalar: `"..."---` → `"...\\n---`.
 * 2. Remove orphaned `  - "quoted"` YAML list items appearing immediately before any `afterEmory:` heading.
 *
 * Usage: node scripts/fix-orphan-before-after-emory.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PEOPLE_DIR = path.join(__dirname, '../src/content/people');

/** Orphan bullets leaked into `education` (or adjacent) ahead of each `afterEmory:` section. */
function removeQuotedBulletsBeforeAfterEmoryHeading(fm) {
	let out = fm;
	let prev;
	do {
		prev = out;
		out = out.replace(/\n(?:\s{2}-\s"(?:[^"\\]|\\.)*"\s*)+(?=\nafterEmory:)/g, '\n');
	} while (out !== prev);
	return out;
}

let n = 0;
for (const file of fs.readdirSync(PEOPLE_DIR).filter((f) => f.endsWith('.md'))) {
	const fp = path.join(PEOPLE_DIR, file);
	const original = fs.readFileSync(fp, 'utf8');
	const rawGluedFixed = original.replace(/("(?:[^"\\]|\\.)*)---(\s*\r?\n)/g, '$1\n---$2');
	const m = rawGluedFixed.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!m) {
		console.warn(`Bad frontmatter: ${file}`);
		continue;
	}
	let fmClean = removeQuotedBulletsBeforeAfterEmoryHeading(m[1].replace(/\r\n/g, '\n'));
	const outRaw = `---\n${fmClean}\n---\n${m[2]}`;
	if (fmClean !== m[1].replace(/\r\n/g, '\n') || rawGluedFixed !== original) {
		fs.writeFileSync(fp, outRaw);
		n++;
	}
}
console.error(`Rewrote ${n} people files (glue + orphaned YAML bullets).`);
