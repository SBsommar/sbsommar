---
title: "SB Sommar – Design: Components"
---

# SB Sommar – Design: Components

Component-level visual rules: header, hero, banners, buttons, cards, accordions, form errors, modals, the Markdown toolbar/preview, the day grid, the locale-overview grid, and the conflict-warning banner.

Part of [the design index](./index.md). Section IDs (`07-§N.M`) are stable and cited from code; they do not encode the file path.

---

## 6. Components

### Header / Navigation

- Full-width, fixed or sticky at top. <!-- 07-§6.1 -->
- Height: `120px` desktop, `70px` mobile. <!-- 07-§6.2 -->
- Background: white or cream, with a subtle bottom border or shadow. <!-- 07-§6.3 -->
- Logo on the left. Navigation links on the right. <!-- 07-§6.4 -->
- Nav links: uppercase, `12px`, `700` weight, spaced with `letter-spacing: 0.08em`. <!-- 07-§6.5 -->
- Active/hover: sage-hover green (`var(--color-sage-hover)`) color shift. <!-- 07-§6.6 -->
- Mobile: hamburger button toggles a dropdown panel containing all links. <!-- 07-§6.7 -->
- Desktop (≥ 768 px): hamburger hidden, all links visible in two rows. <!-- 07-§6.16-impl -->
- Row 1: main page links (uppercase, `13px`, `700`, `letter-spacing: 0.06em`,
  `color: var(--color-terracotta)`, sage-hover green on active/hover). <!-- 07-§6.17-impl -->
- Row 2: section anchor links (no text-transform, `11px`, `700`,
  `color: var(--color-terracotta)`, sage-hover green on hover). <!-- 07-§6.18-impl -->
- Two rows separated by a `1px` rule in `rgba(0,0,0,0.06)`. <!-- 07-§6.19-impl -->
- Mobile panel: `background: var(--color-terracotta)`, white text,
  `z-index: 100`. Fully rounded corners (`--radius-lg`), horizontal inset
  margins so it appears as a floating card. <!-- 07-§6.20-impl -->
- Mobile hamburger button: `background: var(--color-terracotta)`, white icon
  bars, `border-radius: var(--radius-md)`. <!-- 07-§6.21-impl -->
- Mobile menu hierarchy: page links at `15px` / `700` / `opacity: 0.9`;
  section links at `12px` / uppercase / `opacity: 0.6`. Separated by a
  `2px solid rgba(255,255,255,0.3)` rule. <!-- 07-§6.22-impl -->
- Mobile menu transition: `max-height` animation, `250ms ease`. <!-- 07-§6.23-impl -->
- Navigation bar is `position: sticky; top: 0` on all viewports so it
  remains visible when scrolling. A negative `margin-top` equal to `body`
  padding-top pulls the bar up, and an equal `padding-top` compensates, so
  the bar content stays at the same vertical position in both normal flow
  and stuck mode — no visible jump. <!-- 07-§6.24-impl -->
- `html` has `scroll-padding-top` set to account for the sticky navigation
  height, so anchor-link targets are not hidden behind the bar. <!-- 07-§6.25-impl -->

### Quick-add activity button (mobile)

- A `+` quick-add button (`.quick-add-btn`) sits in the row of floating
  action buttons in the sticky navigation, linking to the add-activity
  page. <!-- 07-§6.125 -->
- Mobile only (`≤ 767px`): `42 × 42px`, `background: var(--color-terracotta)`,
  white plus icon, `border-radius: var(--radius-md)` — matching the
  scroll-to-top and PWA-install buttons. Hidden on desktop. <!-- 07-§6.126 -->
- Positioned between the centred scroll-to-top button and the right-aligned
  feedback button; the PWA-install button shifts one slot left so the
  buttons never overlap. <!-- 07-§6.127 -->

### Edit-shortcut button (mobile)

- A pencil edit-shortcut button (`.edit-shortcut-btn`) sits beside the
  quick-add button in the sticky navigation's floating-action-button row,
  linking to the edit page. <!-- 07-§6.128 -->
- Mobile only (`≤ 767px`): `42 × 42px`, `background: var(--color-terracotta)`,
  white pencil icon, `border-radius: var(--radius-md)` — matching the other
  floating action buttons. The PWA-install button shifts one slot left so they
  never overlap. Hidden on desktop. <!-- 07-§6.129 -->
