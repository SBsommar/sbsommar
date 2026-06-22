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

The active QA camp stays open until the upcoming real camp opens for
editing, then hands over to that real camp; a separate autumn QA camp
reopens after the real-camp season ends. This keeps an open camp available
for QA testing at all times except the real camp's own active window. See
`03-architecture/data-layer.md §2 "QA camp isolation"` for the spring/autumn
camp descriptions and the off-season window.

#### 42.9.2 Requirements

- Two QA-only camps exist in `camps.yaml` at any time: one "spring" camp
  active in the period leading up to the next real camp, and one "autumn"
  camp active after the real-camp season. <!-- 02-§42.31 -->
- The spring QA camp's `end_date` is the date on which the next non-QA,
  non-archived camp opens for editing (its `opens_for_editing`), so the QA
  camp stays open for testing right up until the real camp's pre-camp
  preparation period begins. <!-- 02-§42.32 -->
- No QA-only camp's date range covers the period from the spring QA camp's
  `end_date` (exclusive) until the autumn QA camp's `start_date` (exclusive),
  so no QA camp is active in QA during the real-camp season. <!-- 02-§42.33 -->
- The autumn QA camp's `start_date` is `YYYY-10-01` and its `end_date`
  is `YYYY-12-31`, where `YYYY` is the current calendar year. <!-- 02-§42.34 -->

---

---

## 107. Location Availability

### 107.1 Context

The camp uses a fixed set of physical locations (`source/data/local.yaml`) —
tents, halls, the school, the youth centre, and so on. Not every location is
available every year; some seasons the camp has no access to the school or the
youth centre. Administrators need a simple way to mark such a location as
unavailable so it disappears from the places participants can choose and browse,
without deleting it from the data (it returns next year by flipping one setting).

### 107.2 Requirements

- Each location entry in `source/data/local.yaml` may include an optional
  boolean field `active`. <!-- 02-§107.1 -->
- When `active` is `true` or omitted, the location is available. <!-- 02-§107.2 -->
- When `active` is `false`, the location is unavailable for the current
  camp. <!-- 02-§107.3 -->
- Unavailable locations are not offered as options in the location dropdown of
  the add-activity form. <!-- 02-§107.4 -->
- Unavailable locations are not offered as options in the location dropdown of
  the edit-activity form. <!-- 02-§107.5 -->
- Unavailable locations are not listed on the Lokaler page (the per-location
  schedule grid). <!-- 02-§107.6 -->
- Unavailable locations are not shown in the location accordions in the
  "Lokaler" section of the homepage. <!-- 02-§107.7 -->
- The "Annat" fallback option remains available in the add-activity and
  edit-activity forms regardless of location availability, so an activity can
  always be placed somewhere. <!-- 02-§107.8 -->

---

---

## 109. Concurrent Event Submission via Fragment Files

### 109.1 Context

Activities are submitted through the add-activity form in bursts — many families
add their events within the same few minutes during an active camp. Each
submission becomes its own pull request that auto-merges into `main` through the
merge queue.

