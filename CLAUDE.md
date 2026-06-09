# CLAUDE.md – SB Sommar Static Site

This document defines architectural rules and quality requirements.

The goal is a fast, maintainable, content-driven static site with light dynamic behavior.

Technology choices are not locked yet.
Architectural principles are.

---

# 0. Reference Documentation

Before writing any code, CSS, or data, read the relevant docs in `/docs/`.
These are the authoritative sources. CLAUDE.md summarises principles; the docs define detail.

| File | What it governs |
| ---- | --------------- |
| `docs/01-CONTRIBUTORS.md` | Contribution guidelines, git workflow, setup, linting |
| `docs/02-requirements/index.md` | Requirements index — audience overview (§1, §1a) and a map to the topic files below |
| `docs/02-requirements/pages-navigation.md` | Site structure: page inventory, navigation, footer, hero CTAs, accordions, anchor IDs |
| `docs/02-requirements/schedule-and-detail.md` | Schedule views, inline activity detail, per-event pages, RSS, iCal, Markdown rendering |
| `docs/02-requirements/add-edit-forms.md` | Add and edit forms, validation, submit flows, time-gating, cookies, drafts, delete, conflict warning |
| `docs/02-requirements/event-data.md` | Event data, locations, archive policy, naming, derived active camp, QA isolation, camps.yaml validator |
| `docs/02-requirements/build-deploy.md` | CI pipelines, environments, zero-downtime deploy, release docs, footer version, docs site build |
| `docs/02-requirements/caching-performance.md` | Cache headers, content-hash cache-busting, image dimensions and lazy-loading |
| `docs/02-requirements/platform-security.md` | Reliability, accessibility, language, security hardening, analytics, PWA, admin token, rate limiting |
| `docs/02-requirements/design-and-content.md` | Hero redesign, link colors, modal styling, registration banner, locale overview, index design |
| `docs/02-requirements/archive.md` | Archived requirements (superseded by later sections; IDs preserved) |
| `docs/03-architecture/index.md` | Architecture index — system overview and a map to the topic files below |
| `docs/03-architecture/data-layer.md` | Camp YAML, metadata registry, active-camp resolution, archive, footer, robots |
| `docs/03-architecture/rendering.md` | Page rendering logic, project structure, RSS feed, per-event pages |
| `docs/03-architecture/forms-and-api.md` | Session cookies, inline validation, deletion, submit flows, time-gating, draft cache |
| `docs/03-architecture/ci-and-deploy.md` | Event data CI pipeline, validators, Markdown converter, PHP API, asset cache-busting |
| `docs/03-architecture/pages-and-content.md` | Navigation, upcoming camps, hero, accordions, iCal, analytics, image dims, cache headers, feedback, registration banner |
| `docs/03-architecture/platform-and-security.md` | PWA, admin token, rate limiting, regex hygiene |
| `docs/03-architecture/appendix.md` | Decisions deliberately rejected; design philosophy |
| `docs/04-OPERATIONS.md` | Camp lifecycle: before/during/after, deployment, disaster recovery |
| `docs/05-DATA_CONTRACT.md` | YAML schema, required fields, validation rules, ID format |
| `docs/06-EVENT_DATA_MODEL.md` | Why the event data is shaped the way it is — ownership, metadata, stability reasoning |
| `docs/07-design/index.md` | Design index — philosophy, color palette, typography, layout/spacing, breakpoints, and a map to the topic files below |
| `docs/07-design/components.md` | Component visual rules: header, hero, banners, buttons, cards, accordions, form errors, modals, Markdown toolbar/preview, day grid, locale-overview grid, conflict warning |
| `docs/07-design/css-strategy.md` | How to write CSS, file structure, and the `:root` design tokens |
| `docs/07-design/imagery-and-accessibility.md` | Imagery guidance, accessibility minimums, what not to do |
| `docs/08-ENVIRONMENTS.md` | Local / QA / Production environments, secrets schema, GitHub Environments setup |
| `docs/09-RELEASING.md` | Step-by-step guide for deploying to production, rollback, release tagging |

Rules:

- Do not invent colors, spacing, or layout patterns not present in `07-design/`.
- Do not modify YAML files or the data schema without checking `05-DATA_CONTRACT.md` first.
- Do not change the camp lifecycle flow without checking `04-OPERATIONS.md` first.
- CSS must use the custom properties defined in `07-design/css-strategy.md §7` — do not hardcode colors, spacing, or typography values.

