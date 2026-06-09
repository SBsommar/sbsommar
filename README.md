# SB Sommar

SB Sommar is a family camp in Sysslebäck for particularly gifted children, young people, and their parents.

This is the camp's official website — the single place where families find everything they need to understand, trust, and decide to attend.

> **📖 Project documentation:** <https://moggleif.github.io/sbsommar/>
> — rendered from [`docs/`](docs/) and republished automatically on
> every push to `main`. Browse the documentation in your browser
> instead of clicking through `.md` files here.

---

## The Camp

SB Sommar is not a standard summer camp. It is a community week for families who often feel out of place elsewhere.

It offers:

- A safe and welcoming environment where gifted children meet peers
- Space for parents to connect with others who share the same experiences
- Participant-driven activities — the schedule is built by those attending
- Shared meals, shared time, shared experiences
- A week where being different is completely normal

The camp takes place in Sysslebäck, a small and peaceful location that sets the tone for the whole week.

---

## The Problem This Site Solves

Families considering the camp need to make a real decision. They need to understand what they are signing up for, whether it is right for their child, what it costs, and what to practically expect.

Without clear information, families hesitate or drop out. With it, they arrive prepared and confident.

This site replaces scattered emails, outdated PDFs, and word-of-mouth with one complete and trustworthy source of information.

---

## What the Site Provides

- Who the camp is for and what makes it different
- Dates, location, and how to get there
- Registration process and deadlines
- Pricing and what is included
- Accommodation and food
- Camp rules and practical preparation
- Frequently asked questions
- Testimonials from previous participants
- The live activity schedule for the current camp week
- A form where participants add their own activities during camp

Everything in one place. Updated before every camp. Easy to navigate on any device.

---

## The Activity Schedule

One of the site's most-used features during camp week is the live activity schedule.

Participants can view the full **weekly overview** and a **Today view** showing what's happening right now. A separate **display mode** page is designed for shared screens around the camp — dark background, large text, no interaction needed. Each activity shows its time, location, and who is responsible. Clicking an activity reveals the full description and any communication link.

Participants sign up to lead activities — a chess tournament, a hike, a film screening, a workshop — and add them directly through the site. The schedule updates within minutes. No admin needed. No emails back and forth.

This reflects the camp's philosophy: the participants shape the week.

---

## Tone and Principles

The site is written for families, not for organizations.

Warm but structured. Calm and trustworthy. Clear and precise. In Swedish.

No hype. No corporate language. No complexity.

> If a parent visits for the first time, they should leave feeling:
> *"I understand what this is. I know how it works. And I feel comfortable taking the next step."*

---

## For Developers

### Quick Start

Requires Node.js 18 or later.

```bash
npm install
npm run build
npm start          # http://localhost:3000
```

The project has two parts: a **static site** generated at build time from YAML and Markdown, and a small **API server** (`app.js`) that handles event submissions by committing directly to GitHub and triggering an automated rebuild and deploy.

Start by reading [docs/01-CONTRIBUTORS.md](docs/01-CONTRIBUTORS.md). It covers setup, git workflow, linting, and testing. The rest of the documentation is listed below in suggested reading order.

### Documentation

Read the full documentation in your browser at
<https://moggleif.github.io/sbsommar/>, or click any file below to
read it directly on GitHub.

