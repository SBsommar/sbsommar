---
title: "SB Sommar – Requirements: Pages and Navigation"
---

# SB Sommar – Requirements: Pages and Navigation

Site structure: page inventory, the homepage pre-camp section, navigation, footer, hero CTAs, accordions, anchor IDs.

Part of [the requirements index](./index.md). Section IDs (`02-§N.M`) are stable and cited from code; they do not encode the file path.

---

## 2. Site Pages

The following pages must exist:

| ID | Page | URL | Audience |
| --- | --- | --- | --- |
| `02-§2.1` | Homepage | `/` | Prospective families, participants |
| `02-§2.2` | Weekly schedule | `/schema.html` | Participants |
| `02-§2.4` | Today view | `/idag.html` | Participants |
| `02-§2.4a` | Display view | `/live.html` | Shared screens |
| `02-§2.5` | Add activity | `/lagg-till.html` | Participants |
| `02-§2.6` | Archive | `/arkiv.html` | Prospective families, returning participants |
| `02-§2.7` | RSS feed | `/schema.rss` | Anyone subscribing to the schedule |
| `02-§2.11` | Edit activity | `/redigera.html` | Participants who submitted the event |
| `02-§2.12` | iCal feed | `/schema.ics` | Anyone subscribing to the schedule |
| `02-§2.13` | Calendar tips | `/kalender.html` | Participants wanting to sync the schedule |
| `02-§2.14` | Admin activation | `/token.html` | Administrators |

The homepage, schedule pages, add-activity form, and archive share the same header and navigation. <!-- 02-§2.8 -->
None require login. <!-- 02-§2.9 -->

The Today view (`/idag.html`) uses the standard site layout with header and navigation. <!-- 02-§2.4 -->
The Display view (`/live.html`) has no header or navigation — it is a minimal, full-screen display intended for shared screens around the camp. <!-- 02-§2.10 -->
Both show today's activities; they differ only in presentation context.

---

---

## 3. Homepage — Pre-Camp Requirements

The homepage is for families who know nothing about the camp.

It must answer, in order: <!-- 02-§3.1 -->

- What is SB Sommar, and who is it for?
- Is this the right place for my child?
- When and where does it take place?
- How do I register, and what are the deadlines?
- What does it cost, and what is included?
- Where do we stay, and what do we eat?
- What are the rules and what should we bring?
- What do previous participants say about it?

It must also include a frequently asked questions section. <!-- 02-§3.2 -->

The homepage must feel complete and trustworthy even when no camp is currently active. <!-- 02-§3.3 -->
When a camp is active or upcoming, the schedule and add-activity links are prominent. <!-- 02-§3.4 -->
The upcoming-camps list renders each camp as a compact one-liner (icon, name, location, and dates on a single line) with no visual separators between items. <!-- 02-§3.5 -->

The registration section must link to the external booking site, where families complete the full sign-up form. The specific URL lives in the build code, not in this requirement. <!-- 02-§3.6 -->

The pricing and rules sections must document the cancellation refund tiers and the organiser's right to refuse participation, matching the terms that bind participants at the point of registration. <!-- 02-§3.7 -->

**Tone:** Warm, calm, and clear. Written in Swedish. Not corporate. Not promotional.
The goal is that a parent visiting for the first time leaves thinking:
*"I understand what this is. I know how it works. I feel comfortable taking the next step."*

---

---

## 11. Activity Order and Overlaps

- Activities must always be displayed in chronological order (by date, then start time). <!-- 02-§11.1 -->
- Overlapping activities are allowed (see §4.8). <!-- 02-§11.2 -->
- The schedule must remain readable when multiple activities occur at the same time (see §4.8). <!-- 02-§11.3 -->

---

---

## 17. Simplicity

The site must:

- Work well on mobile devices. Schedule viewing and event submission are
  frequently done from a phone during camp week. <!-- 02-§17.1 -->
- Be readable on shared display screens (see Today view in §4). <!-- 02-§17.3 -->
- Require no explanation to use. A first-time visitor should understand the
  schedule and the add-activity form without instructions. <!-- 02-§17.2 -->
- Avoid complexity that does not serve a clear user need.

The purpose of the schedule is coordination, not administration.

---

---

## 22. Shared Site Footer

A shared footer must appear at the bottom of every page. Its content is maintained
in a single Markdown file so non-technical contributors can update it without
touching any template or layout code.

