---
title: "SB Sommar – Architecture: CI and Deploy"
---

# SB Sommar – Architecture: CI and Deploy

The event-data CI pipeline, the camps.yaml validator, the Markdown converter, the PHP API for shared hosting, and content-hash asset cache-busting.

Part of [the architecture index](./index.md). Section IDs (`03-§N.M`) are stable and cited from code; they do not encode the file path.

---

## 11. Event Data CI Pipeline

When a participant submits or edits an activity, `source/api/github.js` opens an ephemeral
PR from a branch named `event/**` (add) or `event-edit/**` (edit). The pipeline has two
phases:

1. **PR check** (`.github/workflows/event-data-deploy.yml`) — a no-op job that satisfies
   branch protection so auto-merge can proceed.
2. **Post-merge deploy** (`.github/workflows/event-data-deploy-post-merge.yml`) — installs
   production dependencies via `setup-node` + `npm ci --omit=dev`, builds the site, and
   deploys event-data pages to all environments via SCP.

All event data validation (injection patterns, link protocol, length limits, structural
checks) runs in the API layer at submission time (see §11.6). Data that reaches git is
already validated.

### 11.1 Dependency installation

Each deploy job uses `actions/setup-node@v4` with `node-version: '20'` and `cache: 'npm'`
to install Node.js and restore the npm cache. Production dependencies (`js-yaml`, `marked`,
`qrcode`) are installed via `npm ci --omit=dev`.

For the QA job, setup-node and npm ci are conditional on the gate step —
skipped when no event data file changed. For the production job they run unconditionally
because the gate step itself uses `node -e` with `js-yaml` to check QA camp status.

> **Note:** §11.1 previously described a Docker build image (`ghcr.io/<owner>/<repo>`).
> That approach was replaced by setup-node + npm cache (see 02-requirements/build-deploy.md §52).

### 11.2 PR check (event-data-deploy.yml)

A single job that:

- Triggers on PRs to `main` with path `source/data/**.yaml`, filtered to branches
  matching `event/` or `event-edit/` prefixes.
- Logs "Validated at API layer" and exits successfully.

This job exists solely to satisfy branch protection. No validation, build, or deploy
runs during the PR phase.

### 11.3 Post-merge deploy (event-data-deploy-post-merge.yml)

Triggers on push to `main` with path filter `source/data/**.yaml`. Uses
`actions/setup-node@v4` with npm cache and `npm ci --omit=dev` for dependency installation.

Two deploy jobs start immediately in parallel — there is no separate detect job.
Each job performs its own inline detection as a first step:

- **deploy-qa** — detects changed file inline, builds with QA environment secrets,
  uploads via rsync.
- **deploy-prod** — detects changed file inline and checks QA camp status; skips
  build and deploy when the file belongs to a QA camp. Otherwise builds with
  production environment secrets and uploads via SCP.

Each deploy job:

1. Checks out the repository with `fetch-depth: 2`.
2. Detects the changed per-camp YAML file by comparing `HEAD~1..HEAD`.
   If no event data file changed, the remaining steps are skipped.
3. (Production only) Determines whether the changed file belongs to a QA
   camp. If so, the remaining steps are skipped.
4. Runs `node source/build/build.js`.
5. Stages only event-data-derived files: `schema.html`, `idag.html`,
   `live.html`, `events.json`, `schema.rss`, `schema.ics`,
   `kalender.html`, and per-event pages under `schema/`.
6. Uploads the staged files via SCP to the target environment.

### 11.4 CI workflow for data-only changes

`ci.yml` detects data-only changes (`has_code == false`) and skips `npm ci` and
`npm run build` entirely. The job passes after the detect step. Building event-data
changes is the responsibility of the post-merge deploy workflow.

### 11.5 Relationship to existing workflows

