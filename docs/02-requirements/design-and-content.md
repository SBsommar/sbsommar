---
title: "SB Sommar – Requirements: Design and Content"
---

# SB Sommar – Requirements: Design and Content

Visual and editorial polish: hero redesign, link colors, modal styling, registration banner, locale overview page, index design.

Part of [the requirements index](./index.md). Section IDs (`02-§N.M`) are stable and cited from code; they do not encode the file path.

---

## 30. Hero Section Redesign

The homepage hero section is redesigned from a full-width image to a two-column
layout with a title, social links, and a camp countdown. The goal is a warmer,
more inviting first impression that immediately communicates the site's purpose
and connects visitors to community channels.

### 30.1 Layout structure

- The hero section is a two-column layout: image area (approximately 2/3 width)
  and a sidebar panel (approximately 1/3 width). <!-- 02-§30.1 -->
- On mobile (below 690px), the layout stacks vertically: title, then image,
  then sidebar content. <!-- 02-§30.2 -->

### 30.2 Title

- A heading "Sommarläger i Sysslebäck" is displayed above the hero image,
  left-aligned within the image column. <!-- 02-§30.3 -->
- The title uses `var(--color-terracotta)` as its text color. <!-- 02-§30.4 -->
- The title uses the existing H1 size (40px) and weight (700) from the
  design system. <!-- 02-§30.5 -->

### 30.3 Hero image

- The hero image has rounded corners (a new `--radius-lg` token is added
  to the design system for this purpose). <!-- 02-§30.6 -->
- The image uses `object-fit: cover` and is responsive. <!-- 02-§30.7 -->
- The image occupies approximately 2/3 of the hero section width on
  desktop. <!-- 02-§30.8 -->

### 30.4 Social links sidebar

- The sidebar contains two social link icons stacked vertically:
  a Discord icon and a Facebook icon. <!-- 02-§30.9 -->
- The Discord icon links to the project Discord channel. <!-- 02-§30.10 -->
- The Facebook icon links to the camp's Facebook group. <!-- 02-§30.11 -->
- Icons are displayed at a recognizable size (approximately 64px) and are
  vertically centered within their area of the sidebar. <!-- 02-§30.12 -->

### 30.5 Countdown

- Below the social icons, a countdown displays the number of days remaining
  until the next camp starts. <!-- 02-§30.13 -->
- The countdown target date is derived automatically from `camps.yaml`:
  the `start_date` of the nearest upcoming camp. <!-- 02-§30.14 -->
- The countdown shows two lines: the number (large, prominent) and the
  label "Dagar kvar" beneath it. <!-- 02-§30.15 -->
- The countdown is rendered at build time as a `data-target` attribute.
  Client-side JavaScript calculates and updates the number on page
  load. <!-- 02-§30.16 -->
- If no upcoming camp exists, the countdown is hidden. <!-- 02-§30.17 -->
- While a camp is ongoing — today is on or between its `start_date` and
  `end_date`, inclusive — the countdown is not displayed. It reappears, counting
  toward the next camp, once the ongoing camp has ended. <!-- 02-§30.26 -->
- The countdown area has a subtle background (cream/sand oval or rounded
  rectangle) to visually separate it from the sidebar. <!-- 02-§30.18 -->

### 30.7 Visual refinements

- The countdown background color is `#FAF7EF` (a near-white cream), not
  semi-transparent. <!-- 02-§30.23 -->
- The Discord icon uses the image `discord-ikon.webp`. <!-- 02-§30.24 -->
- The sidebar is vertically centered alongside the hero image (not
  top-aligned). <!-- 02-§30.25 -->

### 30.6 Implementation constraints

- All styling uses CSS custom properties from `docs/07-design/css-strategy.md §7`.
  No hardcoded colors, spacing, or typography. <!-- 02-§30.19 -->
- The countdown client-side script is minimal — no framework, no external
  dependency. <!-- 02-§30.20 -->
- Social icon images are stored in `source/content/images/` and copied
  to `public/images/` at build time. <!-- 02-§30.21 -->
