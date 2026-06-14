---
title: "SB Sommar – Architecture: Rendering"
---

# SB Sommar – Architecture: Rendering

Page rendering logic and project structure, plus the RSS feed and per-event page generation.

Part of [the architecture index](./index.md). Section IDs (`03-§N.M`) are stable and cited from code; they do not encode the file path.

---

## 5. Rendering Logic

At build time:

1. Load `source/data/camps.yaml`.
2. Derive the active camp from dates (see [`data-layer.md`](./data-layer.md) §2 for derivation rules).
3. Load its YAML file.
4. Sort events chronologically.
5. Render HTML pages.

### 5.1 Locale overview page

`source/build/render-lokaler.js` produces `public/lokaler.html` — a
read-only visual timeline of which locales are already booked for the
active camp. The grid is rendered server-side; the page ships no
client-side grid code. Each locale defined in `source/data/local.yaml`
becomes one row; events from the active camp's YAML are positioned as
time-blocks inside that row according to their date and start/end
times. Events whose `location` field does not match any locale name
fall into the "Annat" row. Locations marked unavailable (`active: false`)
in `local.yaml` are filtered out in `build.js` before the locale list reaches
this renderer, so they produce no row — see
[pages-and-content.md §16.5](./pages-and-content.md) (02-§107). The page is not a
site-navigation entry; it is reached through a link from `/schema.html`. See
02-requirements/design-and-content.md §98 for the full requirements.

### 5.2 Shared conflict-detection module

`source/assets/js/client/conflict-check.js` is a single small module
containing the overlap predicate — `effectiveEnd`, `overlaps`,
`markClashes`, `findConflicts`, and `findConflictsMulti`. It has no
DOM access and no network code; it is pure data logic.

The module is written as a UMD wrapper so the **same file** is
consumed by three runtimes:

1. **Browser.** `lagg-till.js` and `redigera.js` load it via
   `<script src="conflict-check.js">` and read `window.SBConflictCheck`.
2. **Build.** `source/build/render-lokaler.js` and
   `source/build/render-event.js` `require('../assets/js/client/conflict-check.js')`
   as a normal CommonJS module. This direction —
   `source/build/*` → `source/assets/js/client/*` — is the opposite
   of the usual dependency direction, but it is a deliberate choice:
   the module is pure logic that belongs with the larger consumer
   (the client), and importing it from the build layer avoids
   duplicating the overlap predicate. Duplication would violate
   CLAUDE.md §4.3 ("no duplicated event definitions") and carries a
   real drift risk — any future change to the back-to-back or
   cross-midnight rule would otherwise need two edits.
3. **Tests.** Node's built-in test runner `require()`s it directly.

Server-side consumers (`render-lokaler.js`, `render-event.js`) use
the module at build time; the browser consumers use it at runtime.
Both see the same function behaviour, so a conflict flagged at build
on a per-event page matches exactly what the form's live check would
flag if the same values were typed in. See 02-requirements/add-edit-forms.md §99
for the full requirements.

### 5.3 Per-event pages and conflict banner

`source/build/render-event.js` produces one `schema/<slug>/index.html`
page per event in the active camp. The renderer receives the event
itself, the list of all active-camp events, and produces the detail
page. When the event overlaps another event in the same locale at the
same date (`findConflicts(event, allEvents, { excludeId: event.id })`
returns a non-empty array), the renderer emits the same
`.conflict-warning` banner that the add/edit forms render on the
client. One CSS rule styles both. The banner is written into
`.event-detail` after the location/responsible row and before the
description. See 02-requirements/add-edit-forms.md §99.15–§99.17.

---

## 6. Project Structure

```text
source/data/      YAML source files (camps registry, per-camp events, locations)
source/content/   Markdown page sections
source/build/     Build scripts → generates public/
source/api/       Node.js API handlers (github.js, validate.js)
api/              PHP API (alternative backend for shared hosting)
public/           Generated output — do not edit directly
app.js            Express server entry point (Node.js)
```

Key files:

| File | Role |
| ---- | ---- |
| `source/data/camps.yaml` | Registry of all camps; determines which is active |
| `source/data/local.yaml` | Predefined location list — the only place locations are defined |
| `source/data/YYYY-MM-name.yaml` | Per-camp event files, referenced from `camps.yaml` |
| `app.js` | Express (Node.js web server) — serves `public/`, handles `POST /add-event` and `POST /edit-event` |
| `api/index.php` | PHP API entry point — handles `POST /api/add-event` and `POST /api/edit-event` |
| `public/events.json` | Generated at build time; all public event fields for the active camp |

---

## 17. RSS Feed

At build time, `source/build/render-rss.js` produces `public/schema.rss` — an
RSS 2.0 XML file containing one `<item>` per event in the active camp.

### 17.1 Data source

The renderer receives the same `camp` and `events` objects already loaded by
`build.js`. No additional file reads are needed.