---

# 1. Core Principles

- Static build output. <!-- CL-§1.1 -->
- No backend server. <!-- CL-§1.2 -->
- No client-side framework (no React, Vue, etc.). <!-- CL-§1.3 -->
- Minimal JavaScript. <!-- CL-§1.4 -->
- Content-first architecture. <!-- CL-§1.5 -->
- Clear separation of content, layout, and styling. <!-- CL-§1.6 -->
- Maintainable by non-developers. <!-- CL-§1.7 -->
- Fast loading. <!-- CL-§1.8 -->

Clarity over cleverness. <!-- CL-§1.9 -->

Language:

- The site is in Swedish. All user-facing text — labels, headings, descriptions, error messages, confirmations — must be in Swedish. <!-- CL-§1.10 -->
- When writing requirements in `docs/02-requirements/`, describe the desired state — not "changes" or "improvements". <!-- CL-§1.11 -->
  - Write each requirement as a standalone fact about how the system works. A reader who has never seen the codebase should understand the requirement without needing to know what existed before.
  - **Bad**: "The cache version must be incremented to v4." / "lagg-till.html must be removed from NO_CACHE_PATTERNS."
  - **Good**: "The service worker cache name is `sb-sommar-v4`." / "The service worker pre-caches all site pages including `lagg-till.html` and `redigera.html`."
  - Avoid words like: "changed", "updated", "replaced", "removed", "incremented", "added", "new". These describe transitions, not desired state.
  - The Context subsection at the top of each requirement section is the only place where background and motivation belong. Requirements themselves are pure desired-state declarations.

---

# 2. Architecture Constraints

The implementation must:

- Produce static HTML/CSS/JS as final output. <!-- CL-§2.1 -->
- Support Markdown-based content for main sections. <!-- CL-§2.2 -->
- Support structured data for events (single source of truth). <!-- CL-§2.3 -->
- Reuse layout components across pages. <!-- CL-§2.4 -->
- Avoid duplicating markup between pages. <!-- CL-§2.5 -->
- Avoid heavy runtime dependencies. <!-- CL-§2.6 -->
- Never hardcode data file names; always derive active camp and file paths from `camps.yaml`. <!-- CL-§2.12 -->

Do NOT:

- Build a SPA. <!-- CL-§2.7 -->
- Introduce a database. <!-- CL-§2.8 -->
- Use client-side rendering frameworks. <!-- CL-§2.9 -->
- Create custom complex build systems unless clearly justified. <!-- CL-§2.10 -->

Prefer standard, well-established static site tooling. <!-- CL-§2.11 -->

---

# 3. Content Model

Main page:

- Built from modular sections. <!-- CL-§3.1 -->
- Content written in Markdown. <!-- CL-§3.2 -->
- Sections can be reordered or edited without modifying layout code. <!-- CL-§3.3 -->

Special pages:

- Add Activity
- Weekly Schedule
- Today View
- Display Mode (dark)
- RSS Feed
- Archive pages (later)

All must share layout structure. <!-- CL-§3.4 -->

---

# 4. Event Data Rules

Event data must:

- Live in one central structured source. <!-- CL-§4.1 -->
- Power: <!-- CL-§4.2 -->
  - Weekly schedule
  - Daily schedule
  - Today view
  - RSS feed
  - Future archive pages

There must be:

- No duplicated event definitions. <!-- CL-§4.3 -->
- Deterministic sorting. <!-- CL-§4.4 -->
- Clear validation of required fields. <!-- CL-§4.5 -->

---

# 5. Quality Requirements (From Day One)

## Linting

- HTML validation <!-- CL-§5.1 -->
- CSS linting <!-- CL-§5.2 -->
- JS linting <!-- CL-§5.3 -->
- Markdown linting <!-- CL-§5.13 -->

Build must fail if lint fails. <!-- CL-§5.4 -->

## Data Validation

Event data must be validated for: <!-- CL-§5.5 -->

- Required fields <!-- CL-§5.6 -->
- Valid dates <!-- CL-§5.7 -->
- End time after start time <!-- CL-§5.8 -->
- No duplicate identifiers <!-- CL-§5.9 -->

## Build Integrity

The site must:

- Build locally. <!-- CL-§5.10 -->
- Build in GitHub Actions. <!-- CL-§5.11 -->
- Fail CI if build fails. <!-- CL-§5.12 -->

---

