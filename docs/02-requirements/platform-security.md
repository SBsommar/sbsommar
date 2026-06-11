---
title: "SB Sommar – Requirements: Platform and Security"
---

# SB Sommar – Requirements: Platform and Security

Cross-cutting platform concerns: reliability, accessibility, Swedish language, security hardening, analytics, feedback, PWA, admin token, rate limiting.

Part of [the requirements index](./index.md). Section IDs (`02-§N.M`) are stable and cited from code; they do not encode the file path.

---

## 12. Reliability

Participants must be able to trust that:

- The schedule reflects the current plan.
- A newly submitted activity appears in the schedule within a few minutes. <!-- 02-§12.1 -->
- Corrections and removals made by an admin are visible in all schedule views. <!-- 02-§12.2 -->
- All event submissions are permanently recorded in Git history as a full audit trail. <!-- 02-§12.3 -->

The schedule is a shared coordination tool during the camp week.

---

---

## 13. Accessibility

The site must meet WCAG AA as a baseline:

- Color contrast must be at least `4.5:1` for body text. <!-- 02-§13.1 -->
- All interactive elements must have visible focus states. <!-- 02-§13.2 -->
- Navigation must be fully keyboard accessible. <!-- 02-§13.3 -->
- Images must have descriptive `alt` text. <!-- 02-§13.4 -->
- The add-activity form must be usable without a mouse. <!-- 02-§13.5 -->
- Accordion or expandable elements must use proper ARIA attributes. <!-- 02-§13.6 -->

---

---

## 14. Language

The site is written entirely in Swedish. <!-- 02-§14.1 -->

This includes: all page content, navigation labels, form labels, error messages,
confirmation messages, and accessibility text (alt, aria-label, etc.).

---

---

## 39. CodeQL Alert Remediation

GitHub CodeQL static analysis reports six alerts across workflows, server code,
and test files. All must be resolved so the repository reaches zero open CodeQL
alerts.

### 39.1 Workflow permissions (CI)

- `ci.yml` must declare an explicit `permissions` block with minimal
  scope. The workflow only reads repository contents, so `contents: read`
  is sufficient. <!-- 02-§39.1 -->

### 39.2 Workflow permissions (deploy)

- `deploy-reusable.yml` must declare an explicit `permissions` block with
  minimal scope. The workflow reads repository contents and deploys the
  main site (`sbsommar.se`) to external shared hosting via FTP/SSH, so
  `contents: read` is sufficient and no write-scoped token such as
  `pages: write` is needed. The GitHub Pages documentation site (§97) is
  served directly by GitHub from the `docs/` folder and uses its own
  built-in deployment, unaffected by this workflow's permissions. <!-- 02-§39.2 -->

### 39.3 ReDoS-safe slugify

- The `slugify()` function in `source/api/github.js` must not contain
  regex patterns that CodeQL flags as polynomial-time backtracking risks.
  The current `/^-+|-+$/g` alternation must be replaced with an equivalent
  that avoids backtracking. <!-- 02-§39.3 -->
- The replacement must produce identical output for all existing test
  cases. <!-- 02-§39.4 -->

### 39.4 Test assertion specificity

- Test assertions that check for URL substrings must be specific enough
  that CodeQL does not flag them as incomplete URL sanitisation. <!-- 02-§39.5 -->
- Assertions in `tests/render.test.js` and `tests/github.test.js` that
  use bare `includes('https://…')` must be changed to match a surrounding
  context (e.g. `includes('href="https://…"')` or
  `includes('link: https://…')`). <!-- 02-§39.6 -->

### 39.5 Verification

- After the changes are merged, `gh api repos/{owner}/{repo}/code-scanning/alerts?state=open`
  must return fewer open alerts (ideally zero). <!-- 02-§39.7 -->

---

---

## 49. API-Layer Security Validation

The event security scan (injection patterns, link protocol, length limits) currently
runs only in CI as a post-commit check. This means malicious payloads can reach the
git repository before being caught. Moving these checks into the API request
validation layer rejects dangerous input at submission time — before any data is
written to git.

This change does not remove the existing CI security scan; it adds an earlier,
identical check. The CI scan will be removed in a future pipeline optimisation.

### 49.1 Injection pattern scanning in the API

- The API request validation (`validateEventRequest` / `validateEditRequest`) must
  scan the free-text fields `title`, `location`, `responsible`, and `description`
  for injection patterns before accepting the request. <!-- 02-§49.1 -->
- The following patterns must be rejected (case-insensitive): `<script`, `javascript:`,
  event handler attributes (`on*=`), `<iframe`, `<object`, `<embed`,
  `data:text/html`. <!-- 02-§49.2 -->
- A request containing any injection pattern must be rejected with an error message
  identifying the offending field and pattern category. <!-- 02-§49.3 -->

### 49.2 Link protocol validation in the API

- When the `link` field is a non-empty string, the API must verify that it starts
  with `http://` or `https://` (case-insensitive). Any other protocol or a missing
  protocol must be rejected. <!-- 02-§49.4 -->

### 49.3 Parity between Node.js and PHP implementations

- The injection patterns and link protocol checks must be implemented identically
  in both `source/api/validate.js` and `api/src/Validate.php`. <!-- 02-§49.5 -->
- Both implementations must produce equivalent error messages for the same
  invalid input. <!-- 02-§49.6 -->

---

---

## 63. Site Analytics

The site needs usage analytics to answer questions about traffic, visitor
behaviour, and content effectiveness. Analytics must respect the static-site,
no-backend, minimal-JS constraints.

### 63.1 Tool choice

- The analytics tool must be GoatCounter (hosted, free tier). <!-- 02-§63.1 -->
- No cookies may be set by the analytics tool. <!-- 02-§63.2 -->
- The analytics script must be lightweight (< 5 KB). <!-- 02-§63.3 -->

### 63.2 Environment scope

- Analytics must be collected in both production and QA
  environments. <!-- 02-§63.4 -->
- Each environment uses its own GoatCounter site code so data is kept
  separate. <!-- 02-§63.5 -->
- Local development must not send analytics data (environment variable
  left unset). <!-- 02-§63.6 -->

### 63.3 Script inclusion

- The GoatCounter script tag must be included on every page that uses the
  shared site layout (header/footer pages). <!-- 02-§63.7 -->
- The display view (`/live.html`) must also include the analytics
  script, even though it has no shared layout. <!-- 02-§63.8 -->
- The script must load asynchronously and must not block page
  rendering. <!-- 02-§63.9 -->
- The GoatCounter site code must be configurable via an environment variable
  (`GOATCOUNTER_SITE_CODE`) so it is not hardcoded in source. <!-- 02-§63.10 -->
- When the environment variable is not set (local dev), the script tag must
  not be rendered. <!-- 02-§63.11 -->

### 63.4 Basic traffic (automatic)

GoatCounter provides these automatically — no custom code required:

- Page views per day/week. <!-- 02-§63.12 -->
- Most visited pages. <!-- 02-§63.13 -->
- Referrer tracking. <!-- 02-§63.14 -->
- Device type and screen size. <!-- 02-§63.15 -->
- Returning visitors. <!-- 02-§63.16 -->
- 404 hits. <!-- 02-§63.17 -->
- Page load times. <!-- 02-§63.18 -->
- Traffic patterns over time (before/during/after camp). <!-- 02-§63.19 -->

### 63.5 Custom events (behaviour tracking)

The following interactions must be tracked as GoatCounter custom events:

- Activity form submission (successful). <!-- 02-§63.20 -->
- Activity form abandonment (cancel/navigate away). <!-- 02-§63.21 -->
- Today view page load. <!-- 02-§63.22 -->
- Display mode page load. <!-- 02-§63.23 -->
- Click on Discord link. <!-- 02-§63.24 -->
- Click on Facebook link. <!-- 02-§63.25 -->
- iCal file download. <!-- 02-§63.26 -->
- RSS feed link click. <!-- 02-§63.27 -->
- Scroll depth on schedule pages (25 %, 50 %, 75 %, 100 %). <!-- 02-§63.28 -->

### 63.6 QR code referrer tracking

- A data file in the repository (`source/data/qr-codes.yaml`) must list all
  QR code identifiers. <!-- 02-§63.29 -->
- The file is maintained manually — new rows are added when new QR codes are
  printed. <!-- 02-§63.30 -->
- Each QR code entry must have at minimum an `id` and a `description`
  field. <!-- 02-§63.31 -->
- QR code URLs must include the identifier as a query parameter (e.g.
  `?ref=qr-affisch-01`) so GoatCounter records it as a distinct
  referrer. <!-- 02-§63.32 -->
- The existing QR code on the display view sidebar must use a tracked
  referrer parameter from the QR codes data file. <!-- 02-§63.33 -->

