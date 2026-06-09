---
title: "SB Sommar – Requirements: Caching and Performance"
---

# SB Sommar – Requirements: Caching and Performance

Cache strategy: cache headers, content-hash cache-busting for CSS/JS/images, image dimension and filename rules, image lazy-loading.

Part of [the requirements index](./index.md). Section IDs (`02-§N.M`) are stable and cited from code; they do not encode the file path.

---

## 25. Image Loading Performance

The site must use browser-native loading hints to improve perceived performance
and reduce layout shift. No new client-side JavaScript is required.

### 25.1 Lazy loading for below-fold images

- Content images (class `content-img`) produced by the build must include
  `loading="lazy"`, except for images in the first content section (which is
  above the fold on mobile and may contain the LCP element). <!-- 02-§25.1 -->
- Images in the first content section must NOT have `loading="lazy"` — they are
  above the fold on mobile and lazy-loading them delays the Largest Contentful
  Paint. <!-- 02-§25.5 -->
- The hero image (class `hero-img`) must NOT have `loading="lazy"` — it is
  above the fold and must load immediately. <!-- 02-§25.2 -->

### 25.2 Hero image preload and priority

- The `<head>` of the homepage must include a `<link rel="preload" as="image">`
  element whose `href` matches the hero image source. The path must not be
  hardcoded — it is derived from the hero image extracted at build time. <!-- 02-§25.3 -->
- The hero `<img>` tag must include `fetchpriority="high"`. <!-- 02-§25.4 -->

### 25.3 Script loading

- The `nav.js` script tag must include the `defer` attribute on all pages. This
  breaks the critical request chain (HTML → CSS → JS) identified by Lighthouse,
  allowing the browser to discover and preload the script during HTML
  parsing. <!-- 02-§25.6 -->

---

---

## 38. Replace Hand-Rolled Markdown Converter with marked

The build-time markdown converter (`convertMarkdown()` and `inlineHtml()` in
`render-index.js`) supports only a limited subset of markdown. Content authors
write standard markdown (including tables) that the converter silently mangles.
Replace the hand-rolled converter with the `marked` library.

### 38.1 Library integration

- The build must use `marked` as the markdown-to-HTML converter. <!-- 02-§38.1 -->
- `marked` must be a production dependency (build-time only; no client-side
  JS change). <!-- 02-§38.2 -->
- No other new dependencies may be added. <!-- 02-§38.3 -->

### 38.2 Preserved behaviours

- Heading offset: the `headingOffset` parameter must shift all heading levels
  (e.g. `## Foo` with offset 1 becomes `<h3>`), capped at `h6`. <!-- 02-§38.4 -->
- Collapsible accordion: when `collapsible` is true, each `##`-level section
  (after offset) must be wrapped in a
  `<details class="accordion"><summary>…</summary>…</details>`
  element. Content before the first `##` must not be wrapped. <!-- 02-§38.5 -->
- Images rendered from markdown must have `class="content-img"` and
  `loading="lazy"`. <!-- 02-§38.6 -->

### 38.3 Full markdown support

- Standard markdown features (tables, ordered lists, code blocks, nested lists,
  emphasis, line breaks) must render correctly. <!-- 02-§38.7 -->
- Existing content files must not be modified — the converter must handle them
  as-is. <!-- 02-§38.8 -->

### 38.4 Table styling

- Tables rendered from markdown must have basic CSS styling using existing
  design tokens. <!-- 02-§38.9 -->

### 38.5 Quality

- All existing tests must continue to pass (with assertion adjustments where
  marked produces correct but different HTML). <!-- 02-§38.10 -->
- Build, lint, and HTML validation must pass. <!-- 02-§38.11 -->

---

---

## 65. Client-Side Date and Regex Robustness

### 65.1 Locale-independent date formatting

- Client-side scripts that derive "today" must produce a guaranteed
  `YYYY-MM-DD` string using `Intl.DateTimeFormat.formatToParts`, not
  `toLocaleDateString`. <!-- 02-§65.1 -->
- This applies to both the hero countdown script and the upcoming-camps
  past-marking script. <!-- 02-§65.2 -->

### 65.2 Countdown injection regex

- The regex that wraps the upcoming-camps list and its companion script
  in a `.camps-row` div must anchor on `</ul>` and `<script>`
  explicitly. <!-- 02-§65.3 -->

### 65.3 Testimonial image regex robustness

- The image `src` extraction regex must not assume attribute
  order. <!-- 02-§65.4 -->
- The image-wrapping `<p>` removal regex must tolerate optional
  whitespace inside the `<p>` element. <!-- 02-§65.5 -->

---

---

