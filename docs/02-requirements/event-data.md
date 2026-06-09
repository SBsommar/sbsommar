---
title: "SB Sommar – Requirements: Event Data"
---

# SB Sommar – Requirements: Event Data

Event data: source-of-truth YAML, locations, archive policy, naming convention, derived active camp, QA isolation, the camps.yaml validator.

Part of [the requirements index](./index.md). Section IDs (`02-§N.M`) are stable and cited from code; they do not encode the file path.

---

## 16. Archive

Past camps must remain accessible.

- When a camp ends, it becomes an archived camp. Its data is never deleted. <!-- 02-§16.1 -->
- The archive page must list all past camps and link to their schedules. <!-- 02-§16.2 -->
- When no camp is active, the most recent archived camp is shown by default. <!-- 02-§16.3 -->
- The archive must be usable and complete, not a placeholder. <!-- 02-§16.4 -->

---

---

## 18. Participant Event Editing

Participants who submit events should be able to edit those events for as long as
the event is in the future. This uses a lightweight, cookie-based ownership model
that requires no login.

### 18.1 Ownership and session cookie

- When a participant's event is successfully created, the server sets a session
  cookie in the response containing an ownership entry for the event. <!-- 02-§18.1 -->
- The session cookie stores a JSON array of ownership entries for events the
  current browser owns; see §101 for the signed authorization format. <!-- 02-§18.2 -->
- The cookie has a `Max-Age` of 7 days; each ownership entry carries the same
  signed expiry horizon, and submitting another event refreshes both the cookie
  lifetime and existing valid ownership entries. <!-- 02-§18.3 -->
- The cookie uses the `Secure` flag (HTTPS only) and `SameSite=Strict` to prevent
  cross-site misuse. <!-- 02-§18.4 -->
- **The session cookie is intentionally JavaScript-readable (not `httpOnly`).**
  Because the schedule pages are static HTML pre-rendered at build time, client-side
  JavaScript is the only layer that can read the cookie and show or hide edit links
  per event. Server-side validation of signed ownership on every edit/delete
  request compensates for the absence of `httpOnly`. This trade-off is explicit
  and documented. <!-- 02-§18.5 -->
- The session cookie is initially set only by the server. Client-side JavaScript
  may write back the cookie solely during expiry cleanup (§18.14), but must never
  create ownership proof or add unauthorized ownership entries. <!-- 02-§18.6 -->
- The cookie name is `sb_session`. <!-- 02-§18.7 -->
- When the API server and the static site are deployed on different subdomains
  (e.g. `api.sommar.example.com` and `sommar.example.com`), the session cookie
  must be set with a `Domain` attribute covering the shared parent domain so that
  client-side JavaScript running on the static site can read the cookie via
  `document.cookie`. The domain is supplied via the `COOKIE_DOMAIN` environment
  variable. If the variable is not set, no `Domain` attribute is included and the
  cookie is scoped to the API host only (acceptable for single-origin deployments). <!-- 02-§18.41 -->

### 18.2 Cookie consent

- Before the server sets the session cookie, the client must first obtain the
  user's explicit consent through a modal dialog on the add-activity form. <!-- 02-§18.8 -->
- If the user accepts, the form submission proceeds and the server sets the
  session cookie in its response. <!-- 02-§18.9 -->
- If the user declines, the form submission still proceeds (the event is still
  submitted), but the server does not set the session cookie and the user receives
  no editing capability. <!-- 02-§18.10 -->
- Only an **accepted** decision is stored in `localStorage` as `sb_cookie_consent`.
  A declined decision is not persisted — the prompt will appear again next time
  the user submits an event, allowing them to change their mind. <!-- 02-§18.11 -->
- The consent prompt must be written in Swedish. <!-- 02-§18.12 -->

### 18.3 Expiry management

- On every page load, client-side JavaScript reads the session cookie and removes
  ownership entries for events whose date has already passed. <!-- 02-§18.13 -->
- The cleaned cookie is written back. If no ownership entries remain after
  cleaning, the cookie is deleted. <!-- 02-§18.14 -->
