import { defineCollection, z } from 'astro:content';
import { parseNewsFrontmatterDate } from './lib/dates';
import { glob } from 'astro/loaders';

/** `src/content/<name>/` — absolute file URL avoids resolving `./src/...` from the wrong cwd. */
function contentGlobBase(segment: string) {
	return new URL(`./content/${segment}/`, import.meta.url);
}

const people = defineCollection({
	loader: glob({ pattern: '**/*.md', base: contentGlobBase('people') }),
	schema: z.object({
		name: z.string(),
		role: z.string(),
		/** Section on the People page (current vs alumni subsections). */
		peopleTier: z
			.enum(['faculty', 'postdoc', 'phd', 'ms', 'undergrad', 'research_assistant', 'visitor'])
			.default('visitor'),
		/** Helps group the directory and drives the People-page “participant slugs” helper for lab events */
		labRole: z.enum(['pi', 'student', 'postdoc', 'staff', 'visitor', 'other']).optional(),
		current: z.boolean().default(true),
		/** Cohort / program label shown when term range isn’t used */
		cohort: z.string().optional(),
		/** If set, shown under the name on `/people/` and the profile hero instead of term range/cohort */
		directoryMeta: z.string().optional(),
		/** Academic start semester, e.g. `Fall 2021` — drives People sort order */
		startTerm: z.string().optional(),
		/** End semester or `Present` if omitted while `current` */
		endTerm: z.string().optional(),
		website: z.string().url().optional(),
		github: z.string().url().optional(),
		linkedin: z.string().url().optional(),
		/** Google Scholar profile URL — prefer if set; Semantic Scholar remains optional separately. */
		googleScholar: z.string().url().optional(),
		semanticScholar: z.string().url().optional(),
		photo: z.string().optional(),
		aliases: z.array(z.string()).optional(),
		/**
		 * Alternate author strings used on papers/theses only (normalized + linked on `/publications/`).
		 * Omit from roster display / profile parentheticals (`aliases` is for preferred/nickname display).
		 */
		publicationAuthorAliases: z.array(z.string()).optional(),
		/**
		 * Honors, grants, competition results, etc.
		 * Prefer `title` (what happened) + `when` (timing) + optional `issuer` (who gave it) instead of one long `title` string.
		 * Legacy entries may still embed dates in `title`; the site splits trailing `(...)` when it looks date-like.
		 * Editorial style: short noun-first lines; em dash for results (`Contest — 1st place (Team)`); awards as `Award, Emory Computer Science`.
		 * Do not list undergraduate thesis honor level here (`Highest Honor in …`, etc.) — that belongs on the linked thesis entry (`honorsLevel`).
		 */
		achievements: z
			.array(
				z.object({
					title: z.string(),
					when: z.string().optional(),
					issuer: z.string().optional(),
					url: z.string().url().optional(),
				}),
			)
			.optional(),
		/** Degrees/postdoc training etc.; Education lists show `endYear` only. Composed bios use `endTerm` when set (`Spring 2026`), else `endYear`. Optional `startTerm` / `endTerm` also affect bio sort order. */
		education: z
			.array(
				z.object({
					degree: z.string(),
					institution: z.string(),
					/** e.g. `Fall 2021` — optional; composed-bio chronological sort. */
					startTerm: z.string().optional(),
					/** e.g. `Spring 2026` — optional; shown in composed bio; Education list still shows `endYear`. */
					endTerm: z.string().optional(),
					endYear: z.number().int().optional(),
					ongoing: z.boolean().optional(),
					notes: z.string().optional(),
				}),
			)
			.optional(),
		/**
		 * Where they headed after Emory (role, school, employer), from department advising records — shown on `/people/[slug]` only.
		 * Order matches CV progression when multiple bullets are listed. Omit when no next destination is recorded yet.
		 */
		afterEmory: z.array(z.string()).optional(),
		/**
		 * When false, `npm run people:bios` does not overwrite the Markdown body — use for hand-written bios.
		 * Omitted behaves like true (auto-composed from education / role / afterEmory).
		 */
		composeBio: z.boolean().optional(),
	}),
});

