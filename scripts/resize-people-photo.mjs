/**
 * Resizes people photos to a maximum of 600×600 px and converts them to WebP.
 * Edits files in-place under public/people/. When a source file is converted
 * to WebP, the original is deleted and any explicit `photo:` frontmatter field
 * in the matching src/content/people/{slug}.md is updated (or removed if it
 * was the redundant slug-based path, since the site auto-resolves by slug).
 *
 * Usage:
 *   node scripts/resize-people-photo.mjs                  # process all photos
 *   node scripts/resize-people-photo.mjs han-he.jpg       # one file by basename
 *   node scripts/resize-people-photo.mjs public/people/han-he.jpg  # or full path
 *
 * Requires: macOS (sips) + webp tools (brew install webp)
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PEOPLE_DIR = path.join(ROOT_DIR, 'public', 'people');
const CONTENT_DIR = path.join(ROOT_DIR, 'src', 'content', 'people');
const MAX_SIZE = 600;
const WEBP_QUALITY = 85;
const SUPPORTED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/** Return all supported image paths in public/people/. */
function allPhotos() {
	return fs
		.readdirSync(PEOPLE_DIR)
		.filter((f) => SUPPORTED_EXT.has(path.extname(f).toLowerCase()))
		.map((f) => path.join(PEOPLE_DIR, f));
}

/** Resolve a CLI argument to an absolute path inside public/people/. */
function resolveArg(arg) {
	const abs = path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg);
	if (fs.existsSync(abs)) return abs;
	const fallback = path.join(PEOPLE_DIR, path.basename(arg));
	if (fs.existsSync(fallback)) return fallback;
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

/**
 * If src/content/people/{slug}.md has an explicit `photo:` field pointing to
 * the old path, remove it (the site auto-resolves by slug, so it's redundant).
 */
function clearPhotoField(slug) {
	const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
	if (!fs.existsSync(mdPath)) return;

	const raw = fs.readFileSync(mdPath, 'utf8');
	// Match `photo: /people/{slug}.{ext}` — the redundant auto-resolvable form
	const pattern = new RegExp(`^photo:\\s+/people/${slug}\\.[a-z]+\\s*$`, 'm');
	if (!pattern.test(raw)) return;

	const updated = raw.replace(pattern, '').replace(/\n{3,}/g, '\n\n');
	fs.writeFileSync(mdPath, updated);
	console.log(`  → Removed redundant photo: field from ${slug}.md`);
}

const args = process.argv.slice(2);
const targets = args.length > 0 ? args.map(resolveArg) : allPhotos();

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

	const slug = path.basename(filePath, ext);
	const webpPath = path.join(PEOPLE_DIR, `${slug}.webp`);
	const isAlreadyWebp = ext === '.webp';

	const { width, height } = getDimensions(filePath);
	const maxDim = Math.max(width, height);
	const needsResize = maxDim > MAX_SIZE;

	// Already WebP and within size limit — nothing to do.
	if (isAlreadyWebp && !needsResize) {
		console.log(`OK (${width}×${height})  ${path.basename(filePath)}`);
		skipped++;
		continue;
	}

	// Resize in-place first (sips handles jpg, png, webp reads but not writes).
	// For WebP source files, sips can read but not write — handled below via temp PNG.
	if (needsResize && !isAlreadyWebp) {
		execFileSync('sips', ['-Z', String(MAX_SIZE), filePath]);
	}

	if (isAlreadyWebp && needsResize) {
		// Decode WebP → temp PNG → resize → re-encode → replace original.
		const tmpPng = filePath.replace(/\.webp$/i, '.tmp.png');
		try {
			execFileSync('dwebp', [filePath, '-o', tmpPng]);
			execFileSync('sips', ['-Z', String(MAX_SIZE), tmpPng]);
			execFileSync('cwebp', ['-q', String(WEBP_QUALITY), tmpPng, '-o', filePath]);
			const after = getDimensions(filePath);
			console.log(`Resized ${width}×${height} → ${after.width}×${after.height}  ${path.basename(filePath)}`);
			resized++;
		} finally {
			if (fs.existsSync(tmpPng)) fs.unlinkSync(tmpPng);
		}
		continue;
	}

	// Convert non-WebP source to WebP.
	execFileSync('cwebp', ['-q', String(WEBP_QUALITY), filePath, '-o', webpPath]);
	fs.unlinkSync(filePath);

	const after = getDimensions(webpPath);
	const label = needsResize
		? `Resized+converted ${width}×${height} → ${after.width}×${after.height}`
		: `Converted (${width}×${height})`;
	console.log(`${label}  ${path.basename(filePath)} → ${slug}.webp`);

	// Clean up redundant photo: field in the matching .md file.
	clearPhotoField(slug);

	needsResize ? resized++ : converted++;
}

console.log(
	`\nDone: ${resized} resized, ${converted} converted to WebP, ${skipped} already OK, ${errors} errors.`,
);