| Workflow | Trigger | Scope |
| --- | --- | --- |
| `ci.yml` | All branches + PRs | Lint, test, build for code changes; pass-through for data-only |
| `event-data-deploy.yml` | PRs from `event/**`, `event-edit/**` | No-op branch protection gate |
| `event-data-deploy-post-merge.yml` | Push to `main` (data YAMLs only) | setup-node + npm ci + build + deploy to QA, Production |
| `deploy-qa.yml` | Push to `main` (ignores data YAMLs) | Full build + SCP/SSH swap (QA) |
| `deploy-prod.yml` | Manual `workflow_dispatch` | Full build + SCP/SSH swap (Production) |
| `deploy-reusable.yml` | Called by `deploy-qa.yml` / `deploy-prod.yml` | Shared build-and-deploy logic |
| `docker-build.yml` | Push to `main` (package.json or Dockerfile) | Build and push Docker image to GHCR (no longer used by event-data deploy) |

`deploy-qa.yml` uses `paths-ignore` so that pushes to `main` containing only YAML data
file changes do not trigger a full site deploy — the event-data pages are deployed by
`event-data-deploy-post-merge.yml`.

### 11.6 API-layer security validation

The injection pattern scan and link protocol check are performed at the API layer,
inside `validateFields()` in `source/api/validate.js` (Node.js) and
`api/src/Validate.php` (PHP). Dangerous payloads are rejected with HTTP 400
**before** any data reaches the git repository.

Checks:

- **Injection patterns** (case-insensitive): `<script`, `javascript:`, `on\w+=`,
  `<iframe`, `<object`, `<embed`, `data:text/html`.
- **Fields scanned**: `title`, `location`, `responsible`, `description`.
- **Link protocol**: non-empty `link` must start with `http://` or `https://`.
- **Control characters / line breaks** (02-§102): the single-line scalar fields
  `title`, `location`, `responsible`, `link`, and `ownerName` are rejected if
  (after trimming) they contain any character in `U+0000`–`U+001F` or `U+007F`.
  This prevents a value from breaking out of its line and altering the appended
  YAML structure. `description` is the only multi-line field: it permits tab
  (`U+0009`), line feed (`U+000A`), and carriage return (`U+000D`) and rejects
  every other control character.

#### Whole-document validation before a pull request (02-§102.5)

The add-event and batch-add-event flows build the new file by appending a
hand-built YAML block to the existing camp file (`buildEventYaml()` in
`source/api/github.js` / `GitHub::buildEventYaml()` in PHP). After the new
content is assembled and **before** any branch, commit, or pull request is
created, the complete document is parsed (`yaml.load` / `Yaml::parse`) and
checked to contain an `events` list including every newly created event id. If
the parse fails or an id is missing, the operation throws and nothing is written
to git. This is the defence-in-depth backstop behind the field-level control-char
checks above.

The edit and delete flows do not need this backstop: they rebuild the document
with the YAML serializer (`yaml.dump` / `Yaml::dump`, see 02-§10.4), which
cannot emit structurally invalid YAML even if a field somehow held a newline.

Carriage returns in `description` are normalised to line feeds in
`buildEventYaml()` before the literal block is emitted, so the stored value uses
`\n` line endings regardless of the submitter's platform (02-§102.4).

### 11.7 Required repository settings

- **"Allow auto-merge"** must be enabled in Settings > General > Pull Requests.
- The `event-data-deploy.yml` job name must be a required status check in branch
  protection for `main`.
- No new secrets are needed beyond the existing SSH deploy secrets (scoped per
  GitHub Environment; see [08-ENVIRONMENTS.md](08-ENVIRONMENTS.md)).

---

## 19. camps.yaml Validator (`source/scripts/validate-camps.js`)

A validation and sync tool that enforces `camps.yaml` as the single source of
truth for camp metadata. It runs as a standalone script and is importable as a
module for tests.

### 19.1 What it does

1. **Validates `camps.yaml`** — checks required fields, date formats, date
   ordering, boolean types, and uniqueness of `id` and `file` values.
2. **Creates missing camp files** — if a camp's `file` does not exist in
   `source/data/`, the script creates it with a `camp:` header derived from
   `camps.yaml` and an empty `events: []` section.
