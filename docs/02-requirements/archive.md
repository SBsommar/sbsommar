# SB Sommar – Requirements: Archived Requirements

Sections superseded by later requirements. IDs are preserved because they are still cited from code; prose lives here for historical reference.

Part of [the requirements index](./index.md). Section IDs (`02-§N.M`) are stable and cited from code; they do not encode the file path.

---

## Archived (superseded)

This section preserves prose from requirements that have been replaced by later
requirements. Their `02-§N.M` IDs remain in this document because they are still
cited from code, tests, and `99-traceability/`. Live sections elsewhere in this
file keep a one-line pointer back to the archive so the live flow stays compact.

### Archived: §23 — Event Data CI Pipeline (superseded by §49, §50, §52)

> §23.1–§23.10 are superseded by §49 (API-layer validation) and §50 (the
> Docker-based pipeline, itself later replaced by §52). §23.11–§23.13 are
> superseded by §50.4 (post-merge SCP deploy). §23.14 still applies to `ci.yml`
> and remains live in §23.

### Archived: §43.9–§43.10 — Production FTP deploy (superseded by §50.19–§50.22)

> Production event data deploy now uses SCP (§50.19) and the production FTP
> secrets have been removed (§50.22). `02-§43.9` and `02-§43.10` are superseded
> by `02-§50.19`–`02-§50.22`.

### Archived: §50.13–§50.14 — Pre-merge detect job (superseded by §51)

> The post-merge event-data deploy workflow no longer relies on a serial
> `detect` job. Each deploy job performs its own inline detection (§51.2,
> §51.5) and the production job determines QA-camp status inline (§51.7).

- The workflow must detect which per-camp YAML file changed by comparing
  `HEAD~1..HEAD`. <!-- 02-§50.13 -->
- The workflow must determine whether the changed file belongs to a QA camp
  and set an `is_qa` output. <!-- 02-§50.14 -->

### Archived: §53.12–§53.14 — Persistent .env backup (superseded by §100)

> §100 moves the PHP API `.env` to `$DEPLOY_DIR/.env`, outside the
> `public_html` directory that release swaps replace. Because the file no
> longer lives inside the swapped directory, it persists across deploys
> without the backup-and-restore dance these requirements described.

- The reusable deploy workflow must maintain a persistent copy of the PHP
  API `.env` file at `$DEPLOY_DIR/.env.api.persistent`, updated on every
  successful deploy where the `.env` file exists. <!-- 02-§53.12 -->
- The restore step must fall back to `.env.api.persistent` if the primary
  backup (`.env.api.bak`) is missing. <!-- 02-§53.13 -->
- The persistent backup must not be deleted by the restore step
  (`cp`, not `mv`). <!-- 02-§53.14 -->

### Archived: §50.1–§50.7 — Docker image and build workflow (superseded by §52)

> The post-merge event-data deploy workflow no longer uses a Docker image.
> Dependencies are installed via `actions/setup-node` with the built-in npm
> cache (§52.1).

#### Docker build image (archived §50.1–§50.4)

- A Docker image containing Node.js 20 and the project's production dependencies
  (`js-yaml`, `marked`, `qrcode`) must be available for CI workflows. <!-- 02-§50.1 -->
- The image must be based on `node:20` (full image, not slim). <!-- 02-§50.2 -->
- The Dockerfile must live in `.github/docker/Dockerfile`. <!-- 02-§50.3 -->
- The image must be published to GitHub Container Registry
  (`ghcr.io/<owner>/<repo>`). <!-- 02-§50.4 -->

#### Docker image build workflow (archived §50.5–§50.7)

- A workflow (`.github/workflows/docker-build.yml`) must build and push the Docker
  image when `package.json` or `.github/docker/Dockerfile` changes on push to
  `main`. <!-- 02-§50.5 -->
- The workflow must tag images with both `latest` and the git SHA. <!-- 02-§50.6 -->
- The workflow must have `packages: write` and `contents: read` permissions. <!-- 02-§50.7 -->