- The Facebook link and Discord link are provided at build time from
  configuration, not hardcoded in templates. <!-- 02-§30.22 -->

---

---

## 31. Inline Camp Listing and Link Styling

The camp listing is moved from a standalone section into the intro section,
appearing directly below the first heading. Link styling is updated site-wide.

### 31.1 Camp listing placement

- The camp listing (upcoming and recent camps) is rendered inside the intro
  section, immediately after the first `<h4>` heading. <!-- 02-§31.1 -->
- The camp listing is no longer a separate page section and does not have its
  own heading or navigation entry. <!-- 02-§31.2 -->

### 31.2 Camp status icons

- Upcoming camps (end date in the future) display a sun icon (☀️) before the
  camp name. <!-- 02-§31.3 -->
- Past camps (end date in the past) display a green checkbox icon (✅) before
  the camp name. <!-- 02-§31.4 -->
- Status detection remains client-side via `data-end` attributes and
  JavaScript, as defined in 02-§28.14. <!-- 02-§31.5 -->

### 31.3 Camp item content

- Each camp item shows the camp name, location, and formatted date
  range. <!-- 02-§31.6 -->
- Camp information text is no longer rendered in the listing. <!-- 02-§31.7 -->

### 31.4 Content link styling

- All links inside `.content` use `var(--color-terracotta)` as their text
  color. <!-- 02-§31.8 -->
- Content links have no underline by default; underline appears on
  hover. <!-- 02-§31.9 -->

### 31.5 Markdown heading support

- The markdown converter supports `####` (h4) headings in addition to
  h1–h3. <!-- 02-§31.10 -->

### 31.6 Implementation constraints

- All styling must use CSS custom properties from the design system.
  No hardcoded colors, spacing, or typography. <!-- 02-§31.11 -->
- No additional runtime JavaScript beyond the existing client-side date
  detection. <!-- 02-§31.12 -->

---

---

## 47. Heading and Link Color Update

### 47.1 Site requirements

All heading elements (h1–h6) use terracotta (`var(--color-terracotta)`)
as their text color. <!-- 02-§47.1 -->

Content links (`.content a`) are styled with terracotta color and a
permanent underline (`text-decoration: underline`), not only on
hover. <!-- 02-§47.2 -->

Navigation links, back-links, and other non-content links retain their
existing styles. <!-- 02-§47.3 -->

---

---

## 55. Submit modal design polish

The submit progress modal (used in add-activity and edit-activity forms) needs
visual polish to look clean and consistent with the rest of the site design.

### 55.1 Site requirements

- The modal heading must not show a browser focus outline when
  programmatically focused. The heading uses `tabindex="-1"` for
  programmatic focus only and is not an interactive element. <!-- 02-§55.1 -->
- The modal box must use `--radius-lg` (16 px) border-radius for a softer,
  more modern appearance. <!-- 02-§55.2 -->
- The modal box must use `--space-lg` top/bottom padding for more generous
  internal spacing. <!-- 02-§55.3 -->
- The modal heading and progress steps must be center-aligned. <!-- 02-§55.4 -->
- The modal box must appear with a subtle entry animation (fade in + slide
  up) lasting no more than 300 ms, consistent with the design constraint
  in `07-§10.2`. <!-- 02-§55.5 -->

---

---

## 64. Index Page Design Improvements

Visual polish for the main landing page to reduce monotony on a long single-page
scroll and better leverage existing design tokens.

### 64.1 Testimonial cards

- Each testimonial (name, photo, quote) must be wrapped in a white card with
  `box-shadow`, `border-radius`, and `padding` matching the card component
  spec (07-§6.19–22). <!-- 02-§64.1 -->
- The testimonial photo must be displayed as a circular thumbnail (~60 px)
  beside the name, matching 07-§6.23. <!-- 02-§64.2 -->