3. **Syncs camp headers** — if a camp file exists but its `camp:` header
   differs from `camps.yaml`, the script rewrites the header to match.
   The `events:` section is preserved unchanged.

### 19.2 Field mapping

The `camp:` header in each camp file contains exactly five fields, derived
from `camps.yaml`:

| Camp file field | `camps.yaml` source field |
| --------------- | ------------------------- |
| `id`            | `id`                      |
| `name`          | `name`                    |
| `location`      | `location`                |
| `start_date`    | `start_date`              |
| `end_date`      | `end_date`                |

Field order in the generated header: `id`, `name`, `location`, `start_date`,
`end_date`. This matches the data contract example (05-DATA_CONTRACT.md §7).

### 19.3 YAML serialisation

Camp files are written using `js-yaml` `dump()` with explicit string quoting
for date values to preserve `'YYYY-MM-DD'` format. The `events:` section is
serialised as-is; no event data is modified.

### 19.4 Integration

- CLI: `node source/scripts/validate-camps.js`
- npm: `npm run validate:camps`
- Module: `const { validateCamps } = require('./validate-camps')`
- Exit code: 0 on success, 1 on validation errors

### 19.5 Files

| File | Role |
| ---- | ---- |
| `source/scripts/validate-camps.js` | Validator script |

---

## 20. Markdown Converter (`marked`)

The build converts Markdown content files to HTML using the `marked` library
(production dependency, build-time only). This replaced a hand-rolled converter
that only supported a subset of Markdown.

### 20.1 Integration

`source/build/render-index.js` creates a `Marked` instance with custom renderers:

- **Heading offset**: shifts heading depth by `headingOffset` (capped at `h6`).
- **Image class**: adds `class="content-img"` and `loading="lazy"` to all images.

`convertMarkdown(input, headingOffset, collapsible)` calls `marked.parse()` and
optionally post-processes the HTML for collapsible accordions.

`inlineHtml(text)` uses `marked.parseInline()` for inline-only conversion
(used by `renderLocationAccordions`).

### 20.2 Collapsible mode

When `collapsible: true`, the HTML output is split at the target heading level
(`<h{2+offset}>`). Each segment starting with that heading becomes a
`<details class="accordion">` element. Content before the first such heading
is left unwrapped.

### 20.3 Event description Markdown

`source/build/markdown.js` provides two functions for processing the
`description` field in event data:

- **`renderDescriptionHtml(text)`** — converts Markdown to HTML via
  `marked.parse()`, configured with sanitizing renderer overrides from
  `source/assets/js/client/markdown-renderers.js`. The `html` renderer
  returns the empty string, so any raw HTML (block or inline) the
  Markdown parser tokenizes — `<script>`, `<iframe>`, `<object>`,
  `<embed>`, `on*` event handlers, anything else — is dropped before
  it can reach the output. The `link` and `image` renderers neutralize
  any URI whose scheme (after stripping leading whitespace and control
  characters and lowercasing) matches `javascript:`, `vbscript:`,
  `data:`, or `file:`, replacing it with an empty `href`/`src`. Used by
  `render-event.js`, `render.js`, `render-today.js`, `render-idag.js`,
  and `render-arkiv.js`.
- **`stripMarkdown(text)`** — removes Markdown syntax and returns plain text.
  Used by `render-rss.js` and `render-ical.js` where formatted HTML is not
  appropriate.

The same `markdown-renderers.js` module is shipped to the browser and
consumed by `source/assets/js/client/markdown-preview.js` so that the
live preview on `/lagg-till.html` and `/redigera.html` produces the
same sanitized output as the build, byte for byte. The dual CJS+IIFE
wrapper exposes `module.exports` in Node and `window.MarkdownRenderers`
in the browser from the same source file. Keeping the renderer logic
in one file removes the parity drift that previously required
duplicated regex sanitizers in build and preview code paths.