- When the client writes back the cleaned cookie, it must include the same
  `Domain` attribute the server used. The domain value is injected at build time
  via a `data-cookie-domain` attribute on the `<body>` element. If the attribute
  is absent or empty, no `Domain` is included (single-origin fallback). <!-- 02-§18.47 -->
- The build process must read the `COOKIE_DOMAIN` environment variable and inject
  it as a `data-cookie-domain` attribute on the `<body>` element of every page
  that loads `session.js`. <!-- 02-§18.48 -->
- "Passed" means the event's date is strictly before today's local date. <!-- 02-§18.15 -->
- Ownership entries present in the session cookie but not found in `events.json`
  must be kept — not removed. A recently submitted event may not yet appear in
  the JSON because the event-data deploy is still in progress. Removing unknown
  entries would silently discard the session cookie the server just set.
  <!-- 02-§18.49 -->

### 18.4 Edit links on schedule pages

- Schedule pages add an "Redigera" link next to each event with an ownership
  entry in the session cookie **or** whose user holds a valid admin token (§91),
  and whose date has not passed. <!-- 02-§18.16 -->
- The link is injected by client-side JavaScript after page load; it is never
  part of the static HTML. <!-- 02-§18.17 -->
- Each event row in the generated HTML carries a `data-event-id` attribute
  containing the event's stable ID so JavaScript can identify it. <!-- 02-§18.18 -->
- The "Redigera" link navigates to `/redigera.html?id={eventId}`. <!-- 02-§18.19 -->

### 18.7 Edit links on the Idag today view

- The "Idag" today view (`/idag.html`) also shows a "Redigera" link next to
  each event the visitor owns or for which the visitor holds a valid admin
  token (§91), and that has not passed — using the same rule and link text
  as the weekly schedule. <!-- 02-§18.42 -->
- The events JSON embedded in `idag.html` at build time includes the event's
  `id` field so client-side JavaScript can associate rendered rows with their
  stable IDs. <!-- 02-§18.43 -->
- Event rows rendered dynamically on `idag.html` carry `data-event-id` and
  `data-event-date` HTML attributes so `session.js` can inject the edit link
  using the same mechanism as on `schema.html`. <!-- 02-§18.44 -->

### 18.5 Edit form

- An edit page exists at `/redigera.html`. <!-- 02-§18.20 -->
- When loaded, it reads the `id` query parameter, checks the session cookie for
  a matching ownership entry, and fetches `/events.json` to pre-populate the form
  with the event's current values. <!-- 02-§18.21 -->
- If the event has no matching ownership entry in the session cookie and the user
  does not hold a valid admin token (§91), or the event has already passed, the
  page shows a clear error and no form is rendered. <!-- 02-§18.22 -->
- The edit form exposes the same fields as the add-activity form (title, date,
  start time, end time, location, responsible person, description, link). <!-- 02-§18.23 -->
- The event's stable `id` must not change after creation, even when mutable
  fields are edited. <!-- 02-§18.24 -->
- The edit form is subject to the same field-level validation rules as the
  add-activity form (§9). <!-- 02-§18.25 -->
- After a successful edit, a clear Swedish confirmation is shown. The schedule
  updates within a few minutes via the same PR auto-merge pipeline. <!-- 02-§18.26 -->
- The edit form is written entirely in Swedish (§14). <!-- 02-§18.27 -->

### 18.6 Event data API

- A static file `/events.json` is generated at build time containing all events
  for the active camp. <!-- 02-§18.28 -->
- The file contains only fields that appear in the edit form (id, title, date,
  start, end, location, responsible, description, link). Internal fields
  (`owner`, `meta`) are excluded. <!-- 02-§18.29 -->

### 18.10 Server-side edit endpoint

- A `POST /edit-event` endpoint accepts edit requests. <!-- 02-§18.30 -->
- The server reads the `sb_session` cookie from the request and verifies a valid
  ownership entry for the target event ID — or that the request body contains a
  valid `adminToken` (§91). <!-- 02-§18.31 -->
- If the cookie does not contain valid ownership for the event and no valid admin
  token is provided, the server responds with HTTP 403. <!-- 02-§18.32 -->