### 63.7 Constraints

- No personal data may be collected. <!-- 02-§63.34 -->
- No cookie consent banner is needed (GoatCounter is cookieless). <!-- 02-§63.35 -->
- The analytics implementation must not increase the total JS payload
  beyond what GoatCounter itself requires (no wrapper libraries). <!-- 02-§63.36 -->
- Custom event tracking must use HTML `data-goatcounter-click` attributes
  where possible, minimising inline JavaScript. <!-- 02-§63.37 -->
- All deploy workflows that build site pages must pass
  `GOATCOUNTER_SITE_CODE` to the build step so that rebuilt pages retain
  the analytics script. <!-- 02-§63.38 -->

---

---

## 73. Feedback Button (GitHub Issues)

A discreet feedback button in the navigation bar lets any visitor submit
feedback that is automatically created as a GitHub Issue. The feature
uses the same API patterns as add-event (Node.js + PHP dual
implementation) and the same GitHub API primitives.

### 73.1 User requirements

- A feedback icon button (speech-bubble SVG, no text label) must be
  visible on every page. On mobile it is fixed at the top-right corner
  (`position: fixed; top: var(--space-xs); right: var(--space-sm)`);
  on desktop it is positioned near the content column
  edge. <!-- 02-§73.1 -->
- Clicking the button must open a modal dialog. <!-- 02-§73.2 -->
- The modal must contain a form with the following fields: <!-- 02-§73.3 -->
  - Category (radio buttons): Bugg, Förslag, Övrigt — mapping to GitHub
    labels `feedback:bug`, `feedback:suggestion`, `feedback:other`.
  - Title (required, max 200 characters).
  - Description (required, max 2 000 characters).
  - Name / contact info (optional, max 200 characters).
- On successful submission the modal must show a confirmation message
  with a clickable link to the created GitHub Issue (opens in new
  tab). <!-- 02-§73.4 -->
- On failure the modal must show an error message with a retry
  option. <!-- 02-§73.5 -->
- The modal must show progress steps during submission, following the
  same pattern as the add-event modal. <!-- 02-§73.6 -->

### 73.2 API requirements

- A `POST /feedback` endpoint (Node.js) and `POST /api/feedback`
  endpoint (PHP) must accept the feedback form data. <!-- 02-§73.7 -->
- The API must create a GitHub Issue with: <!-- 02-§73.8 -->
  - Title: `[Feedback] {category}: {title}`
  - Body: description text followed by a metadata table containing
    category, page URL, viewport size, timestamp (ISO 8601), name/contact
    (or "Ej angivet"), and User-Agent.
  - Labels: `feedback:bug`, `feedback:suggestion`, or `feedback:other`
    depending on the selected category.
- The API must return `{ success: true, issueUrl: "<URL>" }` on success
  so the client can link to the created issue. <!-- 02-§73.9 -->
- In local development (when `BUILD_ENV` is neither `production` nor
  `qa`), the API must not create a GitHub Issue. It must log the request
  and return `{ success: true, issueUrl: "" }` (empty
  string). <!-- 02-§73.28 -->
- In the QA environment (`BUILD_ENV` is `qa`), the API must create a
  GitHub Issue just as in production, so that testers can give
  feedback. <!-- 02-§73.29 -->

### 73.3 Validation requirements

- Client-side: title and description are required; submit button is
  disabled until both are filled; length limits are enforced
  visually. <!-- 02-§73.10 -->
- Server-side: title (≤ 200), description (≤ 2 000), name (≤ 200)
  length limits must be enforced. <!-- 02-§73.11 -->
- Server-side: the same injection-pattern scan as §49 must be applied
  to title, description, and name fields. <!-- 02-§73.12 -->
- A honeypot field ("website", hidden from users) must be included. If
  filled, the API returns `200 OK` with `{ success: true }` but does
  not create an issue. <!-- 02-§73.13 -->
- Rate-limiting: max 5 requests per IP per hour (in-memory in Node.js,
  simplest possible in PHP). <!-- 02-§73.14 -->

### 73.4 Accessibility requirements

- The modal must use `role="dialog"`, `aria-modal="true"`, and a
  focus trap. <!-- 02-§73.15 -->
- The button must have `aria-label="Ge feedback"`. <!-- 02-§73.16 -->
- The modal must be closable with Escape, click outside, or a close
  button. <!-- 02-§73.17 -->
- All form fields must have associated `<label>` elements and
  `aria-required` where applicable. <!-- 02-§73.18 -->

### 73.5 Metadata collection

- The form must silently collect and include in the API request: page
  URL, viewport size (width × height), User-Agent string, and timestamp
  (ISO 8601). <!-- 02-§73.19 -->

### 73.6 Implementation parity

- The Node.js and PHP implementations must validate identically and
  produce equivalent error messages. <!-- 02-§73.20 -->
- Both must use the existing `githubRequest()` / `githubRequest()`
  primitives for the GitHub Issues API call. <!-- 02-§73.21 -->

### 73.7 Clarity requirements

- The modal heading must be "Feedback om hemsidan" so visitors
  understand the feedback concerns the website, not the
  camp. <!-- 02-§73.22 -->
- A short help text must appear below the heading: "Gäller hemsidan
  och informationen här, inte själva
  lägret." <!-- 02-§73.23 -->

### 73.8 Local environment warning

- When the API returns a successful response without an issue URL
  (dry-run in local development), the success view must show a
  warning below the "Tack för din feedback!" heading. <!-- 02-§73.24 -->
- The warning text must be: "OBS: Detta är en testsida. Din feedback
  sparades inte. Besök den riktiga siten för att skicka
  feedback." <!-- 02-§73.25 -->
- The warning must use the same styling as form validation errors
  (`.form-error-msg`: terracotta left border, light background). <!-- 02-§73.26 -->
- The warning must not include a URL to the production site. <!-- 02-§73.27 -->

---

## 83. Progressive Web App (PWA) Support

The site must be installable as a Progressive Web App so participants can add it
to their home screen and use it in a standalone app-like experience. A service
worker provides offline caching so that core pages and recent event data remain
accessible without network connectivity.

### 83.1 Web App Manifest (site requirements)

- The build must produce an `app.webmanifest` file at the site root. <!-- 02-§83.1 -->
- The manifest must set `name` to `"SB Sommar"` and `short_name` to
  `"SB Sommar"`. <!-- 02-§83.2 -->
- The manifest must set `display` to `"standalone"`. <!-- 02-§83.3 -->
- The manifest must set `start_url` to `"/"`. <!-- 02-§83.4 -->
- The manifest must set `theme_color` and `background_color` to values from
  the design palette (`07-design/index.md §2`). <!-- 02-§83.5 -->
- The manifest must declare at least two icon sizes: 192×192 and
  512×512, both PNG. <!-- 02-§83.6 -->
- The manifest `icons` array must include a `"purpose": "any"` entry. <!-- 02-§83.7 -->
- The manifest `icons` array must include at least one entry with
  `"purpose": "maskable"` so the icon renders correctly in adaptive icon
  contexts (Android home screen, etc.). <!-- 02-§83.26 -->

### 83.2 HTML head tags (site requirements)

- Every HTML page must include `<link rel="manifest" href="app.webmanifest">`
  in `<head>`. <!-- 02-§83.8 -->
- Every HTML page must include `<meta name="theme-color">` with the same value
  as the manifest `theme_color`. <!-- 02-§83.9 -->
- Every HTML page must include `<meta name="mobile-web-app-capable"
  content="yes">`. <!-- 02-§83.10 -->
- Every HTML page must include `<meta name="apple-mobile-web-app-status-bar-style"
  content="default">`. <!-- 02-§83.11 -->
- Every HTML page must include `<link rel="apple-touch-icon" href="images/sbsommar-icon-192.png">`. <!-- 02-§83.12 -->

### 83.3 Service worker (site requirements)

- The build must produce a `sw.js` file at the site root. <!-- 02-§83.13 -->
- A registration script must be included on every page and must register
  `sw.js` only when the browser supports service workers. <!-- 02-§83.14 -->
- The service worker must use a versioned cache name so that updates can
  invalidate old caches. <!-- 02-§83.15 -->
- On `install`, the service worker pre-caches all site assets (HTML
  pages, CSS, JS, images, `events.json`) so the full site is available
  offline from the first launch. The pre-cache list is generated at
  build time (see §92). <!-- 02-§83.16 -->
- On `fetch`, the service worker must serve cached responses for navigation
  and static-asset requests when the network is unavailable
  (network-first with cache fallback for HTML, cache-first for CSS/JS/images). <!-- 02-§83.17 -->
- On `activate`, the service worker must delete caches whose name does not
  match the current version. <!-- 02-§83.18 -->