When every submission writes to the *same* region of the *same* file (appending
to the end of the active camp's `events:` list), pull requests cut from the same
`main` produce overlapping "append at end" diffs. The first merges; the rest
become textually conflicting against the new `main`. The merge queue cannot
resolve text conflicts, so the conflicting pull requests stay open with green CI
and auto-merge enabled but can never complete, and the submitted activities never
reach the site until someone rebuilds each branch by hand.

Storing each submitted event as its own file removes the shared region entirely:
two submissions never touch the same file, so their pull requests can never
conflict and the merge queue merges them in any order. The camp's YAML file
remains the long-term store; the per-camp fragment directory holds events
submitted during the live window. A separate maintenance step that periodically
folds fragments back into the camp file (compaction) is tracked as its own
follow-up and is not part of this section — until it runs, fragments simply
accumulate and the build reads them alongside the camp file.

The same shared-region problem applies to deletions and edits. When a delete or
edit rewrites the whole camp YAML file, two such pull requests cut from the same
`main` conflict exactly as appends did; a delete pull request also freezes a
whole-file snapshot that goes stale, so merging it can reintroduce events other
pull requests removed and drop events they added (issue #467). The desired state
is therefore that add, edit, and delete all act only on fragment files and never
write the camp YAML file. This requires an open camp's events to be stored as
fragments in the first place: when a camp opens, its seeded events are split into
fragments (split-at-open, §110), and compaction folds them back
into the camp YAML file after the camp is archived. Between those two maintenance
steps the camp YAML file's `events:` list is empty and the fragments are the
camp's live events.

### 109.2 Fragment storage layout (data requirements)

- A camp's events are sourced from two places that the build treats as one set:
  the camp's YAML file (`source/data/<file>`) and an optional fragment directory
  `source/data/<stem>/`, where `<stem>` is the camp's `file` value without its
  `.yaml` extension (e.g. file `2026-06-syssleback.yaml` → directory
  `source/data/2026-06-syssleback/`). <!-- 02-§109.1 -->
- Each fragment file is named `<event-id>.yaml` and contains a single top-level
  `event:` mapping whose fields match one entry of the camp file's `events:` list
  (`id`, `title`, `date`, `start`, `end`, `location`, `responsible`,
  `description`, `link`, `owner`, `meta`). <!-- 02-§109.2 -->
- A fragment file's `event.id` equals its filename without the `.yaml`
  extension. <!-- 02-§109.3 -->
- The fragment directory is optional. A camp with no fragment directory behaves
  exactly as a camp whose events live entirely in its YAML
  file. <!-- 02-§109.4 -->

### 109.3 Submission writes (site requirements)

- A single event submitted via `POST /add-event` is written as one new fragment
  file `source/data/<stem>/<event-id>.yaml` on its ephemeral branch — never by
  appending to the camp YAML file. <!-- 02-§109.5 -->
- A batch submission (a `dates` array — the same activity on several dates) writes
  one new fragment file per date, all on a single ephemeral branch and pull
  request. <!-- 02-§109.6 -->
- Because each submission creates only new files with submission-specific names,
  two submissions in flight at the same time never modify the same file; their
  pull requests therefore never textually conflict and the merge queue can merge
  them in any order without manual intervention. <!-- 02-§109.7 -->
- If a fragment file with the target id already exists (a genuine duplicate of the
  same activity at the same date and start time), the submission fails with a
  clear Swedish error rather than silently overwriting the existing
  event. <!-- 02-§109.8 -->

### 109.4 Edit and delete (site requirements)

- Edit and delete operate only on the event's fragment file
  (`source/data/<stem>/<event-id>.yaml`); neither operation reads or modifies the
  camp's YAML file. <!-- 02-§109.9 -->
- `POST /edit-event` for an event stored as a fragment rewrites that fragment file
  (`source/data/<stem>/<event-id>.yaml`) in place on its ephemeral branch,
  preserving the event's `id` and `meta.created_at` and updating
  `meta.updated_at`. <!-- 02-§109.10 -->
- `POST /delete-event` for an event stored as a fragment removes that fragment
  file on its ephemeral branch. <!-- 02-§109.11 -->
- An edit or delete request for an event id that has no fragment file makes no
  change and fails with a clear Swedish error; it never writes the camp YAML
  file. <!-- 02-§109.12 -->

### 109.5 Build-time merge (site requirements)

- Wherever the build loads a camp's events — the active camp and every camp shown
  in the archive — it loads them by merging the camp YAML file's `events:` list
  with every `event:` mapping found in that camp's fragment
  directory. <!-- 02-§109.13 -->
- The merged event set is sorted by the site's existing deterministic order (date,
  then start time), so a fragment event appears in its correct chronological
  position alongside camp-file events. <!-- 02-§109.14 -->
- If the same event id appears both in the camp YAML file and in a fragment, the
  build keeps a single event for that id (the fragment taking precedence) and logs
  a warning. <!-- 02-§109.15 -->
- Every downstream output (weekly schedule, today view, live/display view,
  per-event pages, `events.json`, RSS feed, iCal feed, archive) is produced from
  the merged event set, so a fragment event is indistinguishable from a camp-file
  event in every view. <!-- 02-§109.16 -->

### 109.6 Validation (site requirements)

- Every fragment file must be valid YAML containing exactly one `event:`
  mapping. <!-- 02-§109.17 -->
- A fragment event is subject to the same field validation as a camp-file event:
  required fields present, a valid `YYYY-MM-DD` date, and end time after start time
  (CL-§5.6–5.8). <!-- 02-§109.18 -->
- A fragment file's `event.id` must equal its filename stem; a mismatch is a
  validation error. <!-- 02-§109.19 -->
- Event ids must be unique across a camp's YAML file and all of its fragment
  files. <!-- 02-§109.20 -->
- Fragment files are covered by the repository's YAML security and lint checks
  (`check-yaml-security.js`, `lint-yaml.js`) exactly as other files under
  `source/data/` are. <!-- 02-§109.21 -->

### 109.7 Deploy and CI detection (site requirements)

- The post-merge event-data deploy workflow attributes a changed file to a camp so
  it can build and (for production) apply QA gating: a changed path
  `source/data/<stem>/<file>.yaml` is attributed to the camp whose `file` is
  `<stem>.yaml`, and a changed top-level path `source/data/<file>.yaml` is
  attributed to the camp whose `file` is `<file>.yaml`. This refines the inline
  detection of §51.5. <!-- 02-§109.22 -->
- The production deploy job's QA gating uses this camp attribution: when the
  changed fragment (or camp file) belongs to a camp with `qa: true`, the
  production deploy is skipped, exactly as for a changed camp YAML file. This
  refines the QA gating of §51.7. <!-- 02-§109.23 -->
- A commit that changes only fragment files under `source/data/` (no `camps.yaml`,
  no `local.yaml`, and no non-data code) is a data-only change: `ci.yml` skips
  `npm ci`, build, lint, and tests for it, and the post-merge deploy workflow
  builds and deploys it (CL-§9.4, §50.6). <!-- 02-§109.24 -->
- The post-merge deploy workflow and the event-data PR-check workflow trigger on
  fragment paths, because their `source/data/**.yaml` path filter matches files
  nested one level under `source/data/`. <!-- 02-§109.25 -->

### 109.8 Fragment-only mutation (site requirements)

- No add, edit, or delete request writes a camp's YAML file. A camp's `events:`
  list is maintained only by out-of-band steps outside the live submission flow:
  the split that moves an open camp's events into fragments (§110), and the
  compaction that folds fragments back after the camp is archived. <!-- 02-§109.26 -->

---

## 110. Split a Camp's Seeded Events into Fragments at Opening

### 110.1 Context

A camp is seeded as a monolith before it opens: organizers handwrite the
activities directly in the camp's YAML `events:` list, so a camp file such as
`2026-07-syssleback.yaml` already holds events before the camp opens for
editing.

Fragment-only mutation (§109.26) means add, edit, and delete never write the
camp YAML file — they only act on fragment files under `source/data/<stem>/`.
A seeded event that still lives in the camp YAML file therefore has no fragment,
so once the camp opens a participant who tries to edit or delete it gets a "not
found" failure. Splitting the seeded events into fragments at opening is the
inverse of compaction (§109.1); together they form the camp lifecycle: split at
open → fragments while the camp is live → compaction at archive.

### 110.2 The split step (site requirements)

- A maintenance script `source/scripts/split-camp-events.js` takes a single camp
  argument — the camp's `file` value or its `id` — and writes every event in that
  camp's YAML `events:` list into the camp's fragment directory, one fragment file
  per event. <!-- 02-§110.1 -->
- Each fragment is written to `source/data/<stem>/<event-id>.yaml`, where `<stem>`
  is the camp `file` value without its `.yaml` extension, with the same layout as
  a submitted fragment: one top-level `event:` mapping (§109.2) whose filename
  stem equals `event.id` (§109.3). <!-- 02-§110.2 -->
- After the split, the camp YAML file retains its `camp:` header and its `events:`
  key holds an empty list. <!-- 02-§110.3 -->
- The split writes the fragments and empties the camp file's `events:` list in a
  single commit, so at no committed state does an event exist both in the camp
  file and as a fragment. <!-- 02-§110.4 -->

### 110.3 Validity and safety (site requirements)

- Each fragment the split produces passes the same checks as any fragment file:
  `assertFragmentYamlValid`, `lint-yaml.js` (`validateFragment`), and
  `check-yaml-security.js` (§109.17–§109.21). <!-- 02-§110.5 -->
- The split is idempotent: run on a camp whose YAML `events:` list is already
  empty, it makes no change (no-op). <!-- 02-§110.6 -->
- If a fragment file already exists for a seeded event's id, the split makes no
  change to any file and fails with a clear error, so an existing fragment is
  never overwritten. <!-- 02-§110.7 -->

### 110.4 Lifecycle placement (operational requirement)

- `docs/04-OPERATIONS.md` documents the split as a manual step an organizer runs
  when a camp opens for editing (at or shortly before its `opens_for_editing`
  date), placed in the camp lifecycle as: split at open → fragments while the camp
  is live → compaction at archive. <!-- 02-§110.8 -->

---

## 111. Duplicate Submission Hardening

### 111.1 Context

Activities are submitted in bursts (§109.1). An event's id is derived from its
title, date, and start time, so submitting the same activity twice produces the
same id and therefore the same fragment file path
(`source/data/<stem>/<event-id>.yaml`). Two such submissions try to create the
same new file, which collides in one of two windows:

- **Already merged.** The first submission has already merged, so the fragment
  exists on `main`. The second submission cuts a branch and tries to create a
  file that already exists. Today this surfaces as a generic write-conflict
  error ("En skrivkonflikt uppstod", §109.8) raised *after* a branch has been
  created — or, in the Node runtime where the GitHub write is fire-and-forget, as
  a silent background failure after the form has already reported success.
- **Concurrent.** Both submissions are in flight before either merges, so neither
  sees the other's fragment on `main`. Both pull requests are created; the first
  merges, and the second becomes redundant — the file it would add already exists
  on `main`. It lingers as an open pull request that a maintainer must close by
  hand (issue #480; observed as #473/#474, "Färga t-shirt pass 5-6").

The id formula (title + date + start) is intentional and unchanged: two
submissions that resolve to the same id are treated as the same activity. The
desired state is that neither window produces a stuck pull request or a confusing
error.

### 111.2 Duplicate pre-check before submission (site requirements)

- Before any branch or pull request is created, the add flow checks whether the
  target fragment file (`source/data/<stem>/<event-id>.yaml`) already exists on
  `main`. <!-- 02-§111.1 -->
- If the target fragment already exists on `main`, the submission is rejected with
  HTTP 409 and a Swedish message stating that the activity already exists in the
  schedule — not a generic write-conflict message. No branch or pull request is
  created. This refines §109.8. <!-- 02-§111.2 -->
- The duplicate pre-check runs synchronously, before the success response is sent,
  so the user always sees the rejection. This holds both in the PHP runtime, where
  the whole submission is synchronous, and in the Node runtime, where the GitHub
  write is otherwise fire-and-forget and the check must therefore complete before
  the response. <!-- 02-§111.3 -->
- The duplicate pre-check applies to both a single submission (`POST /add-event`)
  and a batch submission (`POST /add-events`). <!-- 02-§111.4 -->
- A batch submission is rejected as a whole when any of its target fragment files
  already exists on `main`; the Swedish message states that one or more of the
  chosen dates already have this activity. No fragment from a rejected batch is
  created. <!-- 02-§111.5 -->

### 111.3 Concurrent-duplicate cleanup (site requirements)

- When two identical submissions are created before either merges, both
  pre-checks pass because neither fragment is yet on `main`. After the first
  merges, the second submission's pull request adds a file that already exists on
  `main` with identical content, so its net diff against `main` is
  empty. <!-- 02-§111.6 -->
- An event pull request — a branch named `event/*` that changes only files under
  `source/data/` — whose net diff against `main` is empty is closed automatically
  and its branch deleted, without maintainer action. The activity is already on
  the site from the first pull request, so nothing is lost. <!-- 02-§111.7 -->
- The cleanup runs after each merge of event data to `main`, re-evaluating the
  open event pull requests so that one made redundant by the merge is closed
  promptly. <!-- 02-§111.8 -->
- A concurrent submission that resolves to the same id but carries a different body
  (so its net diff against `main` is not empty) is outside this automatic cleanup;
  it is logged for manual attention rather than closed silently, so the residual
  edge stays visible. <!-- 02-§111.9 -->

## 112. Stranded Auto-Merge Recovery

### 112.1 Context

Event pull requests opened by the form API (add, edit, delete) have auto-merge
enabled at creation (§109, §110, §111). All pull requests to `main` merge through
a merge queue required by the `main` branch ruleset: when a pull request's required
checks pass and auto-merge is enabled, GitHub places it in the queue, which re-tests
each entry on a temporary `gh-readonly-queue/main/*` branch and merges entries one at
a time.

Event submissions arrive in bursts (§109.1), so several event pull requests often
compete for the queue at once. When one pull request merges, `main` advances. A
sibling pull request whose auto-merge was enabled against the previous `main` tip
can then be left **stranded**: it has auto-merge enabled, all required checks green,
and a clean mergeable state, yet it never reaches the queue and never merges. GitHub
treats auto-merge as already enabled, so a second enable request changes nothing; the
pull request only re-enters the queue when auto-merge is disabled and then enabled
again, which registers a fresh queue entry against the current `main`.

The observable signature of a stranded pull request is precise: auto-merge enabled,
required checks passing, mergeable state clean, and **no merge-queue entry**. A
pull request that is genuinely progressing through the queue has a merge-queue entry
and is not stranded. (Issue #495; observed as #486, an edit pull request that was
stranded when #482 merged ahead of it on 2026-06-21.)

This failure mode is independent of the duplicate-submission handling in §111: a
stranded pull request has a valid, non-empty diff and should merge — it is simply
stuck in the queue handoff.

### 112.2 Stranded pull request recovery (site requirements)

- A stranded event pull request is one that is open, whose head branch is named
  `event/*`, `event-edit/*`, or `event-delete/*`, that has auto-merge enabled, whose
  required status checks have all passed, and that has no merge-queue entry. Its
  mergeable state may already report clean, or may still be catching up
  (see §112.18). <!-- 02-§112.1 -->
- Recovery keys off the status-check rollup, not the mergeable-state status. After a
  check suite completes, GitHub can take minutes to recompute a pull request's
  mergeable state to clean, and no further check-suite event follows to re-trigger
  recovery in that window. Recovery therefore treats an event pull request whose
  checks have all passed and that is not in the queue as stranded even while its
  mergeable state still reports `BLOCKED` or `UNKNOWN`; a mergeable state of clean
  also qualifies. A pull request whose mergeable state reports a real conflict
  (`DIRTY`) is not recovered, because re-enabling auto-merge cannot resolve a
  conflict. <!-- 02-§112.18 -->
- A stranded event pull request is recovered by disabling and then re-enabling
  auto-merge, which registers a fresh merge-queue entry against the current `main`
  so the pull request merges. Re-enabling auto-merge without first disabling it is a
  no-op and does not recover the pull request. <!-- 02-§112.2 -->
- Recovery re-enables auto-merge with the squash merge method, matching how the form
  API enables auto-merge at submission. <!-- 02-§112.3 -->
- An event pull request that already has a merge-queue entry is left untouched: it is
  progressing through the queue normally and disabling its auto-merge would remove it
  from the queue. <!-- 02-§112.4 -->
- An event pull request whose required checks are still pending, or have failed, is
  left untouched: it is not yet eligible to merge, so there is nothing to
  recover. <!-- 02-§112.5 -->
- The re-enable step is retried with backoff. Once auto-merge has been disabled, a
  transient failure to re-enable it would leave the pull request with auto-merge off
  — worse than stranded — so re-enabling is retried until it succeeds or the
  attempts are exhausted, in which case the failure is logged. The disable step is
  not retried: if it fails the pull request is unchanged and the next recovery pass
  retries the whole recovery. <!-- 02-§112.11 -->
- Each event pull request is evaluated in isolation, so a failure to read or recover
  one pull request does not abort the recovery of the others. <!-- 02-§112.6 -->
- When one or more stranded pull requests could not be recovered during a pass, the
  recovery job exits with a non-zero status after it has attempted every pull request.
  A failed recovery surfaces as a failed job, not a silent warning on an otherwise
  green run. <!-- 02-§112.13 -->

### 112.3 When recovery runs (site requirements)

- Recovery runs after each merge of event data to `main`, in the same post-merge
  pipeline as the concurrent-duplicate cleanup (§111.8). That merge is what advances
  the base and can strand a sibling pull request, so recovery happens immediately
  when stranding is most likely. <!-- 02-§112.7 -->
- Recovery also runs on a fixed schedule, every 15 minutes, as a safety net. A
  pull request can be stranded by a merge that is not itself an event-data merge, or
  by a stranding that no subsequent event merge follows to trigger the post-merge
  pass; the scheduled pass bounds how long such a pull request waits before it is
  recovered. <!-- 02-§112.8 -->
- The scheduled safety-net pass is inexpensive when there are no open event pull
  requests: it lists the open event pull requests and exits without further work when
  none are stranded. <!-- 02-§112.9 -->
- Recovery also runs when a check suite completes (`check_suite` `completed`). A pull
  request becomes stranded at the moment its required checks finish and it turns
  mergeable, so running the sweep on check-suite completion recovers it then —
  independently of the schedule, whose delivery GitHub does not guarantee at the
  configured interval. <!-- 02-§112.16 -->
- Recovery runs are single-flight: all recovery triggers (post-merge, scheduled,
  check-suite, manual) share one concurrency group, and an in-progress run is never
  cancelled. This coalesces bursts of check-suite completions into few runs and
  guarantees a run that is mid-toggle (auto-merge disabled, not yet re-enabled) is
  allowed to finish, so a pull request is never left with auto-merge off. <!-- 02-§112.17 -->
- Recovery is idempotent. A pull request that is not stranded is left unchanged on
  every pass, so running recovery repeatedly is safe. <!-- 02-§112.10 -->

### 112.4 Recovery job authentication (site requirements)

- The recovery job authenticates to the GitHub API with a token that is permitted to
  enable and disable auto-merge on pull requests. The default GitHub Actions workflow
  token (`secrets.GITHUB_TOKEN`) cannot perform the auto-merge GraphQL mutations even
  when granted `pull-requests: write`, so recovery uses a separate token. <!-- 02-§112.12 -->
- The token is supplied through the repository-level Actions secret
  `EVENT_AUTOMERGE_TOKEN`, which holds a credential with pull-request and contents
  write access to the repository. The secret is repository-level (not environment
  scoped), because the recovery jobs run without a GitHub Environment and therefore
  resolve only repository- and organisation-level secrets. <!-- 02-§112.14 -->
- The recovered pull request merges under the `EVENT_AUTOMERGE_TOKEN` identity rather
  than the Actions bot, so the merge to `main` triggers the event-data post-merge
  deploy. A merge performed under the default Actions token would not trigger that
  push-driven workflow. <!-- 02-§112.15 -->

## 113. Proactive Merge-Queue Enqueue

### 113.1 Context

Event pull requests opened by the form API (add, edit, delete, batch) have
auto-merge (squash) enabled at creation (§109, §110, §111). Enabling auto-merge is
not the same as being placed in the merge queue: GitHub only adds a pull request to
the queue once its required checks pass, and during bursts a pull request can fail to
enter the queue at all and hang with auto-merge enabled but no queue entry (§112).
The reactive recovery in §112 repairs such a pull request, but it is reactive — a
stranded pull request can in the worst case wait up to the recovery sweep's interval
(~15 minutes) before it is detected and re-queued.

To keep submission latency low, the form API places each newly opened event pull
request in the merge queue immediately at submission, via the GraphQL
`enqueuePullRequest` mutation, so that a submitted activity merges in roughly the
queue's normal cycle (~50 seconds) rather than waiting for a recovery sweep. This is
a latency optimisation layered on top of the existing safety nets, not a replacement
for them: auto-merge stays enabled as a complement, and the reactive recovery in
§112 remains in place for any pull request that still falls out of the queue.

### 113.2 Proactive enqueue at submission (site requirements)

- Immediately after the form API creates an event pull request (add, edit, delete, or
  batch) and enables squash auto-merge on it, it places the pull request in the merge
  queue with the GraphQL `enqueuePullRequest` mutation, using the pull request's node
  id. <!-- 02-§113.1 -->
- Enabling squash auto-merge with `enablePullRequestAutoMerge` is retained as a
  complement to the enqueue call: when a pull request cannot be enqueued at submission
  time, auto-merge places it in the queue once its required checks pass. <!-- 02-§113.2 -->
- The merge method of an enqueued pull request is the merge queue's configured method;
  the `enqueuePullRequest` mutation does not specify a merge method, unlike
  `enablePullRequestAutoMerge`. <!-- 02-§113.3 -->

### 113.3 Best-effort behaviour (site requirements)

- The enqueue call is best-effort: a failure to enqueue never fails the user's
  submission. The pull request has already been created with auto-merge enabled, so a
  failed enqueue falls back to auto-merge plus the reactive recovery in §112 as the
  safety net. <!-- 02-§113.4 -->
- A pull request whose required checks are still running is not yet mergeable, so the
  merge queue declines to enqueue it. This is an expected outcome of a burst
  submission, not an error condition: the failure is logged as a warning and the
  submission still succeeds. <!-- 02-§113.5 -->
- A failed enqueue is logged (warning), creating no GitHub issue and no user-facing
  error. The submission response is identical to one where enqueue succeeded; the
  difference is only how soon the pull request reaches the queue. <!-- 02-§113.6 -->
- A submission is never more fragile than it was before proactive enqueue: every code
  path that could throw from the enqueue step is contained so the submission outcome
  is unchanged whether enqueue succeeds or fails. <!-- 02-§113.7 -->

### 113.4 Unchanged guarantees (site requirements)

- The reactive stranded-recovery automation (§112) is unchanged and remains the safety
  net for any event pull request that falls out of the merge queue, including one whose
  proactive enqueue failed at submission. <!-- 02-§113.8 -->
- The event-data validation gate is unchanged by proactive enqueue: the `event-data
  check` (the hard `check-yaml-security.js` block and `lint-yaml.js`) and the API-layer
  validation remain required and run exactly as before. Enqueuing a pull request places
  it in the queue, where its required checks still run and must pass before it
  merges. <!-- 02-§113.9 -->
