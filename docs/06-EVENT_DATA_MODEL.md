---
title: "SB Sommar – Event Data Model"
---

# SB Sommar – Event Data Model

This document explains *why* the event data is structured the way it is — the reasoning, the future-proofing decisions, and the design intent.

It applies to all camps (lägerveckor).

For the authoritative field list, required fields, and validation rules, see [05-DATA_CONTRACT.md](05-DATA_CONTRACT.md). Read that first if you need to know what fields exist. Read this if you need to understand why.

---

## 1. File Strategy

One YAML file per camp.

Location: `source/data/`

Examples:

- `source/data/2025-06-syssleback.yaml`
- `source/data/2025-08-syssleback.yaml`
- `source/data/2026-06-syssleback.yaml`

Each file is self-contained and independent.

### 1.1 Why events can also live in fragment files

The camp file is the long-term home for a camp's events, but it is a poor target
for *concurrent* writes. Participants submit activities in bursts, and every
submission used to append to the end of the same file. Two submissions branched
from the same `main` then produced overlapping "append at end" diffs: the first
merged, the rest became textually conflicting, and — because the merge queue
cannot resolve text conflicts — they stuck open forever (the failure described in
issue #461).

The fix is to give each submitted event its own file. A submission writes a new
fragment `source/data/<stem>/<event-id>.yaml` instead of editing the shared file,
so two submissions never touch the same bytes and their pull requests can never
conflict. This is a deliberate trade: the camp file stops being the *single*
physical file for a camp's events, but it remains the single *logical* source —
the build merges the camp file and its fragments into one event set, and a
periodic compaction step folds fragments back into the camp file so the file
strategy above stays true over the long term.

The authoritative layout and rules are in
[05-DATA_CONTRACT.md §2.1](05-DATA_CONTRACT.md) and
[03-architecture/data-layer.md §1.1](03-architecture/data-layer.md).

---

## 2. Camp Structure

Each file must contain:

- Camp metadata
- Events list

Nothing else.

---

## 3. Camp Metadata

Required fields (authoritative list in [05-DATA_CONTRACT.md](05-DATA_CONTRACT.md)):

- `id`
- `name`
- `location`
- `start_date`
- `end_date`

Example:

```yaml
camp:
  id: 2025-08-syssleback
  name: SB Sommar Augusti 2025
  location: Sysslebäck
  start_date: 2025-08-03
  end_date: 2025-08-10
```

Dates must use ISO format (`YYYY-MM-DD`).

The camp `id` must remain stable permanently. It is used in archives and must never change after creation.

---

## 4. Event Structure

Required and optional fields are defined in [05-DATA_CONTRACT.md](05-DATA_CONTRACT.md).

Dates must use ISO format (`YYYY-MM-DD`). Times must use 24-hour format (`HH:MM`).

Event IDs must be unique within the file. The recommended ID format (`slug-title-YYYY-MM-DD-HHMM`) naturally produces globally unique IDs, which is the preferred outcome.

Events must be chronologically sortable by `date` + `start`.

---

## 4a. Cancellation Status

An activity that has been arranged but will not happen is marked cancelled
rather than removed. The optional `cancelled` boolean carries this state:
`true` means cancelled, and an absent field, `null`, or `false` means active.

The state is a flag rather than a deletion for two reasons. First, a
participant who was expecting the activity should see that it is off, not find
it silently gone — so a cancelled activity stays in the schedule, struck
through and labelled "INSTÄLLD". Second, the flag keeps the event's `id`
(derived from title + date + start) stable: cancelling rewrites no field that
the id depends on, so links, the fragment file name, and the cookie ownership
record all keep working.

Because the flag is optional and defaults to active, every existing event
without it is read exactly as before. The same flag drives every view built
from the event data — schedule, today, per-event page, RSS, and iCal — so a
cancellation is consistent everywhere instead of being re-derived per view.

---

## 5. Ownership (Future-Proofing)

Ownership is not yet active functionality, but must be structurally supported from the beginning.

Each event contains an `owner` object:

```yaml
owner:
  name: ""
  email: ""
```

Initial state:

- Fields may be empty strings.
- Email is not yet used.
- Email is not publicly displayed.
- Participant edit/delete ownership is carried by the signed `sb_session`
  cookie, not by the public event YAML.

This structure allows future:

- Token-based editing links
- Week-based session validation
- Optional server-side ownership records

The YAML `owner` object remains internal metadata and is not used as public
authorization state.

---

## 6. Metadata (System Fields)

Each event contains a `meta` object:

```yaml
meta:
  created_at: null
  updated_at: null
  location_set_at: null
```

`created_at` and `updated_at` track when the activity was first written and last
edited. `location_set_at` tracks when its location was last set to its current
room — stamped on creation and renewed only when an edit changes the location. It
exists so the location-clash logic can mark the activity that *chose the room
later*, rather than the one merely created later: an activity moved into an
already-booked room should be the one flagged. It is a separate field from
`updated_at` because any edit (a typo fix, a description tweak) bumps
`updated_at`, which would otherwise make an untouched booking look like the later
room-chooser.

Format when populated: ISO datetime — `YYYY-MM-DDTHH:MM:SS`

Initial state:

- Fields may be `null`.
- Not required.
- Not publicly displayed.

Meta is for system integrity only.

For a complete YAML example showing all fields together, see [05-DATA_CONTRACT.md §7](05-DATA_CONTRACT.md).

---

## 7. Stability Rules

The data model must:

- Remain stable across years
- Be readable by humans
- Be deterministic
- Be future-compatible
- Avoid breaking structural changes

Fields may be added in future versions. Fields must not be removed without a migration plan.

---

## 8. Core Principle

Event data is infrastructure.

It must survive:

- Design changes
- Generator changes
- Build changes
- AI regeneration

Structure first. Function later. Presentation never.
