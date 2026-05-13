/**
 * For highlights labeled `achievements`, set `url: '/highlights/{id}/'` on the matching
 * achievement row in `src/content/people/{slug}.md` (or add a row if none match).
 *
 * Run: node scripts/link-people-achievements-to-highlight-urls.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const HL = path.join(ROOT, 'src/content/highlights');
const PEOPLE = path.join(ROOT, 'src/content/people');

function hasAchievementsLabel(raw) {
	const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!m) return false;
	return /\n  - achievements\r?\n/.test(m[1]);
}

function frontmatterDate(raw) {
	const m = raw.match(/^date:\s*['"]?([^'"\n]+)['"]?/m);
	return m ? m[1].trim().slice(0, 10) : '';
}

function whenFromIsoDate(iso) {
	const d = String(iso).slice(0, 10);
	const [y, mo] = d.split('-');
	if (!y || !mo) return '';
	return `${mo.padStart(2, '0')}/${y}`;
}

function norm(s) {
	return String(s)
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.replace(/[''"]/g, "'")
		.trim();
}

/** @returns {{ before: string, body: string, after: string } | null} */
function splitAchievements(front) {
	const lines = front.split(/\r?\n/);
	const ai = lines.findIndex((l) => /^achievements:\s*$/.test(l));
	if (ai === -1) return null;
	let end = ai + 1;
	while (end < lines.length) {
		const l = lines[end];
		if (l === '') {
			end++;
			continue;
		}
		// Achievement list items are indented with 2+ spaces; top-level keys are not.
		if (!l.startsWith('  ')) break;
		end++;
	}
	const before = lines.slice(0, ai).join('\n');
	const body = lines.slice(ai + 1, end).join('\n');
	const after = lines.slice(end).join('\n');
	return { before, body, after };
}

/** @returns { { raw: string, title: string, url: string | null }[] } */
function parseAchievementItems(body) {
	if (!body.trim()) return [];
	const items = [];
	const chunks = body.split(/\n(?=  - title:)/);
	for (const ch of chunks) {
		if (!ch.trim()) continue;
		const t = ch.match(/^\s*- title:\s*(.+)$/m);
		if (!t) continue;
		let title = t[1].trim();
		if ((title.startsWith('"') && title.endsWith('"')) || (title.startsWith("'") && title.endsWith("'")))
			title = title.slice(1, -1);
		const urlM = ch.match(/^\s*url:\s*['"]?([^'"\n]+)['"]?/m);
		items.push({ raw: ch, title, url: urlM ? urlM[1].trim() : null });
	}
	return items;
}

function titlesMatch(achTitle, want) {
	const a = norm(achTitle);
	const w = norm(want);
	if (!w) return false;
	if (a === w) return true;
	if (a.includes(w) || w.includes(a)) return true;
	if (a.replace(/'/g, '') === w.replace(/'/g, '')) return true;
	if (w.includes('challenge 3') && a.includes('challenge 3')) return true;
	if (w.includes('challenge 4') && a.includes('challenge 4')) return true;
	if (w.includes('phd in computer science') && (a.includes('phd') || a.includes('doctor'))) return true;
	if (w.includes('innovation of the year') && a.includes('innovation of the year')) return true;
	return false;
}

function setUrlOnItemRaw(itemRaw, url) {
	if (/^\s*url:\s/m.test(itemRaw)) {
		return itemRaw.replace(/^\s*url:\s*[^\n]+/m, `    url: '${url}'`);
	}
	return itemRaw.replace(/\s*$/, '') + `\n    url: '${url}'`;
}

