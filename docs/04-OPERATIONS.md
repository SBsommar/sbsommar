---
title: "SB Sommar – Operations Guide"
---

# SB Sommar – Operations Guide

How to develop, run, and deploy the site.

For a full description of the system's architecture and data flow, see [03-architecture/](03-architecture/).
For environment management (Local, QA, Production), secrets schema, and GitHub Environments setup, see [08-ENVIRONMENTS.md](08-ENVIRONMENTS.md).

---

## System Overview

| Layer  | Location                   | Role                                                   |
| ------ | -------------------------- | ------------------------------------------------------ |
| Data   | `source/data/*.yaml`       | Single source of truth for all events                  |
| Build  | `source/build/build.js`    | Generates HTML from data and Markdown                  |
| Server | `app.js`                   | Serves `public/` and handles the add-event API         |
| Output | `public/`                  | Generated HTML + static CSS/JS — do not edit directly  |

The server (`app.js`) does two things:

1. Serves the built static files from `public/`.
2. Handles `POST /add-event`, which commits the new event to GitHub via the Contents API, opens a PR, and enables auto-merge. The PR triggers CI (build only) and merges automatically — no admin step needed.

---

## Local Development

### Prerequisites

- Node.js 18 or later
- npm

### First-time setup

```bash
npm install
npm run build
npm start
```

The site is available at <http://localhost:3000>.

The port can be overridden:

```bash
PORT=8080 npm start
```

### Rebuilding manually

If you edit a YAML data file directly (e.g. to correct an event), rebuild:

```bash
npm run build
```

The server does not need to be restarted after a rebuild — it reads files fresh on each request.

### Commands

```bash
npm test                         # Run tests
npm run lint                     # Lint JavaScript
npm run lint:md                  # Lint Markdown
npm run test:update-snapshots    # Regenerate schedule page snapshots
```

---

## Data Files

Event data lives in `source/data/`. One YAML file per camp.

