---
title: Project Documentation
---

# Project Documentation

> **📦 Source:**
> [SBsommar/sbsommar](https://github.com/SBsommar/sbsommar)
> · [README](https://github.com/SBsommar/sbsommar#readme)
> · [Issues](https://github.com/SBsommar/sbsommar/issues)

This is the developer-facing documentation for a static-site project.
Start with the [README](https://github.com/SBsommar/sbsommar#readme)
on GitHub for project context, then use the index below to dive into
contribution rules, architecture, data contracts, design tokens,
environments, releasing, and the full requirements traceability matrix.

## Documentation index

| File | What it covers |
| --- | --- |
| [01-CONTRIBUTORS.md](01-CONTRIBUTORS.md) | Contribution guidelines, git workflow, setup, linting |
| [02-requirements/](02-requirements/index.md) | Requirements index — audience overview and a map to the topic files below |
| [02-requirements/pages-navigation.md](02-requirements/pages-navigation.md) | Site structure, page inventory, navigation, footer, hero CTAs |
| [02-requirements/schedule-and-detail.md](02-requirements/schedule-and-detail.md) | Schedule views, inline activity detail, per-event pages, RSS, iCal, Markdown rendering |
| [02-requirements/add-edit-forms.md](02-requirements/add-edit-forms.md) | Add and edit forms, validation, submit flows, time-gating, drafts, delete |
| [02-requirements/event-data.md](02-requirements/event-data.md) | Event data, locations, archive policy, naming, derived active camp, QA isolation |
| [02-requirements/build-deploy.md](02-requirements/build-deploy.md) | CI pipelines, environments, zero-downtime deploy, release docs, footer version, docs site build |
| [02-requirements/caching-performance.md](02-requirements/caching-performance.md) | Cache headers, content-hash cache-busting, image dimensions and lazy-loading |
| [02-requirements/platform-security.md](02-requirements/platform-security.md) | Reliability, accessibility, language, security hardening, analytics, PWA, admin token, rate limiting |
| [02-requirements/design-and-content.md](02-requirements/design-and-content.md) | Hero redesign, link colors, modal styling, registration banner, locale overview, index design |
| [02-requirements/archive.md](02-requirements/archive.md) | Archived requirements (superseded; IDs preserved) |
| [03-architecture/](03-architecture/index.md) | Architecture index — overview and a map to the topic files below |
| [03-architecture/data-layer.md](03-architecture/data-layer.md) | Camp YAML, metadata registry, active-camp resolution, archive, footer, robots |
| [03-architecture/rendering.md](03-architecture/rendering.md) | Page rendering logic, project structure, RSS feed, per-event pages |
| [03-architecture/forms-and-api.md](03-architecture/forms-and-api.md) | Session cookies, inline validation, deletion, submit flows, time-gating, draft cache |
| [03-architecture/ci-and-deploy.md](03-architecture/ci-and-deploy.md) | Event data CI pipeline, validators, Markdown converter, PHP API, asset cache-busting |
| [03-architecture/pages-and-content.md](03-architecture/pages-and-content.md) | Navigation, upcoming camps, hero, accordions, iCal, analytics, image dims, cache headers, feedback, registration banner |
| [03-architecture/platform-and-security.md](03-architecture/platform-and-security.md) | PWA, admin token, rate limiting, regex hygiene |
| [03-architecture/appendix.md](03-architecture/appendix.md) | Decisions deliberately rejected; design philosophy |
| [04-OPERATIONS.md](04-OPERATIONS.md) | Operational lifecycle, deployment, disaster recovery |
| [05-DATA_CONTRACT.md](05-DATA_CONTRACT.md) | YAML schema, required fields, validation rules, ID format |
| [06-EVENT_DATA_MODEL.md](06-EVENT_DATA_MODEL.md) | Why event data is shaped the way it is — ownership, metadata, stability |
| [07-design/](07-design/index.md) | Design index — philosophy, color palette, typography, layout/spacing, breakpoints, and a map to the topic files below |
| [07-design/components.md](07-design/components.md) | Component visual rules: header, hero, banners, buttons, cards, accordions, form errors, modals, Markdown toolbar/preview, day grid, locale-overview grid, conflict warning |
| [07-design/css-strategy.md](07-design/css-strategy.md) | How to write CSS, file structure, and the `:root` design tokens |
| [07-design/imagery-and-accessibility.md](07-design/imagery-and-accessibility.md) | Imagery guidance, accessibility minimums, what not to do |
| [08-ENVIRONMENTS.md](08-ENVIRONMENTS.md) | Local / QA / Production environments, secrets schema, this docs site |
| [09-RELEASING.md](09-RELEASING.md) | Step-by-step guide for deploying to production, rollback, release tagging |
| [99-traceability/](99-traceability/index.md) | Traceability index — how to read the matrix, summary, top gaps, and a map to the per-family files below |
| [99-traceability/02-requirements.md](99-traceability/02-requirements.md) | Traceability rows for `02-§` requirement IDs |
| [99-traceability/03-architecture.md](99-traceability/03-architecture.md) | Traceability rows for `03-§` requirement IDs |
| [99-traceability/05-data-contract.md](99-traceability/05-data-contract.md) | Traceability rows for `05-§` requirement IDs |
| [99-traceability/07-design.md](99-traceability/07-design.md) | Traceability rows for `07-§` requirement IDs |
| [99-traceability/claude.md](99-traceability/claude.md) | Traceability rows for `CL-§` requirement IDs |
| [99-traceability/test-id-legend.md](99-traceability/test-id-legend.md) | Test ID legend — maps test-ID prefixes to their files and `describe` suites |

## About this site

This documentation site is intentionally hidden from search engines:
it is served with a `Disallow: /` `robots.txt` and every rendered
page emits a `<meta name="robots" content="noindex, nofollow">` tag.
Reach it through a direct link only.

To suggest a change, edit the relevant Markdown file in the repository
and open a pull request — see
[01-CONTRIBUTORS.md](01-CONTRIBUTORS.md) for the workflow.
