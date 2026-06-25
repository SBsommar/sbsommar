---
title: "Traceability — 02-requirements"
---

# Traceability — 02-requirements

Part of [the traceability index](./index.md).

## Table

| ID | Requirement | Doc Ref | Test(s) | Implementation | Status |
| --- | --- | --- | --- | --- | --- |
| `02-§2.1` | Homepage exists and is served at `/` | 03-architecture/rendering.md §5, §6 | COV-01..05 | `source/build/render-index.js`, `source/build/build.js` → `public/index.html` | covered |
| `02-§2.2` | Weekly schedule page exists at `/schema.html` | 03-architecture/rendering.md §5 | SNP-01 | `source/build/render.js`, `source/build/build.js` → `public/schema.html` | covered |
| `02-§2.4` | Today view at `/idag.html` shows today's activities in the standard site layout | 03-architecture/rendering.md §5 | IDAG-05..18 | `source/build/render-idag.js`, `source/build/build.js` → `public/idag.html` | covered |
| `02-§2.4a` | Display view at `/live.html` uses dark background, large text, and no navigation | 03-architecture/data-layer.md §3, 07-design/components.md §6 | DIS-01..25 | `source/build/render-today.js`, `source/build/build.js` → `public/live.html` | covered |
| `02-§2.5` | Add-activity form exists at `/lagg-till.html` | 03-architecture/data-layer.md §3; 03-architecture/rendering.md §6 | RADD-01..04 | `source/build/render-add.js`, `source/build/build.js` → `public/lagg-till.html` | covered |
| `02-§2.6` | Archive page exists at `/arkiv.html` | 03-architecture/data-layer.md §4a | ARK-01..08 | `source/build/render-arkiv.js`, `source/build/build.js` → `public/arkiv.html` | covered |
| `02-§2.7` | RSS feed exists at `/schema.rss` | 03-architecture/rendering.md §17 | RSS-01 | `source/build/render-rss.js`, `source/build/build.js` → `public/schema.rss` | covered |
| `02-§2.8` | Homepage, schedule, add-activity, and archive pages share header and navigation | 03-architecture/rendering.md §6 | SNP-01, LAY-01..07 | `source/build/layout.js` – `pageNav()` | covered |
| `02-§2.9` | None of the site pages require login | 03-architecture/data-layer.md §3 | COV-16 | No authentication exists anywhere in the codebase | covered |
| `02-§2.10` | Display view has no header or navigation | 03-architecture/data-layer.md §3, 07-design/components.md §6 | DIS-04..06 | `source/build/render-today.js` – no `pageNav()` call | covered |
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
| `02-§4.6` | Display view has dark background, large text, and minimal chrome; legible at a distance | 07-design/components.md §6 | DIS-07, CSS-37 | `source/build/render-today.js` – `class="display-mode"`; `source/assets/cs/style.css` → `/live.html` | covered |
| `02-§4.7` | Display view requires no interaction to stay useful | 03-architecture/data-layer.md §3 | DIS-08..09 | `source/build/render-today.js` – no day controls rendered | covered |
| `02-§4.14` | Display view shows no site-level footer | 02-requirements/schedule-and-detail.md §4 | DIS-19 | `source/build/render-today.js` – `pageFooter` call and import removed; no `<footer>` in template | covered |
| `02-§4.15` | Display view shows a live clock that advances exactly once per wall-clock second (no skipped or repeated values) | 02-requirements/schedule-and-detail.md §4; 07-design/components.md §6.40 | DIS-22, DIS-23 (structural); — (manual: open `/live.html`, watch the clock for several minutes, confirm the seconds never skip or repeat) | `source/build/render-today.js` – `<div class="status-bar">` with `id="live-clock"`; `source/assets/js/client/events-today.js` – `tickClock()` self-corrects to the next whole second via `setTimeout` | implemented |
| `02-§4.16` | Display view shows when the schedule content was last rebuilt, labelled "Schema uppdaterat" + build date/time; timestamp embedded at build time | 02-requirements/schedule-and-detail.md §4; 07-design/components.md §6.40 | DIS-20, DIS-21 | `source/build/build.js` – `buildTime = new Date().toISOString()`; `source/build/render-today.js` – `window.__BUILD_TIME__`, `window.__VERSION__`; `events-today.js` – `buildInfoEl.textContent = 'Schema uppdaterat …'` | covered |
| `02-§4.17` | Display view polls `version.json` on load and every 60 s, reloads on a newer build, and logs+retries a failed check | 02-requirements/schedule-and-detail.md §4 | — (manual: deploy a new build while page is open; confirm reload within ~1 min. Block `version.json` in DevTools and confirm a console warning appears and polling continues) | `source/assets/js/client/events-today.js` – `pollVersion()` called immediately then via `setInterval(…, 60000)`, `cache: 'no-store'`, `.catch` logs `console.warn`; `source/build/build.js` – writes `public/version.json` | implemented |
| `02-§4.18` | Display view reloads automatically shortly after midnight to show the new day's events | 02-requirements/schedule-and-detail.md §4 | — (manual: advance system clock past 00:00 and confirm page reloads) | `source/assets/js/client/events-today.js` – `scheduleMidnightReload()` via `setTimeout` | implemented |
| `02-§4.19` | Display view heading shows only the current day and date, without a page-title prefix | 02-requirements/schedule-and-detail.md §4; 07-design/components.md §6.46 | DIS-13, DIS-24 | `source/build/render-today.js` – `window.__HEADING_PREFIX__ = ''`; `source/assets/js/client/events-today.js` – ternary skips prefix when empty | covered |
| `02-§4.20` | Display view heading is positioned inside the sidebar, not above the event list | 02-requirements/schedule-and-detail.md §4; 07-design/components.md §6.44 | DIS-24, DIS-25 | `source/build/render-today.js` – `<h1 id="today-heading" class="sidebar-heading">` inside `<aside class="dagens-sidebar">` | covered |
| `02-§4.21` | Display view is optimised for portrait screens; event rows are compact | 02-requirements/schedule-and-detail.md §4; 07-design/components.md §6.45, §6.48 | — (manual: open `/live.html` in a portrait viewport ~1080×1920 and confirm event rows are compact and the sidebar is narrow) | `source/assets/cs/style.css` – `.dagens-events { flex: 3 }`, `.dagens-sidebar { flex: 1 }`, `body.display-mode .event-row { font-size: 13px; padding: 6px }` | implemented |
| `02-§4.22` | Display view re-evaluates activities every minute without reloading: ended activities are removed, the in-progress one is highlighted, and a closing message shows when all have ended | 02-requirements/schedule-and-detail.md §4; 07-design/components.md §6.40 | — (manual: open `/live.html` on a day with events spanning the current time; confirm past rows disappear and the ongoing row is accented as the minute rolls over; after the last event ends, confirm the "Inga fler aktiviteter idag." message) | `source/assets/js/client/events-today.js` – `classifyRows()` adds `.is-past`/`.is-now` and toggles `doneMsg`, `tickClassify()` re-runs each minute; `source/assets/cs/style.css` – `body.display-mode .event-row.is-past { display: none }`, `.is-now` | implemented |
| `02-§4.23` | Display view surfaces a red "Ingen kontakt med servern sedan HH:MM" banner only after >3 min without a successful version check, and hides it once a check succeeds | 02-requirements/schedule-and-detail.md §4; 07-design/components.md §6.40 | DIS-30, DIS-31 (element rendered hidden); — (manual: open `/live.html`, block `version.json` in DevTools, confirm the red banner appears after ~3 min showing the last-contact time, then unblock and confirm it clears) | `source/build/render-today.js` – `<p class="status-offline" id="connection-warning" … hidden>`; `source/assets/js/client/events-today.js` – `refreshConnectionWarning()`, `lastOkCheck`, `STALE_MS`; `source/assets/cs/style.css` – `.status-offline` | implemented |
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
| `02-§4.8` | Overlapping activities are allowed and the schedule remains readable | 03-architecture/rendering.md §5, 07-design/components.md §6 | RDC-05..06 | No exclusion logic in `source/build/render.js`; CSS handles layout | covered |
| `02-§4.9` | Clicking an activity opens its detail view | 03-architecture/rendering.md §5 | RND-41, RND-42 | `source/build/render.js` – `renderEventRow()` uses `<details>` element | covered |
| `02-§5.1` | Detail view shows all populated fields; fields with no value do not appear | 05-DATA_CONTRACT.md §2, §3 | RND-33..38, RND-43 | `source/build/render.js` – `eventExtraHtml()`, `renderEventRow()` | covered |
| `02-§6.1` | Form at `/lagg-till.html` accepts a new activity submission | 03-architecture/data-layer.md §3 | RADD-03..04 | `source/build/render-add.js` (HTML), `source/assets/js/client/lagg-till.js` (submit) | covered |
| `02-§6.2` | Date field is constrained to the active camp's date range | 05-DATA_CONTRACT.md §4 | RADD-05..07 | `source/build/render-add.js` – `min`/`max` attributes on date input | covered |
| `02-§6.3` | Location field is a dropdown populated from `source/data/local.yaml` | 03-architecture/rendering.md §6 | RADD-08..10 | `source/build/build.js` (loads `local.yaml`); `source/build/render-add.js` (renders `<select>`) | covered |
| `02-§6.4` | Time fields guide the user toward a valid `HH:MM` value | 05-DATA_CONTRACT.md §4 | RADD-11..12 | `source/build/render-add.js` – `type="time"` inputs (browser-native validation) | covered |
| `02-§6.5` | Form errors are shown inline, per field, immediately on submit | 03-architecture/forms-and-api.md §7a; 07-design/components.md §6.34–6.39 | ILE-01..04, ILE-E01..E04 | `render-add.js` / `render-edit.js` (`.field-error` spans, `aria-describedby`); `lagg-till.js` / `redigera.js` (per-field `setFieldError`); `style.css` (`.field-error`, `[aria-invalid]`) | covered |
| `02-§6.6` | Submit button is disabled and shows a visual indicator while submission is in progress | 03-architecture/data-layer.md §3 | — | `source/assets/js/client/lagg-till.js` – `submitBtn.disabled = true`; `textContent = 'Sparar...'` | implemented |
| `02-§6.7` | A clear success confirmation is shown after submission | 03-architecture/data-layer.md §3 | — | `source/assets/js/client/lagg-till.js` – reveals `#result` section with activity title | implemented |
| `02-§6.8` | Network failure shows a clear error and allows retry; submissions are never silently lost | 03-architecture/data-layer.md §3 | — | `source/assets/js/client/lagg-till.js` – `.catch()` re-enables button and shows error | implemented |
| `02-§6.9` | Date field shows an inline error immediately on `change` if the value is in the past | 07-design/components.md §6.34–6.39 | LVD-01 | `source/assets/js/client/lagg-till.js` – `change` listener on `#f-date` | implemented |
| `02-§6.10` | End-time field evaluated on `change` using midnight-crossing rule (§54); shows info or error | 07-design/components.md §6.34–6.39, §6.44a–6.44g | LVD-02 | `source/assets/js/client/lagg-till.js` – `change` listener on `#f-end` | implemented |
| `02-§6.11` | Any required field shows an inline error on `blur` if it is empty | 07-design/components.md §6.34–6.39 | LVD-03 | `source/assets/js/client/lagg-till.js` – `blur` listeners on all required fields | implemented |
| `02-§6.12` | A live-validation error is cleared as soon as the user starts editing the field (`input`/`change`) | 07-design/components.md §6.34–6.39 | LVD-04 | `source/assets/js/client/lagg-till.js` – `input`/`change` clear listener per field | implemented |
| `02-§6.13` | When start time changes, end-time re-evaluated using midnight-crossing rule (§54); shows info, error, or clears | 07-design/components.md §6.34–6.39, §6.44a–6.44g | LVD-05 | `source/assets/js/client/lagg-till.js` – `change` listener on `#f-start` re-validates `#f-end` | implemented |
| `02-§6.14` | When date = today and start time is more than 2 hours in the past, show inline error; same check re-runs when date changes to today | 07-design/components.md §6.34–6.39 | LVD-06 | `source/assets/js/client/lagg-till.js` – `isPastTimeToday()` called from start and date `change` listeners | implemented |
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
| `02-§10.6` | Appended event YAML is indented to match the `events:` list; resulting file is valid YAML | 03-architecture/data-layer.md §3; 02-requirements/platform-security.md §102.4 | GH-39..43, YSEC-17..19, YSEC-23 | `source/api/github.js` – `buildEventYaml(event, indent)` with `indent=detectEventIndent(campContent)` in `addEventToActiveCamp()`; `api/src/GitHub.php` mirrors | covered |
| `02-§11.1` | Activities are always displayed in chronological order (by date, then start time) | 03-architecture/rendering.md §5 | RND-28..32, SNP-03 | `source/build/render.js` – `groupAndSortEvents()` | covered |
| `02-§11.2` | Overlapping activities are allowed; the schedule must remain readable (see `02-§4.8`) | 03-architecture/rendering.md §5, 07-design/components.md §6 | — | No exclusion logic in `source/build/render.js`; CSS handles layout | implemented |
| `02-§12.1` | A newly submitted activity appears in the live schedule within a few minutes | 03-architecture/data-layer.md §3 (PR auto-merge → deploy pipeline) | — | `source/api/github.js` – `createPullRequest()`, `enableAutoMerge()` | implemented |
| `02-§12.2` | Admin corrections to YAML are reflected in all schedule views after the next build | 04-OPERATIONS.md (Disaster Recovery) | — | `source/build/build.js` – reads all YAML at build time | implemented |
| `02-§13.1` | Color contrast is at least 4.5:1 for body text | 07-design/imagery-and-accessibility.md §9 | — | `source/assets/cs/style.css` – charcoal (`#3B3A38`) on cream (`#F5EEDF`) (passes WCAG AA; not verified programmatically) | implemented |
| `02-§13.2` | All interactive elements have visible focus states | 07-design/imagery-and-accessibility.md §9 | A11Y-01..09 | `source/assets/cs/style.css` – `:focus-visible` rules on buttons, nav links, toggle, summaries, content links, form inputs | covered |
| `02-§13.3` | Navigation is fully keyboard accessible | 07-design/imagery-and-accessibility.md §9 | — | `source/build/layout.js` – `<nav>` and `<a>` elements; `source/build/render-add.js` – standard form controls (native keyboard) | implemented |
| `02-§13.4` | Images have descriptive `alt` text | 07-design/imagery-and-accessibility.md §8 | RNI-29..33 | `source/build/render-index.js` – `extractHeroImage()` preserves alt; `inlineHtml()` passes through alt | covered |
| `02-§13.5` | The add-activity form is fully usable without a mouse | 07-design/imagery-and-accessibility.md §9 | — | `source/build/render-add.js` – all standard form controls (native keyboard) | implemented |
| `02-§13.6` | Accordion and expandable elements use proper ARIA attributes (`aria-expanded`, `aria-controls`) | 07-design/imagery-and-accessibility.md §9 | — (manual: native `<details>` provides equivalent accessibility; archive uses explicit ARIA via ARK-04, ARK-05) | `source/build/render.js` – native `<details>/<summary>` (browser-exposed state); `source/build/render-arkiv.js` – explicit `aria-expanded`/`aria-controls` | implemented |
| `02-§14.1` | The site is written entirely in Swedish: all content, nav, labels, errors, confirmations, and alt text | 07-design/index.md §1 | COV-14..15, RADD-20..21, IDAG-15, REDT-12..16 | All templates and client JS use Swedish text | covered |
| `02-§15.1` | Activity schedule is available as an RSS feed at `/schema.rss` | 03-architecture/rendering.md §17 | RSS-01, RSS-04 | `source/build/render-rss.js` | covered |
| `02-§16.1` | Past camp data is never deleted; `archived: true` marks completed camps | 03-architecture/data-layer.md §4 | — | `source/data/camps.yaml` – `archived` flag; no deletion logic exists | implemented |
| `02-§16.2` | Archive page lists all past camps and links to their schedules | 03-architecture/data-layer.md §4a | ARK-01..08 | `source/build/render-arkiv.js` – `renderArkivPage()` | covered |
| `02-§16.3` | When no camp is active, the most recent archived camp is shown by default | 03-architecture/rendering.md §5 (Fallback rule) | — | `source/build/build.js` – falls back to most recent by `start_date` (not filtered to `archived: true`) | implemented |
| `02-§17.1` | The site works well on mobile devices | 07-design/index.md §4, §5 | — | `source/assets/cs/style.css` – responsive layout, container widths, breakpoints | implemented |
| `02-§17.2` | The site requires no explanation; the schedule and add-activity form are self-evident | 07-design/index.md §1 | — | UX/design principle; assessed through usability review, not automatable | implemented |
| `02-§4.10` | Weekly schedule groups activities by day | 03-architecture/rendering.md §5 | SNP-02, SNP-03 | `source/build/render.js` – `groupAndSortEvents()` | covered |
| `02-§4.13` | Today view has no day navigation; it always shows today | 03-architecture/data-layer.md §3 | DIS-10, IDAG-12..13 | `source/build/render-idag.js`, `source/build/render-today.js` – no day navigation rendered | covered |
| `02-§5.2` | Empty fields are omitted from the detail view; no blank rows appear | 05-DATA_CONTRACT.md §3 | RND-33..38 | `source/build/render.js` – `eventExtraHtml()` guards each optional field | covered |
| `02-§5.3` | The `owner` and `meta` fields are never shown in any public view | 05-DATA_CONTRACT.md §3.3 | RDC-01..04, STR-JSON-01..02 | `source/build/render.js` – neither field is referenced in render output | covered |
| `02-§8.3` | Locations must be selected from a predefined list | 03-architecture/rendering.md §6 | — | `source/build/render-add.js` – `<select>` populated from `local.yaml` | implemented |
| `02-§8.4` | Participants cannot modify the location list | 03-architecture/rendering.md §6 | — | No form UI for adding locations; enforced by absence | implemented |
| `02-§11.3` | The schedule remains readable when multiple activities overlap (see `02-§4.8`) | 07-design/components.md §6 | — | CSS layout handles overlap; no exclusion logic in render | implemented |
| `02-§12.3` | All event submissions are permanently recorded in Git history as a full audit trail | 03-architecture/data-layer.md §3 | — | `source/api/github.js` – every submission creates a Git commit via the Contents API | implemented |
| `02-§15.2` | The RSS feed reflects the current state of the schedule | 03-architecture/rendering.md §17 | RSS-04 | `source/build/render-rss.js` — built from active camp events | covered |
| `02-§16.4` | The archive must be usable and complete, not a placeholder | 03-architecture/data-layer.md §4a | ARK-01..08 | `source/build/render-arkiv.js` – interactive timeline with accordion per camp | covered |
| `02-§17.3` | The site is readable on shared display screens | 07-design/components.md §6 | DIS-01..25 | `source/build/render-today.js` – display mode view; `source/assets/cs/style.css` | covered |
| `02-§2.11` | Edit-activity page exists at `/redigera.html` | 03-architecture/forms-and-api.md §7 | REDT-01..03 | `source/build/render-edit.js` → `public/redigera.html` | covered |
| `02-§7.1` | Participants can edit their own active events (events not yet passed) via session-cookie ownership | 03-architecture/forms-and-api.md §7 | — | `app.js` – `POST /edit-event`; `source/assets/js/client/session.js`; `source/assets/js/client/redigera.js` | implemented |
| `02-§7.2` | Administrators with a valid admin token (§91) can edit or remove any activity through the same edit and delete flows available to participants | 03-architecture/forms-and-api.md §7, §9 | — | `app.js` – admin token OR in `/edit-event` and `/delete-event`; `session.js` – `injectEditLinks()` for admins; `redigera.js` – admin bypass | implemented |
| `02-§7.3` | A user may edit or delete an event if their session cookie contains valid signed ownership for the event or the user holds a valid admin token | 03-architecture/forms-and-api.md §7 | ADED-01..08, SES-17..21, PSES-02 | `source/api/session.js` / `api/src/Session.php` parse verified signed ownership; `app.js` and `api/index.php` apply ownership OR admin checks | covered |
| `02-§18.1` | When an event is successfully created, the server sets the `sb_session` cookie containing an ownership entry for the event | 03-architecture/forms-and-api.md §7 | SES-06, SES-16, PSES-03 | `app.js` `/add-event`; `api/index.php` `handleAddEvent()` set signed ownership cookies when consent is true | covered |
| `02-§18.2` | The session cookie stores a JSON array of ownership entries for events the current browser owns | 03-architecture/forms-and-api.md §7 | SES-03, SES-16, SES-06, PSES-01 | `source/api/session.js` and `api/src/Session.php` use `{ id, exp, sig }` ownership entries | covered |
| `02-§18.3` | The session cookie has Max-Age of 7 days; submitting another event refreshes the cookie lifetime | 03-architecture/forms-and-api.md §7 | SES-07, SES-21 | `createOwnershipEntry()` signs a 7-day expiry; add handlers reissue existing verified entries before writing `Max-Age=604800` cookie | covered |
| `02-§18.4` | The session cookie uses the `Secure` flag (HTTPS only) and `SameSite=Strict` | 03-architecture/forms-and-api.md §7 | SES-08, SES-09, EEC-20..21 | `source/api/session.js` – `buildSetCookieHeader()` | covered |
| `02-§18.5` | The session cookie is JavaScript-readable (not httpOnly); server-side validation of signed ownership compensates | 03-architecture/forms-and-api.md §7 | EEC-26, SES-17..21 | `buildSetCookieHeader()` omits HttpOnly; edit/delete authorization uses `parseVerifiedSessionIds()` server-side | covered |
| `02-§18.6` | The session cookie is initially set only by the server; client cleanup never creates ownership proof | 03-architecture/forms-and-api.md §7 | — (manual/code review: verify `session.js`/`redigera.js` preserve entries and never calculate signatures) | `app.js`/`api/index.php` create signatures; `session.js` and `redigera.js` preserve and filter existing entries only | implemented |
| `02-§18.7` | The session cookie name is `sb_session` | 03-architecture/forms-and-api.md §7 | SES-06, EEC-18 | `source/api/session.js` – `COOKIE_NAME = 'sb_session'` | covered |
| `02-§18.41` | When API and static site are on different subdomains, the session cookie must include `Domain` covering the shared parent domain, supplied via `COOKIE_DOMAIN` env var; omitted for single-origin deployments | 03-architecture/forms-and-api.md §7 | SES-14, SES-15 | `source/api/session.js` – `buildSetCookieHeader(ids, domain)`; `app.js` – passes `process.env.COOKIE_DOMAIN` | covered |
| `02-§18.8` | Before setting the session cookie, the client displays a modal consent prompt on the add-activity form | 03-architecture/forms-and-api.md §7 | — (manual: submit form without prior consent and confirm modal appears) | `source/assets/js/client/cookie-consent.js` – `showConsentModal()` | implemented |
| `02-§18.9` | If the user accepts consent, the form submission proceeds and the server sets the session cookie | 03-architecture/forms-and-api.md §7 | — | `lagg-till.js` passes `cookieConsent: true`; `app.js` sets cookie | implemented |
| `02-§18.10` | If the user declines consent, the event is still submitted but no session cookie is set | 03-architecture/forms-and-api.md §7 | — | `lagg-till.js` passes `cookieConsent: false`; `app.js` skips `Set-Cookie` | implemented |
| `02-§18.11` | Only an accepted consent decision is stored in `localStorage` as `sb_cookie_consent`; declining is not persisted so the user can change their mind | 03-architecture/forms-and-api.md §7 | — | `cookie-consent.js` – `saveConsent()` stores only `'accepted'`; decline handler omits `saveConsent()` | implemented |
| `02-§18.12` | The consent prompt is written in Swedish | 02-requirements/platform-security.md §14 | — | `cookie-consent.js` – banner innerHTML is Swedish text | implemented |
| `02-§18.13` | On every page load, JS removes ownership entries for events whose date has already passed | 03-architecture/forms-and-api.md §7 | — (browser-only: open schedule with owned past event and confirm cookie cleanup) | `source/assets/js/client/session.js` – `removeExpiredEntries()` filters by event date and signed-entry expiry | implemented |
| `02-§18.14` | After cleaning, if no ownership entries remain the cookie is deleted; otherwise the cleaned cookie is written back | 03-architecture/forms-and-api.md §7 | — (browser-only: inspect `sb_session` after schedule page cleanup) | `source/assets/js/client/session.js` – `writeSessionEntries()` deletes empty cookies or writes preserved ownership entries | implemented |
| `02-§18.15` | "Passed" means the event date is strictly before today's local date | 03-architecture/forms-and-api.md §7 | EDIT-01..03 | `source/api/edit-event.js` – `isEventPast()`; `session.js` – `date >= today` | covered |
| `02-§18.49` | Event IDs in the session cookie but not found in `events.json` must be kept, not removed — newly-submitted events may not yet appear in the JSON | 03-architecture/forms-and-api.md §7 | — (manual: submit event, navigate to schema before deploy completes, verify cookie still contains new ID) | `session.js` – `removeExpiredIds()` keeps unknown IDs | implemented |
| `02-§18.16` | Schedule pages show a "Redigera" link for events with ownership entries or valid admin token, and that have not passed | 03-architecture/forms-and-api.md §7 | — (browser-only: set signed `sb_session`, open `schema.html`, confirm edit links only for signed owned future events) | `source/assets/js/client/session.js` – `signedEntryIds()` plus admin-token branch in `injectEditLinks()` | implemented |
| `02-§18.17` | Edit links are injected by client-side JS; they are never part of the static HTML | 03-architecture/forms-and-api.md §7 | — | `source/build/render.js` – no edit links at build time; `session.js` injects at runtime | implemented |
| `02-§18.18` | Event rows in generated HTML carry a `data-event-id` attribute with the event's stable ID | 03-architecture/forms-and-api.md §7 | RND-46, RND-47 | `source/build/render.js` – `renderEventRow()` adds `data-event-id` | covered |
| `02-§18.19` | The "Redigera" link navigates to `/redigera.html?id={eventId}` | 03-architecture/forms-and-api.md §7 | — | `session.js` – `link.href = 'redigera.html?id=' + encodeURIComponent(id)` | implemented |
| `02-§18.42` | The "Idag" today view (`/idag.html`) shows a "Redigera" link next to each owned or admin-accessible, non-past event — same rule as the weekly schedule | 03-architecture/forms-and-api.md §7 | IDAG-03, IDAG-04 | `source/build/render-idag.js` – loads `session.js`; `source/assets/js/client/session.js` – `injectEditLinks(active, isAdmin)` | implemented |
| `02-§18.43` | The events JSON embedded in `idag.html` includes the event `id` field | 03-architecture/forms-and-api.md §7 | IDAG-01, IDAG-02 | `source/build/render-idag.js` – `id: e.id \|\| null` in events map | covered |
| `02-§18.44` | Event rows rendered dynamically on `idag.html` carry `data-event-id` and `data-event-date` attributes for edit-link injection | 03-architecture/forms-and-api.md §7 | — | `source/assets/js/client/events-today.js` – `idAttr`/`dateAttr` added to both row types; browser-only: verify manually (open idag.html, run `document.querySelectorAll('[data-event-id]')` in console) | implemented |
| `02-§18.20` | An edit page exists at `/redigera.html` | 03-architecture/forms-and-api.md §7 | REDT-01..03 | `source/build/render-edit.js` → `public/redigera.html` | covered |
| `02-§18.21` | The edit page reads the `id` query param, checks for a matching ownership entry, and fetches `/events.json` to pre-populate the form | 03-architecture/forms-and-api.md §7 | — (browser-only: open `redigera.html?id=<owned>` with signed cookie and confirm form populates) | `source/assets/js/client/redigera.js` – `readSessionIds()` returns only signed, non-expired ownership IDs before fetching `/events.json` | implemented |
| `02-§18.22` | If the event has no matching ownership entry and the user has no valid admin token, or the event has passed, the edit page shows an error and no form | 03-architecture/forms-and-api.md §7 | — (browser-only: open `redigera.html?id=<legacy-only>` and confirm Swedish authorization error) | `source/assets/js/client/redigera.js` – client gate uses signed ownership IDs or admin token before showing the form | implemented |
| `02-§18.23` | The edit form exposes the same fields as the add-activity form | 03-architecture/forms-and-api.md §7 | REDT-04..11 | `source/build/render-edit.js` – all add-activity fields present | covered |
| `02-§18.24` | The event's stable `id` must not change after creation even when mutable fields are edited | 06-EVENT_DATA_MODEL.md §4 | EDIT-13 | `source/api/edit-event.js` – `patchEventObject()` preserves `event.id` | covered |
| `02-§18.25` | The edit form is subject to the same validation rules as the add-activity form (§9) | 03-architecture/forms-and-api.md §7 | VLD-27..32 | `source/api/validate.js` – `validateEditRequest()`; `redigera.js` client-side validate | covered |
| `02-§18.26` | After a successful edit, a clear Swedish confirmation is shown; schedule updates within minutes | 03-architecture/forms-and-api.md §7 | — | `render-edit.js` – `#result` section; `github.js` – `updateEventInActiveCamp()` PR pipeline | implemented |
| `02-§18.27` | The edit form is written entirely in Swedish | 02-requirements/platform-security.md §14 | REDT-12..16 | `source/build/render-edit.js` – all labels and messages in Swedish | covered |
| `02-§18.28` | A static `/events.json` file is generated at build time containing all events for the active camp | 03-architecture/forms-and-api.md §7 | — | `source/build/build.js` – writes `public/events.json` | implemented |
| `02-§18.29` | `/events.json` contains only public fields (id, title, date, start, end, location, responsible, description, link); owner and meta are excluded | 03-architecture/forms-and-api.md §7 | STR-JSON-01..02 | `build.js` – `PUBLIC_EVENT_FIELDS` array | covered |
| `02-§18.30` | A `POST /edit-event` endpoint accepts edit requests | 03-architecture/forms-and-api.md §7 | — | `app.js` – `app.post('/edit-event', …)` | implemented |
| `02-§18.31` | The server reads `sb_session` and verifies valid ownership for the target ID, or that the request body contains a valid `adminToken` (§91) | 03-architecture/forms-and-api.md §7 | ADED-01..08, SES-17..21, PSES-02 | `app.js` `/edit-event`; `api/index.php` `handleEditEvent()` use `parseVerifiedSessionIds()` plus admin-token bypass | covered |
| `02-§18.32` | If the cookie lacks valid ownership and no valid admin token is provided, the server responds with HTTP 403 | 03-architecture/forms-and-api.md §7 | ADED-01b, ADED-04..07, SES-18..21, PSES-02 | `app.js` and `api/index.php` reject missing/legacy/tampered/expired ownership without a valid admin token | covered |
| `02-§18.33` | If the event's date has already passed, the server responds with HTTP 400 | 03-architecture/forms-and-api.md §7 | EDIT-01..03 | `app.js` – `isEventPast(req.body.date)` → `res.status(400)` | covered |
| `02-§18.34` | On a valid edit, the server reads YAML from GitHub, replaces mutable fields, commits via ephemeral branch + PR with auto-merge | 03-architecture/forms-and-api.md §7 | EDIT-05..15 | `source/api/github.js` – `updateEventInActiveCamp()` (fragment); `edit-event.js` – `patchEventObject()` | covered |
| `02-§18.35` | The event's `meta.updated_at` is updated on every successful edit | 06-EVENT_DATA_MODEL.md §6 | EDIT-15 | `source/api/edit-event.js` – `patchEventObject()` sets `meta.updated_at = now` | covered |
| `02-§18.36` | Only recognised edit-form fields are written; no unrecognised POST body fields are ever committed | 03-architecture/forms-and-api.md §7 | REDT-21 | `source/api/validate.js` – `validateEditRequest()`; `patchEventObject()` explicit field set | covered |
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
| `02-§19.15` | The modal uses only CSS custom properties from 07-design/css-strategy.md §7 — no hardcoded colors or spacing | 07-design/css-strategy.md §7 | — (code review: grep for hardcoded hex/px values in modal CSS) | `source/assets/cs/style.css` – modal section uses `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`; only `rgba(0,0,0,0.16)` shadow (no design token for overlay shadow) | implemented |
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
| `02-§20.11` | The edit modal uses only CSS custom properties from 07-design/css-strategy.md §7 — no hardcoded colors or spacing | 07-design/css-strategy.md §7 | — (code review: confirm modal CSS uses only custom properties) | `source/assets/cs/style.css` – modal CSS shared with add form; uses `var(--color-*)`, `var(--space-*)`, `var(--radius-*)` | implemented |
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
| `02-§21.29` | Archive page uses the same typography scale, color tokens, and spacing tokens as the rest of the site | 03-architecture/data-layer.md §4a, 07-design/css-strategy.md §7 | — (manual: visual comparison) | `source/assets/cs/style.css` – all archive CSS uses design tokens | implemented |
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
| `02-§24.15` | Desktop: hamburger hidden, all links visible | 07-design/components.md §6 | — (manual: view on ≥768 px viewport, confirm hamburger absent) | `source/assets/css/style.css` – `.nav-toggle { display: none }` at `@media (min-width: 768px)` | implemented |
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
| `02-§28.16` | Uses only CSS custom properties from 07-design/ | 03-architecture/pages-and-content.md §14.6 | — (manual: inspect `style.css` `.upcoming-camps` section — all values use `--color-*`, `--space-*`, `--font-*`, `--radius-*` tokens) | `source/assets/cs/style.css` – upcoming-camps section | implemented |
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
| `02-§30.1` | Hero two-column layout: image ~2/3, sidebar ~1/3 | 03-architecture/pages-and-content.md §15, 07-design/components.md §6 | HERO-01, HERO-02 | `source/build/render-index.js` – `.hero` grid, `.hero-main`, `.hero-sidebar`; `style.css` – `grid-template-columns: 2fr 1fr` | covered |
| `02-§30.2` | Mobile: hero stacks vertically | 03-architecture/pages-and-content.md §15, 07-design/components.md §6 | — (manual: resize to <690px) | `style.css` – `@media (max-width: 690px) { .hero { grid-template-columns: 1fr } }` | implemented |
| `02-§30.3` | Title "Sommarläger i Sysslebäck" above image, left-aligned | 03-architecture/pages-and-content.md §15 | HERO-03 | `source/build/render-index.js` – `<h1 class="hero-title">Sommarläger i Sysslebäck</h1>` | covered |
| `02-§30.4` | Title uses terracotta color | 07-design/components.md §6 | HERO-04 | `style.css` – `.hero-title { color: var(--color-terracotta) }` | covered |
| `02-§30.5` | Title uses H1 size (40px) and weight (700) | 07-design/index.md §3 | HERO-04 | `style.css` – `.hero-title { font-size: 40px; font-weight: 700 }` | covered |
| `02-§30.6` | Hero image has rounded corners (--radius-lg) | 07-design/css-strategy.md §7 | — (manual: visual check) | `style.css` – `.hero-img { border-radius: var(--radius-lg) }` | implemented |
| `02-§30.7` | Hero image uses object-fit: cover and is responsive | 07-design/components.md §6 | HERO-05, HERO-06 | `style.css` – `.hero-img { object-fit: cover; width: 100% }` | covered |
| `02-§30.8` | Image occupies ~2/3 of hero width on desktop | 07-design/components.md §6 | HERO-01 | `style.css` – `.hero { grid-template-columns: 2fr 1fr }` | covered |
| `02-§30.9` | Sidebar contains Discord, Facebook, and EDQ Hub icons | 03-architecture/pages-and-content.md §15.4 | HERO-09, HERO-19 | `source/build/render-index.js` – `.hero-social` with three `.hero-social-link` | covered |
| `02-§30.10` | Discord icon links to Discord channel | 03-architecture/pages-and-content.md §15.4 | HERO-07 | `source/build/render-index.js` – `<a href="${discordUrl}">` | covered |
| `02-§30.11` | Facebook icon links to Facebook group | 03-architecture/pages-and-content.md §15.4 | HERO-08 | `source/build/render-index.js` – `<a href="${facebookUrl}">` | covered |
| `02-§30.12` | Icons displayed at ~64px, vertically centered | 07-design/components.md §6 | — (manual: visual check) | `style.css` – `.hero-social-link img { width: 64px; height: 64px }` | implemented |
| `02-§30.13` | Countdown shows days remaining until next camp | 03-architecture/pages-and-content.md §15.3 | HERO-10 | `source/build/render-index.js` – countdown inline script | covered |
| `02-§30.14` | Countdown target is the nearest upcoming camp's start_date | 03-architecture/pages-and-content.md §15.2 | CDOWN-01, CDOWN-02 | `source/build/utils.js` – `resolveCountdownTarget` | covered |
| `02-§30.15` | Countdown shows large number + "Dagar kvar" label | 07-design/components.md §6 | HERO-11, HERO-13 | `source/build/render-index.js` – `.hero-countdown-number` + `.hero-countdown-label` | covered |
| `02-§30.16` | Countdown target embedded as data-target; JS computes on load | 03-architecture/pages-and-content.md §15.3 | HERO-10 | `source/build/render-index.js` – `data-target="${countdownTarget}"` | covered |
| `02-§30.17` | Countdown hidden if no upcoming camp | 03-architecture/pages-and-content.md §15.3 | HERO-12, CDOWN-08 | `source/build/utils.js` – `resolveCountdownTarget` returns null | covered |
| `02-§30.18` | Countdown has subtle cream/sand background | 07-design/components.md §6 | — (manual: visual check) | `style.css` – `.hero-countdown { background: var(--color-cream-light) }` | implemented |
| `02-§30.19` | All hero styling uses CSS custom properties | 07-design/css-strategy.md §7 | — (manual: CSS review) | `style.css` – all hero rules use `var(--…)` tokens | implemented |
| `02-§30.20` | Countdown JS is minimal, no framework | 03-architecture/pages-and-content.md §15.3 | — (manual: code review) | `source/build/render-index.js` – ~8-line inline `<script>` | implemented |
| `02-§30.21` | Social icon images stored in source/content/images/ | 03-architecture/pages-and-content.md §15.4 | — | `source/content/images/discord-ikon.webp`, `facebook-ikon.webp` | implemented |
| `02-§30.22` | Social links provided at build time, not hardcoded | 03-architecture/pages-and-content.md §15.2 | HERO-14, HERO-15 | `source/build/build.js` – passes `discordUrl`, `facebookUrl` to `renderIndexPage` | covered |
| `02-§30.23` | Countdown background color is `#FAF7EF` (solid, not semi-transparent) | 07-design/components.md §6 | — (manual: visual check) | `style.css` – `.hero-countdown { background: var(--color-cream-light) }` | implemented |
| `02-§30.24` | Discord icon uses `discord-ikon.webp` | 03-architecture/pages-and-content.md §15.4 | HERO-16 | `render-index.js` – `discord-ikon.webp` in Discord link `<img>` | covered |
| `02-§30.25` | Sidebar vertically centered alongside hero image | 07-design/components.md §6 | — (manual: visual check) | `style.css` – `.hero { align-items: center }` | implemented |
| `02-§30.26` | Countdown not displayed while a camp is ongoing (today within start..end) | 03-architecture/pages-and-content.md §15.2 | CDOWN-03..07 | `source/build/utils.js` – `resolveCountdownTarget` returns null when ongoing | covered |
| `02-§30.27` | EDQ Hub icon links to the EDQ Hub community app | 03-architecture/pages-and-content.md §15.4 | HERO-17 | `source/build/render-index.js` – `<a href="${edqhubUrl}">` | covered |
| `02-§30.28` | EDQ Hub icon appears after the Facebook icon | 03-architecture/pages-and-content.md §15.4 | HERO-19 | `source/build/render-index.js` – EDQ Hub block follows Facebook block | covered |
| `02-§30.29` | Each social link opens in a new tab with `rel="noopener noreferrer"` | 03-architecture/pages-and-content.md §15.4 | HERO-20 | `source/build/render-index.js` – `target="_blank" rel="noopener noreferrer"` | covered |
| `02-§30.30` | EDQ Hub icon is an inline-SVG circular badge with accessible label | 03-architecture/pages-and-content.md §15.4 | HERO-18 | `source/build/render-index.js` – inline `<svg>` + `aria-label="EDQ Hub"` | covered |