### 20.4 Files

| File | Role |
| ---- | ---- |
| `source/build/render-index.js` | `convertMarkdown()`, `inlineHtml()`, `createMarked()` |
| `source/build/markdown.js` | `renderDescriptionHtml()`, `stripMarkdown()` |
| `source/assets/js/client/markdown-renderers.js` | Sanitizing `renderers` and `isUnsafeUri()` — shared between build and browser preview |
| `source/assets/js/client/markdown-preview.js` | Live preview wired to the shared renderers |
| `source/assets/css/style.css` | Table styles for markdown-rendered tables |

---

## 21. PHP API for Shared Hosting

### Motivation

The Node.js API (`app.js`) requires Passenger or a similar process manager on
the host. Loopia (the target webhotell) supports PHP and Apache but not Node.js.
A PHP implementation of the same API allows the entire site — static files and
API — to be served from a single shared hosting account.

### Architecture

The PHP API mirrors the Node.js API endpoint-for-endpoint:

| Node.js route | PHP route | Behaviour |
| --- | --- | --- |
| `POST /add-event` | `POST /api/add-event` | Validate → respond → commit to GitHub |
| `POST /edit-event` | `POST /api/edit-event` | Validate → verify ownership → commit to GitHub |
| `GET /` (health) | `GET /api/health` | Returns `{"status":"API running"}` |

The PHP API lives in `api/` at the project root:

```text
api/
  index.php          Front-controller: routing, CORS, JSON I/O
  .htaccess          Apache rewrite rules → index.php
  src/
    Validate.php     Input validation (mirrors source/api/validate.js)
    GitHub.php       GitHub Contents API + PR + auto-merge (mirrors source/api/github.js)
    Session.php      sb_session cookie read/write (mirrors source/api/session.js)
    TimeGate.php     Editing period enforcement (mirrors source/api/time-gate.js)
    ActiveCamp.php   Camp resolution (mirrors source/scripts/resolve-active-camp.js)
    Yaml.php         YAML read/write (uses symfony/yaml)
  composer.json      Dependencies (symfony/yaml, vlucas/phpdotenv)
  .env               Server-only, not committed (same env vars as Node.js)
```

### Routing

Apache `mod_rewrite` in `api/.htaccess` routes requests to `index.php`.
The router reads `$_SERVER['REQUEST_URI']` and dispatches to the correct handler.
Before the rewrite, `api/.htaccess` denies HTTP access to any dotfile
(name beginning with `.`), so a request for `/api/.env` returns 403 even
though `mod_rewrite` would otherwise leave existing files untouched
(§100, 02-§100.4).

### Configuration

Same environment variables as the Node.js API: `GITHUB_OWNER`, `GITHUB_REPO`,
`GITHUB_BRANCH`, `GITHUB_TOKEN`, `ALLOWED_ORIGIN`, `QA_ORIGIN`, `COOKIE_DOMAIN`,
`BUILD_ENV`, `ADMIN_TOKEN_SECRET`. Loaded via `vlucas/phpdotenv` from
`$DEPLOY_DIR/.env` — **outside** the web root, not from any path under
`public_html`. `index.php` resolves the directory as `dirname(__DIR__, 2)`
(the parent of `public_html`) and calls `Dotenv::createImmutable()` on it
(§100, 02-§100.1–02-§100.3). Keeping the secret outside the web root means
no URL can map to it; the dotfile denial above is a second, independent
layer.

### Coexistence

Both API implementations exist in the repository simultaneously. The choice of
backend is determined solely by the `API_URL` environment variable set in each
GitHub Environment:

- Local development: `npm start` → Node.js API at `http://localhost:3000`
- `qa` environment: PHP API on Loopia (`https://qa.sbsommar.se/api/add-event`)
- `production` environment: PHP API on Loopia (`https://sbsommar.se/api/add-event`)

No code in the static site needs to know which backend serves the API.
The form JavaScript reads `data-api-url` from the HTML and submits to that URL.