- The service worker does not cache API responses (`/api/` paths) or
  form-submission endpoints (`/add-event`, `/edit-event`,
  `/delete-event`, `/verify-admin`). Form pages (`lagg-till.html`,
  `redigera.html`) are pre-cached and served offline; an offline guard
  (§92) disables submission when there is no network. <!-- 02-§83.19 -->
- The service worker must only handle requests with `http:` or `https:`
  schemes; all other schemes (e.g. `chrome-extension:`) must be
  ignored. <!-- 02-§83.27 -->
- The service worker must cache `events.json` using a
  network-first strategy with cache fallback so that schedule data is
  available offline. <!-- 02-§83.28 -->
- When a navigation request fails and the requested page is not in the
  cache, the service worker must respond with a dedicated offline
  fallback page (`/offline.html`) that tells the user they are offline
  and lists which pages may be available from cache. <!-- 02-§83.29 -->

### 83.4 Icon assets (site requirements)

- PNG icon files `sbsommar-icon-192.png` (192×192) and `sbsommar-icon-512.png` (512×512) must
  exist in the images directory. <!-- 02-§83.20 -->
- The build copies them to `public/images/` alongside other image
  assets. <!-- 02-§83.21 -->

### 83.6 Offline fallback page (site requirements)

- The build must produce an `offline.html` page at the site root. <!-- 02-§83.30 -->
- The offline page must use the same shared layout (header, footer,
  CSS) as other pages. <!-- 02-§83.31 -->
- The offline page must display a Swedish-language message informing the
  user that they are offline. <!-- 02-§83.32 -->
- The offline page must only link to pages that are pre-cached and
  functional offline. It must not link to pages that require network
  (e.g. `lagg-till.html`). <!-- 02-§83.35 -->
- The service worker must pre-cache `offline.html` on install. <!-- 02-§83.33 -->

### 83.7 Implementation constraints

- The service worker is implemented in vanilla JavaScript. <!-- 02-§83.22 -->
- No new npm dependencies are added. <!-- 02-§83.23 -->
- Existing pages and functionality must not break. <!-- 02-§83.24 -->
- Every HTML page must use the PWA icon (`images/sbsommar-icon-192.png`) as
  the browser favicon (`<link rel="icon">`). <!-- 02-§83.25 -->
- The cache version constant is updated when caching behaviour changes,
  so that old caches are invalidated on the next
  activation. <!-- 02-§83.34 -->

---

---

## 84. API Error Messages

When an API call fails, the user must receive an error message that helps them
understand whether the problem is actionable or not.

### 84.1 User requirements

- When submitting an activity fails, the user sees a message that indicates
  the nature of the failure — not just "kunde inte sparas". <!-- 02-§84.1 -->
- The user can distinguish between a temporary problem (try again later) and
  a permanent problem (contact the organiser). <!-- 02-§84.2 -->

### 84.2 Site requirements

- The PHP API classifies GitHub API errors into categories before returning
  them to the client: <!-- 02-§84.3 -->
  - **Authentication** (401/403) — token missing or expired.
  - **Conflict** (409/422) — concurrent write or validation failure.
  - **Rate limit** (403 with rate-limit header, 429) — too many requests.
  - **Network / timeout** — GitHub unreachable.
  - **Other server errors** (5xx) — transient GitHub failure.
- Each category maps to a Swedish user-facing message that tells the user
  whether to retry or contact the organiser. <!-- 02-§84.4 -->
- The classification applies to all three mutation endpoints: `/add-event`,
  `/add-events`, and `/edit-event`. <!-- 02-§84.5 -->
- Error messages must never expose internal details such as tokens, file
  paths, or full stack traces. <!-- 02-§84.6 -->
- The existing client-side code (`lagg-till.js`) already displays
  `json.error` — no client changes are needed. <!-- 02-§84.7 -->

---

## 87. Manifest Metadata for Richer Install UI

Chrome requires additional manifest fields to show a richer install prompt.
Missing fields degrade the install experience or block the install prompt on
newer browser versions.

### 87.1 Manifest identity (site requirements)

- The manifest must set `id` to `"/"`. <!-- 02-§87.1 -->
- The manifest must set `description` to `"Information och aktiviteter för SB Sommar-lägret"`. <!-- 02-§87.2 -->

### 87.2 Manifest screenshots (site requirements)

- The manifest must include a `screenshots` array with at least two
  entries. <!-- 02-§87.3 -->
- One screenshot must have `form_factor` set to `"wide"` with size
  `"1280x720"` and type `"image/png"`. <!-- 02-§87.4 -->
- One screenshot must have `form_factor` set to `"narrow"` with size
  `"750x1334"` and type `"image/png"`. <!-- 02-§87.5 -->
- Screenshot `src` paths must point to files in the `images/` directory
  and must be cache-busted by the existing build pipeline. <!-- 02-§87.6 -->

### 87.3 Constraints

- No new npm dependencies. <!-- 02-§87.7 -->
- Existing tests must continue to pass. <!-- 02-§87.8 -->

---

## 88. PWA Install Guide

Many users — especially on iPhone — do not notice that the site can be
installed as an app. A discreet install button in the top bar helps them
discover this without being intrusive.

### 88.1 Install button in navigation (user requirements)

- The header bar must include an install button alongside the existing
  controls (hamburger menu, scroll-to-top, feedback). <!-- 02-§88.1 -->
- The button must use a recognisable install/download icon, styled
  consistently with the other header buttons. <!-- 02-§88.2 -->
- The button label/tooltip must be in Swedish
  (e.g. "Installera appen"). <!-- 02-§88.3 -->
- The button must appear on all pages (it lives in the shared
  header). <!-- 02-§88.4 -->

### 88.2 Platform-specific behaviour (site requirements)

- On browsers that support the `beforeinstallprompt` event
  (Chrome/Edge on Android and desktop), the button must capture the
  event and trigger the native install prompt when clicked. <!-- 02-§88.5 -->
- After a successful installation (detected via the `appinstalled`
  event), the button must be hidden. <!-- 02-§88.6 -->
- On iOS Safari (detected by user-agent and lack of
  `beforeinstallprompt`), the button must show a tooltip or small
  overlay with the instruction: "Tryck på Dela-ikonen och välj
  'Lägg till på hemskärmen'". <!-- 02-§88.7 -->
- The iOS tooltip must close when the user taps outside it or presses
  Escape. <!-- 02-§88.8 -->
- When the site is already running in standalone mode
  (`display-mode: standalone`), the button must not be rendered at
  all. <!-- 02-§88.9 -->
- On browsers where neither `beforeinstallprompt` nor iOS Safari is
  detected, the button must not be rendered. <!-- 02-§88.10 -->

### 88.3 Persistence (site requirements)

- The button is always visible as long as the platform conditions are
  met — no dismiss logic and no localStorage gating. <!-- 02-§88.11 -->

### 88.4 Constraints

- The install button logic must be implemented in a dedicated vanilla
  JavaScript file (`pwa-install.js`). <!-- 02-§88.12 -->
- CSS must use custom properties from `docs/07-design/css-strategy.md §7`. <!-- 02-§88.13 -->
- No new npm dependencies. <!-- 02-§88.14 -->
- Existing pages and functionality must not break. <!-- 02-§88.15 -->
- All user-facing text must be in Swedish. <!-- 02-§88.16 -->

---

---

## 91. Admin Token — Activation and Status Indicator

### 91.1 Context

The site uses a cookie-based ownership model where each participant can
only edit events they created. During camp, one or two designated
administrators need the ability to edit or delete any event — for example
to correct mistakes, remove duplicates, or update events on behalf of
participants who lost their cookie.

This requirement covers the token infrastructure: the signing secret,
activation, verification, and a visual status indicator. The edit/delete
authorisation behaviour that uses this token is defined in §7, §18, and §89.

Tokens are self-validating: each token carries a role and an expiry and is
signed with a single server secret, so the server validates a token by
recomputing its signature — there is no stored list of issued tokens. The same
infrastructure carries more than one role, so a narrower "early access" role
reuses the format, signing, and activation flow described here.

### 91.2 Admin tokens (site requirements)

- The server validates tokens against a single signing secret in the
  environment variable `ADMIN_TOKEN_SECRET`. There is no list of issued
  tokens. <!-- 02-§91.1 -->
- Each token follows the format `namn_roll_epoch_sig`, where `namn` is a
  lowercase identifier (`a–ö`, digits, hyphen — never an underscore),
  `roll` is one of `admin`, `early`, or `superadmin`, `epoch` is a Unix
  timestamp (seconds) representing the token's expiry, and `sig` is the
  base64url-encoded HMAC-SHA256 of the string `namn_roll_epoch` keyed by
  `ADMIN_TOKEN_SECRET`. <!-- 02-§91.2 -->