- Testimonial cards must be constrained to `--container-narrow` max-width. <!-- 02-§64.3 -->
- The card structure must be generated at build time from the existing
  Markdown format (## Name + image + blockquote). Content files must not
  need to change. <!-- 02-§64.4 -->

### 64.2 Alternating section backgrounds

- Every other content section on the index page must have a cream-light
  background (`--color-cream-light`) using a full-bleed pseudo-element,
  creating edge-to-edge colour bands. <!-- 02-§64.5 -->
- The first section (section-first) is excluded from alternation. <!-- 02-§64.6 -->
- Alternating sections must not display the default border-top divider. <!-- 02-§64.7 -->

### 64.3 Decorative section headings

- Section headings use the existing terracotta colour; no additional
  decorative line is rendered. <!-- 02-§64.8 -->

### 64.4 RFSB logo placement

- The RFSB logo in the first section must be displayed as a small inline
  floated image (~70 px wide) beside the opening paragraph. <!-- 02-§64.9 -->

### 64.6 Consistent content image widths

- General content images (`.content-img`) must be constrained to
  max-width 500 px. <!-- 02-§64.13 -->
- Accommodation images (Stuga, Vandrarhem, Campingplats, Klarälvsbyn)
  must be constrained to 250 px. <!-- 02-§64.14 -->
- The Servicehus image must match the hero width
  (`--container-narrow`). <!-- 02-§64.15 -->

### 64.7 Compact section spacing

- Content sections must use compact vertical spacing (padding-top and
  margin-bottom ≤ `--space-md`). <!-- 02-§64.16 -->
- Section-alt padding must match regular section spacing. <!-- 02-§64.17 -->

### 64.8 Full-bleed footer

- The site footer must use a full-bleed pseudo-element background
  (sage/cream mix) with no gap below the last content section. <!-- 02-§64.18 -->
- Body must have no bottom padding. <!-- 02-§64.19 -->

### 64.9 Mobile scroll-to-top button

- A scroll-to-top button must appear on mobile viewports (≤ 767 px)
  after scrolling 300 px. <!-- 02-§64.20 -->
- The button must match the hamburger toggle in size (42 × 42 px),
  colour, and border-radius. <!-- 02-§64.21 -->
- The button must be a child of `<nav class="page-nav">`, centred
  horizontally (`position: absolute; left: 50%;
  transform: translateX(-50%)`). <!-- 02-§64.22 -->
- The button must smooth-scroll to the top on click. <!-- 02-§64.23 -->

---

---

## 94. Registration Banner and CTA Button

### 94.1 Context

The homepage must signal, at a glance, that registration is open for each
upcoming camp. The "Hur anmäler jag oss?" section contains an inline bold
markdown link that first-time visitors easily miss, and nothing else on the
page communicates whether registration is currently open or when it closes.
Two changes address this: a banner below the hero that announces the open
registration window and links to the section, and a prominent CTA button
inside the section itself that replaces the inline markdown link.

### 94.2 User requirements

- A prospective family visiting the homepage during an open registration
  period for a camp sees a banner directly below the hero image announcing
  that registration for that camp is open, together with the last
  registration date. <!-- 02-§94.1 -->
- Clicking the banner navigates to the `#anmalan` section on the same
  page. <!-- 02-§94.2 -->
- One banner is rendered per non-archived camp that has a registration
  window, ordered by the camp's `start_date` ascending (closest camp
  first). <!-- 02-§94.3 -->
- The "Hur anmäler jag oss?" section contains a visually prominent
  "Anmäl er här" button that opens the external booking site in a new
  tab. The specific URL lives in the build code, not in this
  requirement. <!-- 02-§94.4 -->
- The "Anmäl er här" button sits on its own line directly under the
  "Hur anmäler jag oss?" heading, as an inline-block element sized to
  its own content. <!-- 02-§94.5 -->
- The button layout is identical on desktop and mobile — no float, no
  breakpoint-dependent width change. <!-- 02-§94.6 -->
- The registration section contains no inline bold markdown link labelled
  "Anmäl er här"; the CTA button is the single call-to-action. <!-- 02-§94.7 -->

### 94.3 Data requirements

- Each non-archived camp in `camps.yaml` declares the fields
  `registration_opens` and `registration_closes`, both as ISO dates
  (`YYYY-MM-DD`, inclusive). <!-- 02-§94.8 -->
