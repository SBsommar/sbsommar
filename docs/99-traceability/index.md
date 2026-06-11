---
title: "Requirements Traceability Matrix – SB Sommar"
---

# Requirements Traceability Matrix – SB Sommar

## What is this document?

A requirements traceability matrix answers three questions for every requirement:

1. **Is it documented?** Where does the requirement come from?
2. **Is it implemented?** Which code makes it work?
3. **Is it verified?** Which test proves it works?

When a requirement has no test, it may be broken without anyone noticing.
When a requirement has no implementation, it is a gap — a feature that is missing.
This document makes those gaps visible so they can be planned and prioritised.

---

## How to read the columns

### ID

A short, stable reference you can use in issues, pull requests, and commit messages.
For example: `"this PR closes 02-§9.5"`.

The ID appears in **two places**: in this matrix (the per-family table file in this folder —
here, [02-requirements.md](./02-requirements.md)), and inline in the source document next to the
requirement text as an HTML comment. To find requirement `02-§9.5`, search for `02-§9.5` in the
matching per-family file or anywhere under `docs/02-requirements/` — it will appear on the line
that says `` `location` is present and non-empty ``.

Format: `{doc}-§{section}.{counter}`

- `02` = the document family the requirement comes from (`02-requirements/`)
- `§9` = the section number inside that family (matches the `## 9.` heading in the topic file that owns §9)
- `.5` = a sequential counter within that section (labels are added top-to-bottom)

The section prefix tells you *which document owns the requirement* and therefore where to look
if you want to read the surrounding context or open a discussion about changing it.
When adding a new requirement to a section, give it the next available number in that section
and add the `<!-- {id} -->` comment to the source doc alongside the entry in this matrix.

Examples:

- `02-§4.2` = second requirement from §4 of `02-requirements/` (lives in the topic file that owns §4)
- `05-§4.1` = first requirement from §4 of `05-DATA_CONTRACT.md`
- `CL-§5.3` = third requirement from §5 of `CLAUDE.md`

The documents requirements are drawn from:

| Prefix | Document |
| --- | --- |
| `02` | `docs/02-requirements/` — what the site must do and for whom (split across topic files; see the index for the redirect map) |
| `05` | `docs/05-DATA_CONTRACT.md` — YAML schema and validation rules |
| `07` | `docs/07-design/` — visual design, CSS tokens, accessibility |
| `CL` | `CLAUDE.md` — architectural constraints and quality requirements |

### Requirement

One sentence describing a single, testable thing the system must do.
"Single" matters — if a sentence could be split into two independently verifiable things, it should be.

### Doc Ref

This is **not** where the requirement is stated — it is where the *solution approach* is documented.
It points to the doc that tells a developer *how* to implement the requirement.

Example: the requirement "event date must fall within camp dates" comes from `02-requirements/add-edit-forms.md §9`,
but the implementation rules (date format, range check) are specified in `06-EVENT_DATA_MODEL.md §4`,
so that is the Doc Ref.

A `—` here means no implementation guidance has been written yet.
That is itself a gap worth noting.

### Test(s)

Short IDs that point to tests in the `tests/` directory.
The full mapping from ID to file and describe-suite is in the **Test ID Legend** at the bottom.

Examples:

- `VLD-04..11` = tests VLD-04 through VLD-11 in `tests/validate.test.js`
- `SNP-01` = first test in `tests/snapshot.test.js`

Tests are listed **before** Implementation to reflect the intended order of work:
write the test first, then write the code that makes it pass.

A `—` here means no automated test exists for this requirement.

### Implementation

The file(s) and function(s) in the codebase where the requirement is satisfied.
A `—` means nothing has been built yet.
Notes in parentheses explain partial or incorrect implementations.

### Status

| Value | Meaning |
| --- | --- |
| `covered` | Code exists **and** a test verifies it |
| `implemented` | Code exists, but no automated test |
| `gap` | The requirement has no implementation (and no test) |

`implemented` is not the same as `covered`. Code that is not tested may break silently.
Aim to move all `implemented` rows toward `covered` over time.

### Archived (superseded) requirements

Rows in the per-family files marked **superseded by 02-§X** describe requirements
whose prose has been moved to `docs/02-requirements/archive.md`. The IDs are kept verbatim because
they are still cited from code and from this matrix; the moved prose is preserved
there for historical context. Refer to that file for the current list of archived
ID ranges.

---

Audit date: 2026-02-24. Last updated: 2026-06-09 (signed session ownership delivered, 02-§101.1–101.13 covered/implemented).

---

## Traceability tables

