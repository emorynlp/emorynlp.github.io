/**
 * Writes each profile markdown body from frontmatter: bold display name plus Emory-only degree
 * clauses grouped by degree level (undergraduate, then masters, then doctorate/postdoc), then chronological
 * within each tier (so `BS` is named before `MS` in combined programs and similar cases). Bios show full `endTerm` when
 * set (e.g. Spring 2026), else `endYear`, else `(in progress)` while ongoing. `startTerm` also aids sort.
 * The profile Education list is year-only (`[slug].astro`) — keep `endYear` populated for that.
 * When frontmatter lists `afterEmory`, append ` **After Emory:** …` to the same paragraph (`[slug].astro` also renders it as its own section).
 *
 * Display-name rules mirror `src/lib/peopleDisplayName.ts` (keep in sync).
 *
 * Set `composeBio: false` in frontmatter to skip this file so hand-edited markdown bodies are never overwritten.
 *
 * Usage: node scripts/compose-people-bios.mjs  |  npm run people:bios
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '../src/content/people');

/** Authoritative calendar year from site maintainer tooling (fallback: runtime year). */
const NOW_YEAR =
	typeof process.env.PEOPLE_BIO_YEAR === 'string' && /^\d{4}$/.test(process.env.PEOPLE_BIO_YEAR)
		? parseInt(process.env.PEOPLE_BIO_YEAR, 10)
		: new Date().getFullYear();

function parseCurrentUncertainFalse(fm) {
	const m = fm.match(/^current:\s*(true|false)\s*$/m);
	if (!m) return true;
	return m[1] === 'true';
}

/** When false, leave the markdown body unchanged (manual bio). Defaults to true when omitted. */
function parseComposeBio(fm) {
	const m = fm.match(/^composeBio:\s*(true|false)\s*$/m);
	if (!m) return true;
	return m[1] === 'true';
}

function fmScalar(fm, key) {
	const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
	return m ? trimYamlScalar(m[1]) : undefined;
}

function parseName(fm) {
	return fmScalar(fm, 'name') ?? '';
}

function parseAliases(fm) {
	const block = fm.match(/^aliases:\s*\n((?:\s+-\s+.+\n?)+)/m);
	if (!block) return [];
	const out = [];
	for (const line of block[1].split('\n')) {
		const m = line.match(/^\s+-\s+(.+)$/);
		if (m) out.push(trimYamlScalar(m[1]));
	}
	return out;
}

/**
 * @typedef {{ degree: string; institution?: string; startTerm?: string; endTerm?: string; ongoing?: boolean; endYear?: number; notes?: string }} EduEntry
 * @returns {EduEntry[]}
 */
function parseEducationEntries(fm) {
	const anchor = fm.match(/\neducation:\s*\n/);
	if (!anchor) return [];
	const lines = fm.slice(anchor.index + anchor[0].length).split('\n');
	const entries = [];
	let i = 0;
	while (i < lines.length) {
		const line = lines[i];
		if (!line.trim()) {
			i++;
			continue;
		}
		if (/^[A-Za-z][\w-]*:\s*(?:#.*)?$/.test(line) || /^[A-Za-z][\w-]*:\s+\S/.test(line)) {
			break;
		}
		const dm = line.match(/^\s+-\s+degree:\s*(.+)$/);
		if (dm) {
			const entry = { degree: trimYamlScalar(dm[1]) };
			i++;
			while (i < lines.length) {
				const L = lines[i];
				if (!L.trim()) {
					i++;
					continue;
				}
				if (/^\s+-\s+degree:/.test(L)) break;
				if (/^[A-Za-z][\w-]*:\s/.test(L) && !/^\s/.test(L)) break;
				let m2;
				if ((m2 = L.match(/^\s+institution:\s*(.+)$/))) entry.institution = trimYamlScalar(m2[1]);
				else if ((m2 = L.match(/^\s+startTerm:\s*(.+)$/))) entry.startTerm = trimYamlScalar(m2[1]);
				else if ((m2 = L.match(/^\s+endTerm:\s*(.+)$/))) entry.endTerm = trimYamlScalar(m2[1]);
				else if (/^\s+ongoing:\s+true\s*$/.test(L)) entry.ongoing = true;
				else if ((m2 = L.match(/^\s+endYear:\s*(\d+)/))) entry.endYear = parseInt(m2[1], 10);
				else if ((m2 = L.match(/^\s+notes:\s*(.+)$/))) entry.notes = trimYamlScalar(m2[1]);
				i++;
			}
			entries.push(entry);
			continue;
		}
		i++;
	}
	return entries;
}

function trimYamlScalar(s) {
	let t = s.trim();
	if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
		t = t.slice(1, -1).replace(/''/g, "'");
	}
	return t;
}

