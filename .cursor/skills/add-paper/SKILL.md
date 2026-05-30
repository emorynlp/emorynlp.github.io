---
name: add-paper
description: >-
  Adds a new publication entry to the Emory NLP site (frontmatter + abstract).
  Asks the user for missing facts (title, authors, venue, year, links, abstract,
  Dispatch labels) before creating files. Use when adding a paper under
  src/content/papers/, optional presenter photo under public/papers/, or when the
  user says "add a paper/publication".
---

# Add a publication (Emory NLP site)

Golden references (recent, varied):

- `src/content/papers/2026-eacl-byun.md` — conference with `presenter`, links, multi-paragraph abstract
- `src/content/papers/2025-acl-findings-byun.md` — ACL Findings + poster
- `src/content/papers/2025-cikm-choi.md` — industry venue + slides
- `src/content/papers/2024-tacl-finch.md` — journal
- `src/content/papers/2026-tacl-choi.md` — `forthcoming: true` (accepted, not yet published)
- `src/content/papers/2018-arxiv-jurczyk.md` — preprint

Schema source of truth: `src/content.config.ts` → `papers` collection.

Listing behavior: `src/lib/publicationListing.ts` (venue badge, sort order, teaser).

## Gather necessary information first

Ask for any missing items before creating files. Minimum required:

- **Title** — paper title (quotes in YAML if it contains `:`)
- **Authors** — ordered list, exactly as on the paper/proceedings
- **Venue** — full venue string (see patterns below)
- **Year** — integer publication year
- **Abstract** — full abstract text (or ask user to paste from ACL Anthology / arXiv / camera-ready)
- **Dispatch labels** — application domain + task (+ research field when applicable); see **Dispatch labels** below. Infer from the abstract or ask when unclear.

Collect as many optionals as the user can supply:

| Field | Notes |
|-------|-------|
| `publicationType` | `conference` · `journal` · `preprint` · `workshop` · `other`. Sets listing rail label when venue heuristics are ambiguous. |
| `published` | `YYYY-MM-DD` when known (conference date, journal issue date, arXiv v1 date). Drives `/papers/` sort (newer first). |
| `forthcoming` | `true` when accepted / in press but not yet published. **Do not** invent a `published` date. |
| `paperUrl` | Canonical landing (ACL Anthology, DOI, arXiv abs, publisher). |
| `venueUrl` | Conference or journal home (e.g. `https://2026.eacl.org`, `https://transacl.org/`). |
| `resourceUrl` | Code, data, Hugging Face, demo — shown as **Resources** (prefer over deprecated `codeUrl`). |
| `posterUrl` / `slidesUrl` | Google Drive or PDF URLs. |
| `presenter` | Who presented at the venue; comma-separated if several. Must match an `authors` entry (or a name that resolves via people lookup). |
| `dek` | Short listing teaser; omit unless you want something other than the first abstract sentence. |
| `topics` | **Required for new papers** — named object with `applicationDomain`, `task`, and optional `researchField` (see **Dispatch labels** below). |
| `authorFootnote` + `authorFootnoteFor` | Rare; see `2025-emnlp-hong.md`. `authorFootnoteFor` must match an `authors` string exactly. |
| Presenter photo | Optional image file; see checklist §3. |

Do **not** fabricate authors, URLs, dates, or abstract text. Use placeholders only when the user explicitly accepts them.

When the user gives a **complete draft** (title, authors, venue, abstract, links), infer `topics` from the abstract when possible; proceed without interrogating.

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

URL: `/papers/{slug}/` (filename without `.md`).

### 2. Author names and profile links

Author strings in `authors` are matched to `src/content/people/` for clickable links on `/papers/` and profiles.

- Use the **same spelling as on the paper** (e.g. `Jinho D. Choi`, `Sarah E. Finch`, `Grace Byun`).
- If a lab member’s paper name differs from their profile `name`, add `publicationAuthorAliases` (or `aliases`) on their people file — do not guess.
- **Order:** students/postdocs first, **Jinho D. Choi** typically last when he is co-author.
- External collaborators: list as plain strings; they will not link unless they have a people profile.

If a new lab member needs a profile first, use the **add-member** skill, then return to this paper.

## Dispatch labels (`topics`)

Topic pills appear above the paper title on **Dispatch issue lists** and featured-paper cards. Use a **named YAML object** — not a positional list:

