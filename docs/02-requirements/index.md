---
title: "SB Sommar – Requirements"
---

# SB Sommar – Requirements

This document defines what the site must do and for whom.

Architecture, data design, and rendering logic are downstream of these requirements. Read this before reading any other technical document.

Requirements are split across topic files for readability. Section IDs (`02-§N.M`) are stable strings cited from source code, tests, and `99-traceability/` — the ID does not encode the file path, so a section can be moved between files without breaking references.

---

## Contents

Sections §1 and §1a (audiences, crawler policy) are kept here because they frame every other requirement. The remaining sections live in topic files:

| File | Topic | Sections |
| ---- | ----- | -------- |
| [`pages-navigation.md`](./pages-navigation.md) | Pages and Navigation | §2, §3, §11, §17, §22, §24, §35, §61, §70, §71, §72, §74, §75, §79 |
| [`schedule-and-detail.md`](./schedule-and-detail.md) | Schedule and Activity Detail | §4, §5, §15, §36, §45, §46, §56, §59 |
| [`add-edit-forms.md`](./add-edit-forms.md) | Add and Edit Forms | §6, §7, §8, §9, §10, §19, §20, §26, §27, §48, §53, §54, §57, §58, §80, §81, §82, §85, §89, §90, §99, §101 |
| [`event-data.md`](./event-data.md) | Event Data | §16, §18, §21, §28, §29, §34, §37, §42, §107 |
| [`build-deploy.md`](./build-deploy.md) | Build and Deploy | §23, §32, §33, §40, §41, §43, §44, §50, §51, §52, §60, §62, §97, §103, §108 |
| [`caching-performance.md`](./caching-performance.md) | Caching and Performance | §25, §38, §65, §66, §67, §68, §69, §77, §78, §86 |
| [`platform-security.md`](./platform-security.md) | Platform and Security | §12, §13, §14, §39, §49, §63, §73, §83, §84, §87, §88, §91, §92, §93, §95, §96, §100, §102, §104, §105, §106 |
| [`design-and-content.md`](./design-and-content.md) | Design and Content | §30, §31, §47, §55, §64, §94, §98 |
| [`archive.md`](./archive.md) | Archived Requirements | (superseded sections) |

Looking for `02-§N`? Search this directory: `grep -l '## N\.' docs/02-requirements/*.md` finds the file that owns the section.

---

## 1. Who Uses This Site

Three distinct audiences:

**Prospective families (year-round)**
Families considering attending the camp. They arrive not knowing what SB Sommar is.
They need enough information to understand the camp, decide whether it is right for
their child, and take the next step (register or contact). This is the primary
audience for the public site.

**Participants during camp week**
Families and young people who are already at the camp. They use the site to view the
activity schedule, find out what is happening today, and add their own activities.
Speed and mobile usability matter most here.

**Administrators**
Staff who manage the camp data — creating and archiving camps, correcting events,
managing location lists. Bulk data editing is done directly in YAML files.
A lightweight admin token mechanism allows designated administrators to edit
and delete any event through the site's existing UI (see §91).

---

## 1a. Search Engine and Crawler Policy

This site must not be indexed by search engines or crawlers. It is intentionally
hidden — discoverable only by direct link.

- The build must generate a `robots.txt` file at the site root that disallows all
  user agents from all paths. <!-- 02-§1a.1 -->
- Every HTML page must include a `<meta name="robots" content="noindex, nofollow">`
  tag in the `<head>` section. <!-- 02-§1a.2 -->
- No sitemap, Open Graph tags, or other discoverability metadata may be added
  to any page. PWA metadata (`<link rel="manifest">`, `<meta name="theme-color">`,
  Apple touch-icon tags) is not considered discoverability metadata — it controls
  app installation behavior, not search engine visibility. <!-- 02-§1a.3 -->

---