### 31. Inline Camp Listing and Link Styling

| ID | Requirement | Design ref | Test ID(s) | Implementation | Status |
| --- | --- | --- | --- | --- | --- |
| `02-§31.1` | Camp listing rendered inside intro section after first h4 | 07-design/components.md §6 | — (manual: visual check) | `source/build/build.js` – injects camp HTML after first `</h4>` | implemented |
| `02-§31.2` | Camp listing is not a separate section or nav entry | 07-design/components.md §6 | — (manual: visual check) | `source/content/sections.yaml` – `upcoming-camps` entry removed | implemented |
| `02-§31.3` | Upcoming camps show sun icon (☀️) | 07-design/components.md §6 | — (manual: visual check) | `source/assets/cs/style.css` – `.camp-icon::after { content: '☀️' }` | implemented |
| `02-§31.4` | Past camps show green checkbox (✅) | 07-design/components.md §6 | — (manual: visual check) | `source/assets/cs/style.css` – `.camp-past .camp-icon::after { content: '✅' }` | implemented |
| `02-§31.5` | Status detection remains client-side via data-end | 02-§28.14 | UC-11 | `source/build/render-index.js` – same inline `<script>` | covered |
| `02-§31.6` | Each item shows name, location, date range | 02-§28.11–13 | UC-06 | `source/build/render-index.js` – `renderUpcomingCampsHtml()` | covered |
| `02-§31.7` | Camp information text no longer rendered | — | — | `source/build/render-index.js` – info block removed | implemented |
| `02-§31.8` | Content links use terracotta color | 07-design/index.md §2.1 | — (manual: visual check) | `source/assets/cs/style.css` – `.content a { color: var(--color-terracotta) }` | implemented |
| `02-§31.9` | Content links no underline, underline on hover | 07-design/index.md §2.1 | — (manual: visual check) | `source/assets/cs/style.css` – `.content a { text-decoration: none }` | implemented |
| `02-§31.10` | Markdown converter supports h4 headings | — | — (manual: build output check) | `source/build/render-index.js` – `####` pattern added | implemented |
| `02-§31.11` | All styling uses CSS custom properties | 07-design/css-strategy.md §7 | — (manual: code review) | `source/assets/cs/style.css` | implemented |
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
| `02-§42.32` | Spring QA camp `end_date` equals the next real camp's `opens_for_editing` | 02-requirements/event-data.md §42.9, 03-architecture/data-layer.md §2 | QSEAS-04 | `source/data/camps.yaml` | covered |
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
| `02-§44.15` | PHP API reads and writes `sb_session` using the same URL-encoded JSON ownership-entry format as Node.js | 03-architecture/ci-and-deploy.md §21 | PSES-01, PSES-03, SES-16 | `api/src/Session.php` mirrors Node `{ id, exp, sig }` ownership entries; `api/index.php` add handlers write those entries | covered |
| `02-§44.16` | Cookie attributes match Node.js (Path, Max-Age, Secure, SameSite, Domain) | 03-architecture/ci-and-deploy.md §21 | manual: deploy and test | `api/src/Session.php` | implemented |
| `02-§44.17` | Edit requests verify valid cookie ownership for the target event; 403 if not | 03-architecture/ci-and-deploy.md §21 | PSES-02, ADED-01..08 | `api/index.php` edit/delete handlers call `Session::parseVerifiedSessionIds()` and reject unauthorized requests with 403 | covered |
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
| `02-§45.5` | Times anchored to Europe/Stockholm via TZID + VTIMEZONE | 03-architecture/pages-and-content.md §22 | ICAL-16, ICAL-34, ICAL-35 | `source/build/render-ical.js` – `toIcalDatetime()`, `buildVtimezone()` | covered |
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
| `02-§46.1` | Schedule header calendar icon is inline SVG, 38 px height | 07-design/ | SNP-09 | `source/build/render.js` – inline SVG in `renderSchedulePage()` | covered |
| `02-§46.3` | Calendar icon has no text label | 07-design/ | SNP-10 | `source/build/render.js` – SVG only, no text | covered |
| `02-§46.4` | Calendar icon links to `kalender.html` | 03-architecture/pages-and-content.md §22 | SNP-11 | `source/build/render.js` – `href="kalender.html"` | covered |
| `02-§46.5` | Every schedule event row has per-event `.ics` download link | 03-architecture/pages-and-content.md §22 | SNP-12 | `source/build/render.js` – `icalDownloadLink()` | covered |
| `02-§46.6` | Per-event iCal link labelled "iCal", at end of row | 07-design/ | SNP-12 | `source/build/render.js` – `icalDownloadLink()` | covered |
| `02-§46.7` | Per-event iCal link styled like `.ev-meta` | 07-design/ | manual: visual check | `source/assets/cs/style.css` – `.ev-ical` class | implemented |
| `02-§46.8` | Per-event iCal link uses `download` attribute | 03-architecture/pages-and-content.md §22 | SNP-13 | `source/build/render.js` – `icalDownloadLink()` | covered |
| `02-§46.9` | Schedule page links to `kalender.html` | 03-architecture/pages-and-content.md §22 | SNP-14 | `source/build/render.js` – guide link in intro | covered |
| `02-§46.11` | Calendar tips page uses card-based layout | 07-design/ | KAL-13 | `source/build/render-kalender.js`, `source/assets/cs/style.css` | covered |
| `02-§46.12` | Platform sections visually separated | 07-design/ | KAL-14 | `source/build/render-kalender.js` – one card per platform | covered |
| `02-§46.13` | Webcal URL in copy-friendly code block | 07-design/ | KAL-15 | `source/build/render-kalender.js` – `.ical-url-block` | covered |
| `02-§46.14` | Every VEVENT includes DTSTAMP (RFC 5545 §3.6.1) | 03-architecture/pages-and-content.md §22 | ICAL-29, ICAL-31 | `source/build/render-ical.js` – `buildDtstamp()` | covered |
| `02-§46.15` | DTSTAMP is UTC build-time timestamp (YYYYMMDDTHHMMSSZ) | 03-architecture/pages-and-content.md §22 | ICAL-30 | `source/build/render-ical.js` – `buildDtstamp()` | covered |
| `02-§46.16` | Every today-view event row has per-event iCal download link | 03-architecture/pages-and-content.md §22.5a | IDAG-20; manual: browser check | `source/build/render-idag.js` – `__SHOW_ICAL__` flag; `source/assets/js/client/events-today.js` – `icalLink()` | covered |
| `02-§46.17` | Display view (`live.html`) shows no per-event iCal link | 03-architecture/pages-and-content.md §22.5a | IDAG-21 | `source/build/render-today.js` – flag unset | covered |
| `02-§47.1` | All headings (h1–h6) use terracotta color | 07-design/index.md §3 | HDC-01..03 | `source/assets/cs/style.css` – h1, h2, h3 rules | covered |
| `02-§47.2` | Content links have permanent underline | 07-design/components.md §6 | HDC-04 | `source/assets/cs/style.css` – `.content a` rule | covered |
| `02-§47.3` | Nav/back-links retain existing styles | 07-design/components.md §6 | manual: visual check | no change to `.nav-link` or `.back-link` rules | implemented |
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
| `02-§49.5` | Injection and link checks identical in Node.js and PHP implementations | 03-architecture/ci-and-deploy.md §11.6 | ASEC-01..16; PHP `ValidateTest::testRejectsScriptTagInTitle`, `testRejectsNonHttpLink` (§103) | `source/api/validate.js` + `api/src/Validate.php` | covered |
| `02-§49.6` | Both implementations produce equivalent error messages | 03-architecture/ci-and-deploy.md §11.6 | ASEC-01..16; PHP `ValidateTest` (§103) asserts the same field-named errors | `source/api/validate.js` + `api/src/Validate.php` | covered |
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
| `02-§54.6` | Valid midnight crossing shows green info message on end field | 07-design/components.md §6.44a–6.44g | LVD-07 | `source/assets/js/client/lagg-till.js` `setFieldInfo()`, `checkEndTime()` | covered |
| `02-§54.7` | Info message uses `.field-info` class, no `aria-invalid` | 07-design/components.md §6.44a–6.44g | LVD-09 | `source/assets/cs/style.css` `.field-info`, `lagg-till.js` `setFieldInfo()` | covered |
| `02-§54.8` | Invalid crossing shows red error on end field | 07-design/components.md §6.34–6.39 | VLD-59, VLD-63 | `lagg-till.js`, `redigera.js` `checkEndTime()` | covered |
| `02-§54.9` | Info/error cleared when user edits start or end | 07-design/components.md §6.34–6.39 | manual: browser check | `lagg-till.js` REQUIRED_FIELDS clear listener | implemented |
| `02-§54.10` | Edit form applies same midnight-crossing logic | 05-DATA_CONTRACT.md §4.3 | VLD-62..63 | `source/assets/js/client/redigera.js` `checkEndTime()` | covered |
| `02-§54.11` | Build-time YAML linter applies midnight-crossing threshold | 05-DATA_CONTRACT.md §4.3 | LNT-24..25 | `source/scripts/lint-yaml.js` | covered |
| `02-§55.1` | Modal heading has no visible focus outline | 07-design/components.md §6.53 | MDP-01 | `source/assets/cs/style.css` `.modal-heading:focus` | covered |
| `02-§55.2` | Modal box uses `--radius-lg` (16 px) border-radius | 07-design/components.md §6.50 | MDP-02 | `source/assets/cs/style.css` `.modal-box` | covered |
| `02-§55.3` | Modal box uses `--space-lg` top/bottom padding | 07-design/components.md §6.51 | MDP-03 | `source/assets/cs/style.css` `.modal-box` | covered |
| `02-§55.4` | Modal heading and progress steps are center-aligned | 07-design/components.md §6.52 | MDP-04..05 | `source/assets/cs/style.css` `.modal-heading`, `.submit-progress` | covered |
| `02-§55.5` | Modal entry animation: fade + slide-up, ≤ 300 ms | 07-design/components.md §6.54 | MDP-06 | `source/assets/cs/style.css` `.modal-box` | covered |
| `02-§56.1` | Event detail page renders description as Markdown → HTML | 03-architecture/rendering.md §18.2; 03-architecture/ci-and-deploy.md §20.3 | EVT-23, EVT-25 | `source/build/render-event.js` → `renderDescriptionHtml()` | covered |
| `02-§56.2` | Weekly schedule renders description as Markdown → HTML | 03-architecture/ci-and-deploy.md §20.3 | MKD-D02 (via eventExtraHtml) | `source/build/render.js` → `renderDescriptionHtml()` | covered |
| `02-§56.3` | Today view uses pre-rendered description HTML from build JSON | 03-architecture/ci-and-deploy.md §20.3 | DIS-26, DIS-27, IDAG-19 | `source/build/render-today.js`, `render-idag.js` → `descriptionHtml` in JSON; `events-today.js` → uses `e.descriptionHtml` | covered |
| `02-§56.4` | RSS feed strips Markdown, uses plain text description | 03-architecture/rendering.md §17.3; 03-architecture/ci-and-deploy.md §20.3 | RSS-16 | `source/build/render-rss.js` → `stripMarkdown()` | covered |
| `02-§56.5` | iCal strips Markdown, uses plain text description | 03-architecture/ci-and-deploy.md §20.3 | ICAL-32, ICAL-33 | `source/build/render-ical.js` → `stripMarkdown()` | covered |
| `02-§56.6` | Description Markdown sanitization: raw HTML dropped at parse time, unsafe-scheme URIs (`javascript:`/`vbscript:`/`data:`/`file:`) neutralized in links and images | 03-architecture/ci-and-deploy.md §20.3 | MKD-D07..12, MKD-D25..26, MKD-D28..30, EVT-24 | `source/assets/js/client/markdown-renderers.js` → `renderers`; consumed by `source/build/markdown.js` → `renderDescriptionHtml()` | covered |
| `02-§56.7` | Plain text descriptions render correctly (wrapped in `<p>`) | 03-architecture/ci-and-deploy.md §20.3 | MKD-D01, MKD-D06, MKD-D13..14 | `source/build/markdown.js` → `renderDescriptionHtml()` | covered |
| `02-§56.8` | `.event-description p` no longer applies `font-style: italic` | — | MKD-CSS-01 | `source/assets/cs/style.css` | covered |
| `02-§56.9` | Description CSS uses existing design tokens only | 07-design/css-strategy.md §7 | manual: inspect CSS for hardcoded values | `source/assets/cs/style.css` — no new custom properties added | implemented |
| `02-§56.10` | Shared helper provides `renderDescriptionHtml()` and `stripMarkdown()` | 03-architecture/ci-and-deploy.md §20.3 | MKD-D15, MKD-D24 | `source/build/markdown.js` | covered |
| `02-§57.1` | Users can apply formatting via toolbar without knowing Markdown syntax | — | manual: open form, click each button, verify syntax inserted | `source/assets/js/client/markdown-toolbar.js` | implemented |
| `02-§57.2` | Clicking a toolbar button wraps selected text with Markdown syntax | — | MDT-01..06 | `source/assets/js/client/markdown-toolbar.js` | covered |
| `02-§57.3` | With no selection, toolbar inserts syntax with placeholder and selects it | — | MDT-07..12 | `source/assets/js/client/markdown-toolbar.js` | covered |
| `02-§57.4` | List and quote buttons apply prefix per line for multi-line selections | — | MDT-13..15 | `source/assets/js/client/markdown-toolbar.js` | covered |
| `02-§57.5` | Toolbar appears above description textarea in both forms | — | MDT-16..17 | `source/build/render-add.js`, `source/build/render-edit.js` | covered |
| `02-§57.6` | Buttons appear in order: Bold, Italic, Heading, Bullet, Numbered, Quote | — | MDT-18 | `source/assets/js/client/markdown-toolbar.js` | covered |
| `02-§57.7` | Each button displays an inline SVG icon | — | MDT-19 | `source/assets/js/client/markdown-toolbar.js` | covered |
| `02-§57.8` | Each button has an accessible `aria-label` | — | MDT-20 | `source/assets/js/client/markdown-toolbar.js` | covered |
| `02-§57.9` | Toolbar styled with existing design tokens (no hardcoded values) | 07-design/components.md §6.56–6.63 | manual: inspect CSS for hardcoded values | `source/assets/cs/style.css` | implemented |
| `02-§57.10` | Toolbar logic in shared `markdown-toolbar.js` loaded by both forms | — | MDT-21..22 | `source/build/render-add.js`, `source/build/render-edit.js` | covered |
| `02-§57.11` | No external dependencies added | — | manual: check package.json | — | implemented |
| `02-§57.12` | No live preview — toolbar only inserts syntax | — | manual: confirm no preview UI | — | implemented |
| `02-§57.13` | Toolbar buttons have visible focus indicators | — | MDT-23 | `source/assets/cs/style.css` | covered |
| | | **§61 — Mobile Navigation Improvements** | | | |
| `02-§61.1` | Sticky nav on mobile (≤ 767 px) | 07-design/components.md §6.24-impl | MN-01..03 | `source/assets/cs/style.css` | covered |
| `02-§61.2` | Sticky nav on desktop | 07-design/components.md §6.24-impl | MN-01..03 | `source/assets/cs/style.css` | covered |
| `02-§61.3` | Terracotta hamburger button with white icon | 07-design/components.md §6.21-impl | MN-04..05 | `source/assets/cs/style.css` | covered |
| `02-§61.4` | Rounded corners on hamburger button | 07-design/components.md §6.21-impl | MN-06 | `source/assets/cs/style.css` | covered |
| `02-§61.5` | Terracotta menu panel with white text | 07-design/components.md §6.20-impl | MN-07..08 | `source/assets/cs/style.css` | covered |
| `02-§61.6` | WCAG AA contrast (white on terracotta, 14 px bold) | 07-design/components.md §6.20-impl | manual: verify 14 px bold white on terracotta | `source/assets/cs/style.css` | implemented |
| `02-§61.7` | Floating card appearance (rounded corners, inset margins) | 07-design/components.md §6.20-impl | MN-09..10 | `source/assets/cs/style.css` | covered |
| `02-§61.8` | Visual hierarchy: page links vs section links | 07-design/components.md §6.22-impl | MN-11..14 | `source/assets/cs/style.css` | covered |
| `02-§61.9` | Smooth CSS transition (max-height, 250 ms) | 07-design/components.md §6.23-impl | MN-15..16 | `source/assets/cs/style.css` | covered |
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
| `02-§62.9` | Event-data deploy embeds current prod version | — | EDW-33..36 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
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
| `02-§62.20` | Event-data deploy checks out with tags fetched | — | EDW-33..34 | `.github/workflows/event-data-deploy-post-merge.yml` | covered |
| `02-§62.21` | Defensive fallback: no version when BUILD_VERSION unset in CI | — | VER-06, VER-09 | `source/build/version.js` | covered |
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
| `02-§63.37` | Use data-goatcounter-click attrs | 03-architecture/pages-and-content.md §23.3 | ANA-EVT-01..07 | `source/build/render-index.js`, `render.js` | covered |
| `02-§63.38` | All deploy workflows pass GOATCOUNTER_SITE_CODE | 03-architecture/pages-and-content.md §23.2 | manual: add event, verify script on schema.html | `.github/workflows/event-data-deploy-post-merge.yml`, `deploy-reusable.yml` | implemented |