- A token is valid only when its recomputed signature matches `sig`
  (constant-time), its `roll` is a recognised role, and its `epoch` is in
  the future. A token with any tampered field, an unknown role, or a past
  epoch is rejected. <!-- 02-§91.29 -->
- The roles `admin` and `superadmin` grant administrator privileges: they
  bypass per-event cookie ownership and pre-camp time-gating. `superadmin`
  additionally authorises minting new tokens. The role `early` is a
  recognised role for early-access contributors; its narrower privileges
  are defined in §105. <!-- 02-§91.31 -->
- `ADMIN_TOKEN_SECRET` is a high-entropy random value of at least 32 bytes.
  Both runtimes log a warning at startup when it is shorter. <!-- 02-§91.32 -->
- The creation script `npm run admin:create` signs a token offline against
  `ADMIN_TOKEN_SECRET` for the chosen role — 60 days validity for `admin`,
  90 days for `early`, 180 days for `superadmin` — and prints the token to
  hand over. The `superadmin` role is minted only by this script, never
  from the web UI. <!-- 02-§91.30 -->
- When `ADMIN_TOKEN_SECRET` is unset or empty, all admin functionality is
  disabled — no token validates and the site behaves as if no one is an
  administrator. <!-- 02-§91.3 -->

### 91.3 Token verification endpoint (API requirements)

- The API must expose `POST /verify-admin`. <!-- 02-§91.4 -->
- The request body must contain `{ "token": "<string>" }`. <!-- 02-§91.5 -->
- If the token has a valid signature, a recognised role, and an unexpired
  epoch, the response is `200 { "valid": true }`. <!-- 02-§91.6 -->
- If the token fails validation, the response is
  `403 { "valid": false }`. <!-- 02-§91.7 -->
- The endpoint enforces the rate limits defined in §93 and compares the
  recomputed and supplied signatures using constant-time comparison over
  fixed-width digests, so neither validity nor token length leaks via
  timing. <!-- 02-§91.8 -->

### 91.4 Admin activation page (user requirements)

- A page at `/token.html` must allow an administrator to enter their
  token. <!-- 02-§91.9 -->
- The page must contain a single text input and a submit button. <!-- 02-§91.10 -->
- On submit, the page must call `POST /verify-admin` with the entered
  token. <!-- 02-§91.11 -->
- If the server responds with `valid: true`: <!-- 02-§91.12 -->
  - Store the token and the current timestamp in `localStorage` under
    the key `sb_admin`. The stored value is a JSON object:
    `{ "token": "<string>", "activated": <unix-ms> }`.
  - Show a success message (in Swedish).
- If the server responds with `valid: false`: <!-- 02-§91.13 -->
  - Do not store anything.
  - Show an error message (in Swedish).
- When a valid (unexpired) token is stored, the activation page's status
  message names the token's recipient and role and states, in Swedish, what
  that role allows. The recipient is the token's first underscore-segment and
  the role is its second segment (`namn_roll_epoch_sig`), both read
  client-side. The message also retains the token's expiry date, its
  activation time, and the note that a new token can be entered below to
  replace it. The rights phrasing per role is: <!-- 02-§91.33 -->
  - `superadmin`: may edit all activities, open the form before the camp
    opens, and create new token links.
  - `admin`: may edit all activities and open the form before it opens for
    everyone.
  - `early`: may add and edit their own activities before the form opens for
    everyone.
- The page must use the same layout (header, navigation, footer) as
  other site pages. <!-- 02-§91.14 -->
- The page must not be listed in the site navigation. <!-- 02-§91.15 -->

### 91.5 Token expiry (site requirements)

- A stored admin token is considered expired if more than 30 days
  (2 592 000 000 ms) have passed since the `activated`
  timestamp. <!-- 02-§91.16 -->
- Expiry is checked client-side before any admin-related behaviour. <!-- 02-§91.17 -->
- An expired token is treated as if no token exists — the user must
  re-activate. <!-- 02-§91.18 -->

### 91.6 Footer status indicator (user requirements)

- Every page that includes the shared site footer must display an admin
  status icon when a token exists in `localStorage`. <!-- 02-§91.19 -->
- **No token in `localStorage`**: nothing is displayed. <!-- 02-§91.20 -->
- **Valid token (not expired)**: a filled/locked icon is displayed,
  indicating active admin status. <!-- 02-§91.21 -->
- **Expired token (> 30 days)**: an open/unlocked icon is displayed,
  indicating the token needs renewal. Clicking the icon navigates to
  `/token.html`. <!-- 02-§91.22 -->
- The icon must be small and unobtrusive — it is not intended for
  regular visitors. <!-- 02-§91.23 -->
- The icon must have a `title` attribute explaining its meaning in
  Swedish (e.g. "Token aktiv" / "Token utgången"). <!-- 02-§91.24 -->

### 91.7 Constraints

- All user-facing text must be in Swedish. <!-- 02-§91.25 -->
- CSS must use custom properties from `docs/07-design/css-strategy.md §7`. <!-- 02-§91.26 -->
- The activation page must be accessible (keyboard-navigable,
  screen-reader friendly). <!-- 02-§91.27 -->
- The admin token must never be sent in cookies — it is stored only in
  `localStorage` and sent explicitly in API request bodies or
  headers. <!-- 02-§91.28 -->

---

---

## 92. PWA Full Pre-Cache and Offline Guard

The PWA pre-caches every asset the build produces so the entire site works
offline from the first launch after installation. Form pages and the feedback
modal detect offline status and clearly communicate that submission requires
an internet connection.

### 92.1 Build-time pre-cache manifest (site requirements)

- The build scans all files in `public/` after all post-processing
  (cache-busting) is complete and generates a pre-cache URL
  list. <!-- 02-§92.1 -->
- The generated list excludes files that are not meaningful to cache:
  `.htaccess`, `robots.txt`, `sw.js`, `version.json`,
  `.ics` files, `.rss` files, and per-event detail pages
  (`schema/*/index.html`). <!-- 02-§92.2 -->
- The build injects the generated list into `sw.js` by replacing a
  placeholder token (`/* __PRE_CACHE_URLS__ */`). <!-- 02-§92.3 -->
- The injected URLs are root-relative paths (e.g. `/images/hero.jpg`,
  `/style.css`). <!-- 02-§92.4 -->
- After injection, `sw.js` contains no remaining placeholder
  tokens. <!-- 02-§92.5 -->

### 92.2 Service worker (site requirements)

- The `PRE_CACHE_URLS` array in `sw.js` is populated by the build-time
  injection. There is no hand-maintained list. <!-- 02-§92.6 -->
- The service worker cache name is defined in §96.1. <!-- 02-§92.7 -->
- The service worker pre-caches all site pages, including
  `lagg-till.html` and `redigera.html`. <!-- 02-§92.8 -->
- The `NO_CACHE_PATTERNS` list contains only API and submission
  endpoints: `/add-event`, `/edit-event`, `/delete-event`,
  `/verify-admin`, `/api/`. It does not contain any `.html`
  pages. <!-- 02-§92.9 -->
- The `cacheFirstThenNetwork` strategy for static assets matches cache
  entries as defined in §96.5. <!-- 02-§92.10 -->
- The network-first strategies match cache entries with
  `{ ignoreSearch: true }` as defined in §96.6. <!-- 02-§92.11 -->

### 92.3 Offline guard — form pages (user requirements)

- A client-side script `offline-guard.js` detects offline status using
  `navigator.onLine` and the `online`/`offline` events. <!-- 02-§92.12 -->
- When the user is offline on `lagg-till.html` or `redigera.html`, an
  alert banner appears at the top of the form area with the message:
  *"Du är offline. Formuläret kräver internetanslutning för att
  skicka."* <!-- 02-§92.13 -->
- When the user is offline, all submit buttons on the form page are
  disabled (`disabled` attribute set). <!-- 02-§92.14 -->
- When the user comes back online, the banner disappears and the submit
  buttons are re-enabled. <!-- 02-§92.15 -->
- The banner uses the existing `.form-error-msg` styling from the design
  system. <!-- 02-§92.16 -->
- The script is included on `lagg-till.html` and
  `redigera.html`. <!-- 02-§92.17 -->

### 92.4 Offline guard — feedback modal (user requirements)

- When the feedback modal is open and the user is offline, a warning
  message appears inside the modal:
  *"Du är offline — feedback kan inte skickas just nu."* <!-- 02-§92.18 -->
- The feedback submit button is disabled when offline. <!-- 02-§92.19 -->
- When the user comes back online, the warning disappears and the submit
  button follows its normal enabled/disabled logic (based on field
  validation). <!-- 02-§92.20 -->

### 92.5 Constraints