The matrix is split by ID family. Each file carries the rows for one family.

| Family | Source | Rows | File |
| --- | --- | --- | --- |
| `02` | `docs/02-requirements/` | 1277 | [02-requirements](./02-requirements.md) |
| `03` | `docs/03-architecture/` | 0 | [03-architecture](./03-architecture.md) |
| `05` | `docs/05-DATA_CONTRACT.md` | 18 | [05-data-contract](./05-data-contract.md) |
| `07` | `docs/07-design/` | 91 | [07-design](./07-design.md) |
| `CL` | `CLAUDE.md` | 66 | [claude](./claude.md) |

Test IDs referenced in the `Test(s)` column are defined in the
[Test ID Legend](./test-id-legend.md).

## Summary

```text
Total requirements:            1349
Covered (implemented + tested): 708
Implemented, not tested:        641
Gap (no implementation):          0
Orphan tests (no requirement):    0

Note: §106 (Token Minting from the Web) adds 18 requirements
  (02-§106.1–106.18): 9 covered (MINT-01..15, tests/mint-token.test.js,
  plus PHPUnit MintTokenTest cross-runtime parity) and 9 implemented
  (browser/manual checkpoints for mint-UI visibility, role-driven day
  field, copy/share buttons, and fragment redemption).

Note: §105 (Early Access Role, tidig åtkomst) adds 11 requirements
  (02-§105.1–105.11): 7 covered (EARLY-01..23, tests/early-access.test.js,
  plus PHPUnit AdminTokenTest verifyPreCampBypassToken parity) and 4
  implemented (browser/manual checkpoints for edit-link suppression,
  role-aware bypass labels, ownership message, Swedish text).

Note: §104 (Security Hardening 2026-06) adds 20 requirements
  (02-§104.1–104.20), all covered by SEC-369..387 (tests/security-hardening.test.js)
  and the PHPUnit SecurityHardeningTest. Covers feedback metadata sanitisation,
  render-layer link-protocol validation, constant-time admin-token comparison,
  SESSION_SECRET documentation, trusted-proxy (right-most XFF) + flock rate
  limiting, fail-closed time-gating, the event-data PR validation gate
  (injection-safe), and HTTP security headers (CSP with build-time API-origin
  injection, nosniff, frame, referrer, permissions, HSTS).

Note: §101 (signed session ownership) adds 13 requirements:
  10 covered (SES-16..21, ADED-01..08, PSES-01..03) and 3 implemented
  (browser/manual checkpoints for JavaScript-readable cookie UI hints,
  cleanup/debug-panel behaviour).

Note: §100 (API .env outside web root) adds 11 requirements
  (02-§100.1–100.11): 7 covered (HTACC-01..06, ENVLOC-01..04) and 4
  implemented (02-§100.3/100.6 manual server checkpoints, 02-§100.9/100.10
  structural). §53.12–53.14 (persistent .env backup) are superseded by §100
  and excluded from the totals above (were covered; backup mechanism removed).

Note: Archive timeline implemented (02-§2.6, 02-§16.2, 02-§16.4, 02-§21.1–21.11).
8 of 11 new requirements are covered (ARK-01..08 tests).
§80 multi-day selection: 12 covered by tests, 12 manual (browser-only), 3 code-only.
3 are implemented but require manual/visual verification
  (02-§21.3 layout, 02-§21.5 single-open, 02-§21.7 keyboard).
02-§2.6, 02-§16.2, 02-§16.4 moved from gap to covered.
11 requirements added for archive timeline (02-§21.1–21.11), all now implemented.
13 requirements added for event data CI pipeline (02-§23.1–23.13):
  8 covered (LNT-01..18, SEC-01..13): 02-§23.1–23.8
  5 implemented (CI workflow, no unit test possible): 02-§23.9–23.13
16 requirements for unified navigation (02-§24.1–24.15, 02-§24.17):
  11 covered (NAV-01..11): 02-§24.1–24.9, 02-§24.11–24.12
  5 implemented (CSS/JS mobile/desktop, browser-only): 02-§24.10, 02-§24.13–24.15, 02-§24.17

Snapshot updated to include Arkiv nav link.
13 requirements added and implemented for edit-activity submit UX flow (02-§20.1–20.13).
02-§18.46 covered (BUILD-01..04): edit form URL derivation via editApiUrl().
02-§18.45 implemented (manual): edit form credentials: 'include' for cross-origin API.
02-§18.41 added and covered: cross-subdomain cookie domain fix (COOKIE_DOMAIN env var).
6 requirements added for shared site footer (02-§22.1–22.6): 4 covered (FTR tests), 2 implemented (convention + structural).
SES-14 and SES-15 verify Domain= is included/omitted correctly.
17 requirements added for add-activity submit UX flow (02-§19.1–19.17).
3 of these are covered (ADD-01..06 test structural HTML: 02-§19.7, 02-§19.17, and
  fieldset via ADD-02 for 02-§19.1).
14 are implemented but browser-only; cannot be unit-tested in Node.js.
3 requirements added for cookie consent UX fixes (02-§18.37–39).
02-§18.11 updated: only 'accepted' is now persisted (not 'declined').
End time is now required everywhere (add form, edit form, data contract).
02-§9.4, 05-§3.1, 05-§4.3, 02-§18.25 all moved to covered (VLD-27..32).
02-§18.40 added and implemented: ownerName crash fix.
13 requirements added and implemented for edit-activity submit UX flow (02-§20.1–20.13).
3 covered (EDIT-01, EDIT-02 partial, EDIT-04–06): §20.13, §20.1, §20.5.
10 implemented but browser-only; cannot be unit-tested in Node.js.
2 requirements added for CI checkout depth (CL-§9.5, 02-§23.14):
  both implemented (CI workflow config, no unit test possible).
4 requirements added for image loading performance (02-§25.1–25.4):
  all 4 covered (IMG-01..06 in render-index.test.js).
2 requirements added for speed-index performance fixes (02-§25.5–25.6):
  02-§25.5 covered (IMG-07): first-section images stripped of loading="lazy".
  02-§25.6 covered (snapshot + manual): nav.js defer on all pages.
  02-§25.1 updated: exception added for first-section images.
3 requirements added for search engine blocking (02-§1a.1–1a.3):
  2 covered (ROB-01..14): 02-§1a.2, 02-§1a.3
  1 implemented (build writes robots.txt; manual verification): 02-§1a.1
14 requirements added for form time-gating (02-§26.1–26.13, 05-§1.6):
  2 covered (GATE-01..10): 02-§26.2 (period logic), 02-§26.13 (data attributes).
  12 implemented (browser-only or manual): 02-§26.1, 02-§26.3–26.12, 05-§1.6.
6 requirements added for admin pre-camp bypass (02-§26.14–26.19):
  2 covered (GATE-11..16, ABYP-01..13): 02-§26.17 (pre-period admin accept),
    02-§26.18 (post-period locked for everyone).
  4 implemented (browser-only): 02-§26.14 (bypass button rendered),
    02-§26.15 (disabled state cleared on click), 02-§26.16 (bypass button
    not shown after period), 02-§26.19 (admin token in /add-event body).
1 requirement added for bypass-button placement (02-§26.20): implemented
  (browser-only manual checkpoint) — button renders on its own row below
  the locked banner, consistent across lagg-till.html and redigera.html.
6 requirements added for past-date blocking (02-§27.1–27.6):
  3 covered (PDT-03..06): 02-§27.4, 02-§27.5, 02-§27.6
  2 implemented (browser-only client validation): 02-§27.2, 02-§27.3
  1 definition (no implementation needed): 02-§27.1
19 requirements added for archive page improvements (02-§21.12–21.30):
  14 covered (ARK-09..24): header layout, FB logo, event list.
  5 implemented (browser-only or manual): responsive, active dot, visual consistency.
5 requirements added for archive cleanup and camp naming (02-§21.31–32, 02-§29.1–3):
  4 covered (ARK-06, ARK-20, ARK-25, ARK-26): 02-§21.8, 02-§21.27, 02-§21.31, 02-§21.32.
  3 implemented (data convention): 02-§29.1, 02-§29.2, 02-§29.3.
  02-§21.8 updated: date/location removed from accordion content.
  02-§21.27 updated: event rows now expandable when description/link present.
18 requirements for upcoming camps on homepage (02-§28.1–28.18):
  10 covered (UC-01..14): filtering, sorting, heading, content, data-end, indicators.
  7 implemented (browser-only or manual): past-marking, Stockholm time, CSS tokens,
    section placement, no-rebuild, minimal JS.
  1 covered: 02-§28.18 (camp name terracotta color, CL-04).
02-§6.5 moved from gap to covered (ILE-01..04, ILE-E01..E04):
  per-field inline validation errors on add and edit forms.
22 requirements added for hero section redesign (02-§30.1–30.22):
  15 covered (HERO-01..15): layout structure, title, image, social links, countdown.
  7 implemented (browser-only or manual): mobile responsive, rounded corners, icon size,
    countdown background, CSS tokens, minimal JS, image files.
Matrix cleanup (2026-02-25):
  07-§6.7 moved from gap to implemented (hamburger menu exists; see 02-§24.10–14, NAV-10, NAV-11).
  11 duplicate rows annotated with cross-references (see-also notes):
    02-§4.7→02-§2.10, 02-§11.2→02-§4.8, 02-§11.3→02-§4.8,
    CL-§1.3→CL-§2.9, CL-§3.2→CL-§2.2, CL-§4.1→CL-§2.3, CL-§5.9→05-§6.1,
    07-§9.2→02-§13.2, 07-§9.3→02-§13.3, 07-§9.4→02-§13.4, 07-§9.5→02-§13.6.
  Top Gaps list updated: item 8 consolidated with CL-§5.9; item 16 notes
    native <details> accessibility.
3 requirements added for hero visual refinements (02-§30.23–30.25):
  1 covered (HERO-16): 02-§30.24 (Discord icon image).
  2 implemented (visual/CSS, manual check): 02-§30.23 (countdown bg), 02-§30.25 (sidebar centering).
  02-§30.18 updated: background changed from rgba(245,238,223,0.7) to #FAF7EF.
  02-§30.21 updated: discord_group.webp → DiscordLogo.webp.
12 requirements added for inline camp listing and link styling (02-§31.1–31.12):
  2 covered (UC-06, UC-11): 02-§31.5, 02-§31.6.
  10 implemented (visual/CSS or manual code review): 02-§31.1–31.4, 02-§31.7–31.12.
  02-§28.9 superseded (camp listing no longer has its own heading).
  02-§28.13 superseded (information text no longer rendered).
10 data validation gaps closed (02-§10.3, 05-§1.3, 05-§4.1, 05-§4.2, 05-§4.4,
  05-§5.1, 05-§6.1, CL-§5.5, CL-§5.9, CL-§6.3) — all moved from gap to covered:
  validate.js: HH:MM format (TIME_RE), string length limits (MAX_LENGTHS),
    camp date range (campDates param). Tests: VLD-33..55.
  lint-yaml.js: unique (title+date+start) combo, active+archived conflict.
    Tests: LNT-19..23.
  app.js: passes activeCamp to validators for range checking.
16 requirements added for CI linting (02-§32.1–32.8, 02-§33.1–33.8):
  all 16 implemented (infrastructure/tooling, manual verification).
  CL-§5.1 and CL-§5.2 moved from gap to implemented.
  html-validate for HTML validation of built output.
  Stylelint with stylelint-config-standard for CSS linting.
  Both integrated into ci.yml with data-only skip condition.
14 requirements added for derived active camp (02-§34.1–34.14):
  8 covered (DAC-01..07): 02-§34.1–34.6, 02-§34.8–34.9, 02-§34.13.
  5 implemented (manual/code review): 02-§34.7, 02-§34.10–34.12, 02-§34.14.
  05-§1.2 updated: now references derivation logic instead of manual flag.
  05-§1.3 superseded: active+archived conflict is impossible without active field.
  LNT-22..23 tests removed (active+archived check removed).
  `active` field removed from camps.yaml and data contract.
4 accessibility gaps closed:
  02-§13.2 / 07-§9.2 moved from gap to covered (A11Y-01..09):
    :focus-visible rules added to all interactive elements in style.css.
  02-§13.6 / 07-§9.5 moved from gap to implemented:
    native <details>/<summary> accepted as satisfying ARIA requirement;
    archive accordion already uses explicit aria-expanded/aria-controls.
1 requirement added for compact camp list layout (02-§3.5):
  covered (CL-01..03): CSS presence tests for flex layout, no border, no display: block.
  Manual visual check: open homepage and confirm one-liner layout.
10 requirements added for location accordions on index page (02-§35.1–35.10):
  7 covered (LOC-01..10): 02-§35.3–35.9.
  3 implemented (visual/structural, manual verification): 02-§35.1, 02-§35.2, 02-§35.10.
240 new tests added across 10 test files (coverage-*.test.js):
  75 requirements moved from implemented to covered.
  Test files: coverage-index, coverage-layout, coverage-today, coverage-idag,
    coverage-add, coverage-edit, coverage-render, coverage-css,
    coverage-structural, coverage-edit-event.
  Categories: homepage, layout, display mode, today view, add/edit forms,
    schedule render, CSS design tokens, structural cross-page, edit-event API.
18 requirements added for camps.yaml validator (02-§37.1–37.18):
  17 covered (VCMP-01..32): validation, file creation, header sync.
  1 implemented (manual, npm script): 02-§37.16.
11 requirements added for marked markdown converter (02-§38.1–38.11):
  6 covered (existing RNI/IMG tests + MKD-01..05): 02-§38.1, 02-§38.4–38.7, 02-§38.10.
  5 implemented (manual/structural): 02-§38.2, 02-§38.3, 02-§38.8, 02-§38.9, 02-§38.11.
16 requirements added for zero-downtime deploy (02-§40.1–40.16):
  all 16 implemented (CI/infrastructure, manual verification only).
  Static site deploy changed from FTP to SCP + SSH swap.
  Server app deploy unchanged.
19 requirements added for environment management (02-§41.1–41.19):
  all 19 implemented (CI/infrastructure, manual verification only).
  Splits deploy into QA (auto) and Production (manual workflow_dispatch).
  Event data deploys to both environments in parallel.
  Fixes hardcoded QR code URL to use SITE_URL.
29 requirements added for QA camp isolation (02-§42.1–42.29):
  15 covered (QA-01..11, VCMP-33..36): filtering, resolution priority, field defaults.
  14 implemented (manual/infrastructure): data rename, BUILD_ENV plumbing, workflow, docs.
  Dedicated QA camp with qa: true field, filtered out in production.
  resolveActiveCamp() gains environment-aware filtering.
  BUILD_ENV plumbed through deploy workflow and API.
15 requirements added for FTP-to-SSH QA migration (02-§43.1–43.15):
  14 implemented (workflow changes, doc updates, production unchanged).
  1 gap (02-§43.14: manual QA FTP secret cleanup after validation).
  QA event data deploy switches from FTP/curl to SCP/SSH.
  Redundant FTP upload step removed from API server deploy.
4 requirements added and implemented for live form validation (02-§6.9–6.12):
  all 4 implemented (browser-only DOM events; cannot be unit-tested in Node.js).
  LVD-01..04 source-code structural checks pass (tests/live-form-validation.test.js).
  Manual checkpoint: open /lagg-till.html, select a past date → error shown immediately.
  Manual checkpoint: fill start time, change end time to before start → error shown.
  Manual checkpoint: tab through required fields without filling them → errors shown.
  Manual checkpoint: start editing a field with an error → error clears immediately.
2 requirements added and implemented for start-time cross-check and past-time hysteresis (02-§6.13–6.14):
  all 2 implemented (browser-only DOM events; cannot be unit-tested in Node.js).
  Manual checkpoint: fill end time, change start to after end → end-time error appears.
  Manual checkpoint: fill end time, change start to before end → end-time error clears.
  Manual checkpoint: pick today's date and a start time > 2 h ago → error shown.
  Manual checkpoint: pick a future date → no past-time error on start.
39 requirements added for PHP API (02-§44.1–44.39):
  35 implemented (PHP code, docs, coexistence).
  4 gaps (02-§44.28 Apache verify, 02-§44.29–30 deploy workflow, 02-§44.32 env secrets).
5 requirements added and implemented for display sidebar status widget and auto-reload (02-§4.14–4.18):
  3 covered (DIS-19..23): 02-§4.14 (no site footer), 02-§4.15 (live clock), 02-§4.16 (build time).
  2 implemented (browser/manual): 02-§4.17 (version.json polling), 02-§4.18 (midnight reload).
  Design tokens documented in 07-design/components.md §6.40–6.43.
3 requirements added and implemented for portrait layout optimisation (02-§4.19–4.21):
  2 covered (DIS-13, DIS-24, DIS-25): 02-§4.19 (date-only heading), 02-§4.20 (heading in sidebar).
  1 implemented (manual visual check): 02-§4.21 (compact event rows, flex 3:1 layout).
  Design documented in 07-design/components.md §6.44–6.48.
25 requirements added for iCal calendar export (02-§2.12–2.13, 02-§45.1–45.23):
  23 covered (ICAL-01..28, KAL-01..12, EVT-21..22, SNP-07..08).
  2 implemented (manual: build.js wiring, SITE_URL reuse).
  Architecture documented in 03-architecture/pages-and-content.md §22.
14 requirements added for iCal presentation and compliance (02-§46.1–46.15):
  12 covered (SNP-09..14, KAL-13..15, ICAL-29..31).
  1 implemented (CSS visual, manual check): 02-§46.7.
  Schedule header SVG icon, per-event iCal links, tips page card layout, DTSTAMP.
3 requirements added for heading and link color update (02-§47.1–47.3):
  2 covered (HDC-01..04): 02-§47.1 (heading colors), 02-§47.2 (link underline).
  1 implemented (manual visual check): 02-§47.3 (nav/back-links unchanged).
18 requirements added for add/edit cookie enhancements (02-§48.1–48.18):
  13 covered (CEH-P01, CEH-01..11): auto-fill, cookie paragraph, no-session, event list, edit link.
  5 implemented (browser-only, manual verification): 02-§48.6, 02-§48.10–48.12, 02-§48.15–48.16.
6 requirements added for API-layer security validation (02-§49.1–49.6):
  6 covered (ASEC-01..16): injection pattern scanning, link protocol, Node.js + PHP parity.
  Architecture documented in 03-architecture/ci-and-deploy.md §11.6.
23 requirements added for Docker-based event data CI pipeline (02-§50.1–50.24):
  22 implemented (workflow files, Dockerfile, CI config; manual verification only).
  1 gap (02-§50.22: manual FTP secret cleanup after validation).
  02-§23.1–23.10 superseded (validation moved to API layer).
  02-§23.11–23.12 superseded by 02-§50.16–50.18 (SCP post-merge).
  02-§23.13 superseded by 02-§50.11 (deploy is post-merge).
  02-§43.9–43.10 superseded by 02-§50.19–50.22 (production SCP, FTP removed).
  Architecture rewritten in 03-architecture/ci-and-deploy.md §11.
  CLAUDE.md §9.4 updated.
  08-ENVIRONMENTS.md updated: event data flow, workflows table, FTP secrets removed.
  Previous gap count corrected: 02-§44.28–30, 02-§44.32 were already covered.
10 requirements added for event-data deploy detect elimination (02-§51.1–51.10):
  8 covered (EDW-01..15): workflow structure, inline detection, QA gating.
  2 implemented (02-§51.9–51.10: supersession notes for §50.13 and §50.14).
  02-§50.13 superseded by 02-§51.2, 02-§51.5 (inline detection per job).
  02-§50.14 superseded by 02-§51.7 (inline QA check in production job).
  Architecture updated in 03-architecture/ci-and-deploy.md §11.3.
8 requirements added for setup-node replacement (02-§52.1–52.8):
  6 covered (EDW-16..28): no container, setup-node, npm ci, permissions, conditionality.
  2 implemented (02-§52.7–52.8: supersession notes).
  02-§50.1–50.7 superseded by 02-§52.1 (Docker no longer used by event-data deploy).
  02-§50.12 superseded by 02-§52.1 (setup-node + npm cache replaces Docker).
  Architecture updated in 03-architecture/ci-and-deploy.md §11.1, §11.3, §11.5.
14 requirements added for synchronous API errors and deploy safety (02-§53.1–53.14):
  10 covered (SYNC-01..06, PROG-01..04, ENV-01..03): API sync flow, progress UI, deploy backup.
  4 implemented (browser-only visual/timing, manual verification): 02-§53.7–53.10.
  API: synchronous GitHub operations, real error messages to user.
  Client: progress step list with green checkboxes during submission.
  02-§53.12–53.14 (ENV-01..03) later superseded by §100; the backup-and-restore
  mechanism and its tests (tests/deploy-env-backup.test.js) were removed.
  Deploy: persistent .env backup outside public_html.
11 requirements added for midnight-crossing events (02-§54.1–54.11):
  10 covered (VLD-56..63, LNT-24..25, LVD-07..09): server, client, lint validation.
  1 implemented (02-§54.9: browser-only clearing, manual verification).
  Events crossing midnight (e.g. 23:00→01:00) allowed if duration ≤ 17 h.
  Green info message for valid crossings; red error for invalid.
  Affects: client forms, server API, build-time YAML linter.
  Design tokens documented in 07-design/components.md §6.44a–6.44g.
  02-§6.10, 02-§6.13, 02-§9.4, 05-§4.3 updated.
5 requirements added for modal design polish (02-§55.1–55.5):
  5 covered (MDP-01..06): focus outline, border-radius, padding, alignment, animation.
  Design documented in 07-design/components.md §6.49–6.55.
13 requirements added for markdown toolbar (02-§57.1–57.13):
  9 covered (MDT-01..23): wrap, placeholder, multi-line, HTML presence, button order,
    SVG icons, aria-labels, shared file, focus-visible CSS.
  4 implemented (manual/visual): 02-§57.1 (UX), 02-§57.9 (design tokens), 02-§57.11
    (no deps), 02-§57.12 (no preview).
  Design documented in 07-design/components.md §6.56–6.63.
11 requirements added for mobile navigation improvements (02-§61.1–61.11):
  9 covered (MN-01..18): sticky nav, button design, menu panel, hierarchy,
    transition, focus outlines.
  2 implemented (manual/visual): 02-§61.6 (WCAG contrast check),
    02-§61.11 (keyboard/ARIA behaviour preserved).
  Design documented in 07-design/components.md §6.20-impl–§6.24-impl.
20 requirements added for footer versioning (02-§62.1–62.20):
  8 covered (VER-01..09, FTR-18..20): VERSION file, footer display, local/CI resolution.
  9 implemented (workflow/manual): tagging, release, CSS visual, manual bump docs.
  3 implemented (02-§62.18–62.20): QA redeploy trigger, prod version match, normal QA suffix.
  VERSION file, footer display, automatic tagging, GitHub Release on bump.
37 requirements added for site analytics (02-§63.1–63.37):
  13 covered (ANA-SH-*, ANA-DIS-01, ANA-ASYNC-01, ANA-CODE-01, ANA-NO-*,
    ANA-EVT-01..06, ANA-QR-01..03): script inclusion, tracking attrs, QR data.
  24 implemented (GoatCounter built-in, dashboard, convention, manual):
    tool choice, cookies, size, env gating, domain filter, traffic metrics,
    page views, scroll depth, QR manual process.
  GoatCounter hosted, custom events via data-goatcounter-click, QR referrer tracking.
  Architecture documented in 03-architecture/pages-and-content.md §23.
5 requirements added for main landmark element (02-§70.1–70.5):
  4 covered (MAIN-01-*, MAIN-02-*, MAIN-03-*): one <main> per page, excludes nav/footer.
  1 implemented (02-§70.4): no visual styling changes — semantic element only.
  <main> added to all 9 render files. Design documented in 07-design/imagery-and-accessibility.md §9.6.
02-§64.10–12, 02-§64.24 removed: back-to-top nav link removed.
  IDX-12, IDX-13, IDX-14, IDX-20 tests removed; IDX-21 added (absence test).
4 requirements added for section anchor ID consistency (02-§79.1–79.4):
  all 4 covered (ANC-01..04).
12 requirements added for form draft cache (02-§85.1–85.12):
  5 covered (DRAFT-01..05): 02-§85.4, 02-§85.5, 02-§85.8, 02-§85.10, 02-§85.12.
  5 implemented (browser-only): 02-§85.1, 02-§85.2, 02-§85.3, 02-§85.6, 02-§85.7, 02-§85.9.
  2 done (no implementation needed): 02-§85.11.
9 requirements added for PWA mobile/offline improvements (02-§83.26–83.34):
  Updates: 02-§83.10 (meta tag), 02-§83.15 (cache version), 02-§83.16 (pre-cache all),
    02-§83.19 (events.json caching).
  New: 02-§83.26 (maskable icon), 02-§83.27 (scheme filter), 02-§83.28 (events.json
    network-first), 02-§83.29 (offline fallback), 02-§83.30–33 (offline page),
    02-§83.34 (cache version increment).
6 requirements added for image cache-busting href and manifest references (02-§86.1–86.6):
  5 covered (CACHE-16..20): 02-§86.1–86.4, 02-§86.6.
  1 implemented (structural, no render changes): 02-§86.5.
8 requirements added for manifest metadata (02-§87.1–87.8):
  7 covered (PWA-32..37): 02-§87.1–87.6, 02-§87.8.
  1 done (no new deps): 02-§87.7.
3 requirements updated for PWA offline availability:
  02-§83.16 updated: pre-cache excludes network-dependent pages, adds /index.html.
  02-§83.19 updated: no-cache list includes /lagg-till.html, /redigera.html, /delete-event.
  02-§83.35 added: offline page must only link to pages functional offline.
  02-§83.34: cache version bumped to sb-sommar-v3.
02-§91.2 updated: token format corrected from "opaque string (e.g. UUID)"
  to `namn_uuid_epoch` with embedded expiry.
2 requirements added for admin token format (02-§91.29–91.30):
  1 covered (02-§91.29: server-side expiry rejection, ADM-09..10).
  1 implemented (02-§91.30: creation script).
§93 Node rate-limit helper replaced by `express-rate-limit` middleware:
  `source/api/rate-limit.js` and `tests/rate-limit.test.js` deleted;
  `app.js` now uses per-route `rateLimit({...})` instances with
  `trust proxy 'loopback'` and standard `Retry-After` / `RateLimit-*`
  headers. Closes CodeQL `js/missing-rate-limiting` alerts 43/44/45.
  5 rows moved from covered to implemented (manual verification replaces
  removed RL-01..05 unit tests of the now-deleted helper).
21 requirements added for the project documentation site (02-§97.1–97.21):
  Pages now enabled (status `built`, source `main` /docs); 02-§97.1–97.3
    moved from gap to implemented based on the GitHub Pages REST API.
  9 implemented — `docs/_config.yml` enables `jekyll-relative-links`;
    `docs/index.md` is the landing page; `01-CONTRIBUTORS.md` points
    readers at the docs site; no new workflows, dependencies, or
    domain config are introduced.
  2 covered (02-§97.13, 02-§97.14) — `README.md` links to the
    published site above the developer setup section and lists every
    docs/*.md file; `tests/readme-docs-link.test.js` verifies both
    (README-DOCS-01..04).
  4 + 4 new tests across `tests/docs-site-config.test.js` (DOCS-CFG-01..04)
    and `tests/readme-docs-link.test.js` (README-DOCS-01..04).
7 hidden-site requirements added for the documentation site (02-§97.15–97.21):
  6 covered, 1 implemented (the policy declaration §97.18).
  Mirrors §1a's intentionally-hidden policy: `docs/robots.txt`
  (`Disallow: /`) blocks every crawler at the docs site root, and
  `docs/_includes/head-custom.html` injects a noindex/nofollow robots
  meta into every rendered page via the Primer theme's standard hook.
  `docs/index.md` no longer links to `https://sbsommar.se`; it carries
  a project-technical reverse-discoverability banner pointing back to
  the source repo, README, and issue tracker on github.com.
  8 new tests across the same suite (DOCS-CFG-05..07, DOCS-IDX-01..05).

