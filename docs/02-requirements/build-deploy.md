# SB Sommar – Requirements: Build and Deploy

CI pipelines, lint gates, environments (local/QA/production), zero-downtime deploy, release docs, footer version, the docs site build.

Part of [the requirements index](./index.md). Section IDs (`02-§N.M`) are stable and cited from code; they do not encode the file path.

---

## 23. Event Data CI Pipeline — superseded by §50

> §23.1–§23.13 are superseded — see [Archived (superseded)](./archive.md).
> §23.14 still applies to `ci.yml`.

### 23.0 Git history for branch comparison

- CI workflows that compare the PR branch to `main` to detect changed files must check out
  with sufficient git history for the three-dot diff (`origin/main...HEAD`) to find a merge
  base. A shallow checkout (depth 1) is not sufficient. <!-- 02-§23.14 -->

---

---

## 32. HTML Validation in CI

The build generates HTML pages. Invalid HTML must be caught automatically
before merge. This closes the `CL-§5.1` gap.

### 32.1 Tool

- HTML validation uses `html-validate` — a standard, offline HTML
  validator with configurable rules. <!-- 02-§32.1 -->

### 32.2 Scope

- Validation runs against all `.html` files in `public/` after the
  build step completes. <!-- 02-§32.2 -->

### 32.3 CI integration

- A `lint:html` npm script runs `html-validate` on `public/*.html`. <!-- 02-§32.3 -->
- The CI workflow (`ci.yml`) runs `lint:html` after the build step. <!-- 02-§32.4 -->
- HTML validation failures cause the CI job to fail. <!-- 02-§32.5 -->
- HTML validation is skipped for data-only commits (same condition as
  existing lint steps). <!-- 02-§32.6 -->

### 32.4 Configuration

- The tool is configured via `.htmlvalidate.json` at the project root. <!-- 02-§32.7 -->
- Rules must be tuned to accept the existing generated HTML without
  false positives. Overly strict rules that conflict with the project's
  markup patterns must be disabled or adjusted. <!-- 02-§32.8 -->

---

---

## 33. CSS Linting in CI

CSS source files must be linted automatically before merge. This closes
the `CL-§5.2` gap.

### 33.1 Tool

- CSS linting uses Stylelint with `stylelint-config-standard` as the
  base configuration. <!-- 02-§33.1 -->

### 33.2 Scope

- Linting runs against all `.css` files in `source/assets/cs/`. <!-- 02-§33.2 -->

### 33.3 CI integration

- A `lint:css` npm script runs Stylelint on the CSS source files. <!-- 02-§33.3 -->
- The CI workflow (`ci.yml`) runs `lint:css` alongside the existing
  lint steps. <!-- 02-§33.4 -->
- CSS lint failures cause the CI job to fail. <!-- 02-§33.5 -->
- CSS linting is skipped for data-only commits (same condition as
  existing lint steps). <!-- 02-§33.6 -->

### 33.4 Configuration

- The tool is configured via `.stylelintrc.json` at the project root. <!-- 02-§33.7 -->
- Rules must be tuned to accept the existing CSS without false
  positives. Rules that conflict with project conventions (e.g.
  custom property patterns, selector patterns) must be disabled or
  adjusted. <!-- 02-§33.8 -->

---

---

## 40. Zero-Downtime Static Site Deploy

The static site deploy must use a staging-and-swap strategy that limits
downtime to milliseconds. The build output is uploaded to a staging directory
via SCP, then swapped into the live web root with server-side `mv` operations.

### 40.1 Deploy method (site requirements)

- The static site must be uploaded to a staging directory on the server
  via `scp` over SSH, not via FTP. <!-- 02-§40.1 -->
- After upload, an SSH command must swap the staging directory into
  the live web root (`public_html`). <!-- 02-§40.2 -->
- The swap must preserve the hosting infrastructure `domains/` directory
  inside `public_html` by moving it into the new release before the
  swap. <!-- 02-§40.3 -->
- Downtime during the swap must be limited to the time needed for two
  `mv` operations on the same filesystem (milliseconds, not seconds). <!-- 02-§40.4 -->
- Leftover directories from the previous release (`public_html_old`)
  and from any previous failed deploy (`release_new`) must be cleaned
  up automatically. <!-- 02-§40.5 -->

### 40.2 Build packaging (site requirements)

- The build output must be packaged into a single `tar.gz` archive
  before upload, to avoid per-file transfer overhead. <!-- 02-§40.6 -->
- The archive must be extracted on the server side into the staging
  directory. <!-- 02-§40.7 -->
- The archive must be deleted from the server after extraction. <!-- 02-§40.8 -->

### 40.3 Secrets and configuration (site requirements)