- Every page produced by the build must include a footer element at the bottom of
  `<body>`. <!-- 02-§22.1 -->
- Footer content is maintained in `source/content/footer.md`. <!-- 02-§22.2 -->
- The build reads `footer.md`, converts it to HTML using the same Markdown pipeline
  as other content pages, and injects the result into every page via the shared
  rendering layer. <!-- 02-§22.3 -->
- There must be no duplicated footer markup in any template or render function —
  the Markdown file is the single source of truth. <!-- 02-§22.4 -->
- If `footer.md` does not exist at build time, every page must still render
  successfully with an empty footer. The build must not crash or exit with an error. <!-- 02-§22.5 -->
- Updating `footer.md` and running the build must change the footer on all pages
  without modifying any other file. <!-- 02-§22.6 -->

---

---

## 24. Unified Navigation

The site must have exactly one navigation component, appearing at the top of every
page. There must be no secondary or duplicate navigation menus elsewhere on any page.

### 24.1 Structure

- Every page must include the same navigation header. <!-- 02-§24.1 -->
- The navigation must appear only once per page, in the header area, before
  any page content. <!-- 02-§24.2 -->
- The index page must not have an additional section-navigation menu below the
  hero image. <!-- 02-§24.3 -->

### 24.2 Page links

The navigation must contain links to all main pages: <!-- 02-§24.4 -->

- Hem (`index.html`)
- Schema (`schema.html`)
- Idag (`idag.html`)
- Lägg till (`lagg-till.html`)
- Arkiv (`arkiv.html`)

The link for the current page must be visually marked as active. <!-- 02-§24.5 -->

On desktop, the page links use the short labels listed above and are
displayed in uppercase via CSS (`text-transform: uppercase`). <!-- 02-§24.6 -->

On mobile, the hamburger menu uses longer, more descriptive labels: <!-- 02-§24.16 -->

- Hem
- Lägrets schema
- Dagens aktiviteter
- Lägg till aktivitet
- Lägerarkiv

### 24.3 Section links

The navigation must also include anchor links to the main sections of the
index page. <!-- 02-§24.7 -->

- Short nav labels are defined per section in `sections.yaml` via the `nav:` field. <!-- 02-§24.8 -->
- Section links on non-index pages must point to `index.html#id`. <!-- 02-§24.9 -->

### 24.4 Mobile behaviour

- On mobile (viewport narrower than 768 px), the navigation must be collapsed
  by default and toggled via a hamburger button. <!-- 02-§24.10 -->
- The hamburger button must have an accessible label (`aria-label`). <!-- 02-§24.11 -->
- The hamburger button must use `aria-expanded` to communicate state to
  assistive technologies. <!-- 02-§24.12 -->
- The expanded menu must be closable by pressing Escape. <!-- 02-§24.13 -->
- The expanded menu must be closable by clicking outside it. <!-- 02-§24.14 -->
- The expanded menu must close automatically when the user clicks a
  navigation link inside it. <!-- 02-§24.17 -->

### 24.5 Desktop behaviour

- On desktop (viewport 768 px and wider), the hamburger button must be hidden
  and all navigation links must be directly visible. <!-- 02-§24.15 -->

---

---

## 35. Location Accordions on Index Page

The Lokaler section on the index page must display each location from `local.yaml`
as an individual accordion item. The section heading and introductory text remain
visible; only the individual locations are collapsible.

### 35.1 Section heading

- The "Lokaler" heading (`## Lokaler` in `locations.md`) must render as a regular
  heading, not wrapped in an accordion. <!-- 02-§35.1 -->
- The introductory paragraph below the heading must remain visible (not inside
  any accordion). <!-- 02-§35.2 -->

### 35.2 Location accordions

- Each location entry in `local.yaml` must render as a separate
  `<details class="accordion">` element. <!-- 02-§35.3 -->
- The location `name` must appear as the `<summary>` text. <!-- 02-§35.4 -->
- The location `information` text must appear inside the accordion body. <!-- 02-§35.5 -->
- Locations with one or more `image_path` values must render each image as an
  `<img>` inside the accordion body, below the information text. <!-- 02-§35.6 -->
- Locations with empty `information` and empty `image_path` must still render as
  an accordion (summary only, empty body). <!-- 02-§35.7 -->
- Accordions must appear in the same order as entries in `local.yaml`. <!-- 02-§35.8 -->

### 35.3 Build integration

- The build must pass the full location data (not just names) to the index
  rendering pipeline. <!-- 02-§35.9 -->