const publications = defineCollection({
	loader: glob({ pattern: '**/*.md', base: contentGlobBase('publications') }),
	schema: z.object({
		title: z.string(),
		/** Trim each line — avoids stray spaces before/after commas in listings. */
		authors: z.array(z.string()).transform((authors) => authors.map((s) => s.trim())),
		venue: z.string(),
		/** Short listing badge (rail); inferred from venue when omitted. */
		venueAbbrev: z.string().optional(),
		year: z.number().int(),
		abstract: z.string().optional(),
		/** Repository, Hugging Face model/dataset, or other artifact (shown as “Resources” on the paper page). */
		resourceUrl: z.string().optional(),
		/** @deprecated Use `resourceUrl` — still accepted for older posts. */
		codeUrl: z.string().optional(),
		/** Canonical paper/preprint landing (ACL page, DOI, arXiv abs, …). Detail page Links row omits PDF/Bib only. */
		paperUrl: z.string().url().optional(),
		/** Poster PDF or landing URL — shown in the Links row after Paper / Resources. */
		posterUrl: z.string().url().optional(),
		/** Slides PDF or deck URL — shown in the Links row. */
		slidesUrl: z.string().url().optional(),
		/** Venue row hyperlink — used verbatim when set (e.g. journal portal). */
		venueUrl: z.string().url().optional(),
		publicationType: z.enum(['conference', 'journal', 'preprint', 'workshop', 'other']).optional(),
		/** Optional masthead line (reserved; not shown on the `/publications/` cards). */
		masthead: z.string().optional(),
		/** Optional topic tags (`topic1 · topic2`). Content only; not rendered on listing cards. */
		mastheadTopics: z.array(z.string()).optional(),
		/** Listing teaser copy; otherwise first sentence of `abstract`, or truncated abstract. See `publicationDek`. */
		dek: z.string().optional(),
		/** Detail page: optional footnote after authors, shown as `*: …` (e.g. proceedings vs arXiv). */
		authorFootnote: z.string().optional(),
		/** Must match an `authors` entry exactly; that name is shown with a trailing `*`. */
		authorFootnoteFor: z.string().optional(),
		/** Detail page metadata row below Links (“Present”: who spoke / exhibited). */
		presenter: z.string().optional(),
		/**
		 * Calendar date when the paper was published or presented (`YYYY-MM-DD` recommended).
		 * Drives `/publications/` listing order (newer first); if omitted, sort uses Jan 1 of `year`.
		 * When `forthcoming` is true, omit this (no placeholder date); listing sort uses end of `year` instead.
		 */
		published: z
			.union([z.string(), z.date()])
			.optional()
			.transform((val): Date | undefined => {
				if (val === undefined) return undefined;
				return parseNewsFrontmatterDate(val);
			}),
		/** Accepted or in press — not yet published; do not set a fake `published` date. Sorting stays stable (see `publicationSortInstant`). */
		forthcoming: z.boolean().optional(),
	}),
});

const theses = defineCollection({
	loader: glob({ pattern: '**/*.md', base: contentGlobBase('theses') }),
	schema: z.object({
		title: z.string(),
		author: z.string(),
		degree: z.enum([
			'PhD',
			'MS',
			'BS',
			'BA',
			'Undergraduate Honors',
			'Undergraduate Thesis',
			'Masters Thesis',
			'Dissertation',
			'Other',
		]),
		abstract: z.string().optional(),
		term: z.string().optional(),
		department: z.string().optional(),
		paperUrl: z.string().url().optional(),
		slidesUrl: z.string().url().optional(),
		committee: z.array(z.string()).optional(),
		honorsLevel: z.enum(['Highest Honor', 'High Honor', 'Honor']).optional(),
		photo: z.string().optional(),
		sourceUrl: z.string().url().optional(),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: contentGlobBase('projects') }),
	schema: z.object({
		title: z.string(),
		summary: z.string().optional(),
		status: z.enum(['current', 'completed']).optional(),
		externalUrl: z.string().url().optional(),
		tags: z.array(z.string()).optional(),
	}),
});

const seminars = defineCollection({
	loader: glob({ pattern: '**/*.md', base: contentGlobBase('seminars') }),
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

const highlights = defineCollection({
	loader: glob({ pattern: '**/*.md', base: contentGlobBase('highlights') }),
	schema: z.object({
		title: z.string(),
		/** `YYYY-MM-DD` (UTC), `YYYY-MM-DD-HH:MM` (Eastern wall time), or any string JS `Date` accepts */
		date: z.union([z.string(), z.date()]).transform((val): Date => parseNewsFrontmatterDate(val)),
		featured: z.boolean().optional(),
		/** Cover image path under `public/` (e.g. `/highlights/*.jpg`) — listing thumbnails and home carousel */
		coverImage: z.string().optional(),
		/** Free-form labels rendered as pills, e.g. `social`, `paper`, `visit` */
		labels: z.array(z.string()).optional(),
		/** People slugs (`src/content/people/{slug}.md`). Missing files still render (name derived from slug); add profiles to enable links + People page listings. */
		participants: z.array(z.string()).optional(),
	}),
});

export const collections = {
	people,
	publications,
	theses,
	projects,
	seminars,
	highlights,
};
