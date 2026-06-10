---
title: "SB Sommar – Architecture: Platform and Security"
---

# SB Sommar – Architecture: Platform and Security

The Progressive Web App layer, admin token infrastructure, authorization endpoint rate limiting, and regex performance and escape hygiene.

Part of [the architecture index](./index.md). Section IDs (`03-§N.M`) are stable and cited from code; they do not encode the file path.

---

## 28. Progressive Web App (PWA)

The site is installable as a Progressive Web App. This gives participants a
native-app-like experience when they add sbsommar.se to their home screen,
including offline access to cached pages and event data.

### Manifest

`source/static/app.webmanifest` defines the app name, icons, theme color, and
display mode. It is copied to `public/app.webmanifest` during the build.

### Service worker

`source/static/sw.js` lives at the site root (`public/sw.js`) so its scope
covers all pages. It uses a versioned cache name (currently `sb-sommar-v6`).

**Scheme guard:** The fetch handler returns early for any request whose
URL scheme is not `http:` or `https:`. This prevents errors from
browser-extension schemes such as `chrome-extension:`.

**Cache strategy:**

| Request type | Strategy | Rationale |
| --- | --- | --- |
| HTML (navigation) | Network-first, cache fallback (ignoreSearch) | Users should see fresh content when online |
| CSS, JS, images | Cache-first (exact match), network fallback | Static assets are served by cache-busted URL; exact match ensures a new hash triggers a fresh network fetch |
| `events.json` | Network-first, cache fallback (ignoreSearch) | Event data should be fresh when online but available offline |
| API calls (`/api/`, `/add-event`, `/edit-event`) | Network-only (not cached) | Mutations must always reach the server |

Cache-matching for the network-first strategies (HTML and `events.json`)
uses `{ ignoreSearch: true }` so that cache-busted or query-stringed
URLs still match the pre-cached file when falling back offline. The
cache-first strategy for static assets does **not** use `ignoreSearch`
— a request for `style.css?v=<newHash>` must not satisfy from a cache
entry keyed at `style.css?v=<oldHash>` (§96.5).

**Offline fallback:** When a navigation request fails and the requested
page is not in the cache, the service worker responds with
`/offline.html` — a pre-cached page that tells the user they are offline.

**Build-time pre-cache manifest (§92):**

The build scans all files in `public/` after post-processing and injects
a complete pre-cache URL list into `sw.js` by replacing the
`/* __PRE_CACHE_URLS__ */` placeholder. This ensures every asset — HTML
pages, CSS, JS, images, `events.json` — is available offline from the
first launch. Files excluded from pre-cache: `.htaccess`, `robots.txt`,
`sw.js`, `version.json`, `.ics`, `.rss`, and per-event detail pages.

**Lifecycle (§96 — self-healing upgrade):**

- `install`: Calls `self.skipWaiting()` and pre-caches all assets from
  the build-injected list. Each URL is wrapped in
  `new Request(url, { cache: 'reload' })` so the fetch bypasses the
  browser's HTTP cache. This prevents a stale HTTP-cache entry (kept
  fresh for up to a week by `Cache-Control: max-age=604800`) from being
  copied into the new service-worker cache on install.
- `activate`: Deletes every cache whose name does not match the current
  `CACHE_NAME`, then calls `self.clients.claim()` so the new worker
  immediately controls every open tab without waiting for the user to
  close and reopen them.
- `fetch`: Intercepts requests and applies the strategy table above.

Combined, `skipWaiting` + `clients.claim` + `cache: 'reload'` on
pre-cache mean that any client whose prior service worker had cached a
stale `/style.css` self-heals on the first post-deploy visit: the
browser fetches the new `sw.js` (bypassing its HTTP cache because
`updateViaCache: 'imports'` is Chrome's default for registered service
workers), installs it, activates it immediately, wipes the old cache,
and rebuilds the new cache from network-only responses.