---

## Sections §58–§83

These sections were authored inline in the test-legend table. Each block keeps
its requirement rows together with the test-legend rows that evidence them.

| Reference | Status / File | Evidence / Suite |
| --- | --- | --- |
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
| `02-§71.12` | covered | CSS uses `var(--color-terracotta)` and spacing tokens from 07-design |
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
| `02-§80.19` | implemented | `app.js` and `api/index.php` `/add-events` merge signed ownership entries for all returned event IDs when cookie consent is accepted; manual integration: submit multi-day activity and inspect `sb_session` |
| `02-§80.20` | manual | Confirmation modal shown before every submission (browser-only) |
| `02-§80.21` | manual | Success message states number of created activities (browser-only) |
| `02-§80.22` | manual | Error displays message; no partial state (browser-only) |
| `02-§80.23` | manual | "Lägg till en till" resets form including day grid (browser-only) |
| `02-§80.24` | DG-12 | Edit form not affected; single day selector remains |
| `02-§80.25` | done | Day grid implemented in vanilla JavaScript |
| `02-§80.26` | done | Day grid uses CSS custom properties from 07-design/ |
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
| `02-§82.3` | CC-09, CC-10 | Both validators enforce the table limits; `responsible` = 60 in `source/api/validate.js` (CC-09/CC-10) and `api/src/Validate.php` (PHPUnit `ValidateTest::testRejects/AcceptsResponsible*`, §103) |
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
| `02-§82.14` | done | Uses CSS custom properties from 07-design/ |
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

