---
title: "SB Sommar – Requirements: Schedule and Activity Detail"
---

# SB Sommar – Requirements: Schedule and Activity Detail

Schedule views (weekly, today, display), inline activity detail, static per-event pages, RSS, iCal, Markdown rendering of descriptions.

Part of [the requirements index](./index.md). Section IDs (`02-§N.M`) are stable and cited from code; they do not encode the file path.

---

## 4. Schedule Views

### Weekly schedule

- Shows all activities for the full camp week (Sunday–Sunday). <!-- 02-§4.1 -->
- Activities are grouped by day. <!-- 02-§4.10 -->
- Within each day, activities are listed in chronological order. <!-- 02-§4.2 -->
- Each activity shows: title, start time, end time, location, responsible person. <!-- 02-§4.3 -->
- Each activity row reflects its status relative to the current time: an activity whose end time has passed is shown with a muted light-grey background; the activity currently in progress is highlighted with a terracotta accent. Upcoming activities use the default row appearance. <!-- 02-§116.1 -->
- Status is evaluated against each activity's full date and start/end time, so only activities on the current day can be highlighted as in progress, and every activity on a past day is shown as ended. <!-- 02-§116.2 -->
- An activity with no end time is treated as in progress from its start time until midnight of its day, after which it is shown as ended. <!-- 02-§116.3 -->
- Status is evaluated when the page loads; reloading the page re-evaluates it against the current time. The weekly schedule does not refresh on its own while open. <!-- 02-§116.4 -->

### Today view (`/idag.html`)

- Shows only today's activities in the standard site layout. <!-- 02-§4.5 -->
- No navigation to other days. This view is always today. <!-- 02-§4.13 -->
- Each activity reflects its status relative to the current time, with the same treatment as the weekly schedule: a finished activity has a muted light-grey background and dimmed text, and the activity in progress is highlighted with a terracotta accent. Status is evaluated when the page loads; reloading the page re-evaluates it. <!-- 02-§116.5 -->

### Display view (`/live.html`)