| Key | Role | Required? |
|-----|------|-----------|
| `researchField` | Cross-cutting AI subfield | No — omit the key when not applicable |
| `applicationDomain` | Real-world application area | Yes |
| `task` | What the system/model does | Yes |

Pills render in key order: research field → application domain → task.

**With research field:**

```yaml
topics:
  researchField: AI Safety
  applicationDomain: Mental Health
  task: Crisis/Risk Detection
```

**Without research field** — omit `researchField`:

```yaml
topics:
  applicationDomain: General NLP
  task: Schema Induction
```

Each value is a plain string, or `{ label, tone? }` to override pill color (`core` · `code` · `apps` · `seminar` · `neutral`).

Tone is auto-inferred from the label when omitted — see `src/lib/dispatch/paperTopics.ts`. Override only when inference is wrong.

### 1. Research Field (optional)

*What cross-cutting AI subfield does this belong to?*

Examples (not exhaustive):

`Safe AI`, `Agentic AI`, `Conversational AI`, `Generative AI`, `Multimodal AI`, `LLM Evaluation`, `Human-AI Interaction`

**Leave out** this tag when the paper is foundational/core NLP with no particular subfield framing — do **not** use `General NLP` here.

Prefer tone `neutral` when setting explicitly.

### 2. Application Domain (required)

*What real-world area does this apply to?*

Examples (not exhaustive):

`Mental Health`, `Clinical/Medical`, `Education`, `Software Engineering`, `Social Media`, `Legal`, `Finance`, `General NLP`

Use **`General NLP`** when the paper targets no specific application domain.

Prefer tone `apps` for specific domains; `neutral` for `General NLP`.

### 3. Task (required)

*What does the system/model do? Use the most specific applicable label.*

Examples (not exhaustive — add new ones when needed):

`Text Classification`, `Sequence Labeling`, `Information Extraction`, `Named Entity Recognition`, `Relation Extraction`, `Parsing`, `Coreference Resolution`, `Machine Translation`, `Summarization`, `Question Answering`, `Dialogue`, `Code Generation`, `Text-to-SQL`, `Sentiment Analysis`, `Natural Language Inference`, `Image Captioning`, `Visual Question Answering`, `Speech Recognition`, `Schema Induction`, `Benchmark`

Pick **one** primary task — the most specific label that fits. Use a broader label only when nothing narrower applies (e.g. `Information Extraction` instead of a vague “NLP” tag).

Prefer tone `core` for task labels; `code` for benchmark/resource papers where the contribution is primarily a dataset or toolkit.

### Assigning labels

1. Read title + abstract.
2. Decide **Research Field** — include only if clearly framed by a cross-cutting subfield; otherwise skip.
3. Set **Application Domain** — default to `General NLP` when no real-world domain is targeted.
4. Set **Task** — choose the single most specific task label; coin a new task string if none of the examples fit (Title Case, concise).
5. Write `topics` as the named object above.

If labels are ambiguous, **ask the user** which domain or task best fits before committing.

Do **not** duplicate the venue, publication type, or author names as topic tags.

### Examples

**CRADLE Bench** (`2026-eacl-byun.md`):

```yaml
topics:
  researchField: AI Safety
  applicationDomain: Mental Health
  task: Crisis/Risk Detection
```

**TACL schema induction** (`2026-tacl-finch.md`):

```yaml
topics:
  researchField: Conversational AI
  applicationDomain: General NLP
  task: Schema Induction
```

**HeaLing workshop** (`2026-healing-kim.md`):

```yaml
topics:
  researchField: LLM Evaluation
  applicationDomain: Mental Health
  task: Text Classification
```

**Legacy entries** may use older ad-hoc label strings. **New papers** must use the named-object format and taxonomy above.

### 3. Optional presenter photo

Shown on the paper detail page when `public/papers/{slug}.webp` (or `.jpg`/`.png`) exists. Filename **must match the publication slug**.

1. User supplies a photo → place in `public/papers/` (any starting name).
2. Run **convert-photo** skill (`node scripts/resize-media-photo.mjs …`) → WebP, ≤1920px.
3. Rename to **`public/papers/{slug}.webp`**.

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
topics:
  researchField: Conversational AI
  applicationDomain: General NLP
  task: Dialogue
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
src/content/papers/{slug}.md
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
topics:
  applicationDomain: Application Domain Here
  task: Task Label Here
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
- **convert-photo** — resize/convert presenter image to `public/papers/{slug}.webp`.
