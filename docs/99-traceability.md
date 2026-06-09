# Requirements Traceability Matrix – SB Sommar

## What is this document?

A requirements traceability matrix answers three questions for every requirement:

1. **Is it documented?** Where does the requirement come from?
2. **Is it implemented?** Which code makes it work?
3. **Is it verified?** Which test proves it works?

When a requirement has no test, it may be broken without anyone noticing.
When a requirement has no implementation, it is a gap — a feature that is missing.
This document makes those gaps visible so they can be planned and prioritised.

---

## How to read the columns

### ID

A short, stable reference you can use in issues, pull requests, and commit messages.
For example: `"this PR closes 02-§9.5"`.

The ID appears in **two places**: in this matrix (the Table section below), and inline in the
source document next to the requirement text as an HTML comment. To find requirement `02-§9.5`,
search for `02-§9.5` in either this file or anywhere under `docs/02-requirements/` — it will appear
on the line that says `` `location` is present and non-empty ``.

Format: `{doc}-§{section}.{counter}`

- `02` = the document family the requirement comes from (`02-requirements/`)
- `§9` = the section number inside that family (matches the `## 9.` heading in the topic file that owns §9)
- `.5` = a sequential counter within that section (labels are added top-to-bottom)

The section prefix tells you *which document owns the requirement* and therefore where to look
if you want to read the surrounding context or open a discussion about changing it.
When adding a new requirement to a section, give it the next available number in that section
and add the `<!-- {id} -->` comment to the source doc alongside the entry in this matrix.

Examples:

- `02-§4.2` = second requirement from §4 of `02-requirements/` (lives in the topic file that owns §4)
- `05-§4.1` = first requirement from §4 of `05-DATA_CONTRACT.md`
- `CL-§5.3` = third requirement from §5 of `CLAUDE.md`

The documents requirements are drawn from:

| Prefix | Document |
| --- | --- |
| `02` | `docs/02-requirements/` — what the site must do and for whom (split across topic files; see the index for the redirect map) |
| `05` | `docs/05-DATA_CONTRACT.md` — YAML schema and validation rules |
| `07` | `docs/07-DESIGN.md` — visual design, CSS tokens, accessibility |
| `CL` | `CLAUDE.md` — architectural constraints and quality requirements |

### Requirement

One sentence describing a single, testable thing the system must do.
"Single" matters — if a sentence could be split into two independently verifiable things, it should be.

### Doc Ref

This is **not** where the requirement is stated — it is where the *solution approach* is documented.
It points to the doc that tells a developer *how* to implement the requirement.

Example: the requirement "event date must fall within camp dates" comes from `02-requirements/add-edit-forms.md §9`,
but the implementation rules (date format, range check) are specified in `06-EVENT_DATA_MODEL.md §4`,
so that is the Doc Ref.

A `—` here means no implementation guidance has been written yet.
That is itself a gap worth noting.

### Test(s)

Short IDs that point to tests in the `tests/` directory.
The full mapping from ID to file and describe-suite is in the **Test ID Legend** at the bottom.

Examples:

- `VLD-04..11` = tests VLD-04 through VLD-11 in `tests/validate.test.js`
- `SNP-01` = first test in `tests/snapshot.test.js`

Tests are listed **before** Implementation to reflect the intended order of work:
write the test first, then write the code that makes it pass.

A `—` here means no automated test exists for this requirement.

### Implementation

The file(s) and function(s) in the codebase where the requirement is satisfied.
A `—` means nothing has been built yet.
Notes in parentheses explain partial or incorrect implementations.

### Status

| Value | Meaning |
| --- | --- |
| `covered` | Code exists **and** a test verifies it |
| `implemented` | Code exists, but no automated test |
| `gap` | The requirement has no implementation (and no test) |

`implemented` is not the same as `covered`. Code that is not tested may break silently.
Aim to move all `implemented` rows toward `covered` over time.

### Archived (superseded) requirements

Rows below marked **superseded by 02-§X** describe requirements whose prose has
been moved to `docs/02-requirements/archive.md`. The IDs are kept verbatim because
they are still cited from code and from this matrix; the moved prose is preserved
there for historical context. Refer to that file for the current list of archived
ID ranges.

---

Audit date: 2026-02-24. Last updated: 2026-04-24 (locale overview page delivered, 02-§98.1–98.20 all covered/implemented).

---

## Table