**Offline guard (§92):**

Form pages (`lagg-till.html`, `redigera.html`) and the feedback modal
include offline detection. When the user is offline, a Swedish-language
banner appears and submit buttons are disabled. When connectivity
returns, the banner disappears and buttons are re-enabled.
`offline-guard.js` handles the form pages; `feedback.js` handles the
feedback modal internally.

### Registration

`source/assets/js/client/sw-register.js` registers the service worker on every
page. It checks for `navigator.serviceWorker` support before registering.

### HTML head tags

Every render function adds to `<head>`:

- `<link rel="manifest" href="app.webmanifest">`
- `<meta name="theme-color" content="...">` (terracotta from design palette)
- `<meta name="mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
- `<link rel="apple-touch-icon" href="images/sbsommar-icon-192.png">`

### Icons

Two PNG icons are required in `source/content/images/`:

| File | Size | Purpose |
| --- | --- | --- |
| `sbsommar-icon-192.png` | 192×192 | Android home screen, Apple touch icon |
| `sbsommar-icon-512.png` | 512×512 | Android splash screen |

### Files

| File | Role |
| --- | --- |
| `source/static/app.webmanifest` | PWA manifest |
| `source/static/sw.js` | Service worker |
| `source/assets/js/client/sw-register.js` | Service worker registration |
| `source/build/render-offline.js` | Offline fallback page renderer |
| `source/content/images/sbsommar-icon-192.png` | App icon 192×192 |
| `source/content/images/sbsommar-icon-512.png` | App icon 512×512 |
| `source/assets/js/client/pwa-install.js` | PWA install button logic |
| `source/assets/js/client/offline-guard.js` | Offline detection for form pages |

### 28.7 Install guide

A discreet install button in the site header helps users discover that the
site can be installed as an app. The button appears alongside the existing
header controls (hamburger menu, scroll-to-top, feedback).

**Platform detection and behaviour:**

| Platform | Detection | Button action |
| --- | --- | --- |
| Chrome / Edge (Android, desktop) | `beforeinstallprompt` event fires | Captures event; click calls `prompt()` on the deferred event |
| iOS Safari | UA contains iPhone/iPad + no `beforeinstallprompt` | Click shows tooltip with manual instruction |
| Standalone mode | `matchMedia('(display-mode: standalone)')` | Button not rendered |
| Other browsers | Neither condition met | Button not rendered |

After successful installation (`appinstalled` event), the button is hidden.

The iOS tooltip provides a Swedish instruction ("Tryck på Dela-ikonen och
välj 'Lägg till på hemskärmen'") and closes on outside click or Escape.

All logic lives in `source/assets/js/client/pwa-install.js`, loaded with
`defer` on every page via the shared layout.

---

## 30. Admin Token Infrastructure

### Purpose

A lightweight admin mechanism allows designated administrators to bypass
the per-event cookie ownership model. The token infrastructure covers
storage, activation, verification, and status display. The edit/delete
endpoints and client-side code accept a valid admin token as an
alternative to session-cookie ownership (OR condition).

### Token storage (server)

The server validates tokens against a single signing secret in the
environment variable `ADMIN_TOKEN_SECRET`; there is no stored list of
issued tokens. A token has the form `namn_roll_epoch_sig`, where `sig` is
the base64url HMAC-SHA256 of `namn_roll_epoch` keyed by the secret. The
Node server (`app.js` / `source/api/admin.js`) and the PHP API
(`api/index.php` / `api/src/Admin.php`) each read the secret at startup and
recompute the signature to validate a token: `signToken()` produces a token
and `verifyToken()` returns its `{ name, role, epoch }` or `null`. Both
runtimes encode the signature as unpadded base64url so a token signed by one
validates in the other. The token is parsed on the first three underscores
(`namn`, `roll`, `epoch` are underscore-free; the remainder is `sig`, which
may itself contain base64url underscores). Roles `admin` and `superadmin`
are administrator-equivalent; `early` is a recognised role with narrower
privileges. When the secret is unset or empty, no token validates and admin
functionality is disabled. The runtimes log a warning when the secret is
shorter than 32 bytes (same posture as `SESSION_SECRET`).

### Role checks

Two distinct role checks exist in both runtimes (02-§105.5), because the
two privileges they guard have different blast radii:

- `verifyAdminToken(candidate, secret)` — true only for `admin` and
  `superadmin`. Used by the ownership OR-condition in `/edit-event` and
  `/delete-event` (acting on **other people's** events).
- `verifyPreCampBypassToken(candidate, secret)` — true for `admin`,
  `superadmin`, and `early`. Used only by the pre-camp time gate in
  `/add-event`, `/add-events`, `/edit-event`, and `/delete-event`
  (acting **before `opens_for_editing`**).

The post-camp lock (`isAfterEditingPeriod`, today > `end_date + 1`) is
checked before either helper and no role bypasses it (02-§105.3).

### Early access role (tidig åtkomst)

The `early` role (02-§105) lets trusted organisers build a skeleton
schedule before the form opens, without granting admin power over other
people's events. An `early` token holder behaves exactly like a regular
participant — cookie-based ownership of their own events — except that
`verifyPreCampBypassToken` admits their add/edit/delete requests before
`opens_for_editing`. Client-side, the stored token's role (second
underscore-segment) decides what UI appears: the all-event edit links in
`session.js` and the ownership shortcut in `redigera.js` require an
admin-equivalent role, while the pre-camp "Öppna ändå" bypass button in
`lagg-till.js` and `redigera.js` appears for any valid stored token,
labelled "(admin)" or "(tidig åtkomst)" by role. The client role check is
cosmetic — the server re-verifies the signature and role on every request.

### Verification endpoint

`POST /verify-admin` accepts `{ "token": "<string>" }` and responds:

- `200 { "valid": true }` — valid signature, recognised role, unexpired epoch
- `403 { "valid": false }` — otherwise

Any recognised role validates here — including `early` — so every token
kind is activated through the same `/token.html` flow (02-§105.4). The
endpoint verifies activation only; each privileged action applies its own
role check. The supplied and recomputed signatures are compared in constant
time over fixed-width digests (`tokenDigest()`, an HMAC keyed by a
per-process random key, retained from #386), so neither validity nor token
length leaks via timing.

### Provisioning and revocation

`npm run admin:create` signs a token offline against `ADMIN_TOKEN_SECRET`
for the chosen role — 60 days validity for `admin`, 90 days for `early`,
180 days for `superadmin` — and prints it to hand over: no environment edit
and no redeploy per person, because the secret (not a list) is what the
runtimes read. `superadmin` is minted only by this script (it grants the
right to mint others), never from the web UI. Because tokens are stateless, an
individual token cannot be revoked without rotating `ADMIN_TOKEN_SECRET`
(which invalidates all tokens at once); short embedded expiries bound the
exposure of a leaked token.

### Token storage (client)

The admin token is stored in `localStorage` under the key `sb_admin`:

```json
{ "token": "<string>", "activated": 1710000000000 }
```

The token is never placed in a cookie. It is sent explicitly in API
request bodies when admin privileges are needed.

### Expiry

A token is considered expired if more than 30 days (2 592 000 000 ms)
have passed since the `activated` timestamp. Expiry is checked
client-side. An expired token behaves as if no token exists.

### Activation page

`/token.html` — a minimal page with a text input and submit button.
On submit, it calls `POST /verify-admin`. If valid, the token and
timestamp are stored in `localStorage`. The page shares the site layout
(header, navigation, footer) but is **not listed in the navigation**.

### Footer status indicator

A small icon in the shared site footer shows admin status:

| State | Display |
| --- | --- |
| No token in `localStorage` | Nothing shown |
| Valid token (< 30 days) | Filled/locked icon with title "Token aktiv" |
| Expired token (> 30 days) | Open/unlocked icon with title "Token utgången", links to `/token.html` |

The icon is rendered client-side by a script included in the footer
layout, reading from `localStorage`.

### Files (planned)

| File | Role |
| --- | --- |
| `source/build/render-admin.js` | Build-time render of `/token.html` |
| `source/assets/js/client/admin.js` | Client-side: activation form + footer icon |
| `source/build/layout.js` | Updated `pageFooter()` to include admin icon container |
| `app.js` | New `POST /verify-admin` endpoint (Node.js) |
| `api/index.php` | New `POST /verify-admin` endpoint (PHP) |

---

## 31. Authorization Endpoint Rate Limiting

### 31.1 Goal

Protect authorization and write endpoints (`/verify-admin`,
`/edit-event`, `/delete-event`, `/feedback`) from brute-force probing
and abusive bursts, and give CodeQL's `js/missing-rate-limiting`
analysis a visible, explicit counter to stop flagging these handlers.

The mechanism is intentionally minimal: a per-IP counter per endpoint
with an hourly window, returned as HTTP `429` with a Swedish error
message. Coordination across processes is out of scope — single-process
Node and single-host PHP both store counter state locally.

### 31.2 Per-endpoint limits

| Endpoint          | Limit (per IP per hour) | Rationale                                           |
| ----------------- | ----------------------- | --------------------------------------------------- |
| `/verify-admin`   | 5                       | Brute-force target; admins only verify once per session |
| `/edit-event`     | 30                      | Normal owner edits; 2–3 attempts per edit, batching tolerated |
| `/delete-event`   | 30                      | Same profile as edit                                |
| `/feedback`       | 5                       | Existing §73.14 limit, unchanged                    |

The rate-limit check runs **before** validation, authorization, and
time-gating, so a throttled client never reaches the admin-token
comparison path or the GitHub API.

### 31.3 Node (`app.js` + `express-rate-limit`)

- Uses the [`express-rate-limit`](https://www.npmjs.com/package/express-rate-limit)
  middleware, installed as a runtime dependency.
- Each guarded route has its own `rateLimit({ windowMs, limit, ... })`
  instance defined at the top of `app.js`; the instance is applied as
  per-route middleware. Separate instances keep per-endpoint counters
  independent.
- State: the middleware's default in-memory store. Expired entries are
  cleaned up automatically; no unbounded growth.
- Client IP resolution: `express-rate-limit` derives the key from
  `req.ip`, which honours the Express `trust proxy` setting. `app.js`
  sets `app.set('trust proxy', 'loopback')` so only loopback-connected
  reverse proxies are permitted to set `X-Forwarded-For`. Deployments
  behind a non-loopback proxy are expected to configure an appropriate
  trust boundary in their reverse-proxy layer.
- On limit exceeded, the middleware emits HTTP `429` with the standard
  `Retry-After` and `RateLimit-*` headers; `app.js` overrides the
  response body via the `handler` option to produce the Swedish error
  payload defined in §31.5.

### 31.4 PHP (`api/src/RateLimit.php`)

- Exposes `SBSommar\RateLimit::isLimited(string $ip, string $namespace,
  int $limit, int $windowSeconds): bool`.
- State: a single JSON file under `sys_get_temp_dir()`
  (`sbsommar_rate_limit.json`), with namespaced keys so endpoints share
  storage but not quotas.
- The same expired-entry sweep runs each call; no scheduled cleanup.
- Client IP resolution is handled by `api/index.php`: `HTTP_X_FORWARDED_FOR`
  → `REMOTE_ADDR`.

### 31.5 Failure semantics

On limit exceeded, both runtimes return:

```json
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{ "success": false, "error": "För många förfrågningar. Försök igen senare." }
```

`/verify-admin` returns the same payload but omits `success` since its
success response uses `{ "valid": true }` — it returns
`{ "error": "För många förfrågningar. Försök igen senare." }` with
status `429` and no `valid` key.

### 31.6 Files

| File                          | Role                                                                |
| ----------------------------- | ------------------------------------------------------------------- |
| `app.js`                      | Defines per-endpoint `rateLimit()` middleware and applies it to routes |
| `package.json`                | Declares `express-rate-limit` as a runtime dependency               |
| `api/src/RateLimit.php`       | Shared PHP helper                                                   |
| `api/src/Feedback.php`        | Uses shared PHP helper                                              |
| `api/index.php`               | Calls helper at the top of each guarded handler                     |

### 31.7 Known limitations

- In-process counters reset on restart. Acceptable because both
  deployments are single-process and an attacker would need to time
  restarts very precisely.
- Node's `trust proxy` is set to `'loopback'`. Deployments that place
  a non-loopback reverse proxy in front of `app.js` must widen the
  trust setting or accept that `X-Forwarded-For` will not be honoured
  for rate-limit keying. The PHP handler continues to trust
  `HTTP_X_FORWARDED_FOR` as-is, matching the hosting-environment
  assumption for shared PHP hosts.
- File locking is not used in PHP. Two concurrent PHP requests may
  race on the JSON write; worst case is one request's increment lost.
  For a 5/h or 30/h limit this is negligible.

---

## 33. Regex Performance and Escape Hygiene

### 33.1 Goal

Close CodeQL alerts #17 (`js/polynomial-redos`) and #30–#32
(`js/incomplete-sanitization`) and remove two regex patterns that invite
future bugs: a polynomial-time trim in the slug builder and an
incomplete ad-hoc escape in a test file. The fixes are behaviour-
preserving; nothing user-facing or data-facing changes.

### 33.2 `slugify()` — linear-time trim

`slugify()` in `source/api/github.js` runs on user-supplied activity
titles. Before this change the trim step used two separate passes:

```js
.replace(/^-+/, '')
.replace(/-+$/, '')
```

`/^-+/` is linear (anchored at start), but `/-+$/` without a start
anchor can be O(n²) when the input contains a long run of `-`
characters: the engine retries the `-+$` match at every position. After
the earlier collapse `[^a-z0-9]+/g → '-'`, runs of `-` already cannot
exceed length 1, so `+` in the trim regexes is redundant. The fix is a
single combined pass:

```js
.replace(/^-|-$/g, '')
```

Linear, matches at most two characters (one leading, one trailing), and
produces identical output for every input.

### 33.3 `tests/helpers/regex-escape.js` — shared `escapeRegExp`

`tests/scoped-headings.test.js` built a `RegExp` from a CSS selector
string by escaping only `.` and `\s`, which is fine for the current
literals (`.md-preview`, `.event-desc`, `.event-description`) but
malformed as soon as any callsite passes a selector with `*`, `+`, `?`,
`^`, `$`, `{`, `}`, `(`, `)`, `|`, `[`, `]`, or `\`. CodeQL's
`js/incomplete-sanitization` correctly flags this pattern.

A single helper at `tests/helpers/regex-escape.js` exports the canonical
escape:

```js
function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