- The deploy must use the existing SSH secrets: `SERVER_HOST`,
  `SERVER_USER`, `SERVER_SSH_KEY`, `SERVER_SSH_PORT`. <!-- 02-§40.9 -->
- A new secret `DEPLOY_DIR` must be added, pointing to the domain
  directory on the server (the parent of `public_html`). <!-- 02-§40.10 -->
- The FTP static-site upload step and `FTP_TARGET_DIR` validation
  step must be removed from the workflow. <!-- 02-§40.11 -->

### 40.4 Unchanged behaviour (site requirements)

- The server app deploy (FTP + SSH restart) must remain unchanged.
  **Superseded by 02-§43.6–43.8**: the FTP step is now removed; SSH
  restart is sufficient. <!-- 02-§40.12 -->
- The build step (checkout, node setup, npm ci, npm run build) must
  remain unchanged. <!-- 02-§40.13 -->
- The workflow trigger (push to `main`, paths-ignore data files) must
  remain unchanged. <!-- 02-§40.14 -->

### 40.5 Error handling (site requirements)

- The SSH swap script must use `set -e` so any failing command aborts
  the deploy immediately. <!-- 02-§40.15 -->
- If the swap fails mid-way, the state must be recoverable by a
  subsequent deploy (clean-up of stale directories at the start of
  the script). <!-- 02-§40.16 -->

---

---

## 41. Environment Management

The project uses three environments — Local, QA, and Production — deployed
from a single `main` branch. Code changes are promoted to Production manually;
event data reaches both environments immediately.

### 41.1 Environments (site requirements)

- The project must define three environments: Local, QA, and
  Production. <!-- 02-§41.1 -->
- QA deploys the full site automatically on every push to
  `main`. <!-- 02-§41.2 -->
- Production deploys the full site only via a manual
  `workflow_dispatch` trigger. <!-- 02-§41.3 -->
- Both QA and Production deploy from the `main` branch; no separate
  production branch exists. <!-- 02-§41.4 -->
- Event data submitted via the API always commits to `main`, regardless
  of which environment the API runs in. <!-- 02-§41.5 -->

### 41.2 GitHub Environments (site requirements)

- QA deploy secrets must be scoped to a GitHub Environment named
  `qa`. <!-- 02-§41.6 -->
- Production deploy secrets must be scoped to a GitHub Environment
  named `production`. <!-- 02-§41.7 -->
- Each environment must have its own independent values for:
  `SITE_URL`, `API_URL`, `SERVER_HOST`, `SERVER_USER`,
  `SERVER_SSH_KEY`, `SERVER_SSH_PORT`, `DEPLOY_DIR`.
  Production additionally requires: `FTP_HOST`, `FTP_USERNAME`,
  `FTP_PASSWORD`, `FTP_APP_DIR`, `FTP_TARGET_DIR`.
  QA no longer uses FTP secrets (see §43). <!-- 02-§41.8 -->

### 41.3 Reusable deploy workflow (site requirements)

- A reusable workflow (`.github/workflows/deploy-reusable.yml`) must
  contain the shared build-and-deploy logic. <!-- 02-§41.9 -->
- The reusable workflow must accept the environment name as an
  input. <!-- 02-§41.10 -->
- `deploy-qa.yml` must call the reusable workflow with environment
  `qa`. <!-- 02-§41.11 -->
- `deploy-prod.yml` must call the reusable workflow with environment
  `production`. <!-- 02-§41.12 -->
- The original `deploy.yml` must be removed after the split is
  complete. <!-- 02-§41.13 -->

### 41.4 Event data deploy (site requirements)

- When an event PR merges, `event-data-deploy.yml` must deploy the
  event data pages to both QA and Production in
  parallel. <!-- 02-§41.14 -->
- Each parallel deploy job must build with its own environment's
  `SITE_URL` and `API_URL` so that per-event page links point to the
  correct domain. <!-- 02-§41.15 -->

### 41.5 Hardcoded URL fix (site requirements)

- The QR code URL in `build.js` must use the `SITE_URL` environment
  variable instead of a hardcoded domain. <!-- 02-§41.16 -->

### 41.6 CI workflow (site requirements)

- `ci.yml` does not need environment-scoped secrets; its `SITE_URL`
  remains a repository-level secret. <!-- 02-§41.17 -->

### 41.7 Local development (site requirements)

- Local development uses `.env` for all environment
  variables. <!-- 02-§41.18 -->
- `.env.example` must document the environment management
  setup. <!-- 02-§41.19 -->

---

---

## 43. Replace FTP with SSH for QA Deploys

FTP transmits credentials in cleartext and requires a separate set of secrets
(`FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`). The static site deploy already
uses SCP/SSH. This section migrates the remaining FTP-based deploy steps to
SSH for the QA environment, reducing the attack surface and the number of
secrets to manage. Production remains on FTP until QA is validated.

