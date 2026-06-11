---
title: "Traceability — 07-design"
---

# Traceability — 07-design

Part of [the traceability index](./index.md).

| ID | Requirement | Doc Ref | Test(s) | Implementation | Status |
| --- | --- | --- | --- | --- | --- |
| `07-§7.1` | All CSS uses the custom properties defined at `:root`; no hardcoded colors, spacing, or typography | 07-design/css-strategy.md §7 | CSS-32..35 | `source/assets/cs/style.css` – all values use `var(--…)` tokens (not enforced by a linter) | covered |
| `07-§9.5` | Accordion items use `aria-expanded` and `aria-controls` ARIA attributes (see `02-§13.6`; archive accordion uses explicit ARIA via `02-§21.6`) | 07-design/imagery-and-accessibility.md §9 | — (manual: native `<details>` provides equivalent accessibility; see `02-§13.6`) | `source/build/render.js` – native `<details>/<summary>`; archive uses explicit ARIA (ARK-04, ARK-05) | implemented |
| `07-§1.1` | The design has a warm, welcoming, outdoorsy feel — not corporate or sterile | 07-design/index.md §1 | — | Assessed through visual review | implemented |
| `07-§1.2` | Earth tones and natural colors are used throughout | 07-design/index.md §2 | — | Color palette defined in `source/assets/cs/style.css` `:root` | implemented |
| `07-§1.3` | Design is clean and readable; content comes first | 07-design/index.md §1 | — | Assessed through visual review | implemented |
| `07-§1.4` | Design is fast and lightweight with no decorative excess | 07-design/index.md §1 | — | No decorative assets; minimal CSS | implemented |
| `07-§2.1` | Primary accent color is Terracotta `#C76D48` (buttons, links, highlights) | 07-design/css-strategy.md §7 | CSS-01 | `source/assets/cs/style.css` – `--color-terracotta: #C76D48` | covered |
| `07-§2.2` | Secondary accent color is Sage green `#ADBF77` (section headers, tags) | 07-design/css-strategy.md §7 | CSS-02 | `source/assets/cs/style.css` – `--color-sage: #ADBF77` | covered |
| `07-§2.3` | Page background color is Cream `#F5EEDF` | 07-design/css-strategy.md §7 | CSS-03 | `source/assets/cs/style.css` – `--color-cream: #F5EEDF` | covered |
| `07-§2.4` | Main heading color is Navy `#192A3D` | 07-design/css-strategy.md §7 | CSS-04 | `source/assets/cs/style.css` – `--color-navy: #192A3D` | covered |
| `07-§2.5` | Body text color is Charcoal `#3B3A38` | 07-design/css-strategy.md §7 | CSS-05 | `source/assets/cs/style.css` – `--color-charcoal: #3B3A38` | covered |
| `07-§2.6` | Card and contrast surface color is White `#FFFFFF` | 07-design/css-strategy.md §7 | CSS-06 | `source/assets/cs/style.css` – `--color-white: #FFFFFF` | covered |
| `07-§2.7` | No bright or saturated colors are used outside the defined palette | 07-design/index.md §2 | — | Enforced by design convention; not linted | implemented |
| `07-§3.1` | Headings use `system-ui, -apple-system, sans-serif` (or a single humanist web font if added) | 07-design/css-strategy.md §7 | CSS-07 | `source/assets/cs/style.css` – `--font-sans` token | covered |
| `07-§3.2` | Body text uses the same sans-serif stack | 07-design/css-strategy.md §7 | CSS-07 | `source/assets/cs/style.css` – `--font-sans` token applied to body | covered |
| `07-§3.3` | Pull quotes and callouts use Georgia, serif | 07-design/css-strategy.md §7 | CSS-08 | `source/assets/cs/style.css` – `--font-serif: Georgia, serif` | covered |
| `07-§3.4` | H1 is 40px, weight 700, color Navy `#192A3D` | 07-design/css-strategy.md §7 | CSS-09 | `source/assets/cs/style.css` – `--font-size-h1: 40px` | covered |
| `07-§3.5` | H2 is 35px, weight 700, color Navy `#192A3D` | 07-design/css-strategy.md §7 | CSS-10 | `source/assets/cs/style.css` – `--font-size-h2: 35px` | covered |
| `07-§3.6` | H3 is 30px, weight 700, color Navy `#192A3D` | 07-design/css-strategy.md §7 | CSS-11 | `source/assets/cs/style.css` – `--font-size-h3: 30px` | covered |
| `07-§3.7` | Body text is 16px, weight 400, color Charcoal `#3B3A38` | 07-design/css-strategy.md §7 | CSS-12 | `source/assets/cs/style.css` – `--font-size-base: 16px` | covered |
| `07-§3.8` | Small/meta text is 14px, weight 400, color Charcoal | 07-design/css-strategy.md §7 | CSS-13 | `source/assets/cs/style.css` – `--font-size-small: 14px` | covered |
| `07-§3.9` | Pull quote text is 25px, weight 600, Georgia serif, italic | 07-design/css-strategy.md §7 | CSS-14 | `source/assets/cs/style.css` – `--font-size-pullquote: 25px` | covered |
| `07-§3.10` | Nav links are 12px, weight 700, uppercase, letter-spaced | 07-design/css-strategy.md §7 | CSS-15 | `source/assets/cs/style.css` – `--font-size-nav: 12px` | covered |
| `07-§3.11` | Body text line height is `1.65` | 07-design/css-strategy.md §7 | CSS-16 | `source/assets/cs/style.css` – `--line-height-body: 1.65` | covered |
| `07-§4.1` | Wide container max-width is `1290px` (header, hero, full layout) | 07-design/css-strategy.md §7 | CSS-17 | `source/assets/cs/style.css` – `--container-wide: 1290px` | covered |
| `07-§4.2` | Narrow container max-width is `750px` (reading sections, articles) | 07-design/css-strategy.md §7 | CSS-18 | `source/assets/cs/style.css` – `--container-narrow: 750px` | covered |
| `07-§4.3` | Containers are centered with `margin: 0 auto` and horizontal padding on small screens | 07-design/index.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.4` | Spacing base unit is `8px`; all spacing values are multiples of it | 07-design/css-strategy.md §7 | CSS-19..24 | `source/assets/cs/style.css` – spacing tokens at `:root` | covered |
| `07-§4.5` | `space-xs` = `8px` | 07-design/css-strategy.md §7 | CSS-19 | `source/assets/cs/style.css` – `--space-xs: 8px` | covered |
| `07-§4.6` | `space-sm` = `16px` | 07-design/css-strategy.md §7 | CSS-20 | `source/assets/cs/style.css` – `--space-sm: 16px` | covered |
| `07-§4.7` | `space-md` = `24px` | 07-design/css-strategy.md §7 | CSS-21 | `source/assets/cs/style.css` – `--space-md: 24px` | covered |
| `07-§4.8` | `space-lg` = `40px` | 07-design/css-strategy.md §7 | CSS-22 | `source/assets/cs/style.css` – `--space-lg: 40px` | covered |
| `07-§4.9` | `space-xl` = `64px` | 07-design/css-strategy.md §7 | CSS-23 | `source/assets/cs/style.css` – `--space-xl: 64px` | covered |
| `07-§4.10` | `space-xxl` = `96px` | 07-design/css-strategy.md §7 | CSS-24 | `source/assets/cs/style.css` – `--space-xxl: 96px` | covered |
| `07-§4.11` | Desktop grid: up to 3 columns for cards and testimonials | 07-design/index.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.12` | Tablet grid: 2 columns | 07-design/index.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.13` | Mobile grid: 1 column | 07-design/index.md §4 | — | `source/assets/cs/style.css` | implemented |
| `07-§4.14` | Grid uses CSS Grid; no grid framework | 07-design/index.md §4 | CSS-28 | `source/assets/cs/style.css` – CSS Grid used | covered |
| `07-§5.1` | Desktop breakpoint: > 1000px — full layout, side-by-side columns | 07-design/index.md §5 | — | `source/assets/cs/style.css` | implemented |
| `07-§5.2` | Tablet breakpoint: 690–999px — 2-column grids, condensed header | 07-design/index.md §5 | — | `source/assets/cs/style.css` | implemented |
| `07-§5.3` | Mobile breakpoint: < 690px — single column, stacked layout | 07-design/index.md §5 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.1` | Header is full-width, fixed or sticky at top | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.2` | Header height is `120px` desktop, `70px` mobile | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.3` | Header background is white or cream with a subtle bottom border or shadow | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.4` | Logo is on the left; nav links on the right | 07-design/components.md §6 | — | `source/build/layout.js` – `pageHeader()` HTML structure | implemented |
| `07-§6.5` | Nav links are uppercase, `12px`, `700` weight, `letter-spacing: 0.08em` | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.6` | Active/hover nav state uses terracotta underline or color shift | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.7` | Mobile header uses a hamburger menu (full-screen or dropdown) | 07-design/components.md §6 | NAV-10, NAV-11 | `source/build/layout.js` – `.nav-toggle` button; `source/assets/js/client/nav.js` – toggle logic; `source/assets/cs/style.css` – mobile nav rules (see `02-§24.10`–`02-§24.14`) | implemented |
| `07-§6.8` | Hero section has a large background image (Klarälven river / camp landscape) | 07-design/components.md §6 | — | `source/build/render-index.js` – `extractHeroImage()` | implemented |
| `07-§6.9` | Hero overlay text shows camp name, dates, and a short tagline | 07-design/components.md §6 | — | `source/build/render-index.js` | implemented |
| `07-§6.10` | Hero has one or two CTA buttons | 07-design/components.md §6 | — | `source/build/render-index.js` | implemented |
| `07-§6.11` | Hero image uses `object-fit: cover` and is responsive | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.12` | Button minimum height is `40px` | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.13` | Button padding is `10px 24px` | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.14` | Button border-radius is `4px` | 07-design/components.md §6 | CSS-29 | `source/assets/cs/style.css` – `--radius-sm: 4px` | covered |
| `07-§6.15` | Primary button: background `#C76D48`, white text, no border | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.16` | Secondary button: border `#C76D48`, text `#C76D48`, transparent background | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.17` | Button hover darkens background ~10% with `200ms ease` transition | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.18` | Button font is body stack, weight `700`, size `14–16px` | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.19` | Cards have white `#FFFFFF` background | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.20` | Cards have `border-radius: 6px` | 07-design/components.md §6 | CSS-30 | `source/assets/cs/style.css` – `--radius-md: 6px` | covered |
| `07-§6.21` | Cards have box-shadow `0 4px 12px rgba(0,0,0,0.04)` | 07-design/components.md §6 | CSS-31 | `source/assets/cs/style.css` – `--shadow-card` | covered |
| `07-§6.22` | Card padding is `24px` | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.23` | Testimonial cards show a circular profile image (`border-radius: 50%`, ~`60px`) | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.24` | Accordion header background is sage green `#ADBF77`, dark text | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.25` | Accordion body background is cream `#F5EEDF` or white | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.26` | Accordion toggle icon is `+`/`−` or a chevron | 07-design/components.md §6 | — | `source/build/render.js` – `<details>/<summary>` default disclosure triangle | implemented |
| `07-§6.27` | Accordion open/close is animated with CSS `max-height` transition | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.28` | Accordion uses no JavaScript framework — plain JS or CSS-only | 07-design/components.md §6 | CSS-37 | `source/build/render.js` – `<details>/<summary>` (native HTML) | covered |
| `07-§6.29` | Section headings (H2) have a short decorative line or color block underneath | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.30` | Alternatively, a sage-green label appears above the heading at `12px` uppercase | 07-design/components.md §6 | — | `source/assets/cs/style.css` | implemented |
| `07-§6.31` | Schedule event rows show a bold start time and a lighter end time | 07-design/components.md §6 | — | `source/build/render.js` – `renderEventRow()`; `source/assets/cs/style.css` | implemented |
| `07-§6.32` | Location is shown as small text below the time in event rows | 07-design/components.md §6 | — | `source/build/render.js` – `renderEventRow()` | implemented |
| `07-§6.124` | The read-only activation-link field reads as output, not input (muted background, default cursor) | 07-design/components.md §6 | MINT-17 (structural: `#mint-link` read-only style) | `source/assets/cs/style.css` – `#mint-link` muted background + `cursor: default` | gap |
| `07-§7.2` | CSS is written for a component only once its HTML structure exists; no speculative CSS | 07-design/css-strategy.md §7 | — | Convention; assessed through code review | implemented |
| `07-§7.3` | CSS is organized in one main file: reset → tokens → base → layout → components → utilities | 07-design/css-strategy.md §7 | — | `source/assets/cs/style.css` | implemented |
| `07-§7.4` | No CSS preprocessor is used; CSS custom properties are sufficient | 07-design/css-strategy.md §7 | CSS-36 | `source/assets/cs/style.css` – plain CSS with custom properties | covered |
| `07-§7.5` | No CSS framework is used; CSS is hand-written and minimal | 07-design/css-strategy.md §7 | — | `source/assets/cs/style.css` – no framework imports | implemented |
| `07-§8.1` | Photography is natural and warm: river, forest, camp activities, families | 07-design/imagery-and-accessibility.md §8 | — | `source/content/` – image references; assessed through visual review | implemented |
| `07-§8.2` | Stock photography is avoided; real photos from actual camps are preferred | 07-design/imagery-and-accessibility.md §8 | — | Assessed through visual review | implemented |
| `07-§8.3` | Hero image is landscape format, high resolution, dark enough for text overlay | 07-design/imagery-and-accessibility.md §8 | — | `source/build/render-index.js` – `extractHeroImage()` | implemented |
| `07-§8.4` | Testimonial avatars are portrait photos, cropped square, displayed circular | 07-design/imagery-and-accessibility.md §8 | — | `source/assets/cs/style.css` – `--radius-full: 50%` | implemented |
| `07-§9.1` | Color contrast meets WCAG AA minimum `4.5:1` for body text | 07-design/imagery-and-accessibility.md §9 | — | Charcoal `#3B3A38` on Cream `#F5EEDF` passes WCAG AA; not verified programmatically | implemented |
| `07-§9.2` | Interactive elements have visible focus states (see `02-§13.2`) | 07-design/imagery-and-accessibility.md §9 | A11Y-01..09 | `source/assets/cs/style.css` – `:focus-visible` rules (see `02-§13.2`) | covered |
| `07-§9.3` | Navigation is keyboard accessible (see `02-§13.3`) | 07-design/imagery-and-accessibility.md §9 | — | `source/build/layout.js` – standard `<nav>` and `<a>` elements | implemented |
| `07-§9.4` | Images have descriptive `alt` text (see `02-§13.4`) | 07-design/imagery-and-accessibility.md §9 | RNI-29..33 | `source/build/render-index.js` – `extractHeroImage()` preserves alt | covered |
| `07-§10.1` | No gradients or drop shadows heavier than specified are used | 07-design/imagery-and-accessibility.md §10 | — | `source/assets/cs/style.css` – only `--shadow-card` used | implemented |
| `07-§10.2` | No animations beyond subtle transitions (`200–300ms`) are used | 07-design/imagery-and-accessibility.md §10 | — | `source/assets/cs/style.css` | implemented |
| `07-§10.3` | No decorative fonts or display typefaces are used | 07-design/imagery-and-accessibility.md §10 | — | `source/assets/cs/style.css` – system fonts only | implemented |
| `07-§10.4` | Text is never full-width at desktop widths; always constrained by a container | 07-design/imagery-and-accessibility.md §10 | — | `source/assets/cs/style.css` – container widths enforced | implemented |
| `07-§10.5` | Layout is not whitespace-heavy; content density is appropriate | 07-design/imagery-and-accessibility.md §10 | — | Assessed through visual review | implemented |
| `07-§10.6` | The main site has no dark mode; the Today/Display view dark theme is purpose-built and not site-wide | 07-design/imagery-and-accessibility.md §10 | — | `source/build/render-today.js` – dark theme isolated to display mode | implemented |
