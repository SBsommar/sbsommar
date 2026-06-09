# SB Sommar – Design Specification

Visual design reference for SB Sommar. Inspired by sbsommar.se, the live production site.
This document is the single source of truth for design decisions.

Design is split across topic files for readability. Section IDs (`07-§N.M`) are stable strings cited from source code, tests, and `99-traceability/` — the ID does not encode the file path, so a section can be moved between files without breaking references.

---

## Contents

The foundations (§1 Design Philosophy, §2 Color Palette, §3 Typography, §4 Layout & Spacing, §5 Responsive Breakpoints) live here because they are short, referenced everywhere, and read best together. The remaining sections live in topic files:

| File | Topic | Sections |
| ---- | ----- | -------- |
| [`components.md`](./components.md) | Components | §6 |
| [`css-strategy.md`](./css-strategy.md) | CSS Strategy | §7 |
| [`imagery-and-accessibility.md`](./imagery-and-accessibility.md) | Imagery, Accessibility, What Not to Do | §8, §9, §10 |

Looking for `07-§N`? Search this directory: `grep -l '## N\.' docs/07-design/*.md` finds the file that owns the section.

---

## 1. Design Philosophy

- Warm, welcoming, outdoorsy feel — not corporate or sterile. <!-- 07-§1.1 -->
- Earth tones and natural colors that evoke summer, forest, and water. <!-- 07-§1.2 -->
- Clean and readable. Content first. <!-- 07-§1.3 -->
- Fast and lightweight. No decorative excess. <!-- 07-§1.4 -->

---

## 2. Color Palette

| ID | Name | Hex | Use |
| --- | --- | --- | --- |
| `07-§2.1` | Terracotta | `#C76D48` | Primary accent, buttons, links, highlights |
| `07-§2.2` | Sage green | `#ADBF77` | Secondary accent, section headers, tags |
| `07-§2.3` | Cream | `#F5EEDF` | Page background, warm neutral base |
| `07-§2.4` | Navy | `#192A3D` | Main headings, strong contrast |
| `07-§2.5` | Charcoal | `#3B3A38` | Body text, muted dark |
| `07-§2.6` | White | `#FFFFFF` | Cards, content blocks, contrast surfaces |
| `07-§2.8` | Cream light | `#FAF7EF` | Countdown background, lighter cream variant |

Avoid bright or saturated colors outside this palette. The warmth comes from restraint. <!-- 07-§2.7 -->

---

## 3. Typography

### Font families

- **Headings**: System sans-serif stack, or a single humanist sans-serif web font if added later.
  Fallback: `system-ui, -apple-system, sans-serif` <!-- 07-§3.1 -->
- **Body**: Same sans-serif stack. Clean and readable. <!-- 07-§3.2 -->
- **Pull quotes / callouts**: Georgia, serif. Adds warmth and character in small doses. <!-- 07-§3.3 -->

### Scale

| ID | Element | Size | Weight | Color | Notes |
| --- | --- | --- | --- | --- | --- |
| `07-§3.4` | H1 | 40px | 700 | `#C76D48` | Page titles, hero heading |
| `07-§3.5` | H2 | 35px | 700 | `#C76D48` | Section headings |
| `07-§3.6` | H3 | 30px | 700 | `#C76D48` | Sub-section headings |
| `07-§3.7` | Body | 16px | 400 | `#3B3A38` | All running text |
| `07-§3.8` | Small / meta | 14px | 400 | `#3B3A38` | Dates, labels, captions |
| `07-§3.9` | Pull quote | 25px | 600 | `#3B3A38` | Georgia serif, italic |
| `07-§3.10` | Nav links | 12px | 700 | varies | Uppercase, spaced out |

Line height for body text: `1.65`. Generous — makes Swedish long-form text comfortable to read. <!-- 07-§3.11 -->

---

## 4. Layout & Spacing

### Containers

| ID | Type | Max-width | Use |
| --- | --- | --- | --- |
| `07-§4.1` | Wide | `1290px` | Full layout, header, hero |
| `07-§4.2` | Narrow | `750px` | Reading sections, articles |

Container is centered with `margin: 0 auto` and horizontal padding on small screens. <!-- 07-§4.3 -->

### Spacing rhythm

Base unit: `8px`. Spacing values are multiples of this. <!-- 07-§4.4 -->

| ID | Token name | Value | Use |
| --- | --- | --- | --- |
| `07-§4.5` | `space-xs` | 8px | Tight gaps, icon padding |
| `07-§4.6` | `space-sm` | 16px | Between inline elements |
| `07-§4.7` | `space-md` | 24px | Card padding, form fields |
| `07-§4.8` | `space-lg` | 40px | Between sections within a page |
| `07-§4.9` | `space-xl` | 64px | Between major page sections |
| `07-§4.10` | `space-xxl` | 96px | Hero padding, page top/bottom |

### Grid

- Desktop: up to 3 columns for cards/testimonials. <!-- 07-§4.11 -->
- Tablet: 2 columns. <!-- 07-§4.12 -->
- Mobile: 1 column. <!-- 07-§4.13 -->
- Use CSS Grid. No grid framework. <!-- 07-§4.14 -->

---

## 5. Responsive Breakpoints

| ID | Breakpoint | Width | Description |
| --- | --- | --- | --- |
| `07-§5.1` | Desktop | > 1000px | Full layout, side-by-side columns |
| `07-§5.2` | Tablet | 690–999px | 2-column grids, condensed header |
| `07-§5.3` | Mobile | < 690px | Single column, stacked layout |