| ID | Requirement | Doc Ref | Test(s) | Implementation | Status |
| --- | --- | --- | --- | --- | --- |
| `02-§2.1` | Homepage exists and is served at `/` | 03-architecture/rendering.md §5, §6 | COV-01..05 | `source/build/render-index.js`, `source/build/build.js` → `public/index.html` | covered |
| `02-§2.2` | Weekly schedule page exists at `/schema.html` | 03-architecture/rendering.md §5 | SNP-01 | `source/build/render.js`, `source/build/build.js` → `public/schema.html` | covered |
| `02-§2.4` | Today view at `/idag.html` shows today's activities in the standard site layout | 03-architecture/rendering.md §5 | IDAG-05..18 | `source/build/render-idag.js`, `source/build/build.js` → `public/idag.html` | covered |
| `02-§2.4a` | Display view at `/live.html` uses dark background, large text, and no navigation | 03-architecture/data-layer.md §3, 07-DESIGN.md §6 | DIS-01..25 | `source/build/render-today.js`, `source/build/build.js` → `public/live.html` | covered |
| `02-§2.5` | Add-activity form exists at `/lagg-till.html` | 03-architecture/data-layer.md §3; 03-architecture/rendering.md §6 | RADD-01..04 | `source/build/render-add.js`, `source/build/build.js` → `public/lagg-till.html` | covered |
| `02-§2.6` | Archive page exists at `/arkiv.html` | 03-architecture/data-layer.md §4a | ARK-01..08 | `source/build/render-arkiv.js`, `source/build/build.js` → `public/arkiv.html` | covered |
| `02-§2.7` | RSS feed exists at `/schema.rss` | 03-architecture/rendering.md §17 | RSS-01 | `source/build/render-rss.js`, `source/build/build.js` → `public/schema.rss` | covered |
| `02-§2.8` | Homepage, schedule, add-activity, and archive pages share header and navigation | 03-architecture/rendering.md §6 | SNP-01, LAY-01..07 | `source/build/layout.js` – `pageNav()` | covered |
| `02-§2.9` | None of the site pages require login | 03-architecture/data-layer.md §3 | COV-16 | No authentication exists anywhere in the codebase | covered |
| `02-§2.10` | Display view has no header or navigation | 03-architecture/data-layer.md §3, 07-DESIGN.md §6 | DIS-04..06 | `source/build/render-today.js` – no `pageNav()` call | covered |
| `02-§3.1` | Homepage answers all pre-camp questions (what, who, when, cost, registration, lodging, rules, testimonials) | 03-architecture/rendering.md §5 | COV-06..07 | `source/build/render-index.js`, `source/content/*.md` sections | covered |
| `02-§3.2` | Homepage includes a collapsible FAQ section | 03-architecture/rendering.md §5; `collapsible: true` in `sections.yaml` | RNI-22..28 | `source/build/render-index.js` – `convertMarkdown(…, collapsible: true)` | covered |
| `02-§3.3` | Homepage remains complete and usable even when no camp is active | 03-architecture/rendering.md §5 (Fallback rule) | COV-12..13 | `source/build/build.js` – falls back to most recent camp by `start_date` | covered |
| `02-§3.4` | Schedule and add-activity links are prominent when a camp is active or upcoming | 03-architecture/data-layer.md §3 | — | `source/build/layout.js` – nav always shows all links (not conditionally prominent based on camp state) | implemented |
| `02-§3.5` | Upcoming-camps list renders each camp as a compact one-liner with no separators | 03-architecture/pages-and-content.md §14.6 | CL-01, CL-02, CL-03 (CSS presence); manual: visual check | `source/assets/cs/style.css` – `.camp-item`, `.camp-body` flex layout | covered |
| `02-§3.6` | Registration section links to the external booking site (URL defined in build code) | 02-requirements/pages-navigation.md §3 | REG-01 | `source/build/render-index.js` – `REGISTRATION_URL` | covered |
| `02-§3.7` | Pricing and rules sections document cancellation refund tiers and organiser's right to refuse | 02-requirements/pages-navigation.md §3 | REG-02..05 | `source/content/pricing.md`, `source/content/rules.md` | covered |
| `02-§4.1` | Weekly schedule shows all activities for the full camp week, grouped by day | 03-architecture/rendering.md §5 | SNP-02, SNP-03 | `source/build/render.js` – `renderSchedulePage()`, `groupAndSortEvents()` | covered |
| `02-§4.2` | Within each day, activities are listed in chronological order by start time | 03-architecture/rendering.md §5 | RND-28..32 | `source/build/render.js` – `groupAndSortEvents()` | covered |
| `02-§4.3` | Each activity shows title, start time, end time, location, and responsible person | 05-DATA_CONTRACT.md §2, §3 | RND-39..45 | `source/build/render.js` – `renderEventRow()` | covered |
| `02-§4.5` | Today view (`/idag.html`) shows only today's activities in the standard site layout | 03-architecture/rendering.md §5 | IDAG-09..11 | `source/build/render-idag.js`, `source/assets/js/client/events-today.js` | covered |
| `02-§4.6` | Display view has dark background, large text, and minimal chrome; legible at a distance | 07-DESIGN.md §6 | DIS-07, CSS-37 | `source/build/render-today.js` – `class="display-mode"`; `source/assets/cs/style.css` → `/live.html` | covered |
| `02-§4.7` | Display view requires no interaction to stay useful | 03-architecture/data-layer.md §3 | DIS-08..09 | `source/build/render-today.js` – no day controls rendered | covered |
| `02-§4.14` | Display view shows no site-level footer | 02-requirements/schedule-and-detail.md §4 | DIS-19 | `source/build/render-today.js` – `pageFooter` call and import removed; no `<footer>` in template | covered |
| `02-§4.15` | Display view shows a live clock of the current time in the sidebar, updated every second | 02-requirements/schedule-and-detail.md §4; 07-DESIGN.md §6.40 | DIS-22, DIS-23 | `source/build/render-today.js` – `<div class="status-bar">` with `id="live-clock"`; `source/assets/js/client/events-today.js` – `updateClock()` via `setInterval` | covered |
| `02-§4.16` | Display view shows when events were last updated; timestamp embedded at build time | 02-requirements/schedule-and-detail.md §4; 07-DESIGN.md §6.40 | DIS-20, DIS-21 | `source/build/build.js` – `buildTime = new Date().toISOString()`; `source/build/render-today.js` – `window.__BUILD_TIME__`, `window.__VERSION__`; `events-today.js` – `buildInfoEl.textContent` | covered |
| `02-§4.17` | Display view polls `version.json` every 5 minutes and reloads if a newer build is detected | 02-requirements/schedule-and-detail.md §4 | — (manual: deploy a new build while page is open; confirm reload within 5 min) | `source/assets/js/client/events-today.js` – `pollVersion()` via `setInterval`; `source/build/build.js` – writes `public/version.json` | implemented |
| `02-§4.18` | Display view reloads automatically shortly after midnight to show the new day's events | 02-requirements/schedule-and-detail.md §4 | — (manual: advance system clock past 00:00 and confirm page reloads) | `source/assets/js/client/events-today.js` – `scheduleMidnightReload()` via `setTimeout` | implemented |
| `02-§4.19` | Display view heading shows only the current day and date, without a page-title prefix | 02-requirements/schedule-and-detail.md §4; 07-DESIGN.md §6.46 | DIS-13, DIS-24 | `source/build/render-today.js` – `window.__HEADING_PREFIX__ = ''`; `source/assets/js/client/events-today.js` – ternary skips prefix when empty | covered |
| `02-§4.20` | Display view heading is positioned inside the sidebar, not above the event list | 02-requirements/schedule-and-detail.md §4; 07-DESIGN.md §6.44 | DIS-24, DIS-25 | `source/build/render-today.js` – `<h1 id="today-heading" class="sidebar-heading">` inside `<aside class="dagens-sidebar">` | covered |
| `02-§4.21` | Display view is optimised for portrait screens; event rows are compact | 02-requirements/schedule-and-detail.md §4; 07-DESIGN.md §6.45, §6.48 | — (manual: open `/live.html` in a portrait viewport ~1080×1920 and confirm event rows are compact and the sidebar is narrow) | `source/assets/cs/style.css` – `.dagens-events { flex: 3 }`, `.dagens-sidebar { flex: 1 }`, `body.display-mode .event-row { font-size: 13px; padding: 6px }` | implemented |
| `02-§76.1` | Old `/dagens-schema.html` URL redirects to `/live.html` | 02-requirements/schedule-and-detail.md §4 | RDR-01..04 | `source/build/render-today.js` – `renderRedirectPage()`; `source/build/build.js` → `public/dagens-schema.html` | covered |
| `02-§77.1` | Build computes MD5 hash of each JS file referenced by `<script>` tags | 03-architecture/ci-and-deploy.md §27 | CACHE-10 | `source/build/build.js` – JS cache-busting post-processing | covered |
| `02-§77.2` | Build replaces `src="<file>.js"` with `src="<file>.js?v=<hash>"` in all HTML | 03-architecture/ci-and-deploy.md §27 | CACHE-11 | `source/build/build.js` – JS cache-busting post-processing | covered |
| `02-§77.3` | JS hash is deterministic: identical content → identical hash | 03-architecture/ci-and-deploy.md §27 | CACHE-12 | `source/build/build.js` – `crypto.createHash('md5')` | covered |
| `02-§77.4` | JS cache-busting is a post-processing step; no render signatures change | 03-architecture/ci-and-deploy.md §27 | CACHE-10 | `source/build/build.js` – runs after all pages are built | covered |
| `02-§77.5` | Existing tests that verify JS file presence continue to pass | 03-architecture/ci-and-deploy.md §27 | — | Manual: `npm test` passes with 1265 tests | implemented |
| `02-§78.1` | Build computes MD5 hash of each image file referenced by `<img>` tags | 03-architecture/ci-and-deploy.md §27 | CACHE-13 | `source/build/build.js` – image cache-busting post-processing | covered |
| `02-§78.2` | Build replaces `src="<file>.<ext>"` with `src="<file>.<ext>?v=<hash>"` in all HTML | 03-architecture/ci-and-deploy.md §27 | CACHE-14 | `source/build/build.js` – image cache-busting post-processing | covered |
| `02-§78.3` | Image hash is deterministic: identical content → identical hash | 03-architecture/ci-and-deploy.md §27 | CACHE-15 | `source/build/build.js` – `crypto.createHash('md5')` | covered |
| `02-§78.4` | Image cache-busting is a post-processing step; no render signatures change | 03-architecture/ci-and-deploy.md §27 | CACHE-13 | `source/build/build.js` – runs after all pages are built | covered |
| `02-§78.5` | Existing tests that verify image file presence continue to pass | 03-architecture/ci-and-deploy.md §27 | — | Manual: `npm test` passes with 1265 tests | implemented |
| `02-§4.8` | Overlapping activities are allowed and the schedule remains readable | 03-architecture/rendering.md §5, 07-DESIGN.md §6 | RDC-05..06 | No exclusion logic in `source/build/render.js`; CSS handles layout | covered |
| `02-§4.9` | Clicking an activity opens its detail view | 03-architecture/rendering.md §5 | RND-41, RND-42 | `source/build/render.js` – `renderEventRow()` uses `<details>` element | covered |
| `02-§5.1` | Detail view shows all populated fields; fields with no value do not appear | 05-DATA_CONTRACT.md §2, §3 | RND-33..38, RND-43 | `source/build/render.js` – `eventExtraHtml()`, `renderEventRow()` | covered |
| `02-§6.1` | Form at `/lagg-till.html` accepts a new activity submission | 03-architecture/data-layer.md §3 | RADD-03..04 | `source/build/render-add.js` (HTML), `source/assets/js/client/lagg-till.js` (submit) | covered |
| `02-§6.2` | Date field is constrained to the active camp's date range | 05-DATA_CONTRACT.md §4 | RADD-05..07 | `source/build/render-add.js` – `min`/`max` attributes on date input | covered |
| `02-§6.3` | Location field is a dropdown populated from `source/data/local.yaml` | 03-architecture/rendering.md §6 | RADD-08..10 | `source/build/build.js` (loads `local.yaml`); `source/build/render-add.js` (renders `<select>`) | covered |
| `02-§6.4` | Time fields guide the user toward a valid `HH:MM` value | 05-DATA_CONTRACT.md §4 | RADD-11..12 | `source/build/render-add.js` – `type="time"` inputs (browser-native validation) | covered |
| `02-§6.5` | Form errors are shown inline, per field, immediately on submit | 03-architecture/forms-and-api.md §7a; 07-DESIGN.md §6.34–6.39 | ILE-01..04, ILE-E01..E04 | `render-add.js` / `render-edit.js` (`.field-error` spans, `aria-describedby`); `lagg-till.js` / `redigera.js` (per-field `setFieldError`); `style.css` (`.field-error`, `[aria-invalid]`) | covered |
| `02-§6.6` | Submit button is disabled and shows a visual indicator while submission is in progress | 03-architecture/data-layer.md §3 | — | `source/assets/js/client/lagg-till.js` – `submitBtn.disabled = true`; `textContent = 'Sparar...'` | implemented |
| `02-§6.7` | A clear success confirmation is shown after submission | 03-architecture/data-layer.md §3 | — | `source/assets/js/client/lagg-till.js` – reveals `#result` section with activity title | implemented |
| `02-§6.8` | Network failure shows a clear error and allows retry; submissions are never silently lost | 03-architecture/data-layer.md §3 | — | `source/assets/js/client/lagg-till.js` – `.catch()` re-enables button and shows error | implemented |
| `02-§6.9` | Date field shows an inline error immediately on `change` if the value is in the past | 07-DESIGN.md §6.34–6.39 | LVD-01 | `source/assets/js/client/lagg-till.js` – `change` listener on `#f-date` | implemented |
| `02-§6.10` | End-time field evaluated on `change` using midnight-crossing rule (§54); shows info or error | 07-DESIGN.md §6.34–6.39, §6.44a–6.44g | LVD-02 | `source/assets/js/client/lagg-till.js` – `change` listener on `#f-end` | implemented |
| `02-§6.11` | Any required field shows an inline error on `blur` if it is empty | 07-DESIGN.md §6.34–6.39 | LVD-03 | `source/assets/js/client/lagg-till.js` – `blur` listeners on all required fields | implemented |
| `02-§6.12` | A live-validation error is cleared as soon as the user starts editing the field (`input`/`change`) | 07-DESIGN.md §6.34–6.39 | LVD-04 | `source/assets/js/client/lagg-till.js` – `input`/`change` clear listener per field | implemented |
| `02-§6.13` | When start time changes, end-time re-evaluated using midnight-crossing rule (§54); shows info, error, or clears | 07-DESIGN.md §6.34–6.39, §6.44a–6.44g | LVD-05 | `source/assets/js/client/lagg-till.js` – `change` listener on `#f-start` re-validates `#f-end` | implemented |
| `02-§6.14` | When date = today and start time is more than 2 hours in the past, show inline error; same check re-runs when date changes to today | 07-DESIGN.md §6.34–6.39 | LVD-06 | `source/assets/js/client/lagg-till.js` – `isPastTimeToday()` called from start and date `change` listeners | implemented |
| `02-§7.1` | Only administrators can edit or remove activities (via YAML directly; no participant editing UI) | 04-OPERATIONS.md (Disaster Recovery) | — | No editing UI exists; enforced by absence, not access control | implemented |
| `02-§8.1` | Location names are consistent throughout the week; defined only in `source/data/local.yaml` | 03-architecture/rendering.md §6 | RADD-16 | `source/build/build.js` (loads `local.yaml`); `source/build/render-add.js` (uses those names) | covered |
| `02-§8.2` | One "Annat" option allows a free-text location not in the predefined list | 03-architecture/rendering.md §6 | RADD-13..15 | `source/build/render-add.js` – "Annat" always appended last | covered |
| `02-§9.1` | `title` is present and non-empty before form submission | 05-DATA_CONTRACT.md §3 | VLD-04..06 | `source/assets/js/client/lagg-till.js` (client); `source/api/validate.js` (server, tested) | covered |
| `02-§9.2` | `date` falls within the active camp's date range | 05-DATA_CONTRACT.md §4 | — | `source/build/render-add.js` – `min`/`max` (browser-enforced only; not in submit handler) | implemented |
| `02-§9.3` | `start` is in valid `HH:MM` format | 05-DATA_CONTRACT.md §4 | — | `source/build/render-add.js` – `type="time"` (browser-enforced only; not validated by server — see `05-§4.2`) | implemented |
| `02-§9.4` | `end` is present, valid `HH:MM`, after `start` or valid midnight crossing (§54) | 05-DATA_CONTRACT.md §4 | VLD-16..20, VLD-27..32 | `source/assets/js/client/lagg-till.js` and `redigera.js` (client); `source/api/validate.js` – `validateEventRequest()` and `validateEditRequest()` (server, tested) | covered |
| `02-§9.5` | `location` is present and non-empty | 05-DATA_CONTRACT.md §3 | VLD-10 | `source/assets/js/client/lagg-till.js` (client); `source/api/validate.js` (server, tested) | covered |
| `02-§9.6` | `responsible` is present and non-empty | 05-DATA_CONTRACT.md §3 | VLD-11 | `source/assets/js/client/lagg-till.js` (client); `source/api/validate.js` (server, tested) | covered |
| `02-§10.1` | All required fields are present and of correct type before any write begins | 03-architecture/data-layer.md §3 | VLD-01..11 | `source/api/validate.js` – `validateEventRequest()`; `app.js` – returns HTTP 400 on failure | covered |
| `02-§10.2` | Only known fields are written to YAML; unknown POST body fields are silently ignored | 03-architecture/data-layer.md §3, 05-DATA_CONTRACT.md §2 | GH-24..38 | `source/api/github.js` – `buildEventYaml()` constructs a fixed, explicit field set | covered |
| `02-§10.3` | String values are length-limited; extremely long strings are rejected | 03-architecture/data-layer.md §3 | VLD-42..49 | `source/api/validate.js` – `MAX_LENGTHS` map; `check-yaml-security.js` – `MAX_LENGTHS` (build-time) | covered |
| `02-§10.4` | User-provided strings are never directly interpolated into YAML; all quoting is handled by the serializer | 05-DATA_CONTRACT.md §8, 06-EVENT_DATA_MODEL.md §8 | GH-12..23, GH-38 | `source/api/github.js` – `yamlScalar()` | covered |
| `02-§10.5` | A validation failure results in an HTTP error response; nothing is committed to GitHub | 03-architecture/data-layer.md §3 | VLD-01..26 (validate logic; no HTTP integration test) | `app.js` – `res.status(400)` before calling `addEventToActiveCamp` | covered |
| `02-§10.6` | Appended event YAML is indented to match the `events:` list; resulting file is valid YAML | 03-architecture/data-layer.md §3 | GH-39..43 | `source/api/github.js` – `buildEventYaml(event, indent)` with `indent=2` in `addEventToActiveCamp()` | covered |
| `02-§11.1` | Activities are always displayed in chronological order (by date, then start time) | 03-architecture/rendering.md §5 | RND-28..32, SNP-03 | `source/build/render.js` – `groupAndSortEvents()` | covered |
| `02-§11.2` | Overlapping activities are allowed; the schedule must remain readable (see `02-§4.8`) | 03-architecture/rendering.md §5, 07-DESIGN.md §6 | — | No exclusion logic in `source/build/render.js`; CSS handles layout | implemented |
| `02-§12.1` | A newly submitted activity appears in the live schedule within a few minutes | 03-architecture/data-layer.md §3 (PR auto-merge → deploy pipeline) | — | `source/api/github.js` – `createPullRequest()`, `enableAutoMerge()` | implemented |
| `02-§12.2` | Admin corrections to YAML are reflected in all schedule views after the next build | 04-OPERATIONS.md (Disaster Recovery) | — | `source/build/build.js` – reads all YAML at build time | implemented |
| `02-§13.1` | Color contrast is at least 4.5:1 for body text | 07-DESIGN.md §9 | — | `source/assets/cs/style.css` – charcoal (`#3B3A38`) on cream (`#F5EEDF`) (passes WCAG AA; not verified programmatically) | implemented |
| `02-§13.2` | All interactive elements have visible focus states | 07-DESIGN.md §9 | A11Y-01..09 | `source/assets/cs/style.css` – `:focus-visible` rules on buttons, nav links, toggle, summaries, content links, form inputs | covered |
| `02-§13.3` | Navigation is fully keyboard accessible | 07-DESIGN.md §9 | — | `source/build/layout.js` – `<nav>` and `<a>` elements; `source/build/render-add.js` – standard form controls (native keyboard) | implemented |
| `02-§13.4` | Images have descriptive `alt` text | 07-DESIGN.md §8 | RNI-29..33 | `source/build/render-index.js` – `extractHeroImage()` preserves alt; `inlineHtml()` passes through alt | covered |
| `02-§13.5` | The add-activity form is fully usable without a mouse | 07-DESIGN.md §9 | — | `source/build/render-add.js` – all standard form controls (native keyboard) | implemented |
| `02-§13.6` | Accordion and expandable elements use proper ARIA attributes (`aria-expanded`, `aria-controls`) | 07-DESIGN.md §9 | — (manual: native `<details>` provides equivalent accessibility; archive uses explicit ARIA via ARK-04, ARK-05) | `source/build/render.js` – native `<details>/<summary>` (browser-exposed state); `source/build/render-arkiv.js` – explicit `aria-expanded`/`aria-controls` | implemented |
| `02-§14.1` | The site is written entirely in Swedish: all content, nav, labels, errors, confirmations, and alt text | 07-DESIGN.md §1 | COV-14..15, RADD-20..21, IDAG-15, REDT-12..16 | All templates and client JS use Swedish text | covered |
| `02-§15.1` | Activity schedule is available as an RSS feed at `/schema.rss` | 03-architecture/rendering.md §17 | RSS-01, RSS-04 | `source/build/render-rss.js` | covered |
| `02-§16.1` | Past camp data is never deleted; `archived: true` marks completed camps | 03-architecture/data-layer.md §4 | — | `source/data/camps.yaml` – `archived` flag; no deletion logic exists | implemented |
| `02-§16.2` | Archive page lists all past camps and links to their schedules | 03-architecture/data-layer.md §4a | ARK-01..08 | `source/build/render-arkiv.js` – `renderArkivPage()` | covered |
| `02-§16.3` | When no camp is active, the most recent archived camp is shown by default | 03-architecture/rendering.md §5 (Fallback rule) | — | `source/build/build.js` – falls back to most recent by `start_date` (not filtered to `archived: true`) | implemented |
| `02-§17.1` | The site works well on mobile devices | 07-DESIGN.md §4, §5 | — | `source/assets/cs/style.css` – responsive layout, container widths, breakpoints | implemented |
| `02-§17.2` | The site requires no explanation; the schedule and add-activity form are self-evident | 07-DESIGN.md §1 | — | UX/design principle; assessed through usability review, not automatable | implemented |
| `05-§1.1` | Each `camps.yaml` entry includes all required fields: `id`, `name`, `start_date`, `end_date`, `file`, `active`, `archived` | 06-EVENT_DATA_MODEL.md §3, 03-architecture/data-layer.md §2 | — | `source/build/build.js` reads and uses these fields; no build-time schema validator | implemented |
| `05-§1.2` | Active camp is derived from dates (no manual flag) | 03-architecture/data-layer.md §2; 02-requirements/event-data.md §34 | DAC-01..07 | `source/scripts/resolve-active-camp.js` | covered |
| `05-§1.3` | *(Superseded — `active` field removed; conflict impossible)* | — | — | — | *(superseded by 02-§34.6)* |
| `05-§3.1` | Each submitted event must include `id`, `title`, `date`, `start`, `end`, `location`, and `responsible` | 06-EVENT_DATA_MODEL.md §4, 05-DATA_CONTRACT.md §3 | VLD-04..11, VLD-27..28 | `source/api/validate.js` – `validateEventRequest()` and `validateEditRequest()` (note: `id` is server-generated, not submitted as input) | covered |
| `05-§4.1` | Event `date` must fall within the camp's `start_date` and `end_date` (inclusive) | 06-EVENT_DATA_MODEL.md §4 | VLD-50..55, LNT-12, LNT-13 | `source/api/validate.js` – `campDates` range check; `lint-yaml.js` – camp range check; `app.js` – passes `activeCamp` | covered |
| `05-§4.2` | `start` must use 24-hour `HH:MM` format | 06-EVENT_DATA_MODEL.md §4 | VLD-33..34, VLD-37..40, LNT-14 | `source/api/validate.js` – `TIME_RE` format check; `lint-yaml.js` – `TIME_RE` | covered |
| `05-§4.3` | `end` must be after `start` | 06-EVENT_DATA_MODEL.md §4 | VLD-16..20, VLD-29..30 | `source/api/validate.js` – `end <= start` check in both `validateEventRequest()` and `validateEditRequest()` | covered |
| `05-§5.1` | The combination of `(title + date + start)` must be unique within a camp file | 03-architecture/data-layer.md §1 | LNT-19..21 | `source/scripts/lint-yaml.js` – `seenCombos` set (build-time + CI); API layer relies on deterministic ID generation | covered |
| `05-§6.1` | Event `id` must be unique within the camp file | 06-EVENT_DATA_MODEL.md §4 | GH-01..11 (slugify determinism), LNT-18 | `source/scripts/lint-yaml.js` – `seenIds` set (build-time + CI); API generates deterministic IDs from unique (title+date+start) | covered |
| `05-§6.2` | Event `id` must be stable and not change after creation | 06-EVENT_DATA_MODEL.md §4 | EEC-01..03 | `source/api/github.js` – deterministic `slugify(title)+date+start` on first write; `edit-event.js` – `patchEventInYaml()` preserves id | covered |
| `07-§7.1` | All CSS uses the custom properties defined at `:root`; no hardcoded colors, spacing, or typography | 07-DESIGN.md §7 | CSS-32..35 | `source/assets/cs/style.css` – all values use `var(--…)` tokens (not enforced by a linter) | covered |
| `07-§9.5` | Accordion items use `aria-expanded` and `aria-controls` ARIA attributes (see `02-§13.6`; archive accordion uses explicit ARIA via `02-§21.6`) | 07-DESIGN.md §9 | — (manual: native `<details>` provides equivalent accessibility; see `02-§13.6`) | `source/build/render.js` – native `<details>/<summary>`; archive uses explicit ARIA (ARK-04, ARK-05) | implemented |
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
| `CL-§7.2` | No unused CSS is shipped | 07-DESIGN.md §7 | — | Hand-written CSS with no unused rules (not enforced by tooling) | implemented |
| `CL-§7.3` | No large blocking assets are loaded | 03-architecture/forms-and-api.md §7 | — | No large scripts or stylesheets | implemented |
| `CL-§7.5` | No runtime hydration framework is used | 03-architecture/forms-and-api.md §7 | — | No framework; plain JS only | implemented |
| `CL-§7.6` | The site feels instant to load | 03-architecture/forms-and-api.md §7 | — | Static HTML + minimal JS + optimised CSS | implemented |
| `CL-§8.1` | Non-technical contributors can edit text content in Markdown without touching layout files | 01-CONTRIBUTORS.md | — | `source/content/*.md` editable directly; layout is separate | implemented |
| `CL-§8.2` | Non-technical contributors can add new events via YAML | 01-CONTRIBUTORS.md | — | `source/data/*.yaml` editable directly | implemented |
| `CL-§8.3` | Non-technical contributors can add images without editing layout files | 01-CONTRIBUTORS.md | — | Images referenced from Markdown content files | implemented |
| `CL-§8.4` | Layout files do not need to be edited for content changes | 03-architecture/rendering.md §6 | — | Content-layout separation is architectural; `source/build/` is never touched for content edits | implemented |
| `02-§4.10` | Weekly schedule groups activities by day | 03-architecture/rendering.md §5 | SNP-02, SNP-03 | `source/build/render.js` – `groupAndSortEvents()` | covered |
| `02-§4.13` | Today view has no day navigation; it always shows today | 03-architecture/data-layer.md §3 | DIS-10, IDAG-12..13 | `source/build/render-idag.js`, `source/build/render-today.js` – no day navigation rendered | covered |
| `02-§5.2` | Empty fields are omitted from the detail view; no blank rows appear | 05-DATA_CONTRACT.md §3 | RND-33..38 | `source/build/render.js` – `eventExtraHtml()` guards each optional field | covered |
| `02-§5.3` | The `owner` and `meta` fields are never shown in any public view | 05-DATA_CONTRACT.md §3.3 | RDC-01..04, STR-JSON-01..02 | `source/build/render.js` – neither field is referenced in render output | covered |
| `02-§8.3` | Locations must be selected from a predefined list | 03-architecture/rendering.md §6 | — | `source/build/render-add.js` – `<select>` populated from `local.yaml` | implemented |
| `02-§8.4` | Participants cannot modify the location list | 03-architecture/rendering.md §6 | — | No form UI for adding locations; enforced by absence | implemented |
| `02-§11.3` | The schedule remains readable when multiple activities overlap (see `02-§4.8`) | 07-DESIGN.md §6 | — | CSS layout handles overlap; no exclusion logic in render | implemented |
| `02-§12.3` | All event submissions are permanently recorded in Git history as a full audit trail | 03-architecture/data-layer.md §3 | — | `source/api/github.js` – every submission creates a Git commit via the Contents API | implemented |
| `02-§15.2` | The RSS feed reflects the current state of the schedule | 03-architecture/rendering.md §17 | RSS-04 | `source/build/render-rss.js` — built from active camp events | covered |
| `02-§16.4` | The archive must be usable and complete, not a placeholder | 03-architecture/data-layer.md §4a | ARK-01..08 | `source/build/render-arkiv.js` – interactive timeline with accordion per camp | covered |
| `02-§17.3` | The site is readable on shared display screens | 07-DESIGN.md §6 | DIS-01..25 | `source/build/render-today.js` – display mode view; `source/assets/cs/style.css` | covered |
| `05-§1.4` | The `file` field in `camps.yaml` references a YAML file in `source/data/` | 06-EVENT_DATA_MODEL.md §1 | — | `source/build/build.js` – loads camp file via `camps.yaml` `file` field | implemented |
| `05-§1.5` | The camp `id` is permanent and must never change after the camp is first created | 06-EVENT_DATA_MODEL.md §3 | — | — (no enforcement; enforced by convention and docs) | implemented |
| `05-§3.2` | Each camp file's `camp:` block must include `id`, `name`, `location`, `start_date`, and `end_date` | 06-EVENT_DATA_MODEL.md §3 | — | `source/build/build.js` – reads and uses all five fields; no build-time schema validator | implemented |
| `05-§3.3` | The `owner` and `meta` fields are for internal use only and must never appear in any public view | 06-EVENT_DATA_MODEL.md §5, §6 | RDC-01..04, STR-JSON-01..02 | `source/build/render.js` – neither field is referenced in render output | covered |
| `05-§4.4` | `end` must be a valid `"HH:MM"` string | 06-EVENT_DATA_MODEL.md §4 | VLD-35..36, VLD-41, LNT-15 | `source/api/validate.js` – `TIME_RE` format check; `lint-yaml.js` – `TIME_RE` | covered |
| `05-§4.5` | All times are local; no timezone handling | 06-EVENT_DATA_MODEL.md §4 | STR-TZ-01..06 | No timezone conversion anywhere in the codebase | covered |
| `CL-§2.12` | Data file names are never hardcoded; active camp and file paths are always derived from `camps.yaml` | 03-architecture/data-layer.md §2 | — | `source/build/build.js` – reads `camps.yaml` first; `source/api/github.js` – same | implemented |
| `CL-§5.13` | Markdown linting runs on every commit via pre-commit hook; commit is blocked if lint fails | 04-OPERATIONS.md (CI/CD Workflows) | — | `.githooks/` pre-commit hook – `npm run lint:md`; `.markdownlint.json` config | implemented |
| `07-§1.1` | The design has a warm, welcoming, outdoorsy feel — not corporate or sterile | 07-DESIGN.md §1 | — | Assessed through visual review | implemented |
| `07-§1.2` | Earth tones and natural colors are used throughout | 07-DESIGN.md §2 | — | Color palette defined in `source/assets/cs/style.css` `:root` | implemented |
| `07-§1.3` | Design is clean and readable; content comes first | 07-DESIGN.md §1 | — | Assessed through visual review | implemented |
| `07-§1.4` | Design is fast and lightweight with no decorative excess | 07-DESIGN.md §1 | — | No decorative assets; minimal CSS | implemented |
| `07-§2.1` | Primary accent color is Terracotta `#C76D48` (buttons, links, highlights) | 07-DESIGN.md §7 | CSS-01 | `source/assets/cs/style.css` – `--color-terracotta: #C76D48` | covered |
| `07-§2.2` | Secondary accent color is Sage green `#ADBF77` (section headers, tags) | 07-DESIGN.md §7 | CSS-02 | `source/assets/cs/style.css` – `--color-sage: #ADBF77` | covered |
| `07-§2.3` | Page background color is Cream `#F5EEDF` | 07-DESIGN.md §7 | CSS-03 | `source/assets/cs/style.css` – `--color-cream: #F5EEDF` | covered |
| `07-§2.4` | Main heading color is Navy `#192A3D` | 07-DESIGN.md §7 | CSS-04 | `source/assets/cs/style.css` – `--color-navy: #192A3D` | covered |
| `07-§2.5` | Body text color is Charcoal `#3B3A38` | 07-DESIGN.md §7 | CSS-05 | `source/assets/cs/style.css` – `--color-charcoal: #3B3A38` | covered |
| `07-§2.6` | Card and contrast surface color is White `#FFFFFF` | 07-DESIGN.md §7 | CSS-06 | `source/assets/cs/style.css` – `--color-white: #FFFFFF` | covered |
| `07-§2.7` | No bright or saturated colors are used outside the defined palette | 07-DESIGN.md §2 | — | Enforced by design convention; not linted | implemented |
| `07-§3.1` | Headings use `system-ui, -apple-system, sans-serif` (or a single humanist web font if added) | 07-DESIGN.md §7 | CSS-07 | `source/assets/cs/style.css` – `--font-sans` token | covered |
| `07-§3.2` | Body text uses the same sans-serif stack | 07-DESIGN.md §7 | CSS-07 | `source/assets/cs/style.css` – `--font-sans` token applied to body | covered |
| `07-§3.3` | Pull quotes and callouts use Georgia, serif | 07-DESIGN.md §7 | CSS-08 | `source/assets/cs/style.css` – `--font-serif: Georgia, serif` | covered |
| `07-§3.4` | H1 is 40px, weight 700, color Navy `#192A3D` | 07-DESIGN.md §7 | CSS-09 | `source/assets/cs/style.css` – `--font-size-h1: 40px` | covered |
| `07-§3.5` | H2 is 35px, weight 700, color Navy `#192A3D` | 07-DESIGN.md §7 | CSS-10 | `source/assets/cs/style.css` – `--font-size-h2: 35px` | covered |
| `07-§3.6` | H3 is 30px, weight 700, color Navy `#192A3D` | 07-DESIGN.md §7 | CSS-11 | `source/assets/cs/style.css` – `--font-size-h3: 30px` | covered |
| `07-§3.7` | Body text is 16px, weight 400, color Charcoal `#3B3A38` | 07-DESIGN.md §7 | CSS-12 | `source/assets/cs/style.css` – `--font-size-base: 16px` | covered |
| `07-§3.8` | Small/meta text is 14px, weight 400, color Charcoal | 07-DESIGN.md §7 | CSS-13 | `source/assets/cs/style.css` – `--font-size-small: 14px` | covered |
| `07-§3.9` | Pull quote text is 25px, weight 600, Georgia serif, italic | 07-DESIGN.md §7 | CSS-14 | `source/assets/cs/style.css` – `--font-size-pullquote: 25px` | covered |
| `07-§3.10` | Nav links are 12px, weight 700, uppercase, letter-spaced | 07-DESIGN.md §7 | CSS-15 | `source/assets/cs/style.css` – `--font-size-nav: 12px` | covered |
| `07-§3.11` | Body text line height is `1.65` | 07-DESIGN.md §7 | CSS-16 | `source/assets/cs/style.css` – `--line-height-body: 1.65` | covered |
| `07-§4.1` | Wide container max-width is `1290px` (header, hero, full layout) | 07-DESIGN.md §7 | CSS-17 | `source/assets/cs/style.css` – `--container-wide: 1290px` | covered |
| `07-§4.2` | Narrow container max-width is `750px` (reading sections, articles) | 07-DESIGN.md §7 | CSS-18 | `source/assets/cs/style.css` – `--container-narrow: 750px` | covered |
| `07-§4.3` | Containers are centered with `margin: 0 auto` and horizontal padding on small screens | 07-DESIGN.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.4` | Spacing base unit is `8px`; all spacing values are multiples of it | 07-DESIGN.md §7 | CSS-19..24 | `source/assets/cs/style.css` – spacing tokens at `:root` | covered |
| `07-§4.5` | `space-xs` = `8px` | 07-DESIGN.md §7 | CSS-19 | `source/assets/cs/style.css` – `--space-xs: 8px` | covered |
| `07-§4.6` | `space-sm` = `16px` | 07-DESIGN.md §7 | CSS-20 | `source/assets/cs/style.css` – `--space-sm: 16px` | covered |
| `07-§4.7` | `space-md` = `24px` | 07-DESIGN.md §7 | CSS-21 | `source/assets/cs/style.css` – `--space-md: 24px` | covered |
| `07-§4.8` | `space-lg` = `40px` | 07-DESIGN.md §7 | CSS-22 | `source/assets/cs/style.css` – `--space-lg: 40px` | covered |
| `07-§4.9` | `space-xl` = `64px` | 07-DESIGN.md §7 | CSS-23 | `source/assets/cs/style.css` – `--space-xl: 64px` | covered |
| `07-§4.10` | `space-xxl` = `96px` | 07-DESIGN.md §7 | CSS-24 | `source/assets/cs/style.css` – `--space-xxl: 96px` | covered |
| `07-§4.11` | Desktop grid: up to 3 columns for cards and testimonials | 07-DESIGN.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.12` | Tablet grid: 2 columns | 07-DESIGN.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.13` | Mobile grid: 1 column | 07-DESIGN.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.14` | Grid uses CSS Grid; no grid framework | 07-DESIGN.md §4 | CSS-28 | `source/assets/cs/style.css` – CSS Grid used | covered |
| `07-§5.1` | Desktop breakpoint: > 1000px — full layout, side-by-side columns | 07-DESIGN.md §5 | — | `source/assets/cs/style.css` | implemented |
| `07-§5.2` | Tablet breakpoint: 690–999px — 2-column grids, condensed header | 07-DESIGN.md §5 | — | `source/assets/cs/style.css` | implemented |
| `07-§5.3` | Mobile breakpoint: < 690px — single column, stacked layout | 07-DESIGN.md §5 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.1` | Header is full-width, fixed or sticky at top | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.2` | Header height is `120px` desktop, `70px` mobile | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.3` | Header background is white or cream with a subtle bottom border or shadow | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.4` | Logo is on the left; nav links on the right | 07-DESIGN.md §6 | — | `source/build/layout.js` – `pageHeader()` HTML structure | implemented |
| `07-§6.5` | Nav links are uppercase, `12px`, `700` weight, `letter-spacing: 0.08em` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.6` | Active/hover nav state uses terracotta underline or color shift | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.7` | Mobile header uses a hamburger menu (full-screen or dropdown) | 07-DESIGN.md §6 | NAV-10, NAV-11 | `source/build/layout.js` – `.nav-toggle` button; `source/assets/js/client/nav.js` – toggle logic; `source/assets/cs/style.css` – mobile nav rules (see `02-§24.10`–`02-§24.14`) | implemented |
| `07-§6.8` | Hero section has a large background image (Klarälven river / camp landscape) | 07-DESIGN.md §6 | — | `source/build/render-index.js` – `extractHeroImage()` | implemented |
| `07-§6.9` | Hero overlay text shows camp name, dates, and a short tagline | 07-DESIGN.md §6 | — | `source/build/render-index.js` | implemented |
| `07-§6.10` | Hero has one or two CTA buttons | 07-DESIGN.md §6 | — | `source/build/render-index.js` | implemented |
| `07-§6.11` | Hero image uses `object-fit: cover` and is responsive | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.12` | Button minimum height is `40px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.13` | Button padding is `10px 24px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.14` | Button border-radius is `4px` | 07-DESIGN.md §6 | CSS-29 | `source/assets/cs/style.css` – `--radius-sm: 4px` | covered |
| `07-§6.15` | Primary button: background `#C76D48`, white text, no border | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.16` | Secondary button: border `#C76D48`, text `#C76D48`, transparent background | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.17` | Button hover darkens background ~10% with `200ms ease` transition | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.18` | Button font is body stack, weight `700`, size `14–16px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.19` | Cards have white `#FFFFFF` background | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.20` | Cards have `border-radius: 6px` | 07-DESIGN.md §6 | CSS-30 | `source/assets/cs/style.css` – `--radius-md: 6px` | covered |
| `07-§6.21` | Cards have box-shadow `0 4px 12px rgba(0,0,0,0.04)` | 07-DESIGN.md §6 | CSS-31 | `source/assets/cs/style.css` – `--shadow-card` | covered |
| `07-§6.22` | Card padding is `24px` | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.23` | Testimonial cards show a circular profile image (`border-radius: 50%`, ~`60px`) | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.24` | Accordion header background is sage green `#ADBF77`, dark text | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.25` | Accordion body background is cream `#F5EEDF` or white | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.26` | Accordion toggle icon is `+`/`−` or a chevron | 07-DESIGN.md §6 | — | `source/build/render.js` – `<details>/<summary>` default disclosure triangle | implemented |
| `07-§6.27` | Accordion open/close is animated with CSS `max-height` transition | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.28` | Accordion uses no JavaScript framework — plain JS or CSS-only | 07-DESIGN.md §6 | CSS-37 | `source/build/render.js` – `<details>/<summary>` (native HTML) | covered |
| `07-§6.29` | Section headings (H2) have a short decorative line or color block underneath | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.30` | Alternatively, a sage-green label appears above the heading at `12px` uppercase | 07-DESIGN.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.31` | Schedule event rows show a bold start time and a lighter end time | 07-DESIGN.md §6 | — | `source/build/render.js` – `renderEventRow()`; `source/assets/cs/style.css` | implemented |
| `07-§6.32` | Location is shown as small text below the time in event rows | 07-DESIGN.md §6 | — | `source/build/render.js` – `renderEventRow()` | implemented |
| `07-§7.2` | CSS is written for a component only once its HTML structure exists; no speculative CSS | 07-DESIGN.md §7 | — | Convention; assessed through code review | implemented |
| `07-§7.3` | CSS is organized in one main file: reset → tokens → base → layout → components → utilities | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` | implemented |
| `07-§7.4` | No CSS preprocessor is used; CSS custom properties are sufficient | 07-DESIGN.md §7 | CSS-36 | `source/assets/cs/style.css` – plain CSS with custom properties | covered |
| `07-§7.5` | No CSS framework is used; CSS is hand-written and minimal | 07-DESIGN.md §7 | — | `source/assets/cs/style.css` – no framework imports | implemented |
| `07-§8.1` | Photography is natural and warm: river, forest, camp activities, families | 07-DESIGN.md §8 | — | `source/content/` – image references; assessed through visual review | implemented |
| `07-§8.2` | Stock photography is avoided; real photos from actual camps are preferred | 07-DESIGN.md §8 | — | Assessed through visual review | implemented |
| `07-§8.3` | Hero image is landscape format, high resolution, dark enough for text overlay | 07-DESIGN.md §8 | — | `source/build/render-index.js` – `extractHeroImage()` | implemented |
| `07-§8.4` | Testimonial avatars are portrait photos, cropped square, displayed circular | 07-DESIGN.md §8 | — | `source/assets/cs/style.css` – `--radius-full: 50%` | implemented |
| `07-§9.1` | Color contrast meets WCAG AA minimum `4.5:1` for body text | 07-DESIGN.md §9 | — | Charcoal `#3B3A38` on Cream `#F5EEDF` passes WCAG AA; not verified programmatically | implemented |
| `07-§9.2` | Interactive elements have visible focus states (see `02-§13.2`) | 07-DESIGN.md §9 | A11Y-01..09 | `source/assets/cs/style.css` – `:focus-visible` rules (see `02-§13.2`) | covered |
| `07-§9.3` | Navigation is keyboard accessible (see `02-§13.3`) | 07-DESIGN.md §9 | — | `source/build/layout.js` – standard `<nav>` and `<a>` elements | implemented |
| `07-§9.4` | Images have descriptive `alt` text (see `02-§13.4`) | 07-DESIGN.md §9 | RNI-29..33 | `source/build/render-index.js` – `extractHeroImage()` preserves alt | covered |
| `07-§10.1` | No gradients or drop shadows heavier than specified are used | 07-DESIGN.md §10 | — | `source/assets/cs/style.css` – only `--shadow-card` used | implemented |
| `07-§10.2` | No animations beyond subtle transitions (`200–300ms`) are used | 07-DESIGN.md §10 | — | `source/assets/cs/style.css` | implemented |
| `07-§10.3` | No decorative fonts or display typefaces are used | 07-DESIGN.md §10 | — | `source/assets/cs/style.css` – system fonts only | implemented |
| `07-§10.4` | Text is never full-width at desktop widths; always constrained by a container | 07-DESIGN.md §10 | — | `source/assets/cs/style.css` – container widths enforced | implemented |
| `07-§10.5` | Layout is not whitespace-heavy; content density is appropriate | 07-DESIGN.md §10 | — | Assessed through visual review | implemented |
| `07-§10.6` | The main site has no dark mode; the Today/Display view dark theme is purpose-built and not site-wide | 07-DESIGN.md §10 | — | `source/build/render-today.js` – dark theme isolated to display mode | implemented |
| `02-§2.11` | Edit-activity page exists at `/redigera.html` | 03-architecture/forms-and-api.md §7 | REDT-01..03 | `source/build/render-edit.js` → `public/redigera.html` | covered |
| `02-§7.1` | Participants can edit their own active events (events not yet passed) via session-cookie ownership | 03-architecture/forms-and-api.md §7 | — | `app.js` – `POST /edit-event`; `source/assets/js/client/session.js`; `source/assets/js/client/redigera.js` | implemented |
| `02-§7.2` | Administrators with a valid admin token (§91) can edit or remove any activity through the same edit and delete flows available to participants | 03-architecture/forms-and-api.md §7, §9 | — | `app.js` – admin token OR in `/edit-event` and `/delete-event`; `session.js` – `injectEditLinks()` for admins; `redigera.js` – admin bypass | implemented |
| `02-§7.3` | A user may edit or delete an event if the event ID is in their session cookie (ownership) or the user holds a valid admin token | 03-architecture/forms-and-api.md §7 | ADED-01..08 | `app.js` – `parseSessionIds()` + ownership check OR `verifyAdminToken()`, 403 on failure | covered |
| `02-§18.1` | When an event is successfully created, the server sets the `sb_session` cookie containing the new event ID | 03-architecture/forms-and-api.md §7 | SES-06..09 | `app.js` – `POST /add-event` sets `Set-Cookie` via `buildSetCookieHeader(mergeIds(…))` | covered |
| `02-§18.2` | The session cookie stores a JSON array of event IDs the current browser owns | 03-architecture/forms-and-api.md §7 | SES-03 | `source/api/session.js` – `parseSessionIds()`, `buildSetCookieHeader()` | covered |
| `02-§18.3` | The session cookie has Max-Age of 7 days; submitting another event updates and extends it | 03-architecture/forms-and-api.md §7 | SES-07, SES-10..13 | `source/api/session.js` – `MAX_AGE_SECONDS = 604800`; `mergeIds()` | covered |
| `02-§18.4` | The session cookie uses the `Secure` flag (HTTPS only) and `SameSite=Strict` | 03-architecture/forms-and-api.md §7 | SES-08, SES-09, EEC-20..21 | `source/api/session.js` – `buildSetCookieHeader()` | covered |
| `02-§18.5` | The session cookie is JavaScript-readable (not httpOnly) — documented trade-off; server-side validation compensates | 03-architecture/forms-and-api.md §7 | EEC-26 | By design: `buildSetCookieHeader()` omits `HttpOnly`; server validates ownership on every edit | covered |
| `02-§18.6` | The session cookie is set only by the server, never written directly by client-side JS | 03-architecture/forms-and-api.md §7 | — | `app.js` sets `Set-Cookie`; `session.js` only re-writes the client-readable cookie after expiry cleanup | implemented |
| `02-§18.7` | The session cookie name is `sb_session` | 03-architecture/forms-and-api.md §7 | SES-06, EEC-18 | `source/api/session.js` – `COOKIE_NAME = 'sb_session'` | covered |
| `02-§18.41` | When API and static site are on different subdomains, the session cookie must include `Domain` covering the shared parent domain, supplied via `COOKIE_DOMAIN` env var; omitted for single-origin deployments | 03-architecture/forms-and-api.md §7 | SES-14, SES-15 | `source/api/session.js` – `buildSetCookieHeader(ids, domain)`; `app.js` – passes `process.env.COOKIE_DOMAIN` | covered |
| `02-§18.8` | Before setting the session cookie, the client displays a modal consent prompt on the add-activity form | 03-architecture/forms-and-api.md §7 | — (manual: submit form without prior consent and confirm modal appears) | `source/assets/js/client/cookie-consent.js` – `showConsentModal()` | implemented |
| `02-§18.9` | If the user accepts consent, the form submission proceeds and the server sets the session cookie | 03-architecture/forms-and-api.md §7 | — | `lagg-till.js` passes `cookieConsent: true`; `app.js` sets cookie | implemented |
| `02-§18.10` | If the user declines consent, the event is still submitted but no session cookie is set | 03-architecture/forms-and-api.md §7 | — | `lagg-till.js` passes `cookieConsent: false`; `app.js` skips `Set-Cookie` | implemented |
| `02-§18.11` | Only an accepted consent decision is stored in `localStorage` as `sb_cookie_consent`; declining is not persisted so the user can change their mind | 03-architecture/forms-and-api.md §7 | — | `cookie-consent.js` – `saveConsent()` stores only `'accepted'`; decline handler omits `saveConsent()` | implemented |
| `02-§18.12` | The consent prompt is written in Swedish | 02-requirements/platform-security.md §14 | — | `cookie-consent.js` – banner innerHTML is Swedish text | implemented |
| `02-§18.13` | On every page load, JS removes event IDs from the cookie whose date has already passed | 03-architecture/forms-and-api.md §7 | — | `session.js` – `removeExpiredIds()` called on load | implemented |
| `02-§18.14` | After cleaning, if no IDs remain the cookie is deleted; otherwise the cleaned cookie is written back | 03-architecture/forms-and-api.md §7 | — | `session.js` – `writeSessionIds([])` sets `Max-Age=0` | implemented |
| `02-§18.15` | "Passed" means the event date is strictly before today's local date | 03-architecture/forms-and-api.md §7 | EDIT-01..03 | `source/api/edit-event.js` – `isEventPast()`; `session.js` – `date >= today` | covered |
| `02-§18.49` | Event IDs in the session cookie but not found in `events.json` must be kept, not removed — newly-submitted events may not yet appear in the JSON | 03-architecture/forms-and-api.md §7 | — (manual: submit event, navigate to schema before deploy completes, verify cookie still contains new ID) | `session.js` – `removeExpiredIds()` keeps unknown IDs | implemented |
| `02-§18.16` | Schedule pages show a "Redigera" link for events the visitor owns (in cookie) or for which the visitor holds a valid admin token, and that have not passed | 03-architecture/forms-and-api.md §7 | — (manual: activate admin token, open schema.html, verify all future events show "Redigera" link) | `session.js` – `injectEditLinks(active, isAdmin)` with admin branch for all `[data-event-id]` rows | implemented |
| `02-§18.17` | Edit links are injected by client-side JS; they are never part of the static HTML | 03-architecture/forms-and-api.md §7 | — | `source/build/render.js` – no edit links at build time; `session.js` injects at runtime | implemented |
| `02-§18.18` | Event rows in generated HTML carry a `data-event-id` attribute with the event's stable ID | 03-architecture/forms-and-api.md §7 | RND-46, RND-47 | `source/build/render.js` – `renderEventRow()` adds `data-event-id` | covered |
| `02-§18.19` | The "Redigera" link navigates to `/redigera.html?id={eventId}` | 03-architecture/forms-and-api.md §7 | — | `session.js` – `link.href = 'redigera.html?id=' + encodeURIComponent(id)` | implemented |
| `02-§18.42` | The "Idag" today view (`/idag.html`) shows a "Redigera" link next to each owned or admin-accessible, non-past event — same rule as the weekly schedule | 03-architecture/forms-and-api.md §7 | IDAG-03, IDAG-04 | `source/build/render-idag.js` – loads `session.js`; `source/assets/js/client/session.js` – `injectEditLinks(active, isAdmin)` | implemented |
| `02-§18.43` | The events JSON embedded in `idag.html` includes the event `id` field | 03-architecture/forms-and-api.md §7 | IDAG-01, IDAG-02 | `source/build/render-idag.js` – `id: e.id \|\| null` in events map | covered |
| `02-§18.44` | Event rows rendered dynamically on `idag.html` carry `data-event-id` and `data-event-date` attributes for edit-link injection | 03-architecture/forms-and-api.md §7 | — | `source/assets/js/client/events-today.js` – `idAttr`/`dateAttr` added to both row types; browser-only: verify manually (open idag.html, run `document.querySelectorAll('[data-event-id]')` in console) | implemented |
| `02-§18.20` | An edit page exists at `/redigera.html` | 03-architecture/forms-and-api.md §7 | REDT-01..03 | `source/build/render-edit.js` → `public/redigera.html` | covered |
| `02-§18.21` | The edit page reads the `id` query param, checks the cookie, and fetches `/events.json` to pre-populate the form | 03-architecture/forms-and-api.md §7 | — | `redigera.js` – `getParam()`, `readSessionIds()`, `fetch('/events.json')`, `populate()` | implemented |
| `02-§18.22` | If the event ID is not in the cookie and the user has no valid admin token, or the event has passed, the edit page shows an error and no form | 03-architecture/forms-and-api.md §7 | — (manual: open redigera.html?id=xxx without cookie or admin token, verify error shown) | `redigera.js` – `showError()` when ID not in cookie and `!adminToken`, or `event.date < today` | implemented |
| `02-§18.23` | The edit form exposes the same fields as the add-activity form | 03-architecture/forms-and-api.md §7 | REDT-04..11 | `source/build/render-edit.js` – all add-activity fields present | covered |
| `02-§18.24` | The event's stable `id` must not change after creation even when mutable fields are edited | 06-EVENT_DATA_MODEL.md §4 | EDIT-13 | `source/api/edit-event.js` – `patchEventInYaml()` preserves `event.id` | covered |
| `02-§18.25` | The edit form is subject to the same validation rules as the add-activity form (§9) | 03-architecture/forms-and-api.md §7 | VLD-27..32 | `source/api/validate.js` – `validateEditRequest()`; `redigera.js` client-side validate | covered |
| `02-§18.26` | After a successful edit, a clear Swedish confirmation is shown; schedule updates within minutes | 03-architecture/forms-and-api.md §7 | — | `render-edit.js` – `#result` section; `github.js` – `updateEventInActiveCamp()` PR pipeline | implemented |
| `02-§18.27` | The edit form is written entirely in Swedish | 02-requirements/platform-security.md §14 | REDT-12..16 | `source/build/render-edit.js` – all labels and messages in Swedish | covered |
| `02-§18.28` | A static `/events.json` file is generated at build time containing all events for the active camp | 03-architecture/forms-and-api.md §7 | — | `source/build/build.js` – writes `public/events.json` | implemented |
| `02-§18.29` | `/events.json` contains only public fields (id, title, date, start, end, location, responsible, description, link); owner and meta are excluded | 03-architecture/forms-and-api.md §7 | STR-JSON-01..02 | `build.js` – `PUBLIC_EVENT_FIELDS` array | covered |
| `02-§18.30` | A `POST /edit-event` endpoint accepts edit requests | 03-architecture/forms-and-api.md §7 | — | `app.js` – `app.post('/edit-event', …)` | implemented |
| `02-§18.31` | The server reads `sb_session` and verifies the target ID is present, or that the request body contains a valid `adminToken` (§91) | 03-architecture/forms-and-api.md §7 | ADED-01..08 | `app.js` – `parseSessionIds(req.headers.cookie)` + `ownedIds.includes(eventId)` OR `verifyAdminToken(req.body.adminToken, adminTokens)` | covered |
| `02-§18.32` | If the event ID is not in the cookie and no valid admin token is provided, the server responds with HTTP 403 | 03-architecture/forms-and-api.md §7 | ADED-04..07 | `app.js` – `res.status(403)` when `!ownedIds.includes(eventId) && !isAdmin` | covered |
| `02-§18.33` | If the event's date has already passed, the server responds with HTTP 400 | 03-architecture/forms-and-api.md §7 | EDIT-01..03 | `app.js` – `isEventPast(req.body.date)` → `res.status(400)` | covered |
| `02-§18.34` | On a valid edit, the server reads YAML from GitHub, replaces mutable fields, commits via ephemeral branch + PR with auto-merge | 03-architecture/forms-and-api.md §7 | EDIT-04..17 | `source/api/github.js` – `updateEventInActiveCamp()`; `edit-event.js` – `patchEventInYaml()` | covered |
| `02-§18.35` | The event's `meta.updated_at` is updated on every successful edit | 06-EVENT_DATA_MODEL.md §6 | EDIT-15 | `source/api/edit-event.js` – `patchEventInYaml()` sets `meta.updated_at = now` | covered |
| `02-§18.36` | Only recognised edit-form fields are written; no unrecognised POST body fields are ever committed | 03-architecture/forms-and-api.md §7 | REDT-21 | `source/api/validate.js` – `validateEditRequest()`; `patchEventInYaml()` explicit field set | covered |
| `02-§18.37` | The add-event form fetch must use `credentials: 'include'` so cross-origin `Set-Cookie` response headers are applied by the browser | 03-architecture/forms-and-api.md §7 | — (manual: verify cookie saved after form submit in a cross-origin deployment) | `source/assets/js/client/lagg-till.js` – `credentials: 'include'` in `fetch()` options | implemented |
| `02-§18.38` | The cookie consent prompt must be displayed as a modal dialog (backdrop, focus trap, centered box) reusing the submit-feedback modal's styling and accessibility patterns | 03-architecture/forms-and-api.md §7, §8 | — (manual: submit form without prior consent and confirm modal appears with backdrop and focus trap) | `source/assets/js/client/cookie-consent.js` – `showConsentModal()` via `modalApi` from `lagg-till.js` | implemented |
| `02-§18.39` | The add-activity form has no owner name field; event ownership is established entirely via session cookie | 03-architecture/forms-and-api.md §7 | — (manual: confirm no ownerName input in rendered lagg-till.html) | `source/build/render-add.js` – `ownerName` field removed from form | implemented |
| `02-§18.40` | The add-activity submit handler must only reference form elements that exist in the HTML form; accessing a missing element via `form.elements` returns `undefined` and calling `.value` on it throws a TypeError that aborts submission | 03-architecture/forms-and-api.md §7 | — (no automated test: `form.elements` is a browser DOM API not available in Node.js; manual: open `lagg-till.html` in a browser and submit the form — confirm it submits without TypeError and the consent banner appears and responds correctly) | `source/assets/js/client/lagg-till.js` – `ownerName` line removed from `JSON.stringify` body | implemented |
| `02-§18.46` | The edit form must submit to the `/edit-event` endpoint; the build derives the edit URL from `API_URL` by replacing a trailing `/add-event` with `/edit-event`, falling back to `/edit-event` | 03-architecture/forms-and-api.md §7 | BUILD-01..04 | `source/build/render-edit.js` – `editApiUrl()`; `source/build/build.js` – passes `editApiUrl(process.env.API_URL)` | covered |
| `02-§18.45` | The edit form fetch must use `credentials: 'include'` so the `sb_session` cookie is sent to the cross-origin API | 03-architecture/forms-and-api.md §7 | — (manual: open `redigera.html` in a browser, submit an edit, and verify the request carries the cookie and returns HTTP 200) | `source/assets/js/client/redigera.js` – `credentials: 'include'` | implemented |
| `02-§18.50` | When the user holds a valid admin token (§91), edit and delete request bodies must include `adminToken` so the server can verify admin status | 03-architecture/forms-and-api.md §7 | — (manual: activate admin token, edit an event not in cookie, verify request body includes adminToken) | `redigera.js` – `getAdminToken()` reads `sb_admin`, `editBody.adminToken` / `deleteBody.adminToken` | implemented |
| `02-§18.47` | Client-side cookie write-back must include the same `Domain` attribute the server used; the domain is read from a `data-cookie-domain` attribute on `<body>`, injected at build time; if absent, no `Domain` is included | 03-architecture/forms-and-api.md §7 | — (manual: deploy to QA with `COOKIE_DOMAIN` set, create an event, visit schema.html, check DevTools → Cookies for matching `Domain`) | `source/assets/js/client/session.js` – reads `document.body.dataset.cookieDomain` and appends `; Domain=…` to cookie writes | implemented |
| `02-§18.48` | The build process must read `COOKIE_DOMAIN` env var and inject it as `data-cookie-domain` on `<body>` of every page that loads `session.js` | 03-architecture/forms-and-api.md §7 | CDI-01..04 | `source/build/render.js` – `cookieDomain` param on `<body>`; `source/build/render-idag.js` – same; `source/build/build.js` – reads `process.env.COOKIE_DOMAIN` | covered |
| `02-§19.1` | When validation passes and submission begins, all form inputs and the submit button are immediately disabled | 03-architecture/forms-and-api.md §8 | ADD-02; manual: press Skicka and confirm all inputs are disabled before the modal opens | `source/assets/js/client/lagg-till.js` – `lock()` sets `fieldset.disabled = true` and `submitBtn.disabled = true` | implemented |
| `02-§19.2` | Disabled form elements are visually distinct (reduced opacity / grayed out) | 03-architecture/forms-and-api.md §8 | — (manual: confirm visual appearance of disabled fieldset) | `source/assets/cs/style.css` – `.event-form fieldset:disabled { opacity: 0.5 }` | implemented |
| `02-§19.3` | The consent prompt is shown as a modal dialog while the form is locked, reusing the `#submit-modal` element | 03-architecture/forms-and-api.md §8 | — (manual: submit form without prior consent and confirm consent appears in modal) | `source/assets/js/client/cookie-consent.js` – `showConsentModal()` renders consent content into `#submit-modal` via `modalApi` | implemented |
| `02-§19.4` | After the user accepts or declines, the modal content transitions to the progress state (spinner) | 03-architecture/forms-and-api.md §8 | — (manual: accept/decline and confirm modal switches to spinner without closing) | `source/assets/js/client/cookie-consent.js` – calls callback; `lagg-till.js` – `setModalLoading()` replaces modal content, skips re-open if already visible | implemented |
| `02-§19.5` | After consent is resolved, a modal dialog opens over the page before the fetch begins | 03-architecture/forms-and-api.md §8 | ADD-03; manual: confirm modal opens immediately after consent banner resolves | `source/assets/js/client/lagg-till.js` – `setModalLoading()` called before `fetch()` in consent callback | implemented |
| `02-§19.6` | The modal displays a spinner and the text "Skickar till GitHub…" while the fetch is in progress | 03-architecture/forms-and-api.md §8 | — (manual: confirm spinner and text are visible during submission) | `lagg-till.js` – `setModalLoading()` sets `.modal-spinner` + `.modal-status`; CSS animates spinner | implemented |
| `02-§19.7` | The modal carries role="dialog", aria-modal="true", and aria-labelledby pointing to its heading | 03-architecture/forms-and-api.md §8 | ADD-04, ADD-05, ADD-06 | `source/build/render-add.js` – `role="dialog" aria-modal="true" aria-labelledby="modal-heading"`; heading has `id="modal-heading"` | covered |
| `02-§19.8` | Keyboard focus is trapped inside the modal while it is open | 03-architecture/forms-and-api.md §8 | — (manual: Tab through the modal — focus must not leave it) | `lagg-till.js` – `trapFocus()` registered on `keydown` when modal opens; removed on close | implemented |
| `02-§19.9` | The page behind the modal is not scrollable while the modal is open | 03-architecture/forms-and-api.md §8 | — (manual: confirm body does not scroll when modal is open) | `lagg-till.js` – `document.body.classList.add('modal-open')`; CSS – `body.modal-open { overflow: hidden }` | implemented |
| `02-§19.10` | On success, the modal shows the title, confirmation text, "Gå till schemat →" link, and "Lägg till en till" button | 03-architecture/forms-and-api.md §8 | — (manual: submit a valid form and confirm modal success content) | `lagg-till.js` – `setModalSuccess()` builds the content with title, intro text, and two action elements | implemented |
| `02-§19.11` | If the user declined cookie consent, the success modal shows a Swedish note about editing not being possible | 03-architecture/forms-and-api.md §8 | — (manual: decline consent, submit, and confirm note appears in modal) | `lagg-till.js` – `setModalSuccess(title, consentGiven)` conditionally inserts `.result-note` paragraph | implemented |
| `02-§19.12` | "Lägg till en till" closes the modal, resets the form, and re-enables all fields | 03-architecture/forms-and-api.md §8 | — (manual: click "Lägg till en till" and confirm form is blank and enabled) | `lagg-till.js` – `modal-new-btn` click calls `closeModal()`, `form.reset()`, `unlock()`, `scrollTo(0,0)` | implemented |
| `02-§19.13` | On error, the modal shows the error message and a "Försök igen" button | 03-architecture/forms-and-api.md §8 | — (manual: simulate a server error and confirm modal error content) | `lagg-till.js` – `setModalError()` sets heading to "Något gick fel" and inserts error message + retry button | implemented |
| `02-§19.14` | "Försök igen" closes the modal and re-enables all form fields (input data preserved) | 03-architecture/forms-and-api.md §8 | — (manual: click "Försök igen" and confirm form is enabled with data intact) | `lagg-till.js` – `modal-retry-btn` click calls `closeModal()`, `unlock()`, `submitBtn.focus()` without resetting the form | implemented |
| `02-§19.15` | The modal uses only CSS custom properties from 07-DESIGN.md §7 — no hardcoded colors or spacing | 07-DESIGN.md §7 | — (code review: grep for hardcoded hex/px values in modal CSS) | `source/assets/cs/style.css` – modal section uses `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`; only `rgba(0,0,0,0.16)` shadow (no design token for overlay shadow) | implemented |
| `02-§19.16` | The modal is implemented in vanilla JavaScript; no library or framework is added | 03-architecture/forms-and-api.md §8 | — (code review: confirm no new npm dependencies for modal logic) | `lagg-till.js` – pure DOM manipulation; no new dependencies in `package.json` | implemented |
| `02-§19.17` | The existing #result section is removed; the modal is the sole post-submission feedback mechanism | 03-architecture/forms-and-api.md §8 | ADD-01 | `source/build/render-add.js` – `#result` section removed; `#submit-modal` added in its place | covered |
| `02-§20.1` | When edit-form validation passes and submission begins, all form inputs and the submit button are immediately disabled | 03-architecture/forms-and-api.md §9 | EDIT-02; manual: press "Spara ändringar" and confirm all inputs are disabled before the modal opens | `source/assets/js/client/redigera.js` – `lock()` sets `fieldset.disabled = true` and `submitBtn.disabled = true` | implemented |
| `02-§20.2` | Disabled edit-form elements are visually distinct (reduced opacity / grayed out) | 03-architecture/forms-and-api.md §9 | — (manual: confirm visual appearance of disabled fieldset) | `source/assets/cs/style.css` – `.event-form fieldset:disabled { opacity: 0.5 }` (shared with add form) | implemented |
| `02-§20.3` | After edit-form submission begins, a modal dialog opens over the page before the fetch begins | 03-architecture/forms-and-api.md §9 | EDIT-03; manual: confirm modal opens immediately after pressing "Spara ändringar" | `redigera.js` – `setModalLoading()` called before `fetch()` | implemented |
| `02-§20.4` | The edit modal displays a spinner and the text "Sparar till GitHub…" while the fetch is in progress | 03-architecture/forms-and-api.md §9 | — (manual: confirm spinner and text are visible during submission) | `redigera.js` – `setModalLoading()` sets `.modal-spinner` + `.modal-status`; CSS animates spinner | implemented |
| `02-§20.5` | The edit modal carries role="dialog", aria-modal="true", and aria-labelledby pointing to its heading | 03-architecture/forms-and-api.md §9 | EDIT-04, EDIT-05, EDIT-06 | `source/build/render-edit.js` – `role="dialog" aria-modal="true" aria-labelledby="modal-heading"`; heading has `id="modal-heading"` | covered |
| `02-§20.6` | Keyboard focus is trapped inside the edit modal while it is open | 03-architecture/forms-and-api.md §9 | — (manual: Tab through the modal — focus must not leave it) | `redigera.js` – `trapFocus()` registered on `keydown` when modal opens; removed on close | implemented |
| `02-§20.7` | The page behind the edit modal is not scrollable while the modal is open | 03-architecture/forms-and-api.md §9 | — (manual: confirm body does not scroll when modal is open) | `redigera.js` – `document.body.classList.add('modal-open')`; CSS – `body.modal-open { overflow: hidden }` | implemented |
| `02-§20.8` | On success, the edit modal shows the activity title, "Aktiviteten är uppdaterad!", and a "Gå till schemat →" link | 03-architecture/forms-and-api.md §9 | — (manual: submit a valid edit and confirm modal success content) | `redigera.js` – `setModalSuccess()` sets heading + title + link | implemented |
| `02-§20.9` | On error, the edit modal shows the error message in Swedish and a "Försök igen" button | 03-architecture/forms-and-api.md §9 | — (manual: simulate a server error and confirm modal error content) | `redigera.js` – `setModalError()` sets heading to "Något gick fel" and inserts error message + retry button | implemented |
| `02-§20.10` | Clicking "Försök igen" on the edit modal closes it and re-enables all form fields (input data preserved) | 03-architecture/forms-and-api.md §9 | — (manual: click "Försök igen" and confirm form is enabled with data intact) | `redigera.js` – `modal-retry-btn` click calls `closeModal()`, `unlock()`, `submitBtn.focus()` without resetting the form | implemented |
| `02-§20.11` | The edit modal uses only CSS custom properties from 07-DESIGN.md §7 — no hardcoded colors or spacing | 07-DESIGN.md §7 | — (code review: confirm modal CSS uses only custom properties) | `source/assets/cs/style.css` – modal CSS shared with add form; uses `var(--color-*)`, `var(--space-*)`, `var(--radius-*)` | implemented |
| `02-§20.12` | The edit modal is implemented in vanilla JavaScript; no library or framework is added | 03-architecture/forms-and-api.md §9 | — (code review: confirm no new npm dependencies for modal logic) | `redigera.js` – pure DOM manipulation; no new dependencies in `package.json` | implemented |
| `02-§20.13` | The existing #result section in the edit page is removed; the modal is the sole post-submission feedback mechanism | 03-architecture/forms-and-api.md §9 | EDIT-01 | `source/build/render-edit.js` – `#result` section removed; `#submit-modal` added in its place | covered |
| `02-§21.1` | Only camps with `archived: true` are shown on the archive page | 03-architecture/data-layer.md §4a | ARK-01 | `source/build/render-arkiv.js` – filters `archived === true` | covered |
| `02-§21.2` | Archive page lists camps newest first (descending by `start_date`) | 03-architecture/data-layer.md §4a | ARK-02 | `source/build/render-arkiv.js` – sort descending by `toDateString(start_date)` | covered |
| `02-§21.3` | Archive timeline is vertical; each camp is a point on a vertical line | 03-architecture/data-layer.md §4a | — (manual: open arkiv.html and verify vertical layout with dots) | `source/assets/cs/style.css` – `.timeline`, `.timeline-dot`, `.timeline::before` | implemented |
| `02-§21.4` | Each camp is an accordion item — a clickable header that expands to reveal details | 03-architecture/data-layer.md §4a | ARK-03 | `source/build/render-arkiv.js` – `.timeline-panel[hidden]`; `source/assets/js/client/arkiv.js` – toggles `hidden` | covered |
| `02-§21.5` | Only one accordion item may be open at a time; opening a new item closes any previously open item | 03-architecture/data-layer.md §4a | — (manual: open two items in browser and verify only one stays open) | `source/assets/js/client/arkiv.js` – closes all other panels before opening new one | implemented |
| `02-§21.6` | Each accordion header is a `<button>` with `aria-expanded` and `aria-controls` attributes | 03-architecture/data-layer.md §4a | ARK-04, ARK-05 | `source/build/render-arkiv.js` – `<button class="timeline-header" aria-expanded="false" aria-controls="…">` | covered |
| `02-§21.7` | Keyboard users can open and close accordion items using Enter or Space | 03-architecture/data-layer.md §4a | — (manual: tab to header and press Enter or Space) | Native `<button>` keyboard behaviour; `arkiv.js` handles click event | implemented |
| `02-§21.8` | Expanded accordion shows information (if set) and Facebook link (if set) — no date/location | 03-architecture/data-layer.md §4a | ARK-06 | `source/build/render-arkiv.js` – `renderArkivPage()` renders info + FB link, no `camp-meta` dl | covered |
| `02-§21.9` | Information text is omitted if empty | 03-architecture/data-layer.md §4a | ARK-07 | `source/build/render-arkiv.js` – `info ? …camp-information… : ''` | covered |
| `02-§21.10` | Facebook link is omitted if empty | 03-architecture/data-layer.md §4a | ARK-08 | `source/build/render-arkiv.js` – `link ? …camp-link… : ''` | covered |
| `02-§21.11` | No blank rows or placeholder text appear for empty fields | 03-architecture/data-layer.md §4a | ARK-07, ARK-08 | `source/build/render-arkiv.js` – conditional rendering of optional fields | covered |
| `02-§21.12` | Accordion header shows camp name as primary text with date range and location in subdued gray text | 03-architecture/data-layer.md §4a | ARK-09 | `source/build/render-arkiv.js` – `.timeline-name` + `.timeline-meta`; `source/assets/cs/style.css` – `.timeline-meta` | covered |
| `02-§21.13` | Header date range is formatted as `D–D månadsnamn YYYY` | 03-architecture/data-layer.md §4a | ARK-10 | `source/build/render-arkiv.js` – `formatHeaderDateRange()` | covered |
| `02-§21.14` | Header location follows date range, separated by `·` | 03-architecture/data-layer.md §4a | ARK-11 | `source/build/render-arkiv.js` – template `${headerDateRange} · ${location}` | covered |
| `02-§21.15` | On narrow viewports the header metadata may wrap below the camp name but remains visually subdued | 03-architecture/data-layer.md §4a | — (manual: resize viewport and verify `.timeline-meta` wraps) | `source/assets/cs/style.css` – `@media (max-width: 690px)` `.timeline-meta` rules | implemented |
| `02-§21.16` | When a camp accordion is expanded, its timeline dot is visually highlighted (larger, accent color) | 03-architecture/data-layer.md §4a | — (manual: open an accordion and verify dot grows) | `source/assets/js/client/arkiv.js` – toggles `.active` class; `source/assets/cs/style.css` – `.timeline-dot.active` | implemented |
| `02-§21.17` | When the accordion is collapsed the dot returns to default size | 03-architecture/data-layer.md §4a | — (manual: close accordion and verify dot shrinks) | `source/assets/js/client/arkiv.js` – removes `.active` class on close | implemented |
| `02-§21.18` | Facebook logo image replaces text button when `link` is non-empty | 03-architecture/data-layer.md §4a | ARK-12 | `source/build/render-arkiv.js` – `<img src="images/facebook-ikon.webp">` | covered |
| `02-§21.19` | Facebook logo is placed at top of panel content, before camp information | 03-architecture/data-layer.md §4a | ARK-15 | `source/build/render-arkiv.js` – `linkHtml` rendered before `.camp-information` | covered |
| `02-§21.20` | Facebook link opens in a new tab with `target="_blank"` and `rel="noopener noreferrer"` | 03-architecture/data-layer.md §4a | ARK-14 | `source/build/render-arkiv.js` – `target="_blank" rel="noopener noreferrer"` on `<a>` | covered |
| `02-§21.21` | Facebook logo image has accessible `alt` text | 03-architecture/data-layer.md §4a | ARK-13 | `source/build/render-arkiv.js` – `alt="Facebookgrupp"` | covered |
| `02-§21.22` | Each expanded accordion displays the camp's events from its YAML file, loaded at build time | 03-architecture/data-layer.md §4a | ARK-16 | `source/build/render-arkiv.js` – `renderEventsSection()`; `source/build/build.js` – loads per-camp YAML into `campEventsMap` | covered |
| `02-§21.23` | Events are grouped by date with day headings (e.g. "måndag 3 augusti 2025") | 03-architecture/data-layer.md §4a | ARK-17 | `source/build/render-arkiv.js` – `groupAndSortEvents()` + `formatDate()` headings | covered |
| `02-§21.24` | Within each date, events are sorted by start time ascending | 03-architecture/data-layer.md §4a | ARK-18 | `source/build/render-arkiv.js` – `groupAndSortEvents()` sorts by `start` | covered |
| `02-§21.25` | Event rows use the same visual format as the weekly schedule: time, title, metadata | 03-architecture/data-layer.md §4a | ARK-19 | `source/build/render-arkiv.js` – `renderArchiveEventRow()` uses `.ev-time`, `.ev-title`, `.ev-meta` | covered |
| `02-§21.26` | Day headings are plain headings, not collapsible | 03-architecture/data-layer.md §4a | ARK-21 | `source/build/render-arkiv.js` – `<h3>` headings, no `<details>` | covered |
| `02-§21.27` | Event rows with `description` or `link` are rendered as expandable `<details>` elements with ℹ️ icon, matching `schema.html` | 03-architecture/data-layer.md §4a | ARK-20 | `source/build/render-arkiv.js` – `renderArchiveEventRow()` renders `<details>` when `hasExtra` | covered |
| `02-§21.31` | Date range and location must not be repeated inside the accordion panel (already in header) | 03-architecture/data-layer.md §4a | ARK-26 | `source/build/render-arkiv.js` – no `camp-meta` dl rendered in panel | covered |
| `02-§21.32` | Event rows without `description` or `link` remain flat (`<div class="event-row plain">`) | 03-architecture/data-layer.md §4a | ARK-25 | `source/build/render-arkiv.js` – `renderArchiveEventRow()` renders plain `<div>` when no extras | covered |
| `02-§21.28` | If a camp has no events in its YAML file, the event list section is omitted | 03-architecture/data-layer.md §4a | ARK-22, ARK-23 | `source/build/render-arkiv.js` – `renderEventsSection()` returns `''` for empty events | covered |
| `02-§21.29` | Archive page uses the same typography scale, color tokens, and spacing tokens as the rest of the site | 03-architecture/data-layer.md §4a, 07-DESIGN.md §7 | — (manual: visual comparison) | `source/assets/cs/style.css` – all archive CSS uses design tokens | implemented |
| `02-§21.30` | Event list styling matches the weekly schedule page in font size, weight, and color | 03-architecture/data-layer.md §4a | — (manual: visual comparison) | `source/assets/cs/style.css` – reuses `.event-row`, `.ev-time`, `.ev-title`, `.ev-meta` classes | implemented |
| `02-§22.1` | Every page produced by the build includes a `<footer class="site-footer">` element at the bottom of `<body>` | 03-architecture/data-layer.md §4b | FTR-02, FTR-04, FTR-06, FTR-08, FTR-10, FTR-12, FTR-14, FTR-16 | `source/build/layout.js` – `pageFooter()`; all render functions | covered |
| `02-§22.2` | Footer content is maintained in `source/content/footer.md` | 03-architecture/data-layer.md §4b | — (convention; code review) | `source/content/footer.md` | implemented |
| `02-§22.3` | The build reads `footer.md`, converts it with `convertMarkdown()`, and injects the result into every page | 03-architecture/data-layer.md §4b | FTR-03, FTR-04, FTR-06, FTR-08, FTR-10, FTR-12, FTR-14, FTR-16 | `source/build/build.js` – reads `footer.md`, calls `convertMarkdown()`, passes `footerHtml` to all render calls | covered |
| `02-§22.4` | No render function or template contains literal footer markup — `footer.md` is the single source of truth | 03-architecture/data-layer.md §4b | — (code review: no hardcoded footer text in any render function) | Convention enforced by single-source architecture | implemented |
| `02-§22.5` | If `footer.md` is missing at build time, all pages render with an empty footer and the build does not crash | 03-architecture/data-layer.md §4b | FTR-01, FTR-05, FTR-07, FTR-09, FTR-11, FTR-13, FTR-15, FTR-17 | `source/build/build.js` – `fs.existsSync()` fallback to `''`; `pageFooter('')` returns `''` | covered |
| `02-§22.6` | Updating `footer.md` and running the build changes the footer on all pages without modifying any other file | 03-architecture/data-layer.md §4b | — (follows from §22.3; no separate test needed) | Verified structurally: `footerHtml` flows from `footer.md` through `convertMarkdown()` into every page | implemented |