`tests/scoped-headings.test.js` imports this helper at each site where a
`container` or `heading` value is interpolated into a `RegExp`. No
other test file currently builds a pattern from a variable string, so
no broader refactor is needed.

### 33.4 Files changed

| File                                  | Change                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `source/api/github.js`                | Collapse two-step trim in `slugify()` into `/^-\|-$/g`                    |
| `tests/helpers/regex-escape.js`       | New helper exporting `escapeRegExp(str)`                                 |
| `tests/scoped-headings.test.js`       | Replace hand-rolled selector escape with `escapeRegExp()`                |
| `tests/slugify-redos.test.js`         | New test — verifies ReDoS-safe runtime and output equivalence            |
| `tests/regex-escape.test.js`          | New test — verifies helper covers every metacharacter                    |

---

## 34. Security Hardening (2026-06)

Implements the desired states in `02-requirements/platform-security.md §104`.
Each subsection notes the design decision and the Node/PHP parity. The review
that motivated the work is recorded in `SECURITY-ASSESSMENT-2026-06.md`.

### 34.1 Feedback metadata sanitisation (02-§104.1–104.3)

`buildFeedbackIssue()` is extracted as a pure function (Node) so the
sanitisation is unit-testable without the network. `sanitizeMetaField(value,
maxLen)` collapses `[\x00-\x1f\x7f]+` to a single space, escapes `|` to `\|`,
trims, and truncates to `maxLen`. Per-field caps live in `META_MAX_LENGTHS`
(url 500, viewport 20, userAgent 400, timestamp 40, name 200). `description`
sits above the table and is left multi-line. PHP mirrors this in
`Feedback::sanitizeMetaField()` and the same `META_MAX_LENGTHS` constant.

