/**
 * Rename seminar slides to weekly-meetings convention and upload to Google Drive.
 *
 * Filename: YYYYMMDD-Firstname_Lastname.pdf
 * Multiple speakers: YYYYMMDD-First1_Last1-First2_Last2.pdf (order preserved)
 *
 * Target folder (weekly-meetings):
 *   https://drive.google.com/drive/folders/1cs1k978XpBH8PCAmR0tHyYYUMLfc2anG
 *
 * Usage:
 *   node scripts/upload-seminar-slides.mjs path/to/slides.pdf --date 2025-04-11 --speaker "Grace Byun"
 *   node scripts/upload-seminar-slides.mjs deck.pdf --date 20210408 --speakers "Mack Hutsell,Daniil Huryn"
 *   node scripts/upload-seminar-slides.mjs deck.pdf --date 2025-04-11 --speaker "Grace Byun" --dry-run
 *
 * Upload requires rclone with a Drive remote (see .cursor/skills/add-seminar/SKILL.md).
 * Set RCLONE_REMOTE (default: gdrive) and optionally RCLONE_DRIVE_FOLDER_ID.
 */
import { execFileSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FOLDER_ID = '1cs1k978XpBH8PCAmR0tHyYYUMLfc2anG';
const DRIVE_FOLDER_URL =
	'https://drive.google.com/drive/folders/1cs1k978XpBH8PCAmR0tHyYYUMLfc2anG';

function usage(exitCode = 1) {
	console.error(`Usage: node scripts/upload-seminar-slides.mjs <slides.pdf> --date YYYY-MM-DD --speaker "Full Name"
       node scripts/upload-seminar-slides.mjs <slides.pdf> --date YYYYMMDD --speakers "A,B"

Options:
  --date       Seminar date (required)
  --speaker    One presenter (mutually exclusive with --speakers)
  --speakers   Comma-separated presenters (first speaker used for filename segments)
  --dry-run    Print target name and commands only; do not copy or upload
  --no-upload  Rename/copy locally only (writes next to input as the canonical name)

Env:
  RCLONE_REMOTE              rclone remote name (default: gdrive)
  RCLONE_DRIVE_FOLDER_ID     Drive folder ID (default: weekly-meetings folder)
`);
	process.exit(exitCode);
}

function parseArgs(argv) {
	const positional = [];
	let date = '';
	let speaker = '';
	let speakers = '';
	let dryRun = false;
	let noUpload = false;

	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--date') {
			date = argv[++i] ?? '';
		} else if (a === '--speaker') {
			speaker = argv[++i] ?? '';
		} else if (a === '--speakers') {
			speakers = argv[++i] ?? '';
		} else if (a === '--dry-run') {
			dryRun = true;
		} else if (a === '--no-upload') {
			noUpload = true;
		} else if (a.startsWith('-')) {
			console.error(`Unknown option: ${a}`);
			usage();
		} else {
			positional.push(a);
		}
	}

	const inputPath = positional[0];
	if (!inputPath || !date) usage();

	const speakerList = speakers
		? speakers
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
		: speaker.trim()
			? [speaker.trim()]
			: [];

	if (speakerList.length === 0) {
		console.error('Provide --speaker or --speakers');
		usage();
	}

	return { inputPath, date, speakerList, dryRun, noUpload };
}

/** YYYY-MM-DD or YYYYMMDD → YYYYMMDD */
function normalizeDate(dateRaw) {
	const compact = dateRaw.replace(/\D/g, '');
	if (compact.length !== 8) {
		throw new Error(`Invalid --date "${dateRaw}" (use YYYY-MM-DD or YYYYMMDD)`);
	}
	return compact;
}

/** "Grace Byun" → Grace_Byun */
function speakerSegment(name) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) throw new Error(`Invalid speaker name: "${name}"`);
	if (parts.length === 1) return parts[0];
	const first = parts[0];
	const last = parts[parts.length - 1];
	return `${first}_${last}`;
}

function buildSlidesFilename(dateCompact, speakerList) {
	const segments = speakerList.map(speakerSegment);
	return `${dateCompact}-${segments.join('-')}.pdf`;
}

