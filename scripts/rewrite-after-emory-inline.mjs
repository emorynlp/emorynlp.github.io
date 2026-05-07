/**
 * One-time script: for each person with `afterEmory` frontmatter:
 *   1. Removes the `afterEmory` tag from frontmatter.
 *   2. If the body still has the old `**After Emory:** …` format, replaces it with the
 *      new sentence-style "After Emory, [Firstname] moved to [Org](url) as [role]." format.
 *   3. Adds `composeBio: false` so the bio is never overwritten by compose-people-bios.mjs.
 *
 * For files that already have the new "After Emory," format in the body, the body is preserved
 * as-is and only the frontmatter is cleaned up.
 *
 * Usage: node scripts/rewrite-after-emory-inline.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '../src/content/people');

const ORG_URLS = {
	// Companies
	Facebook: 'https://www.meta.com',
	Meta: 'https://www.meta.com',
	Google: 'https://www.google.com',
	Microsoft: 'https://www.microsoft.com',
	Amazon: 'https://www.amazon.com',
	'Amazon Web Services': 'https://aws.amazon.com',
	Epic: 'https://www.epic.com',
	'The Home Depot': 'https://www.homedepot.com',
	JustAnswer: 'https://www.justanswer.com',
	'Boston Meditech Group': null,
	Walgreens: 'https://www.walgreens.com',
	Moveworks: 'https://www.moveworks.com',
	'Baoxin Technology': null,
	"Moody's Analytics": 'https://www.moodysanalytics.com',
	Naver: 'https://www.naver.com',
	Snap: 'https://www.snap.com',
	Visa: 'https://www.visa.com',
	'Morgan Stanley': 'https://www.morganstanley.com',
	'Palantir Technologies': 'https://www.palantir.com',
	Botable: 'https://www.botable.com',
	MariGen: null,
	'KACE Company': null,
	'PricewaterhouseCoopers LLP': 'https://www.pwc.com',
	'PRGX Global': 'https://www.prgx.com',
	Tencent: 'https://www.tencent.com',
	// Emory units
	'Emory University': 'https://www.emory.edu',
	'Emory Office of Undergraduate Admission': 'https://apply.emory.edu',
	// Universities
	'Carnegie Mellon University': 'https://www.cmu.edu',
	'Stanford University': 'https://www.stanford.edu',
	'Massachusetts Institute of Technology': 'https://www.mit.edu',
	'Columbia University': 'https://www.columbia.edu',
	'Harvard University': 'https://www.harvard.edu',
	'Cornell University': 'https://www.cornell.edu',
	'Yale University': 'https://www.yale.edu',
	'Johns Hopkins University': 'https://www.jhu.edu',
	'University of Edinburgh': 'https://www.ed.ac.uk',
	'Brown University': 'https://www.brown.edu',
	'Brandeis University': 'https://www.brandeis.edu',
	'New York University': 'https://www.nyu.edu',
	'University of Chicago': 'https://www.uchicago.edu',
	'University of Pennsylvania': 'https://www.upenn.edu',
	'University of Rochester': 'https://www.rochester.edu',
	'Georgia Institute of Technology': 'https://www.gatech.edu',
	'Georgia Tech': 'https://www.gatech.edu',
	'University of Pittsburgh': 'https://www.pitt.edu',
	'University of California at Santa Cruz': 'https://www.ucsc.edu',
	'University of California, San Diego': 'https://www.ucsd.edu',
	'University of Texas at Dallas': 'https://www.utdallas.edu',
	'University of Southern California': 'https://www.usc.edu',
	'Texas A&M University': 'https://www.tamu.edu',
	'Erasmus Mundus': 'https://www.erasmusmundus.eu',
};

function orgLink(org) {
	const url = ORG_URLS[org];
	if (url) return `[${org}](${url})`;
	return org;
}

function trimYamlScalar(s) {
	let t = s.trim();
	if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
		t = t.slice(1, -1).replace(/''/g, "'");
	}
	return t;
}

function fmScalar(fm, key) {
	const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
	return m ? trimYamlScalar(m[1]) : undefined;
}

function parseName(fm) {
	return fmScalar(fm, 'name') ?? '';
}

function bioFirstName(name) {
	return name.trim().split(/\s+/)[0] ?? '';
}

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
			if (/^afterEmory:/i.test(L.trim())) { i = j - 1; break; }
			if ((/^[A-Za-z][\w-]*:\s*(?:#.*)?$/.test(raw) || /^[A-Za-z][\w-]*:\s+\S/.test(raw)) && !/^\s/.test(raw)) break;
			if (!L.trim()) continue;
			const bm = raw.match(/^\s+-\s+(.+)$/);
			if (!bm) break;
			bullets.push(trimYamlScalar(bm[1]));
		}
		i = j - 1;
	}
	// Dedupe
	const seen = new Set();
	return bullets.filter((s) => { const t = s.trim(); if (!t || seen.has(t)) return false; seen.add(t); return true; });
}

function removeAfterEmoryBlock(fm) {
	const lines = fm.split('\n');
	const out = [];
	let skip = false;
	for (const line of lines) {
		if (/^afterEmory:\s*(\[\])?\s*$/.test(line.trimEnd())) { skip = true; continue; }
		if (skip) {
			if (/^\s+-\s+/.test(line)) continue;
			skip = false;
		}
		out.push(line);
	}
	return out.join('\n');
}

function ensureComposeBioFalse(fm) {
	if (/^composeBio:\s*(true|false)\s*$/m.test(fm)) {
		return fm.replace(/^composeBio:\s*(true|false)\s*$/m, 'composeBio: false');
	}
	return fm.trimEnd() + '\ncomposeBio: false';
}

function withArticle(degree) {
	const d = degree.trim();
	if (/^(MS\b|MA\b|MEng\b|MBA\b|M\.S\.|M\.A\.|ME\b|M\.E\.)/i.test(d)) return `an ${d}`;
	return `a ${d}`;
}

function indefiniteArticle(word) {
	return /^[aeiou]/i.test(word.trim()) ? 'an' : 'a';
}

function splitAtFirstAt(line) {
	const t = line.trim().replace(/\.\s*$/, '');
	const i = t.indexOf(' at ');
	if (i === -1) return null;
	return { role: t.slice(0, i).trim(), org: t.slice(i + 4).trim() };
}

function isDegreePursuit(role) {
	return /^(PhD|Ph\.D\.|MS|M\.S\.|MA|M\.A\.|ME\b|M\.E\.|MBA|MEng|MPhil|M\.Phil\.)\b/i.test(role.trim());
}

function isPostdocRole(role) {
	return /^Postdoctoral/i.test(role.trim());
}

function isContinuingRole(role) {
	return /^Continuing\s+/i.test(role.trim());
}

function isEmoryOrg(org) {
	return /\bemory\b/i.test(org);
}

/** Generate a verb-phrase fragment (no subject) for one afterEmory line. */
function afterEmoryFragment(line) {
	const raw = line.trim().replace(/\.\s*$/, '');

	if (/^Co-Founder\s+of\s+/i.test(raw)) {
		const org = raw.replace(/^Co-Founder\s+of\s+/i, '').trim();
		return `co-founded ${orgLink(org)}`;
	}

	const split = splitAtFirstAt(raw);
	if (!split) return `went on to ${raw}`;

	const { role, org } = split;

	if (isContinuingRole(role)) {
		const prog = role.replace(/^Continuing\s+/i, '').trim();
		return `remained at ${orgLink(org)} to continue ${withArticle(prog)}`;
	}

	if (isPostdocRole(role)) {
		const area = role.replace(/^Postdoctoral training in\s+/i, '').trim();
		if (area && area !== role.trim()) {
			return `joined ${orgLink(org)} as a postdoctoral researcher in ${area}`;
		}
		return `joined ${orgLink(org)} as a postdoctoral researcher`;
	}

	if (isDegreePursuit(role)) {
		return `moved to ${orgLink(org)} to pursue ${withArticle(role)}`;
	}

	// Job title
	const jobLower = role.charAt(0).toLowerCase() + role.slice(1);
	const art = indefiniteArticle(jobLower);

	if (isEmoryOrg(org)) {
		return `joined ${orgLink(org)} as ${art} ${jobLower}`;
	}
	return `moved to ${orgLink(org)} as ${art} ${jobLower}`;
}