## Sections §84–§100

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
| `02-§88.13` | implemented | CSS uses custom properties from 07-design/css-strategy.md §7 |
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
| `02-§89.13` | covered | ADED-01..08 and PSES-02: Node/PHP delete authorization uses signed ownership entry OR valid admin token |
| `02-§89.14` | covered | ADED-01b, ADED-04..07, SES-18..21: missing/legacy/tampered/expired ownership is rejected without valid admin token |
| `02-§89.15` | implemented | app.js returns 400 when isEventPast is true; api/index.php same |
| `02-§89.16` | implemented | app.js returns 400 when isOutsideEditingPeriod is true; api/index.php same |
| `02-§89.17` | covered | FRAGONLY-04, -11: delete removes the event's fragment file via `deleteFile()`; github.js + GitHub.php `removeEventFromActiveCamp` (no camp-YAML write) |
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
| `02-§91.1` | covered | TOK-01..12: single `ADMIN_TOKEN_SECRET` model, `verifyToken` in `admin-token.test.js` |
| `02-§91.2` | covered | TOK-01 fixed vector (Node + PHP `AdminTokenTest.php`); TOK-03/12 round-trips; `source/api/admin.js`, `api/src/Admin.php` |
| `02-§91.3` | covered | TOK-10: `verifyToken` returns null when the secret is empty |
| `02-§91.29` | covered | TOK-05..09: tampered field, unknown role, expired rejected (PHP parity in `AdminTokenTest.php`) |
| `02-§91.30` | implemented | `npm run admin:create` signs offline for `admin`/`early`/`superadmin` (60/90/180 days); manual: minted token round-trips |
| `02-§91.31` | covered | TOK-13, TOK-14: `admin`/`superadmin` admin-equivalent; `early` recognised but not admin |
| `02-§91.32` | covered | TOK-22: `app.js` / `api/index.php` warn when `ADMIN_TOKEN_SECRET` < 32 bytes (parallels SESSION_SECRET, §387) |
| `02-§91.33` | covered | TOK-23, TOK-24: `tokenRole()` + `roleDescription()` map superadmin/admin/early to Swedish rights text; `setStatusWithRole()` renders the bold `Roll: <label>` title; manual: open /token.html with each role and confirm the title and rights (recipient name not shown) |
| `02-§91.34` | covered | MINT-17 (structural): render-admin.js buttons use `.btn-primary`/`.btn-secondary`, no `.btn--*`; `.admin-form form button[type="submit"]` has margin-top; manual: token page buttons match the rest of the site |
| `02-§91.35` | covered | MINT-19 (structural): render-admin.js has the `#token-remove-confirm` alertdialog and `admin.js` opens it from the remove button (no direct `removeItem` on click); manual: click "Ta bort min token" → dialog; Avbryt/Escape keeps token, "Ja, ta bort" removes it |
| `02-§91.36` | covered | TOK-25 (structural): `admin.js` clears `input.value` in the valid-activation branch; manual: activate via link → field is empty afterwards |
| `02-§91.37` | covered | TOK-26 (structural): `admin.js` toggles `submitBtn.disabled` from `input.value.trim()` on `input` + at load; manual: empty field → Aktivera disabled, type → enabled, after activation → disabled |
| `02-§91.4` | implemented | `app.js` POST /verify-admin; `api/index.php` handleVerifyAdmin() |
| `02-§91.5` | implemented | Request body parsed in both Node.js and PHP handlers |
| `02-§91.6` | covered | TOK-03, TOK-04, TOK-13: valid signature + recognised role + future epoch accepted |
| `02-§91.7` | covered | TOK-05..09: tampered/expired token rejected |
| `02-§91.8` | covered | SEC-386-03: constant-time `tokenDigest` + `timingSafeEqual` / `hash_equals(self::tokenDigest)` |
| `02-§91.9` | covered | ADM-11: `renderAdminPage` produces valid HTML document |
| `02-§91.10` | covered | ADM-12, ADM-13: text input + submit button in rendered output |
| `02-§91.11` | implemented | manual: `admin.js` calls `POST /verify-admin` on form submit |
| `02-§91.12` | implemented | manual: `admin.js` stores token in localStorage on success |
| `02-§91.13` | implemented | manual: `admin.js` shows error message on failure |
| `02-§91.14` | covered | ADM-14: page includes page-nav and site-footer |
| `02-§91.15` | covered | ADM-15: token.html not in nav links |
| `02-§91.16` | covered | ADM-21, ADM-24: `isAdminExpired` returns true after 30 days |
| `02-§91.17` | covered | ADM-19..23: expiry checked via `isAdminExpired` function |
| `02-§91.18` | covered | ADM-22, ADM-23: undefined/zero treated as expired |
| `02-§91.19` | covered | ADM-18: footer includes `admin-status` container element |
| `02-§91.20` | implemented | manual: `admin.js` renders nothing when no localStorage data |
| `02-§91.21` | implemented | manual: `admin.js` renders filled lock icon for valid token |
| `02-§91.22` | implemented | manual: `admin.js` renders open lock icon with link for expired |
| `02-§91.23` | implemented | CSS: 16×16 SVG icon, inline-block in footer |
| `02-§91.24` | implemented | `admin.js` sets title="Token aktiv" / "Token utgången" |
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
| `02-§94.21` | implemented | `style.css` new rules use only `--color-*`, `--space-*`, `--radius-*`, `--font-size-*` tokens from `07-design/css-strategy.md §7` |
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
| `02-§96.16` | covered | SWH-12: `fetch` handler returns early for any request whose path ends in `version.json`, so it is never cached or served from the service worker |
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
| `02-§97.1` | implemented | Pages enabled; `gh api repos/SBsommar/sbsommar/pages` returns status `built` with `html_url=https://sbsommar.github.io/sbsommar/` |
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
| `02-§97.13` | covered | README-DOCS-01, README-DOCS-02: `README.md` links to `https://sbsommar.github.io/sbsommar/` and the link sits above the `## For Developers` section |
| `02-§97.14` | covered | README-DOCS-03, README-DOCS-04: `README.md` doc table includes all 10 `docs/*.md` files; drift test keeps the expected list in sync with `docs/` contents |
| `02-§97.15` | covered | DOCS-IDX-01..03: `docs/index.md` carries the reverse-discoverability banner with absolute github.com links to repo, README, and issues |
| `02-§97.16` | covered | DOCS-IDX-04: `docs/index.md` no longer contains any `https://sbsommar.se` link |
| `02-§97.17` | covered | DOCS-IDX-05: `docs/index.md` main copy is project-technical; no camp marketing phrases (`family camp`, `gifted children`, `Sysslebäck`) |
| `02-§97.18` | implemented | Policy declaration; satisfied collectively by §97.19, §97.20, §97.21 |
| `02-§97.19` | covered | DOCS-CFG-05: `docs/robots.txt` (Disallow: /) present; verified to address every user agent |
| `02-§97.20` | covered | DOCS-CFG-06: both `docs/_includes/head-custom.html` (Primer/Minima) and `docs/_includes/head_custom.html` (Cayman) emit `<meta name="robots" content="noindex, nofollow">`; whichever theme GitHub Pages picks, the tag lands in `<head>` — manual browser verification confirms |
| `02-§97.21` | covered | DOCS-CFG-07: no `sitemap.xml`, `sitemap.txt`, or forbidden Jekyll plugins (`jekyll-sitemap`, `jekyll-seo-tag`, `jekyll-feed`) under `docs/` |
| `02-§97.22` | implemented | `docs/_config.yml` `defaults` apply `layout: default`; `docs/_layouts/default.html`. Verified via local Jekyll build: all 36 rendered pages wrapped in the layout, no per-file `layout:` opt-in |
| `02-§97.23` | implemented | `docs/_layouts/default.html` renders the site title as a link to the landing page. Verified in the rendered output |
| `02-§97.24` | implemented | `theme: jekyll-theme-primer`; content in Primer's `container-lg … markdown-body`; `assets/css/style.css` built. Verified in the rendered output |
| `02-§97.25` | covered | DOCS-NAV-05 (`tests/docs-nav.test.js`): every `.md` under `docs/` has front-matter with a non-empty `title` (36/36) |
| `02-§97.26` | implemented | `docs/_layouts/default.html` renders the site title as a link, not an `<h1>`. Verified via build: exactly one `<h1>` on all 36 pages |
| `02-§97.27` | implemented | `docs/_includes/breadcrumb.html`. Verified: `All docs › <Family>` breadcrumb on family pages, absent on the landing page and top-level docs |
| `02-§97.28` | implemented | `docs/_includes/family-nav.html`. Verified: sibling links render on deep pages with the current page excluded; absent on landing/top-level. Nav data verified by DOCS-NAV-01..04 |
| `02-§97.29` | covered | DOCS-NAV-04 (`tests/docs-nav.test.js`): `docs/_data/docs-nav.yml` listings stay in sync with the files on disk, so one edit updates every sibling |

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
| `02-§100.3` | implemented | PHP runtime reads `GITHUB_*`, origins, `COOKIE_DOMAIN`, `BUILD_ENV`, `ADMIN_TOKEN_SECRET` from `$DEPLOY_DIR/.env`; no PHP test harness — manual server verification (submit an event end-to-end) |
| `02-§100.4` | covered | HTACC-01, HTACC-02, HTACC-03: `api/.htaccess` denies dotfiles (2.4 + 2.2) before the rewrite. Manual: `curl -sI .../api/.env` → 403 |
| `02-§100.5` | covered | HTACC-04: `source/static/.htaccess` denies `.env` (2.4 + 2.2); build copies it to `public/.htaccess` |
| `02-§100.6` | implemented | Manual checkpoint — `curl -sI https://sbsommar.se/api/.env` and QA return 403/404 (live Apache/LiteSpeed only) |
| `02-§100.7` | covered | ENVLOC-01, ENVLOC-02: API tar uses `--exclude='.env'`; no step writes `.env` into the web root |
| `02-§100.8` | covered | ENVLOC-03: guarded `mv "$PUBLIC_DIR/api/.env" "$DEPLOY_DIR/.env"` when canonical file absent |
| `02-§100.9` | implemented | `package.json` and `api/composer.json` unchanged by this feature |
| `02-§100.10` | implemented | Local Node API unaffected — `app.js` uses `--env-file=.env`; no PHP runs locally (manual: `npm start`) |
| `02-§100.11` | covered | ENVLOC-04: no `.env.api.persistent`/`.env.api.bak` reference remains; supersedes §53.3 |

