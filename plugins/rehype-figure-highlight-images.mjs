/**
 * Turns `![Caption](…)` paragraphs into <figure><img alt=""/><figcaption>Caption</figcaption></figure>
 * so alt text doubles as visible caption. Applies to all Astro markdown (mostly highlights site-wide).
 *
 * Decorative images: omit alt or use whitespace-only alt to skip (no caption, plain <p><img />).
 */
import { visit } from 'unist-util-visit';

function meaningfulElementChildren(children) {
	if (!Array.isArray(children)) return [];
	let nonImg = [];
	for (const c of children) {
		if (c.type === 'text') {
			if (!/^\s*$/.test(c.value ?? '')) return []; // stray text ⇒ not standalone image
			continue;
		}
		if (c.type === 'element') nonImg.push(c);
		else return [];
	}
	return nonImg;
}

/** @returns {import('unist-util-visit').Visitor} */
export function rehypeFigureHighlightImagesFromAlt() {
	return (tree) => {
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'p' || !parent?.children || index == null) return;
			const elems = meaningfulElementChildren(node.children);
			if (elems.length !== 1 || elems[0]?.tagName !== 'img') return;
			const img = elems[0];
			let altStr =
				img.properties?.alt != null &&
				String(img.properties.alt)
					.trim()
					.length > 0
					? String(img.properties.alt).trim()
					: '';
			if (!altStr) return;

			const figure = {
				type: 'element',
				tagName: 'figure',
				properties: {
					className: ['highlight-md-figure'],
				},
				children: [
					{
						...img,
						properties: {
							...img.properties,
							loading: img.properties.loading ?? 'lazy',
							decoding: img.properties.decoding ?? 'async',
							alt: '',
						},
					},
					{
						type: 'element',
						tagName: 'figcaption',
						properties: {
							className: ['highlight-md-caption'],
						},
						children: [{ type: 'text', value: altStr }],
					},
				],
			};
			parent.children[index] = figure;
		});
	};
}
