# Traceability — CLAUDE.md

Part of [the traceability index](./index.md).

| ID | Requirement | Doc Ref | Test(s) | Implementation | Status |
| --- | --- | --- | --- | --- | --- |
| `CL-§1.1` | Build output is static HTML/CSS/JS; no server is required to view pages | 03-architecture/forms-and-api.md §7 | SNP-01, STR-HTML-01..06 | `source/build/build.js` – writes to `public/` | covered |
| `CL-§1.3` | No client-side rendering framework is used (see `CL-§2.9`) | 03-architecture/forms-and-api.md §7 | STR-FW-01..06 | `source/assets/js/client/` – plain vanilla JS only | covered |
| `CL-§4.1` | Event data has a single source of truth (see `CL-§2.3`) | 03-architecture/data-layer.md §1 | — | `source/data/*.yaml` files; `source/build/build.js` reads exclusively from there | implemented |
| `CL-§3.2` | Main page sections are authored in Markdown (see `CL-§2.2`) | 03-architecture/rendering.md §6 | RNI-01..38 | `source/build/render-index.js` – `convertMarkdown()` | covered |
| `CL-§5.1` | HTML validation runs in CI; build fails if HTML is invalid (see `02-§32.1`–`02-§32.8`) | 03-architecture/ci-and-deploy.md §11.5; 02-requirements/build-deploy.md §32 | manual: `npm run build && npm run lint:html` | `.htmlvalidate.json`, `ci.yml` Validate HTML step, `package.json` lint:html script | implemented |
| `CL-§5.2` | CSS linting runs in CI; build fails if CSS is invalid (see `02-§33.1`–`02-§33.8`) | 03-architecture/ci-and-deploy.md §11.5; 02-requirements/build-deploy.md §33 | manual: `npm run lint:css` | `.stylelintrc.json`, `ci.yml` Lint CSS step, `package.json` lint:css script | implemented |
| `CL-§5.3` | JavaScript linting runs in CI; build fails if lint fails | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – `npm run lint` (ESLint) | implemented |
| `CL-§5.5` | Event data is validated at build time for required fields, valid dates, and no duplicate identifiers | 04-OPERATIONS.md (Disaster Recovery); 05-DATA_CONTRACT.md §3–§6 | LNT-01..23 | `source/scripts/lint-yaml.js` – validates required fields, dates, time format, camp range, duplicate IDs, unique (title+date+start), active+archived; runs in CI via `event-data-deploy.yml` | covered |
| `CL-§9.1` | Built output lives in `/public` | 04-OPERATIONS.md (System Overview) | — | `source/build/build.js` – `OUTPUT_DIR = …/public` | implemented |
| `CL-§9.2` | GitHub Actions builds and validates; deployment happens only after successful CI | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml`, `.github/workflows/deploy-reusable.yml` | implemented |
| `CL-§9.3` | Deployment happens only after successful CI | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/deploy-qa.yml` – triggered only on push to `main` after CI passes; `deploy-prod.yml` – manual trigger | implemented |
| `CL-§9.4` | For data-only commits (per-camp event files only), CI runs build only — lint and tests are skipped. Configuration files (`camps.yaml`, `local.yaml`) trigger full CI despite living in `source/data/` | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – data-only path check with config-file exclusion; `.github/workflows/deploy-qa.yml` – `paths-ignore: source/data/**.yaml` | implemented |
| `CL-§9.5` | CI workflows that compare branches must check out with enough git history for the diff to succeed (`fetch-depth: 0`) | 03-architecture/ci-and-deploy.md §11.6 | — (CI end-to-end: open a PR and confirm the diff step succeeds) | `.github/workflows/ci.yml` – `fetch-depth: 0`; `.github/workflows/event-data-deploy.yml` – `fetch-depth: 0` on lint-yaml and security-check | implemented |
| `CL-§10.1` | Never push directly to `main` | 01-CONTRIBUTORS.md | — | Enforced by branch protection; described in contributor guide | implemented |
| `CL-§10.2` | At the start of every session, run `git checkout main && git pull && git checkout -b branch-name` before any changes | 01-CONTRIBUTORS.md | — | Developer discipline; documented in `01-CONTRIBUTORS.md` | implemented |
| `CL-§10.3` | Branch names must be descriptive | 01-CONTRIBUTORS.md | — | Developer convention; no technical enforcement | implemented |
| `CL-§10.4` | After a branch is merged and pulled via `main`, delete the local branch | 01-CONTRIBUTORS.md | — | Developer discipline; no technical enforcement | implemented |
| `CL-§1.2` | No backend server is required to view any page | 03-architecture/forms-and-api.md §7 | STR-HTML-01..06 | `source/build/build.js` – all pages are pre-rendered to `public/` | covered |
| `CL-§1.4` | JavaScript usage is minimal | 03-architecture/forms-and-api.md §7 | — | `source/assets/js/client/` – only three small client scripts exist | implemented |
| `CL-§1.5` | Architecture is content-first: content is authored separately from layout | 03-architecture/rendering.md §6 | — | `source/content/*.md` (content) vs `source/build/` (layout) | implemented |
| `CL-§1.6` | Content, layout, and styling are clearly separated | 03-architecture/rendering.md §6 | — | `source/content/` (Markdown), `source/build/` (templates), `source/assets/cs/` (CSS) | implemented |
| `CL-§1.7` | The site is maintainable by non-developers | 01-CONTRIBUTORS.md | — | Content editable via Markdown + YAML; no build tools needed for content changes | implemented |
| `CL-§1.8` | Pages load fast | 03-architecture/forms-and-api.md §7 | — | Static HTML, no runtime framework, CSS custom properties only | implemented |
| `CL-§1.9` | Clarity is preferred over cleverness in all implementation decisions | 03-architecture/forms-and-api.md §7 | — | Principle; assessed through code review | implemented |
| `CL-§2.1` | Final build output is static HTML, CSS, and JS | 03-architecture/forms-and-api.md §7 | SNP-01 | `source/build/build.js` – writes to `public/` | covered |
| `CL-§2.2` | Main page sections are authored in Markdown | 03-architecture/rendering.md §6 | RNI-01..38 | `source/build/render-index.js` – `convertMarkdown()` | covered |
| `CL-§2.3` | Event data has a single source of truth; all views derive from it | 03-architecture/data-layer.md §1 | — | `source/data/*.yaml`; `source/build/build.js` reads exclusively from there | implemented |
| `CL-§2.4` | Layout components are reused across pages | 03-architecture/rendering.md §6 | LAY-01..06 | `source/build/layout.js` – shared `pageHeader()`, `pageNav()`, `pageFooter()` | covered |
| `CL-§2.5` | Markup is not duplicated between pages | 03-architecture/rendering.md §6 | LAY-07 | `source/build/layout.js` – single source of shared layout | covered |
| `CL-§2.6` | Heavy runtime dependencies are avoided | 03-architecture/forms-and-api.md §7 | — | `package.json` – no client-side framework dependencies | implemented |
| `CL-§2.7` | The site is not a single-page application | 03-architecture/forms-and-api.md §7 | STR-SPA-01..06 | Each page is a separate `.html` file; no client-side routing | covered |
| `CL-§2.8` | No database is used | 03-architecture/data-layer.md §1; 03-architecture/forms-and-api.md §7 | — | YAML files and Git are the only storage layer | implemented |
| `CL-§2.9` | No client-side rendering framework is used | 03-architecture/forms-and-api.md §7 | STR-FW-01..06 | `source/assets/js/client/` – plain vanilla JS only | covered |
| `CL-§2.10` | Custom complex build systems must not be created unless clearly justified | 03-architecture/forms-and-api.md §7 | — | `source/build/build.js` – straightforward Node.js script, no custom bundler | implemented |
| `CL-§2.11` | Standard, well-established static site tooling is preferred | 03-architecture/forms-and-api.md §7 | — | Principle; current toolchain is plain Node.js + YAML + Markdown | implemented |
| `CL-§3.1` | The main page is built from modular, independently reorderable sections | 03-architecture/rendering.md §6 | COV-08..09 | `source/content/*.md` sections; `source/build/render-index.js` assembles them | covered |
| `CL-§3.3` | Sections can be reordered or edited without modifying layout code | 03-architecture/rendering.md §6 | COV-10..11 | `source/build/render-index.js` – section order driven by config, not hardcoded | covered |
| `CL-§3.4` | All special pages share the same layout structure | 03-architecture/rendering.md §6 | LAY-08 | `source/build/layout.js` – shared layout used by all pages except Today/Display view | covered |
| `CL-§4.2` | Event data powers the weekly schedule, daily schedule, Today view, RSS feed, and future archive pages | 03-architecture/data-layer.md §1; 03-architecture/rendering.md §5 | — | `source/build/build.js` – single load feeds all render targets | implemented |
| `CL-§4.3` | No event is defined in more than one place | 03-architecture/data-layer.md §1 | — | One YAML file per camp; no duplication mechanism exists | implemented |
| `CL-§4.4` | Event sorting is deterministic | 03-architecture/rendering.md §5 | RND-28..32 | `source/build/render.js` – `groupAndSortEvents()` sorts by date + start | covered |
| `CL-§4.5` | Required event fields are validated before data is accepted | 05-DATA_CONTRACT.md §3 | VLD-04..11 | `source/api/validate.js` – `validateEventRequest()` | covered |
| `CL-§5.4` | Build fails if any linter reports errors | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – lint step gates the build | implemented |
| `CL-§5.6` | Event data is validated for required fields | 05-DATA_CONTRACT.md §3 | VLD-04..11 | `source/api/validate.js` – `validateEventRequest()` | covered |
| `CL-§5.7` | Event data is validated for valid dates | 05-DATA_CONTRACT.md §4 | VLD-12..15 | `source/api/validate.js` – date format check (range check missing — see `05-§4.1`) | implemented |
| `CL-§5.8` | Event data is validated: end time must be after start time | 05-DATA_CONTRACT.md §4 | VLD-16..20 | `source/api/validate.js` – `end <= start` check | covered |
| `CL-§5.9` | Event data is validated for duplicate identifiers (see `05-§6.1`) | 05-DATA_CONTRACT.md §6 | LNT-18, LNT-19..21 | `source/scripts/lint-yaml.js` – `seenIds` (duplicate ID check) + `seenCombos` (title+date+start uniqueness) | covered |
| `CL-§5.10` | The site builds locally without errors | 04-OPERATIONS.md (Local Development) | — | `npm run build` on developer machine | implemented |
| `CL-§5.11` | The site builds in GitHub Actions without errors | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – build step | implemented |
| `CL-§5.12` | CI fails if the build fails | 04-OPERATIONS.md (CI/CD Workflows) | — | `.github/workflows/ci.yml` – build step failure blocks merge | implemented |
| `CL-§6.1` | Build runs locally before merge | 04-OPERATIONS.md (Local Development) | — | Developer discipline + pre-commit hook | implemented |
| `CL-§6.2` | Lint passes before merge | 04-OPERATIONS.md (CI/CD Workflows) | — | CI lint step blocks merge on failure | implemented |
| `CL-§6.3` | Data validation passes before merge | 05-DATA_CONTRACT.md §3–§6 | LNT-01..23 | `source/scripts/lint-yaml.js` runs in CI (`event-data-deploy.yml` lint-yaml job); pre-commit hook runs `npm test` which includes lint-yaml tests | covered |
| `CL-§6.4` | Automated minimal tests exist for event sorting and date handling | — | RND-01..45 | `tests/render.test.js` | covered |
| `CL-§6.5` | Screenshot comparison tests exist for schedule pages | — | SNP-01..06 | `tests/snapshot.test.js` | covered |
| `CL-§7.1` | JavaScript footprint is minimal | 03-architecture/forms-and-api.md §7 | — | Three small client scripts; no framework | implemented |
| `CL-§7.2` | No unused CSS is shipped | 07-design/css-strategy.md §7 | — | Hand-written CSS with no unused rules (not enforced by tooling) | implemented |
| `CL-§7.3` | No large blocking assets are loaded | 03-architecture/forms-and-api.md §7 | — | No large scripts or stylesheets | implemented |
| `CL-§7.5` | No runtime hydration framework is used | 03-architecture/forms-and-api.md §7 | — | No framework; plain JS only | implemented |
| `CL-§7.6` | The site feels instant to load | 03-architecture/forms-and-api.md §7 | — | Static HTML + minimal JS + optimised CSS | implemented |
| `CL-§8.1` | Non-technical contributors can edit text content in Markdown without touching layout files | 01-CONTRIBUTORS.md | — | `source/content/*.md` editable directly; layout is separate | implemented |
| `CL-§8.2` | Non-technical contributors can add new events via YAML | 01-CONTRIBUTORS.md | — | `source/data/*.yaml` editable directly | implemented |
| `CL-§8.3` | Non-technical contributors can add images without editing layout files | 01-CONTRIBUTORS.md | — | Images referenced from Markdown content files | implemented |
| `CL-§8.4` | Layout files do not need to be edited for content changes | 03-architecture/rendering.md §6 | — | Content-layout separation is architectural; `source/build/` is never touched for content edits | implemented |
| `CL-§2.12` | Data file names are never hardcoded; active camp and file paths are always derived from `camps.yaml` | 03-architecture/data-layer.md §2 | — | `source/build/build.js` – reads `camps.yaml` first; `source/api/github.js` – same | implemented |
| `CL-§5.13` | Markdown linting runs on every commit via pre-commit hook; commit is blocked if lint fails | 04-OPERATIONS.md (CI/CD Workflows) | — | `.githooks/` pre-commit hook – `npm run lint:md`; `.markdownlint.json` config | implemented |