function buildAfterEmorySentence(firstName, afterEmoryLines) {
	const items = afterEmoryLines.map((s) => s.trim()).filter(Boolean);
	if (!items.length) return '';
	const fragments = items.map(afterEmoryFragment);
	if (fragments.length === 1) {
		return `After Emory, ${firstName} ${fragments[0]}.`;
	}
	const [first, ...rest] = fragments;
	const tail = rest.map((f) => `, then ${f}`).join('');
	return `After Emory, ${firstName} ${first}${tail}.`;
}

let processed = 0;
let skipped = 0;

for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).sort()) {
	const fullPath = path.join(DIR, file);
	const raw = fs.readFileSync(fullPath, 'utf8');
	const fmEnd = raw.indexOf('\n---\n', 4);
	if (fmEnd === -1) continue;

	let fm = raw.slice(4, fmEnd);
	const bodyRaw = raw.slice(fmEnd + 5);

	const afterEmoryLines = parseAfterEmory(fm);
	const hasOldFormat = /\*\*After Emory:\*\*/.test(bodyRaw);
	const hasNewFormat = /After Emory,/.test(bodyRaw);

	// Nothing to do if no afterEmory in frontmatter and no old-format body
	if (!afterEmoryLines.length && !hasOldFormat) {
		// Still ensure composeBio: false if new format is present in body
		if (hasNewFormat && !/^composeBio:\s*false\s*$/m.test(fm)) {
			fm = ensureComposeBioFalse(fm);
			fs.writeFileSync(fullPath, `---\n${fm}\n---\n${bodyRaw}`);
			console.log(`composeBio: false added: ${file}`);
			processed++;
		} else {
			skipped++;
		}
		continue;
	}

	const name = parseName(fm);
	const firstName = bioFirstName(name);

	let newBody = bodyRaw;

	if (hasOldFormat) {
		// Strip existing **After Emory:** suffix
		newBody = bodyRaw.replace(/\s*\*\*After Emory:\*\*[\s\S]*$/, '').trimEnd();

		// Generate new sentence from afterEmory lines in frontmatter
		const sentence = buildAfterEmorySentence(firstName, afterEmoryLines);
		if (sentence) {
			newBody = `${newBody} ${sentence}`;
		}
	}
	// If already new format: keep body as-is, just clean up frontmatter

	// Remove afterEmory from frontmatter
	fm = removeAfterEmoryBlock(fm);
	// Ensure composeBio: false
	fm = ensureComposeBioFalse(fm);

	const newContent = `---\n${fm}\n---\n${newBody.trimEnd()}\n`;
	fs.writeFileSync(fullPath, newContent);
	console.log(`Updated: ${file}`);
	processed++;
}

console.error(`\nDone: ${processed} files updated, ${skipped} skipped.`);