### 34.2 Link protocol validation in the render layer (02-§104.4–104.5)

`source/build/utils.js` exports `safeLinkHref(url)` — returns the URL only when
it matches `^https?://`i, else `''`. `render.js`, `render-arkiv.js`, and
`render-event.js` (the per-event detail page) route `e.link`/`ev.link`/
`event.link` through it and skip the anchor when it returns empty; `render.js`
and `render-arkiv.js` also gate `hasExtra` on the sanitised link so a bad-only
link does not produce an empty expander. The client `events-today.js` has an
equivalent inline `safeHttp()` and gates both `hasExtra` and the anchor on its
result. This is independent of the API (§49.4)
and CI (`check-yaml-security.js`) link checks — defence-in-depth for legacy or
hand-edited YAML that never passed the API.

### 34.3 Constant-time admin-token comparison (02-§104.6–104.7)

A per-process random key (`crypto.randomBytes(32)` / PHP `random_bytes(32)`)
is used only to hash both candidate and each configured token to a fixed-width
HMAC-SHA256 digest. `crypto.timingSafeEqual` / `hash_equals` then compares the
equal-length digests for every token with no early return, so neither the
match nor the candidate length is observable through timing. Expiry is still
checked first (the epoch is not secret).

### 34.8 HTTP security headers (02-§104.17–104.19)