- All user-facing text is in Swedish. <!-- 02-§92.21 -->
- CSS uses custom properties from `docs/07-design/css-strategy.md §7`. <!-- 02-§92.22 -->
- No npm dependencies are added. <!-- 02-§92.23 -->
- The service worker is vanilla JavaScript with no external
  libraries. <!-- 02-§92.24 -->
- The offline fallback page (`offline.html`) continues to function as a
  last resort when a page is not in the cache. <!-- 02-§92.25 -->

---

---

## 93. Rate Limiting for Authorization Endpoints

### 93.1 Context

The API exposes four `POST` endpoints that either perform authorization
(`/verify-admin`) or accept ownership-gated writes (`/edit-event`,
`/delete-event`), plus the user-feedback channel (`/feedback`). CodeQL
flagged three of these as missing rate limiting (alerts #40, #41, #42,
rule `js/missing-rate-limiting`), which allows an attacker to brute-force
admin tokens or hammer the GitHub write path. The feedback endpoint
already enforces a per-IP rate limit through an in-memory / file-based
counter; this requirement extends the same protection to the remaining
authorization endpoints and consolidates the mechanism into a single
reusable implementation per runtime.

### 93.2 Per-endpoint rate limits (API requirements)

- `/verify-admin` rejects more than **5 requests per IP per hour**
  with HTTP `429` and the Swedish error message "För många
  förfrågningar. Försök igen senare." <!-- 02-§93.1 -->
- `/edit-event` rejects more than **30 requests per IP per hour**
  with HTTP `429` and the same Swedish error message. <!-- 02-§93.2 -->
- `/delete-event` rejects more than **30 requests per IP per hour**
  with HTTP `429` and the same Swedish error message. <!-- 02-§93.3 -->
- `/feedback` continues to reject more than **5 requests per IP per
  hour** with HTTP `429` (no behavior change; see §73.14). <!-- 02-§93.4 -->
- The rate-limit check runs before authorization, validation, and
  time-gating so a throttled client never touches the GitHub API or the
  admin-token comparison path. <!-- 02-§93.5 -->
- The client IP used as the rate-limit key is derived from `req.ip` in
  Node — that is, Express's trust-proxy-aware resolver (see §93.15). In
  PHP it is `REMOTE_ADDR`, except that the **right-most**
  `HTTP_X_FORWARDED_FOR` entry — the address the trusted proxy appended — is
  used when `REMOTE_ADDR` is listed in the `TRUSTED_PROXIES` environment
  variable and that entry is a syntactically valid IP. The right-most entry is
  chosen because a client can prepend spoofed entries but cannot control the
  value the trusted proxy adds last; the left-most entry is attacker-controlled
  whenever the proxy appends (the common behaviour) rather than replaces.
  Because `X-Forwarded-For` is attacker-controlled, it is never trusted from an
  untrusted peer — otherwise a direct client could rotate the header to mint a
  fresh rate-limit bucket per request and bypass throttling. When
  `TRUSTED_PROXIES` is unset, the raw `REMOTE_ADDR` is always
  used. <!-- 02-§93.6 -->

### 93.3 Rate-limit implementation (site requirements)

- Node (`app.js`) uses the `express-rate-limit` middleware. Each guarded
  route has its own `rateLimit({ windowMs, limit, ... })` instance
  configured with the per-endpoint limits in §93.2. Instances are named
  so different endpoints do not share quotas. <!-- 02-§93.7 -->
- The Node feedback handler has its own `rateLimit()` instance with
  `{ windowMs: 3_600_000, limit: 5 }`, preserving the §73.14
  behavior. <!-- 02-§93.8 -->
- PHP (`api/index.php`) calls `SBSommar\RateLimit::isLimited($ip,
  $namespace, $limit, $windowSeconds)` from
  `api/src/RateLimit.php`. Counter state lives in a single JSON file
  under `sys_get_temp_dir()` with namespaced keys so endpoints do not
  share quotas. <!-- 02-§93.9 -->
- The PHP feedback handler uses the shared class. `Feedback::isRateLimited`
  no longer exists as a separate implementation; it delegates to
  `RateLimit::isLimited` with the feedback namespace and
  `{ limit: 5, window: 3600 }`. <!-- 02-§93.10 -->
- Rate-limit state is held in the Node process (by `express-rate-limit`'s
  default in-memory store, which evicts expired entries automatically)
  and in a local JSON file in PHP. Neither runtime coordinates across
  processes. This is acceptable because each deployment uses a single
  Node process or a single shared PHP host. <!-- 02-§93.11 -->

### 93.4 Constraints

- All user-facing error text is in Swedish. <!-- 02-§93.12 -->
- The only new npm runtime dependency permitted for rate limiting is
  `express-rate-limit`, used by `app.js` per §93.7. It is required so
  that CodeQL's `js/missing-rate-limiting` analysis can recognize the
  counter, and so that the Node side gains standard `Retry-After` /
  `RateLimit-*` response headers and automatic store cleanup — properties
  the prior custom helper did not provide. <!-- 02-§93.13 -->
- No new Composer dependencies are added. <!-- 02-§93.14 -->
- On the Node side, `app.js` sets Express `trust proxy` to `'loopback'`
  so the middleware only honours `X-Forwarded-For` from trusted
  loopback-connected reverse proxies. On non-loopback deployments the
  trust boundary is the hosting environment's proxy configuration,
  consistent with the existing PHP feedback handler. <!-- 02-§93.15 -->

---

---

## 95. Security Hygiene: Regex Performance and Escaping

### 95.1 Context

CodeQL flagged four regex-related issues in the codebase:

- Alert #17 (`js/polynomial-redos`) in `source/api/github.js` at the
  `slugify()` helper — the two-step `.replace(/^-+/, '').replace(/-+$/, '')`
  pass depends on user-provided input and can backtrack polynomially on
  `-`-heavy strings.