- Shows today's activities on a dark, full-screen layout for shared screens around the camp.
- Must be legible at a distance: dark background, large text, minimal interface chrome. <!-- 02-§4.6 -->
- Must not require any interaction to stay useful — it should be readable at a glance. <!-- 02-§4.7 -->
- Shows no site-level footer. <!-- 02-§4.14 -->
- Shows a live clock of the current time in the sidebar. The clock advances exactly once per wall-clock second, with no skipped or repeated values, by re-aligning each update to the next whole second rather than relying on a fixed-interval timer. <!-- 02-§4.15 -->
- Shows when the schedule content was last rebuilt, labelled "Schema uppdaterat" followed by the build date and time, below the clock. When an app version is available it is appended to the same line as " · v{version}" (e.g. "Schema uppdaterat 25 jun 18:03 · v1.0.3"), matching the version shown in the footer on every other page (the display view has no footer of its own). Both the timestamp and the version are embedded at build time. <!-- 02-§4.16 -->
- Polls `version.json` once on load and every 60 seconds thereafter, and reloads the page automatically when a newer build is detected. A failed check is logged to the console and retried on the next interval; it does not stop the polling loop. <!-- 02-§4.17 -->
- The automatic reload happens at most once per detected build version: the page records the version it last reloaded for, so if a stale cache keeps serving an old page whose embedded version never catches up, the page reloads once and then stops rather than reloading on every poll. A genuine new build always reloads exactly once. <!-- 02-§4.25 -->
- Surfaces a prominent warning only when the screen has lost contact with the server: when no version check has succeeded for more than 3 minutes, a red banner reading "⚠ Ingen kontakt med servern sedan HH:MM" (the time of the last successful check) is shown in the sidebar. While checks are succeeding the banner is hidden, and it clears automatically as soon as a check succeeds again. This lets an observer distinguish a stalled screen (banner shown, or the clock's seconds frozen) from a screen that is simply showing an unchanged schedule (no banner, clock ticking). <!-- 02-§4.23 -->
- Automatically reloads shortly after midnight to show the new day's events. <!-- 02-§4.18 -->
- The heading shows only the current day and date (e.g. "måndag 26 februari 2026") without a page-title prefix. <!-- 02-§4.19 -->
- The heading is positioned inside the sidebar, not above the event list, so events use the full available height. <!-- 02-§4.20 -->
- The layout is optimised for portrait-orientation screens; event rows are compact to maximise the number of visible events. <!-- 02-§4.21 -->
- The event list tracks the current time without reloading: each activity is re-evaluated every minute, aligned to the minute boundary. An activity whose end time has passed is removed from the list; the activity currently in progress is highlighted. An activity with no end time is treated as in progress from its start time onward (it is never removed on its own). When every activity has ended, a closing message ("Inga fler aktiviteter idag.") is shown in place of the list. <!-- 02-§4.22 -->
- Below today's activities, the next day's activities are also shown when the camp has another day (the next calendar day is on or before the camp's end date) and that day has at least one activity. They appear under a clear divider labelled "Imorgon". The next day's activities use the same row layout as today's but are never removed or highlighted by the live "now" logic — that logic applies only to today's list. This is especially useful late in the evening once the day's own activities have ended. The next-day section is shown only in the display view, not on `/idag.html`. <!-- 02-§4.24 -->
- The old URL `/dagens-schema.html` serves a redirect page that sends the visitor to `/live.html` via `<meta http-equiv="refresh">` and a JavaScript fallback. <!-- 02-§76.1 -->

### All schedule views

- Activities are always in chronological order. <!-- 02-§11.1 -->
- Overlapping activities are allowed and must remain readable. <!-- 02-§4.8 -->
- Clicking an activity opens its detail view (see §5). <!-- 02-§4.9 -->

---

---

## 5. Inline Activity Detail (Schedule)

When a participant clicks an activity, a detail view must show: <!-- 02-§5.1 -->

- Title
- Date
- Start time
- End time
- Location
- Responsible person
- Full description (only if set)
- Communication link (only if set)

Fields with no value must not appear. <!-- 02-§5.2 --> The user must clearly understand whether
additional information exists beyond what the schedule row shows.

The `owner` and `meta` fields are internal and must never appear in any public view. <!-- 02-§5.3 -->

---

---

## 15. RSS Feed

The activity schedule must be available as an RSS feed at `/schema.rss`. <!-- 02-§15.1 -->

The feed must reflect the current state of the schedule. <!-- 02-§15.2 --> It is intended for
participants who want to follow the schedule in an RSS reader or use it to
integrate the schedule elsewhere.

### 15.1 Feed format

The feed must be valid RSS 2.0 XML. <!-- 02-§15.3 -->

All feed metadata must be in Swedish: <!-- 02-§15.4 -->

- `<title>` — "Schema – {camp name}"
- `<description>` — "Aktivitetsschema för {camp name}"
- `<language>` — `sv`

The feed `<link>` must point to the weekly schedule page using the site's
base URL (e.g. `https://sommar.digitalasynctransparency.com/schema.html`). <!-- 02-§15.5 -->

### 15.2 Feed items

Each event in the active camp must produce one `<item>` in the feed. <!-- 02-§15.6 -->

Each item must include: <!-- 02-§15.7 -->

- `<title>` — event title
- `<link>` — absolute URL to the event's per-event detail page (see §36)
- `<guid isPermaLink="true">` — same URL as `<link>`
- `<description>` — a structured, multi-line human-readable summary formatted
  as follows: <!-- 02-§15.15 -->
  - Line 1: formatted date, start–end time (no labels)
  - Line 2: `Plats:` value ` · ` `Ansvarig:` value (with labels)
  - Line 3: event description (only if set, no label)
  - Line 4: event link (only if set, no label)
- `<pubDate>` — the event date and start time, formatted as RFC 822

Items must be sorted chronologically (same order as the weekly schedule). <!-- 02-§15.8 -->

### 15.3 Build-time generation

The RSS feed is generated at build time by `render-rss.js` and written to
`public/schema.rss`. <!-- 02-§15.9 -->

The renderer must not depend on any RSS library — the XML is simple enough
to emit directly. <!-- 02-§15.10 -->

### 15.4 Site base URL

Absolute URLs in the RSS feed (and per-event detail pages) require a
configurable base URL. <!-- 02-§15.11 -->

The build reads the base URL from the `SITE_URL` environment variable. <!-- 02-§15.12 -->

If `SITE_URL` is not set, the build must fail with a clear error message —
RSS links cannot be generated without a base URL. <!-- 02-§15.13 -->

CI workflows that run `npm run build` must pass `SITE_URL` as an
environment variable alongside `API_URL`. <!-- 02-§15.14 -->

---

---

## 36. Static Per-Event Pages

Each event in the active camp must have its own static HTML page, generated
at build time. <!-- 02-§36.1 -->

### 36.1 URL structure

Each event page lives in its own sub-folder under `/schema/`: <!-- 02-§36.2 -->

```text
/schema/{event-id}/index.html
```

For example: `/schema/middag-2026-06-30-1630/index.html`, accessible as
`/schema/middag-2026-06-30-1630/`.

### 36.2 Page content

Each event page must show: <!-- 02-§36.3 -->

- Event title (as page heading)
- Date (formatted in Swedish)
- Start time and end time
- Location
- Responsible person
- Description (if set)
- External link (if set)

Fields with no value must not appear. <!-- 02-§36.4 -->

The event detail body must use a structured layout matching the RSS
description format (see §15.15): <!-- 02-§36.11 -->

- Line 1: formatted date, start–end time (no labels)
- Line 2: `Plats:` value ` · ` `Ansvarig:` value (with labels)
- Line 3: description text (only if set, no label)
- Line 4: external link (only if set)

This replaces the previous definition-list (`<dl>`) layout.

The `owner` and `meta` fields must never appear on event pages. <!-- 02-§36.5 -->

### 36.3 Layout and navigation

Event pages must use the shared site layout: header navigation, footer,
and stylesheet. <!-- 02-§36.6 -->

Each event page must include a back link to the weekly schedule page. <!-- 02-§36.7 -->

### 36.4 Crawler blocking

Event pages must include the `<meta name="robots" content="noindex, nofollow">`
tag, consistent with all other pages. <!-- 02-§36.8 -->

### 36.5 Build integration

Event pages are generated by `render-event.js` and wired into `build.js`. <!-- 02-§36.9 -->

The build must create the `/schema/{event-id}/` directory structure inside
`public/`. <!-- 02-§36.10 -->

---

---

## 45. iCal Calendar Export

The activity schedule must be available as iCalendar (`.ics`) files so
participants can sync events to their phone or desktop calendar. <!-- 02-§45.1 -->

### 45.1 Per-event iCal file

Each event in the active camp must have a static `.ics` file generated at
build time, located alongside the event detail page: <!-- 02-§45.2 -->

```text
/schema/{event-id}/event.ics
```

The `.ics` file must be valid iCalendar format (RFC 5545). <!-- 02-§45.3 -->

Each per-event `.ics` file must include exactly one `VEVENT` with: <!-- 02-§45.4 -->

- `DTSTART` / `DTEND` — event start and end time
- `SUMMARY` — event title
- `LOCATION` — event location
- `DESCRIPTION` — responsible person, followed by description text if set
- `URL` — absolute URL to the event detail page
- `UID` — `{event-id}@{hostname}` (stable, unique)

All event times are expressed in the `Europe/Stockholm` time zone.
`DTSTART` and `DTEND` carry a `TZID=Europe/Stockholm` parameter
(`DTSTART;TZID=Europe/Stockholm:YYYYMMDDTHHMMSS`), and the `VCALENDAR`
includes a matching `VTIMEZONE` component that defines `Europe/Stockholm`
with its CET/CEST daylight-saving rules. The naive local times stored in
the event data (05-§4.5) are thereby anchored to a concrete zone, so
calendar apps display every activity at its correct wall-clock time
regardless of the device's own time zone. <!-- 02-§45.5 -->

When `end` is null, `DTEND` must be omitted. <!-- 02-§45.6 -->

The iCal renderer must not depend on any external iCal library — the
format is simple enough to emit directly. <!-- 02-§45.7 -->

### 45.2 Per-event iCal link on event detail page

The event detail page (§36) must include a download link to the per-event
`.ics` file. <!-- 02-§45.8 -->

The link must appear as a third line in the event detail body, after the
existing Plats/Ansvarig line, styled consistently with those
lines. <!-- 02-§45.9 -->

### 45.3 Full-camp iCal feed

A complete iCalendar file containing all events in the active camp must be
generated at build time at `/schema.ics`. <!-- 02-§45.10 -->

The full-camp `.ics` file must contain one `VEVENT` per event, using the
same field mapping as per-event files (§45.4). <!-- 02-§45.11 -->

The `VCALENDAR` must include: <!-- 02-§45.12 -->

- `PRODID` — identifies the generator (e.g. `-//SB Sommar//Schema//SV`)
- `X-WR-CALNAME` — `Schema – {camp name}`
- `METHOD` — `PUBLISH`

### 45.4 Webcal link on schedule page

The weekly schedule page must include a webcal subscription link to the
full-camp iCal feed, alongside the existing RSS link. <!-- 02-§45.13 -->

The link must use the `webcal://` protocol scheme (replacing `https://` in
the site URL). <!-- 02-§45.14 -->

### 45.5 Calendar tips page

A static page must exist at `/kalender.html`. <!-- 02-§45.15 -->

The page must include step-by-step instructions for subscribing to the
camp calendar on: iOS Calendar, Android / Google Calendar, Gmail (web),
and Outlook. <!-- 02-§45.16 -->

The page must explain the difference between subscribing to the full camp
calendar (auto-updates) and downloading individual event files
(one-time import). <!-- 02-§45.17 -->

The page must be written in Swedish. <!-- 02-§45.18 -->

The page must use the shared site layout: header, navigation, and
footer. <!-- 02-§45.19 -->

### 45.6 Build integration

The iCal renderer must be a separate module (`render-ical.js`), following
the same pattern as `render-rss.js`. <!-- 02-§45.20 -->

The tips page renderer must be a separate module
(`render-kalender.js`). <!-- 02-§45.21 -->

Both must be wired into `build.js`. <!-- 02-§45.22 -->

iCal generation reuses the existing `SITE_URL` environment variable — no
new configuration is needed. <!-- 02-§45.23 -->

---

---

## 46. iCal Presentation and Compliance

### 46.1 Schedule page calendar icon

The schedule page header displays a calendar icon that links to the
calendar tips page (`kalender.html`). <!-- 02-§46.4 -->

The icon is an inline SVG, matching the RSS icon height
(38 px). <!-- 02-§46.1 -->

No text label accompanies the icon — the title attribute and visual
design provide sufficient affordance. <!-- 02-§46.3 -->

### 46.2 Per-event iCal link in schedule rows

Every event row on the weekly schedule page includes a download link to
its `.ics` file. <!-- 02-§46.5 -->

The link appears at the end of the row, after location and responsible
metadata, as a small text link labelled "iCal". <!-- 02-§46.6 -->

It is styled consistently with `.ev-meta` (small font, terracotta colour)
and does not disrupt the existing row layout. <!-- 02-§46.7 -->

The link uses the `download` attribute so the browser saves the file
rather than navigating. <!-- 02-§46.8 -->

### 46.6 Per-event iCal link in today view

Every event row on the today view (`/idag.html`) includes a download link
to its `.ics` file, identical in appearance and behaviour to the per-event
iCal link on the weekly schedule. <!-- 02-§46.16 -->

The display view (`/live.html`) shows no per-event iCal link, since it is a
passive, non-interactive screen viewed at a distance. <!-- 02-§46.17 -->

### 46.3 Calendar tips page discoverability

The weekly schedule page includes a visible link to `kalender.html` near
the header or intro text so users can find instructions for subscribing
to the calendar. <!-- 02-§46.9 -->

### 46.4 Calendar tips page layout

The calendar tips page uses the card-based layout style used elsewhere on
the site (white background, rounded corners, card shadow, sage left
border). <!-- 02-§46.11 -->

Each platform section (iOS, Android, Gmail, Outlook) is visually
separated as its own card or clearly delineated
section. <!-- 02-§46.12 -->

The webcal URL is displayed in a copy-friendly code block styled
consistently with existing code blocks on the site. <!-- 02-§46.13 -->

### 46.5 DTSTAMP in VEVENT blocks

Every `VEVENT` block in both per-event and full-camp `.ics` files
includes a `DTSTAMP` property (RFC 5545 §3.6.1). <!-- 02-§46.14 -->

The value is a UTC timestamp representing the build time, formatted as
`YYYYMMDDTHHMMSSZ`. <!-- 02-§46.15 -->

---

---

## 56. Render Description as Markdown

The `description` field in event YAML files may contain Markdown syntax
(parsed by `marked`, the same library used for `content/*.md`). All
rendering paths must treat the description as Markdown and produce
appropriate output for each context.

### 56.1 Site requirements

- In the event detail page, the description must be rendered as formatted
  HTML produced by `marked.parse()`. <!-- 02-§56.1 -->
- In the weekly schedule (schema.html), the description inside the
  expandable event row must be rendered as formatted HTML produced by
  `marked.parse()`. <!-- 02-§56.2 -->
- In the today view (idag.html / live.html), the description
  must be rendered as formatted HTML. The HTML must be pre-rendered at
  build time and delivered in the JSON payload to avoid shipping the
  `marked` library to the client. <!-- 02-§56.3 -->
- In the RSS feed (schema.rss), the description must be stripped of
  Markdown syntax and included as plain text in the `<description>`
  element. <!-- 02-§56.4 -->
- In iCal output (schema.ics and per-event .ics files), the description
  must be stripped of Markdown syntax and included as plain text in the
  `DESCRIPTION` property. <!-- 02-§56.5 -->
- Raw HTML in description Markdown is dropped at parse time by marked
  renderer overrides, so `<script>`, `<iframe>`, `<object>`, `<embed>`,
  any other raw tags, and any `on*` event-handler attributes never appear
  in the rendered output. URIs in links and images that use the
  `javascript:`, `vbscript:`, `data:`, or `file:` scheme — matched
  case-insensitively and tolerant of leading whitespace and control
  characters — are neutralized to an empty `href`/`src`. <!-- 02-§56.6 -->
- Descriptions that contain no Markdown syntax (plain text) must continue
  to render correctly — `marked` wraps them in `<p>` tags, which is
  acceptable. <!-- 02-§56.7 -->
- The `.event-description p` rule must no longer apply `font-style:
  italic`, so that Markdown emphasis renders distinctly. <!-- 02-§56.8 -->
- CSS for rendered descriptions must use existing design tokens from
  `07-design/css-strategy.md`. No new custom properties are introduced. <!-- 02-§56.9 -->
- A shared build-time helper must provide both `renderDescriptionHtml()`
  and `stripMarkdown()` to avoid duplicating Markdown processing logic
  across render modules. <!-- 02-§56.10 -->

---

---

## 59. Scoped Heading Sizes in Event Descriptions

### Context

The global heading styles (h1 = 40 px, h2 = 35 px, h3 = 30 px) are designed
for page-level headings.  When Markdown descriptions containing headings are
rendered inside event cards (`.event-desc`, `.event-description`) and the
Markdown preview (`.md-preview`), those page-level sizes are applied,
producing oversized headings and — in `.md-preview` where only h2 was
overridden — a broken size hierarchy where h3 appears larger than h2.

### 59.1 Heading size requirements

- Headings h1–h4 inside `.md-preview`, `.event-desc`, and
  `.event-description` must be visually smaller than the global page
  headings and must follow a strictly decreasing size
  order (h1 > h2 > h3 > h4). <!-- 02-§59.1 -->
- The scoped sizes must use relative `em` units so they scale with the
  container's font-size context (e.g. 13 px in `.event-extra` vs
  16 px in `.md-preview`). <!-- 02-§59.2 -->
- h4 must be the same size as body text but bold, to provide a clear
  lower-bound heading level. <!-- 02-§59.3 -->
- All scoped heading styles must use existing design tokens or plain
  `em` values — no hardcoded pixel sizes. <!-- 02-§59.4 -->

### 59.2 Markdown guide link

- The help link in the Markdown preview header must point to a
  beginner-friendly guide (`https://www.markdownguide.org/basic-syntax/`),
  not a library API reference. <!-- 02-§59.5 -->
- The link text and URL must be identical in `/lagg-till.html` and
  `/redigera.html`. <!-- 02-§59.6 -->

---

## 118. Cancelled Activities

### Context

An activity that has been arranged but will not take place is marked as
cancelled ("inställd") rather than deleted. It stays in the schedule so
participants who were expecting it see that it is off, instead of it silently
disappearing. A cancelled activity is shown struck through and labelled, and is
marked as cancelled across every view built from the event data — the weekly
schedule, the today view, the per-event page, the RSS feed, and the iCal
export.

### 118.1 Data

- An event carries an optional boolean field `cancelled`. `cancelled: true`
  means the activity is cancelled; an absent field, `null`, or `false` means it
  is active. The field is optional, so existing events without it are
  active. <!-- 02-§118.1 -->
- The `cancelled` field round-trips through the edit API: an edit that sets or
  clears it is written back to the event's fragment file, and the event data
  validator accepts `cancelled` only as a boolean or null. <!-- 02-§118.2 -->
- A cancelled activity keeps its stable event `id`; cancelling never rewrites
  the title or any field that the id is derived from. <!-- 02-§118.3 -->

### 118.2 Marking an activity cancelled (edit form)

- The edit form (`/redigera.html`) has a button, beside the delete button, that
  cancels the activity being edited. When the activity is active the button
  reads "Ställ in aktiviteten"; when it is already cancelled the button reads
  "Återställ aktiviteten", so cancelling can be undone. <!-- 02-§118.4 -->
- The button saves in a single click: activating it persists the new `cancelled`
  state immediately through the edit API, with no separate "Spara ändringar"
  step. Because cancelling is reversible, there is no confirmation dialog. The
  current cancelled state of the activity is reflected in the button when the
  form loads. <!-- 02-§118.5 -->

### 118.3 Schedule display

- In the weekly schedule, the today view, and the per-event page, a cancelled
  activity stays listed in its normal chronological position; it is never
  removed from the schedule. <!-- 02-§118.6 -->
- A cancelled activity's heading begins with the word "INSTÄLLD". <!-- 02-§118.7 -->
- A cancelled activity's row text is shown in terracotta
  (`--color-terracotta`) and struck through (line-through) while the activity
  is upcoming or in progress. <!-- 02-§118.8 -->
- Once a cancelled activity has passed in time, it is shown with the same muted
  grey, dimmed treatment as any other passed activity (`.is-past`): the
  terracotta colour is dropped and it blends in with the rest of the past
  schedule. The "INSTÄLLD" label and the strike-through remain so the record
  stays truthful. <!-- 02-§118.9 -->
- The "INSTÄLLD" label is part of the row's visible text, so it is announced by
  screen readers — the cancelled state is never conveyed by colour or
  strike-through alone. <!-- 02-§118.10 -->

### 118.4 Feeds

- In the RSS feed, a cancelled activity's `<title>` begins with the prefix
  "[INSTÄLLD] ". <!-- 02-§118.11 -->
- In the iCal export (both the full-camp `schema.ics` and the per-event
  `event.ics`), a cancelled activity's VEVENT carries the standard
  `STATUS:CANCELLED` property. <!-- 02-§118.12 -->

---

## 119. Moved Activities

**Context.** When an activity is rescheduled to another time or another day,
participants who remember the old slot need to see both that it changed and
where it went. The schedule marks a moved activity in place and leaves a small
pointer at the slot it used to occupy. This is feedback from a camp organiser
(issue #729).

### 119.1 Data

- An event may carry an optional `moved` mapping recording the slot it occupied
  before its most recent reschedule: `from_date` (`YYYY-MM-DD`), `from_start`
  (`HH:MM`), and `from_end` (`HH:MM` or null). An event that has never been
  moved, or whose last edit changed only its text, has no `moved` mapping.
  <!-- 02-§119.1 -->
- The `moved` mapping is derived and maintained by the edit API, never by a
  participant directly. The add and edit request bodies do not accept a `moved`
  field; any `moved` value in a request body is ignored. <!-- 02-§119.2 -->

### 119.2 Capture (edit form)

- When an edit changes an activity's `date`, `start`, or `end`, the edit API
  records the activity's previous `date`, `start`, and `end` in its `moved`
  mapping. <!-- 02-§119.3 -->
- When an edit changes only text fields (title, description, location,
  responsible, link, cancelled) and leaves `date`, `start`, and `end`
  unchanged, the activity's existing `moved` mapping is left exactly as it was —
  a text edit neither creates nor clears the moved marker. <!-- 02-§119.4 -->
- When an edit moves an activity back to the exact slot recorded in its current
  `moved` mapping, the `moved` mapping is removed: an activity returned to where
  it started is no longer marked as moved. <!-- 02-§119.5 -->

### 119.3 Marked time on the activity itself

- In the weekly schedule, the today view, and the per-event page, a moved
  activity keeps its place at its current (new) time. The new time is shown on
  top, highlighted in amber (`--color-amber`), and the previous time is shown
  struck through in smaller text directly below it. <!-- 02-§119.6 -->
- When the activity has moved to a different day, the struck-through previous
  time includes the previous date; when it has only changed time within the same
  day, only the previous time is shown. <!-- 02-§119.7 -->

### 119.4 Marker at the previous slot

- In the weekly schedule and the today view, a moved activity also appears as a
  minimal marker at the slot it used to occupy (its `from_date` and
  `from_start`), sorted into that day at its previous start time. The marker is
  shown in an amber tone so it reads as a "moved away" pointer. <!-- 02-§119.8 -->
- The marker shows only the activity's title and the label "Flyttad till" (moved
  to) followed by the new day and time, or only the new time when the move is
  within the same day. The marker shows no description, location, responsible,
  link, or iCal download. <!-- 02-§119.9 -->
- The marker's first line — its old time and the activity title — is struck
  through. The "Flyttad till" pointer line below it is not struck through.
  <!-- 02-§119.18 -->
- Once the marker's old slot is in the past it is shown with the same muted grey,
  dimmed treatment as any other passed row, in every view that shows passed
  activities; the amber tone gives way to grey. <!-- 02-§119.17 -->
- The per-event page shows no previous-slot marker — it describes a single
  activity and has no schedule position to mark. <!-- 02-§119.10 -->

### 119.5 Persistence and deletion

- The moved marking and the previous-slot marker stay until the activity is
  moved again (which records a new previous slot), moved back to its original
  slot (which clears the marking), or the camp ends. <!-- 02-§119.11 -->
- The previous-slot marker is derived from the live activity. When an activity
  is deleted, its previous-slot marker disappears with it; a cancelled
  ("inställd") activity still exists, so its previous-slot marker remains.
  <!-- 02-§119.12 -->

### 119.6 Accessibility

- The previous time is conveyed by the visible struck-through text and the
  "Flyttad till" label, not by colour alone; the amber highlight is an
  additional cue, never the only one. <!-- 02-§119.13 -->

### 119.7 Location changes

- An event may carry an optional `relocated` mapping recording the location it
  had before its most recent location change: `from_location` (string). An event
  whose location has never changed, or whose last edit changed only other
  fields, has no `relocated` mapping. Like `moved`, it is derived and maintained
  by the edit API and is never accepted from a request body. <!-- 02-§119.14 -->
- When an edit changes an activity's `location`, the edit API records the
  previous location in `relocated.from_location`. An edit that leaves the
  location unchanged keeps the existing `relocated` mapping untouched; changing
  the location back to the recorded original removes the mapping. <!-- 02-§119.15 -->
- Wherever an activity's location is shown — the weekly schedule, the today view,
  and the per-event page — a relocated activity shows its new location as usual,
  preceded by its previous location in smaller struck-through text. A location
  change produces no previous-slot marker: only the inline struck-through old
  location is added. <!-- 02-§119.16 -->

---

## 120. Location-Clash Marking

**Context.** Two activities can be booked into the same room at overlapping
times. The schedule highlights the booking that came later so organisers can
spot and resolve the double-booking. The same overlap logic already powers the
per-event conflict banner and the locale overview (§99).

### 120.1 What counts as a clash

- A location clash ("lokalkrock") is two activities on the same date, in the same
  room, whose times overlap. Back-to-back activities (one ends exactly when the
  next starts) do not clash, matching the conflict rule in §99.3. <!-- 02-§120.1 -->
- The catch-all location "Annat" (shown as "[annat]") is never a real room, so an
  activity there is never part of a clash and never causes one. <!-- 02-§120.2 -->
- A cancelled ("inställd") activity has freed its room: it is never marked and
  never causes another activity to be marked. <!-- 02-§120.3 -->
- The communal meals "Lunch" and "Middag" are ignored by the clash logic
  entirely (matched case-insensitively by title): a meal is never marked and
  never causes another activity to be marked, because everyone shares the meal
  and it is not a competing booking. <!-- 02-§120.7 -->

### 120.2 Which activity is marked

- Of two clashing activities, the one created later (by its creation time) is
  marked; the earlier booking keeps the room and is left unmarked. When three or
  more activities overlap in the same room, every booking created after the
  earliest is marked. <!-- 02-§120.4 -->

### 120.3 How it is shown

- A marked activity is shown in the reserved conflict red (`--color-error`) — a
  red wash, a red left accent bar, and the title in red — in the weekly schedule
  and the today view. <!-- 02-§120.5 -->
- Once a marked activity has passed in time, it takes the same muted grey,
  dimmed treatment as any other passed activity; the red gives way to grey.
  <!-- 02-§120.6 -->
