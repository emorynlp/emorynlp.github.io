---
name: add-highlight
description: >-
  Adds a new Emory NLP news article (frontmatter + markdown body). Asks the user
  for missing facts (title, date/time, labels, featured, photos, participants)
  before drafting when needed; renames user-provided images to YYYYMMDD-kebab
  image files under public/news/. Use when creating posts under src/content/news/,
  renaming or placing photos under public/news/, wiring participants/labels,
  featured home-strip items,
  or when the user references news posts similar to wild-heaven-bear-dinner.
---

# Add a news article (Emory NLP site)

Golden reference with **multiple inline figures**, **labels**, and **participants**:

- `src/content/news/20260424-wild-heaven-bear-dinner.md`

**Site routing:** Astro uses `trailingSlash: 'ignore'` (`astro.config.mjs`); **`/news/…`** and **`/news/…/`** both work in dev/preview.

**News photos (static assets):** Store files in **`public/news/`**. In Markdown and frontmatter, use **`![](/news/…)`** and **`coverImage: /news/…`**. Article URLs look like **`/news/YYYYMMDD-topic/`**; image URLs look like **`/news/YYYYMMDD-topic-1.jpg`**—distinct paths under the **`/news/`** prefix with no clashes in normal naming. Do **not** revive `src/content/gallery/` for news imagery.

## Gather necessary information first

If the user has **not** already supplied everything needed for a correct post, **ask explicitly** before editing files (short bullet list is fine). Typical gaps:

- **Title** and **what happened** — enough to write a factual opening paragraph (card/home teaser comes from body prose in `src/lib/newsTeaser.ts`).
- **When** — Eastern wall-clock `'YYYY-MM-DD-HH:MM'` or date-only `'YYYY-MM-DD'` per `src/lib/dates.ts`; clarify timezone if ambiguous.
- **Labels** — which pills (`social`, etc.), if any.
- **Featured** — whether this should appear first on the home strip (`featured: true`).
- **Imagery** — cover thumbnail path (listing/home), additional figures stored as files under **`public/news/`** (URL paths **`/news/…`**). If the user attaches or names files generically (e.g. `IMG_1234.jpg`), **rename** them to the project pattern (see checklist §2) so `coverImage` and Markdown `![](/news/…)` paths stay consistent. Do not invent image paths the user did not provide or confirm.
- **Participants** — roster as **people slugs** matching **`src/content/people/{slug}.md`** (filename **without `.md`** in frontmatter). Add a profile file first when you want **clickable links** on the article and **`/people/`** roster entries; resolver behavior: `src/lib/newsParticipants.ts`.

Do **not** fabricate quotes, sponsors, attendance counts, or URLs. Use placeholders only if the user explicitly accepts them.

When the user gives a **complete draft** (or “same structure as wild-heaven …”) with enough specifics, proceed without interrogating.

## Checklist

1. **Slug / file name** — `src/content/news/YYYYMMDD-kebab-topic.md` (no `.md` in slug). URL becomes `/news/YYYYMMDD-kebab-topic/`.

2. **Images** — Place files under **`public/news/`** using the news slug prefix from the Markdown filename (same `YYYYMMDD-kebab-topic` stem):

   - **`YYYYMMDD-kebab-topic-1.webp`**, **`…-2.webp`**, … for inline figures (order matches body).
   - Cover / listing thumbnail: often **`YYYYMMDD-kebab-topic-cover.webp`** or reuse one of the numbered files in `coverImage` and body.

   **When the user provides images** with other names, **rename** (or copy and delete the old name) to the pattern above before wiring `coverImage` and `![…](/news/…)` paths—do not leave random filenames in `public/news/` for news posts.

3. **Frontmatter** (see schema in `src/content.config.ts` → `news`):

| Field           | Notes |
|----------------|-------|
| `title`        | Required. |
| `date`         | Prefer `'YYYY-MM-DD-HH:MM'` (quoted) for Eastern wall time, or `'YYYY-MM-DD'` (UTC midnight). Logic in `src/lib/dates.ts` / `parseNewsFrontmatterDate`. |
| `coverImage`   | Path under **`public/`** — quote and start with **`/`**. Shown on **`/news/`** thumbnails and the **home** strip only; article photos live in Markdown `![](/news/…)` (often reuse the same image as `coverImage` in the body). |
| `featured`     | Optional `true`. Star **emoji** beside the **title** on `/news` cards, the **home** strip, and the article header; home strip lists featured entries first (`src/pages/index.astro`). |
| `labels`       | Optional string array (e.g. `social`, `photo`, `award`, `conferences`). Renders pills on listing + article. |
| `participants` | Optional filenames **without `.md`** for `src/content/people/{slug}.md`. Any lab member slug works; add a people file when you want profile links + People listings. Resolver: `src/lib/newsParticipants.ts`. |

4. **Body** — Normal Markdown:

   - Leading paragraph(s) with optional outbound links `[text](https://…)`.
   - One `![ descriptive alt … ](/news/…jpg)` block per figure; reuse alt text that names event + place + date where useful.

5. **Build** — Run `npm run build` before pushing; Astro content validates frontmatter on build.

**Teaser preview** — The first prose in the Markdown body is stripped to plain text (`src/lib/newsTeaser.ts`) and shown briefly on **`/news/`** cards and the **home** strip; opening paragraph quality matters for previews.

## Template (adapt per item)

````markdown
---
title: Title in sentence case or title case as you prefer
date: 'YYYY-MM-DD-HH:MM'
coverImage: /news/YYYYMMDD-slug-cover.webp
labels:
  - social
featured: false
participants:
  - jinho-choi
---

Short lead paragraph.

![Alt with event name, venue, locality, Month D, YYYY](/news/YYYYMMDD-slug-1.webp)

![Second angle; same specificity](/news/YYYYMMDD-slug-2.webp)
````

Skip optional keys you do not need (`featured`, `labels`, `participants`, `coverImage`).
