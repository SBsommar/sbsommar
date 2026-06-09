# SB Sommar – Design: Imagery, Accessibility, and Guardrails

Photography guidance, accessibility minimums, and the list of design moves to avoid.

Part of [the design index](./index.md). Section IDs (`07-§N.M`) are stable and cited from code; they do not encode the file path.

---

## 8. Imagery

- Natural, warm photography: river, forest, camp activities, families. <!-- 07-§8.1 -->
- Avoid stock-photo feel. Prefer real photos from actual camps. <!-- 07-§8.2 -->
- Hero image: landscape format, high resolution, dark enough for text overlay. <!-- 07-§8.3 -->
- Testimonial avatars: portrait photos, cropped square, displayed circular. <!-- 07-§8.4 -->

---

## 9. Accessibility

- Color contrast must meet WCAG AA minimum (`4.5:1` for body text). WCAG is the Web Content Accessibility Guidelines — the international standard for accessible web design. <!-- 07-§9.1 -->
- Interactive elements must have visible `:focus-visible` states: `outline: 2px solid var(--color-terracotta); outline-offset: 2px`. This applies to buttons, navigation links, form inputs, accordion summaries, content links, and any other focusable element. <!-- 07-§9.2 -->
- Navigation must be keyboard accessible. <!-- 07-§9.3 -->
- Images must have descriptive `alt` text. <!-- 07-§9.4 -->
- Accordion items must use proper ARIA attributes (`aria-expanded`, `aria-controls`). Native `<details>/<summary>` elements satisfy this requirement — browsers expose expanded/collapsed state to assistive technology without explicit ARIA attributes. Custom accordion components (e.g. the archive timeline) must use explicit `aria-expanded` and `aria-controls`. <!-- 07-§9.5 -->
- Every page must have exactly one `<main>` landmark element wrapping the primary content (between navigation and footer). This lets screen readers skip past navigation directly to content. <!-- 07-§9.6 -->

---

## 10. What Not to Do

- No gradients or drop shadows heavier than specified. <!-- 07-§10.1 -->
- No animations beyond subtle transitions (`200–300ms`). <!-- 07-§10.2 -->
- No decorative fonts or display typefaces. <!-- 07-§10.3 -->
- No full-width text at desktop widths — always constrain with container. <!-- 07-§10.4 -->
- No whitespace-heavy "agency" layouts. Content density matters here. <!-- 07-§10.5 -->
- No dark mode for the main site. The Today/Display view uses a dark theme — but that is a separate, purpose-built view for shared screens and is not a site-wide dark mode. <!-- 07-§10.6 -->
