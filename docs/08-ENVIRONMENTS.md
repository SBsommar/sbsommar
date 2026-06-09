# SB Sommar – Environments

Three environments serve different stages of the development-to-production pipeline.
All environments deploy from the `main` branch.

For CI/CD workflow details, see [04-OPERATIONS.md](04-OPERATIONS.md).

The project also publishes a separate **documentation site** from the
`docs/` folder via GitHub Pages. The documentation site is not one of
the three application environments and does not host the camp site or
the PHP API. See [§ Documentation site](#documentation-site) below.

---

## Overview

| Environment    | Host        | API stack | Full site deploy             | Event data deploy      | Secrets source                  |
| -------------- | ----------- | --------- | ---------------------------- | ---------------------- | ------------------------------- |
| **Local**      | localhost   | Node.js   | `npm start`                  | N/A                    | `.env` file                     |
| **QA**         | Loopia      | PHP       | Auto on push to `main`       | Auto on event PR merge | GitHub Environment `qa`         |
| **Production** | Loopia      | PHP       | Manual (`workflow_dispatch`) | Auto on event PR merge | GitHub Environment `production` |

**Key rule:** code changes reach Production only when manually triggered.
Event data reaches both QA and Production immediately — because events are
time-sensitive (camp is running).

**QA camp isolation:** A dedicated QA camp (`qa: true` in `camps.yaml`) allows
testing the full event flow without polluting production data. Production builds
and APIs filter out QA camps entirely. See `03-architecture/data-layer.md §2 "QA camp
isolation"` for the filter mechanism and the seasonal QA-camp model, and
`02-requirements/event-data.md §42` for the detailed requirements.

---

## Deploy triggers

| What changed              | QA                                | Production                         |
| ------------------------- | --------------------------------- | ---------------------------------- |
| Code (features, fixes)    | Auto — full site rebuild + deploy | Manual — `workflow_dispatch`       |
| Event data (from form)    | Auto — event pages only           | Auto — event pages only            |

---

## Event data flow

1. A participant submits an event via the form. The API validates the data (injection
   patterns, link protocol, length limits) and rejects invalid input immediately.
2. The API commits the validated event to a temporary branch and opens an auto-merge PR.
3. `event-data-deploy.yml` runs a no-op check that satisfies branch protection.
4. The PR auto-merges to `main`.
5. `event-data-deploy-post-merge.yml` triggers: two parallel jobs install
   production dependencies via `setup-node` + `npm ci --omit=dev`, build the
   site, and deploy event-data pages — one each to QA (rsync) and
   Production (SCP).
6. Each job builds with its own environment's `SITE_URL` and `API_URL` so that
   per-event page links point to the correct domain.

All environments receive event data within minutes of submission — no manual step needed.

---

## Workflows

| Workflow                  | Trigger                                                | Environment(s)       |
| ------------------------- | ------------------------------------------------------ | -------------------- |
| `ci.yml`                  | Every push and PR                                      | — (repo-level)       |
| `deploy-qa.yml`           | Push to `main` (paths-ignore data YAMLs)               | `qa`                 |
| `deploy-prod.yml`         | `workflow_dispatch` (manual)                            | `production`         |
| `event-data-deploy.yml`   | PR from `event/` or `event-edit/` changing data YAMLs  | — (no-op gate)       |
| `event-data-deploy-post-merge.yml` | Push to `main` (data YAMLs only)              | `qa` + `production`  |
| `docker-build.yml`        | Push to `main` (`package.json`, `package-lock.json`, or Dockerfile) | — (pushes Docker image to GHCR) |

`deploy-qa.yml` and `deploy-prod.yml` both call the shared reusable workflow
`deploy-reusable.yml`, which builds the static site, deploys it via SCP,
and deploys the PHP API (with `composer install` on the server).
The only difference is the trigger and the GitHub Environment that provides
the secrets.

---

## Secrets schema

### Repository-level secrets (not environment-scoped)

| Secret     | Used by    | Purpose                                           |
| ---------- | ---------- | ------------------------------------------------- |
| `SITE_URL` | `ci.yml`   | Any valid URL — just needs to pass the build step |

### GitHub Environment: `qa` (PHP on Loopia)

| Secret                  | Purpose                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SITE_URL`              | QA base URL                                                                                                                                             |
| `API_URL`               | QA PHP API endpoint                                                                                                                                     |
| `COOKIE_DOMAIN`         | Session cookie domain (e.g. `sbsommar.se`) — injected at build time                                                                                     |
| `GOATCOUNTER_SITE_CODE` | GoatCounter site code for QA analytics (e.g. `qa-sbsommar`)                                                                                             |
| `SERVER_HOST`           | QA SSH/SCP host                                                                                                                                         |
| `SERVER_USER`           | QA SSH username                                                                                                                                         |
| `SERVER_SSH_KEY`        | QA SSH private key                                                                                                                                      |
| `SERVER_SSH_PORT`       | QA SSH port                                                                                                                                             |
| `DEPLOY_DIR`            | QA deploy directory                                                                                                                                     |
| `ADMIN_TOKENS`          | Comma-separated list of admin tokens (format: `namn_uuid_epoch`). Optional — omit to disable admin features. Create tokens with `npm run admin:create`. |

Example values: `SITE_URL=https://qa.sbsommar.se`,
`API_URL=https://qa.sbsommar.se/api/add-event`.

The PHP API is deployed alongside the static site via SCP. Its `.env` file
on the server is managed manually and lives at `$DEPLOY_DIR/.env` — outside
the web root, never under `public_html/api` (§100). It contains the
`GITHUB_*`, `ALLOWED_ORIGIN`, `QA_ORIGIN`, `COOKIE_DOMAIN`, `BUILD_ENV`, and
`ADMIN_TOKENS` variables needed by the PHP API at runtime.

### GitHub Environment: `production`

Same secret names as `qa` (including `ADMIN_TOKENS`), but with production values:

| Secret            | Purpose                                               |
| ----------------- | ----------------------------------------------------- |
| `SITE_URL`        | Production base URL (e.g. `https://sommar.example.com`)          |
| `API_URL`         | Production API endpoint (e.g. `https://api.sommar.example.com/add-event`) |
| `COOKIE_DOMAIN`   | Session cookie domain (e.g. `sbsommar.se`) — injected at build time |
| `GOATCOUNTER_SITE_CODE` | GoatCounter site code for production analytics (e.g. `sbsommar`) |
| `SERVER_HOST`     | Production SSH/SCP host                               |
| `SERVER_USER`     | Production SSH username                               |
| `SERVER_SSH_KEY`  | Production SSH private key                            |
| `SERVER_SSH_PORT` | Production SSH port                                   |
| `DEPLOY_DIR`      | Production deploy directory                           |

---

## GitHub Environments setup guide

After merging the environment management changes, set up GitHub Environments:

1. Go to the repository on GitHub.
2. Open **Settings > Environments**.
3. Click **New environment**, name it `qa`, and click **Configure environment**.
4. Under **Environment secrets**, add each secret from the `qa` table above.
5. Click **New environment** again, name it `production`, and click **Configure environment**.
6. Under **Environment secrets**, add each secret from the `production` table above.
7. Under **Environment protection rules** for `production`, add
   **Required reviewers** and enter the GitHub username(s) who may approve
   production deploys (see the approvers list below).
8. Optionally add a **Wait timer** (e.g. 5 minutes) for an extra safety window.
9. Verify that `SITE_URL` also exists as a **repository-level** secret (Settings > Secrets and variables > Actions > Repository secrets). This is used by `ci.yml` for build validation.

---

## Production approvers

Production deploys require approval from a **required reviewer** configured
on the `production` GitHub Environment. When someone triggers the
"Deploy to Production" workflow, GitHub pauses the run and notifies the
approvers. The deploy proceeds only after an approver clicks "Approve".

Current approvers:

| GitHub username | Role |
| --- | --- |
| `moggleif` | Project maintainer |

To add or remove approvers: go to **Settings → Environments → production →
Required reviewers** and update the list.

---

## Local development

Local development uses a `.env` file for all environment variables.
See `.env.example` for the full list of variables and their descriptions.

The `.env` file is ignored by git and is never committed.
Without `API_URL` set, the built form will have no submit endpoint — this is
expected for local builds that only need to test the static site.

---

## Documentation site

The Markdown files in `docs/` are published as a small read-only
documentation website by GitHub Pages. This site exists to make it
easier for contributors and stakeholders to read and link to specific
parts of the project documentation; it is fully separate from the
`sbsommar.se` camp site and the PHP API.

| Aspect             | Value                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| Host               | GitHub Pages                                                          |
| Source             | `main` branch, `/docs` folder                                         |
| Build              | GitHub Pages' built-in Jekyll toolchain                                |
| Deploy trigger     | Push to `main` that touches any file under `docs/` (automatic)        |
| Workflows involved | None — GitHub Pages runs its own internal build                       |
| URL                | Default `*.github.io` URL assigned by GitHub Pages (no custom domain) |
| Visibility         | Hidden — `Disallow: /` `robots.txt` + `noindex, nofollow` meta on every page |

### How to enable

This is a one-time GitHub repository setting, performed through the
web UI by a maintainer:

1. Go to the repository on GitHub.
2. Open **Settings → Pages → Build and deployment**.
3. Set **Source** to `Deploy from a branch`.
4. Set **Branch** to `main` and the folder to `/docs`.
5. Save. GitHub Pages runs its first build automatically; the public
   URL appears on the same settings page when the build finishes.

Once enabled, every push to `main` that changes a file under `docs/`
triggers a new Pages build. No project workflow runs for the docs site,
so the CI status of a docs-only change does not gate publication.

### Configuration

The project owns four files under `docs/` that shape the published
site:

- `docs/_config.yml` activates the
  [`jekyll-relative-links`](https://github.com/benbalter/jekyll-relative-links)
  plugin (whitelisted on GitHub Pages) so that relative links between
  Markdown files such as `[text](other-file.md)` resolve correctly to
  the rendered HTML pages on the published site.
- `docs/robots.txt` (`User-agent: *` / `Disallow: /`) blocks every
  crawler at the documentation site root.
- `docs/_includes/head-custom.html` and `docs/_includes/head_custom.html`
  inject `<meta name="robots" content="noindex, nofollow">` into every
  rendered page. Two filenames are shipped because GitHub Pages themes
  use different conventions: Primer/Minima look for the dashed name,
  Cayman looks for the underscored name. Whichever default GitHub
  Pages selects, the meta tag still lands in `<head>`.
- `docs/index.md` is the landing page — it carries a project-technical
  reverse-discoverability banner pointing back to the source
  repository, README, and issue tracker on github.com.

No other Jekyll configuration is owned by the project; the default
GitHub Pages theme and defaults are used as-is.

### Visibility policy

The documentation site mirrors §1a's "intentionally hidden,
discoverable only by direct link" policy for `sbsommar.se`. The
landing page never links to the camp site (`sbsommar.se`), and its
main copy describes the page as the developer-facing documentation
for a static-site project rather than describing the camp itself.
See `02-requirements/build-deploy.md` §97.7 (reverse-discoverability banner) and
§97.8 (search-engine and crawler policy).

### Relationship to other environments

The documentation site shares no secrets, URLs, or deploy infrastructure
with the QA or Production environments. Editing `docs/` never triggers
`deploy-qa.yml`, `deploy-prod.yml`, or the event-data deploy workflows.
Conversely, editing files outside `docs/` never triggers a Pages
rebuild.

If a link on the documentation site breaks, the fix belongs in the
Markdown file it points to (or the `docs/_config.yml` configuration),
not in any of the deploy workflows.
