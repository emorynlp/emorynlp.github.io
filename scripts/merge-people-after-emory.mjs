/**
 * Writes `afterEmory` bullets into each `src/content/people/*.md` when listed in MAP.
 * Missing slugs are untouched; empty arrays remove the field.
 *
 * Usage: node scripts/merge-people-after-emory.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PEOPLE_DIR = path.join(__dirname, '../src/content/people');

/** @type {Record<string, string[]>} slug → bullets in CV / chronological order */
const MAP = {
	'aiming-nie': [
		'MS in Symbolic Systems at Stanford University',
		'PhD in Computer Science at Stanford University',
	],
	'alexandru-rudi': ['Software Engineer at Jane Street Capital'],
	'almas-myrzatay': ['MS in Computer Science at Georgia Institute of Technology'],
	'andrew-chung': ['MS in Computer Science at Columbia University'],
	'angela-cao': [
		'MS in Linguistics at University of Edinburgh',
		'MS in Computer Science at University of Rochester',
		'PhD in Cognition and Perception at New York University',
	],
	'austin-blodgett': ['PhD in Linguistics at Georgetown University'],
	'boxin-zhao': ['MS in Computer Science at Brown University'],
	'camila-calvino': ['Urban English Linguist at KACE Company'],
	'catherine-baker': ['AI Engineer at OneStream Software'],
	'changmao-li': ['PhD in Computer Science at University of California at Santa Cruz'],
	'chen-gong': ['MS in Computer Science at Yale University'],
	'chenxi-xu': ['Software Engineer at Facebook'],
	'chloe-lee': ['MS in Business Analytics at Massachusetts Institute of Technology'],
	'daniil-huryn': ['Software Engineer at Microsoft'],
	'darin-kishore': ['Private Tech Consultant'],
	'darren-ni': ['Software Engineer at Google'],
	'donghan-lee': ['MS in Computer Science at Harvard University'],
	'ellie-paek': ['Research Assistant at Emory University'],
	'ethan-zhou': ['Software Engineer at Amazon'],
	'gary-lai': ['Co-Founder of MariGen'],
	'gregor-williamson': ['AI Chatbot Designer at JustAnswer'],
	'hang-jiang': [
		'MS in Symbolic Systems at Stanford University',
		'PhD in Media Arts & Sciences at Massachusetts Institute of Technology',
	],
	'han-he': ['Research Scientist at Amazon Web Services'],
	'haoqi-gu': ['MS in Business Analytics at Columbia University'],
	'henry-chen': ['Software Engineer at Snap'],
	'henry-gao': ['Software Engineer at Epic'],
	'jacob-choi': ['MS in Computer Science at University of Southern California'],
	'james-finch': [
		'Postdoctoral training in Conversational AI at Emory University',
		'Data Scientist at PRGX Global',
	],
	'jayeol-chun': ['PhD in Computer Science at Brandeis University'],
	'jeongrok-yu': ['MS in Computer Science at Georgia Institute of Technology'],
	'johnny-tan': ["Software Engineer at Moody's Analytics"],
	'jose-coves': ['Software Engineer at Facebook'],
	'jueun-kim': ['AI Engineer at Boston Meditech Group'],
	'junzhi-han': ['MS in Data Science at Harvard University'],
	'kaixin-ma': [
		'MS in Language Technologies at Carnegie Mellon University',
		'PhD in Language Technologies at Carnegie Mellon University',
	],
	'leah-smith': ['ME in Computer Science at Cornell University'],
	'liyan-xu': ['Research Scientist at Tencent'],
	'lindsay-hexter': ['MS in Brain and Data Science at Erasmus Mundus'],
	'lydia-feng': ['Technical Consultant at PricewaterhouseCoopers LLP'],
	'william-hutsell': ['Software Engineer at Meta'],
	'mengmei-li': ['MS in Computer Science at University of Pennsylvania'],
	'meera-hahn': ['PhD in Human-Centered Computing at Georgia Tech'],
	'michael-zhai': ['MS in Applied Mathematics and Statistics at Johns Hopkins University'],
	'michelle-kim': ['Software Engineer at Google'],
	'mutian-li': ['Research Engineer at Baoxin Technology'],
	'noah-reicin': ['Deployed Engineer at Botable'],
	'peilin-wu': ['PhD in Computer Science at University of Texas at Dallas'],
	'reid-kilgore': ['Software Engineer at Palantir Technologies'],
	'renxuan-li': ['Software Engineer at Facebook'],
	'ruixiang-qi': ['MS in Computer Science at University of California, San Diego'],
	'ran-xu': ['PhD in Computer Science at Emory University'],
	'sarah-finch': ['Research Scientist at Emory University'],
	'sayyed-zahiri': ['Data Scientist at The Home Depot'],
	'sheng-huang': ['MS in Business Analytics at Massachusetts Institute of Technology'],
	'shen-gao': ['Software Engineer at Facebook'],
	'seunghyun-lim': ['Software Engineer at Naver'],
	'talyn-fan': ['Admission Advisor at Emory Office of Undergraduate Admission'],
	'tarrek-shaban': ['Product Manager at Palantir Technologies'],
	'tomasz-jurczyk': ['Research Engineer at Moveworks'],
	'tung-dinh': ['MS in Software Engineering at Carnegie Mellon University'],
	'tyler-angert': ['ME in Technology, Innovation, and Education at Harvard University'],
	'xiangjue-dong': ['PhD in Computer Science at Texas A&M University'],
	'xinman-zhang': ['MS in Electrical and Computer Engineering at Carnegie Mellon University'],
	'xinyi-jiang': ['MS in Computational Data Science at Carnegie Mellon University'],
	'xiaoyuan-huang': ['MS in Applied Computational Science at Harvard University'],
	'yasasvi-josyula': ['Software Engineer at Visa'],
	'yingying-chen': ['MS in Management Science and Engineering at Columbia University'],
	'yutong-hu': ['Continuing BS/MS in Computer Science at Emory University'],
	'yuxin-ji': ['MA in Computational Social Science at University of Chicago'],
	'zhengzhe-yang': ['MS in Computer Science at Carnegie Mellon University'],
	'zhexiong-liu': ['PhD in Computer Science at University of Pittsburgh'],
	'zihan-wang': ['Software Engineer at Morgan Stanley'],
	'zihao-wang': ['Research Engineer at Walgreens'],
};