- Alerts #30, #31, #32 (`js/incomplete-sanitization`) in
  `tests/scoped-headings.test.js` — the ad-hoc escape
  `.replace(/\./g, '\\.').replace(/\s+/g, '\\s+')` does not cover `\`,
  `*`, `+`, `?`, `^`, `$`, `{`, `}`, `(`, `)`, `|`, `[`, `]`, so a
  selector containing any of those characters would produce a malformed
  pattern.

Neither alert represents an active vulnerability — slug inputs come from
authored camp data and the flagged test selectors are hardcoded — but
both should be eliminated so the CodeQL queue stays actionable and future
changes do not silently inherit the unsafe pattern.

### 95.2 Slugify performance (site requirements)

- `slugify()` in `source/api/github.js` strips leading and trailing `-`
  characters in a single linear-time pass so its worst-case time on any
  input is O(n). <!-- 02-§95.1 -->
- `slugify(s)` produces output identical to the previous implementation
  for every input: lowercase, `å`/`ä` → `a`, `ö` → `o`, non-alphanumerics
  collapsed to `-`, leading and trailing `-` removed, truncated to 48
  characters. <!-- 02-§95.2 -->

### 95.3 Regex escape helper (test infrastructure requirements)

- `tests/helpers/regex-escape.js` exports `escapeRegExp(str)` which
  returns `str` with every regex metacharacter in the set
  `. * + ? ^ $ { } ( ) | [ ] \` prefixed by `\`, so the resulting
  pattern matches only the literal input string. <!-- 02-§95.3 -->
- `tests/scoped-headings.test.js` uses `escapeRegExp()` at every site
  where a `container` or `heading` value is interpolated into a
  `RegExp`; the file contains no hand-rolled `\.`/`\s+` substitution for
  regex construction. <!-- 02-§95.4 -->

### 95.4 Constraints

- No new npm or Composer dependencies. <!-- 02-§95.5 -->
- No user-visible behaviour change: slugs generated for new activities
  remain identical to the previous output, so existing event IDs and
  URLs continue to resolve. <!-- 02-§95.6 -->
- CodeQL alerts #17, #30, #31, and #32 reach state `fixed` on the next
  scan after merge. <!-- 02-§95.7 -->

---

---

## 96. Self-Healing Service Worker Upgrade

### 96.1 Context

Clients that had visited the site before a deploy could end up serving
a stale `/style.css` from the service worker's Cache Storage even after
a new service worker activated. Two factors combined to cause this:

1. The pre-cache step used `cache.addAll(PRE_CACHE_URLS)` with default
   `fetch` semantics, which respects the browser's HTTP cache. When the
   HTTP cache held a `style.css` copy from before the deploy (served
   with `Cache-Control: max-age=604800`), that stale copy was pulled
   directly into the new `sb-sommar-v<N>` cache.
2. The service worker never called `self.skipWaiting()` or
   `self.clients.claim()`, so a freshly installed worker stayed in the
   waiting state until every existing client was closed. Users who kept
   the site open (especially as an installed PWA) never saw the new
   worker activate.

The result was that CSS changes landed on the server but did not reach
existing clients — the banners added in §94 rendered as unstyled
inline links on devices that had visited the site within the last week.

This section defines the service-worker upgrade behaviour that removes
the need for any user action (no "clear cache and data") to recover
from a stale cache.

### 96.2 Service worker (site requirements)

- The service worker cache name is `sb-sommar-v6`. <!-- 02-§96.1 -->
- The `install` event handler calls `self.skipWaiting()` so that a new
  worker moves straight from `installed` to `activating` without
  waiting for all existing clients to close. <!-- 02-§96.2 -->
- The `install` handler pre-caches every URL in `PRE_CACHE_URLS` using
  `new Request(url, { cache: 'reload' })`, which bypasses the browser's
  HTTP cache and fetches each asset directly from the network, so a
  stale HTTP-cache entry cannot be copied into the service-worker
  cache. <!-- 02-§96.3 -->
- The `activate` event handler deletes every cache whose name is not
  equal to the current `CACHE_NAME` and then calls
  `self.clients.claim()` so that the new worker immediately controls
  every open tab without requiring a reload. <!-- 02-§96.4 -->
- The `cacheFirstThenNetwork` strategy's **primary** cache lookup
  matches without `ignoreSearch`, so a request for
  `style.css?v=<newHash>` does not satisfy from a cache entry keyed at
  `style.css?v=<oldHash>` or `style.css`. When no exact match exists,
  the request falls through to the network and the fresh response is
  stored in the cache. A secondary `ignoreSearch` match is only
  performed as an **offline fallback** when the network fetch itself
  fails, so that pre-cached `/style.css` still serves when the user is
  offline on a new hash. <!-- 02-§96.5 -->
- The `networkFirstThenCache` and `networkFirstWithOfflineFallback`
  strategies continue to use `{ ignoreSearch: true }` when falling back
  to the cache, so that a cache-busted HTML or `events.json` URL still
  matches the previously stored entry during an offline fallback. <!-- 02-§96.6 -->

### 96.3 Pre-cache URL list (site requirements)

- The build-generated `PRE_CACHE_URLS` list continues to contain
  root-relative paths without the cache-busting query string
  (e.g. `/style.css`, not `/style.css?v=abc`). <!-- 02-§96.7 -->
- The cache-first handler, with `ignoreSearch` removed, stores fetched
  `style.css?v=<hash>` responses as separate entries. The pre-cached
  `/style.css` entry continues to serve as an offline fallback when the
  hashed URL is not yet cached. <!-- 02-§96.8 -->

### 96.4 Self-healing behaviour (user requirements)

- A user whose browser has an active service worker from before this
  release receives the new service worker on the next visit to
  `sbsommar.se` (or `qa.sbsommar.se`): the browser fetches `sw.js`
  bypassing its HTTP cache, installs the new worker, applies
  `skipWaiting`, and claims the open tab. <!-- 02-§96.9 -->
- The new worker deletes the old `sb-sommar-v5` cache and rebuilds
  `sb-sommar-v6` from fresh network responses. <!-- 02-§96.10 -->
- After at most one reload following the first post-deploy visit, every
  client sees the same assets that the server serves, including the
  current `style.css` with the §94 registration-banner rules. <!-- 02-§96.11 -->
- No user action (clearing site data, uninstalling the PWA,
  unregistering the service worker) is required to recover from the
  stale-cache state. <!-- 02-§96.12 -->

### 96.5 Constraints

- The service worker remains vanilla JavaScript with no external
  libraries. <!-- 02-§96.13 -->
- No new npm dependencies are added. <!-- 02-§96.14 -->
- The offline behaviour defined in §92 is preserved: form pages and the
  feedback modal continue to show the offline guard when
  `navigator.onLine` is false, and `offline.html` remains the last-resort
  fallback for navigation requests that are not in the cache. <!-- 02-§96.15 -->

---

## 100. Secret File Protection: API `.env` Outside the Web Root

### 100.1 Context

The PHP API reads its credentials — the GitHub write token and the admin
tokens — from a server-managed `.env` file. That file sat inside the web
root at `public_html/api/.env`, and the API's `.htaccess` routed only
*non-existent* paths to `index.php` (`RewriteCond %{REQUEST_FILENAME} !-f`)
while denying nothing. Because `.env` exists on disk, the web server served
it directly as plaintext: `https://sbsommar.se/api/.env` and
`https://qa.sbsommar.se/api/.env` both returned the file contents. The
credentials are treated as compromised and rotated out of band; this
section defines the desired state that keeps a secret file from ever being
web-reachable again.

The protection has two independent layers: the secret lives outside the
web root (so no web server can map a URL to it), and the web server denies
dotfiles (so a stray copy inside the web root is still refused).

### 100.2 Secret file location (site requirements)

- The PHP API's environment file is stored outside the web root at
  `$DEPLOY_DIR/.env`. No copy of it exists anywhere under
  `public_html`. <!-- 02-§100.1 -->
- `api/index.php` resolves its environment file directory as
  `dirname(__DIR__, 2)` — `$DEPLOY_DIR` when the API runs from
  `$DEPLOY_DIR/public_html/api/` — and loads `.env` from that directory
  with `Dotenv::createImmutable()`. It loads environment variables from no
  location inside the web root. <!-- 02-§100.2 -->
- The PHP API reads its configuration (`GITHUB_OWNER`, `GITHUB_REPO`,
  `GITHUB_BRANCH`, `GITHUB_TOKEN`, `ALLOWED_ORIGIN`, `QA_ORIGIN`,
  `COOKIE_DOMAIN`, `BUILD_ENV`, `ADMIN_TOKEN_SECRET`) from
  `$DEPLOY_DIR/.env`. <!-- 02-§100.3 -->

### 100.3 Web server denial (site requirements)

- `api/.htaccess` denies HTTP access to every file whose name begins with
  `.` (dotfiles), returning 403 — independent of whether the file exists
  on disk and independent of the `index.php` rewrite. The denial is
  expressed for both Apache 2.4 (`Require all denied`, via
  `mod_authz_core`) and Apache 2.2 (`Order allow,deny` / `Deny from all`),
  so it holds whatever authorization module the host loads. <!-- 02-§100.4 -->
- The site-root `.htaccess`, built from `source/static/.htaccess`, denies
  HTTP access to any file named `.env`, returning 403. <!-- 02-§100.5 -->
- A request for `/api/.env` on production and QA returns HTTP 403 or
  404. <!-- 02-§100.6 -->

### 100.4 Deploy workflow (site requirements)

- The reusable deploy workflow never writes `.env`, or any copy of it,
  into `public_html`. The PHP API archive uploaded to the server excludes
  `.env`. <!-- 02-§100.7 -->
- On deploy, when `$DEPLOY_DIR/.env` does not exist and a legacy
  `public_html/api/.env` exists, the workflow moves the legacy file to
  `$DEPLOY_DIR/.env`. After a deploy completes, no `.env` remains under
  `public_html`. <!-- 02-§100.8 -->

### 100.5 Constraints

- No new npm or Composer dependencies. <!-- 02-§100.9 -->
- Local development is unaffected: the Node/Express server (`app.js`)
  loads the repository-root `.env` via `--env-file` and never executes the
  PHP API, so the relocation applies only to QA and production. <!-- 02-§100.10 -->
- The §53.3 persistent-backup mechanism is superseded: because
  `$DEPLOY_DIR/.env` already lives outside the swapped `public_html`, it
  survives release swaps without a separate backup copy. <!-- 02-§100.11 -->

---

## 102. YAML Structure Integrity for Event Submissions

### 102.1 Context

Event submissions are validated for length, injection patterns, and link
protocol (§49), but a submission's single-line scalar fields can still carry
line breaks or other control characters. The add and batch-add flows serialise
the new event by appending hand-built YAML text to the camp file (§10.6), so a
value containing a newline or control character can alter the document's
structure — producing broken or unexpectedly nested YAML in the resulting pull
request. A valid form submission must never be able to produce structurally
invalid or smuggled YAML, while an intentional multi-line `description` must
keep working.

### 102.2 Single-line scalar field constraints (API requirements)

- The API request validation (`validateEventRequest`, `validateEditRequest`,
  `validateBatchEventRequest`) rejects any submission whose `title`,
  `location`, `responsible`, `link`, or `ownerName` field contains a line break
  or any other control character — concretely, any character in the range
  U+0000–U+001F or U+007F (DEL). Leading and trailing whitespace is trimmed
  before the check, so a value that merely has a trailing newline is accepted
  after trimming. <!-- 02-§102.1 -->