- Hidden by default; revealed by `nav.js` only for visitors who own an upcoming
  activity. An admin token does not reveal it. <!-- 07-§6.130 -->

### Hero Section

- Two-column layout on desktop: image area (~2/3) and sidebar panel (~1/3).
  On mobile (<690px), stacks vertically. <!-- 07-§6.8 -->
- A terracotta H1 title "Sommarläger i Sysslebäck" sits above the image
  column, left-aligned. <!-- 07-§6.9 -->
- Image has rounded corners using `--radius-lg` (16px) and uses
  `object-fit: cover`. <!-- 07-§6.10 -->
- The sidebar contains Discord and Facebook icons (~64px), vertically
  centered, followed by a countdown widget. <!-- 07-§6.11 -->
- The countdown shows a large number and "Dagar kvar" label inside a
  subtle cream/sand rounded container. <!-- 07-§6.11a -->
- The countdown background is `#FAF7EF` (near-white cream), solid — not
  semi-transparent. <!-- 07-§6.11b -->
- The sidebar is vertically centered alongside the hero image. <!-- 07-§6.11c -->

### Hero Action Buttons

- A row of pill-shaped action buttons appears below the hero image when
  the camp editing period is active. <!-- 07-§6.78 -->
- Three buttons: **Schema**, **Idag**, **Lägg till aktivitet**, linking
  to `schema.html`, `idag.html`, `lagg-till.html`. <!-- 07-§6.79 -->
- Background: `var(--color-terracotta)` (`#C76D48`), text white, `700`
  weight, `border-radius: 999px`, `padding: 10px 24px`. <!-- 07-§6.80 -->
- Hover: darken background to `#b35e3a`, `200ms ease`
  transition. <!-- 07-§6.81 -->
- The row is centred within the hero container using `display: flex;
  justify-content: center; gap: var(--space-sm)`. <!-- 07-§6.82 -->
- On mobile the buttons wrap and remain centred. <!-- 07-§6.83 -->
- Visibility is controlled by inline client-side JS that reads
  `data-opens` / `data-closes` attributes and toggles the `hidden`
  attribute. <!-- 07-§6.84 -->

### Registration Banners

- A vertical stack of banners appears directly below the hero image when
  one or more non-archived camps have an active registration window. <!-- 07-§6.89 -->
- One banner per camp, ordered by `start_date` ascending (closest camp
  on top). <!-- 07-§6.90 -->
- Each banner is a full-width `<a>` card with a terracotta left border
  accent (`border-left: 4px solid var(--color-terracotta)`), background
  `var(--color-cream-light)`, `border-radius: var(--radius-md)`,
  `padding: var(--space-sm) var(--space-md)`. <!-- 07-§6.91 -->
- Banner title: `700` weight, `color: var(--color-terracotta)`,
  `font-size: var(--font-size-base)`. <!-- 07-§6.92 -->
- Banner meta line: `font-size: var(--font-size-small)`,
  `color: var(--color-charcoal)`, displayed on its own line beneath the
  title. <!-- 07-§6.93 -->
- Container (`.hero-registration-banners`): `display: flex;
  flex-direction: column; gap: var(--space-sm)`, centred within the hero
  container width. <!-- 07-§6.94 -->
- Hover: background shifts to
  `color-mix(in srgb, var(--color-terracotta) 6%, var(--color-cream-light))`,
  `200ms ease`, no scale transform. <!-- 07-§6.95 -->
- Focus-visible: standard outline
  (`2px solid var(--color-terracotta); outline-offset: 2px`). <!-- 07-§6.96 -->
- Visibility is controlled by the same inline client-side JS as Hero
  Action Buttons: banners stay `hidden` outside the window defined by
  `data-opens` / `data-closes`. <!-- 07-§6.97 -->

### Registration CTA (in the anmälan section)

- The "Hur anmäler jag oss?" section carries a single prominent "Anmäl
  er här" call-to-action button injected by the build-time renderer, not
  authored in markdown. <!-- 07-§6.98 -->
- The button reuses `.btn-primary` styling (terracotta background, white
  text). <!-- 07-§6.99 -->
- Wrapper `.registration-cta` — `display: block; margin: 0 0
  var(--space-md) 0`: the button sits on its own line directly under
  the "Hur anmäler jag oss?" heading. <!-- 07-§6.100 -->