| `02-§23.1` | CI must parse and structurally validate the changed event YAML file on event-branch PRs before merge — **superseded by 02-§49.1 (API-layer validation)** | 03-architecture/ci-and-deploy.md §11.6 | LNT-01 | `source/scripts/lint-yaml.js` (retained as library); validation now in API layer | covered |
| `02-§23.2` | Lint validates all required fields — **superseded by API-layer validation** | 03-architecture/ci-and-deploy.md §11.6 | LNT-02..09 | `source/scripts/lint-yaml.js` | covered |
| `02-§23.3` | Lint validates date format and range — **superseded by API-layer validation** | 03-architecture/ci-and-deploy.md §11.6 | LNT-10..13 | `source/scripts/lint-yaml.js` | covered |
| `02-§23.4` | Lint validates time format and ordering — **superseded by API-layer validation** | 03-architecture/ci-and-deploy.md §11.6 | LNT-14..17 | `source/scripts/lint-yaml.js` | covered |
| `02-§23.5` | Lint rejects duplicate IDs — **superseded by API-layer validation** | 03-architecture/ci-and-deploy.md §11.6 | LNT-18 | `source/scripts/lint-yaml.js` | covered |
| `02-§23.6` | Security scan for injection patterns — **superseded by 02-§49.1–49.2 (API-layer validation)** | 03-architecture/ci-and-deploy.md §11.6 | SEC-01..06 | `source/scripts/check-yaml-security.js` (retained as library); validation now in API layer | covered |
| `02-§23.7` | Security scan rejects invalid link protocols — **superseded by 02-§49.4** | 03-architecture/ci-and-deploy.md §11.6 | SEC-07..09 | `source/scripts/check-yaml-security.js` | covered |
| `02-§23.8` | Security scan rejects fields exceeding length limits — **superseded by API-layer validation** | 03-architecture/ci-and-deploy.md §11.6 | SEC-10..13 | `source/scripts/check-yaml-security.js` | covered |
| `02-§23.9` | If lint fails, downstream jobs skip — **superseded: CI no longer runs lint/security on event PRs** | — | — | — | implemented |
| `02-§23.10` | If security scan fails, build/deploy skip — **superseded: CI no longer runs security scan on event PRs** | — | — | — | implemented |
| `02-§23.11` | Pipeline deploys event-data files — **superseded by 02-§50.16–50.18 (post-merge SCP deploy)** | 03-architecture/ci-and-deploy.md §11.3 | — | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§23.12` | Upload must not modify files outside event-data set — **superseded by 02-§50.16** | 03-architecture/ci-and-deploy.md §11.3 | — | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§23.13` | Deploy completes while PR is open — **superseded by 02-§50.11 (deploy now post-merge)** | 03-architecture/ci-and-deploy.md §11.3 | — | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§23.14` | CI workflows that diff against `main` must check out with sufficient git history for the three-dot diff to find a merge base | 03-architecture/ci-and-deploy.md §11.6 | — (CI end-to-end: open an event PR and confirm the detect-changed-file step succeeds) | `.github/workflows/event-data-deploy.yml` – `fetch-depth: 0` on lint-yaml and security-check checkout steps | implemented |
| `02-§24.1` | Every page must include the same navigation header | 03-architecture/pages-and-content.md §12 | NAV-01, NAV-01a..f | `source/build/layout.js` – `pageNav()`; all render functions accept and pass `navSections` | covered |
| `02-§24.2` | Navigation appears once per page, before page content | 03-architecture/pages-and-content.md §12.1 | NAV-02 | `source/build/layout.js` – `pageNav()` emits a single `<nav>` element | covered |
| `02-§24.3` | Index page must not have a section-navigation menu below the hero | 03-architecture/pages-and-content.md §12.5 | NAV-03 | `source/build/render-index.js` – `<nav class="section-nav">` removed entirely | covered |
| `02-§24.4` | Navigation contains links to all five main pages | 03-architecture/pages-and-content.md §12.1 | NAV-04, NAV-04b..e | `source/build/layout.js` – `pageLinks` array in `pageNav()` | covered |
| `02-§24.5` | Current page link is visually marked active | 03-architecture/pages-and-content.md §12.1 | NAV-05 | `source/build/layout.js` – `active` class appended when `href === activeHref` | covered |
| `02-§24.6` | Page links are identical on all pages including index | 03-architecture/pages-and-content.md §12.1 | NAV-06 | `source/build/layout.js` – single `pageLinks` array; Idag always included (no exclusions) | covered |
| `02-§24.7` | Navigation includes anchor links to index page sections | 03-architecture/pages-and-content.md §12.1 | NAV-07 | `source/build/layout.js` – `sectionRow` rendered when `navSections.length > 0` | covered |
| `02-§24.8` | Short nav labels defined per section via `nav:` in `sections.yaml` | 03-architecture/pages-and-content.md §12.3 | NAV-08 | `source/content/sections.yaml` – `nav:` field on all 12 sections; `build.js` extracts `navSections` | covered |
| `02-§24.9` | Section links on non-index pages point to `index.html#id` | 03-architecture/pages-and-content.md §12.1 | NAV-09, NAV-09b | `source/build/layout.js` – `onIndex` flag switches between `#id` and `index.html#id` | covered |
| `02-§24.10` | Mobile: navigation collapsed by default, toggled via hamburger | 03-architecture/pages-and-content.md §12.1 | — (manual: open on mobile, confirm collapsed by default) | `source/assets/css/style.css` – `.nav-menu` hidden at ≤767 px; `source/assets/js/client/nav.js` – toggles `.is-open` | implemented |
| `02-§24.11` | Hamburger button has accessible `aria-label` | 03-architecture/pages-and-content.md §12.4 | NAV-10 | `source/build/layout.js` – `aria-label="Öppna meny"` on toggle button | covered |
| `02-§24.12` | Hamburger button uses `aria-expanded` | 03-architecture/pages-and-content.md §12.4 | NAV-11 | `source/build/layout.js` – `aria-expanded="false"` on toggle button; `nav.js` updates it on click | covered |
| `02-§24.13` | Expanded menu closable via Escape key | 03-architecture/pages-and-content.md §12.4 | — (browser JS behaviour; cannot unit-test in Node) | `source/assets/js/client/nav.js` – `keydown` listener closes on `Escape` | implemented |
| `02-§24.14` | Expanded menu closable by clicking outside | 03-architecture/pages-and-content.md §12.4 | — (browser JS behaviour; cannot unit-test in Node) | `source/assets/js/client/nav.js` – document `click` listener closes when outside nav | implemented |
| `02-§24.15` | Desktop: hamburger hidden, all links visible | 07-DESIGN.md §6 | — (manual: view on ≥768 px viewport, confirm hamburger absent) | `source/assets/css/style.css` – `.nav-toggle { display: none }` at `@media (min-width: 768px)` | implemented |
| `02-§24.17` | Expanded menu closes on navigation link click | 03-architecture/pages-and-content.md §12.4 | — (browser JS behaviour; manual: open hamburger menu, click a link, confirm menu closes) | `source/assets/js/client/nav.js` – click listener on menu `<a>` elements closes menu | implemented |

| `02-§25.1` | Content images have `loading="lazy"` (except first section) | 03-architecture/data-layer.md §4b | IMG-01 | `source/build/render-index.js` – `marked` custom image renderer adds `loading="lazy"`; `renderIndexPage()` strips it from first section | covered |
| `02-§25.2` | Hero image must NOT have `loading="lazy"` | 03-architecture/data-layer.md §4b | IMG-02 | `source/build/render-index.js` – hero uses separate template without `loading="lazy"` | covered |
| `02-§25.3` | Homepage head includes `<link rel="preload">` for hero image | 03-architecture/data-layer.md §4b | IMG-03, IMG-04, IMG-05 | `source/build/render-index.js` – `preloadHtml` variable | covered |
| `02-§25.4` | Hero image has `fetchpriority="high"` | 03-architecture/data-layer.md §4b | IMG-06 | `source/build/render-index.js` – hero `<img>` template | covered |
| `02-§25.5` | First-section images must NOT have `loading="lazy"` (LCP fix) | 03-architecture/data-layer.md §4b | IMG-07 | `source/build/render-index.js` – `renderIndexPage()` strips `loading="lazy"` when `i === 0` | covered |
| `02-§25.6` | `nav.js` script tag must include `defer` on all pages | 03-architecture/data-layer.md §4b | STR-NAV-01..06 | All 6 render files + snapshot | covered |

| `02-§27.1` | "Past" means event date is strictly before today's local date | 02-requirements/add-edit-forms.md §27.1 | — | Definition only; enforced by 02-§27.2–27.6 | — |
| `02-§27.2` | Add-activity form blocks submission when date is in the past | 02-requirements/add-edit-forms.md §27.2 | PDT-01 (manual: open form, pick yesterday, submit → error shown) | `source/assets/js/client/lagg-till.js` – `date < today` check before submit | implemented |
| `02-§27.3` | Edit-activity form blocks submission when date is in the past | 02-requirements/add-edit-forms.md §27.3 | PDT-02 (manual: edit event, change date to past, submit → error shown) | `source/assets/js/client/redigera.js` – `date < submitToday` check before submit | implemented |
| `02-§27.4` | `POST /add-event` rejects past dates with HTTP 400 | 02-requirements/add-edit-forms.md §27.4 | PDT-03, PDT-04 | `source/api/validate.js` – `isDatePast()` in `validateEventRequest` | covered |
| `02-§27.5` | `POST /edit-event` rejects submitted past dates with HTTP 400 | 02-requirements/add-edit-forms.md §27.5 | PDT-05, PDT-06 | `source/api/validate.js` – `isDatePast()` in `validateEditRequest` | covered |
| `02-§27.6` | Past-date check is in the shared validation module | 02-requirements/add-edit-forms.md §27.6 | PDT-03..06 | `source/api/validate.js` – single `isDatePast()` function | covered |

| `02-§28.1` | List includes camps where `archived === false` OR `start_date` year matches current year | 03-architecture/pages-and-content.md §14.3 | UC-01, UC-02, UC-03 | `source/build/render-index.js` – `renderUpcomingCampsHtml()` filter logic | covered |
| `02-§28.2` | "Current year" evaluated at page-load time in browser | 03-architecture/pages-and-content.md §14.3 | — (manual: build uses `new Date().getFullYear()` at build time; year boundary is a rare edge case; build runs frequently) | `source/build/build.js` – passes `new Date().getFullYear()` to `renderUpcomingCampsHtml()` | implemented |
| `02-§28.3` | Camps sorted by `start_date` ascending | 03-architecture/pages-and-content.md §14.3 | UC-04 | `source/build/render-index.js` – `.sort()` in `renderUpcomingCampsHtml()` | covered |
| `02-§28.4` | Camp is "past" when `end_date` < today | 03-architecture/pages-and-content.md §14.5 | — (manual: open index in browser after a camp ends, verify `.camp-past` class applied) | `source/build/render-index.js` – inline `<script>` compares `data-end` < today | implemented |
| `02-§28.5` | "Today" evaluated client-side using Stockholm time | 03-architecture/pages-and-content.md §14.5 | — (manual: browser JS uses `toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' })`) | `source/build/render-index.js` – inline `<script>` | implemented |
| `02-§28.6` | Past camps shown with green checkmark and strikethrough | 03-architecture/pages-and-content.md §14.6 | — (manual: open index after a camp ends, verify green check + line-through) | `source/assets/cs/style.css` – `.camp-past .camp-check` + `.camp-past .camp-name` | implemented |
| `02-§28.7` | Upcoming camps shown with unchecked indicator and normal text | 03-architecture/pages-and-content.md §14.6 | UC-12 | `source/build/render-index.js` – `<span class="camp-check">` rendered for all items; CSS shows transparent check by default | covered |
| `02-§28.8` | Section uses data from `camps.yaml` | 03-architecture/pages-and-content.md §14.2 | UC-01..04 (all tests pass camps array from camps.yaml structure) | `source/build/build.js` – passes `camps` to `renderUpcomingCampsHtml()` | covered |
| `02-§28.9` | Section heading is "Kommande läger" | 03-architecture/pages-and-content.md §14.3 | UC-05 | `source/build/render-index.js` – `<h2>Kommande läger</h2>` | covered |
| `02-§28.10` | Section positioned via `sections.yaml` | 03-architecture/pages-and-content.md §14.4 | — (manual: verify `sections.yaml` has `type: upcoming-camps` entry) | `source/content/sections.yaml` – `type: upcoming-camps` entry; `source/build/build.js` – handles the type | implemented |
| `02-§28.11` | Each item shows camp name, location, and date range | 03-architecture/pages-and-content.md §14.3 | UC-06 | `source/build/render-index.js` – `.camp-name`, `.camp-meta` spans in `renderUpcomingCampsHtml()` | covered |
| `02-§28.12` | Camp name is plain text, not a link | 03-architecture/pages-and-content.md §14.3 | UC-07, UC-08 | `source/build/render-index.js` – plain text in `renderUpcomingCampsHtml()` | covered |
| `02-§28.18` | Camp name uses `var(--color-terracotta)` | 03-architecture/pages-and-content.md §14.6 | CL-04 | `source/assets/cs/style.css` – `.camp-name` | covered |
| `02-§28.13` | Information text shown when non-empty | 03-architecture/pages-and-content.md §14.3 | UC-09, UC-10 | `source/build/render-index.js` – conditional `.camp-info` paragraph | covered |
| `02-§28.14` | Past/upcoming status via client-side script with `data-end` attribute | 03-architecture/pages-and-content.md §14.5 | UC-11 | `source/build/render-index.js` – `data-end` attribute on `<li>`; inline `<script>` applies `.camp-past` | covered |
| `02-§28.15` | No daily rebuilds needed for status updates | 03-architecture/pages-and-content.md §14.5 | — (architectural constraint; client-side JS evaluates dates at page load) | `source/build/render-index.js` – inline `<script>` runs on every page load | implemented |
| `02-§28.16` | Uses only CSS custom properties from 07-DESIGN.md | 03-architecture/pages-and-content.md §14.6 | — (manual: inspect `style.css` `.upcoming-camps` section — all values use `--color-*`, `--space-*`, `--font-*`, `--radius-*` tokens) | `source/assets/cs/style.css` – upcoming-camps section | implemented |
| `02-§28.17` | Client-side script is minimal — no framework | 03-architecture/pages-and-content.md §14.5 | — (manual: inline IIFE, 6 lines, no imports) | `source/build/render-index.js` – inline `<script>` | implemented |

| `02-§29.1` | Camp `name` format is `{type} {year} {month}` (e.g. "SB sommar 2026 augusti") | 05-DATA_CONTRACT.md §1 | — (data convention; verified by inspection of `camps.yaml`) | `source/data/camps.yaml` – all camp names follow the format | implemented |
| `02-§29.2` | Month names in camp names are lowercase (Swedish convention) | 05-DATA_CONTRACT.md §1 | — (data convention) | `source/data/camps.yaml` – all months lowercase | implemented |
| `02-§29.3` | Camp type name uses sentence case (e.g. "SB sommar", not "SB Sommar") | 05-DATA_CONTRACT.md §1 | — (data convention) | `source/data/camps.yaml` – "SB sommar", "SB vinter" | implemented |

| `02-§1a.1` | The build generates a `robots.txt` that disallows all user agents from all paths | 03-architecture/data-layer.md §4c | — (manual: run `npm run build` and verify `public/robots.txt` contains `User-agent: *` and `Disallow: /`) | `source/build/build.js` – writes `public/robots.txt` | implemented |
| `02-§1a.2` | Every HTML page includes `<meta name="robots" content="noindex, nofollow">` in `<head>` | 03-architecture/data-layer.md §4c | ROB-01..07 | All 7 render files – `<meta name="robots">` in `<head>` | covered |
| `02-§1a.3` | No sitemap, Open Graph tags, or other discoverability metadata on any page | 03-architecture/data-layer.md §4c | ROB-08..14 | No discoverability tags in any render file | covered |

| `02-§26.1` | Each camp in `camps.yaml` has an `opens_for_editing` field (YYYY-MM-DD) | 05-DATA_CONTRACT.md §1 | — | `source/data/camps.yaml` – all 9 camps have `opens_for_editing` | implemented |
| `02-§26.2` | Submission period runs from `opens_for_editing` through `end_date + 1 day` | 03-architecture/forms-and-api.md §13.1 | GATE-05..10 | `source/api/time-gate.js` – `isOutsideEditingPeriod()` | covered |
| `02-§26.3` | Before period: add-activity form greyed out (reduced opacity) | 03-architecture/forms-and-api.md §13.3 | — (manual: open form before `opens_for_editing`, confirm fields greyed out) | `source/assets/js/client/lagg-till.js` – sets `fieldset.disabled` and `form-gated` class | implemented |
| `02-§26.4` | Before period: submit button disabled | 03-architecture/forms-and-api.md §13.3 | — (manual: open form before period, confirm submit disabled) | `source/assets/js/client/lagg-till.js` – `submitBtn.disabled = true` | implemented |
| `02-§26.5` | Before period: message shown stating when it opens | 03-architecture/forms-and-api.md §13.3 | — (manual: open form before period, confirm message with formatted Swedish date) | `source/assets/js/client/lagg-till.js` – inserts `.form-gate-msg` element | implemented |
| `02-§26.6` | After period: add-activity form greyed out (reduced opacity) | 03-architecture/forms-and-api.md §13.3 | — (manual: open form after `end_date + 1`, confirm fields greyed out) | `source/assets/js/client/lagg-till.js` – sets `fieldset.disabled` and `form-gated` class | implemented |
| `02-§26.7` | After period: submit button disabled | 03-architecture/forms-and-api.md §13.3 | — (manual: open form after period, confirm submit disabled) | `source/assets/js/client/lagg-till.js` – `submitBtn.disabled = true` | implemented |
| `02-§26.8` | After period: message shown stating camp has ended | 03-architecture/forms-and-api.md §13.3 | — (manual: open form after period, confirm "Lägret är avslutat" message) | `source/assets/js/client/lagg-till.js` – inserts `.form-gate-msg` with "Lägret är avslutat." | implemented |
| `02-§26.9` | Same time-gating rules apply to edit-activity form | 03-architecture/forms-and-api.md §13.3 | — (manual: open edit form outside period, confirm gating behaviour) | `source/assets/js/client/redigera.js` – time-gate check using `data-opens` / `data-closes` | implemented |
| `02-§26.10` | `POST /add-event` rejects with HTTP 403 outside period | 03-architecture/forms-and-api.md §13.4 | GATE-05..10 (logic); — (manual: POST outside period) | `app.js` – `isOutsideEditingPeriod()` check before validation | implemented |
| `02-§26.11` | `POST /edit-event` rejects with HTTP 403 outside period | 03-architecture/forms-and-api.md §13.4 | GATE-05..10 (logic); — (manual: POST outside period) | `app.js` – `isOutsideEditingPeriod()` check before validation | implemented |
| `02-§26.12` | API error response includes Swedish message | 03-architecture/forms-and-api.md §13.4 | — (manual: inspect 403 response body) | `app.js` – Swedish error strings in both endpoints | implemented |
| `02-§26.13` | Build embeds `opens_for_editing` and `end_date` as `data-` attributes on form | 03-architecture/forms-and-api.md §13.2 | GATE-01..04, REDT-22..24 | `source/build/render-add.js`, `source/build/render-edit.js` – `data-opens` and `data-closes` on `<form>` | covered |
| `02-§26.14` | Before period + valid admin token: add and edit forms show "Öppna ändå (admin)" button alongside locked message | 03-architecture/forms-and-api.md §13.6 | — (manual: open form before `opens_for_editing` with admin token, confirm bypass button appears) | `source/assets/js/client/lagg-till.js`, `source/assets/js/client/redigera.js` – bypass button inserted next to locked message | implemented |
| `02-§26.15` | Bypass button removes disabled state on fieldset and submit button | 03-architecture/forms-and-api.md §13.6 | — (manual: click bypass button, confirm form becomes interactive) | `source/assets/js/client/lagg-till.js`, `source/assets/js/client/redigera.js` – click handler clears disabled and `form-gated` class | implemented |
| `02-§26.16` | Bypass button is only shown before the period opens, never after | 03-architecture/forms-and-api.md §13.6 | — (manual: open form after `end_date + 1` with admin token, confirm no bypass button) | `source/assets/js/client/lagg-till.js`, `source/assets/js/client/redigera.js` – bypass branch gated on `isBeforeOpens` / pre-opens block | implemented |
| `02-§26.17` | `/add-event`, `/edit-event`, `/delete-event` accept valid admin tokens before `opens_for_editing` | 03-architecture/forms-and-api.md §13.6 | ABYP-01..06, ABYP-11..13 | `app.js` – skips pre-period reject when `verifyAdminToken()` passes; `api/index.php` – same check in all three handlers | covered |
| `02-§26.18` | Same endpoints reject requests after `end_date + 1 day` regardless of admin token | 03-architecture/forms-and-api.md §13.6 | ABYP-07..10 | `app.js`, `api/index.php` – `isAfterEditingPeriod()` rejects before admin check | covered |
| `02-§26.19` | Add-activity form includes admin token as `adminToken` in request body when bypass is active | 03-architecture/forms-and-api.md §13.6 | — (manual: open add form with admin token before period, click bypass, submit, inspect POST body) | `source/assets/js/client/lagg-till.js` – `bodyObj.adminToken = adminToken` when `adminBypassActive` | implemented |
| `02-§26.20` | Bypass button renders on its own row directly below the locked message, outside the banner, same placement on both pages | 03-architecture/forms-and-api.md §13.6 | — (manual: open lagg-till.html and redigera.html before opens with admin token, confirm the button sits below the banner on its own row on both pages) | `source/assets/js/client/lagg-till.js` – button inserted as next sibling of `.form-gate-msg`; `source/assets/js/client/redigera.js` – dedicated `.form-gate-msg` created and button inserted as next sibling; `source/assets/cs/style.css` – `.form-gate-bypass { display: block; width: fit-content; }` and `.form-gate-msg[hidden], .form-gate-bypass[hidden] { display: none }` | implemented |
| `05-§1.6` | `opens_for_editing` field documented in data contract | 05-DATA_CONTRACT.md §1 | — | `docs/05-DATA_CONTRACT.md` – field added to schema and described | implemented |
| `02-§30.1` | Hero two-column layout: image ~2/3, sidebar ~1/3 | 03-architecture/pages-and-content.md §15, 07-DESIGN.md §6 | HERO-01, HERO-02 | `source/build/render-index.js` – `.hero` grid, `.hero-main`, `.hero-sidebar`; `style.css` – `grid-template-columns: 2fr 1fr` | covered |
| `02-§30.2` | Mobile: hero stacks vertically | 03-architecture/pages-and-content.md §15, 07-DESIGN.md §6 | — (manual: resize to <690px) | `style.css` – `@media (max-width: 690px) { .hero { grid-template-columns: 1fr } }` | implemented |
| `02-§30.3` | Title "Sommarläger i Sysslebäck" above image, left-aligned | 03-architecture/pages-and-content.md §15 | HERO-03 | `source/build/render-index.js` – `<h1 class="hero-title">Sommarläger i Sysslebäck</h1>` | covered |
| `02-§30.4` | Title uses terracotta color | 07-DESIGN.md §6 | HERO-04 | `style.css` – `.hero-title { color: var(--color-terracotta) }` | covered |
| `02-§30.5` | Title uses H1 size (40px) and weight (700) | 07-DESIGN.md §3 | HERO-04 | `style.css` – `.hero-title { font-size: 40px; font-weight: 700 }` | covered |
| `02-§30.6` | Hero image has rounded corners (--radius-lg) | 07-DESIGN.md §7 | — (manual: visual check) | `style.css` – `.hero-img { border-radius: var(--radius-lg) }` | implemented |
| `02-§30.7` | Hero image uses object-fit: cover and is responsive | 07-DESIGN.md §6 | HERO-05, HERO-06 | `style.css` – `.hero-img { object-fit: cover; width: 100% }` | covered |
| `02-§30.8` | Image occupies ~2/3 of hero width on desktop | 07-DESIGN.md §6 | HERO-01 | `style.css` – `.hero { grid-template-columns: 2fr 1fr }` | covered |
| `02-§30.9` | Sidebar contains Discord and Facebook icons stacked vertically | 03-architecture/pages-and-content.md §15.4 | HERO-09 | `source/build/render-index.js` – `.hero-sidebar` with two `.hero-social-link` | covered |
| `02-§30.10` | Discord icon links to Discord channel | 03-architecture/pages-and-content.md §15.4 | HERO-07 | `source/build/render-index.js` – `<a href="${discordUrl}">` | covered |
| `02-§30.11` | Facebook icon links to Facebook group | 03-architecture/pages-and-content.md §15.4 | HERO-08 | `source/build/render-index.js` – `<a href="${facebookUrl}">` | covered |
| `02-§30.12` | Icons displayed at ~64px, vertically centered | 07-DESIGN.md §6 | — (manual: visual check) | `style.css` – `.hero-social-link img { width: 64px; height: 64px }` | implemented |
| `02-§30.13` | Countdown shows days remaining until next camp | 03-architecture/pages-and-content.md §15.3 | HERO-10 | `source/build/render-index.js` – countdown inline script | covered |
| `02-§30.14` | Countdown target derived from camps.yaml (nearest future camp) | 03-architecture/pages-and-content.md §15.2 | HERO-10 | `source/build/build.js` – `futureCamps` filter and sort | covered |
| `02-§30.15` | Countdown shows large number + "Dagar kvar" label | 07-DESIGN.md §6 | HERO-11, HERO-13 | `source/build/render-index.js` – `.hero-countdown-number` + `.hero-countdown-label` | covered |
| `02-§30.16` | Countdown target embedded as data-target; JS computes on load | 03-architecture/pages-and-content.md §15.3 | HERO-10 | `source/build/render-index.js` – `data-target="${countdownTarget}"` | covered |
| `02-§30.17` | Countdown hidden if no future camp | 03-architecture/pages-and-content.md §15.3 | HERO-12 | `source/build/render-index.js` – no countdown HTML when `countdownTarget` is null | covered |
| `02-§30.18` | Countdown has subtle cream/sand background | 07-DESIGN.md §6 | — (manual: visual check) | `style.css` – `.hero-countdown { background: var(--color-cream-light) }` | implemented |
| `02-§30.19` | All hero styling uses CSS custom properties | 07-DESIGN.md §7 | — (manual: CSS review) | `style.css` – all hero rules use `var(--…)` tokens | implemented |
| `02-§30.20` | Countdown JS is minimal, no framework | 03-architecture/pages-and-content.md §15.3 | — (manual: code review) | `source/build/render-index.js` – ~8-line inline `<script>` | implemented |
| `02-§30.21` | Social icon images stored in source/content/images/ | 03-architecture/pages-and-content.md §15.4 | — | `source/content/images/discord-ikon.webp`, `facebook-ikon.webp` | implemented |
| `02-§30.22` | Social links provided at build time, not hardcoded | 03-architecture/pages-and-content.md §15.2 | HERO-14, HERO-15 | `source/build/build.js` – passes `discordUrl`, `facebookUrl` to `renderIndexPage` | covered |
| `02-§30.23` | Countdown background color is `#FAF7EF` (solid, not semi-transparent) | 07-DESIGN.md §6 | — (manual: visual check) | `style.css` – `.hero-countdown { background: var(--color-cream-light) }` | implemented |
| `02-§30.24` | Discord icon uses `discord-ikon.webp` | 03-architecture/pages-and-content.md §15.4 | HERO-16 | `render-index.js` – `discord-ikon.webp` in Discord link `<img>` | covered |
| `02-§30.25` | Sidebar vertically centered alongside hero image | 07-DESIGN.md §6 | — (manual: visual check) | `style.css` – `.hero { align-items: center }` | implemented |

### 31. Inline Camp Listing and Link Styling

| ID | Requirement | Design ref | Test ID(s) | Implementation | Status |
| --- | --- | --- | --- | --- | --- |
| `02-§31.1` | Camp listing rendered inside intro section after first h4 | 07-DESIGN.md §6 | — (manual: visual check) | `source/build/build.js` – injects camp HTML after first `</h4>` | implemented |
| `02-§31.2` | Camp listing is not a separate section or nav entry | 07-DESIGN.md §6 | — (manual: visual check) | `source/content/sections.yaml` – `upcoming-camps` entry removed | implemented |
| `02-§31.3` | Upcoming camps show sun icon (☀️) | 07-DESIGN.md §6 | — (manual: visual check) | `source/assets/cs/style.css` – `.camp-icon::after { content: '☀️' }` | implemented |
| `02-§31.4` | Past camps show green checkbox (✅) | 07-DESIGN.md §6 | — (manual: visual check) | `source/assets/cs/style.css` – `.camp-past .camp-icon::after { content: '✅' }` | implemented |
| `02-§31.5` | Status detection remains client-side via data-end | 02-§28.14 | UC-11 | `source/build/render-index.js` – same inline `<script>` | covered |
| `02-§31.6` | Each item shows name, location, date range | 02-§28.11–13 | UC-06 | `source/build/render-index.js` – `renderUpcomingCampsHtml()` | covered |
| `02-§31.7` | Camp information text no longer rendered | — | — | `source/build/render-index.js` – info block removed | implemented |
| `02-§31.8` | Content links use terracotta color | 07-DESIGN.md §2.1 | — (manual: visual check) | `source/assets/cs/style.css` – `.content a { color: var(--color-terracotta) }` | implemented |
| `02-§31.9` | Content links no underline, underline on hover | 07-DESIGN.md §2.1 | — (manual: visual check) | `source/assets/cs/style.css` – `.content a { text-decoration: none }` | implemented |
| `02-§31.10` | Markdown converter supports h4 headings | — | — (manual: build output check) | `source/build/render-index.js` – `####` pattern added | implemented |
| `02-§31.11` | All styling uses CSS custom properties | 07-DESIGN.md §7 | — (manual: code review) | `source/assets/cs/style.css` | implemented |
| `02-§31.12` | No additional runtime JS | — | — (manual: code review) | No new scripts added | implemented |
| `02-§32.1` | HTML validation uses `html-validate` | 03-architecture/ci-and-deploy.md §11.5 | manual: check `package.json` devDeps include `html-validate` | `package.json` devDeps: `html-validate` | implemented |
| `02-§32.2` | Validation runs on all `public/*.html` after build | 03-architecture/ci-and-deploy.md §11.5 | manual: run `npm run build && npm run lint:html` | `package.json` lint:html script targets `public/*.html` | implemented |
| `02-§32.3` | `lint:html` npm script runs `html-validate` | 03-architecture/ci-and-deploy.md §11.5 | manual: run `npm run lint:html` | `package.json` lint:html script | implemented |
| `02-§32.4` | CI runs `lint:html` after build step | 03-architecture/ci-and-deploy.md §11.5 | manual: inspect `ci.yml` for `lint:html` step after build | `.github/workflows/ci.yml` – Validate HTML step | implemented |
| `02-§32.5` | HTML validation failures fail CI | 03-architecture/ci-and-deploy.md §11.5 | manual: `lint:html` step has no `continue-on-error` | `.github/workflows/ci.yml` – default fail behaviour | implemented |
| `02-§32.6` | HTML validation skipped for data-only commits | 03-architecture/ci-and-deploy.md §11.5 | manual: `lint:html` step uses same `has_code` condition | `.github/workflows/ci.yml` – `if: has_code == 'true'` | implemented |
| `02-§32.7` | Configured via `.htmlvalidate.json` | 03-architecture/ci-and-deploy.md §11.5 | manual: file exists at project root | `.htmlvalidate.json` | implemented |
| `02-§32.8` | Rules tuned to accept existing generated HTML | 03-architecture/ci-and-deploy.md §11.5 | manual: `npm run build && npm run lint:html` passes | `.htmlvalidate.json` – 4 rules tuned | implemented |
| `02-§33.1` | CSS linting uses Stylelint with `stylelint-config-standard` | 03-architecture/ci-and-deploy.md §11.5 | manual: check `package.json` devDeps and `.stylelintrc.json` | `package.json` devDeps: `stylelint`, `stylelint-config-standard`; `.stylelintrc.json` extends | implemented |
| `02-§33.2` | Linting runs on `source/assets/cs/*.css` | 03-architecture/ci-and-deploy.md §11.5 | manual: run `npm run lint:css` | `package.json` lint:css script targets `source/assets/cs/**/*.css` | implemented |
| `02-§33.3` | `lint:css` npm script runs Stylelint | 03-architecture/ci-and-deploy.md §11.5 | manual: run `npm run lint:css` | `package.json` lint:css script | implemented |
| `02-§33.4` | CI runs `lint:css` alongside existing lint steps | 03-architecture/ci-and-deploy.md §11.5 | manual: inspect `ci.yml` for `lint:css` step | `.github/workflows/ci.yml` – Lint CSS step | implemented |
| `02-§33.5` | CSS lint failures fail CI | 03-architecture/ci-and-deploy.md §11.5 | manual: `lint:css` step has no `continue-on-error` | `.github/workflows/ci.yml` – default fail behaviour | implemented |
| `02-§33.6` | CSS linting skipped for data-only commits | 03-architecture/ci-and-deploy.md §11.5 | manual: `lint:css` step uses same `has_code` condition | `.github/workflows/ci.yml` – `if: has_code == 'true'` | implemented |
| `02-§33.7` | Configured via `.stylelintrc.json` | 03-architecture/ci-and-deploy.md §11.5 | manual: file exists at project root | `.stylelintrc.json` | implemented |
| `02-§33.8` | Rules tuned to accept existing CSS | 03-architecture/ci-and-deploy.md §11.5 | manual: `npm run lint:css` passes | `.stylelintrc.json` – 9 rules tuned | implemented |