### 43.1 Event data deploy — QA (site requirements)

- The `deploy-qa` job in `event-data-deploy.yml` must upload event data
  pages via SCP over SSH instead of FTP. <!-- 02-§43.1 -->
- The upload must use the existing QA SSH secrets: `SERVER_HOST`,
  `SERVER_USER`, `SERVER_SSH_KEY`, `SERVER_SSH_PORT`. <!-- 02-§43.2 -->
- The target directory must be derived from `DEPLOY_DIR` (the same
  secret the full site deploy uses), with `/public_html/` appended,
  instead of requiring a separate `FTP_TARGET_DIR` secret. <!-- 02-§43.3 -->
- The upload must include the same files as today: `schema.html`,
  `idag.html`, `live.html`, `dagens-schema.html`, `events.json`,
  `schema.rss`, and per-event detail pages under `schema/`. <!-- 02-§43.4 -->
- The `FTP_TARGET_DIR` validation step must be removed from the QA
  job. <!-- 02-§43.5 -->

### 43.2 API server deploy — remove redundant FTP step (site requirements)

- The "Upload server app to FTP" step in `deploy-reusable.yml` must
  be removed. <!-- 02-§43.6 -->
- The "Stage server files for upload" step must also be removed, since
  it only exists to feed the FTP step. <!-- 02-§43.7 -->
- The SSH restart step (`Deploy API via SSH`) must remain unchanged —
  it already performs `git pull` and `npm install`, which is sufficient
  to deploy the API server. <!-- 02-§43.8 -->

### 43.3 Production — superseded by §50.5

> §43.9–§43.10 are superseded — see [Archived (superseded)](./archive.md).

### 43.4 Documentation (site requirements)

- `docs/08-ENVIRONMENTS.md` must be updated to reflect that QA no longer
  requires FTP secrets for event data deploy. <!-- 02-§43.11 -->
- `docs/04-OPERATIONS.md` must be updated to describe the new QA event
  data deploy method (SCP instead of FTP). <!-- 02-§43.12 -->
- The secrets schema in `08-ENVIRONMENTS.md` must note which FTP secrets
  are production-only and which are shared. <!-- 02-§43.13 -->

### 43.5 QA FTP secret cleanup (operational)

- After verifying the QA SCP deploy works, the FTP secrets (`FTP_HOST`,
  `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_APP_DIR`, `FTP_TARGET_DIR`) should
  be removed from the `qa` GitHub Environment. <!-- 02-§43.14 -->
- This is a manual step — no automation required. <!-- 02-§43.15 -->

---

---

## 44. PHP API for Shared Hosting

The Node.js API server (`app.js`) requires a Node.js-capable host with Passenger
or a similar process manager. Loopia (the target webhotell) supports PHP and
Apache but not Node.js. This section adds a PHP implementation of the same API
so that the entire site — static files and API — can be served from a single
shared hosting account.

The Node.js API is kept intact for local development and for any future host
that supports Node.js.

### 44.1 PHP API endpoints (site requirements)

- The PHP API must implement `POST /api/add-event` with the same request body,
  validation rules, and response format as the Node.js `POST /add-event`. <!-- 02-§44.1 -->
- The PHP API must implement `POST /api/edit-event` with the same request body,
  validation rules, and response format as the Node.js `POST /edit-event`. <!-- 02-§44.2 -->
- Both endpoints must return JSON responses with `Content-Type: application/json`. <!-- 02-§44.3 -->
- A `GET /api/health` endpoint must return `{"status":"API running"}` for
  monitoring and deploy verification. <!-- 02-§44.4 -->

### 44.2 Input validation (site requirements)

- All validation rules from §10 (required fields, type checks, length limits,
  YAML safety) must be replicated in the PHP implementation. <!-- 02-§44.5 -->
- Camp date range validation (event date must fall within the active camp's
  `start_date..end_date`) must be enforced. <!-- 02-§44.6 -->
- Past-date blocking (§27) must be enforced for both add and edit. <!-- 02-§44.7 -->
- Edit requests must require a non-empty `id` field. <!-- 02-§44.8 -->

### 44.3 Time-gating (site requirements)

- The PHP API must enforce the same time-gating rules as the Node.js API
  (§26): submissions are accepted only when today falls within
  `opens_for_editing..end_date + 1 day`. <!-- 02-§44.9 -->
- When outside the editing period, both endpoints must return HTTP 403 with
  the same Swedish error message as the Node.js implementation. <!-- 02-§44.10 -->

### 44.4 GitHub integration (site requirements)

- The PHP API must commit new events to the active camp's YAML file via the
  GitHub Contents API, using the same ephemeral-branch → PR → auto-merge
  pipeline as the Node.js implementation. <!-- 02-§44.11 -->