### §101 — Signed Session Ownership

| ID | Status | Notes |
| --- | --- | --- |
| `02-§101.1` | covered | SES-16 and PSES-01: Node/PHP ownership entries include signed proof fields |
| `02-§101.2` | covered | SES-19, SES-20, SES-21: signature binds secret, event ID, and expiry |
| `02-§101.3` | implemented | Cookie intentionally omits `HttpOnly`; `session.js` and `redigera.js` read signed-entry IDs for UI hints |
| `02-§101.4` | covered | SES-07..09, SES-14..15, EEC-18..26 verify cookie name, Max-Age, Secure, SameSite, no HttpOnly, and optional Domain |
| `02-§101.5` | covered | ADED-01..08 and PSES-02: edit authorization uses signed ownership OR valid admin token |
| `02-§101.6` | covered | ADED-01..08 and PSES-02: delete authorization uses signed ownership OR valid admin token |
| `02-§101.7` | covered | SES-18 and ADED-01b: raw public event-ID strings do not authorize edit/delete |
| `02-§101.8` | covered | SES-04, SES-05, SES-18..21: malformed, legacy, wrong-secret, tampered, and expired entries are ignored for authorization |
| `02-§101.9` | covered | ADED-02, ADED-03, ADED-08: valid admin token bypass remains available without cookie ownership |
| `02-§101.10` | covered | PSES-03, SES-06, SES-16: add handlers create signed ownership entries and write them through `Set-Cookie` helpers |
| `02-§101.11` | covered | SES-10..13 and EEC-14..17: ownership entries are merged and deduplicated by event ID |
| `02-§101.12` | covered | SES-05, SES-18, ADED-01b: legacy ID-only cookies may be displayed but never authorize |
| `02-§101.13` | implemented | `redigera.js` debug panel labels legacy entries as old/unverifiable and explains they need to be re-added for editing; browser-only manual check |