/**
 * Every `afterEmory:` block in FM (line-based: last bullet often has no trailing newline before `---`).
 */
function parseAfterEmory(fm) {
	const lines = fm.replace(/\r\n/g, '\n').split('\n');
	const bullets = [];
	for (let i = 0; i < lines.length; i++) {
		const keyLine = lines[i].trimEnd();
		if (!/^afterEmory:\s*(\[\])?\s*$/.test(keyLine)) continue;
		if (/afterEmory:\s*\[\]\s*$/.test(keyLine)) continue;
		let j = i + 1;
		for (; j < lines.length; j++) {
			const raw = lines[j];
			const L = raw.trimEnd();
			if (/^afterEmory:/i.test(L.trim())) {
				i = j - 1;
				break;
			}
			if (
				(/^[A-Za-z][\w-]*:\s*(?:#.*)?$/.test(raw) || /^[A-Za-z][\w-]*:\s+\S/.test(raw)) &&
				!/^\s/.test(raw)
			) {
				break;
			}
			if (!L.trim()) continue;
			const bm = raw.match(/^\s+-\s+(.+)$/);
			if (!bm) break;
			bullets.push(trimYamlScalar(bm[1]));
		}
		i = j - 1;
	}
	return dedupePreserveOrder(bullets);
}

function dedupePreserveOrder(strings) {
	const seen = new Set();
	const out = [];
	for (const raw of strings) {
		const s = raw.trim();
		if (!s || seen.has(s)) continue;
		seen.add(s);
		out.push(s);
	}
	return out;
}

/** Approximate term start for chronological ordering (`Fall YYYY`, `Spring YYYY`, …). */
function termStartApproxMs(term) {
	if (!term || typeof term !== 'string') return null;
	const m = term.trim().match(/^(Fall|Spring|Summer|Winter)\s+(\d{4})\s*$/i);
	if (!m) return null;
	const season = m[1].toLowerCase();
	const y = Number(m[2]);
	const monthDay = /** @type {const} */ ({
		winter: [0, 2],
		spring: [1, 1],
		summer: [6, 1],
		fall: [8, 1],
	}[season]);
	if (monthDay == null) return null;
	return Date.UTC(y, monthDay[0], monthDay[1]);
}

/** Sort key ascending: completed entries by approximate end term/year; ongoing entries keyed by cohort start term or sorted last. */
function entryChronoSortKey(e) {
	if (e.ongoing) {
		const sms = e.startTerm?.trim() ? termStartApproxMs(e.startTerm) : null;
		return sms != null ? sms : Number.POSITIVE_INFINITY;
	}
	const endMs = e.endTerm?.trim() ? termStartApproxMs(e.endTerm) : null;
	if (endMs != null) return endMs;
	if (e.endYear != null) return Date.UTC(e.endYear, 11, 31);
	const startFallback = e.startTerm?.trim() ? termStartApproxMs(e.startTerm) : null;
	return startFallback != null ? startFallback : 0;
}

/** Undergrad before masters before doctorate before postdoctoral; within each tier, chronological. */
function sortEducationBioOrder(entries) {
	return [...entries].sort((a, b) => {
		const ba = degreeLevelBand(a.degree);
		const bb = degreeLevelBand(b.degree);
		if (ba !== bb) return ba - bb;
		return entryChronoSortKey(a) - entryChronoSortKey(b);
	});
}

/**
 * Fallback: attach profile `startTerm` to a lone ongoing Emory row missing `startTerm`
 * when the listing marks `current`.
 */
function applyProfileStartTermToOngoingEmory(emoryDegrees, personStartTerm, isCurrentMember) {
	if (!isCurrentMember || !personStartTerm?.trim()) return;
	const ongoingEmory = emoryDegrees.filter((e) => e.ongoing && isEmoryInstitution(e.institution));
	if (ongoingEmory.length !== 1) return;
	const row = ongoingEmory[0];
	if (row.startTerm?.trim()) return;
	row.startTerm = personStartTerm.trim();
}

function formatDisplayName(name, aliases) {
	const n = (name ?? '').trim();
	const nameWords = n.split(/\s+/).filter(Boolean);
	if (!n || nameWords.length < 2 || !aliases?.length) return n;

	const lastNorm = nameWords[nameWords.length - 1].toLowerCase();

	for (const alias of aliases) {
		const raw = alias.trim();
		const aw = raw.split(/\s+/).filter(Boolean);
		if (aw.length < 2) continue;

		const aliasLast = aw[aw.length - 1].toLowerCase();
		if (aliasLast !== lastNorm) continue;

		const aFirst = aw[0];
		const nFirst = nameWords[0];
		const sameLegalFirst = aFirst.toLowerCase() === nFirst.toLowerCase();
		const abbreviatedFirst = aFirst.length <= 2 && /^\w\.?$/.test(aFirst);

		if (sameLegalFirst || abbreviatedFirst) continue;

		const rest = nameWords.slice(1).join(' ');
		return `${nFirst} (${aFirst}) ${rest}`;
	}

	const firstAlt = aliases[0].trim();
	if (!firstAlt || firstAlt.toLowerCase() === n.toLowerCase()) return n;

	const fw = firstAlt.split(/\s+/).filter(Boolean);
	const altLastNorm = fw.length >= 2 ? fw[fw.length - 1].toLowerCase() : '';
	const isSameFamilyExpansion = fw.length >= 2 && altLastNorm === lastNorm;
	if (isSameFamilyExpansion) return n;

	return `${n} (${firstAlt})`;
}

function formatNotes(notes) {
	if (!notes) return '';
	return ` (${notes})`;
}

function isPostdocish(degree) {
	return /postdoc|postdoctoral/i.test(degree);
}

/** @param {string} degree */
function degreeLevelBand(degree) {
	const d = (degree ?? '').trim();
	if (isPostdocish(d)) return 3;
	if (/^(PhD|Ph\.D\.|D\.Phil|Doctor of|M\.D\.|J\.D\.|JD\b|MD\b|Ed\.?D\.?)\b/i.test(d)) return 2;
	if (/^(MS|M\.S\.|MA|M\.A\.|MBA|MEng|M\.Eng\.|MFA|MPhil|M\.Phil\.)\b/i.test(d)) return 1;
	if (/^(BS\+MS)\b|^BS\s*\+\s*MS\b/i.test(d)) return 0;
	if (/^(BS|B\.S\.|BA|B\.A\.|BBA|BSE|BE\b|BEng|B\.Eng\.|AB\b|SB\b)\b/i.test(d)) return 0;
	return 1;
}

function humanizePostdocDegree(degree) {
	let d = degree.trim();
	if (/^Postdoc\s+in\s+/i.test(d)) d = d.replace(/^Postdoc\s+in\s+/i, 'postdoctoral training in ');
	return d.charAt(0).toLowerCase() + d.slice(1);
}

/** Indefinite article for common Emory degree strings (MS, MA, ME, PhD, BS, …). */
function withArticle(degree) {
	const d = degree.trim();
	if (/^(MS\b|MA\b|MEng\b|MBA\b|M\.S\.|M\.A\.|ME\b|M\.E\.)/i.test(d)) return `an ${d}`;
	return `a ${d}`;
}

/** Composed bio: full completion term when `endTerm` is set; otherwise year; ongoing uses `endTerm` if present. */
function timingParen(e) {
	const et = e.endTerm?.trim();
	if (e.ongoing) {
		if (et) return ` (${et})`;
		return ` (in progress)`;
	}
	if (et) return ` (${et})`;
	if (e.endYear != null) return ` (${e.endYear})`;
	return '';
}

/**
 * @param {EduEntry} e
 * @returns {string}
 */
function oneDegreeClause(e) {
	const inst = e.institution ?? 'Emory University';
	const note = formatNotes(e.notes);
	const deg = e.degree.trim();
	const timeSuffix = timingParen(e);

	if (isPostdocish(deg)) {
		const hd = humanizePostdocDegree(deg);
		if (e.ongoing) return `is completing ${hd} at ${inst}${timeSuffix}${note}`;
		return `completed ${hd} at ${inst}${timeSuffix}${note}`;
	}
	if (e.ongoing) {
		return `is pursuing ${withArticle(deg)} at ${inst}${timeSuffix}${note}`;
	}
	if (e.endYear != null && e.endYear > NOW_YEAR) {
		return `is expected to complete ${withArticle(deg)} at ${inst}${timeSuffix}${note}`;
	}
	if (e.endYear != null && e.endYear === NOW_YEAR) {
		return `is completing ${withArticle(deg)} at ${inst}${timeSuffix}${note}`;
	}
	if (e.endYear != null || e.endTerm?.trim())
		return `earned ${withArticle(deg)} from ${inst}${timeSuffix}${note}`;
	return `studied ${withArticle(deg)} at ${inst}${timeSuffix}${note}`;
}

/**
 * @param {EduEntry[]} entries chronological (already sorted)
 * @returns {string[]}
 */
function degreeClauses(entries) {
	if (entries.length === 2) {
		const [a, b] = entries;
		if (
			!a.ongoing &&
			!b.ongoing &&
			!isPostdocish(a.degree) &&
			!isPostdocish(b.degree) &&
			a.endYear != null &&
			a.endYear === b.endYear &&
			a.endYear <= NOW_YEAR &&
			a.institution &&
			a.institution === b.institution &&
			!a.notes &&
			!b.notes &&
			!a.startTerm?.trim() &&
			!a.endTerm?.trim() &&
			!b.startTerm?.trim() &&
			!b.endTerm?.trim()
		) {
			return [
				`earned ${withArticle(a.degree.trim())} and ${withArticle(b.degree.trim())} from ${a.institution} (${a.endYear})`,
			];
		}
	}
	return entries.map(oneDegreeClause);
}

function joinClauses(clauses) {
	if (clauses.length === 0) return '';
	if (clauses.length === 1) return clauses[0];
	if (clauses.length === 2) return `${clauses[0]}, and ${clauses[1]}`;
	return `${clauses.slice(0, -1).join('; ')}; and ${clauses[clauses.length - 1]}`;
}

function formatTermRange(startTerm, endTerm) {
	if (startTerm && endTerm) return `${startTerm}–${endTerm}`;
	if (endTerm) return endTerm;
	if (startTerm) return startTerm;
	return '';
}

/** Bios mention Emory-affiliated credentials only (full education list stays in frontmatter/UI). */
function isEmoryInstitution(inst) {
	const t = (inst ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
	if (!t) return false;
	if (t === 'emory university') return true;
	if (t.startsWith('emory ')) return true;
	return /\bemory\b/u.test(t) && /\b(university|college|school of medicine)\b/u.test(t);
}

function credentialsParagraph(
	displayName,
	educationEntriesAll,
	role,
	startTerm,
	endTerm,
	isCurrentMember,
) {
	if (!displayName) return '';

	const emoryRaw = educationEntriesAll.filter((e) => isEmoryInstitution(e.institution)).map((e) => ({ ...e }));
	applyProfileStartTermToOngoingEmory(emoryRaw, startTerm, isCurrentMember);
	const emoryDegrees = sortEducationBioOrder(emoryRaw);

	if (emoryDegrees.length) {
		const inner = joinClauses(degreeClauses(emoryDegrees));
		return `**${displayName}** ${inner}.`;
	}

	const range = formatTermRange(startTerm, endTerm);
	const r = role?.trim();

	if (r && range) return `**${displayName}** was at Emory as ${r} (${range}).`;
	if (r && educationEntriesAll.length === 0) return `**${displayName}** was at Emory as ${r}.`;

	if (educationEntriesAll.length && r) {
		return isCurrentMember
			? `**${displayName}** is ${r} at Emory University.`
			: `**${displayName}** was at Emory as ${r}.`;
	}

	if (r) return `**${displayName}** was at Emory as ${r}.`;

	return `**${displayName}** collaborated with Emory NLP.`;
}

/** Append departmental “where next” lines to the credential paragraph. */
function appendAfterEmoryToBio(bio, afterLines) {
	const phrases = dedupePreserveOrder(afterLines.map((s) => s.trim()).filter(Boolean));
	if (!phrases.length) return bio.trim();
	const stripped = phrases.map((s) => s.replace(/\.\s*$/, ''));
	let chain = stripped[0];
	for (let i = 1; i < stripped.length; i++) {
		chain += i === stripped.length - 1 ? `; and ${stripped[i]}` : `; then ${stripped[i]}`;
	}
	return `${bio.trim()} **After Emory:** ${chain}.`;
}

for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).sort()) {
	const raw = fs.readFileSync(path.join(DIR, file), 'utf8');
	const fmEnd = raw.indexOf('\n---\n', 4);
	if (fmEnd === -1) throw new Error(`Missing frontmatter end: ${file}`);
	const fm = raw.slice(4, fmEnd);
	const outFront = raw.slice(0, fmEnd + 5);

	if (!parseComposeBio(fm)) {
		console.error(`Skipped ${file} (composeBio: false)`);
		continue;
	}

	const isCurrentMember = parseCurrentUncertainFalse(fm);
	const name = parseName(fm);
	const aliases = parseAliases(fm);
	const displayName = formatDisplayName(name, aliases);
	const educationEntries = parseEducationEntries(fm);
	const role = fmScalar(fm, 'role');
	const startTerm = fmScalar(fm, 'startTerm');
	const endTerm = fmScalar(fm, 'endTerm');

	const creds = credentialsParagraph(
		displayName,
		educationEntries,
		role,
		startTerm,
		endTerm,
		isCurrentMember,
	);

	const afterEmoryLines = parseAfterEmory(fm);
	const composed = appendAfterEmoryToBio(creds, afterEmoryLines);

	fs.writeFileSync(path.join(DIR, file), `${outFront}${composed.trim()}\n`);
}

console.error(`Composed bios for ${fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).length} people markdown files.`);