## 66. Image Dimension Attributes

Every `<img>` element in the rendered HTML must have explicit `width` and
`height` attributes. This reserves layout space before the image loads,
preventing Cumulative Layout Shift (CLS).

### 66.1 Fixed-size images

Images whose display size is constant (not responsive) must have hardcoded
`width` and `height` attributes matching their CSS display dimensions:

- Testimonial images (`.testimonial-img`): `width="60" height="60"`. <!-- 02-§66.1 -->
- Social icons (`.hero-social-link img`): `width="32" height="32"`. <!-- 02-§66.2 -->
- RSS icon (`.rss-icon`): dimensions matching the image's natural aspect
  ratio at the CSS display height. <!-- 02-§66.3 -->
- Facebook logo in archive (`.camp-fb-logo`): dimensions matching the
  image's natural aspect ratio at the CSS display size. <!-- 02-§66.4 -->

### 66.2 Hero image

- The hero image (`.hero-img`) must have `width` and `height` attributes
  reflecting its natural pixel dimensions. <!-- 02-§66.5 -->

### 66.3 Content and facility images

- Content images produced by the Markdown renderer (`content-img`) must
  have `width` and `height` attributes set to the source image's natural
  pixel dimensions, read at build time. <!-- 02-§66.6 -->
- Location/facility images rendered from `local.yaml` must have `width`
  and `height` attributes set to their natural pixel dimensions, read at
  build time. <!-- 02-§66.7 -->
- The build must use a lightweight method to read image dimensions (e.g.
  parsing the image header) — it must not decode the full image
  data. <!-- 02-§66.8 -->

### 66.4 No CSS changes

- Adding `width` and `height` attributes must not change the rendered
  appearance of any image. Existing CSS rules control display
  size. <!-- 02-§66.9 -->

---

---

## 67. Static Asset Cache Headers

The site must serve static assets with appropriate `Cache-Control` headers
to reduce repeat-visit load times. Cache rules are delivered via an Apache
`.htaccess` file in the site root.

### 67.1 Cache rules

- Images (`.webp`, `.png`, `.jpg`, `.ico`): `Cache-Control: max-age=31536000`
  (1 year). <!-- 02-§67.1 -->
- CSS and JS files: `Cache-Control: max-age=604800` (1 week). <!-- 02-§67.2 -->
- HTML files: `Cache-Control: no-cache` (always revalidate). <!-- 02-§67.3 -->

### 67.2 Build integration

- The `.htaccess` file must live at `source/static/.htaccess` in the source
  tree. <!-- 02-§67.4 -->
- The build must copy `source/static/.htaccess` to `public/.htaccess`
  during the build step. <!-- 02-§67.5 -->
- The copy must use an explicit `fs.copyFileSync()` call — not the
  `copyFlattened()` helper which operates on `source/assets/`. <!-- 02-§67.6 -->

### 67.3 Separation from API

- This `.htaccess` is for the static site root only. The existing
  `api/.htaccess` (PHP routing) must not be modified. <!-- 02-§67.7 -->

---

---

## 68. Descriptive Image Filenames

All image files in `source/content/images/` must have descriptive,
human-readable filenames that follow a consistent naming convention. This
makes markdown editing easier for non-technical contributors and aligns
filenames with their natural alt-text descriptions.

### 68.1 Naming convention

- All lowercase. <!-- 02-§68.1 -->
- Swedish characters replaced: ä→a, ö→o, å→a, é→e. <!-- 02-§68.2 -->
- Words separated by hyphens (no underscores, no camelCase). <!-- 02-§68.3 -->
- No numbering suffixes unless genuinely needed (e.g. multiple similar
  images of the same subject). <!-- 02-§68.4 -->
- The filename (without extension) should work as alt-text
  directly. <!-- 02-§68.5 -->

### 68.2 Reference consistency

- Every image reference in markdown files (`source/content/*.md`) must
  point to the renamed file. <!-- 02-§68.6 -->
- Every `image_path` in `source/data/local.yaml` must point to the
  renamed file. <!-- 02-§68.7 -->
- Hardcoded image paths in build scripts (`render-index.js`,
  `render.js`) must point to the renamed files. <!-- 02-§68.8 -->
- CSS selectors using `[alt="..."]` must be updated if the corresponding
  alt-text changes. <!-- 02-§68.9 -->

### 68.3 Constraints

- Image content and dimensions must not change — only
  filenames. <!-- 02-§68.10 -->
- No broken image references may exist after the rename — the build must
  succeed and all images must render. <!-- 02-§68.11 -->

---

---

## 69. CSS Cache-Busting