### §102 — YAML Structure Integrity for Event Submissions

| ID | Status | Notes |
| --- | --- | --- |
| `02-§102.1` | covered | YSEC-01..09, YSEC-13..14: line breaks / control chars (U+0000–U+001F, U+007F) rejected in `title`, `location`, `responsible`, `link`, `ownerName` (add + edit); checked on the trimmed value. `source/api/validate.js` – `hasControlChar()` over `SINGLE_LINE_FIELDS`; `api/src/Validate.php` mirrors |
| `02-§102.2` | covered | YSEC-01..08: the rejection error names the offending field; `app.js` returns HTTP 400 before any GitHub write |
| `02-§102.3` | covered | YSEC-10..12: `description` permits `\t`/`\n`/`\r`, rejects all other control chars; `source/api/validate.js` – `DESCRIPTION_ALLOWED_CONTROLS`; `api/src/Validate.php` mirrors |
| `02-§102.4` | covered | YSEC-15..16: carriage returns in `description` normalised to `\n` in `buildEventYaml()`; `source/api/github.js` + `api/src/GitHub.php` |
| `02-§102.5` | covered | YSEC-20..23: add/batch flows call `assertEventYamlValid()` to parse the full proposed document and confirm the new event id(s) before any branch/PR; `source/api/github.js` (add) + `api/src/GitHub.php` (add + batch) |
| `02-§102.6` | implemented | Architectural: a fragment edit serialises via `buildFragmentYaml` and is re-parsed by `assertFragmentYamlValid` (02-§109.17); a delete removes a file, no serialisation. `source/api/edit-event.js` `patchEventObject`, `source/api/github.js` / `GitHub.php` |
| `02-§102.7` | covered | PHP parity is exercised by the PHPUnit suite (§103): `api/tests/ValidateTest.php` + `api/tests/GitHubTest.php` assert the same control-character, whole-document, indentation and CR behaviour as the Node tests; PHP batch flow also covered |
| `02-§102.8` | covered | YSEC-17..19, YSEC-23: `detectEventIndent()` reads the existing list indentation (default 2); appended block matches it so the document stays valid; `source/api/github.js` + `api/src/GitHub.php` |

### §103 — PHP API Automated Tests

| ID | Status | Notes |
| --- | --- | --- |
| `02-§103.1` | covered | PHARN-01, PHARN-02: `phpunit/phpunit` is a `require-dev` entry in `api/composer.json`; not a production dependency |
| `02-§103.2` | covered | PHARN-05: `api/phpunit.xml` defines a suite over `api/tests/` |
| `02-§103.3` | covered | PHARN-03: `composer test` script in `api/composer.json` runs PHPUnit |
| `02-§103.4` | covered | `api/tests/ValidateTest.php` + `GitHubTest.php` (37 PHPUnit tests) mirror `tests/validate.test.js`/`github.test.js` incl. §102 cases and `responsible` = 60 |
| `02-§103.5` | covered | PHARN-06, PHARN-07: `ci.yml` runs `shivammathur/setup-php` + `composer install` + `composer test` |
| `02-§103.6` | covered | PHARN-08: PHP steps guarded by the existing `has_code` detection; data-only changes skip them (CL-§9.4) |
| `02-§103.7` | implemented | A failing PHPUnit test exits non-zero, failing the `Run PHP tests` step; manual (CI behaviour) |
| `02-§103.8` | implemented | `composer test` runs the suite locally after `composer install` in `api/` (verified: 37 tests, 57 assertions pass) |
| `02-§103.9` | covered | PHARN-09: pre-commit hook (`.githooks/pre-commit`) invokes no `php`/`composer` |

### §104 — Security Hardening (2026-06)

Doc ref: `03-architecture/platform-and-security.md §34`.