- Edit requests must patch the existing event in the YAML file using the
  same field replacement logic as the Node.js `patchEventInYaml`. <!-- 02-§44.12 -->
- The active camp must be resolved by reading `source/data/camps.yaml` from
  GitHub (not from a local file), using the same derivation rules as
  `resolveActiveCamp`. <!-- 02-§44.13 -->
- YAML serialisation must produce output compatible with the existing data
  contract (05-DATA_CONTRACT.md). <!-- 02-§44.14 -->

### 44.5 Session cookies (site requirements)

- The PHP API must read and write the `sb_session` cookie using the same
  format (URL-encoded JSON array of `{ id, exp, sig }` ownership entries) as
  the Node.js implementation. <!-- 02-§44.15 -->
- Cookie attributes must match: `Path=/`, `Max-Age=604800`, `Secure`,
  `SameSite=Strict`, and optional `Domain` when `COOKIE_DOMAIN` is set. <!-- 02-§44.16 -->
- Edit requests must verify that the session cookie contains valid ownership
  for the target event; return HTTP 403 if not. <!-- 02-§44.17 -->
- The cookie is only set when the client signals consent
  (`cookieConsent: true` in the request body). <!-- 02-§44.18 -->

### 44.6 CORS (site requirements)

- The PHP API must set CORS headers (`Access-Control-Allow-Origin`,
  `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`,
  `Access-Control-Allow-Credentials`) for origins listed in
  `ALLOWED_ORIGIN` and `QA_ORIGIN` environment variables. <!-- 02-§44.19 -->
- `OPTIONS` preflight requests must return HTTP 204 with the correct
  CORS headers. <!-- 02-§44.20 -->

### 44.7 Configuration (site requirements)

- The PHP API must read configuration from environment variables with the
  same names as the Node.js API: `GITHUB_OWNER`, `GITHUB_REPO`,
  `GITHUB_BRANCH`, `GITHUB_TOKEN`, `ALLOWED_ORIGIN`, `QA_ORIGIN`,
  `COOKIE_DOMAIN`, `BUILD_ENV`. <!-- 02-§44.21 -->
- On Loopia, environment variables are provided via a `.env` file in the
  API directory. The PHP API must load this file at startup if it
  exists. <!-- 02-§44.22 -->
- `GITHUB_TOKEN` and other secrets must never appear in error responses
  or logs visible to end users. <!-- 02-§44.23 -->

### 44.8 File structure (site requirements)

- The PHP API must live in an `api/` directory at the project root,
  separate from the Node.js source. <!-- 02-§44.24 -->
- Dependencies are managed via Composer (`api/composer.json`). <!-- 02-§44.25 -->
- The directory structure must be: `api/index.php` (router/entry point),
  `api/src/` (modules), `api/composer.json`, and `api/.env.example` (the
  committed template). The runtime `.env` is not committed (git-ignored)
  and, on the server, lives outside the web root at `$DEPLOY_DIR/.env`
  (§100), not under `api/`. <!-- 02-§44.26 -->

### 44.9 Apache routing (site requirements)

- An `.htaccess` file in the `api/` directory must route requests to
  `index.php` (front-controller pattern), after first denying dotfiles
  (§100, 02-§100.4). <!-- 02-§44.27 -->
- The `.htaccess` must work on Loopia's Apache 2.4 with `mod_rewrite`
  enabled. <!-- 02-§44.28 -->

### 44.10 Deployment (site requirements)

- The deploy workflow must upload the `api/` directory (including
  `vendor/`) to the server alongside the static site. <!-- 02-§44.29 -->
- `composer install --no-dev` must run either locally in CI or the
  `vendor/` directory must be included in the deploy archive. <!-- 02-§44.30 -->
- The `.env` file on the server is managed manually — it is not part
  of the deploy archive. <!-- 02-§44.31 -->

### 44.11 Build integration (site requirements)

- The build must set `API_URL` to point to the PHP API path
  (e.g. `https://sbsommar.se/api/add-event`) when building for
  environments that use the PHP API. <!-- 02-§44.32 -->
- The existing Node.js `API_URL` format remains valid for environments
  that still use the Node.js API. <!-- 02-§44.33 -->

### 44.12 Coexistence with Node.js API (site requirements)

- The Node.js API (`app.js`, `source/api/`) must remain fully functional
  and unmodified. <!-- 02-§44.34 -->
- Local development continues to use `npm start` (Node.js). <!-- 02-§44.35 -->
- The choice of API backend is determined solely by the `API_URL`
  environment variable in each GitHub Environment. <!-- 02-§44.36 -->

### 44.13 Documentation (site requirements)

- `docs/04-OPERATIONS.md` must document the PHP API: directory structure,
  configuration, and how to set it up on a new host. <!-- 02-§44.37 -->