function stripAfterEmoryBlock(fm) {
	let out = fm.replace(/\r\n/g, '\n');
	let prev;
	do {
		prev = out;
		out = out.replace(/\nafterEmory:\s*\n(?:  -[^\n]+\n)+/g, '\n');
		out = out.replace(/\nafterEmory:\s*\[\]\s*\n/g, '\n');
		out = out.replace(/\nafterEmory:\s*\[\]\s*$/gm, '');
	} while (out !== prev);
	return out;
}

function injectAfterEmory(fm, lines) {
	const cleaned = stripAfterEmoryBlock(fm).replace(/\s+$/, '');
	if (lines.length === 0) return cleaned;
	const block =
		'\nafterEmory:\n' + lines.map((s) => `  - ${JSON.stringify(s.trim())}`).join('\n') + '\n';
	return cleaned + block;
}

let updated = 0;
for (const [slug, lines] of Object.entries(MAP)) {
	const fp = path.join(PEOPLE_DIR, `${slug}.md`);
	if (!fs.existsSync(fp)) {
		console.warn(`Skipping missing ${slug}.md`);
		continue;
	}
	const raw = fs.readFileSync(fp, 'utf8');
	const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!m) {
		console.warn(`Bad frontmatter: ${slug}`);
		continue;
	}
	const body = m[2];
	let fm = injectAfterEmory(m[1], lines);
	const next = `---\n${fm}---\n${body}`;
	if (next !== raw) {
		fs.writeFileSync(fp, next);
		updated++;
	}
}

console.error(`Merged afterEmory on ${updated} people files.`);
