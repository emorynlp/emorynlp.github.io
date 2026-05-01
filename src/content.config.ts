import { defineCollection, z } from 'astro:content';
import { parseNewsFrontmatterDate } from './lib/dates';
import { glob } from 'astro/loaders';

const people = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
	schema: z.object({
		name: z.string(),
		role: z.string(),
		/** Helps group the directory and drives the People-page “participant slugs” helper for lab events */
		labRole: z.enum(['pi', 'student', 'postdoc', 'staff', 'visitor', 'other']).optional(),
		current: z.boolean().default(true),
		cohort: z.string().optional(),
		website: z.string().url().optional(),
		github: z.string().url().optional(),
		photo: z.string().optional(),
		aliases: z.array(z.string()).optional(),
	}),
});

const publications = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
	schema: z.object({
		title: z.string(),
		authors: z.array(z.string()),
		venue: z.string(),
		year: z.number().int(),
		abstract: z.string().optional(),
		pdfUrl: z.string().optional(),
		codeUrl: z.string().optional(),
		bibtex: z.string().optional(),
		publicationType: z.enum(['conference', 'journal', 'preprint', 'workshop', 'other']).optional(),
		peopleSlugs: z.array(z.string()).optional(),
	}),
});

const theses = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/theses' }),
	schema: z.object({
		title: z.string(),
		author: z.string(),
		degree: z.enum([
			'PhD',
			'MS',
			'Undergraduate Honors',
			'Undergraduate Thesis',
			'Masters Thesis',
			'Dissertation',
			'Other',
		]),
		date: z.coerce.date(),
		abstract: z.string().optional(),
		pdfUrl: z.string().optional(),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		summary: z.string().optional(),
		status: z.enum(['current', 'completed']).optional(),
		externalUrl: z.string().url().optional(),
		tags: z.array(z.string()).optional(),
	}),
});

const seminars = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/seminars' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		term: z.string(),
		speakers: z.array(z.string()).optional(),
		abstract: z.string().optional(),
		videoUrl: z.string().optional(),
		slidesUrl: z.string().optional(),
	}),
});

const news = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
	schema: z.object({
		title: z.string(),
		/** `YYYY-MM-DD` (UTC), `YYYY-MM-DD-HH:MM` (Eastern wall time), or any string JS `Date` accepts */
		date: z.union([z.string(), z.date()]).transform((val): Date => parseNewsFrontmatterDate(val)),
		featured: z.boolean().optional(),
		/** Cover image path under `public/` — listing thumbnails and optional hero below article text */
		coverImage: z.string().optional(),
		/** Free-form labels rendered as pills, e.g. `social`, `paper`, `visit` */
		labels: z.array(z.string()).optional(),
		/** People slugs (`src/content/people/{slug}.md`). Missing files still render (name derived from slug); add profiles to enable links + People page listings. */
		participants: z.array(z.string()).optional(),
	}),
});

const gallery = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		image: z.string(),
		credit: z.string().optional(),
	}),
});

export const collections = {
	people,
	publications,
	theses,
	projects,
	seminars,
	news,
	gallery,
};