- `.registration-cta-btn` — `display: inline-block; text-decoration:
  none`: the button is sized to its own content. Same layout on
  desktop and mobile — no float, no breakpoint-dependent width
  change. <!-- 07-§6.101 -->
- The CTA opens the external registration service in a new tab
  (`target="_blank"`, `rel="noopener noreferrer"`). <!-- 07-§6.102 -->

### Buttons

- Min height: `40px`. <!-- 07-§6.12 -->
- Padding: `10px 24px`. <!-- 07-§6.13 -->
- Border-radius: `4px` (subtle, not fully rounded). <!-- 07-§6.14 -->
- **Primary**: Background `#C76D48`, text white, no border. <!-- 07-§6.15 -->
- **Secondary**: Border `#C76D48`, text `#C76D48`, transparent background. <!-- 07-§6.16 -->
- Hover: darken background by ~10%, smooth transition `200ms ease`. <!-- 07-§6.17 -->
- Font: same as body, `700` weight, `14–16px`. <!-- 07-§6.18 -->
- **Destructive**: Border `var(--color-error, #b91c1c)`, text
  `var(--color-error, #b91c1c)`, transparent background. Same sizing
  and font rules as secondary. Hover: background
  `var(--color-error, #b91c1c)`, text white. <!-- 07-§6.85 -->

### Token page form (admin)

The activation and mint forms on `/token.html` reuse the site's standard
form components rather than bespoke styles: buttons follow Buttons
(07-§6.15, 07-§6.16) — `.btn-primary` for Aktivera and Skapa länk,
`.btn-secondary` for Ta bort min token, Kopiera länken and Dela — and the
mint form's per-field validation uses the inline field-error component
(07-§6.34) with Swedish messages, so no native browser bubble appears.

- The generated activation-link field (`#mint-link`, read-only) reads as
  output, not input: `background: var(--color-cream)` and `cursor: default`
  set it apart from the editable fields above it. <!-- 07-§6.124 -->

### Cards (info blocks, testimonials)

- Background: white `#FFFFFF`. <!-- 07-§6.19 -->
- Border-radius: `6px`. <!-- 07-§6.20 -->
- Box shadow: `0 4px 12px rgba(0, 0, 0, 0.04)`. <!-- 07-§6.21 -->
- Padding: `24px`. <!-- 07-§6.22 -->
- Testimonial cards: circular profile image (`border-radius: 50%`, ~`60px`). <!-- 07-§6.23 -->
- Testimonial card layout: header row (image + name) above blockquote.
  `.testimonial-card` wraps each testimonial, constrained to
  `--container-narrow`. <!-- 07-§6.76 -->
- The testimonial card structure is generated at build time by splitting
  the Markdown output on h3 tags. Content Markdown files are unchanged. <!-- 07-§6.77 -->

### Accordion (FAQ)

- Header: sage green `#ADBF77` background, dark text. <!-- 07-§6.24 -->
- Body: cream `#F5EEDF` or white background. <!-- 07-§6.25 -->
- Toggle icon: `+` / `−` or a chevron. <!-- 07-§6.26 -->
- Animate open/close with CSS `max-height` transition. <!-- 07-§6.27 -->
- No JavaScript framework — plain JS or CSS-only if feasible. <!-- 07-§6.28 -->

### Section headings

- H2 with a short decorative sage-green line (`48px × 3px`) underneath,
  via `::after` pseudo-element. <!-- 07-§6.29 -->
- Or: a sage-green label above the heading at `12px` uppercase. <!-- 07-§6.30 -->

### Alternating section backgrounds

- Every other content section (starting from the second) receives a
  `--color-cream-light` background that stretches edge-to-edge across the
  viewport, creating horizontal colour bands. Uses the full-bleed technique
  (`margin-left: calc(-50vw + 50%)` etc.) to break out of the body
  container. `html` has `overflow-x: hidden` to prevent scrollbar from the
  `100vw` calculation. Class: `.section-alt`. <!-- 07-§6.78 -->
- The first section (`section-first`) is excluded from alternation. <!-- 07-§6.79 -->
- Alternating sections suppress the default `border-top` divider. <!-- 07-§6.80 -->

### Back-to-top link

- A "Till toppen" link is the last item in the navigation, inside the
  nav-menu so it is part of the mobile hamburger panel. <!-- 07-§6.81 -->