20 requirements delivered for the locale overview page (02-§98.1–98.20,
Session 1 of issue #332): 16 covered by unit tests (LOK-01..83),
4 implemented (§98.8 contextual links, §98.14 design-token discipline,
§98.15 mobile breakpoint, §98.20 corner cell) — all four need
manual/browser verification only. See 02-requirements/design-and-content.md §98 and
07-design/components.md §6 "Locale overview grid" for the design spec.
```

---

## Top Gaps — Prioritised Action List

### High — missing whole features

1. **`02-§2.7` / `02-§15.1`–`02-§15.14` / `02-§36.1`–`02-§36.10` — RSS feed + per-event pages** *(resolved)*
   RSS feed at `/schema.rss` and per-event detail pages at `/schema/{id}/`.
   Architecture: `03-architecture/rendering.md §17–18`. Implementation: `render-rss.js`, `render-event.js`.
   22 covered (RSS-01..12, EVT-01..18), 5 implemented (manual/CI config).

### Low — tooling, design, and accessibility gaps

2. **`CL-§5.1` / `02-§32.1`–`02-§32.8` — HTML validation in CI**
    No HTML linter is configured; invalid HTML does not fail the build.
    Requirements added in §32; implementation in progress.

3. **`CL-§5.2` / `02-§33.1`–`02-§33.8` — CSS linting in CI**
    No CSS linter is configured.
    Requirements added in §33; implementation in progress.

4. **`02-§13.2` / `07-§9.2` — Visible focus states** *(resolved)*
    `:focus-visible` rules added to all interactive elements in `style.css`:
    `outline: 2px solid var(--color-terracotta); outline-offset: 2px`.
    Form inputs retain their `:focus` border-color change and gain the outline on `:focus-visible`.

5. **`02-§13.6` / `07-§9.5` — Accordion ARIA attributes** *(resolved)*
    Native `<details>/<summary>` elements satisfy the ARIA requirement — browsers expose
    expanded/collapsed state to assistive technology without explicit attributes.
    Custom accordion components (archive timeline) already use explicit `aria-expanded`
    and `aria-controls` (ARK-04, ARK-05). Design doc updated to codify this decision.

6. **`02-§34.1`–`02-§34.14` — Derived active camp** *(resolved)*
   The `active` flag has been removed from `camps.yaml`. The active camp
   is now derived from dates at build and API time. 8 covered (DAC-01..07),
   5 implemented (manual/code review). 05-§1.3 superseded.

11 requirements added for descriptive image filenames (02-§68.1–68.11):
  8 covered (FNM-01..09): naming convention, reference integrity.
  3 implemented (manual): alt-text match, CSS selector update, no content change.
  39 of 51 image files renamed. One alt-text change: RFSBlogo → RFSB logo.
  CSS selector updated: `.content-img[alt="RFSB logo"]`.

---
