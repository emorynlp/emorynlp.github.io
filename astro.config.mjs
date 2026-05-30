// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import { rehypeFigureHighlightImagesFromAlt } from './plugins/rehype-figure-highlight-images.mjs';

/** @param {string} contentDir @param {string} fromPrefix @param {string} toPrefix */
function legacySlugRedirects(contentDir, fromPrefix, toPrefix) {
	/** @type {Record<string, string>} */
	const out = {};
	const dir = path.join(process.cwd(), contentDir);
	if (!fs.existsSync(dir)) return out;
	for (const file of fs.readdirSync(dir)) {
		if (!file.endsWith('.md')) continue;
		const slug = file.replace(/\.md$/, '');
		out[`${fromPrefix}/${slug}`] = `${toPrefix}/${slug}`;
		out[`${fromPrefix}/${slug}/`] = `${toPrefix}/${slug}/`;
	}
	return out;
}

// https://astro.build/config
export default defineConfig({
	markdown: {
		rehypePlugins: [rehypeFigureHighlightImagesFromAlt],
	},
	// When using a verified custom domain in GitHub Pages, set site to https://emorynlp.org
	// so canonical URLs match your public hostname.
	site: 'https://emorynlp.github.io',
	/** ASCII slug replaced earlier Unicode path; keep old links and bookmarks working. */
	redirects: {
		'/faculty/jinho-choi/': '/people/jinho-choi/',
	},
	// `'always'` makes `/news/foo` 404 in dev and in `astro preview` unless the URL ends with `/`.
	// `'ignore'` matches both `/news/foo` and `/news/foo/` (Astro default).
	trailingSlash: 'ignore',
	// Reduce `localhost` / IPv6 quirks: listen on all interfaces (`127.0.0.1` and `[::1]`).
	server: {
		host: true,
	},
});