function yamlQuoteTitle(s) {
	if (!s) return '""';
	if (!/['"\n]/.test(s)) return `'${s}'`;
	return JSON.stringify(s);
}

/**
 * @returns { { slug: string, matchTitle: string }[] }
 */
function extractLinks(raw, highlightId) {
	const body = raw.replace(/^---[\s\S]*?---\s*/, '');
	const out = [];
	const seen = new Set();

	function add(slug, matchTitle) {
		const k = `${slug}|${matchTitle}`;
		if (seen.has(k)) return;
		seen.add(k);
		out.push({ slug, matchTitle });
	}

	const headerRe = /#{3,4}\s+\[[^\]]*\]\(\/people\/([a-z0-9-]+)\/\)\s*/g;
	let hm;
	while ((hm = headerRe.exec(body)) !== null) {
		const slug = hm[1];
		const rest = body.slice(hm.index + hm[0].length);
		const nextH = rest.search(/\n#{3,4}\s+\[/);
		const chunk = nextH === -1 ? rest : rest.slice(0, nextH);
		const honor = chunk.match(/-\s*((?:Highest|High )?Honor in [^\n]+)/i);
		if (honor) add(slug, honor[1].trim());
		else if (highlightId.includes('doctor-of-philosophy')) add(slug, 'PhD in Computer Science and Informatics');
	}

	const listRe = /-\s*\[[^\]]*\]\(\/people\/([a-z0-9-]+)\/\)[^\n:]*:\s*([^\n]+)/g;
	let lm;
	while ((lm = listRe.exec(body)) !== null) {
		add(lm[1], lm[2].trim());
	}

	if (/alexa-prize/i.test(highlightId)) {
		const teamRe = /-\s*\[[^\]]*\]\(\/people\/([a-z0-9-]+)\/\)\s*\([^)]+\)/g;
		let tm;
		while ((tm = teamRe.exec(body)) !== null) {
			if (highlightId.includes('20200804') || highlightId.includes('winner'))
				add(tm[1], 'Alexa Prize Socialbot Grand Challenge 3');
			else add(tm[1], 'Alexa Prize Socialbot Grand Challenge 4');
		}
	}

	if (/professor-of-the-year/.test(highlightId)) {
		const jm = body.match(/\/people\/(jinho-choi)\//);
		if (jm) add(jm[1], 'Professor of the Year Award');
	}

	if (/innovation-of-the-year/.test(highlightId)) {
		const ir = /\/people\/([a-z0-9-]+)\//g;
		let im;
		while ((im = ir.exec(body)) !== null) {
			add(im[1], 'Innovation of the Year Award');
		}
	}

	return out;
}

function applyPatch(slug, highlightId, matchTitle, whenStr) {
	const file = path.join(PEOPLE, `${slug}.md`);
	if (!fs.existsSync(file)) {
		console.warn(`missing people ${slug}`);
		return false;
	}
	const raw = fs.readFileSync(file, 'utf8');
	const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!m) return false;
	const front = m[1];
	const rest = raw.slice(m[0].length);
	const url = `/highlights/${highlightId}/`;

	const split = splitAchievements(front);
	const newItem = `  - title: ${yamlQuoteTitle(matchTitle)}\n    when: '${whenStr}'\n    url: '${url}'`;

	if (!split) {
		const insert = `\nachievements:\n${newItem}\n`;
		const edu = front.search(/\n(?:education|footerPhoto):/);
		const nf = edu === -1 ? front + insert : front.slice(0, edu) + insert + front.slice(edu);
		fs.writeFileSync(file, `---\n${nf}\n---${rest}`, 'utf8');
		console.log(`+section ${slug} <- ${highlightId}`);
		return true;
	}

	const items = parseAchievementItems(split.body);
	let hit = false;
	let changed = false;
	const rebuilt = items.map((it) => {
		if (!titlesMatch(it.title, matchTitle)) return it.raw;
		hit = true;
		if (it.url === url) return it.raw;
		changed = true;
		return setUrlOnItemRaw(it.raw, url);
	});

	if (changed) {
		const newBody = rebuilt.join('\n');
		const nf = `${split.before}\nachievements:\n${newBody}\n${split.after}`;
		fs.writeFileSync(file, `---\n${nf}\n---${rest}`, 'utf8');
		console.log(`~url ${slug} <- ${highlightId}`);
		return true;
	}

	if (!hit) {
		const newBody = `${newItem}\n${split.body}`.replace(/\n+$/, '') + (split.body ? '\n' : '');
		const nf = `${split.before}\nachievements:\n${newBody}${split.after ? `\n${split.after}` : ''}`;
		fs.writeFileSync(file, `---\n${nf}\n---${rest}`, 'utf8');
		console.log(`+row ${slug} <- ${highlightId} (${matchTitle.slice(0, 48)})`);
		return true;
	}

	return false;
}

const files = fs.readdirSync(HL).filter((f) => f.endsWith('.md'));
let patches = 0;
for (const f of files.sort()) {
	const raw = fs.readFileSync(path.join(HL, f), 'utf8');
	if (!hasAchievementsLabel(raw)) continue;
	const id = f.replace(/\.md$/, '');
	const date = frontmatterDate(raw);
	const whenStr = whenFromIsoDate(date) || date;

	for (const { slug, matchTitle } of extractLinks(raw, id)) {
		if (applyPatch(slug, id, matchTitle, whenStr)) patches++;
	}
}
console.log(`Done. ${patches} write(s).`);
