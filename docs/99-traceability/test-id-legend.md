---
title: "Test ID Legend"
---

# Test ID Legend

Part of [the traceability index](./index.md).

| ID range | File | `describe` suite |
| --- | --- | --- |
| VLD-01..03 | `tests/validate.test.js` | `validateEventRequest – body guard` |
| VLD-04..11 | `tests/validate.test.js` | `validateEventRequest – required fields` |
| VLD-12..15 | `tests/validate.test.js` | `validateEventRequest – date validation` |
| VLD-16..20 | `tests/validate.test.js` | `validateEventRequest – time ordering` |
| VLD-21..24 | `tests/validate.test.js` | `validateEventRequest – optional fields` |
| VLD-25..26 | `tests/validate.test.js` | `validateEventRequest – happy path` |
| GH-01..11 | `tests/github.test.js` | `slugify` |
| GH-12..23 | `tests/github.test.js` | `yamlScalar` |
| GH-24..38 | `tests/github.test.js` | `buildEventYaml` |
| YSEC-15..16 | `tests/github.test.js` | `buildEventYaml` (CR normalisation, 02-§102.4) |
| YSEC-17..19 | `tests/github.test.js` | `detectEventIndent` (02-§10.6, 02-§102.8) |
| YSEC-20..23 | `tests/github.test.js` | `assertEventYamlValid` (02-§102.5) |
| RND-01..03 | `tests/render.test.js` | `toDateString` |
| RND-04..09 | `tests/render.test.js` | `escapeHtml` |
| RND-10..27 | `tests/render.test.js` | `formatDate` |
| RND-28..32 | `tests/render.test.js` | `groupAndSortEvents` |
| RND-33..38 | `tests/render.test.js` | `eventExtraHtml` |
| RND-39..45 | `tests/render.test.js` | `renderEventRow` |
| RNI-01..05 | `tests/render-index.test.js` | `convertMarkdown – inline Markdown` |
| RNI-06..16 | `tests/render-index.test.js` | `convertMarkdown – block types` |
| RNI-17..21 | `tests/render-index.test.js` | `convertMarkdown – headingOffset` |
| RNI-22..28 | `tests/render-index.test.js` | `convertMarkdown – collapsible mode` |
| RNI-29..33 | `tests/render-index.test.js` | `extractHeroImage` |
| RNI-34..38 | `tests/render-index.test.js` | `extractH1` |
| IMG-01..06 | `tests/render-index.test.js` | `renderIndexPage – image loading performance` |
| SES-01..05 | `tests/session.test.js` | `parseSessionIds` |
| SES-06..09 | `tests/session.test.js` | `buildSetCookieHeader` |
| SES-10..13 | `tests/session.test.js` | `mergeOwnershipEntries` |
| SES-14..15 | `tests/session.test.js` | `buildSetCookieHeader – domain` |
| SES-16..21 | `tests/session.test.js` | `signed ownership entries` |
| ADED-01..08 | `tests/admin-edit-delete.test.js` | `edit/delete authorisation OR condition (02-§7.3, §18.31, §89.13)` |
| PSES-01..03 | `tests/php-session-ownership.test.js` | `PHP signed session ownership parity (02-§44.15, §44.17, §101)` |
| SNP-01..06 | `tests/snapshot.test.js` | `renderSchedulePage` |
| ARK-01..08 | `tests/render-arkiv.test.js` | `renderArkivPage` (original timeline tests) |
| ARK-09..24 | `tests/render-arkiv.test.js` | `renderArkivPage` (header layout, FB logo, event list) |
| NAV-01..11 | `tests/nav.test.js` | `pageNav` |
| ROB-01..07 | `tests/robots.test.js` | `meta robots noindex (02-§1a.2)` |
| ROB-08..14 | `tests/robots.test.js` | `no discoverability metadata (02-§1a.3)` |
| GATE-01..02 | `tests/time-gate.test.js` | `renderAddPage – time-gating data attributes` |
| GATE-03..04 | `tests/time-gate.test.js` | `renderEditPage – time-gating data attributes` |
| GATE-05..10 | `tests/time-gate.test.js` | `isOutsideEditingPeriod` |
| HERO-01..02 | `tests/hero.test.js` | `hero section – layout structure (02-§30.1)` |
| HERO-03..04 | `tests/hero.test.js` | `hero section – title (02-§30.3–30.5)` |
| HERO-05..06 | `tests/hero.test.js` | `hero section – image (02-§30.6–30.7)` |
| HERO-07..09 | `tests/hero.test.js` | `hero section – social links (02-§30.9–30.11)` |
| HERO-10..13 | `tests/hero.test.js` | `hero section – countdown (02-§30.13–30.17)` |
| HERO-14..15 | `tests/hero.test.js` | `hero section – links from config (02-§30.22)` |
| HERO-16 | `tests/hero.test.js` | `hero section – Discord icon image (02-§30.24)` |
| VLD-33..39 | `tests/validate.test.js` | `validateEventRequest – time format` |
| VLD-40..41 | `tests/validate.test.js` | `validateEditRequest – time format` |
| VLD-42..48 | `tests/validate.test.js` | `validateEventRequest – string length limits` |
| VLD-49 | `tests/validate.test.js` | `validateEditRequest – string length limits` |
| VLD-50..54 | `tests/validate.test.js` | `validateEventRequest – date within camp range` |
| VLD-55 | `tests/validate.test.js` | `validateEditRequest – date within camp range` |
| LNT-19..21 | `tests/lint-yaml.test.js` | `validateYaml – unique (title+date+start) combo (05-§5.1)` |
| LNT-22..23 | *(removed — active+archived check no longer exists; see 02-§34.8)* | — |
| A11Y-01..09 | `tests/accessibility.test.js` | `:focus-visible rules (02-§13.2)` |
| DAC-01..07 | `tests/resolve-active-camp.test.js` | `resolveActiveCamp` |
| LOC-01..10 | `tests/render-locations.test.js` | `renderLocationAccordions` |
| COV-01..16 | `tests/coverage-index.test.js` | Homepage render tests (02-§2.1, 02-§3.1, CL-§3.1, CL-§3.3, 02-§2.9, 02-§14.1) |
| REG-01 | `tests/registration-content.test.js` | Registration section links to external service (02-§3.6) |
| REG-02..05 | `tests/registration-content.test.js` | Participation terms documented (02-§3.7) |
| LAY-01..15 | `tests/coverage-layout.test.js` | Layout component tests (CL-§2.4, CL-§2.5, CL-§3.4, 02-§2.8, 02-§24.10) |
| DIS-01..25 | `tests/coverage-today.test.js` | Display mode view tests (02-§2.4a, 02-§2.10, 02-§4.6, 02-§4.7, 02-§4.13, 02-§17.3) |
| IDAG-01..18 | `tests/coverage-idag.test.js` | Today standard view tests (02-§2.4, 02-§4.5, 02-§4.13, 02-§14.1) |
| RADD-01..30 | `tests/coverage-add.test.js` | Add-activity form tests (02-§2.5, 02-§6.1–6.4, 02-§8.2, 02-§14.1, 02-§26.13) |
| REDT-01..28 | `tests/coverage-edit.test.js` | Edit-activity form tests (02-§2.11, 02-§18.20, 02-§18.23, 02-§18.27, 02-§18.36) |
| RDC-01..06 | `tests/coverage-render.test.js` | Schedule render tests (02-§5.3, 02-§4.8) |
| CSS-01..37 | `tests/coverage-css.test.js` | CSS design token tests (07-§2.1–2.7, 07-§3.1–3.11, 07-§4.1–4.14, 07-§6.14–6.28, 07-§7.1–7.4) |
| STR-HTML-01..06 | `tests/coverage-structural.test.js` | Static HTML output tests (CL-§1.1, CL-§1.2) |
| STR-FW-01..06 | `tests/coverage-structural.test.js` | No-framework tests (CL-§1.3, CL-§2.9) |
| STR-SPA-01..06 | `tests/coverage-structural.test.js` | Not-a-SPA tests (CL-§2.7) |
| STR-NAV-01..06 | `tests/coverage-structural.test.js` | nav.js defer tests (02-§25.6) |
| STR-JSON-01..02 | `tests/coverage-structural.test.js` | events.json public fields (02-§18.29, 05-§3.3) |
| STR-EID-01..05 | `tests/coverage-structural.test.js` | data-event-id attributes (02-§18.18) |
| STR-TZ-01..06 | `tests/coverage-structural.test.js` | No timezone references (05-§4.5) |
| EEC-01..03 | `tests/coverage-edit-event.test.js` | Event ID stability (05-§6.2) |
| EEC-04 | `tests/coverage-edit-event.test.js` | meta.created_at preserved (02-§18.35) |
| EEC-05..08 | `tests/coverage-edit-event.test.js` | addOneDay date arithmetic |
| EEC-09..13 | `tests/coverage-edit-event.test.js` | isOutsideEditingPeriod time-gate logic |
| EEC-14..17 | `tests/coverage-edit-event.test.js` | mergeOwnershipEntries session cookie deduplication |
| EEC-18..26 | `tests/coverage-edit-event.test.js` | Session cookie properties (02-§18.4, 02-§18.5, 02-§18.7, 02-§18.41) |
| VCMP-01..08 | `tests/validate-camps.test.js` | `validateCamps – required fields (02-§37.1)` |
| VCMP-09..12 | `tests/validate-camps.test.js` | `validateCamps – date format (02-§37.2)` |
| VCMP-13..14 | `tests/validate-camps.test.js` | `validateCamps – date ordering (02-§37.3)` |
| VCMP-15..16 | `tests/validate-camps.test.js` | `validateCamps – archived type (02-§37.4)` |
| VCMP-17 | `tests/validate-camps.test.js` | `validateCamps – unique ids (02-§37.5)` |
| VCMP-18 | `tests/validate-camps.test.js` | `validateCamps – unique file values (02-§37.6)` |
| VCMP-19..20 | `tests/validate-camps.test.js` | `validateCamps – exit behaviour (02-§37.7)` |
| VCMP-21..24 | `tests/validate-camps.test.js` | `validateCamps – file creation and field order (02-§37.8–37.11)` |
| VCMP-25..27 | `tests/validate-camps.test.js` | `validateCamps – camp header sync (02-§37.12–37.15)` |
| VCMP-28 | `tests/validate-camps.test.js` | `validateCamps – logging (02-§37.17)` |
| VCMP-29 | `tests/validate-camps.test.js` | `validateCamps – module API (02-§37.18)` |
| VCMP-30..32 | `tests/validate-camps.test.js` | `validateCamps – edge cases` |
| VCMP-33..36 | `tests/validate-camps.test.js` | `validateCamps – qa field (02-§42.27)` |
| QA-01..03 | `tests/qa-camp.test.js` | `resolveActiveCamp – production filtering (02-§42.11)` |
| QA-04..06 | `tests/qa-camp.test.js` | `resolveActiveCamp – QA priority (02-§42.14)` |
| QA-07..08 | `tests/qa-camp.test.js` | `resolveActiveCamp – no environment (02-§42.25)` |
| QA-09..10 | `tests/qa-camp.test.js` | `resolveActiveCamp – qa field defaults (02-§42.2)` |
| QA-11 | `tests/qa-camp.test.js` | `resolveActiveCamp – edge cases` |
| MKD-01..05 | `tests/render-index.test.js` | `convertMarkdown – standard markdown features (02-§38.7)` |
| LVD-01..06 | `tests/live-form-validation.test.js` | live form validation source checks (02-§6.9–6.14) |
| ICAL-01..05 | `tests/render-ical.test.js` | `escapeIcal (02-§45)` |
| ICAL-06..20 | `tests/render-ical.test.js` | `renderEventIcal – per-event .ics (02-§45.2–45.6)` |
| ICAL-21..27 | `tests/render-ical.test.js` | `renderIcalFeed – full-camp .ics (02-§45.10–45.12)` |
| ICAL-28 | `tests/render-ical.test.js` | `render-ical.js source (02-§45.7)` |
| KAL-01..12 | `tests/render-kalender.test.js` | `renderKalenderPage (02-§45.15–45.19)` |
| EVT-21..22 | `tests/render-event.test.js` | `renderEventPage (02-§45.8–45.9)` |
| SNP-07..08 | `tests/snapshot.test.js` | `renderSchedulePage (02-§45.13–45.14)` |
| SNP-09..14 | `tests/snapshot.test.js` | `renderSchedulePage (02-§46.1–46.9)` |
| KAL-13..15 | `tests/render-kalender.test.js` | `renderKalenderPage (02-§46.11–46.13)` |
| ICAL-29..31 | `tests/render-ical.test.js` | `DTSTAMP in VEVENT (02-§46.14–46.15)` |
| HDC-01..04 | `tests/coverage-css.test.js` | `Heading and link colors (02-§47.1–47.2)` |
| CEH-P01 | `tests/cookie-enhancements.test.js` | `Cookie paragraph in add form (02-§48.4)` |
| CEH-01..02 | `tests/cookie-enhancements.test.js` | `Edit page no-cookie state (02-§48.8–48.9)` |
| CEH-03..04 | `tests/cookie-enhancements.test.js` | `Event list container on edit page (02-§48.13–48.14)` |
| CEH-05 | `tests/cookie-enhancements.test.js` | `Event list visible during edit (02-§48.18)` |
| CEH-06..07 | `tests/cookie-enhancements.test.js` | `Auto-fill responsible person (02-§48.1–48.3)` |
| CEH-08..09 | `tests/cookie-enhancements.test.js` | `Dynamic cookie paragraph swap (02-§48.5)` |
| CEH-10..11 | `tests/cookie-enhancements.test.js` | `Edit page handles missing id param (02-§48.10)` |
| ASEC-01..07 | `tests/validate.test.js` | `validateEventRequest – injection pattern scanning (02-§49.1–49.2)` |
| ASEC-08..10 | `tests/validate.test.js` | `validateEventRequest – link protocol validation (02-§49.4)` |
| ASEC-11..14 | `tests/validate.test.js` | `validateEditRequest – injection scanning (02-§49.1–49.2)` |
| ASEC-15..16 | `tests/validate.test.js` | `validateEditRequest – link protocol validation (02-§49.4)` |
| YSEC-01..09 | `tests/validate.test.js` | `validateEventRequest – control characters in single-line fields (02-§102)` |
| YSEC-10..12 | `tests/validate.test.js` | `validateEventRequest – description multi-line handling (02-§102.3)` |
| YSEC-13..14 | `tests/validate.test.js` | `validateEditRequest – control characters in single-line fields (02-§102)` |
| EDW-01 | `tests/event-deploy-workflow.test.js` | `02-§51.1 — No separate detect job` |
| EDW-02..04 | `tests/event-deploy-workflow.test.js` | `02-§51.3 — Deploy jobs have no inter-job dependencies` |
| EDW-05..07 | `tests/event-deploy-workflow.test.js` | `02-§51.4 — Checkout with fetch-depth: 2` |
| EDW-08..10 | `tests/event-deploy-workflow.test.js` | `02-§51.2/51.5 — Inline event-data detection per job` |
| EDW-11..13 | `tests/event-deploy-workflow.test.js` | `02-§51.6 — Build step gated on detection output` |
| EDW-14..15 | `tests/event-deploy-workflow.test.js` | `02-§51.7/51.8 — Production QA camp gating` |
| EDW-16..18 | `tests/event-deploy-workflow.test.js` | `02-§52.3 — No Docker container in any job` |
| EDW-19..21 | `tests/event-deploy-workflow.test.js` | `02-§52.1 — Each deploy job uses setup-node` |
| EDW-22..24 | `tests/event-deploy-workflow.test.js` | `02-§52.2 — Each deploy job runs npm ci --omit=dev` |
| EDW-25 | `tests/event-deploy-workflow.test.js` | `02-§52.4 — No packages:read permission` |
| EDW-26..28 | `tests/event-deploy-workflow.test.js` | `02-§52.5/52.6 — setup-node conditionality` |
| SYNC-01..02 | `tests/api-sync-errors.test.js` | `02-§53.5 — flushToClient and ob_start removed` |
| SYNC-03..04 | `tests/api-sync-errors.test.js` | `02-§53.1/53.2 — GitHub operation before response` |
| SYNC-05..06 | `tests/api-sync-errors.test.js` | `02-§53.3/53.4 — Error response on GitHub failure` |
| HTACC-01..03 | `tests/htaccess-security.test.js` | `02-§100.4 — api/.htaccess denies dotfiles (2.4 + 2.2), before rewrite` |
| HTACC-04 | `tests/htaccess-security.test.js` | `02-§100.5 — source/static/.htaccess denies .env (2.4 + 2.2)` |
| HTACC-05..06 | `tests/htaccess-security.test.js` | `02-§100.2 — index.php loads .env from dirname(__DIR__, 2)` |
| ENVLOC-01..02 | `tests/deploy-env-location.test.js` | `02-§100.1/100.7 — no .env written into the web root` |
| ENVLOC-03 | `tests/deploy-env-location.test.js` | `02-§100.8 — legacy .env migrated to $DEPLOY_DIR/.env` |
| ENVLOC-04 | `tests/deploy-env-location.test.js` | `02-§100.11 — backup-and-restore mechanism removed` |
| PROG-01..02 | `tests/submit-progress.test.js` | `02-§53.6 — Progress stage messages` |
| PROG-03..04 | `tests/submit-progress.test.js` | `02-§53.11 — Progress in both forms` |
| BUILD-QA-01 | `tests/build-qa-filter.test.js` | `build.js QA camp filtering (02-§42.13, 02-§42.30)` |
| QSEAS-01..05 | `tests/qa-camp-seasonal.test.js` | `camps.yaml – seasonal QA camp model (02-§42.31–42.34)` |
| DG-HINT-01..04 | `tests/render-add.test.js` | `renderAddPage – static multi-day date hint (02-§80.28–80.30); renderEditPage – does not render the multi-day hint (02-§80.30)` |
| VLD-56..61 | `tests/validate.test.js` | `validateEventRequest – midnight crossing (02-§54.1–54.5)` |
| VLD-62..63 | `tests/validate.test.js` | `validateEditRequest – midnight crossing (02-§54.10)` |
| LNT-24..25 | `tests/lint-yaml.test.js` | `validateYaml – midnight crossing (05-§4.3)` |
| LVD-07..09 | `tests/live-form-validation.test.js` | `midnight crossing source checks (02-§54.1, 02-§54.6)` |
| MDP-01..06 | `tests/coverage-css.test.js` | `02-§55.1–55.5 — Modal design polish` |
| MKD-D01..15, MKD-D25..30 | `tests/markdown.test.js` | `renderDescriptionHtml (02-§56.1, 02-§56.6, 02-§56.7)` (incl. nested-attack, whitespace, tel-hyphens, case-insensitive scheme, raw-HTML drop, image-src neutralization) |
| MKD-D16..24 | `tests/markdown.test.js` | `stripMarkdown (02-§56.4, 02-§56.5)` |
| EVT-23..25 | `tests/render-event.test.js` | `renderEventPage – markdown description (02-§56.1, 02-§56.6, 02-§56.7)` |
| RSS-16 | `tests/render-rss.test.js` | `renderRssFeed – markdown stripped (02-§56.4)` |
| ICAL-32..33 | `tests/render-ical.test.js` | `iCal DESCRIPTION markdown stripped (02-§56.5)` |
| DIS-26..27 | `tests/coverage-today.test.js` | `Today view pre-rendered descriptionHtml (02-§56.3)` |
| IDAG-19 | `tests/coverage-idag.test.js` | `Idag page pre-rendered descriptionHtml (02-§56.3)` |
| MKD-CSS-01 | `tests/coverage-css.test.js` | `02-§56.8 — .event-description p italic removed` |
| MDT-01..06 | `tests/markdown-toolbar.test.js` | `02-§57.2 — Toolbar wraps selected text` |
| MDT-07..12 | `tests/markdown-toolbar.test.js` | `02-§57.3 — Toolbar inserts placeholder when no selection` |
| MDT-13..15 | `tests/markdown-toolbar.test.js` | `02-§57.4 — Prefix applied per line for multi-line selections` |
| MDT-16..17 | `tests/markdown-toolbar.test.js` | `02-§57.5 — Toolbar in both forms` |
| MDT-18 | `tests/markdown-toolbar.test.js` | `02-§57.6 — Button order` |
| MDT-19 | `tests/markdown-toolbar.test.js` | `02-§57.7 — Inline SVG icons` |
| MDT-20 | `tests/markdown-toolbar.test.js` | `02-§57.8 — Accessible aria-label` |
| MDT-21..22 | `tests/markdown-toolbar.test.js` | `02-§57.10 — Shared markdown-toolbar.js` |
| MDT-23 | `tests/markdown-toolbar.test.js` | `02-§57.13 — Focus indicator` |
| DOCS-NAV-01..04 | `tests/docs-nav.test.js` | `docs-nav.yml — single source for within-family navigation (02-§97.28, 02-§97.29)` |
| DOCS-NAV-05 | `tests/docs-nav.test.js` | `docs front-matter — every page carries a title (02-§97.25)` |
| PHARN-01..09 | `tests/php-harness.test.js` | PHP harness wiring: Composer, PHPUnit, CI, Node-only hook (02-§103) |
| (PHPUnit) | `api/tests/ValidateTest.php` | PHP mirror of `validate.test.js`, run via `composer test` (02-§103.4) |
| (PHPUnit) | `api/tests/GitHubTest.php` | PHP mirror of `github.test.js`, run via `composer test` (02-§103.4) |
| SEC-369-01..05 | `tests/security-hardening.test.js` | Event-data PR workflow: real validation, archived scope, script-injection-safe (02-§104.15, 02-§104.16, 02-§104.20) |
| SEC-370-01..03 | `tests/security-hardening.test.js` | PHP time-gating fails closed; bundled camps.yaml (02-§104.13, 02-§104.14) |
| SEC-371-01..03 | `tests/security-hardening.test.js` | PHP rate-limit trusted-proxy IP (right-most XFF) + `flock` counter (02-§104.10, 02-§104.11) |
| SEC-383-01..05 | `tests/security-hardening.test.js` | Feedback metadata sanitisation (02-§104.1–104.3) |
| SEC-384-01..03 | `tests/security-hardening.test.js` | HTTP security headers + CSP API-origin injection (02-§104.17–104.19) |
| SEC-385-01..05 | `tests/security-hardening.test.js` | Link protocol validation in the render layer (02-§104.4, 02-§104.5) |
| SEC-386-01..03 | `tests/security-hardening.test.js` | Constant-time admin-token comparison (02-§104.6, 02-§104.7) |
| SEC-387-01..02 | `tests/security-hardening.test.js` | SESSION_SECRET / TRUSTED_PROXIES documented; weak-secret warning (02-§104.8, 02-§104.9) |
| (PHPUnit) | `api/tests/SecurityHardeningTest.php` | PHP coverage of feedback sanitiser, constant-time token, rate-limit counter (02-§104) |
| TOK-01..22 | `tests/admin-token.test.js` | HMAC token model: sign/verify/role gating, embedded expiry, cross-runtime vector (02-§91) |
| ABYP-01..13 | `tests/admin-time-gate-bypass.test.js` | Admin bypass of the pre-camp schedule lock (02-§26.14–26.19) |
| EARLY-01..23 | `tests/early-access.test.js` | Early access role: pre-camp bypass, ownership exclusion, CLI, role wiring (02-§105) |
| (PHPUnit) | `api/tests/AdminTokenTest.php` | PHP mirror of the token model incl. `verifyPreCampBypassToken` (02-§91, 02-§105) |
| MINT-01..15 | `tests/mint-token.test.js` | Web token minting: sanitiser, mintRequest, superadmin gate, route/UI wiring (02-§106) |
| (PHPUnit) | `api/tests/MintTokenTest.php` | PHP mirror of `mintRequest` with the same fixed inputs (02-§106) |