- The data validator rejects a non-archived camp that is missing either
  field, has a non-ISO date, has `registration_opens > registration_closes`,
  or has `registration_closes >= start_date`. <!-- 02-§94.9 -->
- Archived camps may omit the registration fields; the validator does not
  require them. <!-- 02-§94.10 -->

### 94.4 Banner visibility rules

- Each banner is rendered in the static HTML at build time with the
  `hidden` attribute and the data attributes `data-opens` and
  `data-closes` carrying the camp's registration window. <!-- 02-§94.11 -->
- A client-side script removes `hidden` only when the current
  Europe/Stockholm date satisfies
  `data-opens <= today <= data-closes`. <!-- 02-§94.12 -->
- Outside the registration window the banner remains hidden; it does not
  briefly flash visible, and its container reserves no visible space when
  empty. <!-- 02-§94.13 -->
- Banners are only rendered for non-archived camps. <!-- 02-§94.14 -->

### 94.5 CTA button placement and behaviour

- The CTA button is injected by the homepage renderer into the `anmalan`
  section, not authored in the markdown source, following the same
  injection pattern as `wrapTestimonialCards` in
  `source/build/render-index.js`. <!-- 02-§94.15 -->
- The button opens in a new browser tab with `target="_blank"` and
  `rel="noopener noreferrer"`, consistent with other external links on
  the site. <!-- 02-§94.16 -->
- The button reuses the existing `.btn-primary` class from
  `source/assets/cs/style.css`; no new colour, typography, or spacing
  tokens are introduced. <!-- 02-§94.17 -->

### 94.6 Analytics

- Each banner carries
  `data-goatcounter-click="click-register-banner-<camp-id>"`, where
  `<camp-id>` is the camp's `id` from `camps.yaml`. <!-- 02-§94.18 -->
- The CTA button carries
  `data-goatcounter-click="click-register-section"`. <!-- 02-§94.19 -->

### 94.7 Constraints

- All user-facing text is in Swedish. <!-- 02-§94.20 -->
- CSS uses existing design tokens from `07-design/css-strategy.md §7`; no hardcoded
  colours, spacing, or typography. <!-- 02-§94.21 -->
- No new JavaScript files are added; the visibility script is inline in
  the generated `index.html`, consistent with §71.11. <!-- 02-§94.22 -->
- No new npm or Composer dependencies. <!-- 02-§94.23 -->

---

---

## 98. Locale Overview Page

### 98.1 Context

When participants add activities to the schedule via `/lagg-till.html`,
there is no direct way to see which locales are already booked at which
times. The form links to `/schema.html` with a reminder to "check the
schedule before adding", but on mobile this is awkward and an entire
week of bookings is hard to hold in memory. As a result, bookings that
unintentionally clash with existing activities can be submitted.

A dedicated Locale Overview page shows the active camp's events laid
out as a visual time-grid — one row per locale, blocks placed at their
scheduled times — so a person picking a time and place can see at a
glance which locales are already taken and which are free.

This section describes the overview page only. A soft conflict warning
rendered inside the add- and edit-activity forms, linking to this
overview, is covered in a later section. Issue #332.

### 98.2 Page existence and content

- A page at `/lokaler.html` exists on the built site and is regenerated
  on every build. <!-- 02-§98.1 -->
- The page displays every locale defined in `source/data/local.yaml`,
  in the same order as they appear in that file. <!-- 02-§98.2 -->
- Each locale is represented as one row in a visual time-grid that
  spans from the current date (inclusive) through the active camp's
  `end_date`. When the camp has not yet started (today before
  `start_date`), the grid spans `start_date` through `end_date`. When
  the active camp is fully in the past, the grid falls back to the
  full camp span so the page still renders. Past dates within an
  in-progress camp are hidden — there is no point showing yesterday
  when planning a new activity. <!-- 02-§98.3 -->
- Events from the active camp are rendered as time-blocks positioned
  horizontally within each locale row according to their date and
  start/end times. <!-- 02-§98.4 -->
- Each event-block displays the activity's title, start time, end
  time, and responsible person. <!-- 02-§98.5 -->