- `docs/08-ENVIRONMENTS.md` must document the `qa` GitHub Environment
  (PHP on Loopia) and its secrets. <!-- 02-§44.38 -->
- `docs/03-architecture/` must note the dual API architecture (Node.js
  for local dev and Node.js hosts, PHP for shared hosting). <!-- 02-§44.39 -->

---

---

## 50. Docker-Based Event Data CI Pipeline

Event data validation (injection patterns, link protocol, length limits) runs in the
API layer at submission time. Data that reaches git is already validated. The CI
pipeline for event-data PRs provides a branch-protection gate, and a post-merge
workflow builds and deploys event-data files.

> §50.1–§50.7 (Docker image and build workflow) are superseded by §52 — see
> [Archived (superseded)](./archive.md).

### 50.3 Event data PR check (site requirements)

- `event-data-deploy.yml` must contain a single job that logs "Validated at API
  layer" and passes. <!-- 02-§50.8 -->
- The workflow must trigger on PRs to `main` with path `source/data/**.yaml` and
  only for branches matching `event/` and `event-edit/` prefixes. <!-- 02-§50.9 -->

### 50.4 Post-merge event data deploy (site requirements)

- A workflow (`.github/workflows/event-data-deploy-post-merge.yml`) must trigger
  on push to `main` with path filter `source/data/**.yaml`. <!-- 02-§50.11 -->
- The workflow must use the pre-built Docker image from GHCR instead of
  `setup-node` + `npm ci`. <!-- 02-§50.12 -->
- §50.13 and §50.14 (pre-merge detect job) are superseded by §51 — see
  [Archived (superseded)](./archive.md).
- The workflow must build the site using `node source/build/build.js`. <!-- 02-§50.15 -->
- The workflow must stage only event-data-derived files for upload: `schema.html`,
  `idag.html`, `live.html`, `dagens-schema.html`, `events.json`, `schema.rss`,
  `schema.ics`, `kalender.html`, and per-event pages under `schema/`. <!-- 02-§50.16 -->
- The workflow must deploy to QA via rsync in a parallel job. <!-- 02-§50.17 -->
- The workflow must deploy to Production via SCP, skipped when the changed
  file belongs to a QA camp. <!-- 02-§50.18 -->

### 50.5 Production event data deploy method (site requirements)

- Production event data deploy must use SCP over SSH. <!-- 02-§50.19 -->
- The deploy must use the existing SSH secrets: `SERVER_HOST`, `SERVER_USER`,
  `SERVER_SSH_KEY`, `SERVER_SSH_PORT`, `DEPLOY_DIR`. <!-- 02-§50.20 -->
- After validation, the FTP secrets (`FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`,
  `FTP_APP_DIR`, `FTP_TARGET_DIR`) should be removed from the production GitHub
  Environment. This is a manual step. <!-- 02-§50.22 -->

### 50.6 CI workflow for data-only changes (site requirements)

- For data-only event changes (`has_code == false`), `ci.yml` must skip
  `npm ci` and `npm run build`, letting the job pass after the detect
  step. <!-- 02-§50.23 -->
- Building event-data changes is the responsibility of the post-merge
  deploy workflow (§50.4). <!-- 02-§50.24 -->

---

---

## 51. Event Data Deploy — Eliminate Serial Detect Job

The post-merge event-data deploy workflow (§50.4) currently runs a serial
`detect` job before starting the three parallel deploy jobs. This adds
~15 seconds to the critical path because the deploy jobs must wait for
`detect` to finish before they can start. Each environment requires its
own build (different `SITE_URL` and `BUILD_ENV`), so sharing build
artifacts is not possible. Eliminating the serial dependency is the
primary lever for reducing deploy latency.

### 51.1 Workflow structure (site requirements)

- The post-merge event-data deploy workflow must NOT have a separate
  `detect` job that other jobs depend on. <!-- 02-§51.1 -->
- Each deploy job must perform its own inline detection of changed event
  data files as its first step. <!-- 02-§51.2 -->
- All deploy jobs must start immediately in parallel when the workflow
  triggers — no serial dependency between them. <!-- 02-§51.3 -->

### 51.2 Inline detection (site requirements)

- Each deploy job must check out with `fetch-depth: 2` to support
  `HEAD~1..HEAD` comparison. <!-- 02-§51.4 -->
- Each deploy job must detect changed per-camp YAML files using the same
  `git diff` logic previously in the `detect` job: filter for
  `source/data/*.yaml`, exclude `camps.yaml` and `local.yaml`. <!-- 02-§51.5 -->
- If no event data file changed, the job must skip build and deploy
  steps (exit cleanly). <!-- 02-§51.6 -->

### 51.3 Production QA gating (site requirements)