Which camp is active is derived automatically from dates at build time and at
API request time — there is no manual `active` field. See
[03-architecture/data-layer.md §2 "Metadata Layer"](03-architecture/data-layer.md#2-metadata-layer)
for the canonical priority rules (today on dates → next upcoming → most
recent) and the shared resolver.

Events are sorted chronologically at build time, so their order in the YAML file does not matter. New events submitted through the form are committed to GitHub and merged via auto-merge PR — the file on disk updates when the next deploy runs.

Locations are defined centrally in `source/data/local.yaml`.
Never define locations inside individual camp files.

---

## Production Deployment

### Infrastructure

The site is deployed to shared PHP hosting (Loopia):

| Part                    | Deployment method | Location on host                        |
| ----------------------- | ----------------- | --------------------------------------- |
| Static site (`public/`) | SCP + SSH swap    | Web root (`DEPLOY_DIR/public_html`)     |
| PHP API (`api/`)        | SCP (with site)   | Web root (`DEPLOY_DIR/public_html/api`) |

The PHP API runs via Apache `mod_rewrite` + PHP 8.4. No process manager needed.
The `api/` directory (including `vendor/` from `composer install --no-dev`)
is uploaded alongside the static site. The PHP API `.env` file is managed
manually on the server and lives at `$DEPLOY_DIR/.env` — outside the web
root, never under `public_html/api` — so it is unreachable by URL and is
not part of the deploy archive (§100).

### CI/CD Workflows

CI (Continuous Integration) runs automated checks on every push and pull request.
CD (Continuous Deployment) deploys to QA automatically after a merge to `main`;
Production deploys are triggered manually. See [08-ENVIRONMENTS.md](08-ENVIRONMENTS.md) for the full environment model.

| Workflow                  | Trigger                                                        | What it does                                                                                                                                                                                                |
| ------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`                  | Every push and PR                                              | Lint + test + build. Lint/test skipped for data-only commits (per-camp event files only; config files like `camps.yaml` and `local.yaml` trigger full CI). Uses `fetch-depth: 0` to compare against `main`. |
| `event-data-deploy.yml`   | PRs from `event/`, `event-edit/` changing `source/data/*.yaml` | Lint YAML + security scan + build + targeted deploy to both QA (SCP) and Production (FTP). Uses `fetch-depth: 0` to detect changed files.                                                                   |
| `deploy-qa.yml`           | Push to `main` (paths-ignore data YAMLs)                       | Calls `deploy-reusable.yml` with environment `qa`. Build → SCP → SSH swap → SSH restart.                                                                                                                    |
| `deploy-prod.yml`         | Manual (`workflow_dispatch`)                                    | Calls `deploy-reusable.yml` with environment `production`. Same steps as QA.                                                                                                                               |
| `deploy-reusable.yml`     | Called by `deploy-qa.yml` / `deploy-prod.yml`                   | Shared logic: Build → SCP archive → SSH swap into web root → deploy PHP API.                                                                                                                               |

```mermaid
flowchart TD
    A[Push branch] --> B[CI: lint · test · build]
    B --> C{Passes?}
    C -- No --> D[Fix and repush]
    D --> B
    C -- Yes --> E[Open PR · merge to main]
    E --> F
    E --> G

    subgraph F [QA: auto-deploy on push to main]
        F1[Build public/] --> F2[tar + SCP archive to QA server]
        F2 --> F3[SSH: extract · swap · cleanup]
        F3 --> F4[SSH: deploy PHP API · composer install]
    end

    subgraph G [Production: manual workflow_dispatch]
        G1[Build public/] --> G2[tar + SCP archive to prod server]
        G2 --> G3[SSH: extract · swap · cleanup]
        G3 --> G4[SSH: deploy PHP API · composer install]
    end
```

### Merge queue

All pull requests to `main` — including the automated `event/`, `event-edit/`,
and `event-delete/` PRs opened by the form API — merge through a **merge queue**
required by the `main` branch ruleset. When a PR's required checks pass and
auto-merge is enabled, GitHub adds it to the queue instead of merging it directly.

The queue merges one entry at a time. Each queued PR is re-tested on a temporary
`gh-readonly-queue/main/*` branch built on the current `main` tip, so a PR forked
from an older `main` is rebuilt against the latest commit and merged in order. Once
a PR is *in* the queue, concurrent form submissions all reach `main` automatically,
with no manual "Update branch" step.

The required `Lint, Test & Build` check reaches a queue branch because `ci.yml`
triggers on `push` to `**`, which matches `gh-readonly-queue/main/*`. No workflow
declares a `merge_group:` trigger, so narrowing that `push` filter stops the check
from reporting on the queue branch: queued PRs then wait out the 60-minute
status-check timeout, are treated as failed, and drop from the queue without
merging. Add an explicit `merge_group:` trigger to the check-providing workflows
before narrowing the `push` trigger.

**Stranded auto-merge.** The handoff *into* the queue is not always reliable. When
event submissions arrive in a burst and one merges, `main` advances; a sibling PR
whose auto-merge was enabled against the previous tip can be left stranded —
auto-merge enabled, checks green, `mergeable_state: clean`, but with **no
merge-queue entry**, so it never merges. Re-enabling auto-merge is a no-op (GitHub
only enqueues at the moment checks pass, which has already gone by); the PR merges
only once it is placed back in the queue explicitly. This is recovered automatically:
a sweep (`source/scripts/recover-stranded-event-prs.js`) runs after every event-data
merge, on `check_suite` completion, and on a 120-minute backstop schedule
(`merge-queue-recovery.yml`), finds stranded `event/*`, `event-edit/*`, and
`event-delete/*` PRs, and re-queues them with the `enqueuePullRequest` mutation
(02-§112, issue #495).

### Environment Variables

| Variable         | Default | Description                                              |
| ---------------- | ------- | -------------------------------------------------------- |
| `PORT`           | `3000`  | Port the HTTP server listens on                          |
| `API_URL`        | —       | Baked into the static form HTML as the fetch target      |
| `ALLOWED_ORIGIN` | —       | Primary origin allowed by the CORS middleware            |
| `QA_ORIGIN`      | —       | Secondary origin allowed by CORS (staging/QA)            |
| `COOKIE_DOMAIN`  | —       | Shared parent domain for session cookie (see note below) |
| `GITHUB_OWNER`   | —       | GitHub repository owner                                  |
| `GITHUB_REPO`    | —       | GitHub repository name                                   |
| `GITHUB_BRANCH`  | —       | Branch to commit events to (typically `main`)            |
| `GITHUB_TOKEN`   | —       | Personal access token with repo write access             |
| `ADMIN_TOKEN_SECRET` | —   | HMAC signing secret (≥32 bytes) that validates admin tokens. Omit to disable. |
| `SESSION_SECRET` | —       | Secret signing key for participant ownership cookies.    |

`API_URL`, `ALLOWED_ORIGIN`, `COOKIE_DOMAIN`, `GITHUB_*`, `SESSION_SECRET`, and SSH credentials are stored as GitHub Actions secrets and server environment variables. They are not needed for local development. Without `API_URL` set, the built form will have no submit endpoint — this is expected in local builds. Without `GITHUB_*` set, event submission via the API will fail; all other functionality works normally.

**`COOKIE_DOMAIN`**: required when the API and the static site are deployed on different subdomains (e.g. `api.sommar.example.com` and `sommar.example.com`). Set it to the shared parent domain — e.g. `sommar.digitalasynctransparency.com`. This causes the session cookie to include `Domain=<value>` so that client-side JavaScript on the static site can read it. Omit the variable for single-origin deployments.

---

## Camp Lifecycle

### Before Camp

1. Create a new YAML file in `source/data/` (e.g. `2026-06-syssleback.yaml`).
2. Add the camp entry in `source/data/camps.yaml` with dates and `archived: false`.
3. Run `npm run build` to verify the correct camp is derived as active.
4. Deploy.

Minimal camp file:

```yaml
camp:
  id: 2026-06-syssleback
  name: SB Sommar Juni 2026
  location: Sysslebäck
  start_date: '2026-06-28'
  end_date: '2026-07-05'
events: []
```

### When a Camp Opens (split seeded events into fragments)

A camp is seeded as a monolith: the activities organizers prepare in advance live
in the camp file's `events:` list. But once the camp opens, participants edit and
delete events through fragment files only — the live submission flow never writes
the camp file. A seeded event left in the camp file therefore cannot be edited or
deleted ("event hittas inte"). So when the camp opens for editing, move its seeded
events into fragments:

```bash
node source/scripts/split-camp-events.js 2026-07-syssleback
git add -A source/data
git commit -m "data: split 2026-07-syssleback seeded events into fragments"
```

- Run this **at or shortly before the camp's `opens_for_editing` date**, before
  any participant can edit or delete.
- The script writes one fragment per event under `source/data/<stem>/` and leaves
  the camp file with an empty `events:` list. It is safe to run again — a camp
  whose `events:` list is already empty is a no-op.
- If it reports that a fragment already exists for an event id, it has written
  nothing; investigate the existing fragment before re-running.

This is the opening bracket of the camp's fragment window. The closing bracket is
compaction at archive, which folds the fragments back into the camp file.

### During Camp

Participants add events through the web form at `/lagg-till.html`.
The API server commits the event to GitHub, which triggers an auto-merge PR
and a full rebuild and deploy — typically live within a few minutes.

An admin can also edit the YAML file directly on GitHub and push to `main`
to fix or remove entries.

### After Camp

1. Set `archived: true` for the camp in `source/data/camps.yaml`.
2. Commit. The YAML file already has its permanent name — it becomes the archive as-is.
3. Deploy. The system automatically derives the next active camp from dates.

---

## Admin Tokens (optional)

Admin tokens grant one or two people the ability to edit or delete any
event through the site UI — not just their own. The feature is optional;
omit `ADMIN_TOKEN_SECRET` to disable it entirely.

Tokens are signed, not listed: the runtimes validate a token by recomputing
its HMAC signature against `ADMIN_TOKEN_SECRET`, so issuing or retiring a
person never requires an environment edit or a redeploy.

Three roles exist:

| Role | Grants | Validity |
| --- | --- | --- |
| `admin` | Edit/delete any event; add/edit before the form opens | 60 days |
| `early` | Add/edit/delete **own** events before the form opens (tidig åtkomst) | 90 days |
| `superadmin` | As `admin`; reserved for minting tokens (only issued via CLI) | 180 days |

`early` is handed to a small set of trusted organisers who need to build a
skeleton schedule before `opens_for_editing`. It gives no access to other
people's events, and the post-camp lock applies to it like everyone else.

### One-time setup of the signing secret

Generate a high-entropy secret once and store it like any other server
secret — in `.env` (local), `$DEPLOY_DIR/.env` on the server (outside the
web root), and the GitHub Environment secrets for QA/Production:

```bash
openssl rand -base64 48
```

Rotating this secret invalidates every existing token at once.

### Issuing a token

Via the CLI:

1. Run `npm run admin:create` and follow the prompts (name + role). The
   script signs a token in the format `namn_roll_epoch_sig` against
   `ADMIN_TOKEN_SECRET` — 60 days validity for `admin`, 90 days for
   `early`, 180 days for `superadmin`. The token is shown only once —
   save it immediately.
2. Share the token privately with the holder (e.g. via SMS or in person).
   No environment edit and no redeploy are needed.
3. The holder visits `/token.html`, enters the token, and gains the role's
   privileges until the token's embedded expiry.

Or from the web (superadmin only):

1. Open `/token.html` with an active superadmin token — a "Skapa
   token-länk" section appears.
2. Fill in name, role (`admin` or `early` — superadmin can never be minted
   here), and validity, then press "Skapa länk".
3. Share the activation link (`/token.html#token=…`) privately. The
   recipient opens it and the token activates automatically.

### Revoking access

Because tokens are stateless, an individual token cannot be revoked on its
own. To revoke everyone, rotate `ADMIN_TOKEN_SECRET` and redeploy, then
re-issue tokens to the people who should keep access. Short expiries bound
the exposure of a leaked token in the meantime.

---

## Disaster Recovery

### Incorrect or unwanted event

1. Edit the current camp's YAML directly on GitHub (or locally and push).
2. Merge to `main` — the deploy pipeline rebuilds automatically.

Git history provides a full audit trail of all changes, including every event submitted through the form.

### Schedule not updating after form submission

1. Check the GitHub repository for a recently opened or stuck PR from the API.
2. If the PR is open and CI has passed, manually merge it.
3. If CI failed, inspect the build log in the Actions tab of the GitHub repository and fix accordingly.

### Site not building after a data change

1. Run `npm run build` locally and read the error output.
2. Validate the YAML file structure against [05-DATA_CONTRACT.md](05-DATA_CONTRACT.md).
3. Common causes: missing required field, date outside camp range, duplicate event ID.

### Server not responding

1. Check Apache/PHP error logs on the host.
2. Verify the `$DEPLOY_DIR/.env` file (outside the web root) exists and
   contains valid credentials.
3. Re-deploy via `workflow_dispatch` if the static site is missing.