- Styled as a subtle nav link on desktop; inside the terracotta menu
  panel on mobile. <!-- 07-§6.82 -->

### Event / schedule items

- Clear time display: bold start time, lighter end time. <!-- 07-§6.31 -->
- Location as small text below. <!-- 07-§6.32 -->
- On the weekly schedule (`schema.html`) and the today view (`idag.html`), a row whose activity has ended (`.is-past`) has a light grey background — `rgba(0, 0, 0, 0.05)` — and its time and title are dimmed to `0.5` opacity, so the eye skips past what is over. <!-- 07-§6.134 -->
- On the same two views, the row whose activity is in progress (`.is-now`) is highlighted with a terracotta wash — `rgba(199, 109, 72, 0.1)` (a tint of `var(--color-terracotta)`) — and a `3px` terracotta left accent bar (`box-shadow: inset 3px 0 0 var(--color-terracotta)`), matching the highlight the dark display view uses for the current activity. These two rules are scoped to `body:not(.display-mode)` so they never affect the display view, which hides ended rows entirely. <!-- 07-§6.135 -->

### Display sidebar — portrait layout

`/live.html` is optimised for portrait-orientation screens (e.g. 1080 × 1920 px). The heading moves into the sidebar so events use the full available height from the top of the page. <!-- 07-§6.44 -->

- Layout: two columns. Events column `flex: 3`; sidebar `flex: 1` (~75 % / 25 %). <!-- 07-§6.45 -->
- The heading (`h1#today-heading`) sits at the top of the sidebar. It shows only the current day and date; no page-title prefix. <!-- 07-§6.46 -->
- Sidebar heading: sage green (`var(--color-sage)`), `22px`, `700`, line-height `1.2`, margin-bottom `var(--space-sm)`. <!-- 07-§6.47 -->
- Display-mode event rows are compact: `font-size: 13px`, reduced vertical padding (`6px` top/bottom). <!-- 07-§6.48 -->
- When a next day is shown, today's and the next day's activity cards are separated by a divider (`.day-divider`): a centred sage-green label (`var(--color-sage)`, `20px`, `700`) reading "Imorgon", flanked on both sides by a `2px` sage rule at `0.5` opacity. Spacing: margin `var(--space-lg)` above, `var(--space-md)` below. <!-- 07-§6.133 -->

### Display sidebar status widget

The sidebar of `/live.html` shows a compact status widget above the descriptive text and QR code.

- The widget contains a live clock (current time, updated every second) and a line showing when events were last updated. <!-- 07-§6.40 -->
- Clock text: sage green (`var(--color-sage)`), `48px`, `700` weight, tabular-nums, line-height `1`. <!-- 07-§6.41 -->
- Update time text: `12px`, muted white (`rgba(255,255,255,0.4)`), block, margin-top `var(--space-xs)`. <!-- 07-§6.42 -->
- The widget sits above the existing sidebar text and QR code, separated by `var(--space-md)` margin-bottom. <!-- 07-§6.43 -->
- The update line is labelled "Schema uppdaterat" so it is clear it reports when the schedule content last changed, not whether the screen is still live. When an app version is available it is appended to the same line as " · v{version}", giving the display view the version that other pages show in their footer. <!-- 07-§6.131 -->
- Below the widget, a connection warning (`.status-offline`) is hidden by default and shown only when the screen has lost contact with the server. It is a red band: `var(--color-error)` background, `var(--color-white)` text, `16px`, `700` weight, `var(--radius-md)` corners, padding `var(--space-xs) var(--space-sm)`, margin-top `var(--space-sm)`. Its text is "⚠ Ingen kontakt med servern sedan HH:MM". <!-- 07-§6.132 -->

### Form field errors (inline)

Per-field validation errors appear directly below the input they relate to. <!-- 07-§6.34 -->

- Each `.field` div may contain a `<span class="field-error">` after the input element. <!-- 07-§6.35 -->
- Error text: `14px`, `var(--color-terracotta)`. <!-- 07-§6.36 -->
- Invalid inputs receive a terracotta bottom border (`2px solid var(--color-terracotta)`) via `aria-invalid="true"`. <!-- 07-§6.37 -->
- Each error span is linked to its input with `aria-describedby` so screen readers announce the error in context. <!-- 07-§6.38 -->
- On successful revalidation (next submit attempt), the error text is removed, `aria-invalid` is cleared, and the border returns to normal. <!-- 07-§6.39 -->