- The production deploy job must additionally determine whether the
  changed file belongs to a QA camp, using the same `camps.yaml` lookup
  as the previous `detect` job. <!-- 02-§51.7 -->
- If the changed file belongs to a QA camp, the production deploy job
  must skip build and deploy steps. <!-- 02-§51.8 -->

### 51.4 Superseded requirements

- `02-§50.13` (detect via `HEAD~1..HEAD` in a dedicated job) is
  superseded by `02-§51.2` and `02-§51.5` (inline detection per
  job). <!-- 02-§51.9 -->
- `02-§50.14` (QA detection sets `is_qa` output) is superseded by
  `02-§51.7` (inline QA check in production job only). <!-- 02-§51.10 -->

---

---

## 52. Replace Docker Container with setup-node + npm Cache

The post-merge event-data deploy workflow (§50.4) previously used a
pre-built Docker image from GHCR to avoid running `npm ci` on every
deploy. While this eliminated `npm ci` time, pulling the Docker image
itself added ~20 seconds per job. Replacing the Docker container with
`actions/setup-node` and the built-in npm cache achieves the same
dependency-availability goal with lower overhead: cache restore takes
~2–3 seconds on cache hit, and `npm ci --omit=dev` installs four small
production packages in ~3 seconds.

### 52.1 Dependency installation method (site requirements)

- The post-merge event-data deploy workflow must use
  `actions/setup-node@v4` with `node-version: '20'` and `cache: 'npm'`
  instead of a Docker container. <!-- 02-§52.1 -->
- Each deploy job must run `npm ci --omit=dev` to install only production
  dependencies. <!-- 02-§52.2 -->
- The workflow must NOT use a Docker container (`container:` key must be
  absent from all jobs). <!-- 02-§52.3 -->
- The workflow must NOT require `packages: read` permission (no GHCR
  access needed). <!-- 02-§52.4 -->

### 52.2 Conditional vs unconditional installation (site requirements)

- For the QA deploy job, `setup-node` and `npm ci` must be
  conditional on the gate step output — skipped when no event data file
  changed. <!-- 02-§52.5 -->
- For the production deploy job, `setup-node` and `npm ci` must run
  unconditionally (before the gate step), because the gate step itself
  uses `node -e` with `js-yaml` to check QA camp status. <!-- 02-§52.6 -->

### 52.3 Superseded requirements

- `02-§50.1`–`02-§50.7` (Docker image and Docker build workflow) are
  superseded — the event-data deploy workflow no longer uses a Docker
  image. <!-- 02-§52.7 -->
- `02-§50.12` (workflow must use Docker image from GHCR) is superseded
  by `02-§52.1` (setup-node + npm cache). <!-- 02-§52.8 -->

---

---

## 60. Release and Deployment Documentation

### Background

The project has a working CI/CD pipeline (QA auto-deploy, production manual
trigger) but no contributor-facing documentation explaining the deploy flow,
how to release to production, or who is authorized to do so. A new contributor
who is not familiar with the GitHub Actions setup cannot determine how their
changes reach users.

### 60.1 Contributor documentation requirements

- The contributor guide (`01-CONTRIBUTORS.md`) must include a section
  explaining what happens after a PR is merged: QA auto-deploy for code,
  dual auto-deploy for event data, and manual trigger for
  production. <!-- 02-§60.1 -->
- The contributor guide must link to the release guide for production
  deploy steps. <!-- 02-§60.2 -->

### 60.2 Environment protection requirements

- The environments document (`08-ENVIRONMENTS.md`) must document the
  required reviewers configuration for the `production`
  environment. <!-- 02-§60.3 -->
- The environments document must name the current production
  approver(s). <!-- 02-§60.4 -->

### 60.3 Release guide requirements

- A dedicated release guide (`09-RELEASING.md`) must exist with
  step-by-step instructions for deploying to production. <!-- 02-§60.5 -->
- The guide must cover: verifying QA, triggering the production deploy,
  verifying production, and rollback. <!-- 02-§60.6 -->
- The guide must be usable without Claude Code — written for GitHub UI
  and standard CLI. <!-- 02-§60.7 -->
- The guide must document release tagging conventions for
  milestones. <!-- 02-§60.8 -->

---

---

## 62. Footer Versioning

### 62.0 Motivation

QA testers and administrators need to confirm which version of the site is
deployed. Without a visible version indicator, there is no way to know whether
a deploy has completed or which build is currently live. A version string in
the footer solves this with minimal visual impact.

### 62.1 VERSION file

- The project root must contain a `VERSION` file with the major.minor version
  (e.g. `1.0`). This file is the single source of truth for the base
  version. <!-- 02-§62.1 -->
- Major and minor numbers are bumped manually by editing the file. <!-- 02-§62.2 -->

### 62.2 Footer version display