HTML files are served with `Cache-Control: no-cache` and always revalidate,
but CSS is cached for up to one week (02-§67.2). When a deploy changes CSS
selectors or styles, browsers may serve stale CSS against fresh HTML,
causing visual regressions. The build must append a content-based hash to
the CSS URL so that any CSS change forces a cache miss.

### 69.1 Build behaviour

- After all HTML files and assets are written, the build must read
  `public/style.css` and compute a short content hash. <!-- 02-§69.1 -->
- The build must replace every `href="style.css"` in all HTML files
  under `public/` with `href="style.css?v=<hash>"`. <!-- 02-§69.2 -->
- The hash must be deterministic: identical CSS content must always
  produce the same hash. <!-- 02-§69.3 -->

### 69.2 Constraints

- No render function signatures may change — the hash is applied as a
  post-processing step in `build.js`. <!-- 02-§69.4 -->
- Existing tests that verify `style.css` presence must continue to
  pass. <!-- 02-§69.5 -->

---

---

## 77. JavaScript Cache-Busting

HTML files are served with `Cache-Control: no-cache` and always revalidate,
but JS is cached for up to one week (02-§67.2). When a deploy changes
client-side JavaScript, browsers may serve stale scripts against fresh HTML,
causing broken behaviour. The build must append a content-based hash to JS
URLs so that any JS change forces a cache miss while unchanged files continue
to be served from cache.

### 77.1 Build behaviour

The build appends a deterministic 8-character MD5-based content hash to every
`<script src="…">` reference in `public/` HTML so JS URLs become
`src="<file>.js?v=<hash>"`, with identical JS content always producing the
same hash. See `03-architecture/ci-and-deploy.md §27 "Asset Cache-Busting"` for the
canonical mechanism (shared with CSS and image cache-busting). <!-- 02-§77.1 --> <!-- 02-§77.2 --> <!-- 02-§77.3 -->

### 77.2 Constraints

- No render function signatures may change — the hash is applied as a
  post-processing step in `build.js`. <!-- 02-§77.4 -->
- Existing tests that verify JS file presence must continue to
  pass. <!-- 02-§77.5 -->

---

---

## 78. Image Cache-Busting

Images are cached for up to one year (02-§67.1). When an image is replaced
with new content but the same filename, browsers may serve the old version
indefinitely. The build must append a content-based hash to image URLs in
HTML so that changed images force a cache miss while unchanged images
continue to be served from cache.

### 78.1 Build behaviour

The build appends a deterministic 8-character MD5-based content hash to every
`<img src="…">` reference in `public/` HTML so image URLs become
`src="<file>.<ext>?v=<hash>"` (where `ext` is `webp`, `png`, `jpg`, `jpeg`,
or `ico`), with identical image content always producing the same hash. See
`03-architecture/ci-and-deploy.md §27 "Asset Cache-Busting"` for the canonical mechanism
(shared with CSS and JS cache-busting). <!-- 02-§78.1 --> <!-- 02-§78.2 --> <!-- 02-§78.3 -->

### 78.2 Constraints

- No render function signatures may change — the hash is applied as a
  post-processing step in `build.js`. <!-- 02-§78.4 -->
- Existing tests that verify image file presence must continue to
  pass. <!-- 02-§78.5 -->

---

---

## 86. Image Cache-Busting for href and Manifest References

Section 78 covers `src` attributes in `<img>` tags. Images also appear in
`href` attributes (`<link rel="preload">`, `<link rel="icon">`,
`<link rel="apple-touch-icon">`) and in the PWA manifest
(`app.webmanifest`). These references must receive the same content-based
hash so that the browser treats them as identical URLs and avoids
redundant downloads.

### 86.1 Build behaviour

- After the existing image cache-busting step, the build must also replace
  `href="<file>.<ext>"` (where ext is webp, png, jpg, jpeg, or ico) in all
  HTML files under `public/` with
  `href="<file>.<ext>?v=<hash>"`. <!-- 02-§86.1 -->
- The build must replace `"src": "<file>.<ext>"` (same extensions) in
  `app.webmanifest` under `public/` with
  `"src": "<file>.<ext>?v=<hash>"`. <!-- 02-§86.2 -->
- The hash values must reuse the same image hash cache as the existing
  `src` cache-busting to ensure consistency. <!-- 02-§86.3 -->

### 86.2 Constraints

- The preload `href` must match the corresponding `<img src>` URL exactly
  (including query string) so that the browser can match the preloaded
  resource. <!-- 02-§86.4 -->
- No render function signatures may change — this is a post-processing
  extension. <!-- 02-§86.5 -->
- Existing tests must continue to pass. <!-- 02-§86.6 -->
