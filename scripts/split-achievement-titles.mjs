/**
 * One-time migration: splits embedded dates / issuers out of achievement `title` strings
 * into explicit `when` and `issuer` fields, and removes unnecessary YAML quoting.
 *
 * Rules:
 *   when  — last `(…)` whose inner text matches a date-like pattern (mm/yyyy, year, range, semester list)
 *   issuer — first top-level comma (outside parentheses) where the text from that point to the
 *            end contains no em-dash (—), i.e., it's a proper institution name, not part of the title.
 *            Exception: not extracted if it starts with a degree abbreviation (MS, BS, PhD, etc.)
 *
 * Usage: node scripts/split-achievement-titles.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '../src/content/people');

// ─── date detection (mirrors achievementTitleNote.ts) ───────────────────────
function looksLikeWhen(s) {
	if (!s) return false;
	if (/^\d{2}\/\d{4}(\s*~\s*\d{2}\/\d{4})?$/.test(s)) return true;          // mm/yyyy [~ mm/yyyy]
	if (/^\d{4}$/.test(s)) return true;                                          // 2023
	if (/^\d{4}\s*[-–]\s*\d{4}$/.test(s)) return true;                          // 2018–2022
	if (/^\d{4}\s+(Fall|Spring)(\s*,\s*\d{4}\s+(Fall|Spring))*$/.test(s)) return true; // 2022 Fall, …
	if (/^(Fall|Spring|Summer|Winter)\s+\d{4}(,\s*(Fall|Spring|Summer|Winter)\s+\d{4})*$/i.test(s)) return true;
	return false;
}

/** Extract the last `(inner)` from the title if it looks like a date; return { when, bare } or null. */
function extractWhen(title) {
	const m = title.match(/^([\s\S]*?)\s*\(([^()]*)\)\s*$/);
	if (!m) return null;
	const inner = m[2].trim();
	if (!looksLikeWhen(inner)) return null;
	return { when: inner, bare: m[1].trim() };
}

/** Find top-level commas (not inside balanced parentheses). */
function topLevelCommaIndices(s) {
	const indices = [];
	let depth = 0;
	for (let i = 0; i < s.length; i++) {
		if (s[i] === '(') depth++;
		else if (s[i] === ')') depth--;
		else if (s[i] === ',' && depth === 0) indices.push(i);
	}
	return indices;
}

const DEGREE_ABBREVS = /^(MS|M\.S\.|BS|B\.S\.|BA|B\.A\.|MA|M\.A\.|PhD|Ph\.D\.|ME|MBA|BBA|MFA|BFA)\b/;

/** Extract issuer: first top-level comma where text-after has no em-dash and doesn't start with a degree. */
function extractIssuer(bare) {
	const commas = topLevelCommaIndices(bare);
	for (const idx of commas) {
		const after = bare.slice(idx + 1).trim();
		if (!after) continue;
		if (/[—–]/.test(after)) continue;                  // contains em/en-dash → part of title
		if (DEGREE_ABBREVS.test(after)) continue;           // degree program → not an issuer
		if (/^[a-z]/.test(after)) continue;                 // starts lowercase → not a proper noun
		return { issuer: after, title: bare.slice(0, idx).trim() };
	}
	return null;
}

// ─── YAML serialisation helpers ─────────────────────────────────────────────
function needsYamlQuoting(value) {
	if (!value) return 'none';
	const hasDouble = value.includes('"');
	const hasSingle = value.includes("'");
	// Bare integers / floats would be parsed as numbers by YAML → must quote
	if (/^\d+(\.\d+)?$/.test(value)) return 'single';
	// Must quote if value starts with a YAML special char (incl. " and ')
	// or contains ': ' which would be misread as a mapping key
	const needsQuote = /^["'{[\|>!%@`&*?]/.test(value) || /:\s/.test(value) || value.startsWith('#');
	if (needsQuote || hasDouble) return hasSingle ? 'double' : 'single';
	if (hasSingle) return 'double';
	return 'none';
}

function yamlScalar(value) {
	const q = needsYamlQuoting(value);
	if (q === 'single') return `'${value}'`;
	if (q === 'double') return `"${value}"`;
	return value;
}

function trimYamlScalar(s) {
	const t = s.trim();
	if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
		return t.slice(1, -1).replace(/''/g, "'");
	}
	return t;
}