- Every page that includes a site footer must display the version string
  in a `<p class="site-footer__version">` element at the bottom of the
  footer. <!-- 02-§62.3 -->
- The version text must be visually subordinate to the main footer content:
  smaller font size and reduced opacity. <!-- 02-§62.4 -->
- Pages without a site footer (e.g. display mode) must not display a
  version string. <!-- 02-§62.5 -->

### 62.3 Version string per environment

- **Production**: The version string must be the full semantic version
  derived from git tags, e.g. `v1.0.4`. <!-- 02-§62.6 -->
- **QA**: The version string must include the full semantic version
  (matching the latest production tag) and the PR number from the merge
  commit, e.g. `v1.0.4 – QA PR212`. If no PR number can be extracted,
  the short commit SHA is used as fallback. <!-- 02-§62.7 -->
- **Local**: The version string must include the base version and a
  Stockholm-timezone timestamp, e.g.
  `v1.0 – Lokal 2026-03-02 14:30`. <!-- 02-§62.8 -->
- **Event-data deploys**: When `BUILD_ENV` is set but `BUILD_VERSION` is
  not (event-data deploys), no version string is rendered in the
  footer. <!-- 02-§62.9 -->

### 62.4 Automatic production tagging

- Each successful production deploy must create an annotated git tag
  with the computed version (e.g. `v1.0.4`). <!-- 02-§62.10 -->
- The tag must be created only after a successful deploy, not
  before. <!-- 02-§62.11 -->
- If a tag already exists (re-run), the tagging step must skip
  gracefully. <!-- 02-§62.12 -->

### 62.5 Automatic GitHub Release on major/minor bump

- When the first production deploy for a new major.minor version occurs
  (no prior tags with that prefix), a GitHub Release must be created
  automatically with `--generate-notes`. <!-- 02-§62.13 -->
- Patch-only deploys must not create a GitHub Release. <!-- 02-§62.14 -->

### 62.6 Build integration

- The build must accept an optional `BUILD_VERSION` environment variable.
  When set, it is used as the version string. <!-- 02-§62.15 -->
- When `BUILD_VERSION` is not set and `BUILD_ENV` is not set (local
  development), the build must read the `VERSION` file and generate a
  local timestamp version. <!-- 02-§62.16 -->
- The version logic must be in a separate module that can be
  unit-tested. <!-- 02-§62.17 -->

### 62.7 QA redeploy after production deploy

- After a successful production deploy and tagging, the production
  deploy workflow must automatically trigger a QA redeploy so that
  QA runs the exact same build as production. <!-- 02-§62.18 -->
- The QA redeploy must use the exact production version string
  (e.g. if production tagged `v1.0.1`, QA must also show
  `v1.0.1`). This makes it visible that QA is running the
  production release with no additional changes. <!-- 02-§62.19 -->
- When the next PR is merged to `main`, the normal QA deploy
  (`deploy-qa.yml`) restores the QA-suffixed version string
  (e.g. `v1.0.1 – QA PR217`). <!-- 02-§62.20 -->

---

---

## 97. Project Documentation Site

### 97.1 Context

The project documentation in `docs/` is structured Markdown covering
contribution guidelines, requirements, architecture, data contract,
operations, design, environments, releasing, and the traceability
matrix. Reading it on GitHub's file viewer works, but cross-file links
render as raw `.md` file downloads in some contexts and searching
requires opening files one at a time.

Publishing the same content as a small, read-only documentation site
lets contributors and stakeholders browse the docs in a regular
browser, follow internal links without friction, and link directly to
specific sections when reporting issues or discussing changes. The
documentation site is entirely separate from the main `sbsommar.se`
site — it does not affect the camp website, the PHP API, or any
existing deployment workflow.

### 97.2 Publication (site requirements)

- The `docs/` folder is published as a static website at a
  public URL hosted by GitHub Pages. <!-- 02-§97.1 -->
- The documentation site is served from the `main` branch, mapped to
  the `/docs` folder, using GitHub Pages' "Deploy from a branch"
  source. <!-- 02-§97.2 -->
- A push to `main` that changes any file under `docs/` causes GitHub
  Pages to rebuild and republish the documentation site automatically,
  without running the project's own CI workflows and without manual
  intervention. <!-- 02-§97.3 -->
- The documentation site is publicly readable. It exposes only files
  already present in the public `docs/` folder of the repository; it
  does not surface files from outside `docs/`, repository secrets, or
  environment values. <!-- 02-§97.4 -->

### 97.3 Rendering (site requirements)

- Markdown files in `docs/` are rendered as HTML by GitHub Pages'
  built-in Jekyll toolchain, with no custom build step or project-owned
  workflow. <!-- 02-§97.5 -->
