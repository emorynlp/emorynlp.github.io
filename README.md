# Emory NLP — website

Public site for **Emory NLP**, built with [Astro](https://astro.build/) and deployed to **[GitHub Pages](https://pages.github.com/)** from `main`.

- **Production URL**: [https://emorynlp.github.io/](https://emorynlp.github.io/) (default for this repo name).
- **Custom domain**: To serve [https://emorynlp.org](https://emorynlp.org), configure GitHub Pages to use that domain under **Repository → Settings → Pages → Custom domain**, then commit a `CNAME` file at the repository root containing `emorynlp.org` (or rely on GitHub only—follow GitHub’s prompt). Align the canonical **`site`** in [`astro.config.mjs`](astro.config.mjs) with the domain you advertise (see comment in that file).

## Local development

Requires **Node.js 22+** (see [`package.json`](package.json) `engines`).

```bash
npm install
npm run dev
```

Build a static preview of the site:

```bash
npm run build
npm run preview
```

## Editing content (no CMS)

Content is Markdown with YAML frontmatter, typed via [`src/content.config.ts`](src/content.config.ts).

| Section        | Folder                       | Notes                                                           |
|----------------|------------------------------|-----------------------------------------------------------------|
| People         | [`src/content/people/`](src/content/people/) | `current: true` keeps someone in the **Current** list. |
| Papers         | [`src/content/papers/`](src/content/papers/) | Authors, venue, year, optional links. Optional `topics` object (`researchField?`, `applicationDomain`, `task`) on Dispatch lists. Served at `/papers/`. |
| Theses & diss. | [`src/content/theses/`](src/content/theses/) | `degree` and defense `date` are required in the schema. Optional `topics` for Dispatch (inferred from title/abstract when omitted). |
| The NLP Dispatch | [`src/content/dispatch/`](src/content/dispatch/) | Triannual magazine issues (`/dispatch/` serves the latest issue; `/dispatch/issues/{slug}/` for permalinks). Curates publication and thesis slugs plus editorial fields (column, spotlight, reading list, `distinctions`, activity news). Optional `featured: true` on one item per section (`papers`, `activityNews`, `distinctions`, `theses`) spotlights it at the top of that section. |
| Seminars       | [`src/content/seminars/`](src/content/seminars/) | `term` drives grouping on the seminars index page. |
| News           | [`src/content/news/`](src/content/news/) | `featured: true` prioritizes the home carousel; optional `coverImage: /news/your.webp` (images under [`public/news/`](public/news/)). |

Filenames identify the URL slug (`jinho-choi.md` → `/people/jinho-choi/`).

### Logo and favicons

- Full logo for the header: [`public/emorynlp-logo.png`](public/emorynlp-logo.png).
- Tab / home-screen icons generated from that file: `favicon.ico`, `favicon-32x32.png`, and `apple-touch-icon.png` in [`public/`](public/). If you replace the logo, overwrite the PNG and regenerate those three files (resize to 16/32/48 px for the ICO, 32 px PNG, and 180 px for Apple touch) so tabs and bookmarks stay crisp.

## Deploying via GitHub Actions

1. Push to **`main`**; the workflow in [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) builds and uploads `dist/` to Pages.
2. In the repository settings, under **Pages → Build and deployment → Source**, choose **GitHub Actions** (not “Deploy from a branch”).
3. The first deployment may prompt you to create the **`github-pages`** deployment environment—approve once if required.

Branches other than `main` do not auto-deploy unless you extend the workflow.

## License / attribution

Adapt content and attribution as appropriate for lab members and collaborators.