- A submission rejected for a control character returns a validation error that
  names the offending field, and nothing is written to git. <!-- 02-§102.2 -->

### 102.3 Multi-line description (API requirements)

- The `description` field may contain line breaks; it is the only event field
  that is intentionally multi-line. Within `description`, the only control
  characters allowed are tab (U+0009), line feed (U+000A), and carriage return
  (U+000D); any other control character is rejected. <!-- 02-§102.3 -->
- Carriage-return characters in `description` are normalised to line feeds
  before the description is serialised, so the stored value uses `\n` line
  endings regardless of the submitter's platform. <!-- 02-§102.4 -->

### 102.4 Whole-document validation before a pull request (API requirements)

- Before the add-event and batch-add-event flows create a branch or pull
  request, the complete proposed camp YAML document (the existing file content
  plus the appended event block) is parsed. If it does not parse, or does not
  contain an `events` list that includes every newly created event id, the
  operation aborts with an error and no branch, commit, or pull request is
  created. <!-- 02-§102.5 -->
- The edit and delete flows build the new document with the YAML serializer
  (§10.4), which guarantees a structurally valid result; they therefore rely on
  serialisation rather than a separate re-parse. <!-- 02-§102.6 -->
- The appended event block is indented to match the indentation of the existing
  `events:` list items in the target camp file (defaulting to two spaces when the
  list has no items yet), so the combined document is valid YAML regardless of
  the file's existing indentation style (§10.6). This is what lets the
  whole-document validation in §102.5 succeed for every well-formed
  submission. <!-- 02-§102.8 -->

### 102.5 Parity between Node.js and PHP implementations

- The control-character constraints (§102.1, §102.3), the carriage-return
  normalisation (§102.4), the whole-document validation (§102.5), and the
  indentation matching (§102.8) are implemented identically in the Node.js API
  (`source/api/validate.js`, `source/api/github.js`) and the PHP API
  (`api/src/Validate.php`, `api/src/GitHub.php`), and produce equivalent error
  messages for the same invalid input. The PHP API additionally applies the
  whole-document validation and indentation matching to its batch (recurring)
  add flow, which has no Node.js counterpart. <!-- 02-§102.7 -->

---

## 104. Security Hardening (2026-06)

### 104.1 Context

A point-in-time security review of the API, render pipeline, web-server
configuration, and deploy/secret handling (recorded in
`SECURITY-ASSESSMENT-2026-06.md`) identified a set of hardening gaps. This
section is the desired-state declaration for each. It complements the
adjacent security sections (§39, §49, §73, §91, §93, §95, §100, §102) and the
already-tracked workflow/proxy/time-gating items.

### 104.2 Feedback metadata sanitisation

The feedback endpoint embeds client-supplied metadata in a GitHub-issue
Markdown table. These metadata fields are not part of the injection-pattern
scan (§73.12) and must not be able to break the table or carry an unbounded
payload.

- The feedback API caps the length of the client-supplied metadata fields
  before embedding them in the issue: page URL ≤ 500, viewport ≤ 20,
  User-Agent ≤ 400, timestamp ≤ 40, and name ≤ 200 characters. <!-- 02-§104.1 -->
- Each metadata value placed in the issue's Markdown table has its control
  characters (including carriage return, line feed, and tab) collapsed to a
  single space and its `|` characters escaped, so a submission cannot add
  table rows or columns or smuggle structure into the issue. <!-- 02-§104.2 -->
- The metadata sanitisation is implemented identically in
  `source/api/feedback.js` and `api/src/Feedback.php`. <!-- 02-§104.3 -->

### 104.3 Link protocol validation in the render layer

The event `link` field is rendered as a clickable anchor. The render layer
must not depend solely on API-time (§49.4) and CI validation, because
hand-edited or legacy camp YAML never passes the API.

- When an event's `link` field is rendered as an anchor, the `href` is emitted
  only when the link begins with `http://` or `https://` (case-insensitive);
  any other value renders no external link. <!-- 02-§104.4 -->
- This render-time check is applied everywhere the event `link` is rendered as
  an anchor: the build renderers (`source/build/render.js`,
  `source/build/render-arkiv.js`, `source/build/render-event.js`) and the
  client today/display script (`source/assets/js/client/events-today.js`),
  independent of the API and CI link validation. <!-- 02-§104.5 -->

### 104.4 Constant-time admin-token comparison

§91.8 requires constant-time admin-token comparison. The comparison must not
leak the candidate's length.

- Admin-token verification compares a candidate against each configured token
  by hashing both sides to a fixed-width keyed digest and comparing the
  digests in constant time, with no length pre-check and no early return, so
  neither a match nor the candidate's length is observable through
  timing. <!-- 02-§104.6 -->
- This comparison is implemented identically in `source/api/admin.js` and
  `api/src/Admin.php`. <!-- 02-§104.7 -->

### 104.5 Session secret configuration

Activity-ownership authorisation rests on an HMAC signature keyed by
`SESSION_SECRET`. A weak secret allows ownership forgery.

- The session-signing secret is supplied via the `SESSION_SECRET` environment
  variable and is documented in `.env.example` with its purpose and a minimum
  strength of 32 random bytes. <!-- 02-§104.8 -->
- When `SESSION_SECRET` is set but shorter than 32 characters, both runtimes
  (`app.js`, `api/index.php`) log a warning at startup. An unset secret
  disables cookie-based ownership and fails closed. <!-- 02-§104.9 -->

### 104.6 Trusted-proxy rate-limit key and atomic counter

The PHP rate-limiter keys on the client IP. `X-Forwarded-For` is
attacker-controlled and the counter file must update atomically.

- The PHP rate-limiter uses `REMOTE_ADDR` as the client key, honouring the
  right-most (proxy-appended) `X-Forwarded-For` entry only when `REMOTE_ADDR`
  is listed in the `TRUSTED_PROXIES` environment variable and that entry is a
  syntactically valid IP. The right-most entry is used because the left-most is
  client-spoofable when the proxy appends (see §93.6). <!-- 02-§104.10 -->
- The PHP rate-limit counter file is read and written under an exclusive lock
  (`flock`) for the whole read-modify-write, so concurrent requests cannot
  lose updates and a client cannot exceed a limit by racing. <!-- 02-§104.11 -->
- `TRUSTED_PROXIES` is documented in `.env.example`; when it is unset,
  `X-Forwarded-For` is never trusted. <!-- 02-§104.12 -->

### 104.7 Fail-closed time-gating when camp metadata is unavailable

The PHP time-gating depends on local camp metadata. When that metadata is
unavailable it must not silently skip the gate.

- When the PHP API cannot load, parse, or resolve the active camp metadata,
  the mutation endpoints (`/add-event`, `/add-events`, `/edit-event`,
  `/delete-event`) reject the request with HTTP 503 rather than skipping
  time-gating. <!-- 02-§104.13 -->
- The PHP API resolves the camps metadata from `api/data/camps.yaml` (bundled
  with the API deploy) first, falling back to the repository
  `source/data/camps.yaml`; the deploy workflow copies `camps.yaml` into the
  API package so the file is always present on the server. <!-- 02-§104.14 -->

### 104.8 Event-data pull-request validation gate

The event-data PR check is the branch-protection backstop for malformed or
unsafe YAML and must run real validation.

- The event-data pull-request workflow (`event-data-deploy.yml`) runs the
  security scanner (`check-yaml-security.js`) as a hard block against every
  changed per-camp event file (excluding `camps.yaml` and `local.yaml`); a
  finding fails the check. The schema validator (`lint-yaml.js`) also runs on
  every changed file: it is a hard block for files belonging to non-archived
  camps and advisory (reported, non-blocking) for archived camps, whose data
  predates the current required-field schema. New submissions are schema-validated
  at the API layer before the PR is opened, so active-camp data remains
  enforced. <!-- 02-§104.15 -->
- The workflow validates every pull request that touches `source/data/*.yaml`
  — including `event-delete/` branches and manually opened PRs — and checks
  out with enough git history for the diff against the base to resolve
  (CL-§9.5). <!-- 02-§104.16 -->
- The validation job performs its diff and validation in a single step so no
  untrusted value crosses a step-output boundary, and no untrusted value is
  interpolated as `${{ … }}` into a `run:` script: the PR base SHA arrives via
  an environment variable and the changed filenames are a local shell variable
  read as data (quoted here-string, each name quoted). A crafted filename such
  as `source/data/x$(…).yaml` is therefore inert and cannot inject shell
  commands on the runner. <!-- 02-§104.20 -->

### 104.9 HTTP security headers

The site renders user-submitted content as HTML and relies on output encoding
and a Markdown sanitiser; HTTP security headers add an independent defence
layer. The static site and the API may be on different origins (in production
the API is a separate `api.` host), so the policy must allow cross-origin API
calls without weakening the rest.