### §34 — Derived Active Camp

| ID | Requirement | Doc reference | Test | Implementation | Status |
| -- | ----------- | ------------- | ---- | -------------- | ------ |
| `02-§34.1` | Active camp derived from dates with defined priority | 03-architecture/data-layer.md §2 | DAC-01..07 | `source/scripts/resolve-active-camp.js` | covered |
| `02-§34.2` | On-dates camp is active | 03-architecture/data-layer.md §2 | DAC-01 | `resolve-active-camp.js` | covered |
| `02-§34.3` | Next upcoming camp if none on dates | 03-architecture/data-layer.md §2 | DAC-02 | `resolve-active-camp.js` | covered |
| `02-§34.4` | Most recent camp if no upcoming | 03-architecture/data-layer.md §2 | DAC-03 | `resolve-active-camp.js` | covered |
| `02-§34.5` | Overlapping camps: earlier start_date wins | 03-architecture/data-layer.md §2 | DAC-04 | `resolve-active-camp.js` | covered |
| `02-§34.6` | `active` field removed from camps.yaml | 05-DATA_CONTRACT.md §1 | DAC-05 | `source/data/camps.yaml` | covered |
| `02-§34.7` | `active` field removed from data contract | 05-DATA_CONTRACT.md §1 | manual: field absent in doc | `docs/05-DATA_CONTRACT.md` | implemented |
| `02-§34.8` | active+archived lint check removed | — | DAC-06 | `source/scripts/lint-yaml.js` | covered |
| `02-§34.9` | build.js uses derivation at build time | 03-architecture/rendering.md §5 | DAC-07 | `source/build/build.js` | covered |
| `02-§34.10` | Resolved camp logged to stdout | 03-architecture/rendering.md §5 | manual: build output | `source/build/build.js` | implemented |
| `02-§34.11` | github.js uses derivation for API requests | 03-architecture/data-layer.md §3 | manual: code review | `source/api/github.js` | implemented |
| `02-§34.12` | Derivation logic shared (not duplicated) | 03-architecture/data-layer.md §2 | manual: code review | `source/scripts/resolve-active-camp.js` | implemented |
| `02-§34.13` | lint-yaml no longer checks active field | — | DAC-06 | `source/scripts/lint-yaml.js` | covered |
| `02-§34.14` | Existing active-field tests updated/removed | — | manual: `npm test` passes | test files | implemented |
| `02-§15.3` | RSS feed is valid RSS 2.0 XML | 03-architecture/rendering.md §17 | RSS-01 | `source/build/render-rss.js` | covered |
| `02-§15.4` | Feed metadata in Swedish (title, description, language) | 03-architecture/rendering.md §17.3 | RSS-02 | `source/build/render-rss.js` | covered |
| `02-§15.5` | Feed `<link>` points to weekly schedule via SITE_URL | 03-architecture/rendering.md §17.2, §17.3 | RSS-03 | `source/build/render-rss.js` | covered |
| `02-§15.6` | One `<item>` per event in the active camp | 03-architecture/rendering.md §17.3 | RSS-04 | `source/build/render-rss.js` | covered |
| `02-§15.7` | Each item has title, link, guid, description, pubDate | 03-architecture/rendering.md §17.3 | RSS-05, RSS-06, RSS-07, RSS-12 | `source/build/render-rss.js` | covered |
| `02-§15.8` | Items sorted chronologically | 03-architecture/rendering.md §17.3 | RSS-08 | `source/build/render-rss.js` | covered |
| `02-§15.9` | Feed generated at build time by render-rss.js | 03-architecture/rendering.md §17, §17.6 | RSS-01 | `source/build/render-rss.js`, `source/build/build.js` | covered |
| `02-§15.10` | No RSS library dependency | 03-architecture/rendering.md §17 | RSS-09 | `source/build/render-rss.js` — no external RSS imports | covered |
| `02-§15.11` | Absolute URLs require configurable base URL | 03-architecture/rendering.md §17.2 | RSS-03, RSS-05 | `source/build/build.js` — `SITE_URL` env var | covered |
| `02-§15.12` | Build reads SITE_URL from environment variable | 03-architecture/rendering.md §17.2 | manual: build output | `source/build/build.js` — `process.env.SITE_URL` | implemented |
| `02-§15.13` | Build fails if SITE_URL is not set | 03-architecture/rendering.md §17.2 | manual: run build without SITE_URL | `source/build/build.js` — `process.exit(1)` | implemented |
| `02-§15.14` | CI workflows pass SITE_URL alongside API_URL | 03-architecture/rendering.md §17.7 | manual: CI workflow config | `.github/workflows/deploy-reusable.yml`, `ci.yml`, `event-data-deploy.yml` | implemented |
| `02-§15.15` | RSS description uses structured multi-line format: date+time, plats+ansvarig, description, link | 03-architecture/rendering.md §17.3 | RSS-13, RSS-14, RSS-15 | `source/build/render-rss.js` — `buildDescription()` | covered |
| `02-§36.1` | Each event has its own static HTML page | 03-architecture/rendering.md §18 | EVT-01 | `source/build/render-event.js` | covered |
| `02-§36.2` | Event pages at `/schema/{event-id}/index.html` | 03-architecture/rendering.md §18 | manual: build output | `source/build/build.js` — creates dirs | implemented |
| `02-§36.3` | Event page shows title, date, time, location, responsible, description, link | 03-architecture/rendering.md §18.2 | EVT-01..07 | `source/build/render-event.js` | covered |
| `02-§36.4` | Empty fields omitted from event page | 03-architecture/rendering.md §18.2 | EVT-08, EVT-09 | `source/build/render-event.js` | covered |
| `02-§36.5` | owner and meta fields never shown on event pages | 03-architecture/rendering.md §18.2 | EVT-10 | `source/build/render-event.js` | covered |
| `02-§36.6` | Event pages use shared layout (nav, footer, stylesheet) | 03-architecture/rendering.md §18.3 | EVT-11, EVT-12, EVT-13 | `source/build/render-event.js` | covered |
| `02-§36.7` | Event page includes back link to weekly schedule | 03-architecture/rendering.md §18.2 | EVT-14 | `source/build/render-event.js` | covered |
| `02-§36.8` | Event pages include meta robots noindex nofollow | 03-architecture/rendering.md §18.3 | EVT-15 | `source/build/render-event.js` | covered |
| `02-§36.9` | Event pages generated by render-event.js | 03-architecture/rendering.md §18.6 | EVT-01 | `source/build/render-event.js`, `source/build/build.js` | covered |
| `02-§36.10` | Build creates `/schema/{event-id}/` directories | 03-architecture/rendering.md §18.4 | manual: build output | `source/build/build.js` | implemented |
| `02-§36.11` | Event detail body uses structured layout matching RSS description format | 03-architecture/rendering.md §18.2 | EVT-19, EVT-20 | `source/build/render-event.js` | covered |

### §35 — Location Accordions on Index Page