- Relative links between documentation pages written as
  `[text](other-file.md)` or `[text](other-file.md#section)` resolve
  correctly on the published site, so that navigation between docs
  files works without editing each link manually. <!-- 02-§97.6 -->
- HTML comments used as inline requirement markers in the source
  Markdown (for example `<!-- 02-§1.1 -->`) are preserved as HTML
  comments in the rendered output and are not visible to readers. <!-- 02-§97.7 -->

### 97.4 Landing page

- The root URL of the documentation site renders `docs/index.md` as the
  landing page. The landing page lists every other Markdown file under
  `docs/` (for example `01-CONTRIBUTORS.md`, the `02-requirements/`
  index and its topic files, and the rest of the numbered docs) with a
  one-line description and a link to the rendered HTML page.
  <!-- 02-§97.12 -->

### 97.5 Constraints

- The documentation site contributes no entries to `package.json` or
  `api/composer.json`. <!-- 02-§97.8 -->
- No GitHub Actions workflow under `.github/workflows/` publishes the
  documentation site; GitHub Pages' built-in deployment is the only
  mechanism that builds it. <!-- 02-§97.9 -->
- The deploy workflows for the main site and event data
  (`deploy-qa.yml`, `deploy-prod.yml`, `deploy-reusable.yml`,
  `event-data-deploy.yml`, `event-data-deploy-post-merge.yml`) do not
  interact with the documentation site or GitHub Pages; they target
  shared hosting only. <!-- 02-§97.10 -->
- The documentation site uses the default `*.github.io` URL assigned by
  GitHub Pages; no `docs/CNAME` file is present. <!-- 02-§97.11 -->

### 97.6 Repository-root discoverability

- `README.md` (the file GitHub renders on the repository home page)
  links to the documentation site's public URL near the top of the
  file, before the developer setup section, so that a first-time
  visitor sees the link without scrolling past the marketing copy. <!-- 02-§97.13 -->
- The documentation index in `README.md` lists every file currently
  published under `docs/` (`01-CONTRIBUTORS.md`, the `02-requirements/`
  index plus its topic files `pages-navigation.md`,
  `schedule-and-detail.md`, `add-edit-forms.md`, `event-data.md`,
  `build-deploy.md`, `caching-performance.md`, `platform-security.md`,
  `design-and-content.md`, `archive.md`, then
  `03-architecture/`, `04-OPERATIONS.md`, `05-DATA_CONTRACT.md`,
  `06-EVENT_DATA_MODEL.md`, `07-design/`, `08-ENVIRONMENTS.md`,
  `09-RELEASING.md`, and `99-traceability/`), each with a one-line
  description and a link that works both on GitHub's file viewer and
  on the rendered documentation site. <!-- 02-§97.14 -->

### 97.7 Reverse-discoverability banner

- The landing page `docs/index.md` carries a banner near the top
  (above the documentation index) that links back to the source
  repository on GitHub, the rendered `README.md` on GitHub, and the
  GitHub issue tracker. The links target absolute
  `https://github.com/moggleif/sbsommar` URLs so they resolve
  identically whether the page is viewed on the published Pages site
  or on GitHub's file viewer. <!-- 02-§97.15 -->
- The landing page does not link to `https://sbsommar.se` (the
  participant-facing camp site). The §97.8 search-engine policy
  prohibits actively pointing search engines at the camp site from a
  publicly hosted Pages page. <!-- 02-§97.16 -->
- The landing page's main copy is project-technical: it identifies
  the page as the developer-facing documentation for a static-site
  project and points readers at `README.md` for additional context.
  It does not describe the camp's purpose, audience, schedule, or
  any other content that the §97.8 search-engine policy keeps off
  search-engine result pages. <!-- 02-§97.17 -->

### 97.8 Search-engine and crawler policy

- The published documentation site is intentionally hidden — it is
  discoverable only by direct link and must not appear in search
  engine results. This policy mirrors §1a for the camp site
  (`sbsommar.se`) but applies to the documentation site
  (`https://moggleif.github.io/sbsommar/`). <!-- 02-§97.18 -->
- A `docs/robots.txt` file at the documentation site root disallows
  every user agent from every path (`User-agent: *` /
  `Disallow: /`). <!-- 02-§97.19 -->
- Every rendered HTML page on the documentation site includes a
  `<meta name="robots" content="noindex, nofollow">` tag in the
  `<head>` section. The tag is injected via Jekyll's head-custom
  include under `docs/_includes/`. Both filename conventions are
  shipped (`head-custom.html` for Primer/Minima themes,
  `head_custom.html` for Cayman) so that the meta tag lands in
  `<head>` regardless of which default theme GitHub Pages selects. <!-- 02-§97.20 -->
- No sitemap, Open Graph tags, or other discoverability metadata are
  added to the documentation site. <!-- 02-§97.21 -->