- The `collapsible: true` flag in `sections.yaml` must be removed for the lokaler
  section (individual location accordions replace it). <!-- 02-§35.10 -->

---

---

## 61. Mobile Navigation Improvements

### Motivation

The mobile hamburger menu has usability problems on long pages: it scrolls
out of view so users cannot access navigation without scrolling back to the
top, and its visual design (same cream background as the page) makes it hard
to distinguish from surrounding content. These issues were identified through
manual testing on mobile devices.

### 61.1 Sticky navigation requirements

- On mobile viewports (≤ 767 px), the navigation bar must remain visible
  at the top of the viewport when the user scrolls. <!-- 02-§61.1 -->
- The sticky behaviour must also apply on desktop viewports so navigation
  is always reachable. <!-- 02-§61.2 -->

### 61.2 Hamburger button design requirements

- The hamburger button must have a terracotta (`var(--color-terracotta)`)
  background with white icon bars so it is clearly visible against the
  page background. <!-- 02-§61.3 -->
- The button must have rounded corners (`var(--radius-md)`) for a softer
  appearance. <!-- 02-§61.4 -->

### 61.3 Mobile menu panel design requirements

- The dropdown menu panel must use a terracotta background with white
  text. <!-- 02-§61.5 -->
- Text colour must be `var(--color-white)` to meet WCAG AA contrast
  for large text (14 px bold qualifies as large text; contrast ratio
  ≥ 3:1). <!-- 02-§61.6 -->
- The panel must have fully rounded corners (`var(--radius-lg)`) and
  horizontal inset margins so it appears as a floating card. <!-- 02-§61.7 -->
- Page links (top section) and section links (bottom section) must be
  visually separated: page links at 15 px / 700 weight, section links
  at 12 px / uppercase / reduced opacity, with a visible
  divider. <!-- 02-§61.8 -->

### 61.4 Menu transition requirements

- Opening and closing the menu must use a smooth CSS transition
  (max-height, 250 ms) instead of an abrupt display toggle. <!-- 02-§61.9 -->

### 61.5 Accessibility requirements

- Focus outlines on the hamburger button and menu links must remain
  visible against the terracotta background (white outline). <!-- 02-§61.10 -->
- Existing keyboard and ARIA behaviour (Escape to close, aria-expanded,
  click-outside-to-close) must be preserved. <!-- 02-§61.11 -->

---

---

## 70. Main Landmark Element

Every HTML page must contain a `<main>` landmark element so that screen
readers can let users skip past navigation directly to the page content.
This addresses the PageSpeed Accessibility audit flag for missing `<main>`
landmark.

### 70.1 Structural rules

- Every page must have exactly one `<main>` element. <!-- 02-§70.1 -->
- The `<main>` element must wrap all page content between the navigation
  and the footer (or end of content if there is no footer). <!-- 02-§70.2 -->
- The `<main>` element must NOT contain `<nav>` or `<footer>`
  elements. <!-- 02-§70.3 -->

### 70.2 Constraints

- Adding `<main>` must not change any visual styling — it is a semantic
  element only. <!-- 02-§70.4 -->
- Only one `<main>` element is permitted per page (HTML spec
  requirement). <!-- 02-§70.5 -->

---

---

## 71. Hero Action Buttons

When a camp is active and within its editing period, three quick-access
action buttons must appear directly below the hero image on the index page.
The buttons provide fast navigation to the most-used pages during an
active camp.

### 71.1 User requirements

- A camp participant visiting the home page during an active editing
  period must see three action buttons immediately below the hero
  image. <!-- 02-§71.1 -->
- The buttons must link to, in this order: Idag (`idag.html`), Schema
  (`schema.html`), and Lägg till (`lagg-till.html`). <!-- 02-§71.2 -->
- The buttons must be visually prominent, using terracotta pill-shaped
  styling. <!-- 02-§71.3 -->

### 71.2 Visibility rules

- The buttons must be rendered in the static HTML at build time with
  data attributes for the editing period dates. <!-- 02-§71.4 -->
- A client-side script must show the buttons only when the current date
  falls within `[opens_for_editing, end_date + 1 day]`. <!-- 02-§71.5 -->
- Outside the editing period the button container must be hidden
  (`hidden` attribute). <!-- 02-§71.6 -->

### 71.3 Styling

- Each button must use pill-shaped border-radius (`border-radius: 999px`),
  terracotta background, white text, bold weight. <!-- 02-§71.7 -->