`source/static/.htaccess` sets CSP, `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS via
`mod_headers`. CSP uses `'unsafe-inline'` for script/style because the build
emits per-page inline data scripts and static Apache has no per-request nonce;
it still blocks cross-origin scripts, plugins, framing, and base hijacking.
`connect-src` carries a `__API_ORIGIN__` placeholder that `injectHtaccessCsp()`
(`source/build/utils.js`) replaces with `new URL(API_URL).origin` when the
build copies the file — required because the production API is a separate
origin (`fetch()` is governed by `connect-src`, and `'self'` alone would block
it). QA/local APIs are same-origin so the placeholder resolves to empty. This
is verified to leave no placeholder token in the built `.htaccess`.

### 34.4 Session secret configuration (02-§104.8–104.9)

`SESSION_SECRET`, `TRUSTED_PROXIES`, and the existing variables are documented
in `.env.example`. `app.js` and `api/index.php` log a startup warning when the
secret is set but shorter than 32 characters; an unset secret already disables
cookie ownership (fails closed), so no fatal error is raised.

### 34.5 Trusted-proxy rate-limit key and atomic counter (02-§104.10–104.12)

`clientIp()` in `api/index.php` returns `REMOTE_ADDR` unless that peer is in
the `TRUSTED_PROXIES` list, in which case the **right-most** `X-Forwarded-For`
entry — the address the trusted proxy appended — is used after
`FILTER_VALIDATE_IP`. Right-most, not left-most: a client can prepend spoofed
entries but cannot control the value the proxy adds last, so the left-most
entry would still be rotatable to bypass the limit under an appending proxy
(`$proxy_add_x_forwarded_for`). This prevents a direct client from rotating the
header to mint fresh rate-limit buckets (the Node side already uses Express's
trust-proxy-aware `req.ip`, §31.3). `RateLimit::isLimited()`
opens the counter file with `fopen(…, 'c+')`, holds `LOCK_EX` across the
read-modify-write, and `ftruncate`s before rewriting, so concurrent requests
cannot lose updates. A filesystem error fails open rather than blocking
legitimate traffic.

### 34.6 Fail-closed time-gating (02-§104.13–104.14)

`api/index.php` resolves camps from `__DIR__/data/camps.yaml` (bundled with the
API deploy) first, then `dirname(__DIR__)/source/data/camps.yaml` (repo layout
for local dev and tests). `ActiveCamp::resolve()` throws when no camp can be
resolved, leaving `$activeCamp` null; each mutation handler then returns HTTP
503 instead of skipping the gate. The deploy workflow copies `camps.yaml` into
`api/data/` before packaging the API, and `api/.gitignore` excludes the
generated `data/` directory.

### 34.7 Event-data PR validation gate (02-§104.15–104.16)

`event-data-deploy.yml` checks out with `fetch-depth: 0`, installs deps,
diffs the changed `source/data/*.yaml` files against the PR base (excluding
`camps.yaml`/`local.yaml`), and validates each in a here-string loop (not a
pipe-to-`while`, so a failure reliably fails the job). `check-yaml-security.js`
is a hard block for every file. `lint-yaml.js` is a hard block for non-archived
camps and advisory (`::warning::`) for archived ones — the loop derives the
non-archived camp file list from `camps.yaml` via a `js-yaml` one-liner, so
legacy archived data (which predates the required-field schema) stays editable
while the security control still applies to it. The job-level `if` that
previously restricted the check to `event/` and `event-edit/` branches is
removed, so `event-delete/` branches and manual data PRs are all validated.
Build and deploy remain post-merge (`event-data-deploy-post-merge.yml`).

Script-injection hardening (02-§104.20): the diff and validation happen in a
single step, so no untrusted value crosses a step-output boundary. The PR base
SHA arrives via `env: BASE_SHA` (a trusted commit ref) and the changed-file
list is a local shell variable from `git diff`, read through a quoted
here-string (`done <<< "$files"`) with each name quoted as `"$f"`. Nothing is
interpolated as `${{ … }}` into a `run:` block — which would let a filename
like `source/data/x$(…).yaml` execute on the runner (an unquoted heredoc body,
or a literal `${{ }}`, performs command substitution). No `run:` script in the
workflow contains a `${{ … }}` expression, and nothing untrusted is written to
`GITHUB_OUTPUT`.

### 34.8 Files changed

| File | Change |
| ---- | ------ |
| `source/api/feedback.js`, `api/src/Feedback.php` | Metadata sanitiser + `buildFeedbackIssue` |
| `source/build/utils.js`, `render.js`, `render-arkiv.js`, `events-today.js` | `safeLinkHref`/`safeHttp` link guard |
| `source/api/admin.js`, `api/src/Admin.php` | Digest-based constant-time token compare |
| `.env.example`, `app.js`, `api/index.php` | `SESSION_SECRET`/`TRUSTED_PROXIES` docs + weak-secret warning |
| `api/index.php`, `api/src/RateLimit.php` | Trusted-proxy IP + `flock` counter |
| `api/index.php`, `.github/workflows/deploy-reusable.yml`, `api/.gitignore` | Fail-closed time-gating + bundled `camps.yaml` |
| `.github/workflows/event-data-deploy.yml` | Real schema + security validation |
| `tests/security-hardening.test.js`, `api/tests/SecurityHardeningTest.php` | Node + PHP coverage |

---