- Locales that have no events during the active camp are shown with
  the text "Inga bokningar" on that row. <!-- 02-§98.6 -->
- Events whose `location` value does not match any `name` in
  `local.yaml` are rendered in the "Annat" row. <!-- 02-§98.7 -->

### 98.3 Navigation

- The page is reached from `/schema.html` and `/lagg-till.html` via a
  text link labelled "Se lokalöversikt →". On `/lagg-till.html` the
  link sits inside the intro paragraph that reminds the participant to
  check the schedule for clashes before submitting. <!-- 02-§98.8 -->
- The page does not appear as an entry in the top navigation. <!-- 02-§98.9 -->

### 98.4 Accessibility and user-facing text

- The page heading is "Lokalöversikt" and all user-facing text is in
  Swedish, consistent with §14. <!-- 02-§98.10 -->
- Each event-block is focusable with the keyboard and carries an
  `aria-label` that communicates locale, date, time range, title, and
  responsible person, so a screen-reader user does not depend on
  visual grid positioning to understand the booking. <!-- 02-§98.11 -->
- The page includes a short legend above the grid explaining that
  blocks represent booked times and rows marked "Inga bokningar"
  mean the locale is free for the entire camp. The legend is placed
  above rather than below so it stays within the reader's first
  viewport — the grid itself is often taller than the screen. <!-- 02-§98.12 -->

### 98.5 Rendering

- The grid markup is generated server-side at build time by a new
  renderer `source/build/render-lokaler.js`. The page requires no
  client-side JavaScript to render or position the grid. <!-- 02-§98.13 -->
- The grid's visual styling — colors, spacing, and typography — uses
  the custom properties defined in `docs/07-design/css-strategy.md §7`; no colors,
  spacing, or font sizes are hardcoded. <!-- 02-§98.14 -->

### 98.6 Mobile behaviour

- On viewport widths below 600px the grid wrapper scrolls horizontally
  so that the full camp week remains viewable without breaking the
  surrounding page layout. The rest of the page flows normally. <!-- 02-§98.15 -->

### 98.7 Clash visualisation

- When two or more events in the same locale on the same day overlap
  in time, they are stacked in separate vertical lanes within the day
  band. Each event remains independently visible; one event never
  covers another. <!-- 02-§98.16 -->
- Every event that overlaps at least one other event in the same
  locale is visually marked as a clash: a distinct accent colour on
  the block (differentiated from the default booking colour) so that
  clashes stand out at a glance without requiring the reader to
  interact with the block. <!-- 02-§98.17 -->
- Back-to-back events (one's end time equals another's start time)
  are not treated as clashes. <!-- 02-§98.18 -->
- Non-overlapping events in a day that contains other clashing events
  retain the full height of their row. Only events that actually
  overlap one another share vertical space with each other. <!-- 02-§98.19 -->
- The top-left corner cell of the grid labels both axes with the text
  "Lokaler \ Dag" (the backslash reads as a diagonal separator between
  the row axis and the column axis). <!-- 02-§98.20 -->
- Events whose `start` time equals their `end` time (zero duration,
  typically legacy "sista för idag 23:59–23:59" markers) are not
  rendered as blocks on the grid — they have no duration to visualise
  and cannot conflict with anything. They remain visible through the
  regular schedule views. <!-- 02-§98.21 -->
- Cross-midnight events (events where the `end` time falls strictly
  before the `start` time, allowed up to 17 hours per §9) are split
  into two visual blocks — one on their own date from `start` to
  24:00, and one on the following date from 00:00 to `end`. Both
  blocks link to the same per-event detail page and carry aria-labels
  describing the continuation so a screen-reader user understands
  they are the same booking. <!-- 02-§98.22 -->
- The grid markup uses native table elements so assistive tech can
  announce the two-axis structure: `<table>` as the grid container,
  `<tr>` for each row, `<th scope="row">` for locale labels, `<th
  scope="col">` for day headers and the top-left corner cell, and
  `<td>` for each day band. CSS Grid still drives the visual
  layout via `display: grid` on the `<table>` and `display:
  contents` on the `<tr>`s. <!-- 02-§98.23 -->