- If the event's date has already passed, the server responds with HTTP 400. <!-- 02-§18.33 -->
- If validation passes, the server reads the YAML file from GitHub, replaces the
  target event's mutable fields in place, and commits the change via an ephemeral
  branch and PR with auto-merge — the same pipeline used for additions. <!-- 02-§18.34 -->
- The event's `meta.updated_at` field is updated on every successful edit. <!-- 02-§18.35 -->
- Only fields that are part of the edit form are written. No unrecognised fields
  from the request body are ever committed. <!-- 02-§18.36 -->

### 18.8 Client-side cookie mechanics

- The add-activity form submission must use `credentials: 'include'` so that
  `Set-Cookie` response headers from the cross-origin API are applied by the
  browser. Without this, the cookie is silently discarded. <!-- 02-§18.37 -->
- The cookie consent prompt must be displayed as a modal dialog (with backdrop,
  focus trap, and centered box) so the user cannot miss it. The modal reuses the
  same styling and accessibility patterns as the submit-feedback modal. <!-- 02-§18.38 -->
- The add-activity form does not include an owner name field. Event ownership is
  established entirely via the session cookie; no name is required for the editing
  mechanism to work. <!-- 02-§18.39 -->
- The add-activity submit handler must only reference form elements that are
  rendered in the form HTML. Accessing a missing element via `form.elements`
  returns `undefined`; calling `.value` on it throws a `TypeError` that aborts
  the submission and breaks the consent banner interaction. <!-- 02-§18.40 -->

### 18.9 Edit form API mechanics

- The edit form must submit to the `/edit-event` endpoint. The build step derives
  the edit URL from the `API_URL` environment variable by replacing a trailing
  `/add-event` path segment with `/edit-event`; if `API_URL` does not end with
  `/add-event`, the edit URL falls back to `/edit-event`. <!-- 02-§18.46 -->
- The edit form submission must use `credentials: 'include'` so that the
  `sb_session` cookie is sent to the cross-origin API. Without this the server
  cannot verify ownership and will reject the request with HTTP 403. <!-- 02-§18.45 -->
- When the user holds a valid admin token (§91), the edit and delete request
  bodies must include `adminToken` so the server can verify admin
  status. <!-- 02-§18.50 -->

---

---

## 21. Archive Timeline

The archive page (`/arkiv.html`) presents past camps as an interactive vertical
timeline. Each camp is a point on the timeline that expands to show details.

### 21.1 Timeline layout

- Only camps with `archived: true` in `camps.yaml` are shown. <!-- 02-§21.1 -->
- Camps are listed newest first (descending by `start_date`). <!-- 02-§21.2 -->
- The timeline is vertical; each camp is a point on a vertical line. <!-- 02-§21.3 -->

### 21.2 Accordion interaction

- Each camp is rendered as an accordion item — a clickable header that expands
  to reveal camp details below. <!-- 02-§21.4 -->
- Only one accordion item may be open at a time; opening a new item closes
  any previously open item. <!-- 02-§21.5 -->
- Each accordion header uses a `<button>` element with `aria-expanded` and
  `aria-controls` attributes so screen readers announce the state. <!-- 02-§21.6 -->
- Keyboard users must be able to open and close accordion items using Enter
  or Space on the focused header button. <!-- 02-§21.7 -->

### 21.3 Accordion content

Each expanded accordion shows, in order: <!-- 02-§21.8 -->

- Information text (only if non-empty in `camps.yaml`) <!-- 02-§21.9 -->
- A link to the Facebook group (only if `link` is non-empty in `camps.yaml`) <!-- 02-§21.10 -->

Date range and location are already displayed in the accordion header
(§21.4) and must not be repeated inside the panel. <!-- 02-§21.31 -->

Fields that are empty or absent must not produce blank rows or placeholder
text. <!-- 02-§21.11 -->

### 21.4 Header layout

The accordion header must display the camp name as the primary text, followed
by the date range and location in subdued (gray) text to the right. <!-- 02-§21.12 -->

