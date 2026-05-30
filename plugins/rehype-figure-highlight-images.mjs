/**
 * Turns `![Caption](…)` paragraphs into <figure><img alt=""/><figcaption>Caption</figcaption></figure>
 * so alt text doubles as visible caption. Applies to all Astro markdown (mostly news site-wide).
 *
 * Decorative images: omit alt or use whitespace-only alt to skip (no caption, plain <p><img />).
 */
import { visit } from 'unist-util-visit';

function meaningfulElementChildren(children) {
	if (!Array.isArray(children)) return [];
	const nonImg = [];
	for (const c of children) {
		if (c.type === 'text') {
			if (!/^\s*$/.test(c.value ?? '')) return [];
			continue;
		}
		if (c.type === 'element') nonImg.push(c);
		else return [];
	}
	return nonImg;
}

/** @param {import('hast').Root | undefined} tree */
export function rehypeFigureHighlightImagesFromAlt(tree) {
	if (!tree || typeof tree !== 'object' || !Array.isArray(tree.children)) return;

	/** @type {Array<{ parent: import('hast').Element; index: number; figure: import('hast').Element }>} */
	const replacements = [];

	visit(tree, 'element', (node, index, parent) => {
		if (node.tagName !== 'p' || parent?.type !== 'element' || index == null) return;
		const elems = meaningfulElementChildren(node.children);
		if (elems.length !== 1 || elems[0]?.tagName !== 'img') return;
		const img = elems[0];
		const altStr =
			img.properties?.alt != null && String(img.properties.alt).trim().length > 0
				? String(img.properties.alt).trim()
				: '';
		if (!altStr) return;

		const figure = {
			type: 'element',
			tagName: 'figure',
			properties: { className: ['highlight-md-figure'] },
			children: [
				{
					type: 'element',
					tagName: 'img',
					properties: {
						...(img.properties ?? {}),
						loading: img.properties?.loading ?? 'lazy',
						decoding: img.properties?.decoding ?? 'async',
						alt: '',
					},
					children: [],
				},
				{
					type: 'element',
					tagName: 'figcaption',
					properties: { className: ['highlight-md-caption'] },
					children: [{ type: 'text', value: altStr }],
				},
			],
		};
		replacements.push({ parent, index, figure });
	});

	for (const { parent, index, figure } of replacements) {
		if (Array.isArray(parent.children)) {
			parent.children[index] = figure;
		}
	}
}
