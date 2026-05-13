// @ts-check
import { defineConfig } from 'astro/config';
import { rehypeFigureHighlightImagesFromAlt } from './plugins/rehype-figure-highlight-images.mjs';

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
		'/highlights/20200428-undergraduate-awards-2020/': '/highlights/20200430-annual-awards-2020/',
		'/highlights/20200430-graduate-awards-2020/': '/highlights/20200430-annual-awards-2020/',
		'/highlights/20160426-undergraduate-awards-2016/': '/highlights/20160426-annual-awards-2016/',
		'/highlights/20170425-undergraduate-awards-2017/': '/highlights/20170425-annual-awards-2017/',
		'/highlights/20180430-undergraduate-awards-2018/': '/highlights/20180430-annual-awards-2018/',
		'/highlights/20190425-undergraduate-awards-2019/': '/highlights/20190425-annual-awards-2019/',
		'/highlights/20210420-undergraduate-awards-2021/': '/highlights/20210420-annual-awards-2021/',
		'/highlights/20220504-undergraduate-awards-2022/': '/highlights/20220504-annual-awards-2022/',
		'/highlights/20230414-undergraduate-awards-2023/': '/highlights/20230414-annual-awards-2023/',
		'/highlights/20240416-undergraduate-awards-2024/': '/highlights/20240416-annual-awards-2024/',
		'/highlights/20250426-undergraduate-awards-2025/': '/highlights/20250426-annual-awards-2025/',
		'/highlights/label/awards/': '/highlights/label/achievements/',
		'/highlights/label/conference/': '/highlights/label/conferences/',
		'/highlights/label/seminar/': '/highlights/label/seminars/',
		'/highlights/20141127-thanksgiving-dinner-at-dr-chois-place/':
			'/highlights/20141127-thanksgiving-dinner-2014/',
		'/highlights/20171103-bowling-night-at-comet-pub-lanes/': '/highlights/20171103-bowling-night-2017/',
	},
	// `'always'` makes `/news/foo` 404 in dev and in `astro preview` unless the URL ends with `/`.
	// `'ignore'` matches both `/news/foo` and `/news/foo/` (Astro default).
	trailingSlash: 'ignore',
	// Reduce `localhost` / IPv6 quirks: listen on all interfaces (`127.0.0.1` and `[::1]`).
	server: {
		host: true,
	},
});
