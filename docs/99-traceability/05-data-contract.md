---
title: "Traceability — 05-data-contract"
---

# Traceability — 05-data-contract

Part of [the traceability index](./index.md).

| ID | Requirement | Doc Ref | Test(s) | Implementation | Status |
| --- | --- | --- | --- | --- | --- |
| `05-§1.1` | Each `camps.yaml` entry includes all required fields: `id`, `name`, `start_date`, `end_date`, `file`, `active`, `archived` | 06-EVENT_DATA_MODEL.md §3, 03-architecture/data-layer.md §2 | — | `source/build/build.js` reads and uses these fields; no build-time schema validator | implemented |
| `05-§1.2` | Active camp is derived from dates (no manual flag) | 03-architecture/data-layer.md §2; 02-requirements/event-data.md §34 | DAC-01..07 | `source/scripts/resolve-active-camp.js` | covered |
| `05-§1.3` | *(Superseded — `active` field removed; conflict impossible)* | — | — | — | *(superseded by 02-§34.6)* |
| `05-§3.1` | Each submitted event must include `id`, `title`, `date`, `start`, `end`, `location`, and `responsible` | 06-EVENT_DATA_MODEL.md §4, 05-DATA_CONTRACT.md §3 | VLD-04..11, VLD-27..28 | `source/api/validate.js` – `validateEventRequest()` and `validateEditRequest()` (note: `id` is server-generated, not submitted as input) | covered |
| `05-§4.1` | Event `date` must fall within the camp's `start_date` and `end_date` (inclusive) | 06-EVENT_DATA_MODEL.md §4 | VLD-50..55, LNT-12, LNT-13 | `source/api/validate.js` – `campDates` range check; `lint-yaml.js` – camp range check; `app.js` – passes `activeCamp` | covered |
| `05-§4.2` | `start` must use 24-hour `HH:MM` format | 06-EVENT_DATA_MODEL.md §4 | VLD-33..34, VLD-37..40, LNT-14 | `source/api/validate.js` – `TIME_RE` format check; `lint-yaml.js` – `TIME_RE` | covered |
| `05-§4.3` | `end` must be after `start` | 06-EVENT_DATA_MODEL.md §4 | VLD-16..20, VLD-29..30 | `source/api/validate.js` – `end <= start` check in both `validateEventRequest()` and `validateEditRequest()` | covered |
| `05-§5.1` | The combination of `(title + date + start)` must be unique within a camp file | 03-architecture/data-layer.md §1 | LNT-19..21 | `source/scripts/lint-yaml.js` – `seenCombos` set (build-time + CI); API layer relies on deterministic ID generation | covered |
| `05-§6.1` | Event `id` must be unique within the camp file | 06-EVENT_DATA_MODEL.md §4 | GH-01..11 (slugify determinism), LNT-18 | `source/scripts/lint-yaml.js` – `seenIds` set (build-time + CI); API generates deterministic IDs from unique (title+date+start) | covered |
| `05-§6.2` | Event `id` must be stable and not change after creation | 06-EVENT_DATA_MODEL.md §4 | EEC-01..03 | `source/api/github.js` – deterministic `slugify(title)+date+start` on first write; `edit-event.js` – `patchEventInYaml()` preserves id | covered |
| `05-§1.4` | The `file` field in `camps.yaml` references a YAML file in `source/data/` | 06-EVENT_DATA_MODEL.md §1 | — | `source/build/build.js` – loads camp file via `camps.yaml` `file` field | implemented |
| `05-§1.5` | The camp `id` is permanent and must never change after the camp is first created | 06-EVENT_DATA_MODEL.md §3 | — | — (no enforcement; enforced by convention and docs) | implemented |
| `05-§3.2` | Each camp file's `camp:` block must include `id`, `name`, `location`, `start_date`, and `end_date` | 06-EVENT_DATA_MODEL.md §3 | — | `source/build/build.js` – reads and uses all five fields; no build-time schema validator | implemented |
| `05-§3.3` | The `owner` and `meta` fields are for internal use only and must never appear in any public view | 06-EVENT_DATA_MODEL.md §5, §6 | RDC-01..04, STR-JSON-01..02 | `source/build/render.js` – neither field is referenced in render output | covered |
| `05-§4.4` | `end` must be a valid `"HH:MM"` string | 06-EVENT_DATA_MODEL.md §4 | VLD-35..36, VLD-41, LNT-15 | `source/api/validate.js` – `TIME_RE` format check; `lint-yaml.js` – `TIME_RE` | covered |
| `05-§4.5` | All times are local; no timezone handling | 06-EVENT_DATA_MODEL.md §4 | STR-TZ-01..06 | No timezone conversion anywhere in the codebase | covered |
| `05-§1.6` | `opens_for_editing` field documented in data contract | 05-DATA_CONTRACT.md §1 | — | `docs/05-DATA_CONTRACT.md` – field added to schema and described | implemented |

## Section §1

### §1 — Camp registry fields (camps.yaml)

| ID | Status | Notes |
| --- | --- | --- |
| `05-§1.7` | covered | VCMP-37..45: validator enforces ISO format, ordering (`registration_opens <= registration_closes`), and `registration_closes < start_date` on non-archived camps; archived camps may omit the fields |