| #  | Doc | What it covers |
| -- | --- | -------------- |
| 1  | [docs/01-CONTRIBUTORS.md](docs/01-CONTRIBUTORS.md) | Setup, git workflow, linting, testing, contribution rules |
| 2  | [docs/02-requirements/](docs/02-requirements/index.md) | Requirements index — audience overview and a map to the topic files below |
| 2a | [docs/02-requirements/pages-navigation.md](docs/02-requirements/pages-navigation.md) | Site structure, page inventory, navigation, footer, hero CTAs |
| 2b | [docs/02-requirements/schedule-and-detail.md](docs/02-requirements/schedule-and-detail.md) | Schedule views, inline activity detail, per-event pages, RSS, iCal, Markdown rendering |
| 2c | [docs/02-requirements/add-edit-forms.md](docs/02-requirements/add-edit-forms.md) | Add and edit forms, validation, submit flows, time-gating, drafts, delete |
| 2d | [docs/02-requirements/event-data.md](docs/02-requirements/event-data.md) | Event data, locations, archive policy, naming, derived active camp, QA isolation |
| 2e | [docs/02-requirements/build-deploy.md](docs/02-requirements/build-deploy.md) | CI pipelines, environments, zero-downtime deploy, release docs, footer version, docs site build |
| 2f | [docs/02-requirements/caching-performance.md](docs/02-requirements/caching-performance.md) | Cache headers, content-hash cache-busting, image dimensions and lazy-loading |
| 2g | [docs/02-requirements/platform-security.md](docs/02-requirements/platform-security.md) | Reliability, accessibility, language, security hardening, analytics, PWA, admin token, rate limiting |
| 2h | [docs/02-requirements/design-and-content.md](docs/02-requirements/design-and-content.md) | Hero redesign, link colors, modal styling, registration banner, locale overview, index design |
| 2z | [docs/02-requirements/archive.md](docs/02-requirements/archive.md) | Archived requirements (superseded by later sections; IDs preserved) |
| 3  | [docs/03-architecture/](docs/03-architecture/index.md) | Architecture index — overview and a map to the topic files below |
| 3a | [docs/03-architecture/data-layer.md](docs/03-architecture/data-layer.md) | Camp YAML, metadata registry, active-camp resolution, archive, footer, robots |
| 3b | [docs/03-architecture/rendering.md](docs/03-architecture/rendering.md) | Page rendering logic, project structure, RSS feed, per-event pages |
| 3c | [docs/03-architecture/forms-and-api.md](docs/03-architecture/forms-and-api.md) | Session cookies, inline validation, deletion, submit flows, time-gating, draft cache |
| 3d | [docs/03-architecture/ci-and-deploy.md](docs/03-architecture/ci-and-deploy.md) | Event data CI pipeline, validators, Markdown converter, PHP API, asset cache-busting |
| 3e | [docs/03-architecture/pages-and-content.md](docs/03-architecture/pages-and-content.md) | Navigation, upcoming camps, hero, accordions, iCal, analytics, image dims, cache headers, feedback, registration banner |
| 3f | [docs/03-architecture/platform-and-security.md](docs/03-architecture/platform-and-security.md) | PWA, admin token, rate limiting, regex hygiene |
| 3g | [docs/03-architecture/appendix.md](docs/03-architecture/appendix.md) | Decisions deliberately rejected; design philosophy |
| 4  | [docs/04-OPERATIONS.md](docs/04-OPERATIONS.md) | Commands, camp lifecycle, deployment, disaster recovery |
| 5  | [docs/05-DATA_CONTRACT.md](docs/05-DATA_CONTRACT.md) | YAML schema, required fields, ID format, stability policy |
| 6  | [docs/06-EVENT_DATA_MODEL.md](docs/06-EVENT_DATA_MODEL.md) | Event field definitions, ownership, and metadata |
| 7  | [docs/07-design/](docs/07-design/index.md) | Design index — philosophy, colors, typography, layout/spacing, breakpoints, and a map to the topic files below |
| 7a | [docs/07-design/components.md](docs/07-design/components.md) | Component visual rules: header, hero, banners, buttons, cards, accordions, form errors, modals, Markdown toolbar/preview, day grid, locale-overview grid, conflict warning |
| 7b | [docs/07-design/css-strategy.md](docs/07-design/css-strategy.md) | How to write CSS, file structure, and the `:root` design tokens |
| 7c | [docs/07-design/imagery-and-accessibility.md](docs/07-design/imagery-and-accessibility.md) | Imagery guidance, accessibility minimums, what not to do |
| 8  | [docs/08-ENVIRONMENTS.md](docs/08-ENVIRONMENTS.md) | Local / QA / Production environments, secrets schema, documentation site setup |
| 9  | [docs/09-RELEASING.md](docs/09-RELEASING.md) | Step-by-step guide for deploying to production, rollback, release tagging |
| 99 | [docs/99-traceability.md](docs/99-traceability.md) | Requirements traceability matrix — every requirement, its tests, and its implementation |