### Deployment

The deploy workflow uploads the `api/` directory (with `vendor/` from
`composer install --no-dev`) alongside the static site via SCP. The API
archive is built with `--exclude='.env'`, so no `.env` is ever uploaded
into the web root (02-§100.7).

The PHP API `.env` is managed manually on the server and lives at
`$DEPLOY_DIR/.env`, outside `public_html`. Because it sits outside the
directory that the zero-downtime swap replaces, it survives every release
without a backup-and-restore step (this supersedes the §53.3 persistent
backup). On deploy, if `$DEPLOY_DIR/.env` is absent but a legacy
`public_html/api/.env` exists, the static-site swap step moves it out to
`$DEPLOY_DIR/.env` once; afterwards no `.env` remains under `public_html`
(02-§100.8).

### PHP API tests (02-§103)

The PHP API is a hand-maintained mirror of the Node API, so it is tested with a
PHPUnit suite that asserts the same behaviour as the Node tests.

- **Layout:** `phpunit/phpunit` is a `require-dev` entry in `api/composer.json`;
  `api/phpunit.xml` registers a single test suite rooted at `api/tests/`;
  test classes there use the Composer PSR-4 autoloader (`SBSommar\` → `src/`).
  `composer test` (a script in `api/composer.json`) runs the suite.
- **Coverage:** `api/tests/ValidateTest.php` and `api/tests/GitHubTest.php`
  mirror `tests/validate.test.js` and `tests/github.test.js`, including the
  §102 hardening (control characters, `assertEventYamlValid`,
  `detectEventIndent`, CR normalisation) and the `responsible` 60-char limit
  (§82.3). `GitHub.php`'s network methods (`getFile`, `putFile`, the PR flow)
  are not exercised; only the pure helpers are.
- **CI:** `ci.yml` adds `shivammathur/setup-php` (PHP 8.2), `composer install`,
  and `composer test` steps, all guarded by the same `has_code` condition as the
  Node steps so data-only changes skip them (02-§103.5, 02-§103.6). A failing PHP
  test fails the job (02-§103.7).
- **Local:** after `composer install` in `api/`, `composer test` runs the suite.
  The git pre-commit hook stays Node-only, so a missing PHP toolchain never
  blocks a commit (02-§103.9).

---

## 27. Asset Cache-Busting (CSS, JS, Images)

### 27.1 Problem

CSS, JS, and images are cached by the browser (02-§67.1–67.2). When a
deploy changes these files, browsers may serve stale versions against fresh
HTML. CSS already has cache-busting (02-§69); JS and images do not.

### 27.2 Mechanism

The build applies content-based hashes as a post-processing step after all
files are written to `public/`. For each asset type the build:

1. Reads the file from `public/`.
2. Computes the first 8 hex characters of the MD5 digest.
3. Appends `?v=<hash>` to the URL in all HTML files under `public/`.

Unchanged files produce the same hash across builds, so browsers continue
serving them from cache. Changed files produce a new hash, forcing a cache
miss.

### 27.3 Asset types

| Asset type | HTML attribute | Pattern | Requirement |
| ---------- | -------------- | ------- | ----------- |
| CSS | `href="style.css"` | `href="style.css?v=<hash>"` | 02-§69.1–69.3 |
| JS | `src="<file>.js"` | `src="<file>.js?v=<hash>"` | 02-§77.1–77.3 |
| Images (`src`) | `src="<file>.<ext>"` | `src="<file>.<ext>?v=<hash>"` | 02-§78.1–78.3 |
| Images (`href`) | `href="<file>.<ext>"` | `href="<file>.<ext>?v=<hash>"` | 02-§86.1 |
| Manifest icons | `"src": "<file>.<ext>"` | `"src": "<file>.<ext>?v=<hash>"` | 02-§86.2 |

### 27.4 Constraints

- Applied as a post-processing step — no render function signatures
  change.
- Each asset file is read once per build; the hash is reused across all
  HTML files that reference it.

### 27.5 Files

| File | Role |
| ---- | ---- |
| `source/build/build.js` | Post-processing: hash computation and URL rewriting |

---

## 34. Documentation Site Layout and Navigation

### 34.1 Context

The documentation site (02-§97) is served by GitHub Pages using its
built-in default theme, `jekyll-theme-primer`. Primer already wraps every
rendered page — not only the landing page — in chrome: a site-title link
back to the landing page, a max-width `markdown-body` container, a
system sans-serif typeface, syntax highlighting, and the robots meta
(02-§97.20) via the head-custom include. GitHub Pages derives a page
`<title>` from the first `#` heading even when a file has no front-matter.

Three gaps remain. Primer shows no breadcrumb, so a reader on a deep page
(for example `02-requirements/pages-navigation.html`) cannot see which
family the page belongs to. Primer offers no navigation between sibling
files within a family; the only inter-doc link is the in-content "Part of
the … index" line. And Primer renders the site title as an `<h1>`, so
every page carries two `<h1>` elements — the site title and the
document's own heading. Requirements 02-§97.22–97.29 close these gaps.

### 34.2 Approach — extend Primer, do not replace it

The site keeps `jekyll-theme-primer`. A project-owned
`docs/_layouts/default.html` shadows the theme's layout: it reproduces
Primer's page structure (head, container, content) and links Primer's
generated stylesheet (`assets/css/style.css`), so the existing
typography, tables, and code highlighting are unchanged, while adding the
breadcrumb and the within-family navigation. Replacing Primer with an
own-CSS layout or switching to `just-the-docs` were both evaluated and
rejected; see appendix §10.

### 34.3 Layout application and front-matter

`docs/_config.yml` sets `defaults` so that every page under `docs/`
receives `layout: default` without per-file opt-in (02-§97.22). Every
`.md` file under `docs/` carries YAML front-matter with a `title`
(02-§97.25). The layout uses `page.title` only for the `<title>` element
and the breadcrumb — never as an on-page heading. The site title in the
header is rendered as non-heading chrome (a styled link, not an `<h1>`),
so the document's own top-level `#` heading is the single `<h1>` on the
page (02-§97.26).

### 34.4 Breadcrumb

For a page inside a documentation subfolder, the layout derives the
family from the page's URL path (for example `02-requirements/`) and
renders a one-level breadcrumb above the content that links back to the
landing page and names the family (02-§97.27). The landing page itself
shows no breadcrumb. The human-readable family name comes from the same
data source as the navigation block (§34.5).

### 34.5 Within-family navigation

A single data file, `docs/_data/docs-nav.yml`, lists each documentation
family (`02-requirements/`, `03-architecture/`, `07-design/`,
`99-traceability/`) and the files that belong to it. The include
`docs/_includes/family-nav.html` selects the entry matching the current
page's family and renders links to its sibling files, emitted as a
navigation block below the content (02-§97.28). Because the listing lives
in one data file, adding or removing a family member updates every
sibling's navigation and the breadcrumb's family name without editing any
individual page (02-§97.29).

### 34.6 Robots policy preserved

The project-owned layout owns the `<head>`, and it includes the existing
`head-custom.html` so the `<meta name="robots" content="noindex,
nofollow">` tag remains the single source of the robots directive
(02-§97.20). The dual head-custom filenames stay shipped; with Primer
still active as the theme they remain harmless, and the requirement's
desired state — the tag present in the `<head>` of every rendered page —
is unchanged.

### 34.7 Files

| File | Role |
| ---- | ---- |
| `docs/_config.yml` | `defaults` applying `layout: default` to every page |
| `docs/_layouts/default.html` | Shadow layout: Primer structure + breadcrumb + family nav, single `<h1>` |
| `docs/_data/docs-nav.yml` | Single source listing families and their files |
| `docs/_includes/family-nav.html` | Renders the within-family navigation block |
| `docs/_includes/breadcrumb.html` | Renders the one-level breadcrumb |

---