function hasRclone() {
	try {
		execFileSync('rclone', ['version'], { stdio: 'pipe' });
		return true;
	} catch {
		return false;
	}
}

function rcloneRemote() {
	return process.env.RCLONE_REMOTE?.trim() || 'gdrive';
}

function folderId() {
	return process.env.RCLONE_DRIVE_FOLDER_ID?.trim() || DEFAULT_FOLDER_ID;
}

function rcloneFolderArgs() {
	return ['--drive-root-folder-id', folderId()];
}

function checkRcloneRemote(remote) {
	const probe = spawnSync('rclone', ['about', `${remote}:`, ...rcloneFolderArgs()], {
		encoding: 'utf-8',
	});
	if (probe.status === 0) return;
	const err = (probe.stderr || probe.stdout || '').trim();
	if (/empty token|config reconnect/i.test(err)) {
		throw new Error(
			`rclone remote "${remote}" is not authenticated. Run:\n  rclone config reconnect ${remote}`,
		);
	}
	throw new Error(err || `rclone remote "${remote}" is not usable`);
}

function uploadWithRclone(localFile, remoteName) {
	const remote = rcloneRemote();
	checkRcloneRemote(remote);
	const dest = `${remote}:${remoteName}`;
	const copy = spawnSync('rclone', ['copyto', localFile, dest, ...rcloneFolderArgs()], {
		stdio: 'inherit',
		encoding: 'utf-8',
	});
	if (copy.status !== 0) {
		throw new Error('rclone copyto failed');
	}
	const link = spawnSync('rclone', ['link', dest, ...rcloneFolderArgs()], { encoding: 'utf-8' });
	if (link.status === 0 && link.stdout?.trim()) {
		return link.stdout.trim();
	}
	return undefined;
}

function main() {
	const { inputPath, date, speakerList, dryRun, noUpload } = parseArgs(process.argv.slice(2));
	const resolved = path.resolve(inputPath);
	if (!fs.existsSync(resolved)) {
		console.error(`File not found: ${resolved}`);
		process.exit(1);
	}
	if (path.extname(resolved).toLowerCase() !== '.pdf') {
		console.error('Slides must be a .pdf file');
		process.exit(1);
	}

	const dateCompact = normalizeDate(date);
	const remoteName = buildSlidesFilename(dateCompact, speakerList);
	const outputPath = path.join(path.dirname(resolved), remoteName);

	console.log(`Target filename: ${remoteName}`);
	console.log(`Drive folder: ${DRIVE_FOLDER_URL}`);

	if (dryRun) {
		console.log(`Would copy: ${resolved} → ${outputPath}`);
		if (!noUpload) {
			console.log(`Would upload via rclone to remote "${rcloneRemote()}" (folder id ${folderId()})`);
		}
		return;
	}

	fs.copyFileSync(resolved, outputPath);
	console.log(`Wrote: ${outputPath}`);

	if (noUpload) {
		console.log('\nUpload manually, then set slidesUrl on the seminar entry.');
		console.log(`Folder: ${DRIVE_FOLDER_URL}`);
		return;
	}

	if (!hasRclone()) {
		console.log('\nrclone not found — upload manually:');
		console.log(`  1. Open ${DRIVE_FOLDER_URL}`);
		console.log(`  2. Upload ${remoteName}`);
		console.log('  3. Open the file → Share → Anyone with the link → Viewer');
		console.log('  4. Copy the file URL and set slidesUrl in src/content/seminars/{slug}.md');
		return;
	}

	try {
		const link = uploadWithRclone(outputPath, remoteName);
		console.log('\nUpload complete.');
		if (link) {
			console.log(`Share link (use for slidesUrl):\n${link}`);
		} else {
			console.log('Could not auto-generate link. In Drive: Share → Anyone with the link → copy URL.');
		}
	} catch (err) {
		console.error(`\nUpload failed: ${err.message}`);
		console.log('\nManual fallback:');
		console.log(`  Upload ${outputPath} to ${DRIVE_FOLDER_URL}`);
		console.log(`  Then: rclone link ${rcloneRemote()}:${remoteName} ${rcloneFolderArgs().join(' ')}`);
		process.exit(1);
	}
}

main();