### 17.2 Site base URL

RSS requires absolute URLs for `<link>` and `<guid>` elements. The base URL
is read from the `SITE_URL` environment variable (e.g.
`https://sommar.digitalasynctransparency.com`).

`build.js` reads `SITE_URL` early and passes it to `renderRssFeed()` and
`renderEventPage()`. If `SITE_URL` is not set, the build fails with a clear
error message.

CI and deploy workflows (`deploy-reusable.yml`, `event-data-deploy.yml`) pass `SITE_URL` as a
secret alongside `API_URL`.

### 17.3 Feed structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Schema – {camp name}</title>
    <link>{SITE_URL}/schema.html</link>
    <description>Aktivitetsschema för {camp name}</description>
    <language>sv</language>
    <item>
      <title>{event title}</title>
      <link>{SITE_URL}/schema/{event-id}/</link>
      <guid isPermaLink="true">{SITE_URL}/schema/{event-id}/</guid>
      <description>
        {formatted date}, {start}–{end}
        Plats: {location} · Ansvarig: {responsible}
        {description as plain text — Markdown syntax stripped}
        {link, if set}
      </description>
      <pubDate>{RFC 822 date}</pubDate>
    </item>
    ...
  </channel>
</rss>
```

Items are sorted chronologically — same order as the weekly schedule.

### 17.4 XML escaping

All text content is escaped for XML (`&`, `<`, `>`, `"`, `'`). The existing
`escapeHtml()` from `utils.js` is sufficient since XML escaping is a superset
of the same characters.

### 17.5 Date formatting

`<pubDate>` uses RFC 822 format: `Wed, 01 Jul 2026 14:00:00 +0000`. The
renderer combines each event's `date` and `start` fields into a UTC datetime
(times are local and no timezone offset is tracked, so UTC is used as a
convention).

### 17.6 Files

| File | Role |
| --- | --- |
| `source/build/render-rss.js` | Renders `public/schema.rss` at build time |

### 17.7 Files changed

| File | Change |
| --- | --- |
| `source/build/build.js` | Read `SITE_URL`; call `renderRssFeed()`; write `public/schema.rss` |
| `.github/workflows/deploy-reusable.yml` | Pass `SITE_URL` secret to the build step |
| `.github/workflows/event-data-deploy.yml` | Pass `SITE_URL` secret to the build step |

---

## 18. Static Per-Event Pages

At build time, `source/build/render-event.js` produces one static HTML page
per event in the active camp. Each page lives in its own sub-folder:

```text
public/schema/{event-id}/index.html
```

This gives clean URLs like `/schema/middag-2026-06-30-1630/`.

### 18.1 Data source

The renderer receives a single event object, the camp object, `siteUrl`,
`footerHtml`, and `navSections` — all already available in `build.js`.

### 18.2 Page content

Each page shows:

- Event title (H1)
- Date (formatted in Swedish via `formatDate()`)
- Start time – end time
- Location
- Responsible person
- Description (if non-empty, rendered as Markdown → sanitized HTML via
  `renderDescriptionHtml()` from `source/build/markdown.js`)
- External link (if non-empty)

The `owner` and `meta` fields are never rendered.

A "← Tillbaka till schemat" link points to `/schema.html`.

The event detail body uses the same structured layout as the RSS description
(see §17.3 / 02-§15.15):

- Line 1: formatted date, start–end time (no labels)
- Line 2: `Plats:` value ` · ` `Ansvarig:` value (with labels)
- Line 3: description as Markdown → HTML (detail page, schedule, today view)
  or Markdown → plain text (RSS, iCal)
- Line 4: external link (only if set)

### 18.3 Layout

Event pages use the shared `pageNav()` and `pageFooter()` from `layout.js`,
the same `style.css`, and the `<meta name="robots">` tag. The stylesheet is
referenced as `../../style.css` since the page is two levels deep
(`/schema/{id}/index.html`).

### 18.4 Build integration

`build.js` loops over all events and calls `renderEventPage()` for each one.
It creates `public/schema/{event-id}/` and writes `index.html` inside it.

### 18.5 Event data CI pipeline impact

When a new event is submitted via the form, the event data CI pipeline
rebuilds and deploys the four schema files. The per-event pages and RSS feed
are also rebuilt, but the targeted FTP deploy in `event-data-deploy.yml`
must be updated to include:

- `public/schema.rss`
- `public/schema/*/index.html` (all per-event pages)

### 18.6 Files

| File | Role |
| --- | --- |
| `source/build/render-event.js` | Renders per-event detail pages at build time |

### 18.7 Files changed

| File | Change |
| --- | --- |
| `source/build/build.js` | Loop over events; call `renderEventPage()`; create directories and write files |
| `.github/workflows/event-data-deploy.yml` | Add `schema.rss` and `schema/` to the artefact and FTP deploy |

---