- The date range is formatted as `D–D månadsnamn YYYY` (or spanning months
  when the camp crosses a month boundary). <!-- 02-§21.13 -->
- The location follows the date range, separated by a centered dot
  (`·`). <!-- 02-§21.14 -->
- On narrow viewports the metadata may wrap below the camp name, but must
  remain visually subdued. <!-- 02-§21.15 -->

### 21.5 Active camp indicator

- When a camp accordion is expanded, its timeline dot must be visually
  highlighted — larger and with an accent color — to mark the selected
  camp on the timeline. <!-- 02-§21.16 -->
- When the accordion is collapsed the dot returns to its default
  size. <!-- 02-§21.17 -->

### 21.6 Facebook logo link

- When a camp has a non-empty `link` field, the expanded panel must show
  the Facebook logo image (`images/facebook-ikon.webp`)
  as a clickable link to the Facebook group, replacing the previous text
  button. <!-- 02-§21.18 -->
- The logo must be placed at the top of the panel content, near the camp
  metadata. <!-- 02-§21.19 -->
- The link must open in a new tab (`target="_blank"`,
  `rel="noopener noreferrer"`). <!-- 02-§21.20 -->
- The image must have an accessible `alt` text (e.g.
  "Facebookgrupp"). <!-- 02-§21.21 -->

### 21.7 Event list in archive

Each expanded accordion must display the camp's events below the description
and Facebook link. Events are loaded from the camp's event YAML file at build
time. <!-- 02-§21.22 -->

- Events are grouped by date, with each date shown as a heading (e.g.
  "måndag 3 augusti 2025"). <!-- 02-§21.23 -->
- Within each date, events are sorted by start time
  ascending. <!-- 02-§21.24 -->
- Each event row uses the same visual format as the weekly schedule page:
  time range, title, and location/responsible metadata. <!-- 02-§21.25 -->
- Day headings are plain headings, not collapsible. <!-- 02-§21.26 -->
- Event rows that have a `description` or `link` field must be rendered as
  expandable `<details>` elements — identical to the weekly schedule page
  (`schema.html`). The ℹ️ icon and dotted-underline title style must
  appear on these rows. <!-- 02-§21.27 -->
- Event rows without `description` or `link` remain flat (plain `<div>`),
  showing only time, title, and metadata. <!-- 02-§21.32 -->
- If a camp has no events in its YAML file, the event list section is
  omitted entirely. <!-- 02-§21.28 -->

### 21.8 Visual consistency

- The archive page must use the same typography scale, color tokens, and
  spacing tokens as the rest of the site. <!-- 02-§21.29 -->
- The event list styling in the archive must match the weekly schedule page
  in font size, weight, and color for time, title, and metadata
  spans. <!-- 02-§21.30 -->

---

---

## 28. Upcoming Camps on Homepage

The homepage must show a list of upcoming (and recently past) camps so that
visitors can see what is planned and what has already happened this year.

### 28.1 Filtering

- The list must include all camps where `archived` is `false` OR the camp's
  `start_date` year matches the current year. <!-- 02-§28.1 -->
- "Current year" is evaluated at page-load time in the visitor's browser,
  not at build time. <!-- 02-§28.2 -->

### 28.2 Sorting

- Camps are sorted by `start_date` ascending (nearest date first). <!-- 02-§28.3 -->

### 28.3 Past-camp marking

- A camp is considered "past" when its `end_date` is strictly before today. <!-- 02-§28.4 -->
- "Today" is evaluated client-side using Stockholm time
  (`Europe/Stockholm`). <!-- 02-§28.5 -->
- Past camps are displayed with a green checkmark (`✔`) and strikethrough
  text, making it immediately clear they have already taken place. <!-- 02-§28.6 -->
- Upcoming camps are displayed with an unchecked indicator (`☐`) and
  normal text. <!-- 02-§28.7 -->

### 28.4 Section placement

- The section is rendered as part of the index page, using data from
  `camps.yaml`. <!-- 02-§28.8 -->
- The section heading is "Kommande läger". <!-- 02-§28.9 -->
- The section must appear as a content section on the index page, positioned
  via `sections.yaml` like other sections. <!-- 02-§28.10 -->