# 6. Local Development Requirements

Before merge:

- Build must run locally. <!-- CL-§6.1 -->
- Lint must pass. <!-- CL-§6.2 -->
- Validation must pass. <!-- CL-§6.3 -->

Optional but encouraged:

- Automated minimal tests for event sorting and date handling. <!-- CL-§6.4 -->
- Screenshot comparison tests for schedule pages. <!-- CL-§6.5 -->

---

# 7. Performance Requirements

- Minimal JS footprint. <!-- CL-§7.1 -->
- No unused CSS. <!-- CL-§7.2 -->
- No blocking large assets. <!-- CL-§7.3 -->
- No runtime hydration frameworks. <!-- CL-§7.5 -->

The site should feel instant. <!-- CL-§7.6 -->

---

# 8. Maintainability

Non-technical contributors must be able to:

- Edit text content in Markdown. <!-- CL-§8.1 -->
- Add new events via structured data. <!-- CL-§8.2 -->
- Add images. <!-- CL-§8.3 -->
- Without editing layout files. <!-- CL-§8.4 -->

---

# 9. Deployment

- Built output lives in /public. <!-- CL-§9.1 -->
- GitHub Actions builds and validates. <!-- CL-§9.2 -->
- Deployment happens only after successful CI. <!-- CL-§9.3 -->
- For commits that modify only per-camp event files in `source/data/` (e.g. `2025-08-syssleback.yaml`), `ci.yml` skips `npm ci`, build, lint, and tests — the job passes after the detect step. Building and deploying event-data changes is handled by `event-data-deploy-post-merge.yml`. Configuration files in the same directory (`camps.yaml`, `local.yaml`) are not considered data-only and trigger full CI. <!-- CL-§9.4 -->
- CI workflows that compare the current branch to `main` (e.g. to detect changed files) must check out with enough git history for the comparison to succeed (`fetch-depth: 0` or equivalent). <!-- CL-§9.5 -->

---

# 10. Git Workflow

- Never push directly to `main`. <!-- CL-§10.1 -->
- At the start of every session — before writing any code or making any changes — run: <!-- CL-§10.2 -->

  ```bash
  git checkout main
  git pull
  git checkout -b branch-name
  ```

- Choose a descriptive branch name (e.g. `fix/schedule-sort`, `feature/today-view`, `docs/update-contract`). When the task comes from a GitHub Issue, include the issue number (e.g. `feat/42-today-view`, `fix/17-sort-bug`). <!-- CL-§10.3 -->
- After a branch has been merged and the merge has been pulled back via `main`, delete the local branch. <!-- CL-§10.4 -->

---

# 11. Feature Development Lifecycle

When implementing any new feature or significant change, follow these phases in order.
Do not skip phases. Each phase ends with a commit. <!-- CL-§11.1 -->

## Parallel-work rebase rule

When multiple branches are in flight, shared documentation files (`99-traceability.md`, `02-requirements/`, architecture and design docs) change frequently on `main` and are prone to renumbering conflicts. <!-- CL-§11.24 -->

Before editing any shared documentation file, rebase on the latest `main`: <!-- CL-§11.25 -->

```bash
git fetch origin main
git rebase origin/main
```

This applies throughout all phases — not only at Phase 7. The cost of rebasing when `main` has not moved is zero; the cost of discovering conflicts late is high. <!-- CL-§11.26 -->

## Phase 0 — Alignment

Before writing requirements, discuss the request. <!-- CL-§11.0 -->
This phase applies to all prompts — bugs, new features, refactors, data changes, documentation — anything. The user is not always right and should be told so when relevant.

**GitHub Issue intake:**

When the task is a GitHub Issue reference (e.g. "hämta issue #42"): <!-- CL-§11.27 -->

- Fetch the issue with `gh issue view <number>`.
- Read and understand the issue content — this becomes the request to align on.
- The rest of Phase 0 applies as usual: understand, challenge, assess size, agree.

**Understand and challenge the request:**

- Read the prompt carefully. Identify anything unclear, ambiguous, or potentially wrong.
- Check whether the request conflicts with existing requirements, architecture decisions, or data contracts.
- Propose improvements or alternatives if you see a better approach.
- Raise technical concerns (e.g. a requested approach that conflicts with the static-site constraint).

**Assess the size of the work:**

