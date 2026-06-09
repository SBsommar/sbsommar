# SB Sommar – Design: CSS Strategy

How the stylesheet is organised, and the design tokens that everything else references.

Part of [the design index](./index.md). Section IDs (`07-§N.M`) are stable and cited from code; they do not encode the file path.

All CSS must use the custom properties defined in §7. Do not hardcode colors, spacing, or typography values. <!-- 07-§7.1 -->

---

## 7. CSS Strategy

### How to write CSS

Write CSS for a component only once its HTML structure exists. Speculative CSS — written before the markup is settled — creates waste and drift. <!-- 07-§7.2 -->

### Structure

1. One main CSS file, organized in sections: reset → tokens → base → layout → components → utilities. <!-- 07-§7.3 -->
2. No preprocessor required. CSS custom properties (variables) are enough. <!-- 07-§7.4 -->
3. No CSS framework. Hand-written, minimal. <!-- 07-§7.5 -->

### CSS custom properties (design tokens)

When CSS is written, start with these at `:root`:

```css
:root {
  /* Colors */
  --color-terracotta: #C76D48;
  --color-sage: #ADBF77;
  --color-cream: #F5EEDF;
  --color-navy: #192A3D;
  --color-charcoal: #3B3A38;
  --color-white: #FFFFFF;
  --color-cream-light: #FAF7EF;

  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-serif: Georgia, serif;
  --font-size-base: 16px;
  --font-size-h1: 40px;
  --font-size-h2: 35px;
  --font-size-h3: 30px;
  --font-size-pullquote: 25px;
  --font-size-small: 14px;
  --font-size-nav: 12px;
  --line-height-body: 1.65;

  /* Spacing */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 40px;
  --space-xl: 64px;
  --space-xxl: 96px;

  /* Layout */
  --container-wide: 1290px;
  --container-narrow: 750px;

  /* Shadows */
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.04);

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 16px;
  --radius-full: 50%;
}
```

These variables make it trivial to adjust the design globally later.