### 28.5 Camp item content

- Each camp item shows: camp name, location, and formatted date range
  (e.g. "2 aug – 9 aug 2026"). <!-- 02-§28.11 -->
- The camp name is rendered as plain text, not a clickable link. <!-- 02-§28.12 -->
- The camp name uses `var(--color-terracotta)`. <!-- 02-§28.18 -->
- If the camp has a non-empty `information` field, the information text is
  shown below the camp entry. <!-- 02-§28.13 -->

### 28.6 Client-side date logic

- The past/upcoming status is determined by a small client-side script
  that runs on page load. The build renders all qualifying camps with
  `data-end` attributes; JavaScript applies the visual state. <!-- 02-§28.14 -->
- This avoids the need for daily rebuilds to keep the status current. <!-- 02-§28.15 -->

### 28.7 Implementation constraints

- The section uses only CSS custom properties from `docs/07-design/css-strategy.md §7`.
  No hardcoded colors, spacing, or typography. <!-- 02-§28.16 -->
- The client-side script is minimal — no framework, no external
  dependency. <!-- 02-§28.17 -->

---

---

## 29. Camp Naming Convention

The `name` field in `camps.yaml` follows a fixed format so that camp
titles are consistent across the archive, upcoming camps section, and
any other display.

- The format is: `{type} {year} {month}`, where `{type}` is the camp
  series name (e.g. "SB sommar", "SB vinter"), `{year}` is the four-digit
  year, and `{month}` is the Swedish month name in lowercase. <!-- 02-§29.1 -->
- Month names follow Swedish convention and are never
  capitalised. <!-- 02-§29.2 -->
- The camp type name uses sentence case — only the first word is
  capitalised (e.g. "SB sommar", not "SB Sommar"). <!-- 02-§29.3 -->

---

---

## 34. Derived Active Camp

The active camp must be derived automatically from camp dates at build time
and at API request time. The manual `active` field is removed from the data
model. This ensures exactly one camp is active at all times without manual
intervention.

### 34.1 Derivation rules

Exactly one camp is active at any time, selected by a date-based priority
applied at both build time and at API request time — today on dates →
nearest future `start_date` → latest `end_date`, with the earlier
`start_date` winning any overlap. See `03-architecture/data-layer.md §2 "Metadata
Layer"` for the canonical rules and the shared resolver
(`source/scripts/resolve-active-camp.js`). <!-- 02-§34.1 --> <!-- 02-§34.2 --> <!-- 02-§34.3 --> <!-- 02-§34.4 --> <!-- 02-§34.5 -->

### 34.2 Data model changes

- The `active` field is removed from `camps.yaml` entries. <!-- 02-§34.6 -->
- The `active` field is removed from the data contract (`05-DATA_CONTRACT.md`). <!-- 02-§34.7 -->
- The `active + archived` conflict check is removed from lint-yaml.js
  (the conflict is impossible when `active` no longer exists). <!-- 02-§34.8 -->

### 34.3 Build-time resolution

- `build.js` resolves the active camp by applying the derivation rules
  at build time using the current date. <!-- 02-§34.9 -->
- The resolved camp is logged to stdout for operator visibility. <!-- 02-§34.10 -->

### 34.4 API resolution

- `github.js` resolves the active camp using the same derivation rules
  when handling add-event and edit-event requests. <!-- 02-§34.11 -->
- The derivation logic is shared between build and API (not duplicated). <!-- 02-§34.12 -->

### 34.5 Validation

- `lint-yaml.js` no longer checks for the `active` field or the
  `active + archived` conflict. <!-- 02-§34.13 -->
- Existing tests that assert on the `active` field are updated or
  removed. <!-- 02-§34.14 -->

---

---

## 37. camps.yaml Validator

A validation and sync tool that enforces `camps.yaml` as the single source of truth
for camp metadata, ensures referenced camp files exist, and keeps camp headers in
sync.

### 37.1 camps.yaml validation