- If the request is large enough that it risks running out of context, producing a rushed result, or spanning too many concerns at once — say so explicitly. <!-- CL-§11.13 -->
- In that case, do not start implementing. Instead, decompose the request into a numbered list of self-contained work packages, write a ready-to-use prompt for each one, and stop. <!-- CL-§11.14 -->
- The user can then run each prompt as a separate session in the correct order.
- There is no fixed threshold — use judgement. A single focused feature is one session. Multiple new pages, a new data model, a new API layer, or a cross-cutting refactor spanning many files are candidates for splitting.

**Agree before proceeding:**

- Agree on scope and approach before writing any requirements.
- This phase does not end with a commit. It ends with mutual understanding.
- **Even when the fix seems obvious** — a one-liner, a typo, a clear bug — always pause to confirm: restate the problem, the proposed fix, and any trade-offs in one or two sentences. A misread prompt is harder to undo than a skipped step. Short messages are easy to misinterpret.

**Issue comment (when task comes from a GitHub Issue):**

After alignment is reached, post a comment on the issue summarizing the agreed solution from the user's perspective — not the technical approach. <!-- CL-§11.28 -->
Use `gh issue comment <number> --body "..."`. This comment becomes visible context when the closing PR lands.

Do not rubber-stamp prompts. If something seems off, say so. If something is too big, split it.

## Phase 1 — Requirements

Before writing any code: <!-- CL-§11.2 -->

- Convert the agreed prompt into structured requirements: user requirements, event/data requirements, and site requirements.
- Add them to the appropriate topic file under `docs/02-requirements/` with correct `02-§` IDs and inline comment markers. The `index.md` redirect map shows which topic owns which `02-§N` range.
- Commit: `docs: add requirements for [feature]`

## Phase 2 — Documentation and Traceability

- Document how each requirement is or will be implemented in the relevant architecture and design docs (`docs/03-architecture/`, `docs/07-design/`, etc.). <!-- CL-§11.3 -->
- Add new sections to docs where needed; existing docs may already cover some requirements.
- Add all new requirements to `docs/99-traceability.md` with status `gap`. <!-- CL-§11.4 -->
- Commit: `docs: document design and traceability for [feature]`

## Phase 3 — Tests

- Write tests for each testable requirement. <!-- CL-§11.5 -->
- If a requirement cannot be tested in code (visual, UX, or inherently manual), document the reason in the traceability matrix note field and mark it as a manual/AI validation checkpoint. <!-- CL-§11.6 -->
- Requirements that only involve browser-specific behaviour (DOM manipulation, `fetch` options, `localStorage`, CSS layout) cannot be unit-tested in Node.js. Mark these as manual checkpoints with a concrete, actionable verification step — e.g. *"open the form in a browser and confirm the banner appears below the submit button"*.
- Commit: `test: add tests for [feature]`

## Phase 4 — Implementation

- Write code to make all tests pass. <!-- CL-§11.7 -->
- Commit: `feat: implement [feature]`

**Wait for user review of the implementation result:**

After the implementation commit, stop and let the user see the result **running locally** before moving on. <!-- CL-§11.32 -->

- The branch must be checked out locally and the dev server running (`npm start` or project equivalent) so the user can actually interact with the change, not just read a summary.
- For UI changes: give the exact URLs to open (`/lagg-till.html`, `/redigera.html?id=…`, etc.) and any steps to reach the state that was changed (e.g. "admin token must be active", "open while `opens_for_editing` is in the future").
- For backend/API changes: give the exact `curl` command or test invocation the user can run to see the behaviour.
- For doc-only changes: point to the file paths and line ranges, and the rendered preview if one exists.
- Do not start Phase 5 until the user has looked at the running result and signalled that the direction is right. If they want changes, revise and re-run Phase 4.

The reasoning: if Phase 4 went in the wrong direction, every minute spent on traceability, extra review passes, and PR creation is wasted. A short pause here, with the thing running locally, is cheap; rework after Phase 8 is not.

## Phase 5 — Review and Traceability Update

- Verify that requirements, documentation, tests, and implementation are consistent and complete. <!-- CL-§11.8 -->
- Update the traceability matrix: set final statuses, fill in implementation references, link tests. <!-- CL-§11.9 -->
- Update summary counts in the matrix. <!-- CL-§11.10 -->
- Only create a commit if the matrix actually required updating. If Phase 2 already covered everything and nothing has changed, no commit is needed — verification alone is sufficient.
- Commit (if needed): `docs: traceability update for [feature]`

## Phase 6 — Final Check

