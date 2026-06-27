---
title: "SB Sommar – Data Contract"
---

# SB Sommar – Data Contract

This document defines the official data structure for all camp YAML files.

This contract must not change casually.
Rendering logic depends on it.

---

## 1. camps.yaml Structure

`source/data/camps.yaml` is the central registry of all camps.

```yaml
camps:
  - id: string           # stable identifier, never changes
    name: string         # display name
    start_date: YYYY-MM-DD
    end_date: YYYY-MM-DD
    opens_for_editing: YYYY-MM-DD  # first date participants can add/edit activities
    registration_opens: YYYY-MM-DD  # first date the homepage registration banner is shown
    registration_closes: YYYY-MM-DD # last date the banner is shown (inclusive)
    location: string     # place name displayed on the archive page
    file: string         # filename in source/data/ (e.g. 2026-06-syssleback.yaml)
    archived: boolean    # true once the camp has ended
    qa: boolean | null   # optional; true marks a QA-only camp (filtered out in production)
    information: string | null   # optional descriptive text shown on archive page
    link: string | null          # optional URL (e.g. Facebook group) shown on archive page
```

All fields except `information`, `link`, and `qa` are required for each
entry. `registration_opens` and `registration_closes` are conditionally
required — see §1.7. <!-- 05-§1.1 -->

The `opens_for_editing` field defines the first date on which the add-activity and
edit-activity forms are available. The submission period closes at the end of
`end_date + 1 day`. Typical default: `start_date − 7 days`. <!-- 05-§1.6 -->

The `registration_opens` and `registration_closes` fields define the inclusive
date range during which the homepage displays a banner linking to the
registration section for that camp. Both fields are required for non-archived
camps and optional for archived camps (where they are ignored). The range must
satisfy `registration_opens <= registration_closes < start_date`. <!-- 05-§1.7 -->

Rules:

- The active camp is derived at build/request time from dates — there is no
  manual `active` field. See `03-architecture/data-layer.md §2 "Metadata Layer"` for the
  derivation rules. <!-- 05-§1.2 -->
- The `file` field references a YAML file in `source/data/`. <!-- 05-§1.4 -->
- The camp `id` is permanent and must never change after the camp is first created. <!-- 05-§1.5 -->

---

## 2. Camp File Structure

Each camp file must follow this structure:

```yaml
camp:
  id: string
  name: string
  location: string
  start_date: YYYY-MM-DD
  end_date: YYYY-MM-DD

events:
  - id: string
    title: string
    date: YYYY-MM-DD
    start: "HH:MM"
    end: "HH:MM" | null
    location: string
    responsible: string
    description: string (markdown) | null
    link: string | null
    cancelled: boolean | null
    moved:
      from_date: YYYY-MM-DD
      from_start: "HH:MM"
      from_end: "HH:MM" | null
    relocated:
      from_location: string
    owner:
      name: string
      email: string
    meta:
      created_at: ISO-8601 | null
      updated_at: ISO-8601 | null
```

How to read this schema:

- `string` means a text value (e.g. `"Schack"`)
- `boolean` means `true` or `false` (no quotes)
- `YYYY-MM-DD` means a date written as `2026-06-28`
- `"HH:MM"` means a 24-hour time written as `"14:00"` (quoted)
- `ISO-8601` means a full datetime string: `2026-06-28T14:00:00`
- `| null` means the field can be omitted or set to `null`

See §7 for a complete worked example.

---

## 2.1 Event Fragment Files

A camp's events may also be stored as individual **fragment files** in a per-camp
directory, in addition to the `events:` list inside the camp file. This lets many
activities be submitted concurrently without their pull requests conflicting
(see `02-requirements/event-data.md §109` and `03-architecture/data-layer.md §1.1`).

- The fragment directory is `source/data/<stem>/`, where `<stem>` is the camp's
  `file` value without its `.yaml` extension. For `2026-06-syssleback.yaml` the
  directory is `source/data/2026-06-syssleback/`.
- Each fragment file is named `<event-id>.yaml` and contains a single top-level
  `event:` mapping with exactly the fields of one entry in the camp file's
  `events:` list:

```yaml
event:
  id: string
  title: string
  date: YYYY-MM-DD
  start: "HH:MM"
  end: "HH:MM" | null
  location: string
  responsible: string
  description: string (markdown) | null
  link: string | null
  cancelled: boolean | null
  moved:
    from_date: YYYY-MM-DD
    from_start: "HH:MM"
    from_end: "HH:MM" | null
  relocated:
    from_location: string
  owner:
    name: string
    email: string
  meta:
    created_at: ISO-8601 | null
    updated_at: ISO-8601 | null
```