// ─── achievement block parser ────────────────────────────────────────────────
function parseAchievements(fm) {
	const lines = fm.split('\n');
	const anchor = lines.findIndex((l) => /^achievements:\s*$/.test(l));
	if (anchor === -1) return null;

	const achievements = [];
	let i = anchor + 1;
	let current = null;

	while (i < lines.length) {
		const line = lines[i];
		if (!line.trim()) { i++; continue; }
		// Non-indented key → end of achievements block
		if (/^[A-Za-z][\w-]*:/.test(line)) break;

		const titleM = line.match(/^\s+-\s+title:\s*(.+)$/);
		const whenM = line.match(/^\s+when:\s*(.+)$/);
		const issuerM = line.match(/^\s+issuer:\s*(.+)$/);
		const urlM = line.match(/^\s+url:\s*(.+)$/);

		if (titleM) {
			if (current) achievements.push(current);
			current = { title: trimYamlScalar(titleM[1]), when: undefined, issuer: undefined, url: undefined };
		} else if (whenM && current) {
			current.when = trimYamlScalar(whenM[1]);
		} else if (issuerM && current) {
			current.issuer = trimYamlScalar(issuerM[1]);
		} else if (urlM && current) {
			current.url = trimYamlScalar(urlM[1]);
		}
		i++;
	}
	if (current) achievements.push(current);
	return { achievements, anchorLine: anchor, endLine: i };
}

function serializeAchievements(achievements) {
	const lines = ['achievements:'];
	for (const a of achievements) {
		lines.push(`  - title: ${yamlScalar(a.title)}`);
		if (a.when) lines.push(`    when: ${yamlScalar(a.when)}`);
		if (a.issuer) lines.push(`    issuer: ${yamlScalar(a.issuer)}`);
		if (a.url) lines.push(`    url: ${yamlScalar(a.url)}`);
	}
	return lines;
}

// ─── transform one achievement ───────────────────────────────────────────────
function transformAchievement(a) {
	// If already has explicit when → just clean up the title (no re-extraction needed)
	if (a.when) return a;

	let title = a.title;
	let when;
	let issuer = a.issuer;

	// 1. Extract when from trailing (...)
	const w = extractWhen(title);
	if (w) { when = w.when; title = w.bare; }

	// 2. Extract issuer (only if not already set)
	if (!issuer) {
		const iResult = extractIssuer(title);
		if (iResult) { issuer = iResult.issuer; title = iResult.title; }
	}

	// 3. If title STILL ends with (YEAR) that is redundant with when, strip it
	if (when) {
		const leftover = extractWhen(title);
		if (leftover && /^\d{4}$/.test(leftover.when)) {
			title = leftover.bare;
		}
	}

	return { ...a, title, when, issuer };
}

// ─── main ─────────────────────────────────────────────────────────────────────
let processed = 0;

for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).sort()) {
	const fullPath = path.join(DIR, file);
	const raw = fs.readFileSync(fullPath, 'utf8');
	const fmEnd = raw.indexOf('\n---\n', 4);
	if (fmEnd === -1) continue;

	const fm = raw.slice(4, fmEnd);
	const parsed = parseAchievements(fm);
	if (!parsed) continue;

	const { achievements, anchorLine, endLine } = parsed;
	const transformed = achievements.map(transformAchievement);

	// Re-build frontmatter
	const fmLines = fm.split('\n');
	const before = fmLines.slice(0, anchorLine);
	const after = fmLines.slice(endLine);
	const newFmLines = [...before, ...serializeAchievements(transformed), ...after];

	const newContent = `---\n${newFmLines.join('\n')}\n---\n${raw.slice(fmEnd + 5)}`;
	fs.writeFileSync(fullPath, newContent);
	console.log(`Updated: ${file} (${achievements.length} achievement(s))`);
	processed++;
}

console.error(`\nDone: ${processed} files updated.`);
