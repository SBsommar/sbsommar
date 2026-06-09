# Contributing to SB Sommar

There are two types of contributors: **content editors** and **developers**.
Most contributions are content edits and require no programming knowledge.

> **Reading the docs in your browser:** the files in `docs/` are also
> published as a small documentation website by GitHub Pages. The URL
> appears in the repository under **Settings → Pages** once Pages is
> enabled — see [08-ENVIRONMENTS.md](08-ENVIRONMENTS.md#documentation-site)
> for setup details. Editing any file under `docs/` and pushing to
> `main` republishes the site automatically.

---

## Content Editors

Content editors update Markdown files and YAML data files.
No build tools or technical setup needed.

### Editing Page Content

Page content lives in the `source/content/` directory as Markdown files.

Each file corresponds to a section of the site:

- `source/content/index.md` — front page
- `source/content/faq.md` — frequently asked questions
- `source/content/registration.md` — registration information
- `source/content/pricing.md` — pricing
- `source/content/food.md` — food and meals
- `source/content/rules.md` — camp rules
- `source/content/activities.md` — activities overview
- `source/content/local-info.md` — practical local information
- `source/content/discord-guide.md` — Discord guide
- `source/content/how-it-started.md` — background story
- `source/content/testimonials.md` — participant testimonials

Edit these files directly using any text editor, or through GitHub's web interface (open the file in the repository and click the pencil icon). Layout is handled separately — you never need to touch the HTML templates.

### Adding or Editing Events

Event data lives in `source/data/`.

The active camp's events are in the file referenced by `source/data/camps.yaml`.
Historical camps are stored as individual YAML files (e.g. `2025-06-syssleback.yaml`).

See [05-DATA_CONTRACT.md](05-DATA_CONTRACT.md) for the full data structure.
See [04-OPERATIONS.md](04-OPERATIONS.md) for the operational workflow.

### Locations

Predefined locations are defined in `source/data/local.yaml` — this is the only place.
Never add a `locations:` list to individual camp files.

### Rules for Content Edits

- Write in Swedish unless the content is explicitly multilingual.
- Do not edit layout or template files.
- Do not modify files in `docs/` unless you are updating process documentation.
- Follow the Markdown formatting rules (a linter will check automatically on commit).

---

## Developers

Developers make changes to templates, build tooling, API server code, or project infrastructure.

### Setup

Requirements:

- [Node.js](https://nodejs.org/) 18 or later
- Git

Install dev dependencies:

```bash
npm install
```

This also configures the pre-commit hook automatically via `.githooks/`.

### Git Workflow

Always work on a branch. Never commit directly to `main`.

1. Pull the latest `main` before starting:

   ```bash
   git checkout main
   git pull
   ```

2. Create a new branch with a descriptive name:

   ```bash
   git checkout -b fix/schedule-sort-order
   git checkout -b feature/today-view-mobile
   ```

3. Make your changes, then push the branch and open a pull request.

4. CI (Continuous Integration — automated checks that run on every push) must pass before the PR can be merged.

5. After the PR is merged, pull `main` and delete the local branch:

   ```bash
   git checkout main
   git pull
   git branch -d fix/schedule-sort-order
   ```

### Pre-commit Hook

Every commit runs `markdownlint` on all Markdown files automatically.
If the lint check fails, the commit is blocked until the issue is fixed.

To run the check manually:

```bash
npm run lint:md
```

### Linting Rules

Linting is configured in [`.markdownlint.json`](../.markdownlint.json).

Disabled rules and the reasons:

| Rule  | Reason                                                                  |
| ----- | ----------------------------------------------------------------------- |
| MD013 | Line length is not enforced — content editors should not worry about it |
| MD025 | `CLAUDE.md` uses numbered `# N.` section headings intentionally         |
| MD029 | Ordered lists interrupted by code blocks or content are acceptable      |
| MD033 | Inline HTML is allowed where needed                                     |
| MD042 | Empty `(#)` placeholder links are acceptable during development         |

### Testing

Run all tests:

```bash
npm test
```

Regenerate schedule page snapshots after intentional visual changes:

```bash
npm run test:update-snapshots
```

Tests cover event sorting, date handling, and schedule page rendering.
Snapshot tests catch unintended layout regressions — they save the expected HTML output and fail if it changes unexpectedly, flagging the change for review.

### Architecture

Before making structural changes, read:

- [02-requirements/](02-requirements/index.md)
- [03-architecture/](03-architecture/)
- [05-DATA_CONTRACT.md](05-DATA_CONTRACT.md)
- [06-EVENT_DATA_MODEL.md](06-EVENT_DATA_MODEL.md)
- [CLAUDE.md](../CLAUDE.md)

### Core Constraints

- Static output only. No backend, no database.
- No client-side frameworks (React, Vue, etc.).
- Minimal JavaScript.
- CSS must use the custom properties defined in [07-design/css-strategy.md](07-design/css-strategy.md) — do not hardcode colors or spacing.
- Build must pass before merge.
- Lint must pass before merge.

---

## Deployment

Understanding how changes reach users helps you work with confidence.

### What happens after merge?

When your PR is merged to `main`, the deploy pipeline handles the rest —
but what it does depends on *what* changed:

| What changed | QA | Production |
| --- | --- | --- |
| Code (templates, CSS, JS, build) | Auto — full site rebuild and deploy | Manual — someone must trigger it |
| Event data (YAML files from the form) | Auto — event pages rebuild | Auto — event pages rebuild |

**Code changes** are deployed to QA automatically within a few minutes.
Production requires a separate, manual step — see below.

**Event data** (submitted via the activity form) is deployed to *both* QA
and Production automatically. This is because events are time-sensitive
during camp week and cannot wait for a manual step.

### Verifying on QA

After your PR is merged, check QA to confirm your changes look and work
as expected. Open the QA site in a browser and verify manually.

If something is wrong, fix it in a new PR. QA will update again on merge.

### Releasing to production

Production deploys require explicit approval. Only authorized approvers can
trigger or approve a production release.

For the full step-by-step process, see [09-RELEASING.md](09-RELEASING.md).

---

## Questions and Issues

If something is unclear or you find a bug, open an issue on GitHub or contact the maintainers directly.

When reporting a bug, include:

- Which page or view is affected.
- What you expected to see.
- What actually happened.
- Steps to reproduce, if you know them.

If the issue is urgent (e.g. the schedule is broken during camp), contact the maintainers directly — do not wait for a GitHub issue response.