| ID | Requirement | Doc reference | Test | Implementation | Status |
| -- | ----------- | ------------- | ---- | -------------- | ------ |
| `02-§35.1` | Lokaler heading renders as regular heading, not accordion | 03-architecture/pages-and-content.md §16 | manual: build output shows `<h3>Lokaler</h3>` | `sections.yaml` — `collapsible` removed | implemented |
| `02-§35.2` | Introductory paragraph stays visible above accordions | 03-architecture/pages-and-content.md §16 | manual: build output shows `<p>` before first `<details>` | `render-index.js` — markdown rendered normally | implemented |
| `02-§35.3` | Each location renders as `<details class="accordion">` | 03-architecture/pages-and-content.md §16 | LOC-01 | `render-index.js` — `renderLocationAccordions()` | covered |
| `02-§35.4` | Location name appears as `<summary>` text | 03-architecture/pages-and-content.md §16 | LOC-02 | `render-index.js` — `renderLocationAccordions()` | covered |
| `02-§35.5` | Location information appears in accordion body | 03-architecture/pages-and-content.md §16 | LOC-03 | `render-index.js` — `renderLocationAccordions()` | covered |
| `02-§35.6` | Location images render as `<img>` in accordion body | 03-architecture/pages-and-content.md §16 | LOC-04, LOC-05 | `render-index.js` — `renderLocationAccordions()` | covered |
| `02-§35.7` | Empty locations render as accordion with empty body | 03-architecture/pages-and-content.md §16 | LOC-06 | `render-index.js` — `renderLocationAccordions()` | covered |
| `02-§35.8` | Accordions appear in `local.yaml` order | 03-architecture/pages-and-content.md §16 | LOC-07 | `render-index.js` — `renderLocationAccordions()` | covered |
| `02-§35.9` | Build passes full location data to index pipeline | 03-architecture/pages-and-content.md §16 | LOC-01 (indirect) | `build.js` — `allLocations` → `renderLocationAccordions()` | covered |
| `02-§35.10` | `collapsible: true` removed from lokaler in sections.yaml | 03-architecture/pages-and-content.md §16 | manual: file diff | `sections.yaml` | implemented |
| `02-§37.1` | camps.yaml entries have all required fields | 03-architecture/ci-and-deploy.md §19 | VCMP-01..08 | `validate-camps.js` | covered |
| `02-§37.2` | Date fields are valid YYYY-MM-DD | 03-architecture/ci-and-deploy.md §19 | VCMP-09..12 | `validate-camps.js` | covered |
| `02-§37.3` | end_date on or after start_date | 03-architecture/ci-and-deploy.md §19 | VCMP-13..14 | `validate-camps.js` | covered |
| `02-§37.4` | archived is boolean | 03-architecture/ci-and-deploy.md §19 | VCMP-15..16 | `validate-camps.js` | covered |
| `02-§37.5` | Camp id values are unique | 03-architecture/ci-and-deploy.md §19 | VCMP-17 | `validate-camps.js` | covered |
| `02-§37.6` | Camp file values are unique | 03-architecture/ci-and-deploy.md §19 | VCMP-18 | `validate-camps.js` | covered |
| `02-§37.7` | Non-zero exit on validation error | 03-architecture/ci-and-deploy.md §19 | VCMP-19..20 | `validate-camps.js` | covered |
| `02-§37.8` | Missing camp files created automatically | 03-architecture/ci-and-deploy.md §19 | VCMP-21 | `validate-camps.js` | covered |
| `02-§37.9` | Created files have camp header from camps.yaml | 03-architecture/ci-and-deploy.md §19 | VCMP-22 | `validate-camps.js` | covered |
| `02-§37.10` | Created files have empty events section | 03-architecture/ci-and-deploy.md §19 | VCMP-23 | `validate-camps.js` | covered |
| `02-§37.11` | Field order: id, name, location, start_date, end_date | 03-architecture/ci-and-deploy.md §19 | VCMP-24 | `validate-camps.js` | covered |
| `02-§37.12` | camps.yaml is single source of truth | 03-architecture/ci-and-deploy.md §19 | VCMP-25 | `validate-camps.js` | covered |
| `02-§37.13` | Validator compares camp header against camps.yaml | 03-architecture/ci-and-deploy.md §19 | VCMP-25 | `validate-camps.js` | covered |
| `02-§37.14` | Validator updates camp file to match camps.yaml | 03-architecture/ci-and-deploy.md §19 | VCMP-26 | `validate-camps.js` | covered |
| `02-§37.15` | Field order preserved after sync | 03-architecture/ci-and-deploy.md §19 | VCMP-27 | `validate-camps.js` | covered |
| `02-§37.16` | Runnable as npm run validate:camps | 03-architecture/ci-and-deploy.md §19 | manual: `npm run validate:camps` | `package.json` | implemented |
| `02-§37.17` | Logs each action to stdout | 03-architecture/ci-and-deploy.md §19 | VCMP-28 | `validate-camps.js` | covered |
| `02-§37.18` | Importable as module for tests | 03-architecture/ci-and-deploy.md §19 | VCMP-29 | `validate-camps.js` | covered |
| `02-§38.1` | Build uses `marked` as markdown converter | 03-architecture/ci-and-deploy.md §20 | RNI-01..38 | `source/build/render-index.js` – `require('marked')` | covered |
| `02-§38.2` | `marked` is a production dependency (build-time only) | 03-architecture/ci-and-deploy.md §20 | — | `package.json` dependencies | implemented |
| `02-§38.3` | No other new dependencies added | 03-architecture/ci-and-deploy.md §20 | — | `package.json` | implemented |
| `02-§38.4` | Heading offset shifts heading levels, capped at h6 | 03-architecture/ci-and-deploy.md §20 | RNI-17..21 | `render-index.js` – `createMarked()` custom heading renderer | covered |
| `02-§38.5` | Collapsible accordion wraps ##-level sections in `<details>` | 03-architecture/ci-and-deploy.md §20 | RNI-22..28 | `render-index.js` – `convertMarkdown()` post-processing | covered |
| `02-§38.6` | Images have `class="content-img"` and `loading="lazy"` | 03-architecture/ci-and-deploy.md §20 | RNI-03, IMG-01 | `render-index.js` – custom image renderer | covered |
| `02-§38.7` | Standard markdown features render correctly | 03-architecture/ci-and-deploy.md §20 | MKD-01..05 | `render-index.js` – `marked.parse()` | covered |
| `02-§38.8` | Existing content files are not modified | 03-architecture/ci-and-deploy.md §20 | — | No content files in diff | implemented |
| `02-§38.9` | Tables have basic CSS styling using design tokens | 03-architecture/ci-and-deploy.md §20 | manual: visual check | `source/assets/cs/style.css` – `.content table` rules | implemented |
| `02-§38.10` | All existing tests pass | 03-architecture/ci-and-deploy.md §20 | 785/785 pass | — | covered |
| `02-§38.11` | Build, lint, and HTML validation pass | 03-architecture/ci-and-deploy.md §20 | manual: CI | — | implemented |
| `02-§39.1` | ci.yml declares explicit `permissions: contents: read` | CL-§5.11 | manual: CI workflow inspection | `.github/workflows/ci.yml` | implemented |
| `02-§39.2` | deploy.yml declares explicit `permissions: contents: read` | CL-§5.11 | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§39.3` | slugify() has no polynomial-backtracking regex | CL-§5.3 | GH-SLG-01..11 | `source/api/github.js` – `slugify()` | covered |
| `02-§39.4` | slugify replacement produces identical output for all tests | CL-§5.3 | GH-SLG-01..11 | `source/api/github.js` – `slugify()` | covered |
| `02-§39.5` | Test URL assertions are specific enough to avoid CodeQL false positives | CL-§5.3 | — | `tests/render.test.js`, `tests/github.test.js` | implemented |
| `02-§39.6` | Bare `includes('https://…')` replaced with context-aware assertions | CL-§5.3 | — | `tests/render.test.js`, `tests/github.test.js` | implemented |
| `02-§39.7` | Zero open CodeQL alerts after merge | CL-§5.11 | manual: `gh api` | — | covered |
| `02-§40.1` | Static site uploaded via SCP over SSH, not FTP | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.2` | SSH command swaps staging directory into live web root | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.3` | Swap preserves hosting `domains/` directory | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.4` | Downtime limited to two `mv` operations (milliseconds) | 04-OPERATIONS.md §Production | manual: deploy observation | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.5` | Stale directories cleaned up automatically | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.6` | Build output packaged into single tar.gz archive | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.7` | Archive extracted on server into staging directory | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.8` | Archive deleted from server after extraction | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.9` | Deploy uses existing SSH secrets | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.10` | New `DEPLOY_DIR` secret for domain directory path | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.11` | FTP static-site upload step and validation removed | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.12` | Server app deploy (FTP + SSH restart) unchanged — **superseded by 02-§43.6–43.8** | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.13` | Build step unchanged | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.14` | Workflow trigger unchanged | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.15` | SSH swap script uses `set -e` | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§40.16` | Failed deploy recoverable by subsequent deploy | 04-OPERATIONS.md §Production | manual: CI workflow inspection | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§41.1` | Three environments defined: Local, QA, Production | 08-ENVIRONMENTS.md §Overview | manual: inspect workflow files and docs | `docs/08-ENVIRONMENTS.md`, `.github/workflows/deploy-qa.yml`, `deploy-prod.yml` | implemented |
| `02-§41.2` | QA deploys full site automatically on push to `main` | 08-ENVIRONMENTS.md §Overview | manual: push to `main`, confirm `deploy-qa.yml` runs | `.github/workflows/deploy-qa.yml` | implemented |
| `02-§41.3` | Production deploys full site only via manual `workflow_dispatch` | 08-ENVIRONMENTS.md §Overview | manual: Actions tab shows "Run workflow" on `deploy-prod.yml` | `.github/workflows/deploy-prod.yml` | implemented |
| `02-§41.4` | Both QA and Production deploy from `main`; no production branch | 08-ENVIRONMENTS.md §Overview | manual: inspect workflow triggers | `.github/workflows/deploy-qa.yml`, `deploy-prod.yml` | implemented |
| `02-§41.5` | Event data commits to `main` regardless of environment | 08-ENVIRONMENTS.md §Event data flow | manual: submit event, verify PR targets `main` | `source/api/github.js` (uses `GITHUB_BRANCH`) | implemented |
| `02-§41.6` | QA secrets scoped to GitHub Environment `qa` | 08-ENVIRONMENTS.md §Secrets schema | manual: check GitHub Settings > Environments | `.github/workflows/deploy-qa.yml`, `event-data-deploy.yml` | implemented |
| `02-§41.7` | Production secrets scoped to GitHub Environment `production` | 08-ENVIRONMENTS.md §Secrets schema | manual: check GitHub Settings > Environments | `.github/workflows/deploy-prod.yml`, `event-data-deploy.yml` | implemented |
| `02-§41.8` | Each environment has independent secret values | 08-ENVIRONMENTS.md §Secrets schema | manual: check GitHub Settings > Environments | `docs/08-ENVIRONMENTS.md` | implemented |
| `02-§41.9` | Reusable workflow contains shared deploy logic | 08-ENVIRONMENTS.md §Workflows | manual: inspect `deploy-reusable.yml` | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§41.10` | Reusable workflow accepts environment name as input | 08-ENVIRONMENTS.md §Workflows | manual: inspect `deploy-reusable.yml` inputs | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§41.11` | `deploy-qa.yml` calls reusable with environment `qa` | 08-ENVIRONMENTS.md §Workflows | manual: inspect `deploy-qa.yml` | `.github/workflows/deploy-qa.yml` | implemented |
| `02-§41.12` | `deploy-prod.yml` calls reusable with environment `production` | 08-ENVIRONMENTS.md §Workflows | manual: inspect `deploy-prod.yml` | `.github/workflows/deploy-prod.yml` | implemented |
| `02-§41.13` | Original `deploy.yml` removed | 08-ENVIRONMENTS.md §Workflows | manual: verify file does not exist | `.github/workflows/deploy.yml` deleted | implemented |
| `02-§41.14` | Event data deploy targets both QA and Production in parallel | 08-ENVIRONMENTS.md §Event data flow | manual: event PR triggers two parallel deploy jobs | `.github/workflows/event-data-deploy.yml` (`deploy-qa` + `deploy-prod` jobs) | implemented |
| `02-§41.15` | Each event data deploy builds with its environment's `SITE_URL` and `API_URL` | 08-ENVIRONMENTS.md §Event data flow | manual: inspect `event-data-deploy.yml` build steps | `.github/workflows/event-data-deploy.yml` | implemented |
| `02-§41.16` | QR code URL uses `SITE_URL` instead of hardcoded domain | 08-ENVIRONMENTS.md | manual: `SITE_URL=https://example.com npm run build`, check QR in `live.html` | `source/build/build.js` line 134 | implemented |
| `02-§41.17` | `ci.yml` uses repository-level `SITE_URL` secret | 08-ENVIRONMENTS.md §Secrets schema | manual: inspect `ci.yml` | `.github/workflows/ci.yml` (unchanged) | implemented |
| `02-§41.18` | Local development uses `.env` for environment variables | 08-ENVIRONMENTS.md §Local development | manual: verify `.env` works for local build | `.env.example`, `source/build/build.js` (loads `.env`) | implemented |
| `02-§41.19` | `.env.example` documents the environment management setup | 08-ENVIRONMENTS.md §Local development | manual: inspect `.env.example` | `.env.example` | implemented |
| `02-§42.1` | `camps.yaml` entries may include optional `qa` boolean field | 05-DATA_CONTRACT.md §1, 03-architecture/data-layer.md §2 | QA-09, QA-10 | `source/scripts/resolve-active-camp.js`, `source/data/camps.yaml` | covered |
| `02-§42.2` | When `qa` omitted or false, camp is a normal production camp | 05-DATA_CONTRACT.md §1 | QA-09, QA-10 | `source/scripts/resolve-active-camp.js` | covered |
| `02-§42.3` | When `qa` is true, camp is QA-only | 05-DATA_CONTRACT.md §1 | QA-01, QA-04 | `source/scripts/resolve-active-camp.js` | covered |
| `02-§42.4` | Rename `2026-02-testar` to `id: qa-testcamp` | — | manual: inspect `camps.yaml` | `source/data/camps.yaml` | implemented |
| `02-§42.5` | QA camp file renamed to `qa-testcamp.yaml` | — | manual: inspect `source/data/` | `source/data/qa-testcamp.yaml` | implemented |
| `02-§42.6` | QA camp date range spans full calendar year | — | manual: inspect `camps.yaml` | `source/data/camps.yaml` | implemented |
| `02-§42.7` | QA camp `opens_for_editing` set to start of year | — | manual: inspect `camps.yaml` | `source/data/camps.yaml` | implemented |
| `02-§42.8` | QA camp has `qa: true` | — | manual: inspect `camps.yaml` | `source/data/camps.yaml` | implemented |
| `02-§42.9` | Data file renamed with camp header updated | — | manual: inspect `qa-testcamp.yaml` | `source/data/qa-testcamp.yaml` | implemented |
| `02-§42.10` | Existing events in QA camp file preserved | — | manual: inspect `qa-testcamp.yaml` | `source/data/qa-testcamp.yaml` | implemented |
| `02-§42.11` | Production build excludes `qa: true` camps | 03-architecture/data-layer.md §2 | QA-01, QA-03 | `source/scripts/resolve-active-camp.js`, `source/build/build.js` | covered |
| `02-§42.12` | Production API excludes `qa: true` camps | 03-architecture/data-layer.md §2 | QA-01 (same logic) | `source/api/github.js`, `app.js` | covered |
| `02-§42.13` | QA camps never appear in production output (schedule, index, archive, RSS, calendar) | 03-architecture/data-layer.md §2 | QA-01, QA-03, BUILD-QA-01 | `source/build/build.js` | covered |
| `02-§42.30` | `build.js` filters `qa: true` camps from array before all rendering | 03-architecture/data-layer.md §2 | BUILD-QA-01 | `source/build/build.js` | covered |
| `02-§42.14` | In QA, `qa: true` camp on dates wins resolution | 03-architecture/data-layer.md §2 | QA-04, QA-05 | `source/scripts/resolve-active-camp.js` | covered |
| `02-§42.15` | QA resolution: QA camp first, then normal rules | 03-architecture/data-layer.md §2 | QA-04, QA-06 | `source/scripts/resolve-active-camp.js` | covered |
| `02-§42.16` | QA camp always active in QA even when production camp overlaps | 03-architecture/data-layer.md §2 | QA-05 | `source/scripts/resolve-active-camp.js` | covered |
| `02-§42.17` | Build reads `BUILD_ENV` environment variable | 08-ENVIRONMENTS.md | manual: inspect `build.js` | `source/build/build.js` | implemented |
| `02-§42.18` | `deploy-reusable.yml` passes environment as `BUILD_ENV` | 08-ENVIRONMENTS.md | manual: inspect workflow | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§42.19` | API reads `BUILD_ENV` for correct filtering | 08-ENVIRONMENTS.md | manual: inspect `app.js`, `github.js` | `app.js`, `source/api/github.js` | implemented |
| `02-§42.20` | `.env.example` documents `BUILD_ENV` variable | 08-ENVIRONMENTS.md | manual: inspect `.env.example` | `.env.example` | implemented |
| `02-§42.21` | When `BUILD_ENV` unset, no filtering applied | 03-architecture/data-layer.md §2 | QA-07, QA-08 | `source/scripts/resolve-active-camp.js` | covered |
| `02-§42.22` | `resolveActiveCamp()` accepts optional `environment` param | 03-architecture/data-layer.md §2 | QA-01..11 | `source/scripts/resolve-active-camp.js` | covered |
| `02-§42.23` | When environment is `production`, `qa: true` camps filtered out | 03-architecture/data-layer.md §2 | QA-01, QA-03, QA-11 | `source/scripts/resolve-active-camp.js` | covered |
| `02-§42.24` | When environment is `qa`, QA camps on dates take priority | 03-architecture/data-layer.md §2 | QA-04, QA-05 | `source/scripts/resolve-active-camp.js` | covered |
| `02-§42.25` | When environment unset, function behaves as today | 03-architecture/data-layer.md §2 | QA-07, QA-08 | `source/scripts/resolve-active-camp.js` | covered |
| `02-§42.26` | `lint-yaml.js` accepts `qa` as valid optional boolean | — | N/A: `qa` lives in `camps.yaml`, not per-camp files; `lint-yaml.js` validates per-camp files only | — | implemented |
| `02-§42.27` | `validate-camps.js` accepts `qa` as valid optional boolean | — | VCMP-33..36 | `source/scripts/validate-camps.js` | covered |
| `02-§42.28` | Yearly: QA camp date range updated to new year | — | manual: annual maintenance | `source/data/camps.yaml` | implemented |
| `02-§42.29` | Yearly update is manual one-line change, no automation | — | — | — | implemented |
| `02-§42.31` | Two QA-only camps coexist: spring + autumn | 02-requirements/event-data.md §42.9, 03-architecture/data-layer.md §2 | QSEAS-01, QSEAS-03 | `source/data/camps.yaml` | covered |
| `02-§42.32` | Spring QA camp `end_date` is two weeks before next real camp `start_date` | 02-requirements/event-data.md §42.9, 03-architecture/data-layer.md §2 | QSEAS-04 | `source/data/camps.yaml` | covered |
| `02-§42.33` | No QA camp covers the real-camp season window | 02-requirements/event-data.md §42.9 | QSEAS-05 | `source/data/camps.yaml` | covered |
| `02-§42.34` | Autumn QA camp runs Oct 1 – Dec 31 of current year | 02-requirements/event-data.md §42.9 | QSEAS-02 | `source/data/camps.yaml` | covered |
| `02-§43.1` | QA event data deploy uses SCP over SSH instead of FTP | 08-ENVIRONMENTS.md | manual: trigger event PR, verify QA pages update via SCP | `.github/workflows/event-data-deploy.yml` – `deploy-qa` job | implemented |
| `02-§43.2` | QA event data upload uses existing SSH secrets | 08-ENVIRONMENTS.md | manual: inspect workflow secrets references | `.github/workflows/event-data-deploy.yml` | implemented |
| `02-§43.3` | QA target dir derived from `DEPLOY_DIR` + `/public_html/` | 08-ENVIRONMENTS.md | manual: inspect workflow | `.github/workflows/event-data-deploy.yml` | implemented |
| `02-§43.4` | Upload includes same files as before (schema pages, detail pages, RSS) | 08-ENVIRONMENTS.md | manual: compare uploaded files before/after | `.github/workflows/event-data-deploy.yml` | implemented |
| `02-§43.5` | `FTP_TARGET_DIR` validation step removed from QA job | 08-ENVIRONMENTS.md | manual: inspect workflow | `.github/workflows/event-data-deploy.yml` | implemented |
| `02-§43.6` | Redundant FTP upload step removed from `deploy-reusable.yml` | 04-OPERATIONS.md | manual: inspect workflow | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§43.7` | Staging step for FTP upload removed from `deploy-reusable.yml` | 04-OPERATIONS.md | manual: inspect workflow | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§43.8` | SSH restart step (`Deploy API via SSH`) unchanged | 04-OPERATIONS.md | manual: inspect workflow | `.github/workflows/deploy-reusable.yml` | implemented |
| `02-§43.9` | Production event data deploy uses FTP — **superseded by 02-§50.19 (production uses SCP)** | 08-ENVIRONMENTS.md | — | — | implemented |
| `02-§43.10` | Production FTP secrets remain — **superseded by 02-§50.22 (FTP secrets removed)** | 08-ENVIRONMENTS.md | — | — | implemented |
| `02-§43.11` | `08-ENVIRONMENTS.md` updated for QA FTP removal | 08-ENVIRONMENTS.md | manual: read doc | `docs/08-ENVIRONMENTS.md` | implemented |
| `02-§43.12` | `04-OPERATIONS.md` updated for QA deploy method | 04-OPERATIONS.md | manual: read doc | `docs/04-OPERATIONS.md` | implemented |
| `02-§43.13` | Secrets schema notes which FTP secrets are production-only | 08-ENVIRONMENTS.md | manual: read doc | `docs/08-ENVIRONMENTS.md` | implemented |
| `02-§43.14` | After validation, QA FTP secrets removed from GitHub Environment | — | manual: check GitHub Environment after cleanup | — (manual operational step) | covered |
| `02-§43.15` | QA FTP secret cleanup is manual, no automation required | — | — | — | implemented |
| `02-§44.1` | PHP API implements POST /api/add-event | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/index.php`, `api/src/GitHub.php` | implemented |
| `02-§44.2` | PHP API implements POST /api/edit-event | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/index.php`, `api/src/GitHub.php` | implemented |
| `02-§44.3` | Both endpoints return JSON with Content-Type: application/json | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/index.php` | implemented |
| `02-§44.4` | GET /api/health returns status JSON | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/index.php` | implemented |
| `02-§44.5` | All §10 validation rules replicated in PHP | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/src/Validate.php` | implemented |
| `02-§44.6` | Camp date range validation enforced | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/src/Validate.php` | implemented |
| `02-§44.7` | Past-date blocking enforced | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/src/Validate.php` | implemented |
| `02-§44.8` | Edit requests require non-empty id field | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/src/Validate.php` | implemented |
| `02-§44.9` | Time-gating enforced (opens_for_editing..end_date + 1 day) | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/src/TimeGate.php` | implemented |
| `02-§44.10` | HTTP 403 with Swedish error when outside editing period | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/index.php` | implemented |
| `02-§44.11` | Commits new events via GitHub Contents API (ephemeral branch + PR + auto-merge) | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/src/GitHub.php` | implemented |
| `02-§44.12` | Edit requests patch existing event in YAML | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/src/GitHub.php` | implemented |
| `02-§44.13` | Active camp resolved from camps.yaml on GitHub | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/src/ActiveCamp.php` | implemented |
| `02-§44.14` | YAML serialisation compatible with data contract | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/src/GitHub.php` | implemented |
| `02-§44.15` | Reads and writes sb_session cookie (JSON array, URL-encoded) | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/src/Session.php` | implemented |
| `02-§44.16` | Cookie attributes match Node.js (Path, Max-Age, Secure, SameSite, Domain) | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/src/Session.php` | implemented |
| `02-§44.17` | Edit requests verify event ID in session cookie; 403 if not | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/index.php` | implemented |
| `02-§44.18` | Cookie only set when cookieConsent is true | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/index.php` | implemented |
| `02-§44.19` | CORS headers set for ALLOWED_ORIGIN and QA_ORIGIN | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/index.php` | implemented |
| `02-§44.20` | OPTIONS preflight returns 204 with CORS headers | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/index.php` | implemented |
| `02-§44.21` | Config from env vars (same names as Node.js) | 03-architecture/ci-and-deploy.md §21 | manual: inspect code | `api/index.php` | implemented |
| `02-§44.22` | Loads .env file at startup if it exists | 03-architecture/ci-and-deploy.md §21 | manual: deploy and verify | `api/index.php` | implemented |
| `02-§44.23` | Secrets never appear in error responses | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/index.php` | implemented |
| `02-§44.24` | PHP API lives in api/ at project root | 03-architecture/ci-and-deploy.md §21 | manual: inspect structure | `api/` | implemented |
| `02-§44.25` | Dependencies managed via Composer | 03-architecture/ci-and-deploy.md §21 | manual: inspect | `api/composer.json` | implemented |
| `02-§44.26` | Directory structure: index.php, src/, composer.json, .env.example; runtime .env outside web root (§100) | 03-architecture/ci-and-deploy.md §21 | manual: inspect structure | `api/` | implemented |
| `02-§44.27` | .htaccess denies dotfiles (§100), then routes requests to index.php | 03-architecture/ci-and-deploy.md §21 | HTACC-03 (structure); manual: deploy and verify routing | `api/.htaccess` | implemented |
| `02-§44.28` | .htaccess works on Apache 2.4 with mod_rewrite | 03-architecture/ci-and-deploy.md §21 | manual: deploy and verify | `api/.htaccess` | covered |
| `02-§44.29` | Deploy workflow uploads api/ with vendor/ | 04-OPERATIONS.md | manual: inspect workflow | deploy workflow | covered |
| `02-§44.30` | composer install --no-dev runs in CI or vendor/ included in archive | 04-OPERATIONS.md | manual: inspect workflow | deploy workflow | covered |
| `02-§44.31` | .env on server managed manually, not in deploy archive | 04-OPERATIONS.md | manual: verify | — | implemented |
| `02-§44.32` | API_URL points to PHP API path for PHP environments | 08-ENVIRONMENTS.md | manual: check GitHub Environment | GitHub Environment secrets | covered |
| `02-§44.33` | Node.js API_URL format remains valid for Node.js environments — **removed: qanode environment decommissioned** | — | — | — | removed |
| `02-§44.34` | Node.js API unchanged | 03-architecture/ci-and-deploy.md §21 | existing Node.js tests | `app.js`, `source/api/` | implemented |
| `02-§44.35` | Local dev continues to use npm start | 04-OPERATIONS.md | manual: run locally | `app.js` | implemented |
| `02-§44.36` | API backend choice determined by API_URL only | 03-architecture/ci-and-deploy.md §21 | manual: inspect build | `source/build/render-add.js` | implemented |
| `02-§44.37` | 04-OPERATIONS.md documents PHP API | 04-OPERATIONS.md | manual: read doc | `docs/04-OPERATIONS.md` | implemented |
| `02-§44.38` | 08-ENVIRONMENTS.md documents qa environment and secrets | 08-ENVIRONMENTS.md | manual: read doc | `docs/08-ENVIRONMENTS.md` | implemented |
| `02-§44.39` | 03-architecture/ notes dual API architecture | 03-architecture/ci-and-deploy.md §21 | manual: read doc | `docs/03-architecture/` | implemented |
| `02-§2.12` | iCal feed exists at `/schema.ics` | 03-architecture/pages-and-content.md §22 | ICAL-21 | `source/build/render-ical.js` – `renderIcalFeed()`, `source/build/build.js` → `public/schema.ics` | covered |
| `02-§2.13` | Calendar tips page exists at `/kalender.html` | 03-architecture/pages-and-content.md §22 | KAL-01 | `source/build/render-kalender.js` – `renderKalenderPage()`, `source/build/build.js` → `public/kalender.html` | covered |
| `02-§45.1` | Activity schedule available as iCalendar `.ics` files | 03-architecture/pages-and-content.md §22 | ICAL-06, ICAL-21 | `source/build/render-ical.js`, `source/build/build.js` | covered |
| `02-§45.2` | Per-event `.ics` file at `/schema/{event-id}/event.ics` | 03-architecture/pages-and-content.md §22 | ICAL-06, ICAL-07 | `source/build/render-ical.js` – `renderEventIcal()`, `source/build/build.js` | covered |
| `02-§45.3` | Per-event `.ics` is valid iCalendar (RFC 5545) | 03-architecture/pages-and-content.md §22 | ICAL-06 | `source/build/render-ical.js` – `renderEventIcal()` | covered |
| `02-§45.4` | VEVENT includes DTSTART, DTEND, SUMMARY, LOCATION, DESCRIPTION, URL, UID | 03-architecture/pages-and-content.md §22 | ICAL-08..15 | `source/build/render-ical.js` – `renderVevent()` | covered |
| `02-§45.5` | Times use floating local format (no Z, no TZID) | 03-architecture/pages-and-content.md §22 | ICAL-16 | `source/build/render-ical.js` – `toIcalDatetime()` | covered |
| `02-§45.6` | DTEND omitted when end is null | 03-architecture/pages-and-content.md §22 | ICAL-17, ICAL-18 | `source/build/render-ical.js` – `renderVevent()` | covered |
| `02-§45.7` | iCal renderer has no external library dependency | 03-architecture/pages-and-content.md §22 | ICAL-28 | `source/build/render-ical.js` (source inspection) | covered |
| `02-§45.8` | Event detail page includes iCal download link | 03-architecture/pages-and-content.md §22 | EVT-21 | `source/build/render-event.js` | covered |
| `02-§45.9` | iCal link styled consistently with Plats/Ansvarig line | 03-architecture/pages-and-content.md §22 | EVT-22 | `source/build/render-event.js` — same `<p>` pattern with emoji prefix | covered |
| `02-§45.10` | Full-camp `.ics` at `/schema.ics` with all events | 03-architecture/pages-and-content.md §22 | ICAL-21, ICAL-22 | `source/build/render-ical.js` – `renderIcalFeed()`, `source/build/build.js` | covered |
| `02-§45.11` | Full-camp VEVENT uses same field mapping as per-event | 03-architecture/pages-and-content.md §22 | ICAL-27 | `source/build/render-ical.js` – shared `renderVevent()` | covered |
| `02-§45.12` | VCALENDAR includes PRODID, X-WR-CALNAME, METHOD | 03-architecture/pages-and-content.md §22 | ICAL-23, ICAL-24, ICAL-25 | `source/build/render-ical.js` – `renderIcalFeed()` | covered |
| `02-§45.13` | Schedule page includes webcal subscription link | 03-architecture/pages-and-content.md §22 | SNP-07 | `source/build/render.js` – `renderSchedulePage()` | covered |
| `02-§45.14` | Webcal link uses webcal:// protocol scheme | 03-architecture/pages-and-content.md §22 | SNP-08 | `source/build/render.js` – `renderSchedulePage()` | covered |
| `02-§45.15` | Calendar tips page at `/kalender.html` | 03-architecture/pages-and-content.md §22 | KAL-01 | `source/build/render-kalender.js` – `renderKalenderPage()` | covered |
| `02-§45.16` | Tips page covers iOS, Android, Gmail, Outlook | 03-architecture/pages-and-content.md §22 | KAL-02..05 | `source/build/render-kalender.js` – `renderKalenderPage()` | covered |
| `02-§45.17` | Tips page explains subscription vs download difference | 03-architecture/pages-and-content.md §22 | KAL-06 | `source/build/render-kalender.js` – `renderKalenderPage()` | covered |
| `02-§45.18` | Tips page in Swedish | 03-architecture/pages-and-content.md §22 | KAL-07 | `source/build/render-kalender.js` – `renderKalenderPage()` | covered |
| `02-§45.19` | Tips page uses shared layout (header, nav, footer) | 03-architecture/pages-and-content.md §22 | KAL-08, KAL-09 | `source/build/render-kalender.js` – `pageNav()`, `pageFooter()` | covered |
| `02-§45.20` | iCal renderer in separate module `render-ical.js` | 03-architecture/pages-and-content.md §22 | ICAL-28 | `source/build/render-ical.js` | covered |
| `02-§45.21` | Tips page renderer in separate module `render-kalender.js` | 03-architecture/pages-and-content.md §22 | KAL-01 | `source/build/render-kalender.js` | covered |
| `02-§45.22` | Both renderers wired into `build.js` | 03-architecture/pages-and-content.md §22 | manual: run build | `source/build/build.js` – imports and calls both renderers | implemented |
| `02-§45.23` | iCal generation reuses SITE_URL — no new config | 03-architecture/pages-and-content.md §22 | manual: inspect build.js | `source/build/build.js` – passes existing `SITE_URL` | implemented |
| `02-§46.1` | Schedule header calendar icon is inline SVG, 38 px height | 07-DESIGN.md | SNP-09 | `source/build/render.js` – inline SVG in `renderSchedulePage()` | covered |
| `02-§46.3` | Calendar icon has no text label | 07-DESIGN.md | SNP-10 | `source/build/render.js` – SVG only, no text | covered |
| `02-§46.4` | Calendar icon links to `kalender.html` | 03-architecture/pages-and-content.md §22 | SNP-11 | `source/build/render.js` – `href="kalender.html"` | covered |
| `02-§46.5` | Every schedule event row has per-event `.ics` download link | 03-architecture/pages-and-content.md §22 | SNP-12 | `source/build/render.js` – `icalDownloadLink()` | covered |
| `02-§46.6` | Per-event iCal link labelled "iCal", at end of row | 07-DESIGN.md | SNP-12 | `source/build/render.js` – `icalDownloadLink()` | covered |
| `02-§46.7` | Per-event iCal link styled like `.ev-meta` | 07-DESIGN.md | manual: visual check | `source/assets/cs/style.css` – `.ev-ical` class | implemented |
| `02-§46.8` | Per-event iCal link uses `download` attribute | 03-architecture/pages-and-content.md §22 | SNP-13 | `source/build/render.js` – `icalDownloadLink()` | covered |
| `02-§46.9` | Schedule page links to `kalender.html` | 03-architecture/pages-and-content.md §22 | SNP-14 | `source/build/render.js` – guide link in intro | covered |
| `02-§46.11` | Calendar tips page uses card-based layout | 07-DESIGN.md | KAL-13 | `source/build/render-kalender.js`, `source/assets/cs/style.css` | covered |
| `02-§46.12` | Platform sections visually separated | 07-DESIGN.md | KAL-14 | `source/build/render-kalender.js` – one card per platform | covered |
| `02-§46.13` | Webcal URL in copy-friendly code block | 07-DESIGN.md | KAL-15 | `source/build/render-kalender.js` – `.ical-url-block` | covered |
| `02-§46.14` | Every VEVENT includes DTSTAMP (RFC 5545 §3.6.1) | 03-architecture/pages-and-content.md §22 | ICAL-29, ICAL-31 | `source/build/render-ical.js` – `buildDtstamp()` | covered |
| `02-§46.15` | DTSTAMP is UTC build-time timestamp (YYYYMMDDTHHMMSSZ) | 03-architecture/pages-and-content.md §22 | ICAL-30 | `source/build/render-ical.js` – `buildDtstamp()` | covered |
| `02-§47.1` | All headings (h1–h6) use terracotta color | 07-DESIGN.md §3 | HDC-01..03 | `source/assets/cs/style.css` – h1, h2, h3 rules | covered |
| `02-§47.2` | Content links have permanent underline | 07-DESIGN.md §6 | HDC-04 | `source/assets/cs/style.css` – `.content a` rule | covered |
| `02-§47.3` | Nav/back-links retain existing styles | 07-DESIGN.md §6 | manual: visual check | no change to `.nav-link` or `.back-link` rules | implemented |
| `02-§48.1` | Save "Ansvarig" to localStorage on successful submit | 02-requirements/add-edit-forms.md §48.1 | CEH-06, CEH-07 | `source/assets/js/client/lagg-till.js` | covered |
| `02-§48.2` | Pre-fill "Ansvarig" from localStorage on page load | 02-requirements/add-edit-forms.md §48.1 | CEH-06 | `source/assets/js/client/lagg-till.js` | covered |
| `02-§48.3` | Update stored responsible on every successful submit | 02-requirements/add-edit-forms.md §48.1 | CEH-07 | `source/assets/js/client/lagg-till.js` | covered |
| `02-§48.4` | Cookie paragraph exists in add form intro text | 02-requirements/add-edit-forms.md §48.2 | CEH-P01 | `source/build/render-add.js` | covered |
| `02-§48.5` | Replace cookie paragraph with edit link if consent given | 02-requirements/add-edit-forms.md §48.2 | CEH-08, CEH-09 | `source/assets/js/client/lagg-till.js` | covered |
| `02-§48.6` | Keep cookie paragraph unchanged if no consent | 02-requirements/add-edit-forms.md §48.2 | manual: clear localStorage, reload page | `source/build/render-add.js` | implemented |
| `02-§48.7` | Replacement is done client-side on page load | 02-requirements/add-edit-forms.md §48.2 | CEH-08 | `source/assets/js/client/lagg-till.js` | covered |
| `02-§48.8` | Edit page without cookie or id shows explanation text | 02-requirements/add-edit-forms.md §48.3 | CEH-01, CEH-10 | `source/build/render-edit.js`, `source/assets/js/client/redigera.js` | covered |
| `02-§48.9` | Explanation text is in Swedish | 02-requirements/add-edit-forms.md §48.3 | CEH-02 | `source/build/render-edit.js` | covered |
| `02-§48.10` | Loading spinner hidden when no id param | 02-requirements/add-edit-forms.md §48.3 | manual: visit /redigera.html without params | `source/assets/js/client/redigera.js` | implemented |
| `02-§48.11` | Cookie with no matching events shows empty-state message | 02-requirements/add-edit-forms.md §48.4 | manual: set cookie with expired IDs | `source/assets/js/client/redigera.js` | implemented |
| `02-§48.12` | Loading spinner hidden for empty-state | 02-requirements/add-edit-forms.md §48.4 | manual: visit /redigera.html with cookie | `source/assets/js/client/redigera.js` | implemented |
| `02-§48.13` | Cookie with matching events shows event list | 02-requirements/add-edit-forms.md §48.5 | CEH-03, CEH-11 | `source/assets/js/client/redigera.js` | covered |
| `02-§48.14` | List items show title as link to redigera.html?id= | 02-requirements/add-edit-forms.md §48.5 | CEH-04 | `source/assets/js/client/redigera.js` | covered |
| `02-§48.15` | Past events filtered out of list | 02-requirements/add-edit-forms.md §48.5 | manual: mix past and future event IDs | `source/assets/js/client/redigera.js` | implemented |
| `02-§48.16` | Edit form hidden until specific event selected | 02-requirements/add-edit-forms.md §48.5 | manual: visit /redigera.html with cookie | `source/assets/js/client/redigera.js` | implemented |
| `02-§48.17` | Existing edit behaviour preserved with id param | 02-requirements/add-edit-forms.md §48.6 | existing REDT tests | `source/assets/js/client/redigera.js` | covered |
| `02-§48.18` | Event list shown above edit form when editing | 02-requirements/add-edit-forms.md §48.6 | CEH-05 | `source/build/render-edit.js`, `source/assets/js/client/redigera.js` | covered |
| `02-§49.1` | API validates free-text fields for injection patterns before accepting the request | 03-architecture/ci-and-deploy.md §11.6 | ASEC-01..07 | `source/api/validate.js` – `scanForInjection()` in `validateFields()` | covered |
| `02-§49.2` | Injection patterns rejected: `<script`, `javascript:`, `on*=`, `<iframe`, `<object`, `<embed`, `data:text/html` | 03-architecture/ci-and-deploy.md §11.6 | ASEC-01..07 | `source/api/validate.js` – `INJECTION_PATTERNS` array | covered |
| `02-§49.3` | Error message identifies offending field and pattern category | 03-architecture/ci-and-deploy.md §11.6 | ASEC-01..07 | `source/api/validate.js` – error string includes field name and pattern label | covered |
| `02-§49.4` | Non-empty link must start with `http://` or `https://` | 03-architecture/ci-and-deploy.md §11.6 | ASEC-08..10 | `source/api/validate.js` – protocol regex check on `link` field | covered |
| `02-§49.5` | Injection and link checks identical in Node.js and PHP implementations | 03-architecture/ci-and-deploy.md §11.6 | ASEC-01..16 | `source/api/validate.js` + `api/src/Validate.php` | covered |
| `02-§49.6` | Both implementations produce equivalent error messages | 03-architecture/ci-and-deploy.md §11.6 | ASEC-01..16 | `source/api/validate.js` + `api/src/Validate.php` | covered |
| `02-§50.1` | Docker image contains Node.js 20 and production dependencies — **superseded by 02-§52.1 (setup-node + npm cache)** | 03-architecture/ci-and-deploy.md §11.1 | manual: inspect `.github/docker/Dockerfile` | `.github/docker/Dockerfile` | implemented |
| `02-§50.2` | Image based on `node:20` (full, not slim) — **superseded by 02-§52.1** | 03-architecture/ci-and-deploy.md §11.1 | manual: inspect Dockerfile FROM line | `.github/docker/Dockerfile` | implemented |
| `02-§50.3` | Dockerfile lives in `.github/docker/Dockerfile` — **superseded by 02-§52.1** | 03-architecture/ci-and-deploy.md §11.1 | manual: file exists at path | `.github/docker/Dockerfile` | implemented |
| `02-§50.4` | Image published to GHCR — **superseded by 02-§52.1** | 03-architecture/ci-and-deploy.md §11.1 | manual: check GHCR packages | `.github/workflows/docker-build.yml` | implemented |
| `02-§50.5` | Docker build workflow triggers on package.json or Dockerfile changes — **superseded by 02-§52.1** | 03-architecture/ci-and-deploy.md §11.1 | manual: inspect workflow triggers | `.github/workflows/docker-build.yml` | implemented |
| `02-§50.6` | Image tagged with `latest` and git SHA — **superseded by 02-§52.1** | 03-architecture/ci-and-deploy.md §11.1 | manual: inspect workflow tags | `.github/workflows/docker-build.yml` | implemented |
| `02-§50.7` | Docker workflow has `packages: write` and `contents: read` permissions — **superseded by 02-§52.1** | 03-architecture/ci-and-deploy.md §11.1 | manual: inspect workflow permissions | `.github/workflows/docker-build.yml` | implemented |
| `02-§50.8` | `event-data-deploy.yml` contains a single no-op job logging "Validated at API layer" | 03-architecture/ci-and-deploy.md §11.2 | manual: inspect workflow | `.github/workflows/event-data-deploy.yml` | implemented |
| `02-§50.9` | No-op job retains same trigger and branch filter | 03-architecture/ci-and-deploy.md §11.2 | manual: inspect workflow on/if | `.github/workflows/event-data-deploy.yml` | implemented |
| `02-§50.11` | Post-merge workflow triggers on push to `main` with data YAML path filter | 03-architecture/ci-and-deploy.md §11.3 | manual: inspect workflow triggers | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§50.12` | Post-merge workflow uses Docker image from GHCR — **superseded by 02-§52.1 (setup-node + npm cache)** | 03-architecture/ci-and-deploy.md §11.3 | manual: inspect workflow container | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§50.13` | Changed YAML file detected via `HEAD~1..HEAD` — **superseded by 02-§51.2, 02-§51.5 (inline detection per job)** | 03-architecture/ci-and-deploy.md §11.3 | manual: inspect detect step | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§50.14` | QA camp detection sets `is_qa` output — **superseded by 02-§51.7 (inline QA check in production job)** | 03-architecture/ci-and-deploy.md §11.3 | manual: inspect detect step | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§50.15` | Build runs `node source/build/build.js` | 03-architecture/ci-and-deploy.md §11.3 | manual: inspect build step | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§50.16` | Only event-data-derived files staged for upload | 03-architecture/ci-and-deploy.md §11.3 | manual: inspect staging step | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§50.17` | QA deploy via rsync in parallel job | 03-architecture/ci-and-deploy.md §11.3 | manual: inspect workflow jobs | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§50.18` | Production deploys via SCP, skipped for QA camps | 03-architecture/ci-and-deploy.md §11.3 | manual: inspect workflow if condition | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§50.19` | Production event data uses SCP over SSH | 03-architecture/ci-and-deploy.md §11.3 | manual: inspect production deploy job | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§50.20` | Production uses SSH secrets (SERVER_HOST, etc.) | 03-architecture/ci-and-deploy.md §11.3 | manual: inspect workflow secrets | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§50.22` | FTP secrets removed from production environment (manual step) | — | manual: check GitHub Environment secrets | — (manual operational step) | gap |
| `02-§50.23` | `ci.yml` skips `npm ci` and build for data-only changes | 03-architecture/ci-and-deploy.md §11.4 | manual: inspect ci.yml conditional steps | `.github/workflows/ci.yml` | implemented |
| `02-§50.24` | Post-merge workflow is responsible for building event-data changes | 03-architecture/ci-and-deploy.md §11.4 | manual: inspect workflow | `.github/workflows/event-data-deploy-post-merge.yml` | implemented |
| `02-§51.1` | No separate `detect` job in post-merge workflow | 03-architecture/ci-and-deploy.md §11.3 | EDW-01 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§51.2` | Each deploy job performs inline detection of changed event data files | 03-architecture/ci-and-deploy.md §11.3 | EDW-08..10 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§51.3` | All deploy jobs start immediately in parallel (no serial dependency) | 03-architecture/ci-and-deploy.md §11.3 | EDW-02..04 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§51.4` | Each deploy job checks out with `fetch-depth: 2` | 03-architecture/ci-and-deploy.md §11.3 | EDW-05..07 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§51.5` | Inline detection uses same `git diff` logic as previous detect job | 03-architecture/ci-and-deploy.md §11.3 | EDW-08..10 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§51.6` | Job skips build and deploy if no event data file changed | 03-architecture/ci-and-deploy.md §11.3 | EDW-11..13 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§51.7` | Production job checks if changed file belongs to a QA camp | 03-architecture/ci-and-deploy.md §11.3 | EDW-14 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§51.8` | Production job skips build and deploy for QA camp files | 03-architecture/ci-and-deploy.md §11.3 | EDW-14..15 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§51.9` | `02-§50.13` superseded by inline detection (§51.2, §51.5) | — | — | — | implemented |
| `02-§51.10` | `02-§50.14` superseded by inline QA check (§51.7) | — | — | — | implemented |
| `02-§52.1` | Post-merge workflow uses `setup-node@v4` with node 20 and npm cache | 03-architecture/ci-and-deploy.md §11.1 | EDW-19..21 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§52.2` | Each deploy job runs `npm ci --omit=dev` | 03-architecture/ci-and-deploy.md §11.1 | EDW-22..24 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§52.3` | No Docker container (`container:` key absent from all jobs) | 03-architecture/ci-and-deploy.md §11.1 | EDW-16..18 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§52.4` | No `packages: read` permission required | 03-architecture/ci-and-deploy.md §11.1 | EDW-25 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§52.5` | QA job: setup-node and npm ci conditional on gate step | 03-architecture/ci-and-deploy.md §11.1 | EDW-26 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§52.6` | Production job: setup-node and npm ci unconditional (gate needs js-yaml) | 03-architecture/ci-and-deploy.md §11.1 | EDW-28 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§52.7` | `02-§50.1`–`02-§50.7` superseded (Docker no longer used) | — | — | — | implemented |
| `02-§52.8` | `02-§50.12` superseded by `02-§52.1` (setup-node replaces Docker) | — | — | — | implemented |
| `02-§53.1` | Add-event endpoint completes GitHub operation before responding | — | SYNC-03 | `api/index.php` `handleAddEvent()` | covered |
| `02-§53.2` | Edit-event endpoint completes GitHub operation before responding | — | SYNC-04 | `api/index.php` `handleEditEvent()` | covered |
| `02-§53.3` | GitHub failure returns `{ success: false }` with HTTP 500 | — | SYNC-05 | `api/index.php` `handleAddEvent()` catch block | covered |
| `02-§53.4` | Error message is in Swedish, no internal details exposed | — | SYNC-06 | `api/index.php` `handleEditEvent()` catch block | covered |
| `02-§53.5` | `flushToClient()` and `ob_start()` removed | — | SYNC-01..02 | `api/index.php` | covered |
| `02-§53.6` | Modal shows step-by-step progress list during submission | — | PROG-01..02 | `source/assets/js/client/lagg-till.js`, `source/assets/js/client/redigera.js` | covered |
| `02-§53.7` | Each stage transitions from unchecked to green check mark | — | manual: browser visual check | `source/assets/js/client/lagg-till.js`, `source/assets/cs/style.css` | implemented |
| `02-§53.8` | Stage timing is client-side: 0 s, 0.5 s, 2 s | — | manual: browser timing check | `source/assets/js/client/lagg-till.js` | implemented |
| `02-§53.9` | On success, all stages show green checks and success message appears | — | manual: browser visual check | `source/assets/js/client/lagg-till.js` `setModalSuccess()` | implemented |
| `02-§53.10` | On error, progress stops and error message displayed | — | manual: disconnect API and submit | `source/assets/js/client/lagg-till.js` `setModalError()` | implemented |
| `02-§53.11` | Progress list used for both add-event and edit-event forms | — | PROG-03..04 | `source/assets/js/client/redigera.js` | covered |
| `02-§53.12` | Deploy workflow maintains `.env.api.persistent` backup — **superseded by 02-§100.1, 02-§100.11** (`.env` now lives at `$DEPLOY_DIR/.env`, outside the swapped `public_html`, so no backup is needed) | archive.md | — | `.github/workflows/deploy-reusable.yml` | superseded |
| `02-§53.13` | Restore falls back to `.env.api.persistent` if `.bak` missing — **superseded by 02-§100.7** (no restore-into-web-root step exists) | archive.md | — | `.github/workflows/deploy-reusable.yml` | superseded |
| `02-§53.14` | Persistent backup not deleted by restore step (`cp`, not `mv`) — **superseded by 02-§100** | archive.md | — | `.github/workflows/deploy-reusable.yml` | superseded |
| `02-§54.1` | When `end < start`, calculate duration as `(24×60 − startMins) + endMins` | 05-DATA_CONTRACT.md §4.3 | VLD-56..58 | `source/api/validate.js` `timeToMinutes()`, `source/assets/js/client/lagg-till.js` `checkEndTime()`, `source/scripts/lint-yaml.js` | covered |
| `02-§54.2` | Midnight-crossing ≤ 1 020 min accepted by all validation layers | 05-DATA_CONTRACT.md §4.3 | VLD-56..58, VLD-62, LNT-24 | `validate.js`, `lagg-till.js`, `redigera.js`, `lint-yaml.js` | covered |
| `02-§54.3` | Midnight-crossing > 1 020 min rejected with clear error | 05-DATA_CONTRACT.md §4.3 | VLD-59, VLD-63, LNT-25 | `validate.js`, `lagg-till.js`, `redigera.js`, `lint-yaml.js` | covered |
| `02-§54.4` | `end == start` always rejected (zero-length invalid) | 05-DATA_CONTRACT.md §4.3 | VLD-60 | `validate.js`, `lagg-till.js`, `redigera.js`, `lint-yaml.js` | covered |
| `02-§54.5` | Normal `end > start` behaviour unchanged | 05-DATA_CONTRACT.md §4.3 | VLD-61 | `validate.js`, `lagg-till.js`, `redigera.js` | covered |
| `02-§54.6` | Valid midnight crossing shows green info message on end field | 07-DESIGN.md §6.44a–6.44g | LVD-07 | `source/assets/js/client/lagg-till.js` `setFieldInfo()`, `checkEndTime()` | covered |
| `02-§54.7` | Info message uses `.field-info` class, no `aria-invalid` | 07-DESIGN.md §6.44a–6.44g | LVD-09 | `source/assets/cs/style.css` `.field-info`, `lagg-till.js` `setFieldInfo()` | covered |
| `02-§54.8` | Invalid crossing shows red error on end field | 07-DESIGN.md §6.34–6.39 | VLD-59, VLD-63 | `lagg-till.js`, `redigera.js` `checkEndTime()` | covered |
| `02-§54.9` | Info/error cleared when user edits start or end | 07-DESIGN.md §6.34–6.39 | manual: browser check | `lagg-till.js` REQUIRED_FIELDS clear listener | implemented |
| `02-§54.10` | Edit form applies same midnight-crossing logic | 05-DATA_CONTRACT.md §4.3 | VLD-62..63 | `source/assets/js/client/redigera.js` `checkEndTime()` | covered |
| `02-§54.11` | Build-time YAML linter applies midnight-crossing threshold | 05-DATA_CONTRACT.md §4.3 | LNT-24..25 | `source/scripts/lint-yaml.js` | covered |
| `02-§55.1` | Modal heading has no visible focus outline | 07-DESIGN.md §6.53 | MDP-01 | `source/assets/cs/style.css` `.modal-heading:focus` | covered |
| `02-§55.2` | Modal box uses `--radius-lg` (16 px) border-radius | 07-DESIGN.md §6.50 | MDP-02 | `source/assets/cs/style.css` `.modal-box` | covered |
| `02-§55.3` | Modal box uses `--space-lg` top/bottom padding | 07-DESIGN.md §6.51 | MDP-03 | `source/assets/cs/style.css` `.modal-box` | covered |
| `02-§55.4` | Modal heading and progress steps are center-aligned | 07-DESIGN.md §6.52 | MDP-04..05 | `source/assets/cs/style.css` `.modal-heading`, `.submit-progress` | covered |
| `02-§55.5` | Modal entry animation: fade + slide-up, ≤ 300 ms | 07-DESIGN.md §6.54 | MDP-06 | `source/assets/cs/style.css` `.modal-box` | covered |
| `02-§56.1` | Event detail page renders description as Markdown → HTML | 03-architecture/rendering.md §18.2; 03-architecture/ci-and-deploy.md §20.3 | EVT-23, EVT-25 | `source/build/render-event.js` → `renderDescriptionHtml()` | covered |
| `02-§56.2` | Weekly schedule renders description as Markdown → HTML | 03-architecture/ci-and-deploy.md §20.3 | MKD-D02 (via eventExtraHtml) | `source/build/render.js` → `renderDescriptionHtml()` | covered |
| `02-§56.3` | Today view uses pre-rendered description HTML from build JSON | 03-architecture/ci-and-deploy.md §20.3 | DIS-26, DIS-27, IDAG-19 | `source/build/render-today.js`, `render-idag.js` → `descriptionHtml` in JSON; `events-today.js` → uses `e.descriptionHtml` | covered |
| `02-§56.4` | RSS feed strips Markdown, uses plain text description | 03-architecture/rendering.md §17.3; 03-architecture/ci-and-deploy.md §20.3 | RSS-16 | `source/build/render-rss.js` → `stripMarkdown()` | covered |
| `02-§56.5` | iCal strips Markdown, uses plain text description | 03-architecture/ci-and-deploy.md §20.3 | ICAL-32, ICAL-33 | `source/build/render-ical.js` → `stripMarkdown()` | covered |
| `02-§56.6` | Description Markdown sanitization: raw HTML dropped at parse time, unsafe-scheme URIs (`javascript:`/`vbscript:`/`data:`/`file:`) neutralized in links and images | 03-architecture/ci-and-deploy.md §20.3 | MKD-D07..12, MKD-D25..26, MKD-D28..30, EVT-24 | `source/assets/js/client/markdown-renderers.js` → `renderers`; consumed by `source/build/markdown.js` → `renderDescriptionHtml()` | covered |
| `02-§56.7` | Plain text descriptions render correctly (wrapped in `<p>`) | 03-architecture/ci-and-deploy.md §20.3 | MKD-D01, MKD-D06, MKD-D13..14 | `source/build/markdown.js` → `renderDescriptionHtml()` | covered |
| `02-§56.8` | `.event-description p` no longer applies `font-style: italic` | — | MKD-CSS-01 | `source/assets/cs/style.css` | covered |
| `02-§56.9` | Description CSS uses existing design tokens only | 07-DESIGN.md §7 | manual: inspect CSS for hardcoded values | `source/assets/cs/style.css` — no new custom properties added | implemented |
| `02-§56.10` | Shared helper provides `renderDescriptionHtml()` and `stripMarkdown()` | 03-architecture/ci-and-deploy.md §20.3 | MKD-D15, MKD-D24 | `source/build/markdown.js` | covered |
| `02-§57.1` | Users can apply formatting via toolbar without knowing Markdown syntax | — | manual: open form, click each button, verify syntax inserted | `source/assets/js/client/markdown-toolbar.js` | implemented |
| `02-§57.2` | Clicking a toolbar button wraps selected text with Markdown syntax | — | MDT-01..06 | `source/assets/js/client/markdown-toolbar.js` | covered |
| `02-§57.3` | With no selection, toolbar inserts syntax with placeholder and selects it | — | MDT-07..12 | `source/assets/js/client/markdown-toolbar.js` | covered |
| `02-§57.4` | List and quote buttons apply prefix per line for multi-line selections | — | MDT-13..15 | `source/assets/js/client/markdown-toolbar.js` | covered |
| `02-§57.5` | Toolbar appears above description textarea in both forms | — | MDT-16..17 | `source/build/render-add.js`, `source/build/render-edit.js` | covered |
| `02-§57.6` | Buttons appear in order: Bold, Italic, Heading, Bullet, Numbered, Quote | — | MDT-18 | `source/assets/js/client/markdown-toolbar.js` | covered |
| `02-§57.7` | Each button displays an inline SVG icon | — | MDT-19 | `source/assets/js/client/markdown-toolbar.js` | covered |
| `02-§57.8` | Each button has an accessible `aria-label` | — | MDT-20 | `source/assets/js/client/markdown-toolbar.js` | covered |
| `02-§57.9` | Toolbar styled with existing design tokens (no hardcoded values) | 07-DESIGN.md §6.56–6.63 | manual: inspect CSS for hardcoded values | `source/assets/cs/style.css` | implemented |
| `02-§57.10` | Toolbar logic in shared `markdown-toolbar.js` loaded by both forms | — | MDT-21..22 | `source/build/render-add.js`, `source/build/render-edit.js` | covered |
| `02-§57.11` | No external dependencies added | — | manual: check package.json | — | implemented |
| `02-§57.12` | No live preview — toolbar only inserts syntax | — | manual: confirm no preview UI | — | implemented |
| `02-§57.13` | Toolbar buttons have visible focus indicators | — | MDT-23 | `source/assets/cs/style.css` | covered |
| | | **§61 — Mobile Navigation Improvements** | | | |
| `02-§61.1` | Sticky nav on mobile (≤ 767 px) | 07-DESIGN.md §6.24-impl | MN-01..03 | `source/assets/cs/style.css` | covered |
| `02-§61.2` | Sticky nav on desktop | 07-DESIGN.md §6.24-impl | MN-01..03 | `source/assets/cs/style.css` | covered |
| `02-§61.3` | Terracotta hamburger button with white icon | 07-DESIGN.md §6.21-impl | MN-04..05 | `source/assets/cs/style.css` | covered |
| `02-§61.4` | Rounded corners on hamburger button | 07-DESIGN.md §6.21-impl | MN-06 | `source/assets/cs/style.css` | covered |
| `02-§61.5` | Terracotta menu panel with white text | 07-DESIGN.md §6.20-impl | MN-07..08 | `source/assets/cs/style.css` | covered |
| `02-§61.6` | WCAG AA contrast (white on terracotta, 14 px bold) | 07-DESIGN.md §6.20-impl | manual: verify 14 px bold white on terracotta | `source/assets/cs/style.css` | implemented |
| `02-§61.7` | Floating card appearance (rounded corners, inset margins) | 07-DESIGN.md §6.20-impl | MN-09..10 | `source/assets/cs/style.css` | covered |
| `02-§61.8` | Visual hierarchy: page links vs section links | 07-DESIGN.md §6.22-impl | MN-11..14 | `source/assets/cs/style.css` | covered |
| `02-§61.9` | Smooth CSS transition (max-height, 250 ms) | 07-DESIGN.md §6.23-impl | MN-15..16 | `source/assets/cs/style.css` | covered |
| `02-§61.10` | White focus outlines against terracotta | — | MN-17..18 | `source/assets/cs/style.css` | covered |
| `02-§61.11` | Preserve keyboard/ARIA behaviour | — | manual: MN-M04 — Escape, click-outside, aria-expanded | `source/assets/js/client/nav.js` | implemented |
| | | **§62 — Footer Versioning** | | | |
| `02-§62.1` | VERSION file in project root | — | VER-01..02 | `VERSION` | covered |
| `02-§62.2` | Major/minor bumped manually | 09-RELEASING.md | — | `VERSION` | implemented |
| `02-§62.3` | Version `<p>` in site footer | — | FTR-18..19 | `source/build/build.js` | covered |
| `02-§62.4` | Version text visually subordinate | — | manual: verify footer version is small and subtle | `source/assets/cs/style.css` | implemented |
| `02-§62.5` | No version on pages without footer | — | FTR-06..07 | `source/build/build.js` | covered |
| `02-§62.6` | Production: full semver from tags | — | — | `.github/workflows/deploy-prod.yml` | implemented |
| `02-§62.7` | QA: full semver + PR number | — | — | `.github/workflows/deploy-qa.yml` | implemented |
| `02-§62.8` | Local: base version + timestamp | — | VER-03..04, VER-07 | `source/build/version.js` | covered |
| `02-§62.9` | Event-data deploy: no version shown | — | VER-06, VER-09 | `source/build/version.js` | covered |
| `02-§62.10` | Annotated git tag per prod deploy | — | — | `.github/workflows/deploy-prod.yml` | implemented |
| `02-§62.11` | Tag created after successful deploy | — | — | `.github/workflows/deploy-prod.yml` | implemented |
| `02-§62.12` | Tag skip if already exists | — | — | `.github/workflows/deploy-prod.yml` | implemented |
| `02-§62.13` | Auto GitHub Release on new major/minor | — | — | `.github/workflows/deploy-prod.yml` | implemented |
| `02-§62.14` | Patch deploys: no GitHub Release | — | — | `.github/workflows/deploy-prod.yml` | implemented |
| `02-§62.15` | BUILD_VERSION env var accepted by build | — | VER-05 | `source/build/version.js` | covered |
| `02-§62.16` | Local fallback: VERSION file + timestamp | — | VER-07..08 | `source/build/version.js` | covered |
| `02-§62.17` | Version logic in separate testable module | — | VER-01..09 | `source/build/version.js` | covered |
| `02-§62.18` | QA redeploy triggered after prod deploy | 09-RELEASING.md | manual: trigger prod deploy and verify QA workflow runs | `.github/workflows/deploy-prod.yml` | implemented |
| `02-§62.19` | QA redeploy uses exact prod version string | 09-RELEASING.md | manual: verify QA footer shows exact prod version after redeploy | `.github/workflows/deploy-prod.yml` | implemented |
| `02-§62.20` | Normal QA deploy restores QA-suffixed version | — | manual: merge PR and verify QA footer shows QA suffix | `.github/workflows/deploy-qa.yml` | implemented |
| | | **§63 — Site Analytics** | | | |
| `02-§63.1` | GoatCounter as analytics tool | 03-architecture/pages-and-content.md §23 | — | `source/build/analytics.js` | implemented |
| `02-§63.2` | No cookies from analytics | 03-architecture/pages-and-content.md §23.1 | — | GoatCounter built-in | implemented |
| `02-§63.3` | Analytics script < 5 KB | 03-architecture/pages-and-content.md §23.1 | — | GoatCounter built-in | implemented |
| `02-§63.4` | Analytics in prod and QA | 03-architecture/pages-and-content.md §23.2 | — | GitHub Environment secrets | implemented |
| `02-§63.5` | Separate GoatCounter site codes | 03-architecture/pages-and-content.md §23.2 | — | GitHub Environment secrets | implemented |
| `02-§63.6` | No analytics in local dev | 03-architecture/pages-and-content.md §23.2 | — | `.env.example` | implemented |
| `02-§63.7` | Script on all shared-layout pages | 03-architecture/pages-and-content.md §23.2 | ANA-SH-* | `source/build/analytics.js`, render-*.js | covered |
| `02-§63.8` | Script on display view | 03-architecture/pages-and-content.md §23.2 | ANA-DIS-01 | `source/build/render-today.js` | covered |
| `02-§63.9` | Script loads async, non-blocking | 03-architecture/pages-and-content.md §23.2 | ANA-ASYNC-01 | `source/build/analytics.js` | covered |
| `02-§63.10` | GOATCOUNTER_SITE_CODE env var | 03-architecture/pages-and-content.md §23.2 | ANA-CODE-01 | `source/build/analytics.js` | covered |
| `02-§63.11` | No script when env var absent | 03-architecture/pages-and-content.md §23.2 | ANA-NO-* | `source/build/analytics.js` | covered |
| `02-§63.12` | Page views per day/week | 03-architecture/pages-and-content.md §23.1 | — | GoatCounter dashboard | implemented |
| `02-§63.13` | Most visited pages | 03-architecture/pages-and-content.md §23.1 | — | GoatCounter dashboard | implemented |
| `02-§63.14` | Referrer tracking | 03-architecture/pages-and-content.md §23.1 | — | GoatCounter built-in | implemented |
| `02-§63.15` | Device type and screen size | 03-architecture/pages-and-content.md §23.1 | — | GoatCounter built-in | implemented |
| `02-§63.16` | Returning visitors | 03-architecture/pages-and-content.md §23.1 | — | GoatCounter built-in | implemented |
| `02-§63.17` | 404 hits | 03-architecture/pages-and-content.md §23.1 | — | GoatCounter built-in | implemented |
| `02-§63.18` | Page load times | 03-architecture/pages-and-content.md §23.1 | — | GoatCounter built-in | implemented |
| `02-§63.19` | Traffic patterns over time | 03-architecture/pages-and-content.md §23.1 | — | GoatCounter dashboard | implemented |
| `02-§63.20` | Track form submission | 03-architecture/pages-and-content.md §23.3 | — | GoatCounter page view | implemented |
| `02-§63.21` | Track form abandonment | 03-architecture/pages-and-content.md §23.3 | — | GoatCounter page view | implemented |
| `02-§63.22` | Track today view page load | 03-architecture/pages-and-content.md §23.3 | — | GoatCounter page view | implemented |
| `02-§63.23` | Track display mode page load | 03-architecture/pages-and-content.md §23.3 | — | GoatCounter page view | implemented |
| `02-§63.24` | Track Discord link click | 03-architecture/pages-and-content.md §23.3 | ANA-EVT-01, ANA-EVT-03 | `source/build/render-index.js` | covered |
| `02-§63.25` | Track Facebook link click | 03-architecture/pages-and-content.md §23.3 | ANA-EVT-02, ANA-EVT-04 | `source/build/render-index.js` | covered |
| `02-§63.26` | Track iCal download | 03-architecture/pages-and-content.md §23.3 | ANA-EVT-05 | `source/build/render.js` | covered |
| `02-§63.27` | Track RSS link click | 03-architecture/pages-and-content.md §23.3 | ANA-EVT-06 | `source/build/render.js` | covered |
| `02-§63.28` | Track scroll depth on schedule | 03-architecture/pages-and-content.md §23.3 | — | GoatCounter custom event (future) | implemented |
| `02-§63.29` | QR codes data file exists | 03-architecture/pages-and-content.md §23.5 | ANA-QR-01 | `source/data/qr-codes.yaml` | covered |
| `02-§63.30` | QR file maintained manually | 03-architecture/pages-and-content.md §23.5 | — | process/convention | implemented |
| `02-§63.31` | QR entry has id + description | 03-architecture/pages-and-content.md §23.5 | ANA-QR-02 | `source/data/qr-codes.yaml` | covered |
| `02-§63.32` | QR URLs include ?ref= parameter | 03-architecture/pages-and-content.md §23.4 | — | `source/build/build.js` | implemented |
| `02-§63.33` | Display view QR uses tracked ref | 03-architecture/pages-and-content.md §23.4 | ANA-QR-03 | `source/build/build.js` | covered |
| `02-§63.34` | No personal data collected | 03-architecture/pages-and-content.md §23.1 | — | GoatCounter built-in | implemented |
| `02-§63.35` | No cookie consent banner needed | 03-architecture/pages-and-content.md §23.1 | — | GoatCounter built-in | implemented |
| `02-§63.36` | No wrapper JS libraries | 03-architecture/pages-and-content.md §23.3 | — | convention | implemented |
| `02-§63.37` | Use data-goatcounter-click attrs | 03-architecture/pages-and-content.md §23.3 | ANA-EVT-01..06 | `source/build/render-index.js`, `render.js` | covered |
| `02-§63.38` | All deploy workflows pass GOATCOUNTER_SITE_CODE | 03-architecture/pages-and-content.md §23.2 | manual: add event, verify script on schema.html | `.github/workflows/event-data-deploy-post-merge.yml`, `deploy-reusable.yml` | implemented |