- The button row must be centred within the hero container and have
  appropriate spacing between buttons. <!-- 02-§71.8 -->
- The buttons must be responsive: wrapping naturally on smaller
  screens. <!-- 02-§71.9 -->

### 71.4 Constraints

- The buttons must only appear on the index page. <!-- 02-§71.10 -->
- No new JavaScript files may be added — the script must be inline in
  `index.html`. <!-- 02-§71.11 -->
- CSS must use existing design tokens from `07-design/css-strategy.md §7`. <!-- 02-§71.12 -->

---

---

## 72. Close Past-Day Accordions on Schedule Page

On the schedule page (`schema.html`), day accordions for dates that have
already passed should be collapsed by default, so that the visitor sees
current and future days open and past days closed.

### 72.1 User requirements

- When a participant opens the schedule page, day sections whose date
  is before the visitor's current date must be collapsed
  (closed). <!-- 02-§72.1 -->
- Day sections for today and future dates must remain open. <!-- 02-§72.2 -->
- The visitor must still be able to manually open a closed past-day
  accordion by clicking it. <!-- 02-§72.3 -->

### 72.2 Implementation rules

- The comparison must use the visitor's local date (client-side),
  not the build date. <!-- 02-§72.4 -->
- The script must run on page load and close past days by removing
  the `open` attribute from `<details class="day">` elements whose
  `id` (ISO date) is before today. <!-- 02-§72.5 -->
- The script must be inline in the schedule page — no new JS files
  may be added. <!-- 02-§72.6 -->

### 72.3 Constraints

- All days must still be rendered with the `open` attribute at build
  time, so that the page is fully usable without JavaScript. <!-- 02-§72.7 -->
- The script must not affect event-row `<details>` elements, only
  day-level `<details class="day">` elements. <!-- 02-§72.8 -->

---

---

## 74. Sticky Navigation Positioning

### 74.1 Site requirements

- The navigation bar remains at the same vertical position whether the
  page is at the top or scrolled — no visible shift when sticky
  positioning activates. <!-- 02-§74.1 -->
- The navigation bar appears at the same vertical position on every
  page load. <!-- 02-§74.2 -->
- When a user clicks an anchor link in the navigation, the target
  section is visible below the navigation bar, not hidden
  behind it. <!-- 02-§74.3 -->
- The navigation bar remains at the same horizontal position when
  navigating between pages, regardless of whether the page content
  requires a scrollbar. <!-- 02-§74.4 -->

---

---

## 75. Consistent Navigation and Page Title Labels

Navigation labels follow the principle: short where space is limited,
descriptive where there is room.

### 75.1 User requirements

- A visitor on desktop sees short, uppercase navigation labels so the
  menu stays compact. <!-- 02-§75.1 -->
- A visitor using the mobile hamburger menu sees longer, descriptive
  labels so every link is self-explanatory. <!-- 02-§75.2 -->
- A visitor using hero quick-access buttons sees short labels in the
  order Idag, Schema, Lägg till. <!-- 02-§75.3 -->

### 75.2 Site requirements

- The desktop navigation bar displays page links with short labels
  (Hem, Schema, Idag, Lägg till, Arkiv) rendered in uppercase via
  `text-transform: uppercase`. <!-- 02-§75.4 -->
- The mobile hamburger menu displays page links with descriptive labels:
  Hem, Lägrets schema, Dagens aktiviteter, Lägg till aktivitet,
  Lägerarkiv. <!-- 02-§75.5 -->
- The hero action buttons use short labels in this order: Idag, Schema,
  Lägg till. <!-- 02-§75.6 -->
- The `<h1>` page title on `schema.html` is
  "Lägrets schema – {campName}". <!-- 02-§75.7 -->
- The `<h1>` page title on `idag.html` is
  "Dagens aktiviteter". <!-- 02-§75.8 -->
- The `<title>` element on `schema.html` is
  "Lägrets schema – {campName}". <!-- 02-§75.9 -->
- The `<title>` element on `idag.html` is
  "Dagens aktiviteter – {campName}". <!-- 02-§75.10 -->
- The layout module renders separate label sets for desktop and
  hamburger rather than sharing a single list. <!-- 02-§75.11 -->

---

---

## 79. Section Anchor ID Consistency

Section anchor IDs on the index page must match their navigation labels.
The `id` field in `sections.yaml` is the single source of truth for both
the `<section id="…">` attribute and the `href="#…"` in navigation links.

