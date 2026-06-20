# Security Assessment — SB Sommar (2026-06-10)

Security review of the SB Sommar static site, its PHP/Node form API, the build
pipeline, and the deployed QA site (`qa.sbsommar.se`). The focus is the
application code generated for this project: the event-submission API, the
feedback channel, the admin-token flow, session/ownership handling, and how
user-submitted data reaches rendered HTML.

This is a point-in-time review. It is broad, not exhaustive; it did not include
live penetration testing of the running QA host.

> **Status (2026-06-10):** All five new findings (N1–N5) and the three
> already-tracked findings (#369–#371) are fixed on
> `claude/security-hardening-assessment-rqnanu`, with Node + PHP unit tests
> and structural checks. Live HTTP-header verification on QA (N2) remains a
> manual checkpoint after deploy.

---

## Method and scope

Reviewed:

- PHP API: `api/index.php`, `api/src/*.php` (GitHub, Validate, Admin, Session,
  RateLimit, Feedback, TimeGate, ActiveCamp).
- Node API: `app.js`, `source/api/*.js`.
- Build/render pipeline: `source/build/*.js`, including the Markdown sanitiser
  (`source/assets/js/client/markdown-renderers.js`).
- Client JS that injects HTML (`source/assets/js/client/*.js`).
- Web-server config: `api/.htaccess`, `source/static/.htaccess`.
- CI/deploy workflows: `.github/workflows/*.yml`.
- Secret handling: `.env.example`, deploy `.env` relocation (§100).

Threat model: anonymous internet clients submitting to the public API; data
reaching `events.json` either through the API or through manually edited /
legacy camp YAML; maintainers reading auto-created GitHub issues.

---

## Summary of findings

| # | Finding | Severity | Issue |
|---|---------|----------|-------|
| N1 | Feedback metadata (`url`, `viewport`, `userAgent`, `timestamp`) embedded in GitHub-issue Markdown without sanitisation or length limit | Medium | [#383](https://github.com/SBsommar/sbsommar/issues/383) |
| N2 | No HTTP security headers (CSP, nosniff, frame-ancestors, Referrer-Policy, Permissions-Policy, HSTS) | Medium | [#384](https://github.com/SBsommar/sbsommar/issues/384) |
| N3 | Event `link` field rendered without URL-protocol validation (build + client) | Low | [#385](https://github.com/SBsommar/sbsommar/issues/385) |
| N4 | Admin-token comparison short-circuits on length, not fully constant-time (vs §91.8) | Low | [#386](https://github.com/SBsommar/sbsommar/issues/386) |
| N5 | `SESSION_SECRET` undocumented in `.env.example`; no strength guidance (weak value → ownership-HMAC forgery) | Low | [#387](https://github.com/SBsommar/sbsommar/issues/387) |

Already tracked (not re-filed):

| # | Finding | Issue |
|---|---------|-------|
| T1 | PHP rate limiting trusts spoofable `X-Forwarded-For`; state file written without locking | [#371](https://github.com/SBsommar/sbsommar/issues/371) |
| T2 | PHP time-gating fails *open* when camp metadata is unavailable | [#370](https://github.com/SBsommar/sbsommar/issues/370) |
| T3 | Event-data PR workflow runs no real validation; misses `event-delete/` prefix | [#369](https://github.com/SBsommar/sbsommar/issues/369) |

---

## New findings (detail)

### N1 — Unsanitised feedback metadata in GitHub issues — Medium

`createFeedbackIssue` (`source/api/feedback.js`) and `Feedback::createIssue`
(`api/src/Feedback.php`) interpolate the client-supplied `url`, `viewport`,
`userAgent` and `timestamp` straight into the issue's Markdown table. These four
fields are not run through the injection-pattern scan that `title`/`description`/
`name` get (contradicting §73.12), and none of them is length-limited. A client
can therefore inject `|`, newlines, or arbitrary Markdown to break the table or
smuggle misleading content into an issue a maintainer reads, or send a very
large payload (within the 5/hour limit). See [#383](https://github.com/SBsommar/sbsommar/issues/383).

### N2 — Missing HTTP security headers — Medium

`source/static/.htaccess` sets only cache headers. There is no
`Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options` /
`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`, or HSTS anywhere in
the repo. The site renders user-submitted content as HTML and relies on a
blocklist + Markdown sanitiser as its only XSS defence; a CSP would be an
independent second layer. See [#384](https://github.com/SBsommar/sbsommar/issues/384).

### N3 — `link` field rendered without protocol validation — Low

`escapeHtml`/`esc` neutralise `" < > &` but not the URI scheme, so a
`javascript:`/`data:` value in an event's `link` field survives into a clickable
`href` in `render.js`, `render-arkiv.js`, and `events-today.js`. The protocol is
checked only at API submission and in the CI scanner — but per #369 the
event-data PR validation is effectively a no-op, and manually edited / legacy
YAML never passes the API. The Markdown sanitiser already guards `description`
links via `isUnsafeUri()`; the standalone `link` field should get the same
treatment. See [#385](https://github.com/SBsommar/sbsommar/issues/385).

### N4 — Admin-token comparison not fully constant-time — Low

`verifyAdminToken` guards with `strlen($candidate) === strlen($valid)` before
`hash_equals`, leaking length via timing. §91.8 explicitly promises constant-time
comparison. Real-world exploitability is negligible (UUID-bearing tokens), but
the code deviates from its own requirement. See [#386](https://github.com/SBsommar/sbsommar/issues/386).

### N5 — `SESSION_SECRET` undocumented, no strength requirement — Low

Activity ownership (edit/delete authorisation) rests on an HMAC-SHA256 signature
keyed by `SESSION_SECRET`. The variable is absent from `.env.example` and has no
documented strength requirement. An empty value fails closed (good), but a weak
*set* value would let an attacker forge ownership cookies and edit/delete other
people's activities. See [#387](https://github.com/SBsommar/sbsommar/issues/387).

---

## Reviewed and found sound (positive notes)

- **Stored XSS via Markdown description**: the shared sanitising renderer drops
  *all* raw HTML and filters `javascript:`/`vbscript:`/`data:`/`file:` URIs on
  both link and image tokens, after stripping whitespace and control chars —
  a robust boundary.
- **Output encoding**: build render code consistently `escapeHtml`s `title`,
  `location`, `responsible`, ids, dates, and times, so the injection blocklist
  is defence-in-depth rather than the sole protection for those fields.
- **Ownership model**: edit/delete authorisation uses HMAC-signed,
  server-verified session entries (`parseVerifiedSessionIds`); the unsigned
  `parseSessionIds` is not used for authorisation. Cookie is `Secure;
  SameSite=Strict`, mitigating CSRF; admin token is kept out of cookies.
- **YAML integrity**: control-character rejection (§102), whole-document
  re-parse before any PR, and `Yaml::dump`-based edit/delete serialisation
  prevent structural YAML smuggling from form input.
- **Secret-at-rest**: API `.env` lives outside the web root; both `.htaccess`
  files deny dotfiles/`.env`; the deploy archive excludes `.env`.
- **Workflow permissions**: `ci.yml` and `deploy-reusable.yml` both declare
  `permissions: contents: read` (§39).
- **No SSRF**: GitHub API host is hardcoded to `api.github.com`; requests carry
  a 30s timeout (PHP).
- **Slugify ReDoS**: linear-time leading/trailing-dash trim (§95).

---

## Recommended remediation order

1. **#384** (security headers) — broad, cheap, protects everything else.
2. **#383** (feedback metadata) — directly client-controlled, reaches maintainers.
3. **#385** (link protocol) — closes the output-layer XSS gap; pairs with #369.
4. **#387** / **#386** — low-severity hygiene; fold into the next API pass.

Next step (per the task): fix all of the above plus the already-open
#369–#371.