### Form field info messages (inline)

Per-field informational messages (non-error) appear below the input, reusing
the same `<span>` element as errors but with a different class. <!-- 07-§6.44a -->

- The `.field-info` class provides non-error informational feedback. <!-- 07-§6.44b -->
- Info text color: `var(--color-charcoal)`. <!-- 07-§6.44c -->
- Info background: `color-mix(in srgb, var(--color-sage) 20%, var(--color-cream))`. <!-- 07-§6.44d -->
- Info left border: `3px solid var(--color-sage)`. <!-- 07-§6.44e -->
- Info does **not** set `aria-invalid` on the input — the input border remains normal. <!-- 07-§6.44f -->
- When switching between error and info states, the previous class must be removed (toggle `span.className` between `field-error` and `field-info`). <!-- 07-§6.44g -->

### Submit modal (progress / success / error)

The submit modal overlays the page during form submission and shows progress, success, or error states. <!-- 07-§6.49 -->

- Box: white background, `--radius-lg` (16 px) border-radius, generous shadow (`0 8px 32px rgba(0,0,0,0.16)`). <!-- 07-§6.50 -->
- Padding: `--space-lg` top/bottom, `--space-md` left/right — extra vertical breathing room. <!-- 07-§6.51 -->
- Heading and progress steps are center-aligned. <!-- 07-§6.52 -->
- The heading receives programmatic focus (`tabindex="-1"`) but must not display a visible focus outline since it is not interactive. <!-- 07-§6.53 -->
- Entry animation: fade-in + slide-up, 250 ms, `ease-out`. Within the 300 ms ceiling in `07-§10.2`. <!-- 07-§6.54 -->
- Backdrop: semi-transparent navy using `color-mix(in srgb, var(--color-navy) 60%, transparent)`. <!-- 07-§6.55 -->

### Markdown toolbar (description field)

A row of small icon buttons directly above the description `<textarea>`. <!-- 07-§6.56 -->

- Container (`.md-toolbar`): `display: flex`, `gap: 4px`, `padding: 4px`, background `var(--color-cream-light)`, border `1px solid rgba(0,0,0,0.1)`, `border-radius: var(--radius-sm) var(--radius-sm) 0 0` (top corners only). The textarea below it gets `border-radius: 0 0 var(--radius-sm) var(--radius-sm)` and `border-top: none` so they feel like one component. <!-- 07-§6.57 -->
- Buttons: `background: transparent`, no border, `padding: 6px`, `border-radius: var(--radius-sm)`, `color: var(--color-charcoal)`, `cursor: pointer`. <!-- 07-§6.58 -->
- Hover: `background: rgba(0,0,0,0.06)`. <!-- 07-§6.59 -->
- Focus-visible: same outline as other interactive elements (`2px solid var(--color-terracotta)`, `outline-offset: 2px`). <!-- 07-§6.60 -->
- Icons: `16px × 16px` inline SVGs, `stroke: currentColor`, `fill: none`, `stroke-width: 2`. <!-- 07-§6.61 -->
- A thin `1px solid rgba(0,0,0,0.1)` separator between the toolbar and textarea is achieved by the toolbar's bottom border matching the textarea's side borders. <!-- 07-§6.62 -->
- On narrow viewports the buttons simply wrap to a second row (flex-wrap). No special mobile treatment. <!-- 07-§6.63 -->

### Markdown preview (description field)

A read-only preview area below the description `<textarea>` that shows live-rendered Markdown. <!-- 07-§6.64 -->

