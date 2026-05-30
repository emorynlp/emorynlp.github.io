/**
 * Resizes highlight, publication, and thesis photos to a maximum of 1920 px on
 * the longest side and converts them to WebP. Edits files in-place.
 *
 * - JPG / PNG → resized with sips (if needed) → converted to WebP → original deleted
 * - WebP      → resized via dwebp → sips → cwebp (if needed); otherwise left as-is
 *
 * Directories covered by default:
 *   public/news/
 *   public/papers/
 *   public/theses/
 *
 * Usage:
 *   node scripts/resize-media-photo.mjs                          # all three dirs
 *   node scripts/resize-media-photo.mjs --dir news         # one dir by name
 *   node scripts/resize-media-photo.mjs 20260402-event-1.jpg     # one file by basename
 *   node scripts/resize-media-photo.mjs public/news/20260402-event-1.jpg  # full path
 *
 * Requires: macOS (sips) + webp tools (brew install webp)
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const MAX_SIZE = 1920;
const SUPPORTED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const DEFAULT_DIRS = ['news', 'papers', 'theses'].map((d) =>
	path.join(PUBLIC_DIR, d),
);

/** Return all supported image paths inside a directory (non-recursive). */
function photosIn(dir) {
	if (!fs.existsSync(dir)) return [];
	return fs
		.readdirSync(dir)
		.filter((f) => SUPPORTED_EXT.has(path.extname(f).toLowerCase()))
		.map((f) => path.join(dir, f));
}

/** Resolve a CLI argument to an absolute path. */
function resolveArg(arg) {
	const abs = path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg);
	if (fs.existsSync(abs)) return abs;
	// Bare filename — search all default dirs
	for (const dir of DEFAULT_DIRS) {
		const candidate = path.join(dir, path.basename(arg));
		if (fs.existsSync(candidate)) return candidate;
	}
	return null;
}

/** Read pixel dimensions via sips. Returns { width, height }. */
function getDimensions(filePath) {
	const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', filePath], {
		encoding: 'utf8',
	});
	const w = parseInt(out.match(/pixelWidth:\s*(\d+)/)?.[1] ?? '0', 10);
	const h = parseInt(out.match(/pixelHeight:\s*(\d+)/)?.[1] ?? '0', 10);
	return { width: w, height: h };
}

// Parse args: pull out --dir flags, treat the rest as file targets
const rawArgs = process.argv.slice(2);
const dirFlags = [];
const fileArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
	if (rawArgs[i] === '--dir' && rawArgs[i + 1]) {
		dirFlags.push(rawArgs[++i]);
	} else {
		fileArgs.push(rawArgs[i]);
	}
}

let targets;
if (fileArgs.length > 0) {
	targets = fileArgs.map(resolveArg);
} else if (dirFlags.length > 0) {
	const dirs = dirFlags.map((d) =>
		path.isAbsolute(d) ? d : path.join(PUBLIC_DIR, d),
	);
	targets = dirs.flatMap(photosIn);
} else {
	targets = DEFAULT_DIRS.flatMap(photosIn);
}

const WEBP_QUALITY = 85;

let resized = 0;
let converted = 0;
let skipped = 0;
let errors = 0;

for (const filePath of targets) {
	if (!filePath || !fs.existsSync(filePath)) {
		console.error(`Not found: ${filePath ?? '(null)'}`);
		errors++;
		continue;
	}

	const ext = path.extname(filePath).toLowerCase();
	if (!SUPPORTED_EXT.has(ext)) {
		console.error(`Unsupported format, skipping: ${filePath}`);
		skipped++;
		continue;
	}

	const isWebp = ext === '.webp';
	const { width, height } = getDimensions(filePath);
	const maxDim = Math.max(width, height);
	const needsResize = maxDim > MAX_SIZE;

	// Already WebP and within size — nothing to do.
	if (isWebp && !needsResize) {
		console.log(`OK (${width}×${height})  ${path.relative(PUBLIC_DIR, filePath)}`);
		skipped++;
		continue;
	}

	if (isWebp) {
		// sips cannot write WebP — decode to temp PNG, resize, re-encode.
		const tmpPng = filePath.replace(/\.webp$/i, '.tmp.png');
		try {
			execFileSync('dwebp', [filePath, '-o', tmpPng]);
			execFileSync('sips', ['-Z', String(MAX_SIZE), tmpPng]);
			execFileSync('cwebp', ['-q', String(WEBP_QUALITY), tmpPng, '-o', filePath]);
			const after = getDimensions(filePath);
			console.log(
				`Resized ${width}×${height} → ${after.width}×${after.height}  ${path.relative(PUBLIC_DIR, filePath)}`,
			);
			resized++;
		} finally {
			if (fs.existsSync(tmpPng)) fs.unlinkSync(tmpPng);
		}
		continue;
	}

	// Non-WebP: resize if needed, then convert to WebP and delete original.
	if (needsResize) {
		execFileSync('sips', ['-Z', String(MAX_SIZE), filePath]);
	}
	const stem = path.basename(filePath, ext);
	const webpPath = path.join(path.dirname(filePath), `${stem}.webp`);
	execFileSync('cwebp', ['-q', String(WEBP_QUALITY), filePath, '-o', webpPath]);
	fs.unlinkSync(filePath);

	const after = getDimensions(webpPath);
	const label = needsResize
		? `Resized+converted ${width}×${height} → ${after.width}×${after.height}`
		: `Converted (${width}×${height})`;
	console.log(`${label}  ${path.relative(PUBLIC_DIR, filePath)} → ${stem}.webp`);
	needsResize ? resized++ : converted++;
}

console.log(
	`\nDone: ${resized} resized, ${converted} converted to WebP, ${skipped} already OK, ${errors} errors.`,
);