- The validator must check that every entry in `camps.yaml` has all required fields:
  `id`, `name`, `start_date`, `end_date`, `opens_for_editing`, `location`, `file`,
  `archived`. <!-- 02-§37.1 -->
- `start_date`, `end_date`, and `opens_for_editing` must be valid `YYYY-MM-DD`
  dates. <!-- 02-§37.2 -->
- `end_date` must be on or after `start_date`. <!-- 02-§37.3 -->
- `archived` must be a boolean. <!-- 02-§37.4 -->
- Camp `id` values must be unique across all entries. <!-- 02-§37.5 -->
- Camp `file` values must be unique across all entries. <!-- 02-§37.6 -->
- The validator must exit with a non-zero code if any validation error is
  found. <!-- 02-§37.7 -->

### 37.2 Camp file creation

- If a camp entry's `file` does not exist in `source/data/`, the validator must
  create it automatically. <!-- 02-§37.8 -->
- The created file must contain a `camp:` header with `id`, `name`, `location`,
  `start_date`, and `end_date` — all sourced from `camps.yaml`. <!-- 02-§37.9 -->
- The created file must contain an empty `events: []` section. <!-- 02-§37.10 -->
- Field order in the `camp:` header must be: `id`, `name`, `location`,
  `start_date`, `end_date`. <!-- 02-§37.11 -->

### 37.3 Camp header sync

- `camps.yaml` is the single source of truth for camp metadata. <!-- 02-§37.12 -->
- When a camp file exists, the validator must compare its `camp:` header fields
  (`id`, `name`, `location`, `start_date`, `end_date`) against `camps.yaml`. <!-- 02-§37.13 -->
- If any field differs, the validator must update the camp file to match
  `camps.yaml`, preserving the `events:` section unchanged. <!-- 02-§37.14 -->
- The field order after sync must be: `id`, `name`, `location`, `start_date`,
  `end_date`. <!-- 02-§37.15 -->

### 37.4 Integration

- The validator must be runnable as `npm run validate:camps`. <!-- 02-§37.16 -->
- The validator must log each action (created file, synced header, validation error)
  to stdout. <!-- 02-§37.17 -->
- The validator must be importable as a module for use in tests. <!-- 02-§37.18 -->

---

---

## 42. QA Camp Isolation

QA and Production share the same `camps.yaml` registry and the same git branch.
A dedicated QA camp allows testing the full event flow without polluting
production data: it is invisible to production builds and APIs, and is always
the active camp in QA environments. See `03-architecture/data-layer.md §2 "QA camp
isolation"` for the canonical filter mechanism (driven by `BUILD_ENV`) and the
seasonal QA-camp model. The subsections below capture the operational
requirements that flow from that design.

### 42.1 Data model (data requirements)

- `camps.yaml` entries may include an optional `qa` field of type
  boolean. <!-- 02-§42.1 -->
- When `qa` is omitted or `false`, the camp is a normal production
  camp. <!-- 02-§42.2 -->
- When `qa` is `true`, the camp is a QA-only camp. <!-- 02-§42.3 -->

### 42.2 QA camp entry (data requirements)

- The existing `2026-02-testar` camp must be renamed to
  `id: qa-testcamp`. <!-- 02-§42.4 -->
- Its `file` must be renamed to `qa-testcamp.yaml`. <!-- 02-§42.5 -->
- Its date range must span the full calendar year (e.g.
  `start_date: 2026-01-01`, `end_date: 2026-12-31`) so that events
  submitted on any day of the year pass date validation. <!-- 02-§42.6 -->
- Its `opens_for_editing` must be set to the start of the year so the
  form is always open. <!-- 02-§42.7 -->
- It must have `qa: true`. <!-- 02-§42.8 -->
- The corresponding data file must be renamed from
  `2026-02-testar.yaml` to `qa-testcamp.yaml`, with the camp header
  updated to match. <!-- 02-§42.9 -->
- Existing events in the file are preserved (they are test
  data). <!-- 02-§42.10 -->

### 42.3 Production filtering (site requirements)

- In production (`BUILD_ENV=production`), the build must exclude all
  camps with `qa: true` before resolving the active
  camp. <!-- 02-§42.11 -->
