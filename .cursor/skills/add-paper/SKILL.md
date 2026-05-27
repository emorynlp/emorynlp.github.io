---
name: add-paper
description: >-
  Adds a new publication entry to the Emory NLP site (frontmatter + abstract).
  Asks the user for missing facts (title, authors, venue, year, links, abstract)
  before creating files. Use when adding a paper under src/content/publications/,
  optional presenter photo under public/publications/, or when the user says
  "add a paper/publication".
---

# Add a publication (Emory NLP site)

Golden references (recent, varied):

- `src/content/publications/2026-eacl-byun.md` — conference with `presenter`, links, multi-paragraph abstract
- `src/content/publications/2025-acl-findings-byun.md` — ACL Findings + poster
- `src/content/publications/2025-cikm-choi.md` — industry venue + slides
- `src/content/publications/2024-tacl-finch.md` — journal
- `src/content/publications/2026-tacl-choi.md` — `forthcoming: true` (accepted, not yet published)
- `src/content/publications/2018-arxiv-jurczyk.md` — preprint

Schema source of truth: `src/content.config.ts` → `publications`.

Listing behavior: `src/lib/publicationListing.ts` (venue badge, sort order, teaser).

## Gather necessary information first

Ask for any missing items before creating files. Minimum required:

- **Title** — paper title (quotes in YAML if it contains `:`)
- **Authors** — ordered list, exactly as on the paper/proceedings
- **Venue** — full venue string (see patterns below)
- **Year** — integer publication year
- **Abstract** — full abstract text (or ask user to paste from ACL Anthology / arXiv / camera-ready)

Collect as many optionals as the user can supply:

| Field | Notes |
|-------|-------|
| `publicationType` | `conference` · `journal` · `preprint` · `workshop` · `other`. Sets listing rail label when venue heuristics are ambiguous. |
| `published` | `YYYY-MM-DD` when known (conference date, journal issue date, arXiv v1 date). Drives `/publications/` sort (newer first). |
| `forthcoming` | `true` when accepted / in press but not yet published. **Do not** invent a `published` date. |
| `paperUrl` | Canonical landing (ACL Anthology, DOI, arXiv abs, publisher). |
| `venueUrl` | Conference or journal home (e.g. `https://2026.eacl.org`, `https://transacl.org/`). |
| `resourceUrl` | Code, data, Hugging Face, demo — shown as **Resources** (prefer over deprecated `codeUrl`). |
| `posterUrl` / `slidesUrl` | Google Drive or PDF URLs. |
| `presenter` | Who presented at the venue; comma-separated if several. Must match an `authors` entry (or a name that resolves via people lookup). |
| `dek` | Short listing teaser; omit unless you want something other than the first abstract sentence. |
| `authorFootnote` + `authorFootnoteFor` | Rare; see `2025-emnlp-hong.md`. `authorFootnoteFor` must match an `authors` string exactly. |
| Presenter photo | Optional image file; see checklist §3. |

Do **not** fabricate authors, URLs, dates, or abstract text. Use placeholders only when the user explicitly accepts them.

When the user gives a **complete draft** (title, authors, venue, abstract, links), proceed without interrogating.

## Checklist

### 1. Slug and filename

Pattern: **`{year}-{venue-kebab}-{lead-author-lastname}.md`**

- **year** — four digits, matches `year` frontmatter
- **venue-kebab** — short venue token: `acl`, `emnlp`, `naacl`, `eacl`, `tacl`, `cikm`, `sigdial`, `coling`, `arxiv`, `aaai`, `jamia`, etc. For ACL Findings use `acl-findings` or match siblings (e.g. `2025-acl-findings-byun`).
- **lead-author-lastname** — usually the **first lab author’s** family name (student first on multi-author papers). Use `choi` when Jinho is the only Emory author or the clear lead.

Examples:

| Paper | File |
|-------|------|
| EACL 2026, Grace Byun first | `2026-eacl-byun.md` |
| CIKM 2025, Nayoung Choi first | `2025-cikm-choi.md` |
| TACL 2024, Sarah Finch first | `2024-tacl-finch.md` |

If the slug already exists, append **`-1`**, **`-2`**, … (see `2020-aaai-sap-jiang-1.md`).

URL: `/publications/{slug}/` (filename without `.md`).

### 2. Author names and profile links

Author strings in `authors` are matched to `src/content/people/` for clickable links on `/publications/` and profiles.