- The file name without `.yaml` must equal `event.id`.
- A fragment event obeys every rule in §3–§6 exactly as an event in the camp
  file does.
- The build merges the camp file's `events:` with all of the camp's fragments
  into one event set before rendering; a fragment event is indistinguishable from
  a camp-file event in every view.
- The fragment directory is optional. A camp with no fragment directory is read
  exactly as before.

---

## 3. Required Fields

### Required in the camp file (under `camp:`) <!-- 05-§3.2 -->

- `id`
- `name`
- `location`
- `start_date`
- `end_date`

### Required for each event <!-- 05-§3.1 -->

- `id`
- `title`
- `date`
- `start`
- `end`
- `location`
- `responsible`

### Optional for each event

- `description` — markdown, parsed by `marked` (same variant as `content/*.md`). <!-- 05-§3.4 -->
- `link`
- `cancelled` — boolean. `true` marks the activity as cancelled ("inställd");
  absent, `null`, or `false` means the activity is active. A cancelled activity
  stays in the schedule, shown struck through and labelled "INSTÄLLD"
  (see `02-requirements/schedule-and-detail.md §118`). <!-- 05-§3.5 -->
- `moved` — a mapping with `from_date` (`YYYY-MM-DD`), `from_start` (`HH:MM`),
  and `from_end` (`HH:MM` or null). Present only when the activity has been
  rescheduled to a different date or time; it records the slot the activity
  occupied before its most recent reschedule. The edit API maintains this field
  automatically — it is never set by a participant. A moved activity is shown at
  its new time with the previous time struck through, and a minimal marker is
  left at the previous slot
  (see `02-requirements/schedule-and-detail.md §119`). <!-- 05-§3.6 -->
- `relocated` — a mapping with `from_location` (string). Present only when the
  activity's location has changed; it records the location the activity had
  before its most recent location change. The edit API maintains this field
  automatically — it is never set by a participant. A relocated activity is
  shown at its new location with the previous location struck through in smaller
  text, with no previous-slot marker
  (see `02-requirements/schedule-and-detail.md §119.7`). <!-- 05-§3.7 -->
- `owner`
- `meta`

The `owner` and `meta` fields are for internal use only and must never be displayed in any public view. <!-- 05-§3.3 -->

---

## 4. Date and Time Rules

- `date` must fall within the camp's `start_date` and `end_date` (inclusive). <!-- 05-§4.1 -->
- `start` must use 24-hour format: `"HH:MM"`. <!-- 05-§4.2 -->
- `end` must be `"HH:MM"`. <!-- 05-§4.4 -->
- `end` must be after `start`. Exception: if `end < start` (midnight crossing),
  the implied duration `(24 × 60 − startMinutes) + endMinutes` must not exceed
  1 020 minutes (17 hours). <!-- 05-§4.3 -->
- No timezone handling. All times are local. <!-- 05-§4.5 -->

---

## 5. Uniqueness Rule

The combination of:

```text
(title + date + start)
```

must be unique within a camp file. <!-- 05-§5.1 -->

Duplicate events are not allowed. Uniqueness is evaluated across the camp file
**and** the camp's fragment files (§2.1) together — a fragment may not duplicate
the `(title + date + start)` of any other event in the same camp. <!-- 05-§5.2 -->

---

## 6. Event ID Rules

- Must be unique within the file — and, when fragment files are used (§2.1),
  unique across the camp file and all of its fragments. <!-- 05-§6.1 -->
- Must be stable — do not change after creation. <!-- 05-§6.2 -->
- Recommended format:

```text
slug-title-YYYY-MM-DD-HHMM
```

A "slug" is a URL-friendly version of the title: lowercase letters, numbers, and hyphens only (no spaces or special characters). For example, "Middag & dans" becomes `middag-dans`.

Example ID:

```text
middag-2025-06-30-1630
```

---

## 7. Complete Example

```yaml
camp:
  id: 2025-08-syssleback
  name: SB Sommar Augusti 2025
  location: Sysslebäck
  start_date: 2025-08-03
  end_date: 2025-08-10

events:
  - id: schack-2025-08-04-1400
    title: Schack
    date: 2025-08-04
    start: "14:00"
    end: "16:00"
    location: Samlingssalen
    responsible: Anna
    description: >
      Öppet parti för alla åldrar.
      Ta med eget schackbräde om du vill.
      **Nybörjare välkomna!**
    link: null
    owner:
      name: ""
      email: ""
    meta:
      created_at: null
      updated_at: null
```

---

## 8. Stability Policy

Breaking changes to this structure require:

- An explicit version bump.
- Updated rendering logic.
- An update to this document.

Fields may be added in future versions.
Fields must not be removed without a migration plan.

This contract is the foundation of the system.