- In production, the API must exclude all camps with `qa: true` before
  resolving the active camp for add-event and edit-event
  requests. <!-- 02-§42.12 -->
- QA camps must never appear in production schedule pages, today view,
  archive, RSS feed, or the upcoming-camps list on the index
  page. <!-- 02-§42.13 -->
- In production, `build.js` must filter `qa: true` camps from the
  camps array before passing it to any rendering function, so that
  all downstream output is QA-free without per-renderer
  checks. <!-- 02-§42.30 -->

### 42.4 QA resolution (site requirements)

- In QA (`BUILD_ENV=qa`), if a camp with `qa: true` exists and its
  dates cover today, it must win the active camp resolution regardless
  of other camps' dates. <!-- 02-§42.14 -->
- The resolution priority in QA is: QA camp on dates first, then
  normal derivation rules for remaining camps. <!-- 02-§42.15 -->
- This ensures the QA camp is always active in QA, even when a real
  production camp's dates also cover today. <!-- 02-§42.16 -->

### 42.5 Environment signal (site requirements)

- The build must read a `BUILD_ENV` environment variable to determine
  the environment (`qa` or `production`). <!-- 02-§42.17 -->
- `deploy-reusable.yml` must pass the environment name as `BUILD_ENV`
  to the build step. <!-- 02-§42.18 -->
- The API (`app.js`) must read `BUILD_ENV` from its environment to
  apply the correct filtering. <!-- 02-§42.19 -->
- `.env.example` must document the `BUILD_ENV` variable. <!-- 02-§42.20 -->
- When `BUILD_ENV` is not set (local development), no filtering is
  applied — all camps are included, and normal derivation rules
  apply. <!-- 02-§42.21 -->

### 42.6 Resolve function changes (site requirements)

- `resolveActiveCamp()` must accept an optional `environment`
  parameter (e.g. `'qa'`, `'production'`). <!-- 02-§42.22 -->
- When `environment` is `'production'`, camps with `qa: true` are
  filtered out before resolution. <!-- 02-§42.23 -->
- When `environment` is `'qa'`, QA camps that are on dates take
  priority over non-QA camps. <!-- 02-§42.24 -->
- When `environment` is not set, the function behaves as it does
  today (no filtering, no QA priority). <!-- 02-§42.25 -->

### 42.7 Validation (site requirements)

- `lint-yaml.js` must accept `qa` as a valid optional boolean field
  in `camps.yaml` entries. <!-- 02-§42.26 -->
- The camps.yaml validator (`validate-camps.js`) must accept `qa` as
  a valid optional boolean field. <!-- 02-§42.27 -->

### 42.8 Yearly maintenance (operational)

- Once per year, the QA camp's date range should be updated to cover
  the new calendar year. <!-- 02-§42.28 -->
- This is a manual one-line change in `camps.yaml` — no automation
  is required. <!-- 02-§42.29 -->

### 42.9 Seasonal QA camp model (data requirements)

#### 42.9.1 Context

The active QA camp must close before the upcoming real camp's pre-camp
preparation period and reopen after the real-camp season ends, so QA
testing never overlaps the real-camp window. See
`03-architecture/data-layer.md §2 "QA camp isolation"` for the spring/autumn camp
descriptions and the off-season window.

#### 42.9.2 Requirements

- Two QA-only camps exist in `camps.yaml` at any time: one "spring" camp
  active in the period leading up to the next real camp, and one "autumn"
  camp active after the real-camp season. <!-- 02-§42.31 -->
- The spring QA camp's `end_date` is two weeks before the
  `start_date` of the next non-QA, non-archived camp. <!-- 02-§42.32 -->
- No QA-only camp's date range covers the period from the spring QA camp's
  `end_date` (exclusive) until the autumn QA camp's `start_date` (exclusive),
  so no QA camp is active in QA during the real-camp season. <!-- 02-§42.33 -->
- The autumn QA camp's `start_date` is `YYYY-10-01` and its `end_date`
  is `YYYY-12-31`, where `YYYY` is the current calendar year. <!-- 02-§42.34 -->
