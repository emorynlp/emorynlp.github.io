// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// When using a verified custom domain in GitHub Pages, set site to https://emorynlp.org
	// so canonical URLs match your public hostname.
	site: 'https://emorynlp.github.io',
	// `'always'` makes `/news/foo` 404 in dev and in `astro preview` unless the URL ends with `/`.
	// `'ignore'` matches both `/news/foo` and `/news/foo/` (Astro default).
	trailingSlash: 'ignore',
	// Reduce `localhost` / IPv6 quirks: listen on all interfaces (`127.0.0.1` and `[::1]`).
	server: {
		host: true,
	},
});
