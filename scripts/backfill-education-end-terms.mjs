/**
 * Adds `endTerm` on Emory-only education rows when missing so composed bios show full terms
 * (e.g. Spring 2026). Heuristics:
 * - Completed (`!ongoing`, `endYear` set): `Spring ${endYear}` (canonical Emory commencement).
 * - Single ongoing Emory row, no row `endTerm`: copy profile-level `endTerm` if present and term-like.
 * Education list UI stays year-only (`endYear`).
 *
 * Run: node scripts/backfill-education-end-terms.mjs
 * Then: npm run people:bios
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '../src/content/people');

function fmScalar(fm, key) {
	const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
	return m ? trimYamlScalar(m[1]) : undefined;
}

function trimYamlScalar(s) {
	let t = s.trim();
	if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
		t = t.slice(1, -1).replace(/''/g, "'");
	}
	return t;
}

/** @typedef {{ degree: string; institution?: string; startTerm?: string; endTerm?: string; ongoing?: boolean; endYear?: number; notes?: string }} EduEntry */
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

function isEmoryInstitution(inst) {
	const t = (inst ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
	if (!t) return false;
	if (t === 'emory university') return true;
	if (t.startsWith('emory ')) return true;
	return /\bemory\b/u.test(t) && /\b(university|college|school of medicine)\b/u.test(t);
}

function yamlValue(s) {
	const t = String(s);
	if (/[:#'"\n]|^\s|\s$/u.test(t) || t === 'true' || t === 'false') {
		return `"${t.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
	}
	return t;
}

function serializeEducation(entries) {
	const out = ['education:'];
	for (const e of entries) {
		out.push(`  - degree: ${yamlValue(e.degree)}`);
		out.push(`    institution: ${yamlValue(e.institution ?? '')}`);
		if (e.startTerm) out.push(`    startTerm: ${yamlValue(e.startTerm)}`);
		if (e.endTerm) out.push(`    endTerm: ${yamlValue(e.endTerm)}`);
		if (e.endYear != null) out.push(`    endYear: ${e.endYear}`);
		if (e.ongoing) out.push('    ongoing: true');
		if (e.notes != null && e.notes !== '') out.push(`    notes: ${yamlValue(e.notes)}`);
	}
	return out.join('\n');
}

function looksLikeAcademicTerm(s) {
	return /^(Fall|Spring|Summer|Winter)\s+\d{4}\s*$/i.test(s.trim());
}

function applyEndTermBackfill(entries, profileEndTerm) {
	const emory = entries.filter((e) => isEmoryInstitution(e.institution));
	const ongoingEmory = emory.filter((e) => e.ongoing);

	for (const e of entries) {
		if (!isEmoryInstitution(e.institution)) continue;
		if (e.endTerm?.trim()) continue;

		if (e.ongoing) {
			if (ongoingEmory.length === 1 && profileEndTerm?.trim() && looksLikeAcademicTerm(profileEndTerm)) {
				e.endTerm = profileEndTerm.trim();
			}
			continue;
		}

		if (e.endYear != null) {
			e.endTerm = `Spring ${e.endYear}`;
		}
	}
}

function replaceEducationInFm(fm, newEducationYaml) {
	const lines = fm.split('\n');
	const eduIdx = lines.findIndex((l) => /^education:\s*$/.test(l));
	if (eduIdx === -1) return fm;

	let endExclusive = eduIdx + 1;
	while (endExclusive < lines.length) {
		const l = lines[endExclusive];
		if (/^[A-Za-z_][\w-]*:\s/.test(l)) break;
		endExclusive++;
	}

	const before = lines.slice(0, eduIdx);
	const after = lines.slice(endExclusive);
	const mid = newEducationYaml.split('\n');
	return [...before, ...mid, ...after].join('\n');
}

let changed = 0;
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).sort()) {
	const fullPath = path.join(DIR, file);
	const raw = fs.readFileSync(fullPath, 'utf8');
	const fmEnd = raw.indexOf('\n---\n', 4);
	if (fmEnd === -1) continue;
	const fm = raw.slice(4, fmEnd);
	const body = raw.slice(fmEnd + 5);

	const entries = parseEducationEntries(fm);
	if (entries.length === 0) continue;

	const before = JSON.stringify(entries.map((e) => e.endTerm ?? null));
	const profileEndTerm = fmScalar(fm, 'endTerm');
	applyEndTermBackfill(entries, profileEndTerm);
	const after = JSON.stringify(entries.map((e) => e.endTerm ?? null));

	if (before === after) continue;

	const newFm = replaceEducationInFm(fm, serializeEducation(entries));
	const out = `---\n${newFm}\n---\n${body.trim()}\n`;
	fs.writeFileSync(fullPath, out);
	changed++;
	console.error(`${file}`);
}

console.error(`Backfilled endTerm on ${changed} files.`);