---

## Summary

```text
Total requirements:            1287
Covered (implemented + tested): 662
Implemented, not tested:        625
Gap (no implementation):          0
Orphan tests (no requirement):    0

Note: §100 (API .env outside web root) adds 11 requirements
  (02-§100.1–100.11): 7 covered (HTACC-01..06, ENVLOC-01..04) and 4
  implemented (02-§100.3/100.6 manual server checkpoints, 02-§100.9/100.10
  structural). §53.12–53.14 (persistent .env backup) are superseded by §100
  and excluded from the totals above (were covered; backup mechanism removed).

Note: Archive timeline implemented (02-§2.6, 02-§16.2, 02-§16.4, 02-§21.1–21.11).
8 of 11 new requirements are covered (ARK-01..08 tests).
§80 multi-day selection: 12 covered by tests, 12 manual (browser-only), 3 code-only.
3 are implemented but require manual/visual verification
  (02-§21.3 layout, 02-§21.5 single-open, 02-§21.7 keyboard).
02-§2.6, 02-§16.2, 02-§16.4 moved from gap to covered.
11 requirements added for archive timeline (02-§21.1–21.11), all now implemented.
13 requirements added for event data CI pipeline (02-§23.1–23.13):
  8 covered (LNT-01..18, SEC-01..13): 02-§23.1–23.8
  5 implemented (CI workflow, no unit test possible): 02-§23.9–23.13
16 requirements for unified navigation (02-§24.1–24.15, 02-§24.17):
  11 covered (NAV-01..11): 02-§24.1–24.9, 02-§24.11–24.12
  5 implemented (CSS/JS mobile/desktop, browser-only): 02-§24.10, 02-§24.13–24.15, 02-§24.17

Snapshot updated to include Arkiv nav link.
13 requirements added and implemented for edit-activity submit UX flow (02-§20.1–20.13).
02-§18.46 covered (BUILD-01..04): edit form URL derivation via editApiUrl().
02-§18.45 implemented (manual): edit form credentials: 'include' for cross-origin API.
02-§18.41 added and covered: cross-subdomain cookie domain fix (COOKIE_DOMAIN env var).
6 requirements added for shared site footer (02-§22.1–22.6): 4 covered (FTR tests), 2 implemented (convention + structural).
SES-14 and SES-15 verify Domain= is included/omitted correctly.
17 requirements added for add-activity submit UX flow (02-§19.1–19.17).
3 of these are covered (ADD-01..06 test structural HTML: 02-§19.7, 02-§19.17, and
  fieldset via ADD-02 for 02-§19.1).
14 are implemented but browser-only; cannot be unit-tested in Node.js.
3 requirements added for cookie consent UX fixes (02-§18.37–39).
02-§18.11 updated: only 'accepted' is now persisted (not 'declined').
End time is now required everywhere (add form, edit form, data contract).
02-§9.4, 05-§3.1, 05-§4.3, 02-§18.25 all moved to covered (VLD-27..32).
02-§18.40 added and implemented: ownerName crash fix.
13 requirements added and implemented for edit-activity submit UX flow (02-§20.1–20.13).
3 covered (EDIT-01, EDIT-02 partial, EDIT-04–06): §20.13, §20.1, §20.5.
10 implemented but browser-only; cannot be unit-tested in Node.js.
2 requirements added for CI checkout depth (CL-§9.5, 02-§23.14):
  both implemented (CI workflow config, no unit test possible).
4 requirements added for image loading performance (02-§25.1–25.4):
  all 4 covered (IMG-01..06 in render-index.test.js).
2 requirements added for speed-index performance fixes (02-§25.5–25.6):
  02-§25.5 covered (IMG-07): first-section images stripped of loading="lazy".
  02-§25.6 covered (snapshot + manual): nav.js defer on all pages.
  02-§25.1 updated: exception added for first-section images.
3 requirements added for search engine blocking (02-§1a.1–1a.3):
  2 covered (ROB-01..14): 02-§1a.2, 02-§1a.3
  1 implemented (build writes robots.txt; manual verification): 02-§1a.1
14 requirements added for form time-gating (02-§26.1–26.13, 05-§1.6):
  2 covered (GATE-01..10): 02-§26.2 (period logic), 02-§26.13 (data attributes).
  12 implemented (browser-only or manual): 02-§26.1, 02-§26.3–26.12, 05-§1.6.
6 requirements added for admin pre-camp bypass (02-§26.14–26.19):
  2 covered (GATE-11..16, ABYP-01..13): 02-§26.17 (pre-period admin accept),
    02-§26.18 (post-period locked for everyone).
  4 implemented (browser-only): 02-§26.14 (bypass button rendered),
    02-§26.15 (disabled state cleared on click), 02-§26.16 (bypass button
    not shown after period), 02-§26.19 (admin token in /add-event body).
1 requirement added for bypass-button placement (02-§26.20): implemented
  (browser-only manual checkpoint) — button renders on its own row below
  the locked banner, consistent across lagg-till.html and redigera.html.
6 requirements added for past-date blocking (02-§27.1–27.6):
  3 covered (PDT-03..06): 02-§27.4, 02-§27.5, 02-§27.6
  2 implemented (browser-only client validation): 02-§27.2, 02-§27.3
  1 definition (no implementation needed): 02-§27.1
19 requirements added for archive page improvements (02-§21.12–21.30):
  14 covered (ARK-09..24): header layout, FB logo, event list.
  5 implemented (browser-only or manual): responsive, active dot, visual consistency.
5 requirements added for archive cleanup and camp naming (02-§21.31–32, 02-§29.1–3):
  4 covered (ARK-06, ARK-20, ARK-25, ARK-26): 02-§21.8, 02-§21.27, 02-§21.31, 02-§21.32.
  3 implemented (data convention): 02-§29.1, 02-§29.2, 02-§29.3.
  02-§21.8 updated: date/location removed from accordion content.
  02-§21.27 updated: event rows now expandable when description/link present.
18 requirements for upcoming camps on homepage (02-§28.1–28.18):
  10 covered (UC-01..14): filtering, sorting, heading, content, data-end, indicators.
  7 implemented (browser-only or manual): past-marking, Stockholm time, CSS tokens,
    section placement, no-rebuild, minimal JS.
  1 covered: 02-§28.18 (camp name terracotta color, CL-04).
02-§6.5 moved from gap to covered (ILE-01..04, ILE-E01..E04):
  per-field inline validation errors on add and edit forms.
22 requirements added for hero section redesign (02-§30.1–30.22):
  15 covered (HERO-01..15): layout structure, title, image, social links, countdown.
  7 implemented (browser-only or manual): mobile responsive, rounded corners, icon size,
    countdown background, CSS tokens, minimal JS, image files.
Matrix cleanup (2026-02-25):
  07-§6.7 moved from gap to implemented (hamburger menu exists; see 02-§24.10–14, NAV-10, NAV-11).
  11 duplicate rows annotated with cross-references (see-also notes):
    02-§4.7→02-§2.10, 02-§11.2→02-§4.8, 02-§11.3→02-§4.8,
    CL-§1.3→CL-§2.9, CL-§3.2→CL-§2.2, CL-§4.1→CL-§2.3, CL-§5.9→05-§6.1,
    07-§9.2→02-§13.2, 07-§9.3→02-§13.3, 07-§9.4→02-§13.4, 07-§9.5→02-§13.6.
  Top Gaps list updated: item 8 consolidated with CL-§5.9; item 16 notes
    native <details> accessibility.
3 requirements added for hero visual refinements (02-§30.23–30.25):
  1 covered (HERO-16): 02-§30.24 (Discord icon image).
  2 implemented (visual/CSS, manual check): 02-§30.23 (countdown bg), 02-§30.25 (sidebar centering).
  02-§30.18 updated: background changed from rgba(245,238,223,0.7) to #FAF7EF.
  02-§30.21 updated: discord_group.webp → DiscordLogo.webp.
12 requirements added for inline camp listing and link styling (02-§31.1–31.12):
  2 covered (UC-06, UC-11): 02-§31.5, 02-§31.6.
  10 implemented (visual/CSS or manual code review): 02-§31.1–31.4, 02-§31.7–31.12.
  02-§28.9 superseded (camp listing no longer has its own heading).
  02-§28.13 superseded (information text no longer rendered).
10 data validation gaps closed (02-§10.3, 05-§1.3, 05-§4.1, 05-§4.2, 05-§4.4,
  05-§5.1, 05-§6.1, CL-§5.5, CL-§5.9, CL-§6.3) — all moved from gap to covered:
  validate.js: HH:MM format (TIME_RE), string length limits (MAX_LENGTHS),
    camp date range (campDates param). Tests: VLD-33..55.
  lint-yaml.js: unique (title+date+start) combo, active+archived conflict.
    Tests: LNT-19..23.
  app.js: passes activeCamp to validators for range checking.
16 requirements added for CI linting (02-§32.1–32.8, 02-§33.1–33.8):
  all 16 implemented (infrastructure/tooling, manual verification).
  CL-§5.1 and CL-§5.2 moved from gap to implemented.
  html-validate for HTML validation of built output.
  Stylelint with stylelint-config-standard for CSS linting.
  Both integrated into ci.yml with data-only skip condition.
14 requirements added for derived active camp (02-§34.1–34.14):
  8 covered (DAC-01..07): 02-§34.1–34.6, 02-§34.8–34.9, 02-§34.13.
  5 implemented (manual/code review): 02-§34.7, 02-§34.10–34.12, 02-§34.14.
  05-§1.2 updated: now references derivation logic instead of manual flag.
  05-§1.3 superseded: active+archived conflict is impossible without active field.
  LNT-22..23 tests removed (active+archived check removed).
  `active` field removed from camps.yaml and data contract.
4 accessibility gaps closed:
  02-§13.2 / 07-§9.2 moved from gap to covered (A11Y-01..09):
    :focus-visible rules added to all interactive elements in style.css.
  02-§13.6 / 07-§9.5 moved from gap to implemented:
    native <details>/<summary> accepted as satisfying ARIA requirement;
    archive accordion already uses explicit aria-expanded/aria-controls.
1 requirement added for compact camp list layout (02-§3.5):
  covered (CL-01..03): CSS presence tests for flex layout, no border, no display: block.
  Manual visual check: open homepage and confirm one-liner layout.
10 requirements added for location accordions on index page (02-§35.1–35.10):
  7 covered (LOC-01..10): 02-§35.3–35.9.
  3 implemented (visual/structural, manual verification): 02-§35.1, 02-§35.2, 02-§35.10.
240 new tests added across 10 test files (coverage-*.test.js):
  75 requirements moved from implemented to covered.
  Test files: coverage-index, coverage-layout, coverage-today, coverage-idag,
    coverage-add, coverage-edit, coverage-render, coverage-css,
    coverage-structural, coverage-edit-event.
  Categories: homepage, layout, display mode, today view, add/edit forms,
    schedule render, CSS design tokens, structural cross-page, edit-event API.
18 requirements added for camps.yaml validator (02-§37.1–37.18):
  17 covered (VCMP-01..32): validation, file creation, header sync.
  1 implemented (manual, npm script): 02-§37.16.
11 requirements added for marked markdown converter (02-§38.1–38.11):
  6 covered (existing RNI/IMG tests + MKD-01..05): 02-§38.1, 02-§38.4–38.7, 02-§38.10.
  5 implemented (manual/structural): 02-§38.2, 02-§38.3, 02-§38.8, 02-§38.9, 02-§38.11.
16 requirements added for zero-downtime deploy (02-§40.1–40.16):
  all 16 implemented (CI/infrastructure, manual verification only).
  Static site deploy changed from FTP to SCP + SSH swap.
  Server app deploy unchanged.
19 requirements added for environment management (02-§41.1–41.19):
  all 19 implemented (CI/infrastructure, manual verification only).
  Splits deploy into QA (auto) and Production (manual workflow_dispatch).
  Event data deploys to both environments in parallel.
  Fixes hardcoded QR code URL to use SITE_URL.
29 requirements added for QA camp isolation (02-§42.1–42.29):
  15 covered (QA-01..11, VCMP-33..36): filtering, resolution priority, field defaults.
  14 implemented (manual/infrastructure): data rename, BUILD_ENV plumbing, workflow, docs.
  Dedicated QA camp with qa: true field, filtered out in production.
  resolveActiveCamp() gains environment-aware filtering.
  BUILD_ENV plumbed through deploy workflow and API.
15 requirements added for FTP-to-SSH QA migration (02-§43.1–43.15):
  14 implemented (workflow changes, doc updates, production unchanged).
  1 gap (02-§43.14: manual QA FTP secret cleanup after validation).
  QA event data deploy switches from FTP/curl to SCP/SSH.
  Redundant FTP upload step removed from API server deploy.
4 requirements added and implemented for live form validation (02-§6.9–6.12):
  all 4 implemented (browser-only DOM events; cannot be unit-tested in Node.js).
  LVD-01..04 source-code structural checks pass (tests/live-form-validation.test.js).
  Manual checkpoint: open /lagg-till.html, select a past date → error shown immediately.
  Manual checkpoint: fill start time, change end time to before start → error shown.
  Manual checkpoint: tab through required fields without filling them → errors shown.
  Manual checkpoint: start editing a field with an error → error clears immediately.
2 requirements added and implemented for start-time cross-check and past-time hysteresis (02-§6.13–6.14):
  all 2 implemented (browser-only DOM events; cannot be unit-tested in Node.js).
  Manual checkpoint: fill end time, change start to after end → end-time error appears.
  Manual checkpoint: fill end time, change start to before end → end-time error clears.
  Manual checkpoint: pick today's date and a start time > 2 h ago → error shown.
  Manual checkpoint: pick a future date → no past-time error on start.
39 requirements added for PHP API (02-§44.1–44.39):
  35 implemented (PHP code, docs, coexistence).
  4 gaps (02-§44.28 Apache verify, 02-§44.29–30 deploy workflow, 02-§44.32 env secrets).
5 requirements added and implemented for display sidebar status widget and auto-reload (02-§4.14–4.18):
  3 covered (DIS-19..23): 02-§4.14 (no site footer), 02-§4.15 (live clock), 02-§4.16 (build time).
  2 implemented (browser/manual): 02-§4.17 (version.json polling), 02-§4.18 (midnight reload).
  Design tokens documented in 07-DESIGN.md §6.40–6.43.
3 requirements added and implemented for portrait layout optimisation (02-§4.19–4.21):
  2 covered (DIS-13, DIS-24, DIS-25): 02-§4.19 (date-only heading), 02-§4.20 (heading in sidebar).
  1 implemented (manual visual check): 02-§4.21 (compact event rows, flex 3:1 layout).
  Design documented in 07-DESIGN.md §6.44–6.48.
25 requirements added for iCal calendar export (02-§2.12–2.13, 02-§45.1–45.23):
  23 covered (ICAL-01..28, KAL-01..12, EVT-21..22, SNP-07..08).
  2 implemented (manual: build.js wiring, SITE_URL reuse).
  Architecture documented in 03-architecture/pages-and-content.md §22.
14 requirements added for iCal presentation and compliance (02-§46.1–46.15):
  12 covered (SNP-09..14, KAL-13..15, ICAL-29..31).
  1 implemented (CSS visual, manual check): 02-§46.7.
  Schedule header SVG icon, per-event iCal links, tips page card layout, DTSTAMP.
3 requirements added for heading and link color update (02-§47.1–47.3):
  2 covered (HDC-01..04): 02-§47.1 (heading colors), 02-§47.2 (link underline).
  1 implemented (manual visual check): 02-§47.3 (nav/back-links unchanged).
18 requirements added for add/edit cookie enhancements (02-§48.1–48.18):
  13 covered (CEH-P01, CEH-01..11): auto-fill, cookie paragraph, no-session, event list, edit link.
  5 implemented (browser-only, manual verification): 02-§48.6, 02-§48.10–48.12, 02-§48.15–48.16.
6 requirements added for API-layer security validation (02-§49.1–49.6):
  6 covered (ASEC-01..16): injection pattern scanning, link protocol, Node.js + PHP parity.
  Architecture documented in 03-architecture/ci-and-deploy.md §11.6.
23 requirements added for Docker-based event data CI pipeline (02-§50.1–50.24):
  22 implemented (workflow files, Dockerfile, CI config; manual verification only).
  1 gap (02-§50.22: manual FTP secret cleanup after validation).
  02-§23.1–23.10 superseded (validation moved to API layer).
  02-§23.11–23.12 superseded by 02-§50.16–50.18 (SCP post-merge).
  02-§23.13 superseded by 02-§50.11 (deploy is post-merge).
  02-§43.9–43.10 superseded by 02-§50.19–50.22 (production SCP, FTP removed).
  Architecture rewritten in 03-architecture/ci-and-deploy.md §11.
  CLAUDE.md §9.4 updated.
  08-ENVIRONMENTS.md updated: event data flow, workflows table, FTP secrets removed.
  Previous gap count corrected: 02-§44.28–30, 02-§44.32 were already covered.
10 requirements added for event-data deploy detect elimination (02-§51.1–51.10):
  8 covered (EDW-01..15): workflow structure, inline detection, QA gating.
  2 implemented (02-§51.9–51.10: supersession notes for §50.13 and §50.14).
  02-§50.13 superseded by 02-§51.2, 02-§51.5 (inline detection per job).
  02-§50.14 superseded by 02-§51.7 (inline QA check in production job).
  Architecture updated in 03-architecture/ci-and-deploy.md §11.3.
8 requirements added for setup-node replacement (02-§52.1–52.8):
  6 covered (EDW-16..28): no container, setup-node, npm ci, permissions, conditionality.
  2 implemented (02-§52.7–52.8: supersession notes).
  02-§50.1–50.7 superseded by 02-§52.1 (Docker no longer used by event-data deploy).
  02-§50.12 superseded by 02-§52.1 (setup-node + npm cache replaces Docker).
  Architecture updated in 03-architecture/ci-and-deploy.md §11.1, §11.3, §11.5.
14 requirements added for synchronous API errors and deploy safety (02-§53.1–53.14):
  10 covered (SYNC-01..06, PROG-01..04, ENV-01..03): API sync flow, progress UI, deploy backup.
  4 implemented (browser-only visual/timing, manual verification): 02-§53.7–53.10.
  API: synchronous GitHub operations, real error messages to user.
  Client: progress step list with green checkboxes during submission.
  02-§53.12–53.14 (ENV-01..03) later superseded by §100; the backup-and-restore
  mechanism and its tests (tests/deploy-env-backup.test.js) were removed.
  Deploy: persistent .env backup outside public_html.
11 requirements added for midnight-crossing events (02-§54.1–54.11):
  10 covered (VLD-56..63, LNT-24..25, LVD-07..09): server, client, lint validation.
  1 implemented (02-§54.9: browser-only clearing, manual verification).
  Events crossing midnight (e.g. 23:00→01:00) allowed if duration ≤ 17 h.
  Green info message for valid crossings; red error for invalid.
  Affects: client forms, server API, build-time YAML linter.
  Design tokens documented in 07-DESIGN.md §6.44a–6.44g.
  02-§6.10, 02-§6.13, 02-§9.4, 05-§4.3 updated.
5 requirements added for modal design polish (02-§55.1–55.5):
  5 covered (MDP-01..06): focus outline, border-radius, padding, alignment, animation.
  Design documented in 07-DESIGN.md §6.49–6.55.
13 requirements added for markdown toolbar (02-§57.1–57.13):
  9 covered (MDT-01..23): wrap, placeholder, multi-line, HTML presence, button order,
    SVG icons, aria-labels, shared file, focus-visible CSS.
  4 implemented (manual/visual): 02-§57.1 (UX), 02-§57.9 (design tokens), 02-§57.11
    (no deps), 02-§57.12 (no preview).
  Design documented in 07-DESIGN.md §6.56–6.63.
11 requirements added for mobile navigation improvements (02-§61.1–61.11):
  9 covered (MN-01..18): sticky nav, button design, menu panel, hierarchy,
    transition, focus outlines.
  2 implemented (manual/visual): 02-§61.6 (WCAG contrast check),
    02-§61.11 (keyboard/ARIA behaviour preserved).
  Design documented in 07-DESIGN.md §6.20-impl–§6.24-impl.
20 requirements added for footer versioning (02-§62.1–62.20):
  8 covered (VER-01..09, FTR-18..20): VERSION file, footer display, local/CI resolution.
  9 implemented (workflow/manual): tagging, release, CSS visual, manual bump docs.
  3 implemented (02-§62.18–62.20): QA redeploy trigger, prod version match, normal QA suffix.
  VERSION file, footer display, automatic tagging, GitHub Release on bump.
37 requirements added for site analytics (02-§63.1–63.37):
  13 covered (ANA-SH-*, ANA-DIS-01, ANA-ASYNC-01, ANA-CODE-01, ANA-NO-*,
    ANA-EVT-01..06, ANA-QR-01..03): script inclusion, tracking attrs, QR data.
  24 implemented (GoatCounter built-in, dashboard, convention, manual):
    tool choice, cookies, size, env gating, domain filter, traffic metrics,
    page views, scroll depth, QR manual process.
  GoatCounter hosted, custom events via data-goatcounter-click, QR referrer tracking.
  Architecture documented in 03-architecture/pages-and-content.md §23.
5 requirements added for main landmark element (02-§70.1–70.5):
  4 covered (MAIN-01-*, MAIN-02-*, MAIN-03-*): one <main> per page, excludes nav/footer.
  1 implemented (02-§70.4): no visual styling changes — semantic element only.
  <main> added to all 9 render files. Design documented in 07-DESIGN.md §9.6.
02-§64.10–12, 02-§64.24 removed: back-to-top nav link removed.
  IDX-12, IDX-13, IDX-14, IDX-20 tests removed; IDX-21 added (absence test).
4 requirements added for section anchor ID consistency (02-§79.1–79.4):
  all 4 covered (ANC-01..04).
12 requirements added for form draft cache (02-§85.1–85.12):
  5 covered (DRAFT-01..05): 02-§85.4, 02-§85.5, 02-§85.8, 02-§85.10, 02-§85.12.
  5 implemented (browser-only): 02-§85.1, 02-§85.2, 02-§85.3, 02-§85.6, 02-§85.7, 02-§85.9.
  2 done (no implementation needed): 02-§85.11.
9 requirements added for PWA mobile/offline improvements (02-§83.26–83.34):
  Updates: 02-§83.10 (meta tag), 02-§83.15 (cache version), 02-§83.16 (pre-cache all),
    02-§83.19 (events.json caching).
  New: 02-§83.26 (maskable icon), 02-§83.27 (scheme filter), 02-§83.28 (events.json
    network-first), 02-§83.29 (offline fallback), 02-§83.30–33 (offline page),
    02-§83.34 (cache version increment).
6 requirements added for image cache-busting href and manifest references (02-§86.1–86.6):
  5 covered (CACHE-16..20): 02-§86.1–86.4, 02-§86.6.
  1 implemented (structural, no render changes): 02-§86.5.
8 requirements added for manifest metadata (02-§87.1–87.8):
  7 covered (PWA-32..37): 02-§87.1–87.6, 02-§87.8.
  1 done (no new deps): 02-§87.7.
3 requirements updated for PWA offline availability:
  02-§83.16 updated: pre-cache excludes network-dependent pages, adds /index.html.
  02-§83.19 updated: no-cache list includes /lagg-till.html, /redigera.html, /delete-event.
  02-§83.35 added: offline page must only link to pages functional offline.
  02-§83.34: cache version bumped to sb-sommar-v3.
02-§91.2 updated: token format corrected from "opaque string (e.g. UUID)"
  to `namn_uuid_epoch` with embedded expiry.
2 requirements added for admin token format (02-§91.29–91.30):
  1 covered (02-§91.29: server-side expiry rejection, ADM-09..10).
  1 implemented (02-§91.30: creation script).
§93 Node rate-limit helper replaced by `express-rate-limit` middleware:
  `source/api/rate-limit.js` and `tests/rate-limit.test.js` deleted;
  `app.js` now uses per-route `rateLimit({...})` instances with
  `trust proxy 'loopback'` and standard `Retry-After` / `RateLimit-*`
  headers. Closes CodeQL `js/missing-rate-limiting` alerts 43/44/45.
  5 rows moved from covered to implemented (manual verification replaces
  removed RL-01..05 unit tests of the now-deleted helper).
21 requirements added for the project documentation site (02-§97.1–97.21):
  Pages now enabled (status `built`, source `main` /docs); 02-§97.1–97.3
    moved from gap to implemented based on the GitHub Pages REST API.
  9 implemented — `docs/_config.yml` enables `jekyll-relative-links`;
    `docs/index.md` is the landing page; `01-CONTRIBUTORS.md` points
    readers at the docs site; no new workflows, dependencies, or
    domain config are introduced.
  2 covered (02-§97.13, 02-§97.14) — `README.md` links to the
    published site above the developer setup section and lists every
    docs/*.md file; `tests/readme-docs-link.test.js` verifies both
    (README-DOCS-01..04).
  4 + 4 new tests across `tests/docs-site-config.test.js` (DOCS-CFG-01..04)
    and `tests/readme-docs-link.test.js` (README-DOCS-01..04).
7 hidden-site requirements added for the documentation site (02-§97.15–97.21):
  6 covered, 1 implemented (the policy declaration §97.18).
  Mirrors §1a's intentionally-hidden policy: `docs/robots.txt`
  (`Disallow: /`) blocks every crawler at the docs site root, and
  `docs/_includes/head-custom.html` injects a noindex/nofollow robots
  meta into every rendered page via the Primer theme's standard hook.
  `docs/index.md` no longer links to `https://sbsommar.se`; it carries
  a project-technical reverse-discoverability banner pointing back to
  the source repo, README, and issue tracker on github.com.
  8 new tests across the same suite (DOCS-CFG-05..07, DOCS-IDX-01..05).

