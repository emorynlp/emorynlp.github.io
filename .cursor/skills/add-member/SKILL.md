---
name: add-member
description: >-
  Adds a new person profile to the Emory NLP site (frontmatter + bio body +
  resized photo). Asks the user for missing facts (name, role, tier, terms,
  social links, education, photo) before creating files. Use when adding a new
  lab member, alumni, visitor, or faculty under src/content/people/, placing a
  photo under public/people/, or when the user says "add a new person/member".
---

# Add a person profile (Emory NLP site)

Reference profiles to study:

- `src/content/people/grace-byun.md` — current PhD student
- `src/content/people/andrew-chung.md` — undergrad alumnus with achievements
- `src/content/people/han-he.md` — PhD alumnus with After Emory
- `src/content/people/jinho-choi.md` — faculty
- `src/content/people/hyopil-shin.md` — visitor (minimal fields)

Schema source of truth: `src/content.config.ts` → `people`.

## Gather necessary information first

Ask for any missing items before creating files. Minimum required:

- **Full name** — determines the slug (`Grace Byun` → `grace-byun`)
- **Role** — degree programme or title string (e.g. `PhD in Computer Science and Informatics`, `Associate Professor of …`, `Visiting Scholar`)
- **peopleTier** — one of: `faculty` · `postdoc` · `phd` · `ms` · `undergrad` · `research_assistant` · `visitor`
- **current** — `true` (active) or `false` (alumni/former visitor)
- **Photo** — file path or attachment; required to place in `public/people/`

Collect as many optionals as the user can supply:

| Field | Notes |
|-------|-------|
| `startTerm` / `endTerm` | Semester strings, e.g. `Fall 2024` / `Spring 2026`. Drives sort order on the People page. Omit for faculty. |
| `cohort` | Shown instead of term range when a term range isn't used. |
| `directoryMeta` | Override line shown under name on `/people/` (faculty only, e.g. `Director / Founder`). |
| `aliases` | Alternate display names or nicknames shown in parentheses on the profile, e.g. Korean name or preferred short name. |
| `publicationAuthorAliases` | Author strings on papers that differ from `name`; used only for linking publications. |
| `website` | Personal website URL. |
| `github` | GitHub profile URL. |
| `linkedin` | LinkedIn profile URL. |
| `googleScholar` | Google Scholar URL — prefer over Semantic Scholar when both exist. |
| `semanticScholar` | Semantic Scholar author URL. |
| `achievements` | List of `title` + optional `when` (MM/YYYY or range) + optional `issuer` + optional `url`. |
| `education` | List of `degree` + `institution` + `endYear` (int) or `ongoing: true` + optional `notes` (country, etc.). |

Do **not** fabricate social profile IDs, publication counts, or bio details. Use placeholders only when the user explicitly accepts them.

## Checklist

### 1. Slug

`firstname-lastname` in kebab-case, all lowercase. Examples:
- `Grace Byun` → `grace-byun`
- `Jinho D. Choi` → `jinho-choi`
- `Sungjoo (Grace) Byun` → still `grace-byun` (preferred name)

### 2. Photo

- The user will supply the file. Copy / move it to **`public/people/`** keeping the original filename for now.
- **Check the file extension, then run the appropriate command:**

  **If the file is `.jpg` / `.jpeg` / `.png`** — the script converts to WebP, resizes to ≤600×600, and deletes the original:
  ```bash
  node scripts/resize-people-photo.mjs {filename}
  ```

  **If the file is already `.webp`** — the script resizes in-place if over 600px, no conversion needed:
  ```bash
  node scripts/resize-people-photo.mjs {filename}
  ```

  Either way, the same command handles both cases. Requires `cwebp`/`dwebp` (`brew install webp`).

- The final file will always be **`public/people/{slug}.webp`**.
- The `photo` frontmatter field is **not needed** — the site auto-resolves `.webp` by slug.

### 3. Frontmatter

Follow the tier-specific patterns below. Include only fields that have values; omit optional keys entirely when unknown.

**Current PhD student:**
```yaml
name: Grace Byun
role: PhD in Computer Science and Informatics
peopleTier: phd
current: true
startTerm: Fall 2024
github: 'https://github.com/...'
linkedin: 'https://www.linkedin.com/in/...'
semanticScholar: 'https://www.semanticscholar.org/author/...'
aliases:
  - Sungjoo Byun
education:
  - degree: PhD in Computer Science and Informatics
    institution: Emory University
    ongoing: true
  - degree: MA in Linguistics
    institution: Seoul National University
    endYear: 2023
    notes: South Korea
```

**PhD alumnus:**
```yaml
name: Han He
role: PhD in Computer Science and Informatics
peopleTier: phd
current: false
startTerm: Fall 2018
endTerm: Spring 2023
education:
  - degree: PhD in Computer Science and Informatics
    institution: Emory University
    endYear: 2023
```

**Undergrad (current or alumni):**
```yaml
name: Andrew Chung
role: BS in Computer Science
peopleTier: undergrad
current: false
startTerm: Fall 2023
endTerm: Spring 2025
education:
  - degree: BS in Computer Science
    institution: Emory University
    endYear: 2025
```

**Faculty:**
```yaml
name: Jinho Choi
role: Associate Professor of Computer Science, Data & Decision Sciences, and Linguistics
directoryMeta: Director / Founder
peopleTier: faculty
current: true
```

**Visitor:**
```yaml
name: Hyopil Shin
role: Visiting Professor
peopleTier: visitor
current: false
startTerm: Fall 2018
endTerm: Spring 2019
```

### 4. Bio body

Write a short prose paragraph after the closing `---`. Style guide:

- **Current member:** `**Name** is pursuing a [degree] at Emory University (in progress).`
- **Alumni:** `**Name** earned a [degree] from Emory University ([Season Year]). After Emory, [Name] moved to [Org](url) as a [role].`
- **Faculty:** `**Name** is [role] at Emory University.`
- **Visitor:** free-form; mention home institution and what they did at Emory.
- If the user does not provide an "After Emory" destination for alumni, omit that sentence rather than guessing.
- Do not add achievements, publication lists, or headings in the body — those live in frontmatter or other collections.

### 5. File path

```
src/content/people/{slug}.md
```

### 6. Validate

Run after creating the file:

```bash
npm run check
```

Astro's type-checker will surface any schema mismatches.

## Template

````markdown
---
name: Full Name
role: Degree or Title
peopleTier: phd
current: true
startTerm: Fall 2024
github: 'https://github.com/...'
linkedin: 'https://www.linkedin.com/in/...'
semanticScholar: 'https://www.semanticscholar.org/author/...'
education:
  - degree: PhD in Computer Science and Informatics
    institution: Emory University
    ongoing: true
---
**Full Name** is pursuing a PhD in Computer Science and Informatics at Emory University (in progress).
````

Omit optional keys you do not have values for.