- Use the **same spelling as on the paper** (e.g. `Jinho D. Choi`, `Sarah E. Finch`, `Grace Byun`).
- If a lab member’s paper name differs from their profile `name`, add `publicationAuthorAliases` (or `aliases`) on their people file — do not guess.
- **Order:** students/postdocs first, **Jinho D. Choi** typically last when he is co-author.
- External collaborators: list as plain strings; they will not link unless they have a people profile.

If a new lab member needs a profile first, use the **add-member** skill, then return to this paper.

### 3. Optional presenter photo

Shown on the paper detail page when `public/publications/{slug}.webp` (or `.jpg`/`.png`) exists. Filename **must match the publication slug**.

1. User supplies a photo → place in `public/publications/` (any starting name).
2. Run **convert-photo** skill (`node scripts/resize-media-photo.mjs …`) → WebP, ≤1920px.
3. Rename to **`public/publications/{slug}.webp`**.

Omit the photo if the user does not provide one.

### 4. Venue string patterns

Use full names consistent with existing entries:

```yaml
# Main ACL conference
venue: 'Annual Meeting of the Association for Computational Linguistics (ACL)'

# ACL Findings
venue: 'Annual Meeting of the Association for Computational Linguistics (ACL): Findings'

# EMNLP Findings
venue: 'Conference on Empirical Methods in Natural Language Processing (EMNLP): Findings'

# EACL
venue: 'Conference of the European Chapter of the Association for Computational Linguistics (EACL)'

# TACL
venue: Transactions of the Association for Computational Linguistics (TACL)

# arXiv
venue: arXiv
```

`venueAbbrev` is optional; the site infers listing badges (ACL, ACL·F, TACL, …) from `venue` when omitted.

### 5. Frontmatter

Include only fields that have values. Quote URLs and dates.

**Published conference paper:**

```yaml
---
title: 'Paper Title Here'
authors:
  - Grace Byun
  - Jinho D. Choi
venue: 'Annual Meeting of the Association for Computational Linguistics (ACL): Findings'
year: 2025
publicationType: conference
published: '2025-07-28'
presenter: 'Grace Byun'
venueUrl: 'https://2025.aclweb.org'
paperUrl: 'https://aclanthology.org/2025.findings-acl.174'
resourceUrl: 'https://github.com/org/repo'
posterUrl: 'https://drive.google.com/file/d/…'
slidesUrl: 'https://drive.google.com/file/d/…'
abstract: >-
  First paragraph of the abstract…

  Optional second paragraph (blank line between paragraphs in YAML).
---
```

**Accepted, not yet published:**

```yaml
forthcoming: true
# omit published
paperUrl: 'https://arxiv.org/abs/…'   # optional preprint link
```

**Journal:**

```yaml
publicationType: journal
published: '2024-05-03'
venueUrl: 'https://transacl.org/'
paperUrl: 'https://doi.org/10.1162/tacl_a_00659'
```

**Preprint:**

```yaml
venue: arXiv
publicationType: preprint
published: '2018-01-06'
venueUrl: 'https://arxiv.org/'
paperUrl: 'https://arxiv.org/abs/1801.02073'
```

Use a **folded block** (`abstract: >-`) for long abstracts. Preserve paragraph breaks with a blank line in the YAML block.

### 6. Markdown body

Leave the body **empty** after the closing `---` (abstract lives in frontmatter only). Do not duplicate the abstract in the body.

### 7. File path

```
src/content/publications/{slug}.md
```

### 8. Validate

```bash
npm run check
```

Fix any schema errors (invalid URLs, missing required fields, bad dates).

Optional full build before push:

```bash
npm run build
```

## Template

````markdown
---
title: 'Full Paper Title'
authors:
  - First Author
  - Jinho D. Choi
venue: 'Annual Meeting of the Association for Computational Linguistics (ACL)'
year: 2026
publicationType: conference
published: '2026-03-10'
presenter: 'First Author'
venueUrl: 'https://2026.aclweb.org'
paperUrl: 'https://aclanthology.org/…'
resourceUrl: 'https://github.com/emorynlp/…'
abstract: >-
  Abstract text here.
---
````

Omit optional keys you do not have values for.

## Related skills

- **add-member** — new lab author needs a people profile (or `publicationAuthorAliases`).
- **convert-photo** — resize/convert presenter image to `public/publications/{slug}.webp`.