- The site `.htaccess` sets a `Content-Security-Policy` that restricts
  `default-src` to `'self'`, forbids plugins (`object-src 'none'`), framing
  (`frame-ancestors 'none'`), and base-tag hijacking (`base-uri 'self'`),
  permits the GoatCounter script/connect/image origins, and allows inline
  scripts and styles (`'unsafe-inline'`) as required by the build's per-page
  inline data scripts on static hosting. <!-- 02-§104.17 -->
- The CSP `connect-src` lists `'self'` and the API origin so the form,
  feedback, edit/delete, and verify-admin `fetch()` calls are not blocked when
  the API is a separate origin. The build injects the API origin (derived from
  `API_URL`) into `connect-src` at build time; `'self'` covers a same-origin or
  local API, and the built `.htaccess` contains no remaining placeholder
  token. <!-- 02-§104.18 -->
- The site `.htaccess` also sets `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  a `Permissions-Policy` disabling geolocation/microphone/camera/interest-cohort,
  and `Strict-Transport-Security` with `max-age` of one year. `includeSubDomains`
  and `preload` are intentionally omitted until every `*.sbsommar.se` subdomain
  is confirmed HTTPS-only, because the directive is hard to reverse within the
  `max-age` window. <!-- 02-§104.19 -->

---

---

## 105. Early Access Role (tidig åtkomst)

### 105.1 Context

Organisers want a skeleton schedule in place before the form opens for
participants. The `admin` role can already do this, but it also grants the
power to edit and delete every participant's activity — more than the need
requires. The `early` role is a narrower credential: its holder works under
the same rules as a regular participant, with one difference — the pre-camp
time gate can be bypassed. The role reuses the token format, signing,
activation page, and footer indicator defined in §91. Agreed in #380.

### 105.2 Server authorisation (API requirements)

- A request to add, edit, or delete an activity made before the active
  camp's `opens_for_editing` date is admitted by the time gate when it
  carries a valid token whose role is `admin`, `superadmin`, or
  `early`. <!-- 02-§105.1 -->
- Edit and delete authorisation for an `early` token holder is decided
  solely by the session-cookie ownership model. The ownership bypass that
  lets administrators act on any activity applies only to the roles
  `admin` and `superadmin` — an `early` token holder edits and deletes
  only activities owned by their browser's session cookie. <!-- 02-§105.2 -->
- The post-camp lock applies to every role: when today is after
  `end_date + 1 day` (§26), no token — `admin`, `superadmin`, or `early` —
  admits add, edit, or delete requests. <!-- 02-§105.3 -->
- `POST /verify-admin` answers `200 { "valid": true }` for a valid token of
  any recognised role, including `early`, so an early-access token is
  activated on `/token.html` exactly like an admin token. <!-- 02-§105.4 -->
- Both runtimes (Node and PHP) expose two distinct role checks: the boolean
  `verifyAdminToken` is true only for `admin` and `superadmin`, and a
  separate pre-camp-bypass check is true for `admin`, `superadmin`, and
  `early`. The time gate uses the pre-camp-bypass check; ownership uses
  `verifyAdminToken`. <!-- 02-§105.5 -->

### 105.3 Issuing (site requirements)

- `npm run admin:create` mints `early` tokens with 90 days
  validity. <!-- 02-§105.6 -->

### 105.4 Client behaviour (user requirements)

- Edit links on all schedule events are injected only when the stored
  token's role is `admin` or `superadmin`. A stored `early` token injects
  no all-event edit links; the holder's own activities receive edit links
  through the session cookie, as for any participant. <!-- 02-§105.7 -->
- Before `opens_for_editing`, the add form and the edit page show the
  "open anyway" bypass button for a valid stored token of role `admin`,
  `superadmin`, or `early`. The button label is "Öppna ändå (admin)" for
  administrator roles and "Öppna ändå (tidig åtkomst)" for
  `early`. <!-- 02-§105.8 -->
- On the edit page, the client-side shortcut that skips the ownership
  check applies only to the roles `admin` and `superadmin`. A visitor
  whose stored token role is `early` passes the ownership check only for
  activities in their session cookie. <!-- 02-§105.9 -->

### 105.5 Constraints

- All user-facing text is in Swedish. <!-- 02-§105.10 -->
- The role is read from the token's second underscore-separated segment;
  the client never needs to verify the signature — the server remains the
  authority on every privileged action. <!-- 02-§105.11 -->

---

---

## 106. Token Minting from the Web (superadmin)

### 106.1 Context

Issuing a token (§91, §105) is also possible without a terminal: a
superadmin mints `admin` and `early` tokens directly from the web —
mobile-friendly, no environment edit, no redeploy — and shares an
activation link. The server signs the token on demand with
`ADMIN_TOKEN_SECRET` and stores nothing, preserving the stateless model
of §91. The `superadmin` role itself is minted only via the CLI
(02-§91.30), so the web path can never escalate to a new superadmin.
Agreed in #391.

### 106.2 Mint endpoint (API requirements)

- Both runtimes expose `POST /mint-token` (Node `app.js`, PHP
  `api/index.php`). <!-- 02-§106.1 -->
- The request body is `{ "token", "name", "role", "days" }`. The request
  is authorised only when `token` is a valid token (§91) whose role is
  `superadmin`; otherwise the response is
  `403 { "success": false, "error" }`. <!-- 02-§106.2 -->
- The mintable roles are exactly `admin` and `early`. Any other requested
  role — including `superadmin` — is rejected with
  `400 { "success": false, "error" }`. <!-- 02-§106.3 -->
- The name is sanitised the same way as in the CLI: trimmed, lowercased,
  whitespace replaced by hyphens, and restricted to `a–ö`, digits, and
  hyphens — it never contains an underscore (the token field delimiter).
  A name that is empty after sanitisation is rejected with
  `400`. <!-- 02-§106.4 -->
- `days` is an integer between 1 and the role's standard validity —
  60 for `admin`, 90 for `early` (02-§91.30, 02-§105.6). A request
  without `days` uses the role's standard validity; a value outside the
  range is rejected with `400`. <!-- 02-§106.5 -->
- On success the response is `200 { "success": true, "token" }` where the
  token is signed for the sanitised name, the requested role, and an
  expiry of now plus the validity. Nothing is stored
  server-side. <!-- 02-§106.6 -->
- The endpoint is rate-limited to 5 requests per hour per IP, the same
  budget as `/verify-admin` (§93). <!-- 02-§106.7 -->
- When `ADMIN_TOKEN_SECRET` is unset or empty, no requester token
  validates and every mint request is rejected with `403`
  (fail-closed, 02-§91.3). <!-- 02-§106.8 -->

### 106.3 Mint UI (user requirements)

- `/token.html` contains a mint section that is displayed only when the
  stored token in `localStorage` is unexpired and its role (second
  underscore-segment) is `superadmin`. The client-side role check decides
  visibility only — the server authorises every mint request
  (02-§105.11). <!-- 02-§106.9 -->
- The mint form has three fields: name, role (`admin` /
  `early`, labelled "Admin" and "Tidig åtkomst" with their validity), and
  validity in days. Changing the role updates the day field's default and
  maximum to the role's standard validity. <!-- 02-§106.10 -->
- Submitting the form sends `POST /mint-token` with the stored superadmin
  token. On success the UI shows an activation link of the form
  `<site-origin>/token.html#token=<token>`. <!-- 02-§106.11 -->
- The result row has a copy button, and a share button (`navigator.share`)
  that is displayed only when the browser supports sharing. <!-- 02-§106.12 -->
- Error responses are displayed in Swedish in the mint section's message
  area. <!-- 02-§106.13 -->

### 106.4 Redemption via link (user requirements)

- On load, `/token.html` reads `location.hash`. When the fragment contains
  `token=<value>`, the page calls `POST /verify-admin` with the value and,
  on `valid: true`, stores it in `localStorage` exactly like a manual
  activation (02-§91.12) and shows the activation success
  message. <!-- 02-§106.14 -->
- The fragment is removed from the address bar via
  `history.replaceState` whether or not the activation succeeds, so the
  token does not linger in the visible URL. <!-- 02-§106.15 -->
- The link carries the token in the `#fragment` — never in a `?query`
  parameter — because fragments are not sent to the server and do not
  leak through `Referer` headers or server logs. <!-- 02-§106.16 -->

### 106.5 Constraints

- `ADMIN_TOKEN_SECRET` exists only server-side; the client never signs
  or sees the secret (02-§91.1). <!-- 02-§106.17 -->
- All user-facing text is in Swedish; styling uses the custom properties
  from `docs/07-design/css-strategy.md §7` and the token page's existing
  form components. <!-- 02-§106.18 -->