### 79.1 Anchor IDs

- The testimonials section must use `id="roster"`. <!-- 02-§79.1 -->
- The pricing section must use `id="kostnader"`. <!-- 02-§79.2 -->

### 79.2 Navigation link targets

- The navigation link for "Röster" must point to `#roster`. <!-- 02-§79.3 -->
- The navigation link for "Kostnader" must point to `#kostnader`. <!-- 02-§79.4 -->

---

---

## 114. Quick-Add Activity Button in Sticky Navigation

### Context

On long pages such as the schedule, reaching "Lägg till aktivitet" requires
opening the hamburger menu and scrolling within it. A one-tap quick-add button
in the always-visible sticky navigation lets a participant start adding an
activity from anywhere on the site without opening the menu.

### 114.1 User requirements

- A visitor on a mobile viewport sees a "+" button in the sticky top
  navigation that takes them directly to the add-activity page. <!-- 02-§114.1 -->
- The button is reachable without opening the hamburger menu, on every page
  except the add-activity page itself. <!-- 02-§114.2 -->

### 114.2 Site requirements

- The shared navigation renders a quick-add button as an `<a>` element linking
  to `lagg-till.html`, with `aria-label="Lägg till aktivitet"`. <!-- 02-§114.3 -->
- The quick-add button appears on every page except `lagg-till.html`, where it
  is omitted. <!-- 02-§114.4 -->
- The quick-add button is visible only on mobile viewports (≤ 767 px). On
  desktop it is not displayed, because the "Lägg till" page link is always
  visible in the navigation bar. <!-- 02-§114.5 -->
- The quick-add button is a child of `<nav class="page-nav">`, positioned in
  the row of floating action buttons between the centred scroll-to-top button
  and the feedback button. <!-- 02-§114.6 -->
- The quick-add button matches the other floating action buttons in size
  (42 × 42 px), terracotta background, white icon, and
  `var(--radius-md)` border-radius. <!-- 02-§114.7 -->
- The quick-add button displays a plus (+) icon. <!-- 02-§114.8 -->
- The PWA-install button is positioned to the left of the quick-add button so
  the two buttons never overlap. <!-- 02-§114.9 -->

---

## 115. Edit-Shortcut Button in Sticky Navigation

### Context

A participant who has added activities needs a fast way back to them to make
edits. Without a shortcut, the only route is to open the schedule and locate
each owned row. A button beside the menu button in the always-visible sticky
navigation — shown only to people who actually own an upcoming activity — takes
them straight to the edit page, which lists their own activities. Holding an
admin token is irrelevant here: the shortcut is about *my* activities, not
administration.

### 115.1 User requirements

- A participant who owns at least one upcoming activity sees an edit-shortcut
  button beside the menu button in the sticky top navigation, taking them
  directly to the edit page. <!-- 02-§115.1 -->
- A visitor who owns no upcoming activity sees no edit-shortcut button. <!-- 02-§115.2 -->
- Holding an admin token does not by itself reveal the button; visibility
  depends only on the visitor's own activities. <!-- 02-§115.3 -->

### 115.2 Site requirements

- The shared navigation renders the edit-shortcut button as an `<a>` element
  linking to `redigera.html`, with `aria-label="Redigera mina aktiviteter"`. <!-- 02-§115.4 -->
- The edit-shortcut button appears on every page except `redigera.html`, where
  it is omitted. <!-- 02-§115.5 -->
- The edit-shortcut button is hidden by default and is revealed by client-side
  JavaScript only when the `sb_session` cookie holds valid signed ownership for
  at least one activity whose date has not passed. <!-- 02-§115.6 -->
- The presence of an admin token in `localStorage` never reveals the
  edit-shortcut button; only own-activity ownership does. <!-- 02-§115.7 -->
- The edit-shortcut button is visible only on mobile viewports (≤ 767 px). On
  desktop it is never displayed. <!-- 02-§115.8 -->
- The edit-shortcut button is a child of `<nav class="page-nav">`, positioned
  beside the hamburger menu button. <!-- 02-§115.9 -->
- The edit-shortcut button matches the menu and floating action buttons in size
  (42 × 42 px), terracotta background, white icon, and `var(--radius-md)`
  border-radius. <!-- 02-§115.10 -->
- The edit-shortcut button displays a pencil (edit) icon. <!-- 02-§115.11 -->