Perform a structured review from multiple perspectives. <!-- CL-§11.11 -->
Repeat passes until a full pass finds nothing to fix, or until 5 passes have been completed — whichever comes first. <!-- CL-§11.12 -->

For each pass, check from every one of these perspectives in turn:

- **Developer**: Is the code clean, consistent with existing patterns, and maintainable? Are there edge cases unhandled? Is anything over-engineered or under-explained?
- **User** (a camp participant): Can they complete the task? Are labels, errors, and confirmations clear? Is the Swedish correct and natural?
- **Beginner developer**: Would someone new to this codebase understand what was added? Are there confusing names, implicit assumptions, or missing comments where needed?
- **Beginner user**: Would a non-technical person understand the form, the feedback, and the flow? Is anything intimidating or unclear?
- **First-time visitor**: Does the feature feel coherent with the rest of the site? Does anything feel out of place or inconsistent in tone, style, or layout?
- **AI self-review**: Step back and ask — did I miss anything? Did I take shortcuts? Did I follow all constraints? Is there anything I would do differently?

**Browser / manual verification for UI or frontend changes:**

When the change touches HTML, CSS, or client-side JavaScript — anything a user would see or interact with — the User pass is not complete until the feature has actually been used in a browser. <!-- CL-§11.30 -->

- Start the dev server (`npm start` or the project equivalent).
- Walk through the golden path and the relevant edge cases for the feature.
- Verify that other features on the same page still behave as before.
- If something cannot be reached without special state (expired token, locked form, specific date), arrange that state (e.g. temporarily adjust `camps.yaml`) and restore it before committing.
- If a browser check is genuinely impossible in the current environment (no dev server available, no browser access), say so explicitly in the review notes rather than silently skipping it.

Unit tests, lint, and CodeQL verify code correctness, not feature correctness.

After each pass: fix any issues found, then commit: `fix: post-review improvements for [feature] (pass N)`

If a pass finds nothing to fix, stop — no commit needed. The feature is done.

## Phase 7 — Rebase and Pull Request

Before opening a PR, ensure the branch is up to date with `main`. <!-- CL-§11.15 -->

**Rebase step:**

```bash
git fetch origin main
git rebase origin/main
```

- If there are conflicts, resolve them, then `git add` the resolved files and `git rebase --continue`. <!-- CL-§11.16 -->
- After a successful rebase, run `npm test` and `npm run lint:md` to confirm the branch is still clean. <!-- CL-§11.17 -->
- Commit any fixups made during conflict resolution before continuing.

**Pull request:**

- Create the PR with `gh pr create`. <!-- CL-§11.18 -->
- Title: short imperative phrase, under 70 characters.
- Body: summary bullets, test plan checklist, Claude Code footer.
- When the task comes from a GitHub Issue, include `Closes #<number>` in the PR body so the issue is closed automatically on merge. <!-- CL-§11.29 -->
- No commit is needed for this phase — the PR itself is the deliverable.

## Phase 8 — CI, Merge, and Cleanup

After the PR is created, verify that CI passes and complete the merge. <!-- CL-§11.19 -->

**Check CI:**

- Run `gh pr checks <number>` and wait for **all** checks to pass — including CodeQL (Analyze actions, Analyze javascript-typescript) and any other checks that may be added later. Do not merge while any check is pending or failing. <!-- CL-§11.20 -->
- If any check fails, investigate the failure, fix the issue on the branch, push, and re-check. <!-- CL-§11.21 -->

**Wait for user review and approval:**

After CI is green, stop and wait for the user to review the PR and explicitly approve the merge. Do not merge on the strength of green CI alone. <!-- CL-§11.31 -->

- Summarise what is ready for review (PR URL, CI status, any manual-verification notes).
- Do not interpret silence, earlier agreement on scope, or a thumbs-up on the plan as approval to merge — merge to `main` is a shared-system action that always needs an explicit go-ahead.
- If the user requests changes, return to the appropriate phase (tests, implementation, review) before merging.

**Merge:**

- Once the user has explicitly approved, merge the PR with `gh pr merge <number> --merge`. <!-- CL-§11.22 -->

**Cleanup:**

```bash
git checkout main
git pull
git branch -d <branch-name>
```

- Switch back to `main`, pull the merge, and delete the local branch. <!-- CL-§11.23 -->
- No commit is needed for this phase.

---

# Final Rule

If something adds complexity without clear value, it should not be added.