- Container (`.md-preview`): `background: var(--color-cream-light)`, `border: 1px solid rgba(0,0,0,0.10)`, `border-radius: var(--radius-sm)`, `padding: var(--space-sm)`, `margin-top: var(--space-xs)`, `color: var(--color-charcoal)`. <!-- 07-§6.65 -->
- A label line (`.md-preview-label`) above the rendered content: `font-size: var(--font-size-small)`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.04em`, `color: var(--color-charcoal)`, `opacity: 0.5`, `margin: 0 0 var(--space-xs)`, `padding-bottom: var(--space-xs)`, `border-bottom: 1px solid rgba(0,0,0,0.07)` — mirrors the `.event-section-label` pattern with a thin separator line below. <!-- 07-§6.66 -->
- Inner content matches `.event-description` rules: paragraphs get `margin: 0 0 var(--space-xs)`, last paragraph `margin-bottom: 0`. <!-- 07-§6.67 -->
- The preview is hidden (`hidden` attribute) when the textarea is empty. <!-- 07-§6.68 -->
- `pointer-events: none` on inner content to enforce read-only behaviour. <!-- 07-§6.69 -->

### Scoped headings in descriptions

Headings inside event descriptions (`.event-desc`, `.event-description`) and
the Markdown preview (`.md-preview`) must be scaled down from the page-level
heading sizes so they fit the smaller context and follow a strictly decreasing
hierarchy. <!-- 07-§6.70 -->

- h1: `1.4em`, `700`, `color: var(--color-terracotta)`, `margin: 0 0 var(--space-xs)`. <!-- 07-§6.71 -->
- h2: `1.2em`, `700`, `color: var(--color-terracotta)`, `margin: 0 0 var(--space-xs)`. <!-- 07-§6.72 -->
- h3: `1.1em`, `700`, `color: var(--color-terracotta)`, `margin: 0 0 var(--space-xs)`. <!-- 07-§6.73 -->
- h4: `1em`, `700`, `color: inherit`, `margin: 0 0 var(--space-xs)`. <!-- 07-§6.74 -->

Using `em` makes the headings proportional to the container's font-size
(e.g. 13 px in `.event-extra`, 16 px in `.md-preview`). <!-- 07-§6.75 -->

### Character counter (form fields)

A small counter below text input fields showing how many characters have been
typed relative to the maximum. <!-- 07-§6.85 -->

- Counter element (`.char-counter`): `font-size: var(--font-size-small)`,
  `color: var(--color-charcoal)`, `opacity: 0.6`, `text-align: right`,
  `margin-top: 2px`. <!-- 07-§6.86 -->
- Warning state (`.char-counter.warn`): `color: var(--color-terracotta)`,
  `opacity: 1`. Applied when field value reaches or exceeds 90 % of the maximum
  length. <!-- 07-§6.87 -->
- The counter is hidden (`hidden` attribute) when the field value is below 70 %
  of the maximum length. <!-- 07-§6.88 -->

### Day grid (date selection)

A grid of day buttons replaces the native date picker on the add-activity
form. The grid is always multi-select — there is no toggle. <!-- 07-§6.76 -->

- Container (`.day-grid`): `display: flex`, `flex-wrap: wrap`,
  `gap: var(--space-xs)`. <!-- 07-§6.77 -->
- Day button (`.day-btn`): `min-width: 4.5em`, `padding: var(--space-xs)
  var(--space-sm)`, `border: 2px solid rgba(0,0,0,0.12)`,
  `border-radius: var(--radius-sm)`, `background: var(--color-white)`,
  `color: var(--color-charcoal)`, `font-size: var(--font-size-small)`,
  `text-align: center`, `cursor: pointer`. <!-- 07-§6.78 -->
- Hover: `border-color: var(--color-terracotta)`,
  `background: color-mix(in srgb, var(--color-terracotta) 10%, var(--color-white))`. <!-- 07-§6.79 -->
- Selected (`.day-btn.selected`): `border-color: var(--color-sage)`,
  `background: color-mix(in srgb, var(--color-sage) 12%, var(--color-cream))`.
  No `font-weight` change to prevent button size shifts. <!-- 07-§6.80 -->
- Focus-visible: same outline as other interactive elements
  (`2px solid var(--color-terracotta)`, `outline-offset: 2px`). <!-- 07-§6.81 -->
- The weekday abbreviation is displayed on one line, the date on the line
  below, both center-aligned within the button. <!-- 07-§6.82 -->
- Pagination nav (`.day-grid-nav`): `display: flex`, centered, with ← / →
  buttons when the camp has more than 8 days. Page size is set via
  `data-page-size` attribute on the day grid container. <!-- 07-§6.83 -->
- Confirmation summary (`.confirm-summary`): table layout inside the submit
  confirmation modal, with emoji icons in the first column and values in the
  second. Compact padding (`2px`), description row has extra top
  padding. <!-- 07-§6.84 -->
- A static `.field-info` hint with the text
  `Återkommande aktivitet — välj flera dagar.` is rendered between the
  `Datum *` label and the `.day-grid` container on the add-activity
  page. It is always visible and shares the styling defined in
  `07-§6.44a–6.44g`. <!-- 07-§6.103 -->

### Locale overview grid

The `/lokaler.html` page shows every locale (from `source/data/local.yaml`)
as a row, with the active camp's dates forming the horizontal axis and
existing bookings rendered as time-blocks inside each row. It is a
read-only visualisation aimed at spotting free time slots at a glance.

- Wrapper (`.lokaler-grid-wrapper`): `overflow-x: auto`,
  `width: fit-content`, `max-width: 100%`. The grid's visible frame
  lives on the wrapper (`1px solid color-mix(in srgb, var(--color-charcoal) 22%, transparent)`),
  so the frame stays put when the inner grid scrolls horizontally. <!-- 07-§6.104 -->
- Grid container (`.lokaler-grid`): CSS Grid with `grid-template-columns:
  var(--lokaler-label-col) repeat(var(--lokaler-day-count), var(--lokaler-day-col))`.
  A 1px `gap` with a charcoal-25%-over-transparent background shows as
  row and column divider lines. No radius — inner cells are rectangular,
  and any radius would leave empty triangles at the outer corners. <!-- 07-§6.105 -->
- Corner cell (`.lokaler-grid-corner`): top-left cell labelled
  "Lokaler \\ Dag" — the backslash reads as a diagonal separator between
  the row axis (locales) and the column axis (days). Shares the warm
  tan background with the data cells so the label chrome is visually
  just the row/column rubrics. `position: sticky; left: 0; z-index: 2`
  so it stays parked above the sticky label column. <!-- 07-§6.106 -->
- Locale label (`.lokal-label`): `flex-direction: column; justify-content: center`,
  `font-weight: 700`, `color: var(--color-charcoal)`,
  `background: var(--color-cream-light)`, `padding: var(--space-xs) var(--space-sm)`,
  `position: sticky; left: 0; z-index: 1`. Empty locales render
  "Inga bokningar" as a small italic sub-label inside the same cell
  (`.lokal-empty`). <!-- 07-§6.107 -->
- Day header (`.day-band-label`): weekday abbreviation and date
  (e.g. "mån 22/6"), `font-size: var(--font-size-small)`,
  `background: var(--color-cream-light)`, `font-weight: 700`,
  center-aligned. <!-- 07-§6.108 -->
- Day band (`.day-band`): warm tan background
  (`color-mix(in srgb, var(--color-cream) 90%, var(--color-charcoal) 10%)`)
  with a `repeating-linear-gradient` drawing one 1px vertical line per
  hour — so 12:00, 15:00, 18:00 … are visible even when a booking
  block is only a few pixels wide. `position: relative; min-height: 3.5em`
  so event blocks can be absolutely positioned inside. Bands with
  stacked lanes scale min-height via `.day-band--lanes-N` modifiers
  (5em for 2, 6.5em for 3, 8em for 4, 9.5em for 5). <!-- 07-§6.109 -->
- Event block (`.event-block`, rendered as `<a>`): absolute-positioned
  within its day band using inline-generated `[data-lb="…"]` rules for
  `left`/`width` (percent of the hour band) and custom properties
  `--lane` and `--group`. Vertical placement is `top: calc((var(--lane)
  / var(--group)) * 100% + 2px)`, `height: calc(100% / var(--group) - 4px)`
  — so non-overlapping events keep full band height even on days where
  other events stack. Default colour family signals "OK booking":
  `background: color-mix(in srgb, var(--color-sage) 25%, var(--color-white))`,
  `border-left: 3px solid var(--color-sage)`,
  `border-radius: var(--radius-sm)`,
  `min-width: 8px` (enough to stay clickable, small enough that
  1-hour events don't swell and distort the visible time gap between
  neighbouring bookings). <!-- 07-§6.110 -->
- Event block hover / focus-visible: expands to full content width
  (`width: auto; min-width: max-content`) so the full title is readable
  without a native tooltip, `z-index: 2` to lift above neighbours,
  `background: color-mix(in srgb, var(--color-sage) 45%, var(--color-white))`,
  plus a soft charcoal drop shadow. Focus ring: `2px solid var(--color-sage-hover)`,
  `outline-offset: 2px`. <!-- 07-§6.111 -->
- Clash marker (`.event-block--clash`): applied to any event that
  overlaps at least one other event in the same locale+day. Overrides
  the green palette with `--color-error`:
  `background: color-mix(in srgb, var(--color-error) 35%, var(--color-white))`,
  `border-left-color: var(--color-error)`,
  and `box-shadow: 0 0 0 1.5px var(--color-error)` as a red outline
  around the whole block. Hover/focus strengthens to a 55% error mix
  and adds a red drop shadow. The clash rules live *after* the general
  `.event-block:hover` rules in the stylesheet so they win at equal
  specificity. <!-- 07-§6.112 -->
- Empty-row sub-label (`.lokal-empty`): small italic
  "Inga bokningar" text inside `.lokal-label` when the locale has no
  events in the visible range. `font-style: italic; font-size:
  calc(var(--font-size-small) - 1px)`,
  `color: color-mix(in srgb, var(--color-charcoal) 55%, transparent)`. <!-- 07-§6.113 -->
- Legend (`.lokaler-legend`): placed **above** the grid (the grid is
  often taller than the viewport so a below-grid note would be easy to
  miss). `font-size: var(--font-size-small)`,
  `color: var(--color-charcoal)`,
  `max-width: 750px` so it wraps at the same reading width as
  `.intro` rather than stretching to the wider grid. <!-- 07-§6.114 -->
- On viewport widths below 600px, `.lokaler-grid-wrapper` retains its
  `overflow-x: auto`, and the locale label column shrinks via
  `--lokaler-label-col: 6em` and `--lokaler-day-col: 10em` to keep the
  day columns readable on phone screens. <!-- 07-§6.115 -->

### Conflict warning banner

The add-activity form, the edit-activity form, and per-event detail
pages at `/schema/<slug>/` all render the same conflict-warning
banner when the activity's date/time/place overlaps another booking.
The banner deliberately reuses the clash palette from the Locale
Overview (`.event-block--clash`) so the two signals feel like the
same thing. <!-- 07-§6.116 -->

- Banner (`.conflict-warning`):
  `background: color-mix(in srgb, var(--color-error) 35%, var(--color-white))`,
  `border-left: 3px solid var(--color-error)`,
  `box-shadow: 0 0 0 1.5px var(--color-error)`,
  `border-radius: var(--radius-sm)`,
  `padding: var(--space-md)`. The body text uses
  `color: var(--color-text)` (not red) — only the accent is red, so
  the banner reads as "heads up" rather than as a blocking error.
  The banner does not prevent submit. <!-- 07-§6.117 -->
- Banner lead (`.conflict-warning__lead`): plain paragraph,
  `margin: 0 0 var(--space-xs) 0`, `font-weight: 600`. The sentence
  uses singular ("en annan aktivitet") or plural ("flera aktiviteter")
  depending on how many conflicts are in that date group. <!-- 07-§6.118 -->
- Banner list (`.conflict-warning__list`): unbulleted list with
  time, title, and responsible person per row. Time is monospace or
  tabular-nums so the columns line up when several conflicts are
  listed. <!-- 07-§6.119 -->
- Banner date subheading (`.conflict-warning__date`, multi-date
  add-form only): small `<h3>` per conflicting date, e.g.
  `Måndag 4/5`. Dates without conflicts do not appear. <!-- 07-§6.120 -->
- Banner footer link (`.conflict-warning__footer a`): points to
  `/lokaler.html` with the text `Se lokalöversikt →`. `color:
  var(--color-error)`; underline on hover/focus. Same focus-ring
  treatment as other content links. <!-- 07-§6.121 -->
- Banner accessibility in the forms: `role="status"` and
  `aria-live="polite"` so assistive tech announces new conflicts as
  the user types, without stealing focus. On the static per-event
  page the banner does not need `aria-live` (the HTML is fixed at
  build time). <!-- 07-§6.122 -->
- Banner placement:
  - On the **add form**, immediately before the submit button so the
    user sees the clash on the way to clicking "Skicka".
  - On the **edit form**, at the top of the form (before the first
    fieldset) so a clash on a populated event is visible right
    beside the "Redigera aktivitet" heading without scrolling.
  - On **per-event pages**, inside `.event-detail` after the
    place/responsible row and before the description, so readers see
    the clash alongside the rest of the booking's metadata. <!-- 07-§6.123 -->