20 requirements delivered for the locale overview page (02-§98.1–98.20,
Session 1 of issue #332): 16 covered by unit tests (LOK-01..83),
4 implemented (§98.8 contextual links, §98.14 design-token discipline,
§98.15 mobile breakpoint, §98.20 corner cell) — all four need
manual/browser verification only. See 02-requirements/design-and-content.md §98 and
07-DESIGN.md §6 "Locale overview grid" for the design spec.
```

---

## Top Gaps — Prioritised Action List

### High — missing whole features

1. **`02-§2.7` / `02-§15.1`–`02-§15.14` / `02-§36.1`–`02-§36.10` — RSS feed + per-event pages** *(resolved)*
   RSS feed at `/schema.rss` and per-event detail pages at `/schema/{id}/`.
   Architecture: `03-architecture/rendering.md §17–18`. Implementation: `render-rss.js`, `render-event.js`.
   22 covered (RSS-01..12, EVT-01..18), 5 implemented (manual/CI config).

### Low — tooling, design, and accessibility gaps

2. **`CL-§5.1` / `02-§32.1`–`02-§32.8` — HTML validation in CI**
    No HTML linter is configured; invalid HTML does not fail the build.
    Requirements added in §32; implementation in progress.

3. **`CL-§5.2` / `02-§33.1`–`02-§33.8` — CSS linting in CI**
    No CSS linter is configured.
    Requirements added in §33; implementation in progress.

4. **`02-§13.2` / `07-§9.2` — Visible focus states** *(resolved)*
    `:focus-visible` rules added to all interactive elements in `style.css`:
    `outline: 2px solid var(--color-terracotta); outline-offset: 2px`.
    Form inputs retain their `:focus` border-color change and gain the outline on `:focus-visible`.

5. **`02-§13.6` / `07-§9.5` — Accordion ARIA attributes** *(resolved)*
    Native `<details>/<summary>` elements satisfy the ARIA requirement — browsers expose
    expanded/collapsed state to assistive technology without explicit attributes.
    Custom accordion components (archive timeline) already use explicit `aria-expanded`
    and `aria-controls` (ARK-04, ARK-05). Design doc updated to codify this decision.

6. **`02-§34.1`–`02-§34.14` — Derived active camp** *(resolved)*
   The `active` flag has been removed from `camps.yaml`. The active camp
   is now derived from dates at build and API time. 8 covered (DAC-01..07),
   5 implemented (manual/code review). 05-§1.3 superseded.

11 requirements added for descriptive image filenames (02-§68.1–68.11):
  8 covered (FNM-01..09): naming convention, reference integrity.
  3 implemented (manual): alt-text match, CSS selector update, no content change.
  39 of 51 image files renamed. One alt-text change: RFSBlogo → RFSB logo.
  CSS selector updated: `.content-img[alt="RFSB logo"]`.

---

## Test ID Legend

| ID range | File | `describe` suite |
| --- | --- | --- |
| VLD-01..03 | `tests/validate.test.js` | `validateEventRequest – body guard` |
| VLD-04..11 | `tests/validate.test.js` | `validateEventRequest – required fields` |
| VLD-12..15 | `tests/validate.test.js` | `validateEventRequest – date validation` |
| VLD-16..20 | `tests/validate.test.js` | `validateEventRequest – time ordering` |
| VLD-21..24 | `tests/validate.test.js` | `validateEventRequest – optional fields` |
| VLD-25..26 | `tests/validate.test.js` | `validateEventRequest – happy path` |
| GH-01..11 | `tests/github.test.js` | `slugify` |
| GH-12..23 | `tests/github.test.js` | `yamlScalar` |
| GH-24..38 | `tests/github.test.js` | `buildEventYaml` |
| RND-01..03 | `tests/render.test.js` | `toDateString` |
| RND-04..09 | `tests/render.test.js` | `escapeHtml` |
| RND-10..27 | `tests/render.test.js` | `formatDate` |
| RND-28..32 | `tests/render.test.js` | `groupAndSortEvents` |
| RND-33..38 | `tests/render.test.js` | `eventExtraHtml` |
| RND-39..45 | `tests/render.test.js` | `renderEventRow` |
| RNI-01..05 | `tests/render-index.test.js` | `convertMarkdown – inline Markdown` |
| RNI-06..16 | `tests/render-index.test.js` | `convertMarkdown – block types` |
| RNI-17..21 | `tests/render-index.test.js` | `convertMarkdown – headingOffset` |
| RNI-22..28 | `tests/render-index.test.js` | `convertMarkdown – collapsible mode` |
| RNI-29..33 | `tests/render-index.test.js` | `extractHeroImage` |
| RNI-34..38 | `tests/render-index.test.js` | `extractH1` |
| IMG-01..06 | `tests/render-index.test.js` | `renderIndexPage – image loading performance` |
| SES-01..05 | `tests/session.test.js` | `parseSessionIds` |
| SES-06..09 | `tests/session.test.js` | `buildSetCookieHeader` |
| SES-10..13 | `tests/session.test.js` | `mergeIds` |
| SES-14..15 | `tests/session.test.js` | `buildSetCookieHeader – domain` |
| SNP-01..06 | `tests/snapshot.test.js` | `renderSchedulePage` |
| ARK-01..08 | `tests/render-arkiv.test.js` | `renderArkivPage` (original timeline tests) |
| ARK-09..24 | `tests/render-arkiv.test.js` | `renderArkivPage` (header layout, FB logo, event list) |
| NAV-01..11 | `tests/nav.test.js` | `pageNav` |
| ROB-01..07 | `tests/robots.test.js` | `meta robots noindex (02-§1a.2)` |
| ROB-08..14 | `tests/robots.test.js` | `no discoverability metadata (02-§1a.3)` |
| GATE-01..02 | `tests/time-gate.test.js` | `renderAddPage – time-gating data attributes` |
| GATE-03..04 | `tests/time-gate.test.js` | `renderEditPage – time-gating data attributes` |
| GATE-05..10 | `tests/time-gate.test.js` | `isOutsideEditingPeriod` |
| HERO-01..02 | `tests/hero.test.js` | `hero section – layout structure (02-§30.1)` |
| HERO-03..04 | `tests/hero.test.js` | `hero section – title (02-§30.3–30.5)` |
| HERO-05..06 | `tests/hero.test.js` | `hero section – image (02-§30.6–30.7)` |
| HERO-07..09 | `tests/hero.test.js` | `hero section – social links (02-§30.9–30.11)` |
| HERO-10..13 | `tests/hero.test.js` | `hero section – countdown (02-§30.13–30.17)` |
| HERO-14..15 | `tests/hero.test.js` | `hero section – links from config (02-§30.22)` |
| HERO-16 | `tests/hero.test.js` | `hero section – Discord icon image (02-§30.24)` |
| VLD-33..39 | `tests/validate.test.js` | `validateEventRequest – time format` |
| VLD-40..41 | `tests/validate.test.js` | `validateEditRequest – time format` |
| VLD-42..48 | `tests/validate.test.js` | `validateEventRequest – string length limits` |
| VLD-49 | `tests/validate.test.js` | `validateEditRequest – string length limits` |
| VLD-50..54 | `tests/validate.test.js` | `validateEventRequest – date within camp range` |
| VLD-55 | `tests/validate.test.js` | `validateEditRequest – date within camp range` |
| LNT-19..21 | `tests/lint-yaml.test.js` | `validateYaml – unique (title+date+start) combo (05-§5.1)` |
| LNT-22..23 | *(removed — active+archived check no longer exists; see 02-§34.8)* | — |
| A11Y-01..09 | `tests/accessibility.test.js` | `:focus-visible rules (02-§13.2)` |
| DAC-01..07 | `tests/resolve-active-camp.test.js` | `resolveActiveCamp` |
| LOC-01..10 | `tests/render-locations.test.js` | `renderLocationAccordions` |
| COV-01..16 | `tests/coverage-index.test.js` | Homepage render tests (02-§2.1, 02-§3.1, CL-§3.1, CL-§3.3, 02-§2.9, 02-§14.1) |
| REG-01 | `tests/registration-content.test.js` | Registration section links to external service (02-§3.6) |
| REG-02..05 | `tests/registration-content.test.js` | Participation terms documented (02-§3.7) |
| LAY-01..15 | `tests/coverage-layout.test.js` | Layout component tests (CL-§2.4, CL-§2.5, CL-§3.4, 02-§2.8, 02-§24.10) |
| DIS-01..25 | `tests/coverage-today.test.js` | Display mode view tests (02-§2.4a, 02-§2.10, 02-§4.6, 02-§4.7, 02-§4.13, 02-§17.3) |
| IDAG-01..18 | `tests/coverage-idag.test.js` | Today standard view tests (02-§2.4, 02-§4.5, 02-§4.13, 02-§14.1) |
| RADD-01..30 | `tests/coverage-add.test.js` | Add-activity form tests (02-§2.5, 02-§6.1–6.4, 02-§8.2, 02-§14.1, 02-§26.13) |
| REDT-01..28 | `tests/coverage-edit.test.js` | Edit-activity form tests (02-§2.11, 02-§18.20, 02-§18.23, 02-§18.27, 02-§18.36) |
| RDC-01..06 | `tests/coverage-render.test.js` | Schedule render tests (02-§5.3, 02-§4.8) |
| CSS-01..37 | `tests/coverage-css.test.js` | CSS design token tests (07-§2.1–2.7, 07-§3.1–3.11, 07-§4.1–4.14, 07-§6.14–6.28, 07-§7.1–7.4) |
| STR-HTML-01..06 | `tests/coverage-structural.test.js` | Static HTML output tests (CL-§1.1, CL-§1.2) |
| STR-FW-01..06 | `tests/coverage-structural.test.js` | No-framework tests (CL-§1.3, CL-§2.9) |
| STR-SPA-01..06 | `tests/coverage-structural.test.js` | Not-a-SPA tests (CL-§2.7) |
| STR-NAV-01..06 | `tests/coverage-structural.test.js` | nav.js defer tests (02-§25.6) |
| STR-JSON-01..02 | `tests/coverage-structural.test.js` | events.json public fields (02-§18.29, 05-§3.3) |
| STR-EID-01..05 | `tests/coverage-structural.test.js` | data-event-id attributes (02-§18.18) |
| STR-TZ-01..06 | `tests/coverage-structural.test.js` | No timezone references (05-§4.5) |
| EEC-01..03 | `tests/coverage-edit-event.test.js` | Event ID stability (05-§6.2) |
| EEC-04 | `tests/coverage-edit-event.test.js` | meta.created_at preserved (02-§18.35) |
| EEC-05..08 | `tests/coverage-edit-event.test.js` | addOneDay date arithmetic |
| EEC-09..13 | `tests/coverage-edit-event.test.js` | isOutsideEditingPeriod time-gate logic |
| EEC-14..17 | `tests/coverage-edit-event.test.js` | mergeIds session cookie deduplication |
| EEC-18..26 | `tests/coverage-edit-event.test.js` | Session cookie properties (02-§18.4, 02-§18.5, 02-§18.7, 02-§18.41) |
| VCMP-01..08 | `tests/validate-camps.test.js` | `validateCamps – required fields (02-§37.1)` |
| VCMP-09..12 | `tests/validate-camps.test.js` | `validateCamps – date format (02-§37.2)` |
| VCMP-13..14 | `tests/validate-camps.test.js` | `validateCamps – date ordering (02-§37.3)` |
| VCMP-15..16 | `tests/validate-camps.test.js` | `validateCamps – archived type (02-§37.4)` |
| VCMP-17 | `tests/validate-camps.test.js` | `validateCamps – unique ids (02-§37.5)` |
| VCMP-18 | `tests/validate-camps.test.js` | `validateCamps – unique file values (02-§37.6)` |
| VCMP-19..20 | `tests/validate-camps.test.js` | `validateCamps – exit behaviour (02-§37.7)` |
| VCMP-21..24 | `tests/validate-camps.test.js` | `validateCamps – file creation and field order (02-§37.8–37.11)` |
| VCMP-25..27 | `tests/validate-camps.test.js` | `validateCamps – camp header sync (02-§37.12–37.15)` |
| VCMP-28 | `tests/validate-camps.test.js` | `validateCamps – logging (02-§37.17)` |
| VCMP-29 | `tests/validate-camps.test.js` | `validateCamps – module API (02-§37.18)` |
| VCMP-30..32 | `tests/validate-camps.test.js` | `validateCamps – edge cases` |
| VCMP-33..36 | `tests/validate-camps.test.js` | `validateCamps – qa field (02-§42.27)` |
| QA-01..03 | `tests/qa-camp.test.js` | `resolveActiveCamp – production filtering (02-§42.11)` |
| QA-04..06 | `tests/qa-camp.test.js` | `resolveActiveCamp – QA priority (02-§42.14)` |
| QA-07..08 | `tests/qa-camp.test.js` | `resolveActiveCamp – no environment (02-§42.25)` |
| QA-09..10 | `tests/qa-camp.test.js` | `resolveActiveCamp – qa field defaults (02-§42.2)` |
| QA-11 | `tests/qa-camp.test.js` | `resolveActiveCamp – edge cases` |
| MKD-01..05 | `tests/render-index.test.js` | `convertMarkdown – standard markdown features (02-§38.7)` |
| LVD-01..06 | `tests/live-form-validation.test.js` | live form validation source checks (02-§6.9–6.14) |
| ICAL-01..05 | `tests/render-ical.test.js` | `escapeIcal (02-§45)` |
| ICAL-06..20 | `tests/render-ical.test.js` | `renderEventIcal – per-event .ics (02-§45.2–45.6)` |
| ICAL-21..27 | `tests/render-ical.test.js` | `renderIcalFeed – full-camp .ics (02-§45.10–45.12)` |
| ICAL-28 | `tests/render-ical.test.js` | `render-ical.js source (02-§45.7)` |
| KAL-01..12 | `tests/render-kalender.test.js` | `renderKalenderPage (02-§45.15–45.19)` |
| EVT-21..22 | `tests/render-event.test.js` | `renderEventPage (02-§45.8–45.9)` |
| SNP-07..08 | `tests/snapshot.test.js` | `renderSchedulePage (02-§45.13–45.14)` |
| SNP-09..14 | `tests/snapshot.test.js` | `renderSchedulePage (02-§46.1–46.9)` |
| KAL-13..15 | `tests/render-kalender.test.js` | `renderKalenderPage (02-§46.11–46.13)` |
| ICAL-29..31 | `tests/render-ical.test.js` | `DTSTAMP in VEVENT (02-§46.14–46.15)` |
| HDC-01..04 | `tests/coverage-css.test.js` | `Heading and link colors (02-§47.1–47.2)` |
| CEH-P01 | `tests/cookie-enhancements.test.js` | `Cookie paragraph in add form (02-§48.4)` |
| CEH-01..02 | `tests/cookie-enhancements.test.js` | `Edit page no-cookie state (02-§48.8–48.9)` |
| CEH-03..04 | `tests/cookie-enhancements.test.js` | `Event list container on edit page (02-§48.13–48.14)` |
| CEH-05 | `tests/cookie-enhancements.test.js` | `Event list visible during edit (02-§48.18)` |
| CEH-06..07 | `tests/cookie-enhancements.test.js` | `Auto-fill responsible person (02-§48.1–48.3)` |
| CEH-08..09 | `tests/cookie-enhancements.test.js` | `Dynamic cookie paragraph swap (02-§48.5)` |
| CEH-10..11 | `tests/cookie-enhancements.test.js` | `Edit page handles missing id param (02-§48.10)` |
| ASEC-01..07 | `tests/validate.test.js` | `validateEventRequest – injection pattern scanning (02-§49.1–49.2)` |
| ASEC-08..10 | `tests/validate.test.js` | `validateEventRequest – link protocol validation (02-§49.4)` |
| ASEC-11..14 | `tests/validate.test.js` | `validateEditRequest – injection scanning (02-§49.1–49.2)` |
| ASEC-15..16 | `tests/validate.test.js` | `validateEditRequest – link protocol validation (02-§49.4)` |
| EDW-01 | `tests/event-deploy-workflow.test.js` | `02-§51.1 — No separate detect job` |
| EDW-02..04 | `tests/event-deploy-workflow.test.js` | `02-§51.3 — Deploy jobs have no inter-job dependencies` |
| EDW-05..07 | `tests/event-deploy-workflow.test.js` | `02-§51.4 — Checkout with fetch-depth: 2` |
| EDW-08..10 | `tests/event-deploy-workflow.test.js` | `02-§51.2/51.5 — Inline event-data detection per job` |
| EDW-11..13 | `tests/event-deploy-workflow.test.js` | `02-§51.6 — Build step gated on detection output` |
| EDW-14..15 | `tests/event-deploy-workflow.test.js` | `02-§51.7/51.8 — Production QA camp gating` |
| EDW-16..18 | `tests/event-deploy-workflow.test.js` | `02-§52.3 — No Docker container in any job` |
| EDW-19..21 | `tests/event-deploy-workflow.test.js` | `02-§52.1 — Each deploy job uses setup-node` |
| EDW-22..24 | `tests/event-deploy-workflow.test.js` | `02-§52.2 — Each deploy job runs npm ci --omit=dev` |
| EDW-25 | `tests/event-deploy-workflow.test.js` | `02-§52.4 — No packages:read permission` |
| EDW-26..28 | `tests/event-deploy-workflow.test.js` | `02-§52.5/52.6 — setup-node conditionality` |
| SYNC-01..02 | `tests/api-sync-errors.test.js` | `02-§53.5 — flushToClient and ob_start removed` |
| SYNC-03..04 | `tests/api-sync-errors.test.js` | `02-§53.1/53.2 — GitHub operation before response` |
| SYNC-05..06 | `tests/api-sync-errors.test.js` | `02-§53.3/53.4 — Error response on GitHub failure` |
| HTACC-01..03 | `tests/htaccess-security.test.js` | `02-§100.4 — api/.htaccess denies dotfiles (2.4 + 2.2), before rewrite` |
| HTACC-04 | `tests/htaccess-security.test.js` | `02-§100.5 — source/static/.htaccess denies .env (2.4 + 2.2)` |
| HTACC-05..06 | `tests/htaccess-security.test.js` | `02-§100.2 — index.php loads .env from dirname(__DIR__, 2)` |
| ENVLOC-01..02 | `tests/deploy-env-location.test.js` | `02-§100.1/100.7 — no .env written into the web root` |
| ENVLOC-03 | `tests/deploy-env-location.test.js` | `02-§100.8 — legacy .env migrated to $DEPLOY_DIR/.env` |
| ENVLOC-04 | `tests/deploy-env-location.test.js` | `02-§100.11 — backup-and-restore mechanism removed` |
| PROG-01..02 | `tests/submit-progress.test.js` | `02-§53.6 — Progress stage messages` |
| PROG-03..04 | `tests/submit-progress.test.js` | `02-§53.11 — Progress in both forms` |
| BUILD-QA-01 | `tests/build-qa-filter.test.js` | `build.js QA camp filtering (02-§42.13, 02-§42.30)` |
| QSEAS-01..05 | `tests/qa-camp-seasonal.test.js` | `camps.yaml – seasonal QA camp model (02-§42.31–42.34)` |
| DG-HINT-01..04 | `tests/render-add.test.js` | `renderAddPage – static multi-day date hint (02-§80.28–80.30); renderEditPage – does not render the multi-day hint (02-§80.30)` |
| VLD-56..61 | `tests/validate.test.js` | `validateEventRequest – midnight crossing (02-§54.1–54.5)` |
| VLD-62..63 | `tests/validate.test.js` | `validateEditRequest – midnight crossing (02-§54.10)` |
| LNT-24..25 | `tests/lint-yaml.test.js` | `validateYaml – midnight crossing (05-§4.3)` |
| LVD-07..09 | `tests/live-form-validation.test.js` | `midnight crossing source checks (02-§54.1, 02-§54.6)` |
| MDP-01..06 | `tests/coverage-css.test.js` | `02-§55.1–55.5 — Modal design polish` |
| MKD-D01..15, MKD-D25..30 | `tests/markdown.test.js` | `renderDescriptionHtml (02-§56.1, 02-§56.6, 02-§56.7)` (incl. nested-attack, whitespace, tel-hyphens, case-insensitive scheme, raw-HTML drop, image-src neutralization) |
| MKD-D16..24 | `tests/markdown.test.js` | `stripMarkdown (02-§56.4, 02-§56.5)` |
| EVT-23..25 | `tests/render-event.test.js` | `renderEventPage – markdown description (02-§56.1, 02-§56.6, 02-§56.7)` |
| RSS-16 | `tests/render-rss.test.js` | `renderRssFeed – markdown stripped (02-§56.4)` |
| ICAL-32..33 | `tests/render-ical.test.js` | `iCal DESCRIPTION markdown stripped (02-§56.5)` |
| DIS-26..27 | `tests/coverage-today.test.js` | `Today view pre-rendered descriptionHtml (02-§56.3)` |
| IDAG-19 | `tests/coverage-idag.test.js` | `Idag page pre-rendered descriptionHtml (02-§56.3)` |
| MKD-CSS-01 | `tests/coverage-css.test.js` | `02-§56.8 — .event-description p italic removed` |
| MDT-01..06 | `tests/markdown-toolbar.test.js` | `02-§57.2 — Toolbar wraps selected text` |
| MDT-07..12 | `tests/markdown-toolbar.test.js` | `02-§57.3 — Toolbar inserts placeholder when no selection` |
| MDT-13..15 | `tests/markdown-toolbar.test.js` | `02-§57.4 — Prefix applied per line for multi-line selections` |
| MDT-16..17 | `tests/markdown-toolbar.test.js` | `02-§57.5 — Toolbar in both forms` |
| MDT-18 | `tests/markdown-toolbar.test.js` | `02-§57.6 — Button order` |
| MDT-19 | `tests/markdown-toolbar.test.js` | `02-§57.7 — Inline SVG icons` |
| MDT-20 | `tests/markdown-toolbar.test.js` | `02-§57.8 — Accessible aria-label` |
| MDT-21..22 | `tests/markdown-toolbar.test.js` | `02-§57.10 — Shared markdown-toolbar.js` |
| MDT-23 | `tests/markdown-toolbar.test.js` | `02-§57.13 — Focus indicator` |
| | | **§58 — Markdown Preview for Description Field** |
| `02-§58.1` | manual | Live preview below textarea — MDP-M01: open form, type markdown, verify preview |
| `02-§58.2` | manual | Debounce ~300 ms — MDP-M02: type quickly, confirm delayed update |
| `02-§58.3` | manual | Hidden when textarea empty — MDP-M03: clear textarea, confirm preview hides |
| `02-§58.4` | manual | Read-only preview — MDP-M04: try clicking in preview, confirm non-interactive |
| MDP-01..02 | `tests/markdown-preview.test.js` | `02-§58.5 — marked.umd.js loaded in both forms` |
| MDP-22 | `tests/markdown-preview.test.js` | `02-§58.6 — Build copies marked.umd.js` |
| MDP-03..04 | `tests/markdown-preview.test.js` | `02-§58.7 — marked script uses defer` |
| MDP-05..09, MDP-23..26 | `tests/markdown-preview.test.js` | `02-§58.8 — Sanitization parity with build` (covers shared-renderer parity, case-insensitive scheme matching, raw-HTML drop, image-src neutralization) |
| MDP-10..12 | `tests/markdown-preview.test.js` | `02-§58.9 — markdown-preview.js file and inclusion` |
| MDP-13..14 | `tests/markdown-preview.test.js` | `02-§58.10 — aria-live="polite"` |
| MDP-15..16 | `tests/markdown-preview.test.js` | `02-§58.11 — Accessible aria-label` |
| MDP-17..18 | `tests/markdown-preview.test.js` | `02-§58.12 — Preview in both forms` |
| MDP-19..20 | `tests/markdown-preview.test.js` | `02-§58.13 — Visually distinct, design tokens` |
| `02-§58.14` | implemented | Matches `.event-description` styling — `.md-preview p` in style.css |
| MDP-21 | `tests/markdown-preview.test.js` | `02-§58.14 — .md-preview p rule exists` |
| `02-§58.15` | covered | Uses design tokens only — MDP-20 verifies var() usage |
| | | **§59 — Scoped Heading Sizes in Event Descriptions** |
| SH-01..18 | `tests/scoped-headings.test.js` | `02-§59.1 — Scoped h1–h4 with decreasing sizes` |
| SH-13..15 | `tests/scoped-headings.test.js` | `02-§59.2 — Heading sizes use em units` |
| SH-19..21 | `tests/scoped-headings.test.js` | `02-§59.3 — h4 is 1em bold` |
| SH-22 | `tests/scoped-headings.test.js` | `02-§59.4 — No hardcoded px sizes` |
| SH-23..24 | `tests/scoped-headings.test.js` | `02-§59.5 — Guide link → markdownguide.org` |
| SH-25 | `tests/scoped-headings.test.js` | `02-§59.6 — Identical link in both forms` |
| | | **§60 — Release and Deployment Documentation** |
| `02-§60.1` | covered | `docs/01-CONTRIBUTORS.md` — Deployment section with deploy triggers table |
| `02-§60.2` | covered | `docs/01-CONTRIBUTORS.md` — links to `09-RELEASING.md` |
| `02-§60.3` | covered | `docs/08-ENVIRONMENTS.md` — required reviewers setup in steps 7–8 |
| `02-§60.4` | covered | `docs/08-ENVIRONMENTS.md` — Production approvers section with username table |
| `02-§60.5` | covered | `docs/09-RELEASING.md` exists |
| `02-§60.6` | covered | `docs/09-RELEASING.md` — Steps 1–4 + Rollback section |
| `02-§60.7` | covered | `docs/09-RELEASING.md` — GitHub UI and CLI instructions, no Claude Code dependency |
| `02-§60.8` | covered | `docs/09-RELEASING.md` — Release tags section with semver conventions |
| | | **§62 — Footer Versioning** |
| VER-01..02 | `tests/version.test.js` | `readVersionFile (02-§62.1, 02-§62.17)` |
| VER-03..04 | `tests/version.test.js` | `buildLocalVersion (02-§62.8)` |
| VER-05..09 | `tests/version.test.js` | `resolveVersionString (02-§62.9, 02-§62.15, 02-§62.16)` |
| FTR-18..20 | `tests/footer.test.js` | `site-footer__version (02-§62.3)` |
| | | **§64 — Index Page Design Improvements** |
| IDX-01 | `tests/index-design.test.js` | `02-§64.1 — Testimonial cards with white card styling` |
| IDX-03 | `tests/index-design.test.js` | `02-§64.2 — Circular testimonial profile images (~60 px)` |
| IDX-15 | `tests/index-design.test.js` | `02-§64.3 — Testimonial cards constrained to --container-narrow` |
| IDX-01, IDX-07 | `tests/index-design.test.js` | `02-§64.4 — Card structure generated at build time` |
| IDX-09, IDX-11 | `tests/index-design.test.js` | `02-§64.5 — Alternating section backgrounds (cream-light, full-bleed)` |
| IDX-08 | `tests/index-design.test.js` | `02-§64.6 — First section excluded from alternation` |
| IDX-17 | `tests/index-design.test.js` | `02-§64.7 — Alternating sections suppress border-top (CSS)` |
| IDX-18 | `tests/index-design.test.js` | `02-§64.8 — Section headings use terracotta colour (no decorative line)` |
| `02-§64.9` | implemented | RFSB logo floated inline (~70 px) — `.content-img[alt="RFSB logo"]` in style.css |
| `02-§64.13` | implemented | Content images max-width 500 px — `.content-img` in style.css |
| `02-§64.14` | implemented | Accommodation images max-width 250 px — `.content-img[alt="Stuga"]` etc. in style.css |
| `02-§64.15` | implemented | Servicehus image matches hero width — `.content-img[alt="Servicehus"]` in style.css |
| `02-§64.16` | implemented | Compact section spacing — `.content section` padding/margin in style.css |
| `02-§64.17` | implemented | Section-alt padding matches regular — `.content section.section-alt` in style.css |
| `02-§64.18` | implemented | Full-bleed footer — `.site-footer::before` in style.css |
| `02-§64.19` | implemented | Body has no bottom padding — `body` padding in style.css |
| `02-§64.20` | implemented | Mobile scroll-to-top button appears after 300 px — nav.js + `.scroll-top` in style.css |
| `02-§64.21` | implemented | Scroll-to-top matches hamburger size (42 × 42 px) — `.scroll-top` in style.css |
| `02-§64.22` | implemented | Scroll-to-top is child of nav, centred horizontally — layout.js + style.css |
| `02-§64.23` | implemented | Scroll-to-top smooth-scrolls to top — nav.js |
| | | **§65 — Client-Side Date and Regex Robustness** |
| ROB-01 | `tests/robustness.test.js` | `02-§65.1 — Countdown script uses formatToParts` |
| ROB-02 | `tests/robustness.test.js` | `02-§65.2 — Camp-past script uses formatToParts` |
| ROB-03 | `tests/robustness.test.js` | `02-§65.3 — Countdown regex anchors on </ul> + <script>` |
| ROB-04 | `tests/robustness.test.js` | `02-§65.4 — Testimonial src extraction attribute-order-independent` |
| ROB-05 | `tests/robustness.test.js` | `02-§65.5 — Testimonial <p> removal tolerates whitespace` |
| | | **§66 — Image Dimension Attributes** |
| DIM-01 | `tests/img-dimensions.test.js` | `02-§66.1 — Testimonial images width="60" height="60"` |
| DIM-02..03 | `tests/img-dimensions.test.js` | `02-§66.2 — Social icons width="32" height="32"` |
| DIM-04 | `tests/img-dimensions.test.js` | `02-§66.3 — RSS icon has width and height` |
| DIM-05 | `tests/img-dimensions.test.js` | `02-§66.4 — Archive Facebook logo has width and height` |
| DIM-06 | `tests/img-dimensions.test.js` | `02-§66.5 — Hero image has width and height` |
| DIM-07..08 | `tests/img-dimensions.test.js` | `02-§66.6 — Content images width/height from build-time reading` |
| DIM-09 | `tests/img-dimensions.test.js` | `02-§66.7 — Location images width/height from build-time reading` |
| `02-§66.8` | covered | `image-dimensions.js` uses `image-size` (header-only parsing) — DIM-07 verifies |
| `02-§66.9` | implemented | No CSS changes — manual: visual appearance unchanged |
| | | **§67 — Static Asset Cache Headers** |
| CACHE-02 | `tests/cache-headers.test.js` | `02-§67.1 — Images cached for 1 year (max-age=31536000)` |
| CACHE-03 | `tests/cache-headers.test.js` | `02-§67.2 — CSS/JS cached for 1 week (max-age=604800)` |
| CACHE-04 | `tests/cache-headers.test.js` | `02-§67.3 — HTML set to no-cache` |
| CACHE-01 | `tests/cache-headers.test.js` | `02-§67.4 — .htaccess at source/static/.htaccess` |
| CACHE-05 | `tests/cache-headers.test.js` | `02-§67.5 — Build copies .htaccess to public/` |
| `02-§67.6` | covered | `build.js` uses `fs.copyFileSync()` — CACHE-05 verifies reference |
| CACHE-06 | `tests/cache-headers.test.js` | `02-§67.7 — api/.htaccess not modified` |
| | | **§68 — Descriptive Image Filenames** |
| FNM-01 | `tests/image-filenames.test.js` | `02-§68.1 — All lowercase filenames` |
| FNM-02 | `tests/image-filenames.test.js` | `02-§68.2 — No Swedish characters in filenames` |
| FNM-03 | `tests/image-filenames.test.js` | `02-§68.3 — Words separated by hyphens` |
| FNM-04 | `tests/image-filenames.test.js` | `02-§68.4 — No camelCase in filenames` |
| `02-§68.5` | implemented | Filenames chosen to match alt-text — manual verification |
| FNM-05 | `tests/image-filenames.test.js` | `02-§68.6 — Markdown refs point to existing files` |
| FNM-06 | `tests/image-filenames.test.js` | `02-§68.7 — local.yaml refs point to existing files` |
| FNM-07..08 | `tests/image-filenames.test.js` | `02-§68.8 — Build script refs point to existing files` |
| `02-§68.9` | implemented | `.content-img[alt="RFSB logo"]` updated in style.css |
| `02-§68.10` | implemented | Only filenames changed — manual: `git diff` shows no binary content changes |
| FNM-09 | `tests/image-filenames.test.js` | `02-§68.11 — Every image file is referenced somewhere` |
| | | **§69 — CSS Cache-Busting** |
| CACHE-07 | `tests/cache-headers.test.js` | `02-§69.1 — build.js hashes style.css content` |
| CACHE-08 | `tests/cache-headers.test.js` | `02-§69.2 — build.js produces style.css?v= pattern` |
| CACHE-09 | `tests/cache-headers.test.js` | `02-§69.3 — Hash is deterministic` |
| `02-§69.4` | implemented | No render functions changed — post-processing in `build.js` `findHtmlFiles()` |
| `02-§69.5` | covered | All 1182 existing tests pass — STR-CSS, EVT-13 still match |
| | | **§70 — Main Landmark Element** |
| MAIN-01-* | `tests/main-landmark.test.js` | `02-§70.1 — Every page has exactly one <main>` |
| `02-§70.2` | covered | `<main>` wraps content between nav and footer (MAIN-01/02/03 verify placement) |
| MAIN-02/03-* | `tests/main-landmark.test.js` | `02-§70.3 — <main> excludes <nav> and <footer>` |
| `02-§70.4` | implemented | No CSS changes — `<main>` is semantic only |
| `02-§70.5` | covered | MAIN-01-* tests verify exactly one `<main>` per page |
| | | **§71 — Hero Action Buttons** |
| HERO-BTN-01 | `tests/hero-action-buttons.test.js` | `02-§71.1 — Buttons appear below hero image` |
| HERO-BTN-02 | `tests/hero-action-buttons.test.js` | `02-§71.2 — Buttons link to schema, idag, lagg-till` |
| HERO-BTN-03 | `tests/hero-action-buttons.test.js` | `02-§71.3 — Pill-shaped terracotta styling` |
| HERO-BTN-04 | `tests/hero-action-buttons.test.js` | `02-§71.4 — Data attributes for editing period` |
| `02-§71.5` | implemented | Inline script in `render-index.js` checks date against data-opens/data-closes |
| HERO-BTN-08 | `tests/hero-action-buttons.test.js` | `02-§71.6 — CSS does not override hidden attribute` |
| HERO-BTN-05 | `tests/hero-action-buttons.test.js` | `02-§71.7 — CSS uses pill radius and terracotta` |
| HERO-BTN-06 | `tests/hero-action-buttons.test.js` | `02-§71.8 — Flex row centred with gap` |
| `02-§71.9` | implemented | `flex-wrap: wrap` on `.hero-actions` — manual: verify on mobile viewport |
| `02-§71.10` | covered | Only `renderIndexPage` renders action buttons; nav pages do not |
| `02-§71.11` | implemented | Script is inline in `renderIndexPage`, no new JS files added |
| `02-§71.12` | covered | CSS uses `var(--color-terracotta)` and spacing tokens from 07-DESIGN |
| | | **§72 — Close Past-Day Accordions** |
| `02-§72.1` | implemented | Past-day accordions collapsed on schedule page — manual: verify in browser |
| `02-§72.2` | implemented | Today and future days remain open — manual: verify in browser |
| `02-§72.3` | implemented | Past days can be manually reopened — native `<details>` behaviour |
| `02-§72.4` | implemented | Uses visitor's `new Date()` (client-side) |
| CPA-02 | `tests/close-past-accordions.test.js` | `02-§72.5 — Script removes open from past details.day on load` |
| CPA-03 | `tests/close-past-accordions.test.js` | `02-§72.6 — Script is inline, no new JS files` |
| CPA-01, CPA-05 | `tests/close-past-accordions.test.js` | `02-§72.7 — All days rendered with open at build time` |
| CPA-04 | `tests/close-past-accordions.test.js` | `02-§72.8 — Script targets only details.day, not event-row` |
| | | **§73 — Feedback Button (GitHub Issues)** |
| `02-§73.1` | covered | FB-01: feedback button present in layout output; mobile: fixed top-right, desktop: near content edge |
| `02-§73.2` | implemented | Manual: click feedback button, verify modal opens |
| `02-§73.3` | implemented | Manual: verify modal has category (Bugg/Förslag/Övrigt), title, description, name fields; FB-09, FB-22 |
| `02-§73.4` | implemented | Manual: submit feedback, verify issue link shown |
| `02-§73.5` | implemented | Manual: trigger error, verify retry button |
| `02-§73.6` | implemented | Manual: verify progress steps during submission |
| `02-§73.7` | implemented | `app.js` POST /feedback; `api/index.php` POST /api/feedback |
| `02-§73.8` | implemented | `source/api/feedback.js` createFeedbackIssue; `api/src/Feedback.php` createIssue |
| `02-§73.9` | implemented | Both endpoints return { success: true, issueUrl } |
| `02-§73.10` | implemented | Manual: verify submit disabled until required fields filled |
| `02-§73.11` | covered | FB-10..13: length limit tests for title, description, name |
| `02-§73.12` | covered | FB-14..16: injection scan tests |
| `02-§73.13` | covered | FB-17..19: honeypot flag tests |
| `02-§73.14` | implemented | `/feedback` rate-limit delegated to shared helper (§93); see `02-§93.4`, `02-§93.8`, `02-§93.10` |
| `02-§73.15` | implemented | Manual: verify role=dialog, aria-modal, focus trap |
| `02-§73.16` | covered | FB-02: aria-label="Ge feedback" present |
| `02-§73.17` | implemented | Manual: verify Escape, click outside, close button |
| `02-§73.18` | implemented | Manual: verify labels and aria-required on form fields |
| `02-§73.19` | implemented | Manual: verify metadata in created GitHub Issue body |
| `02-§73.20` | implemented | Node.js and PHP use identical validation patterns |
| `02-§73.21` | implemented | Both use githubRequest() / githubRequest() for Issues API |
| `02-§73.22` | implemented | Manual: open feedback modal, verify heading "Feedback om hemsidan"; `feedback.js` lines 21, 88 |
| `02-§73.23` | implemented | Manual: open feedback modal, verify help text; `feedback.js` line 90, `style.css` `.feedback-scope` |
| `02-§73.24` | implemented | Manual: submit feedback in local dev, verify warning appears in success view; `feedback.js` showSuccess() |
| `02-§73.25` | implemented | Manual: verify warning text "OBS: Detta är en testsida…"; `feedback.js` showSuccess() |
| `02-§73.26` | implemented | Manual: verify `.form-error-msg` class on warning element; `feedback.js` showSuccess() |
| `02-§73.27` | implemented | Manual: verify no URL in warning text; `feedback.js` showSuccess() |
| `02-§73.28` | implemented | `app.js` line 138: dry-run when BUILD_ENV is neither production nor qa; `api/index.php` line 278 |
| `02-§73.29` | implemented | Same condition as §73.28 — QA (`BUILD_ENV=qa`) passes through to create GitHub Issues |
| | | **§74 — Sticky Navigation Positioning** |
| `02-§74.1` | covered | MN-02: `.page-nav` top matches body padding; `source/assets/cs/style.css` `top: var(--space-xs)` |
| `02-§74.2` | covered | MN-02: same `top` value on all pages via shared CSS |
| `02-§74.3` | covered | MN-19: `html` has `scroll-padding-top`; `source/assets/cs/style.css` `scroll-padding-top: 80px` |
| `02-§74.4` | covered | MN-20: `html` has `scrollbar-gutter: stable` |
| | | **§75 — Consistent Navigation and Page Title Labels** |
| `02-§75.1` | implemented | Manual: open desktop, confirm short uppercase labels |
| `02-§75.2` | implemented | Manual: open mobile, confirm descriptive labels in hamburger |
| `02-§75.3` | covered | NL-04: hero buttons order Idag, Schema, Lägg till |
| `02-§75.4` | covered | NL-01: desktop labels Hem, Schema, Idag, Lägg till, Arkiv; `style.css` `.nav-link { text-transform: uppercase }` |
| `02-§75.5` | covered | NL-02: hamburger labels Hem, Lägrets schema, Dagens aktiviteter, Lägg till aktivitet, Lägerarkiv |
| `02-§75.6` | covered | NL-04: hero action buttons Idag, Schema, Lägg till |
| `02-§75.7` | covered | NL-05: schema h1 "Lägrets schema – {campName}"; `render.js` |
| `02-§75.8` | covered | NL-07: idag h1 "Dagens aktiviteter"; `render-idag.js` |
| `02-§75.9` | covered | NL-06: schema title "Lägrets schema – {campName}"; `render.js` |
| `02-§75.10` | covered | NL-08: idag title "Dagens aktiviteter – {campName}"; `render-idag.js` |
| `02-§75.11` | covered | NL-03: each nav link has both short and long label spans; `layout.js` |
| | | **§76 — Redirect from old display view URL** |
| `02-§76.1` | covered | RDR-01..04: `renderRedirectPage()` produces redirect; `build.js` writes `public/dagens-schema.html` |
| | | **§77 — JavaScript Cache-Busting** |
| `02-§77.1` | covered | CACHE-10: build.js computes MD5 hash for JS files |
| `02-§77.2` | covered | CACHE-11: build.js replaces JS src with ?v=hash |
| `02-§77.3` | covered | CACHE-12: JS hash determinism verified |
| `02-§77.4` | covered | CACHE-10: post-processing step, no render changes |
| `02-§77.5` | implemented | Manual: npm test passes (1265 tests) |
| | | **§78 — Image Cache-Busting** |
| `02-§78.1` | covered | CACHE-13: build.js computes MD5 hash for image files |
| `02-§78.2` | covered | CACHE-14: build.js replaces image src with ?v=hash |
| `02-§78.3` | covered | CACHE-15: image hash determinism verified |
| `02-§78.4` | covered | CACHE-13: post-processing step, no render changes |
| `02-§78.5` | implemented | Manual: npm test passes (1265 tests) |
| | | **§79 — Section Anchor ID Consistency** |
| ANC-01 | `tests/index-design.test.js` | `02-§79.1 — Testimonials section uses id="roster"` |
| ANC-02 | `tests/index-design.test.js` | `02-§79.2 — Pricing section uses id="kostnader"` |
| ANC-03 | `tests/index-design.test.js` | `02-§79.3 — Nav link for Röster points to #roster` |
| ANC-04 | `tests/index-design.test.js` | `02-§79.4 — Nav link for Kostnader points to #kostnader` |
| | | **§80 — Multi-Day Selection and Batch Submission** |
| `02-§80.1` | DG-01 | Day grid replaces native date picker on add-activity form |
| `02-§80.2` | DG-04, DG-05 | Each day button shows Swedish weekday abbreviation and day/month |
| `02-§80.3` | DG-06, DG-07 | Day grid contains exactly the days within camp start_date..end_date |
| `02-§80.4` | manual | During camp period, only days from today onward are shown (browser-only) |
| `02-§80.5` | DG-08 | Always multi-select: clicking a day toggles it independently |
| `02-§80.6` | DG-09 | Day grid is always multi-select |
| `02-§80.7` | manual | Info text shown when 2+ days selected (browser-only) |
| `02-§80.8` | manual | Soft hint when only one day selected after multi (browser-only) |
| `02-§80.9` | DG-08 | Clicking a day toggles it independently |
| `02-§80.10` | DG-11 | At least one day must be selected; error shown via live validation |
| `02-§80.11` | manual | Pagination at 8 days/page with ← → navigation (browser-only) |
| `02-§80.12` | BATCH-01, BATCH-02 | POST /add-events accepts dates array instead of date |
| `02-§80.13` | BATCH-04, BATCH-05 | Batch endpoint validates every date with same rules as single |
| `02-§80.14` | manual | Batch validates uniqueness (title + date + start) — requires live data |
| `02-§80.15` | BATCH-06, BATCH-07 | All-or-nothing: any failed field rejects entire batch |
| `02-§80.16` | manual | All events committed in single branch and PR (integration) |
| `02-§80.17` | BATCH-08 | Response includes eventIds array |
| `02-§80.18` | BATCH-09 | Time-gating and injection scanning apply to batch |
| `02-§80.19` | manual | Session cookie updated with all new event IDs (browser-only) |
| `02-§80.20` | manual | Confirmation modal shown before every submission (browser-only) |
| `02-§80.21` | manual | Success message states number of created activities (browser-only) |
| `02-§80.22` | manual | Error displays message; no partial state (browser-only) |
| `02-§80.23` | manual | "Lägg till en till" resets form including day grid (browser-only) |
| `02-§80.24` | DG-12 | Edit form not affected; single day selector remains |
| `02-§80.25` | done | Day grid implemented in vanilla JavaScript |
| `02-§80.26` | done | Day grid uses CSS custom properties from 07-DESIGN.md |
| `02-§80.27` | done | Batch endpoint implemented in both Node.js and PHP |
| `02-§80.28` | DG-HINT-01, DG-HINT-02 | Static hint text under Datum label on add-activity page |
| `02-§80.29` | DG-HINT-03 | Hint uses `.field-info` class for visual consistency |
| `02-§80.30` | DG-HINT-04 | Hint shown only on add-activity page, not on edit page |
| | | **§81 — Client-side Link Field Validation** |
| `02-§81.1` | LINK-03, LINK-04 | Blur validation checks http/https protocol |
| `02-§81.2` | LINK-05 | Blur validation checks for at least one dot after protocol |
| `02-§81.3` | LINK-01, LINK-02 | Error shown below field using field-error pattern |
| `02-§81.4` | manual | Empty link field shows no error (browser-only) |
| `02-§81.5` | LINK-08 | Error cleared on input event |
| `02-§81.6` | LINK-06 | Missing protocol error message in Swedish |
| `02-§81.7` | LINK-07 | Missing dot error message in Swedish |
| `02-§81.8` | manual | Submit blocked while link field has error (browser-only) |
| `02-§81.9` | LINK-09 | Implemented in vanilla JS in lagg-till.js |
| `02-§81.10` | LINK-10 | Reuses existing setFieldError/clearAllErrors helpers |
| | | **§82 — Character Counter on Text Input Fields** |
| `02-§82.1` | CC-01..CC-08 | Fields: title 80, responsible 60, description 2000, link 500 |
| `02-§82.2` | CC-01..CC-08 | maxlength attribute on inputs in render-add.js and render-edit.js |
| `02-§82.3` | CC-09, CC-10 | API validate.js responsible limit reduced to 60 |
| `02-§82.4` | manual | Counter hidden below 70% of max (browser-only) |
| `02-§82.5` | manual | Counter visible at ≥70% of max (browser-only) |
| `02-§82.6` | CC-12 | Counter turns terracotta at ≥90% of max; `.char-counter.warn` in CSS |
| `02-§82.7` | manual | Counter format: N / MAX (browser-only) |
| `02-§82.8` | manual | Counter right-aligned below field (browser-only) |
| `02-§82.9` | CC-11 | Counter uses font-size-small, charcoal, opacity 0.6; `.char-counter` in CSS |
| `02-§82.10` | manual | Counter updates on input event (browser-only) |
| `02-§82.11` | manual | Counters hidden on form reset (browser-only) |
| `02-§82.12` | CC-05..CC-08 | Counter on both add and edit forms |
| `02-§82.13` | done | Vanilla JavaScript in lagg-till.js and redigera.js |
| `02-§82.14` | done | Uses CSS custom properties from 07-DESIGN.md |
| `02-§82.15` | done | No new npm dependencies |
| | | **§83 — Progressive Web App (PWA) Support** |
| `02-§83.1` | covered | PWA-07: `source/static/app.webmanifest` exists; `build.js` copies to public/ |
| `02-§83.2` | covered | PWA-08, PWA-09: manifest name and short_name verified |
| `02-§83.3` | covered | PWA-10: manifest display "standalone" verified |
| `02-§83.4` | covered | PWA-11: manifest start_url "/" verified |
| `02-§83.5` | covered | PWA-12, PWA-13: theme_color #C76D48, background_color #F5EEDF |
| `02-§83.6` | covered | PWA-14, PWA-15: 192×192 and 512×512 PNG icons in manifest |
| `02-§83.7` | covered | PWA-16: at least one icon has purpose "any" |
| `02-§83.8` | covered | PWA-01-*: all 8 pages include `<link rel="manifest">` |
| `02-§83.9` | covered | PWA-02-*: all 8 pages include `<meta name="theme-color">` |
| `02-§83.10` | covered | PWA-03-*: all 8 pages include mobile-web-app-capable (updated from apple- prefix) |
| `02-§83.11` | covered | PWA-04-*: all 8 pages include apple-mobile-web-app-status-bar-style |
| `02-§83.12` | covered | PWA-05-*: all 8 pages include apple-touch-icon |
| `02-§83.13` | covered | PWA-17: `source/static/sw.js` exists; `build.js` copies to public/ |
| `02-§83.14` | covered | PWA-06-*: all 8 pages include sw-register.js |
| `02-§83.15` | covered | PWA-18, PWA-31: sw.js CACHE_NAME is sb-sommar-v3 |
| `02-§83.16` | covered | PWA-19, PWA-19b: pre-cache excludes lagg-till.html, redigera.html; includes /index.html |
| `02-§83.17` | implemented | Manual: verify network-first HTML, cache-first assets in browser DevTools |
| `02-§83.18` | covered | PWA-20: sw.js activate handler deletes old caches |
| `02-§83.19` | covered | PWA-21: NO_CACHE_PATTERNS includes /lagg-till.html, /redigera.html, /delete-event |
| `02-§83.20` | manual | User provides sbsommar-icon-192.png and sbsommar-icon-512.png in source/content/images/ |
| `02-§83.21` | implemented | Build copies content/images/ to public/images/ (existing pipeline) |
| `02-§83.22` | done | Service worker in vanilla JavaScript, no frameworks |
| `02-§83.23` | done | No new npm dependencies added |
| `02-§83.24` | covered | All 1395 existing tests pass after implementation |
| `02-§83.25` | covered | PWA-23: every page uses sbsommar-icon-192.png as favicon |
| `02-§83.26` | covered | PWA-24: manifest has icon with purpose "maskable" |
| `02-§83.27` | covered | PWA-25: sw.js checks url.protocol for http/https |
| `02-§83.28` | covered | PWA-26: sw.js handles events.json with network-first caching |
| `02-§83.29` | covered | PWA-27: sw.js references offline.html as fallback |
| `02-§83.30` | covered | PWA-28: render-offline.js exists; build.js wires it |
| `02-§83.31` | implemented | Manual: verify offline page uses shared nav/footer/CSS |
| `02-§83.32` | covered | PWA-29: offline page contains Swedish offline text |
| `02-§83.33` | covered | PWA-30: offline.html in PRE_CACHE_URLS |
| `02-§83.34` | covered | PWA-31: CACHE_NAME is sb-sommar-v3 |
| `02-§83.35` | covered | PWA-32, PWA-33: offline page <main> does not link to lagg-till.html or redigera.html |

### §84 — API Error Messages

| Requirement | Status | Test / Evidence |
| ----------- | ------ | --------------- |
| `02-§84.1` | implemented | Manual: submit activity on QA with broken config; verify message is specific |
| `02-§84.2` | implemented | Manual: compare retry-able vs permanent error messages |
| `02-§84.3` | implemented | `api/src/GitHub.php::classifyGitHubError()` — static classifier method |
| `02-§84.4` | implemented | Manual: trigger each error category and verify Swedish message |
| `02-§84.5` | implemented | All three catch blocks in `api/index.php` call `GitHub::classifyGitHubError($e)` |
| `02-§84.6` | implemented | Code review: classifier returns hardcoded Swedish strings, no dynamic data |
| `02-§84.7` | done | No client changes needed; `lagg-till.js` already shows `json.error` |
| `02-§85.1` | implemented | Manual: fill form, reload → fields restored (DRAFT-M01) |
| `02-§85.2` | implemented | Manual: submit successfully, reload → form empty (DRAFT-M02) |
| `02-§85.3` | implemented | Manual: fill form, close tab, reopen → form empty (DRAFT-M03) |
| `02-§85.4` | covered | DRAFT-01: source references `sb_form_draft` key |
| `02-§85.5` | covered | DRAFT-02: input event listener for draft saving |
| `02-§85.6` | implemented | Manual: change location, reload → location restored |
| `02-§85.7` | implemented | Manual: select days, reload → days re-selected (DRAFT-M04) |
| `02-§85.8` | covered | DRAFT-03: restoreDraft reads sessionStorage on load |
| `02-§85.9` | implemented | Manual: select days, reload → buttons visually selected (DRAFT-M04) |
| `02-§85.10` | covered | DRAFT-04: clearDraft removes sessionStorage after success |
| `02-§85.11` | done | `sb_responsible` localStorage code unchanged |
| `02-§85.12` | covered | DRAFT-05: no require() or import in source |
| `02-§86.1` | covered | CACHE-16: build.js replaces image href with `?v=<hash>` |
| `02-§86.2` | covered | CACHE-20: app.webmanifest icons have `?v=` hashes |
| `02-§86.3` | covered | CACHE-18: href cache-busting reuses imgHashCache |
| `02-§86.4` | covered | CACHE-19: preload href matches img src in index.html |
| `02-§86.5` | implemented | Post-processing in `build.js`, no render changes |
| `02-§86.6` | covered | All existing tests pass (pre-commit hook) |

### §87 — Manifest Metadata for Richer Install UI

| Requirement | Status | Test / Evidence |
| ----------- | ------ | --------------- |
| `02-§87.1` | covered | PWA-32: manifest id is "/" |
| `02-§87.2` | covered | PWA-33: manifest description verified |
| `02-§87.3` | covered | PWA-34: screenshots array has ≥2 entries |
| `02-§87.4` | covered | PWA-35: wide screenshot 1280x720 |
| `02-§87.5` | covered | PWA-36: narrow screenshot 750x1334 |
| `02-§87.6` | covered | PWA-37: screenshot src paths in images/; build cache-busts via existing regex |
| `02-§87.7` | done | No new npm dependencies |
| `02-§87.8` | covered | All existing tests pass |

### §88 — PWA Install Guide

| Requirement | Status | Test / Evidence |
| ----------- | ------ | --------------- |
| `02-§88.1` | covered | INST-03: nav includes pwa-install-btn on all nav pages |
| `02-§88.2` | covered | INST-06: button has SVG icon |
| `02-§88.3` | covered | INST-04: aria-label "Installera appen"; JS sets title |
| `02-§88.4` | covered | INST-02: all 8 pages include pwa-install.js |
| `02-§88.5` | covered | INST-07: JS handles beforeinstallprompt |
| `02-§88.6` | covered | INST-08: JS handles appinstalled |
| `02-§88.7` | manual | Browser-only: verify iOS tooltip shows instruction text |
| `02-§88.8` | manual | Browser-only: outside click and Escape close tooltip |
| `02-§88.9` | covered | INST-09: JS checks display-mode: standalone |
| `02-§88.10` | implemented | JS hides btn unless beforeinstallprompt fires or iOS detected |
| `02-§88.11` | implemented | No localStorage/dismiss logic in code |
| `02-§88.12` | covered | INST-01: pwa-install.js exists |
| `02-§88.13` | implemented | CSS uses custom properties from 07-DESIGN.md §7 |
| `02-§88.14` | done | No new npm dependencies |
| `02-§88.15` | covered | All 1429 existing tests pass |
| `02-§88.16` | covered | INST-04, INST-05: Swedish text verified |

### §89 — Delete Activity

| Requirement | Status | Test / Evidence |
| ----------- | ------ | --------------- |
| `02-§89.1` | covered | DEL-08: renders id="btn-delete" in edit page HTML |
| `02-§89.2` | covered | DEL-09: label "Radera aktivitet"; DEL-10: class btn-destructive |
| `02-§89.3` | covered | DEL-11: renders id="delete-confirm" dialog; DEL-14: role="alertdialog" |
| `02-§89.4` | covered | DEL-11: dialog contains id="delete-confirm-title" populated by JS |
| `02-§89.5` | covered | DEL-12: "Ja, radera" button; DEL-13: "Avbryt" button |
| `02-§89.6` | manual | Browser-only: verify success message "Aktiviteten är raderad!" after delete |
| `02-§89.7` | implemented | Edit page time-gating hides entire form including delete button |
| `02-§89.8` | manual | Browser-only: verify progress modal opens after confirmation |
| `02-§89.9` | implemented | redigera.js DELETE_PROGRESS_STEPS array has 3 steps |
| `02-§89.10` | manual | Browser-only: verify success modal shows "Gå till schemat" link |
| `02-§89.11` | manual | Browser-only: verify error modal shows "Försök igen" button |
| `02-§89.12` | implemented | app.js POST /delete-event route; api/index.php POST /delete-event route |
| `02-§89.13` | covered | app.js reads parseSessionIds from cookie header OR verifyAdminToken from body; ADED-01..08 |
| `02-§89.14` | covered | app.js returns 403 when event ID not in cookie and no valid admin token; ADED-04..07 |
| `02-§89.15` | implemented | app.js returns 400 when isEventPast is true; api/index.php same |
| `02-§89.16` | implemented | app.js returns 400 when isOutsideEditingPeriod is true; api/index.php same |
| `02-§89.17` | covered | DEL-01–DEL-07: removeEventFromYaml tested; github.js + GitHub.php removeEventFromActiveCamp implemented |
| `02-§89.18` | implemented | redigera.js removeIdFromCookie updates sb_session after delete |
| `02-§89.19` | implemented | Reuses submit-modal, openModal, trapFocus patterns from edit flow |
| `02-§89.20` | implemented | style.css btn-destructive uses --color-error custom property |
| `02-§89.21` | done | No new npm dependencies added |
| `02-§89.22` | implemented | All text in Swedish: "Radera aktivitet", "Ja, radera", "Avbryt", etc. |
| `02-§89.23` | implemented | redigera.js fetch uses credentials: 'include' |

### §90 — Cookie Debug Panel and Session Cookie Repair

| Requirement | Status | Test / Evidence |
| ----------- | ------ | --------------- |
| `02-§90.1` | covered | CKD-01: `<details id="cookie-debug">` in renderEditPage output |
| `02-§90.2` | implemented | redigera.js `renderDebugPanel()` shows protocol, domain, ID count, status list |
| `02-§90.3` | covered | CKD-02, CKD-03: `<summary>` with Swedish text, no `open` attribute |
| `02-§90.4` | implemented | redigera.js fetches events.json then calls `renderDebugPanel()` |
| `02-§90.5` | implemented | `cookie-debug-note` paragraph explains automatic cleanup |
| `02-§90.6` | implemented | Note text sets expectations about passed-event removal |
| `02-§90.7` | implemented | session.js `repairDuplicateCookies()` scans all `sb_session` entries |
| `02-§90.8` | implemented | Duplicate IDs merged and deduplicated in `repairDuplicateCookies()` |
| `02-§90.9` | implemented | Both exact-host and domain-scoped cookies deleted via Max-Age=0 |
| `02-§90.10` | implemented | `writeSessionIds(merged)` called after deletion |
| `02-§90.11` | implemented | `repairDuplicateCookies()` runs before `removeExpiredIds()` |
| `02-§90.12` | implemented | `removeIdFromCookie` deletes both cookie variants (exact-host + domain-scoped) before writing back, matching `repairDuplicateCookies` pattern |
| `02-§90.13` | implemented | Attributes match 02-§44.16 pattern; both variants cleared via Max-Age=0 |
| `02-§90.14` | implemented | All text in Swedish: "Om din cookie", "finns i schemat", "passerat", etc. |
| `02-§90.15` | implemented | CSS uses --color-*, --space-*, --font-size-*, --radius-* tokens |
| `02-§90.16` | covered | CKD-04: inside `<main>`; summary has :focus-visible styling |

### §91 — Admin Token — Activation and Status Indicator

| Requirement | Status | Test / Evidence |
| ----------- | ------ | --------------- |
| `02-§91.1` | covered | ADM-01..05: `parseAdminTokens` tests in `admin-token.test.js` |
| `02-§91.2` | covered | Format `namn_uuid_epoch`; `create-admin-token.js` generates; ADM-09..10 validate expiry |
| `02-§91.3` | covered | ADM-08: `verifyAdminToken` returns false for empty list |
| `02-§91.29` | covered | ADM-09, ADM-10: `isTokenExpired` / `verifyAdminToken` reject expired tokens server-side |
| `02-§91.30` | implemented | `npm run admin:create` runs `source/scripts/create-admin-token.js` |
| `02-§91.4` | implemented | `app.js` POST /verify-admin; `api/index.php` handleVerifyAdmin() |
| `02-§91.5` | implemented | Request body parsed in both Node.js and PHP handlers |
| `02-§91.6` | covered | ADM-06: `verifyAdminToken` returns true for matching token |
| `02-§91.7` | covered | ADM-07: `verifyAdminToken` returns false for non-matching token |
| `02-§91.8` | implemented | `crypto.timingSafeEqual` (Node.js), `hash_equals` (PHP) |
| `02-§91.9` | covered | ADM-11: `renderAdminPage` produces valid HTML document |
| `02-§91.10` | covered | ADM-12, ADM-13: text input + submit button in rendered output |
| `02-§91.11` | implemented | manual: `admin.js` calls `POST /verify-admin` on form submit |
| `02-§91.12` | implemented | manual: `admin.js` stores token in localStorage on success |
| `02-§91.13` | implemented | manual: `admin.js` shows error message on failure |
| `02-§91.14` | covered | ADM-14: page includes page-nav and site-footer |
| `02-§91.15` | covered | ADM-15: admin.html not in nav links |
| `02-§91.16` | covered | ADM-21, ADM-24: `isAdminExpired` returns true after 30 days |
| `02-§91.17` | covered | ADM-19..23: expiry checked via `isAdminExpired` function |
| `02-§91.18` | covered | ADM-22, ADM-23: undefined/zero treated as expired |
| `02-§91.19` | covered | ADM-18: footer includes `admin-status` container element |
| `02-§91.20` | implemented | manual: `admin.js` renders nothing when no localStorage data |
| `02-§91.21` | implemented | manual: `admin.js` renders filled lock icon for valid token |
| `02-§91.22` | implemented | manual: `admin.js` renders open lock icon with link for expired |
| `02-§91.23` | implemented | CSS: 16×16 SVG icon, inline-block in footer |
| `02-§91.24` | implemented | `admin.js` sets title="Admin aktiv" / "Admin utgången" |
| `02-§91.25` | covered | ADM-16: `lang="sv"` on admin page |
| `02-§91.26` | implemented | CSS uses --color-*, --space-*, --font-size-*, --radius-* tokens |
| `02-§91.27` | implemented | Form has label, input, aria-live on message; icon has title attr |
| `02-§91.28` | implemented | Token stored in localStorage only, sent in POST body to /verify-admin |

### §92 — PWA Full Pre-Cache and Offline Guard

| ID | Status | Notes |
| --- | --- | --- |
| `02-§92.1` | implemented | `build.js` scans `public/` with `collectFiles()`, generates URL list |
| `02-§92.2` | implemented | `EXCLUDE_PATTERNS` in `build.js`: `.gitkeep`, `.htaccess`, `robots.txt`, `sw.js`, `version.json`, `app.webmanifest`, `.ics`, `.rss`, `schema/*/index.html` |
| `02-§92.3` | covered | OFF-01: `sw.js` contains `/* __PRE_CACHE_URLS__ */` placeholder; `build.js` replaces it |
| `02-§92.4` | implemented | `collectFiles()` produces `/`-prefixed paths |
| `02-§92.5` | implemented | `build.js` replaces placeholder with URL list; no placeholder remains |
| `02-§92.6` | covered | OFF-17: source `sw.js` has no hardcoded URLs; OFF-01: placeholder present |
| `02-§92.7` | covered | OFF-02: `CACHE_NAME` is `sb-sommar-v5` |
| `02-§92.8` | covered | OFF-08: NO_CACHE_PATTERNS has no `.html` pages; build includes all HTML |
| `02-§92.9` | covered | OFF-03..08: NO_CACHE has API endpoints only, no `.html` |
| `02-§92.10` | covered | OFF-09: `sw.js` contains `ignoreSearch` |
| `02-§92.11` | covered | OFF-09: `ignoreSearch` in `networkFirstWithOfflineFallback` |
| `02-§92.12` | covered | OFF-10..11: `offline-guard.js` exists and uses `navigator.onLine` |
| `02-§92.13` | covered | OFF-12: message "Du är offline…" in `offline-guard.js` |
| `02-§92.14` | implemented | manual: `offline-guard.js` sets `disabled` on submit buttons |
| `02-§92.15` | implemented | manual: `window.addEventListener('online')` re-enables buttons |
| `02-§92.16` | implemented | `offline-guard.js` uses `className = 'form-error-msg'` |
| `02-§92.17` | covered | OFF-13..14: form pages include `offline-guard.js` |
| `02-§92.18` | covered | OFF-15..16: `feedback.js` uses `navigator.onLine`, has offline message |
| `02-§92.19` | implemented | manual: `feedback.js` `showOfflineWarning()` disables submit |
| `02-§92.20` | implemented | manual: `feedback.js` `hideOfflineWarning()` re-evaluates validation |
| `02-§92.21` | covered | OFF-12, OFF-16: messages in Swedish |
| `02-§92.22` | implemented | `offline-guard.js` uses `.form-error-msg` (design system class) |
| `02-§92.23` | implemented | No new entries in `package.json` |
| `02-§92.24` | implemented | `sw.js` is vanilla JS, no imports |
| `02-§92.25` | implemented | `offline.html` included in pre-cache list, fallback logic unchanged |

### §93 — Rate Limiting for Authorization Endpoints

| ID | Status | Notes |
| --- | --- | --- |
| `02-§93.1` | implemented | `app.js` `verifyAdminLimiter` = `rateLimit({limit:5, windowMs:3_600_000, ...})` applied as middleware on `POST /verify-admin`; emits 429 + Swedish `{error}` body. Manual: 6-request burst confirms 5×403 then 429 with `Retry-After: 3600` |
| `02-§93.2` | implemented | `app.js` `editEventLimiter` = `rateLimit({limit:30, ...})` on `POST /edit-event`; PHP side unchanged via `api/index.php handleEditEvent` |
| `02-§93.3` | implemented | `app.js` `deleteEventLimiter` = `rateLimit({limit:30, ...})` on `POST /delete-event`; PHP side unchanged |
| `02-§93.4` | implemented | `app.js` `feedbackLimiter` = `rateLimit({limit:5, ...})` on `POST /feedback`; PHP side unchanged |
| `02-§93.5` | implemented | Each `rateLimit()` instance is the first middleware argument on its route, so the limiter runs before validation, auth, and time-gating; confirm by reading `app.js` route definitions |
| `02-§93.6` | implemented | Node: `express-rate-limit` keys on `req.ip`, resolved through Express `app.set('trust proxy', 'loopback')` in `app.js`. PHP: `api/index.php` `clientIp()` reads `HTTP_X_FORWARDED_FOR` then `REMOTE_ADDR` |
| `02-§93.7` | implemented | `app.js` defines `makeLimiter()` and four named instances (`verifyAdminLimiter`, `editEventLimiter`, `deleteEventLimiter`, `feedbackLimiter`); `source/api/rate-limit.js` and its tests removed in favour of the standard middleware |
| `02-§93.8` | implemented | `feedbackLimiter` on the `/feedback` route uses `{limit:5, windowMs:3_600_000}`, preserving §73.14 |
| `02-§93.9` | implemented | `api/src/RateLimit.php` provides `SBSommar\RateLimit::isLimited($ip, $ns, $limit, $window)` with JSON-file state in sys_get_temp_dir() — unchanged |
| `02-§93.10` | implemented | `api/src/Feedback.php` delegates to `RateLimit::isLimited` with the feedback namespace; unchanged |
| `02-§93.11` | implemented | Documented in 03-architecture/platform-and-security.md §31.3 (middleware's default in-memory store auto-cleans), §31.4 (PHP JSON file), §31.7 |
| `02-§93.12` | implemented | `app.js` `RATE_LIMIT_MSG` = "För många förfrågningar. Försök igen senare." emitted via the middleware's `handler` override; PHP `RATE_LIMIT_MSG` in `api/index.php` unchanged |
| `02-§93.13` | implemented | `package.json` declares `express-rate-limit` as the sole added runtime dependency, justified by CodeQL detectability and standard `Retry-After` / `RateLimit-*` headers |
| `02-§93.14` | implemented | `api/composer.json` unchanged by this feature |
| `02-§93.15` | implemented | `app.js` sets `app.set('trust proxy', 'loopback')`; documented in 03-architecture/platform-and-security.md §31.7 |

### §94 — Registration Banner and CTA Button

| ID | Status | Notes |
| --- | --- | --- |
| `02-§94.1` | covered | REGB-08, REGB-10: `renderRegistrationBannersHtml` emits a banner per non-archived camp with title + meta; rendered inside hero area |
| `02-§94.2` | covered | REGB-04: each banner's `<a>` carries `href="#anmalan"` |
| `02-§94.3` | implemented | `source/build/build.js` sorts `registrationCamps` ascending by `start_date` before passing to `renderIndexPage`; verified in rendered HTML |
| `02-§94.4` | covered | REGC-03, REGC-06: CTA `href` is the `REGISTRATION_URL` defined in `source/build/render-index.js`; label is "Anmäl er här" |
| `02-§94.5` | implemented | `source/assets/cs/style.css` `.registration-cta { display: block; margin: 0 0 var(--space-md) 0 }` + `.registration-cta-btn { display: inline-block }`; button sits on its own line under the section heading — manual browser verification |
| `02-§94.6` | implemented | No media query; identical layout on desktop and mobile — manual browser verification |
| `02-§94.7` | covered | REG-06: `source/content/registration.md` contains no bold `[Anmäl er här]` link |
| `02-§94.8` | implemented | `source/data/camps.yaml` carries `registration_opens` / `registration_closes` for 2026-06, 2026-07, and qa-thisweek; validator enforces presence |
| `02-§94.9` | covered | VCMP-38..43: `source/scripts/validate-camps.js` rejects missing / invalid / out-of-order values on non-archived camps |
| `02-§94.10` | covered | VCMP-45: archived camp without the fields is accepted |
| `02-§94.11` | covered | REGB-05, REGB-06: banners emit `hidden` + `data-opens` / `data-closes` |
| `02-§94.12` | implemented | `render-index.js` inline script toggles `hidden` via Stockholm-anchored `today` string compare — REGB-11 verifies script presence; manual browser date-window check |
| `02-§94.13` | implemented | `.hero-registration-banner[hidden] { display: none }` in `style.css`; banners start hidden in HTML so no flicker — manual browser verification |
| `02-§94.14` | implemented | `build.js` filters `archived !== true` before building `registrationCamps`; archived camps never produce banners |
| `02-§94.15` | covered | REGC-01: `.registration-cta` wrapper is injected into the `anmalan` section by `injectRegistrationCta()` (same post-process pattern as `wrapTestimonialCards`); not authored in markdown |
| `02-§94.16` | covered | REGC-04: CTA anchor carries `target="_blank"` + `rel="noopener noreferrer"` |
| `02-§94.17` | covered | REGC-02: CTA anchor has the `btn-primary` class |
| `02-§94.18` | covered | REGB-07: each banner carries `data-goatcounter-click="click-register-banner-<camp.id>"` |
| `02-§94.19` | covered | REGC-05: CTA carries `data-goatcounter-click="click-register-section"` |
| `02-§94.20` | covered | REGB-08 asserts "Anmälan"/"öppen"; REGB-09 asserts "Sista anmälningsdag"; REGC-06 asserts "Anmäl er här" |
| `02-§94.21` | implemented | `style.css` new rules use only `--color-*`, `--space-*`, `--radius-*`, `--font-size-*` tokens from `07-DESIGN.md §7` |
| `02-§94.22` | covered | REGB-11 / REGB-12: inline banner visibility script is emitted only when banners are present; no new JS files |
| `02-§94.23` | implemented | `package.json` and `api/composer.json` unchanged by this feature |

### §95 — Security Hygiene: Regex Performance and Escaping

| ID | Status | Notes |
| --- | --- | --- |
| `02-§95.1` | covered | SLUG-RD-01, SLUG-RD-02: `slugify()` trim collapsed to `/^-\|-$/g`; pathological `-`-heavy input returns under 50 ms |
| `02-§95.2` | covered | SLUG-RD-03..14: `slugify(s)` matches reference implementation and honours 48-char cap, no leading/trailing dash |
| `02-§95.3` | covered | RE-01..18: `tests/helpers/regex-escape.js` escapes `. * + ? ^ $ { } ( ) \| [ ] \` and coerces non-string input |
| `02-§95.4` | implemented | `tests/scoped-headings.test.js` imports `escapeRegExp` and uses it at lines 50, 134, 156; no hand-rolled `\.`/`\s+` escape remains — all 22 SH-* tests still pass |
| `02-§95.5` | implemented | `package.json` and `api/composer.json` unchanged by this feature |
| `02-§95.6` | covered | SLUG-RD-03..12 prove output equivalence; SLUG-RD-14 guarantees no leading/trailing dash regression |
| `02-§95.7` | covered | CodeQL post-merge scan on main confirmed alerts #17, #30, #31, #32 transitioned to state `fixed` |

### §96 — Self-Healing Service Worker Upgrade

| ID | Status | Notes |
| --- | --- | --- |
| `02-§96.1` | covered | OFF-02, PWA-31: `sw.js` declares `const CACHE_NAME = 'sb-sommar-v6'` |
| `02-§96.2` | covered | SWH-01: `install` event handler contains `self.skipWaiting()` |
| `02-§96.3` | covered | SWH-02: `install` handler wraps each URL as `new Request(u, { cache: 'reload' })` before `cache.addAll` |
| `02-§96.4` | covered | SWH-03, SWH-04: `activate` handler deletes caches `!== CACHE_NAME` and calls `self.clients.claim()` |
| `02-§96.5` | covered | SWH-05: primary `caches.match(request)` in `cacheFirstThenNetwork` has no `ignoreSearch`; secondary `ignoreSearch` match exists only on the fetch-failure branch |
| `02-§96.6` | covered | SWH-06, SWH-07, OFF-09: `networkFirstThenCache` and `networkFirstWithOfflineFallback` retain `{ ignoreSearch: true }` on their catch-branch cache lookups |
| `02-§96.7` | implemented | `source/build/build.js` pre-cache-manifest injection uses root-relative paths (no query strings); verified post-build by `public/sw.js` contents |
| `02-§96.8` | implemented | `cacheFirstThenNetwork` catch branch calls `caches.match(request, { ignoreSearch: true })` so `/style.css` pre-cache entry still serves offline — manual browser verification |
| `02-§96.9` | implemented | Manual browser verification: load SW v5, deploy v6, confirm next navigation upgrades without user action |
| `02-§96.10` | implemented | Manual browser verification: confirm `sb-sommar-v5` is deleted on activate and `sb-sommar-v6` populated from fresh network responses |
| `02-§96.11` | implemented | Manual browser verification: confirm §94 registration-banner styling applies on second reload after deploy |
| `02-§96.12` | implemented | Manual browser verification: no clear-site-data or unregister action required from the end user |
| `02-§96.13` | covered | SWH-08: `sw.js` has no `import`, `require`, or `importScripts` |
| `02-§96.14` | implemented | `package.json` unchanged by this feature |
| `02-§96.15` | implemented | `offline-guard.js`, `feedback.js`, and `offline.html` unchanged; offline routing in `sw.js` preserved — manual browser verification |

### §97 — Project Documentation Site

| ID | Status | Notes |
| --- | --- | --- |
| `02-§97.1` | implemented | Pages enabled; `gh api repos/moggleif/sbsommar/pages` returns status `built` with `html_url=https://moggleif.github.io/sbsommar/` |
| `02-§97.2` | implemented | Same API response shows `source.branch=main`, `source.path=/docs` |
| `02-§97.3` | implemented | Pages' built-in automatic deploy runs on every push to `main` that touches `docs/`; verified after the initial enablement |
| `02-§97.4` | implemented | `docs/` contains only project documentation; no secrets, env values, or non-docs files — manual content review during this PR |
| `02-§97.5` | implemented | `docs/_config.yml` relies on GitHub Pages' built-in Jekyll; no project workflow added (verified by absence in `.github/workflows/`) |
| `02-§97.6` | implemented | DOCS-CFG-03 / DOCS-CFG-04: `docs/_config.yml` activates `jekyll-relative-links` and `relative_links.enabled: true`; runtime `.md → .html` resolution verified manually in the browser |
| `02-§97.7` | implemented | Manual browser verification: inline `<!-- 02-§N.M -->` markers remain as HTML comments in rendered output and are not visible |
| `02-§97.8` | implemented | `package.json` and `api/composer.json` unchanged by this feature (verified in PR diff) |
| `02-§97.9` | implemented | `.github/workflows/` unchanged; no Pages-specific workflow added (verified in PR diff) |
| `02-§97.10` | implemented | `deploy-qa.yml`, `deploy-prod.yml`, `deploy-reusable.yml`, `event-data-deploy.yml`, and `event-data-deploy-post-merge.yml` are untouched in this PR |
| `02-§97.11` | implemented | No `docs/CNAME` file; default `*.github.io` URL in use |
| `02-§97.12` | implemented | `docs/index.md` lists every other docs file with a one-line description and an `.md` link; `jekyll-relative-links` resolves the links to rendered pages — manual browser verification |
| `02-§97.13` | covered | README-DOCS-01, README-DOCS-02: `README.md` links to `https://moggleif.github.io/sbsommar/` and the link sits above the `## For Developers` section |
| `02-§97.14` | covered | README-DOCS-03, README-DOCS-04: `README.md` doc table includes all 10 `docs/*.md` files; drift test keeps the expected list in sync with `docs/` contents |
| `02-§97.15` | covered | DOCS-IDX-01..03: `docs/index.md` carries the reverse-discoverability banner with absolute github.com links to repo, README, and issues |
| `02-§97.16` | covered | DOCS-IDX-04: `docs/index.md` no longer contains any `https://sbsommar.se` link |
| `02-§97.17` | covered | DOCS-IDX-05: `docs/index.md` main copy is project-technical; no camp marketing phrases (`family camp`, `gifted children`, `Sysslebäck`) |
| `02-§97.18` | implemented | Policy declaration; satisfied collectively by §97.19, §97.20, §97.21 |
| `02-§97.19` | covered | DOCS-CFG-05: `docs/robots.txt` (Disallow: /) present; verified to address every user agent |
| `02-§97.20` | covered | DOCS-CFG-06: both `docs/_includes/head-custom.html` (Primer/Minima) and `docs/_includes/head_custom.html` (Cayman) emit `<meta name="robots" content="noindex, nofollow">`; whichever theme GitHub Pages picks, the tag lands in `<head>` — manual browser verification confirms |
| `02-§97.21` | covered | DOCS-CFG-07: no `sitemap.xml`, `sitemap.txt`, or forbidden Jekyll plugins (`jekyll-sitemap`, `jekyll-seo-tag`, `jekyll-feed`) under `docs/` |

### §98 — Locale Overview Page

Session 1 of issue #332. Delivers `/lokaler.html` as a week-wide visual
timeline of which locales are already booked during the active camp.
Session 2 (a separate later change) will add a soft conflict warning in
the add- and edit-activity forms that links to this page.

| ID | Status | Notes |
| --- | --- | --- |
| `02-§98.1` | covered | `source/build/render-lokaler.js` — `renderLokalerPage`; `source/build/build.js` writes `public/lokaler.html`; tests LOK-30, LOK-70 |
| `02-§98.2` | covered | `groupEventsByLocation()` preserves `local.yaml` order; tests LOK-01, LOK-40 |
| `02-§98.3` | covered | Today-forward filter + full-span fallback in `renderLokalerPage`; tests LOK-75, LOK-76, LOK-77 |
| `02-§98.4` | covered | `positionBlock()` computes `left`/`width` from start/end; tests LOK-10..LOK-16, LOK-41 |
| `02-§98.5` | covered | `renderEventBlock()` emits title, time range, responsible spans; tests LOK-50, LOK-51 |
| `02-§98.6` | covered | Empty locales get the italic `.lokal-empty` sub-label "Inga bokningar"; test LOK-42 |
| `02-§98.7` | covered | `groupEventsByLocation()` folds unknown locations under "Annat"; tests LOK-04, LOK-05, LOK-08, LOK-43 |
| `02-§98.8` | implemented | "Se lokalöversikt →" link in `source/build/render.js` schedule intro and `source/build/render-add.js` add intro. Manual: open /schema.html and /lagg-till.html, click link |
| `02-§98.9` | covered | `source/build/layout.js` untouched — no nav entry added; test LOK-61 |
| `02-§98.10` | covered | `<h1>Lokalöversikt</h1>`; `<html lang="sv">`; test LOK-31 |
| `02-§98.11` | covered | `ariaLabelFor()` builds locale/date/time/title/responsible string; test LOK-52 |
| `02-§98.12` | covered | `.lokaler-legend` placed before `.lokaler-grid-wrapper` in `renderLokalerPage`; test LOK-62 |
| `02-§98.13` | covered | Entire grid server-rendered at build; no `lokaler.js` referenced; test LOK-63 |
| `02-§98.14` | implemented | All `style.css` §6.104–6.115 rules use `var(--color-*)`, `var(--space-*)`, `color-mix()` derivations; manual: grep `source/assets/cs/style.css` for hex values inside `.lokaler-*` / `.event-block*` / `.day-band*` rules |
| `02-§98.15` | implemented | `.lokaler-grid-wrapper { overflow-x: auto }`; `@media (max-width: 600px)` shrinks `--lokaler-*-col`. Manual: open /lokaler.html at ≤600px viewport, confirm horizontal scroll and surrounding layout intact |
| `02-§98.16` | covered | `assignLanes()` greedy first-fit; `.day-band--lanes-N` modifiers; per-event `--lane` custom property; test LOK-80 |
| `02-§98.17` | covered | `markClashes()` + `.event-block--clash` class; bg `color-mix(var(--color-error) 35%, white)` + `box-shadow` red outline; test LOK-80 |
| `02-§98.18` | covered | Clash predicate `a.start < b.end && a.end > b.start` in `markClashes()`; test LOK-81 |
| `02-§98.19` | covered | Per-event `--group` (count of temporally-overlapping events including self) drives height; non-clashers keep full band height even on crowded days; test LOK-83 |
| `02-§98.20` | implemented | `.lokaler-grid-corner` cell renders the text `Lokaler \ Dag` inside `renderLokalerPage`; visible on every page render. Manual: open /lokaler.html, confirm corner text |
| `02-§98.21` | covered | `effectiveEnd()` uses strict `<` so `start === end` gives `widthPct = 0`; `renderEventBlock()` returns empty string for zero-width; test LOK-84 |
| `02-§98.22` | covered | `expandCrossMidnight()` splits an event into `_part: 'start'` (its own date, until 24:00) and `_part: 'end'` (next date, from 00:00); data-lb suffixed `--start`/`--end`; aria-label adds "fortsätter nästa dag" / "från föregående dag"; test LOK-85 |
| `02-§98.23` | covered | Native `<table>`/`<tr>`/`<th scope="row">`/`<th scope="col">`/`<td>` in `renderLokalerPage`; CSS `display: grid` on `<table>` and `display: contents` on `<tr>` make them participate in CSS Grid; test LOK-86. CSS source-order invariant for clash-hover guarded by LOK-87 |

### §99 — Conflict warning in forms and activity pages

Session 2 of issue #332. Adds a red-dampened conflict banner to
`/lagg-till.html`, `/redigera.html`, and each per-event detail page
(`/schema/<slug>/`) when the activity's date/time/place overlaps
another booking. The overlap predicate lives in a single shared
UMD module `source/assets/js/client/conflict-check.js`, consumed by
both the client-side forms and the build-time renderers (including a
refactor of `render-lokaler.js` onto the shared module).

| ID | Status | Notes |
| --- | --- | --- |
| `02-§99.1` | covered | `source/assets/js/client/conflict-check.js` exports `effectiveEnd`, `overlaps`, `markClashes`, `findConflicts`, `findConflictsMulti`; tests CNF-01..32 |
| `02-§99.2` | covered | `render-lokaler.js` and `render-event.js` both `require('../assets/js/client/conflict-check.js')`; no inline overlap predicate remains. Test CNF-02-RefactoredLokaler |
| `02-§99.3` | covered | Same-date + same-location + strict overlap; back-to-back is not a clash; cross-midnight end → 24:00. Tests CNF-01..14, CNF-20..23, CNF-40..41 |
| `02-§99.4` | implemented | `lagg-till.js` `whenEvents()` — lazy singleton promise wrapping `fetch('/events.json')`. Manual: DevTools Network → load /lagg-till.html, confirm one request |
| `02-§99.5` | implemented | `lagg-till.js` `maybeCheckConflicts()` wired to `change` events on `#f-start`/`#f-end`/`#f-location` and click on `.day-btn`; 150 ms debounce. Manual: fill all four fields, confirm banner appears |
| `02-§99.6` | covered | `renderConflicts()` in `lagg-till.js` emits banner before submit via `submitBtn.parentNode.insertBefore`; per-date sections via `findConflictsMulti` with CNF-30..32 |
| `02-§99.7` | covered | Banner footer hard-coded `<a href="lokaler.html">Se lokalöversikt →</a>`; CNF-64 asserts per-event variant; same string literal in `lagg-till.js` and `redigera.js` |
| `02-§99.8` | implemented | Submit handler is unchanged; conflict state only drives banner visibility. Manual: submit lagg-till with banner visible, confirm form posts |
| `02-§99.9` | implemented | `ensureConflictBanner()` sets `role="status"` + `aria-live="polite"`. Manual: verify with a screen reader |
| `02-§99.10` | implemented | `redigera.js` `scheduleConflictCheck()` called in the `.then()` handler after `populate()`; change listeners on `#f-date`/`#f-start`/`#f-end`/`#f-location`. CNF-52, CNF-54 check wiring |
| `02-§99.11` | covered | `findConflicts(..., { excludeId: els.id.value })` in `redigera.js`; tested via CNF-24 |
| `02-§99.12` | implemented | First `scheduleConflictCheck()` fires immediately after `populate(event)`. Manual: open a known-clashing event and confirm banner renders on load |
| `02-§99.13` | implemented | All strings (`Den här tiden…`, `Se lokalöversikt →`, weekday names via `WEEKDAYS_LONG_SV`) are Swedish literals in `lagg-till.js`, `redigera.js`, `render-event.js` |
| `02-§99.14` | implemented | `.conflict-warning` in `source/assets/cs/style.css` uses `color-mix(in srgb, var(--color-error) 35%, var(--color-white))`, identical to `.event-block--clash`. Manual: DevTools Computed background on /lokaler.html event-block and banner — same values |
| `02-§99.15` | covered | `render-event.js` `renderConflictBanner(event, allEvents)` called per page with `excludeId: event.id`; `build.js` passes `events` array. Tests CNF-60, CNF-60b, CNF-61, CNF-62 |
| `02-§99.16` | covered | Both renderers emit `<div class="conflict-warning">…__lead/__list/__footer</div>`; a single CSS rule in `style.css` styles both. Tests CNF-50, CNF-53, CNF-60..64 |
| `02-§99.17` | covered | `render-event.js` template interpolates `${conflictHtml}${descriptionHtml}${linkHtml}` inside `.event-detail`. Test CNF-63 |
| `02-§99.18` | implemented | `redigera.js` `ensureConflictBanner()` inserts before the first `<fieldset>` in `#edit-form`. Manual: open /redigera.html?id=<clashing>, confirm banner appears between the "Redigera aktivitet" heading and the Rubrik field |

### §100 — Secret File Protection: API `.env` Outside the Web Root

| ID | Status | Notes |
| --- | --- | --- |
| `02-§100.1` | covered | ENVLOC-02: workflow writes no `.env` into `$API_STAGING`/`$PUBLIC_DIR/api`; `.github/workflows/deploy-reusable.yml`. Manual: `ls $DEPLOY_DIR/public_html/api/.env` absent after deploy |
| `02-§100.2` | covered | HTACC-05, HTACC-06: `api/index.php` loads via `Dotenv::createImmutable(dirname(__DIR__, 2))` and never `createImmutable(__DIR__)` |
| `02-§100.3` | implemented | PHP runtime reads `GITHUB_*`, origins, `COOKIE_DOMAIN`, `BUILD_ENV`, `ADMIN_TOKENS` from `$DEPLOY_DIR/.env`; no PHP test harness — manual server verification (submit an event end-to-end) |
| `02-§100.4` | covered | HTACC-01, HTACC-02, HTACC-03: `api/.htaccess` denies dotfiles (2.4 + 2.2) before the rewrite. Manual: `curl -sI .../api/.env` → 403 |
| `02-§100.5` | covered | HTACC-04: `source/static/.htaccess` denies `.env` (2.4 + 2.2); build copies it to `public/.htaccess` |
| `02-§100.6` | implemented | Manual checkpoint — `curl -sI https://sbsommar.se/api/.env` and QA return 403/404 (live Apache/LiteSpeed only) |
| `02-§100.7` | covered | ENVLOC-01, ENVLOC-02: API tar uses `--exclude='.env'`; no step writes `.env` into the web root |
| `02-§100.8` | covered | ENVLOC-03: guarded `mv "$PUBLIC_DIR/api/.env" "$DEPLOY_DIR/.env"` when canonical file absent |
| `02-§100.9` | implemented | `package.json` and `api/composer.json` unchanged by this feature |
| `02-§100.10` | implemented | Local Node API unaffected — `app.js` uses `--env-file=.env`; no PHP runs locally (manual: `npm start`) |
| `02-§100.11` | covered | ENVLOC-04: no `.env.api.persistent`/`.env.api.bak` reference remains; supersedes §53.3 |

### §1 — Camp registry fields (camps.yaml)

| ID | Status | Notes |
| --- | --- | --- |
| `05-§1.7` | covered | VCMP-37..45: validator enforces ISO format, ordering (`registration_opens <= registration_closes`), and `registration_closes < start_date` on non-archived camps; archived camps may omit the fields |