| ID | Status | Notes |
| --- | --- | --- |
| `02-§104.1` | covered | SEC-383-03 + PHPUnit `testSanitizeCapsLength`: per-field caps in `META_MAX_LENGTHS`; `source/api/feedback.js` + `api/src/Feedback.php` |
| `02-§104.2` | covered | SEC-383-01, SEC-383-02, SEC-383-04, SEC-383-06 + PHPUnit `testSanitize*`/`testFeedbackTableRowsKeepTwoColumns`: control chars collapsed, backslash escaped before `\|` (CodeQL js/incomplete-sanitization, code-scanning #53); `sanitizeMetaField()` |
| `02-§104.3` | covered | SEC-383-05 + PHPUnit `SecurityHardeningTest`: Node/PHP parity of the sanitiser |
| `02-§104.4` | covered | SEC-385-01, SEC-385-02: `safeLinkHref()` emits href only for `http(s)`; `source/build/utils.js` |
| `02-§104.5` | covered | SEC-385-03: build renderers + `events-today.js` route the link through the guard; `render.js`, `render-arkiv.js`, `events-today.js` |
| `02-§104.6` | covered | SEC-386-01, SEC-386-02 + PHPUnit `testAdminToken*`: digest-based constant-time compare, no length pre-check; `source/api/admin.js` + `api/src/Admin.php` |
| `02-§104.7` | covered | SEC-386-03: Node/PHP parity; source asserts no `length === length` short-circuit |
| `02-§104.8` | covered | SEC-387-01: `.env.example` documents `SESSION_SECRET` with 32-byte minimum |
| `02-§104.9` | covered | SEC-387-02: `app.js` + `api/index.php` warn on a secret shorter than 32 chars; unset disables ownership (fails closed) |
| `02-§104.10` | covered | SEC-371-01, SEC-371-03: `clientIp()` trusts `X-Forwarded-For` only from `TRUSTED_PROXIES`, validates the IP, and uses the right-most (proxy-appended) entry — not the spoofable left-most; `api/index.php` (cross-ref 02-§93.6) |
| `02-§104.11` | covered | SEC-371-02 + PHPUnit `testRateLimitCountsAndTrips`/`testRateLimitSeparatesNamespaces`: `flock(LOCK_EX)` + `ftruncate` read-modify-write; `api/src/RateLimit.php` |
| `02-§104.12` | covered | SEC-387-01: `TRUSTED_PROXIES` documented in `.env.example`; unset ⇒ XFF never trusted |
| `02-§104.13` | covered | SEC-370-02: mutation handlers return HTTP 503 when `$activeCamp` is null; `api/index.php` |
| `02-§104.14` | covered | SEC-370-01, SEC-370-03: bundled `api/data/camps.yaml` resolved first with repo fallback; deploy workflow copies `camps.yaml`; `api/index.php`, `deploy-reusable.yml`, `api/.gitignore` |
| `02-§104.15` | covered | SEC-369-01, SEC-369-04: `check-yaml-security.js` hard-blocks every changed per-camp file; `lint-yaml.js` hard-blocks non-archived camps and is advisory for archived (derived from `camps.yaml`); `event-data-deploy.yml`. Locally simulated: archived edit exit 0, injected `javascript:` link exit 1 |
| `02-§104.16` | covered | SEC-369-02, SEC-369-03: `fetch-depth: 0`, no job-level `if`; validates `event-delete/` and manual data PRs; quoted here-string loop (not a pipe) so a finding reliably fails the job |
| `02-§104.20` | covered | SEC-369-05: single-step diff+validate (no step-output crossing); base SHA via `env: BASE_SHA`, filenames a local var read via quoted here-string; no `${{ }}` in any `run:`, no untrusted write to `GITHUB_OUTPUT`. Locally proved a `x$(…).yaml` filename executes under an interpolated/unquoted-heredoc pattern and is inert under this one |
| `02-§104.17` | covered | SEC-384-01: `source/static/.htaccess` sets a CSP with `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, GoatCounter origins, `'unsafe-inline'` scripts/styles |
| `02-§104.18` | covered | SEC-384-03: `injectHtaccessCsp()` injects the `API_URL` origin into `connect-src` (cross-origin added, same-origin/unset resolves clean, no placeholder left); `source/build/utils.js`, wired in `source/build/build.js` |
| `02-§104.19` | covered | SEC-384-02: `.htaccess` sets `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS |

### §105 — Early Access Role (tidig åtkomst)

Doc ref: `03-architecture/platform-and-security.md §30`.

| ID | Status | Notes |
| --- | --- | --- |
| `02-§105.1` | covered | EARLY-01..02, EARLY-07..10, EARLY-18 + PHPUnit `testVerifyPreCampBypassToken*`: pre-camp gate admits `admin`/`superadmin`/`early`; `source/api/admin.js` + `api/src/Admin.php` `verifyPreCampBypassToken()`, wired in `app.js` and `api/index.php` add/edit/delete |
| `02-§105.2` | covered | EARLY-13..15, EARLY-19 + PHPUnit role gating: ownership OR-condition keeps `verifyAdminToken` (admin/superadmin only); early authorised only via cookie ownership |
| `02-§105.3` | covered | EARLY-11..12: post-camp lock checked before any role bypass; no token admits after `end_date + 1` |
| `02-§105.4` | covered | EARLY-17: `app.js` `/verify-admin` uses `verifyToken`, `api/index.php` `handleVerifyAdmin()` uses `Admin::verifyToken`; manual: activate an early token on `/token.html` |
| `02-§105.5` | covered | EARLY-06, EARLY-19, EARLY-20: `verifyAdminToken` false for early while `verifyPreCampBypassToken` true, in both runtimes |
| `02-§105.6` | covered | EARLY-16: `ROLE_DAYS` maps `early: 90` in `source/scripts/create-admin-token.js`; prompt offers admin/early/superadmin |
| `02-§105.7` | implemented | EARLY-21 (structural: `session.js` `hasValidAdminToken()` requires role admin/superadmin); manual: activate an early token, open the schedule, confirm no edit links on others' events |
| `02-§105.8` | implemented | EARLY-22, EARLY-23 (structural: role-aware label in `redigera.js` + `lagg-till.js`); manual: open `/lagg-till.html` before `opens_for_editing` with an early token and confirm "Öppna ändå (tidig åtkomst)" |
| `02-§105.9` | implemented | EARLY-22 (structural: `redigera.js` ownership shortcut uses `hasAdminRole`); manual: open `redigera.html?id=<annans>` with an early token and confirm "inte rättighet" message |
| `02-§105.10` | implemented | Swedish labels and error texts; manual/visual check (CLI prompts and bypass labels in Swedish) |
| `02-§105.11` | covered | EARLY-21..23: clients read the role from segment 2 only for UI; every privileged action re-verified server-side (EARLY-18..19) |

### §106 — Token Minting from the Web (superadmin)

Doc ref: `03-architecture/platform-and-security.md §30`.

| ID | Status | Notes |
| --- | --- | --- |
| `02-§106.1` | covered | MINT-11, MINT-12: `POST /mint-token` wired in `app.js` and `api/index.php` |
| `02-§106.2` | covered | MINT-09, MINT-10 (gate predicate) + MINT-11/12 (structural); HTTP-verified: admin/early/garbage → 403 |
| `02-§106.3` | covered | MINT-06 + PHPUnit `testRejectsNonWhitelistedRoles`: superadmin/unknown roles rejected 400 |
| `02-§106.4` | covered | MINT-01, MINT-07 + PHPUnit `testSanitisesNameLikeTheCli`: shared `sanitizeTokenName()`; empty → 400 |
| `02-§106.5` | covered | MINT-02..05 + PHPUnit: default = cap (60/90); outside 1..cap or non-integer → 400 |
| `02-§106.6` | covered | MINT-02, MINT-08 + PHPUnit parity vector: token = `signToken(sanitised, role, now+days·86400)`; handlers return it without storing |
| `02-§106.7` | covered | MINT-11, MINT-12: `mintTokenLimiter` (5/h) in `app.js`; `RateLimit::isLimited(.., 'mint-token', 5, 3600)` in PHP |
| `02-§106.8` | covered | MINT-10: empty secret → no requester verifies → gate false (403) |
| `02-§106.9` | covered | MINT-15 (structural: role gate in `admin.js`), MINT-16 (`.admin-form[hidden]` override keeps `hidden` authoritative since `.admin-form` sets display); manual: open /token.html with superadmin vs admin token and confirm section visibility |
| `02-§106.10` | implemented | MINT-14 (markup: name/role/days with data-days); manual: switch role and confirm day default/max follows (60↔90) |
| `02-§106.11` | implemented | MINT-15 (structural: `#token=` link build); manual: mint and confirm the link format |
| `02-§106.12` | covered | MINT-14 (markup: copy button present, no `#mint-share`), MINT-15 (`admin.js` has no `navigator.share`); manual: copy button copies the link |
| `02-§106.13` | implemented | Swedish error strings in `admin.js`/server handlers; manual/visual check |
| `02-§106.14` | implemented | MINT-15 (structural: hash parse + /verify-admin reuse via activateToken); manual: open an activation link and confirm activation |
| `02-§106.15` | implemented | MINT-15 (structural: history.replaceState); manual: confirm the fragment leaves the address bar on success and failure |
| `02-§106.16` | covered | MINT-15: `admin.js` matches `#token=` and contains no `?token=`; link built with `#token=` |
| `02-§106.17` | implemented | Architectural: signing only in `app.js`/`api/index.php` via the shared helpers; no secret reference in any client file |
| `02-§106.18` | implemented | Swedish text; reuses `.admin-form` components; new CSS uses only `--space-*`/`--color-*`/`--font-*`/`--radius-*` tokens; manual/visual |
| `02-§106.19` | covered | MINT-18: `validateMintFields()` rejects empty name and out-of-range/non-integer days with Swedish messages; mint form has `novalidate` + `mint-err-*` field-error spans wired by `setMintFieldError()`; manual: submit empty → Swedish inline errors, no English bubble |
| `02-§106.20` | covered | MINT-17 (structural): `#mint-link` read-only styling (`background` + `cursor: default`) present; manual: link field looks like output, not an input |

### §107 — Location Availability

Doc ref: `03-architecture/pages-and-content.md §16.5`, `03-architecture/rendering.md §5.1`.

| ID | Status | Notes |
| --- | --- | --- |
| `02-§107.1` | covered | LOCAVAIL-02, LOCAVAIL-03: `filterAvailableLocations()` in `source/build/locations.js` reads the optional `active` field |
| `02-§107.2` | covered | LOCAVAIL-01, LOCAVAIL-02: omitted or `true` → kept |
| `02-§107.3` | covered | LOCAVAIL-03, LOCAVAIL-04: `active: false` → removed |
| `02-§107.4` | covered | LOCAVAIL-06, LOCAVAIL-07 (build.js wiring), LOCAVAIL-08: `source/build/build.js` filters before `renderAddPage()` |
| `02-§107.5` | covered | LOCAVAIL-10: filtered list reaches `renderEditPage()` |
| `02-§107.6` | covered | LOCAVAIL-11: filtered list reaches `renderLokalerPage()` |
| `02-§107.7` | covered | LOCAVAIL-12: filtered list reaches `renderLocationAccordions()` |
| `02-§107.8` | covered | LOCAVAIL-09, LOCAVAIL-10: `render-add.js`/`render-edit.js` always append "Annat" |

### §108 — Config-File QA Deploy Trigger

Doc ref: `03-architecture/ci-and-deploy.md §11.5`.

| ID | Status | Notes |
| --- | --- | --- |
| `02-§108.1` | covered | DQT-05: `deploy-qa.yml` push trigger on `main` + `workflow_dispatch` |
| `02-§108.2` | covered | DQT-01, DQT-02, DQT-04: `paths-ignore` targets `20[0-9][0-9]-*.yaml` + `qa-*.yaml`, no catch-all |
| `02-§108.3` | covered | DQT-03: neither `camps.yaml` nor `local.yaml` is ignored |
| `02-§108.4` | covered | DQT-06: `deploy-prod.yml` is `workflow_dispatch` only, no push trigger |

### §109 — Concurrent Event Submission via Fragment Files

Doc ref: `03-architecture/data-layer.md §1.1`, `§3`, `§3.1`, `§3.4`, `§4a`;
`03-architecture/ci-and-deploy.md §11.3`, `§11.4`, `§11.6`;
`05-DATA_CONTRACT.md §2.1`, `§5`, `§6`; `06-EVENT_DATA_MODEL.md §1.1`.

| ID | Status | Notes |
| --- | --- | --- |
| `02-§109.1` | covered | FRAG-01, FRAG-02: `loadCampEvents()` in `source/build/load-events.js` reads camp file + `source/data/<stem>/` |
| `02-§109.2` | covered | FRAG-30, FRAG-31 (+ PHP): `buildFragmentYaml()` in `source/api/github.js` / `GitHub.php` emits a single `event:` mapping |
| `02-§109.3` | covered | FRAG-36, FRAG-04: `fragmentPath()` names the file after the id; `loadCampEvents()` checks stem == id |
| `02-§109.4` | covered | FRAG-01, FRAG-06: `loadCampEvents()` returns camp-file events when no fragment dir / empty dir |
| `02-§109.5` | implemented | `addEventToActiveCamp()` writes a fragment via `fragmentPath`+`buildFragmentYaml` (FRAG-35 path); network write is the e2e/manual checkpoint |
| `02-§109.6` | implemented | `GitHub::addEventsToActiveCamp()` writes one fragment per date on one branch/PR; network write manual |
| `02-§109.7` | covered | FRAG-37, FRAG-38: distinct ids → distinct files (no shared file); same id → same path |
| `02-§109.8` | implemented | Primary path is now the §111.2 pre-check (409 + clear Swedish message, DEDUP-02/-08); the new-file-create-on-existing-id → GitHub 422 → `classifyGitHubError` "En skrivkonflikt uppstod" (§3.3, FRAG-38) is a deep backstop; live 422 manual |
| `02-§109.9` | covered | FRAGONLY-01..04, -10, -11: Node+PHP edit/delete bodies act on `fragmentPath` only and never reference `campFilePath` |
| `02-§109.10` | covered | EDIT-05..15, EEC-01..04: `patchEventObject` preserves id/created_at and bumps updated_at; edit rewrites the fragment via `buildFragmentYaml` |
| `02-§109.11` | covered | FRAGONLY-04, -11: fragment delete via `deleteFile()`, no `putFile` in the delete path |
| `02-§109.12` | covered | FRAGONLY-02, -04, -10, -11: no fragment → `throw`, no camp-YAML write (PHP returns a Swedish error, Node logs) |
| `02-§109.13` | covered | FRAG-02: `build.js` loads the active camp and the archive loop via `loadCampEvents()` |
| `02-§109.14` | covered | FRAG-09: merged set sorted by `groupAndSortEvents()` (date, start) |
| `02-§109.15` | covered | FRAG-05: `loadCampEvents()` de-dups by id (fragment wins) and logs a warning |
| `02-§109.16` | covered | FRAG-02 + build e2e: every view consumes the merged `events` array (verified in `events.json` + `schema.html`) |
| `02-§109.17` | covered | FRAG-40..43 (+ PHP): `assertFragmentYamlValid()` parses one `event:` with the expected id before any branch |
| `02-§109.18` | covered | FRAG-60..66: `validateFragment()` in `lint-yaml.js` checks fields, date, end-after-start |
| `02-§109.19` | covered | FRAG-04: `loadCampEvents()` throws when `event.id` ≠ filename stem; `lint-yaml.js` CLI repeats the check |
| `02-§109.20` | implemented | Add API rejects a duplicate id before any branch via the §111.2 pre-check (409, DEDUP-01/-05), with the 422 create-conflict (02-§109.8) as backstop; `loadCampEvents()` dedup (FRAG-05) keeps the rendered set unique |
| `02-§109.21` | covered | FRAG-80..82 (`check-yaml-security.js` scans a fragment), FRAG-60..66 (`lint-yaml.js` fragment mode) |
| `02-§109.22` | covered | FRAG-50..58: `campFileForPath()` in `source/scripts/changed-camp-file.js`; EDW-29 wires it into the deploy gate |
| `02-§109.23` | covered | EDW-29, EDW-30, FRAG-52: prod gate maps fragment → camp file, then the camps.yaml `qa` lookup |
| `02-§109.24` | covered | FRAG-70..73: fragment-only diff is data-only under `ci.yml`'s `^source/data/` + camps/local rule |
| `02-§109.25` | covered | EDW-31, EDW-32: both event-data workflows trigger on `source/data/**.yaml` (matches nested fragments) |
| `02-§109.26` | covered | FRAGONLY-05, -12: monolith patch/remove helpers removed (Node+PHP); mutation bodies never reference `campFilePath`. Split-at-open implemented (§110); compaction tracked separately |

### §110 — Split a Camp's Seeded Events into Fragments at Opening

Doc ref: `02-requirements/event-data.md §110`; `03-architecture/data-layer.md §1.2`, `§3.4`; `04-OPERATIONS.md` (Camp Lifecycle → When a Camp Opens).

| ID | Status | Notes |
| --- | --- | --- |
| `02-§110.1` | covered | SPLIT-01, SPLIT-08, SPLIT-09: `resolveCampFile()` + `splitCampEvents()` in `source/scripts/split-camp-events.js` write one fragment per camp-file event |
| `02-§110.2` | covered | SPLIT-01, SPLIT-02, SPLIT-07: fragments written to `source/data/<stem>/<event-id>.yaml` via `buildFragmentYaml()`; stem == `event.id` |
| `02-§110.3` | covered | SPLIT-01, SPLIT-10: `emptyEventsList()` keeps the `camp:` header verbatim and leaves `events: []` |
| `02-§110.4` | covered | SPLIT-03: `loadCampEvents()` round-trips the same ids with no doubling; fragments + emptied list written together |
| `02-§110.5` | covered | SPLIT-04, SPLIT-07: each fragment passes `assertFragmentYamlValid`, `validateFragment` (`lint-yaml.js`), `scanYaml` (`check-yaml-security.js`) before any write |
| `02-§110.6` | covered | SPLIT-05: idempotent no-op when the camp file's `events:` list is already empty |
| `02-§110.7` | covered | SPLIT-06: pre-existing fragment for a seeded id aborts with an error and writes nothing |
| `02-§110.8` | covered | `04-OPERATIONS.md` (Camp Lifecycle → When a Camp Opens) documents the manual step run at/just before `opens_for_editing`; manual checkpoint |

### §111 — Duplicate Submission Hardening

Doc ref: `02-requirements/event-data.md §111`;
`03-architecture/ci-and-deploy.md §11.6` (Duplicate-submission hardening).

| ID | Status | Notes |
| --- | --- | --- |
| `02-§111.1` | covered | DEDUP-01 (Node), DEDUP-05 (PHP): `getFileMaybe(fragPath)` runs before `createBranch` in `addEventToActiveCamp`/`addEventsToActiveCamp`; DEDUP-03: `isDuplicateEvent` exported |
| `02-§111.2` | covered | DEDUP-02, DEDUP-08: duplicate → `duplicateEventError`/`DuplicateEventException` → 409 + "Den här aktiviteten finns redan i schemat."; refines 02-§109.8, replaces the 422 path; live 409 is DEDUP-M01 |
| `02-§111.3` | covered | DEDUP-04: `app.js` awaits `isDuplicateEvent` and answers 409 before `res.json(success)`; PHP add is already synchronous (SYNC-03) |
| `02-§111.4` | covered | DEDUP-05/-06/-09: single `addEventToActiveCamp` and batch `addEventsToActiveCamp` both pre-check (PHP); Node has only `/add-event` |
| `02-§111.5` | covered | DEDUP-06, DEDUP-09: batch checks every target before `createBranch` and `handleAddEvents` maps the throw to 409 — atomic, no partial create |
| `02-§111.6` | covered | DEDUPCLEAN-01, -02: `classifyEventPr` treats an empty net diff as redundant → close; the live empty-diff-after-merge premise is DEDUP-M02 |
| `02-§111.7` | implemented | DEDUPCLEAN-01/-02 decide `close`; `main()` runs `gh pr close --delete-branch` on an `event/*` PR — the GitHub close + branch delete is the DEDUP-M02 manual checkpoint |
| `02-§111.8` | implemented | `close-redundant-event-prs` job in `event-data-deploy-post-merge.yml` runs the script on push to `main` (`source/data/**`); CI/manual checkpoint (DEDUP-M02) |
| `02-§111.9` | covered | DEDUPCLEAN-04: a modified (same-id/different-body) fragment → `log-manual`, not closed |

### §112 — Stranded Auto-Merge Recovery

Doc ref: `02-requirements/event-data.md §112`;
`03-architecture/ci-and-deploy.md §11.8` (Stranded auto-merge recovery);
`04-OPERATIONS.md §Merge queue`.

| ID | Status | Notes |
| --- | --- | --- |
| `02-§112.1` | covered | STRAND-01/-02/-03: `classifyStrandedPr` returns `recover` only for an `event/`/`event-edit/`/`event-delete/` branch with auto-merge enabled, `mergeStateStatus === CLEAN`, and no `mergeQueueEntry` |
| `02-§112.2` | implemented | `recoverPr()` calls `disablePullRequestAutoMerge` then `enablePullRequestAutoMerge`; the live "disable→enable creates a fresh queue entry, re-enable alone is a no-op" premise is manual checkpoint STRAND-M01 |
| `02-§112.3` | implemented | `recoverPr()` re-enables with mergeMethod `SQUASH`, matching `enableAutoMerge` in the form API; live behaviour is STRAND-M01 |
| `02-§112.4` | covered | STRAND-04, STRAND-10: `classifyStrandedPr` returns `skip` when a `mergeQueueEntry` is present (already progressing) |
| `02-§112.5` | covered | STRAND-05, STRAND-06: `classifyStrandedPr` returns `skip` when `mergeStateStatus` is not `CLEAN` (checks pending/failing or not mergeable) |
| `02-§112.6` | implemented | Per-PR `try`/`catch` in `main()` isolates a failed read or mutation from the rest of the sweep; exercised live (STRAND-M01) |
| `02-§112.7` | implemented | `recover-stranded-event-prs` job in `event-data-deploy-post-merge.yml` runs on push to `main` (`source/data/**`); CI/manual checkpoint STRAND-M01 |
| `02-§112.8` | implemented | `merge-queue-recovery.yml` runs the sweep on a 15-minute `schedule` cron (plus `workflow_dispatch`); CI/manual checkpoint STRAND-M01 |
| `02-§112.9` | implemented | `main()` filters to open event PRs and returns early with "nothing to recover" when none exist; live behaviour is STRAND-M01 |
| `02-§112.10` | covered | STRAND-10: `classifyStrandedPr` is pure and returns `skip` for any non-stranded PR, so repeated sweeps are no-ops |
| `02-§112.11` | covered | STRAND-11/-12/-13: `recoverPr()` wraps the re-enable in `withRetry` (exponential backoff); disable is a single attempt; live toggle is STRAND-M01 |
| `02-§112.12` | implemented | Both recovery jobs pass `secrets.EVENT_AUTOMERGE_TOKEN` as `GITHUB_TOKEN` (not the default token, which fails auto-merge mutations); live behaviour is manual checkpoint STRAND-M01 |
| `02-§112.13` | covered | STRAND-16/-17 (`processPr` returns `'failed'` on fetch/recover error), STRAND-18/-19 (`runSweep` counts failures and keeps going); `main()` throws when the count is non-zero |
| `02-§112.14` | implemented | `EVENT_AUTOMERGE_TOKEN` documented as a repository-level secret in 08-ENVIRONMENTS; recovery jobs declare no `environment:` so only repo-level secrets resolve |
| `02-§112.15` | implemented | Re-enable runs under the PAT identity so the merge triggers `event-data-deploy-post-merge.yml`; manual checkpoint STRAND-M01 |
| `02-§112.16` | covered | RECTRIG-02: `merge-queue-recovery.yml` declares a `check_suite: [completed]` trigger (schedule + workflow_dispatch retained, RECTRIG-01) |
| `02-§112.17` | covered | RECTRIG-03/-04: scheduled workflow and post-merge job share `concurrency: stranded-recovery` with `cancel-in-progress: false` |
| `02-§112.18` | covered | STRAND-20/-21 (recover on checksPassed + BLOCKED/UNKNOWN), STRAND-22/-23 (skip pending and DIRTY), STRAND-25 (CLEAN still recovers); `fetchPrState` reads `statusCheckRollup.state` |

### §113 — Proactive Merge-Queue Enqueue

Doc ref: `02-requirements/event-data.md §113`;
`03-architecture/forms-and-api.md §30` (Proactive Merge-Queue Enqueue);
`03-architecture/ci-and-deploy.md §11.8` (cross-reference).

| ID | Status | Notes |
| --- | --- | --- |
| `02-§113.1` | implemented | `enqueueBestEffort(pr.node_id)` runs after `enableAutoMerge` in add/edit/delete (Node) and add/batch/edit/delete (PHP); the mutation shape is ENQ-01/-02/-04 (Node) + PHP parity; the live "PR lands in the queue" is manual checkpoint ENQ-M01 |
| `02-§113.2` | implemented | Each call site keeps `enableAutoMerge(pr.node_id)` immediately before the enqueue call, so a non-mergeable PR still queues via auto-merge once checks pass; code-review checkpoint, live behaviour is ENQ-M01 |
| `02-§113.3` | covered | ENQ-03 (Node) + `testBuildEnqueueMutationSpecifiesNoMergeMethod` (PHP): the mutation contains no `mergeMethod`; ENQ-05 confirms it selects `mergeQueueEntry`, not `enablePullRequestAutoMerge` |
| `02-§113.4` | covered | ENQ-06/-07/-10: `enqueueBestEffort` calls the impl once on success and never throws when it rejects (sync throw or rejected Promise) |
| `02-§113.5` | covered | ENQ-09: a "checks still running" failure is swallowed and reported as not enqueued; the queue actually declining an unmergeable PR is live checkpoint ENQ-M01 |
| `02-§113.6` | covered | ENQ-08: exactly one warning is logged on failure and nothing else; no GitHub issue is created (the best-effort wrapper only calls `log`) |
| `02-§113.7` | covered | ENQ-07: the enqueue step is contained so the submission outcome is unchanged whether enqueue succeeds or fails |
| `02-§113.8` | covered | Recovery (`recover-stranded-event-prs.js`, §112) is untouched; STRAND-01..13 still pass. A proactively enqueued PR has a `mergeQueueEntry`, so `classifyStrandedPr` returns `skip` (STRAND-04) and recovery still catches any PR that later falls out of the queue |
| `02-§113.9` | covered | The event-data validation gate (`check-yaml-security.js`, `lint-yaml.js`) and API-layer validation are unchanged; YSEC/validation tests still pass. Enqueue only changes when a PR enters the queue, not whether its required checks run |

### §114 — Quick-Add Activity Button in Sticky Navigation

Doc ref: `02-requirements/pages-navigation.md §114`;
`03-architecture/pages-and-content.md §12.7` (Quick-add activity button);
`07-design/components.md §6.125–6.127` (Quick-add activity button design).

| ID | Status | Notes |
| --- | --- | --- |
| `02-§114.1` | covered | QADD-05/-08 confirm the button (a `lagg-till.html` link) renders on every non-add page; `layout.js` `pageNav()`. Mobile-only visibility is manual checkpoint (open schema.html at ≤767 px) |
| `02-§114.2` | covered | QADD-07: the button is rendered before (outside) `.nav-menu`, so it is reachable without opening the hamburger; `layout.js` `pageNav()` |
| `02-§114.3` | covered | QADD-01/-02/-03: `<a class="quick-add-btn" href="lagg-till.html" aria-label="Lägg till aktivitet">`; `source/build/layout.js` |
| `02-§114.4` | covered | QADD-06/-09: omitted when `activeHref === 'lagg-till.html'`; `source/build/layout.js` |
| `02-§114.5` | covered | QADD-10/-11: `.quick-add-btn { display: none }` by default, `display: flex` inside `@media (max-width: 767px)`; `source/assets/cs/style.css`. Desktop absence is manual checkpoint |
| `02-§114.6` | covered | QADD-12: `right: calc(var(--space-sm) + 42px + var(--space-xs))` between scroll-top and feedback; `source/assets/cs/style.css`. Visual placement is manual checkpoint |
| `02-§114.7` | covered | QADD-11: 42 × 42 px, `var(--color-terracotta)`, white icon, `var(--radius-md)`; `source/assets/cs/style.css` |
| `02-§114.8` | covered | QADD-04: inline SVG plus icon inside the anchor; `source/build/layout.js` |
| `02-§114.9` | covered | QADD-13: `.pwa-install-btn` mobile rule uses `right: calc(var(--space-sm) + 3 * (42px + var(--space-xs)))` (one slot left of the edit-shortcut button, which took the slot beside quick-add); `source/assets/cs/style.css` |

### §115 — Edit-Shortcut Button in Sticky Navigation

Doc ref: `02-requirements/pages-navigation.md §115`;
`03-architecture/pages-and-content.md §12.8` (Edit-shortcut button);
`07-design/components.md §6.128–6.130` (Edit-shortcut button design).

| ID | Status | Notes |
| --- | --- | --- |
| `02-§115.1` | covered | ESHORT-01/-09: `.edit-shortcut-btn` link to `redigera.html` renders on non-edit pages; `layout.js` `pageNav()`. Browser-verified reveal for an owner is a manual checkpoint |
| `02-§115.2` | covered | ESHORT-11/-13: hidden by default; revealed only on a positive ownership check in `nav.js`. Manual checkpoint: no cookie → no button |
| `02-§115.3` | covered | ESHORT-18: `nav.js` never references `sb_admin`. Manual checkpoint: admin token only → button stays hidden |
| `02-§115.4` | covered | ESHORT-01/-02/-03: `<a class="edit-shortcut-btn" href="redigera.html" aria-label="Redigera mina aktiviteter" hidden>`; `source/build/layout.js` |
| `02-§115.5` | covered | ESHORT-07/-10: omitted when `activeHref === 'redigera.html'`; `source/build/layout.js` |
| `02-§115.6` | covered | ESHORT-15/-16/-17: `nav.js` reads `sb_session` signed entries, fetches `events.json`, sets `btn.hidden = false` for an owned event with `date >= today`; `source/assets/js/client/nav.js` |
| `02-§115.7` | covered | ESHORT-18: the `nav.js` reveal IIFE never consults the admin token; `source/assets/js/client/nav.js` |
| `02-§115.8` | covered | ESHORT-11/-12/-13: `.edit-shortcut-btn { display: none }` default, `flex` inside `@media (max-width: 767px)`, `[hidden]` re-hide; `source/assets/cs/style.css`. Desktop absence is a manual checkpoint |
| `02-§115.9` | covered | ESHORT-08/-14: rendered in the floating-action-button group, outside `.nav-menu`; positioned `right: calc(var(--space-sm) + 2 * (42px + var(--space-xs)))` beside the quick-add button; `layout.js` / `style.css` |
| `02-§115.10` | covered | ESHORT-12: 42 × 42 px, `var(--color-terracotta)`, white icon, `var(--radius-md)`; `source/assets/cs/style.css` |
| `02-§115.11` | covered | ESHORT-05: inline SVG pencil icon inside the anchor; `source/build/layout.js` |
