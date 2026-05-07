/**
 * Post-fix: corrects job-title casing and missing hyperlinks in generated After Emory sentences.
 * Run once after rewrite-after-emory-inline.mjs.
 *
 * Usage: node scripts/fix-after-emory-casing.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '../src/content/people');

// Additional org→URL pairs not in the original script
const EXTRA_ORG_URLS = {
	Google: 'https://www.google.com',
	'Georgetown University': 'https://www.georgetown.edu',
};

/** Per-word fixer for job title positions. */
function fixTitleWord(word) {
	// All uppercase (AI, PhD, AWS): keep
	if (/^[A-Z]{2,}$/.test(word)) return word;
	// Single letter (hyphenated rest): keep
	if (word.length === 1) return word;
	// Lowercase-start + rest all uppercase (wrongly-lowercased acronym, e.g. "aI" → "AI")
	if (/^[a-z][A-Z]+$/.test(word)) return word.toUpperCase();
	// Title Case → lowercase first char
	return word.charAt(0).toLowerCase() + word.slice(1);
}

/** Fix "as a/an TITLE[.,]" job-title casing in an After Emory sentence. */
function fixJobTitleCasing(sentence) {
	return sentence.replace(
		/\bas (a|an) ([^[\]\n]+?)([,.])/g,
		(match, art, title, punct) => {
			const fixed = title
				.trim()
				.split(/\s+/)
				.map(fixTitleWord)
				.join(' ');
			return `as ${art} ${fixed}${punct}`;
		},
	);
}

/** Add missing hyperlinks for known plain-text org names. */
function fixMissingOrgLinks(sentence) {
	for (const [org, url] of Object.entries(EXTRA_ORG_URLS)) {
		// Only replace bare org name (not already inside [...](...))
		const escaped = org.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const pattern = new RegExp(`(?<!\\[)\\b${escaped}\\b(?!\\])`, 'g');
		sentence = sentence.replace(pattern, `[${org}](${url})`);
	}
	return sentence;
}

/** Collapse multiple consecutive spaces (e.g., "moved to  [") to one. */
function fixExtraSpaces(sentence) {
	return sentence.replace(/  +/g, ' ');
}

let fixed = 0;

for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).sort()) {
	const fullPath = path.join(DIR, file);
	const raw = fs.readFileSync(fullPath, 'utf8');
	if (!/After Emory,/.test(raw)) continue;

	const fmEnd = raw.indexOf('\n---\n', 4);
	if (fmEnd === -1) continue;

	const front = raw.slice(0, fmEnd + 5);
	let body = raw.slice(fmEnd + 5);

	// Apply fixes to the After Emory sentence (last paragraph/line of body)
	const original = body;
	body = fixJobTitleCasing(body);
	body = fixMissingOrgLinks(body);
	body = fixExtraSpaces(body);

	if (body !== original) {
		fs.writeFileSync(fullPath, `${front}${body}`);
		console.log(`Fixed: ${file}`);
		fixed++;
	}
}

console.error(`\nDone: ${fixed} files fixed.`);
