# SB Sommar – Requirements: Add and Edit Forms

Add-activity and edit-activity forms: fields, validation, submit flows, time-gating, cookies, drafts, multi-day, delete, conflict warning, error visibility.

Part of [the requirements index](./index.md). Section IDs (`02-§N.M`) are stable and cited from code; they do not encode the file path.

---

## 6. Adding an Activity

Participants must be able to submit a new activity through the form at `/lagg-till.html`. <!-- 02-§6.1 -->

### Required fields

- Title
- Date
- Start time
- End time
- Location
- Responsible person

### Optional fields

- Description (free text)
- Communication link

### Form UX

The form must help the user fill it in correctly. This is not about security —
it is about reducing confusion and frustration.

#### Field controls

- **Date selection:** a grid of day buttons — one per camp day. Each button shows
  the weekday abbreviation and date (e.g. "Mån 28/7"). The user selects a day by
  clicking; the previously selected day is deselected. Exactly one day must be
  selected before submit. The grid contains only days within the active camp's
  `start_date..end_date`. When the current date falls within the camp period,
  only days from today onward are shown. <!-- 02-§6.2 -->
- **Recurring toggle:** a toggle labelled "Återkommande" switches the day grid
  from single-select to multi-select mode. In multi-select mode, clicking a day
  toggles it on or off independently. When toggled on, all camp days except the
  first and last day are pre-selected. The first and last day are unselected by
  default but can be selected manually. At least one day must be selected before
  submit. <!-- 02-§6.15 -->
- **Location field:** a dropdown populated from `source/data/local.yaml`.
  One option ("Annat") allows a free-text location not in the list. <!-- 02-§6.3 -->
- **Time fields:** display a `HH:MM` format hint. The field should guide the user
  toward a valid value. <!-- 02-§6.4 -->

#### Submit feedback

- **Errors:** shown inline, per field, immediately on submit. Not as a single
  generic message at the top of the form. Each error message must name the specific
  problem (e.g. "Sluttid måste vara efter starttid"). <!-- 02-§6.5 -->
- **Submit button:** disabled while the submission is in progress.
  Shows a visual indication that something is happening. <!-- 02-§6.6 -->
- **Success state:** a clear confirmation that the activity has been received.
  The user should not be left wondering whether it worked. <!-- 02-§6.7 -->
- **Network failure:** if the submission cannot reach the server, the user is
  told clearly that it failed and can try again. Submissions must not be silently lost. <!-- 02-§6.8 -->

#### Live validation

- **Live date validation:** when the user selects a date value (on `change`), the
  date field must immediately show an inline error if the value is in the past,
  without requiring a submit attempt. <!-- 02-§6.9 -->
- **Live end-time validation:** when the user changes the end time (on `change`),
  the end-time field must immediately be evaluated if start time is already filled.
  If end ≤ start, the midnight-crossing rule (§54) applies: a valid crossing shows
  a green info message; an invalid crossing shows a red error. If start is not yet
  filled, this check is deferred to submit. <!-- 02-§6.10 -->
- **Live required-field validation:** when the user leaves any required field
  (on `blur`), the field must immediately show an inline error if it is empty. <!-- 02-§6.11 -->
- **Live error clearing:** an inline error shown by live validation must be
  cleared as soon as the user starts editing that field again (on `input` or
  `change`). <!-- 02-§6.12 -->
- **Live start-time cross-check:** when the user changes the start time (on
  `change`), the end-time field must immediately be re-evaluated using the
  midnight-crossing rule (§54): a valid crossing shows a green info message,
  an invalid crossing shows a red error, and a normal end > start clears any
  message. If end is empty, no action is taken. <!-- 02-§6.13 -->
- **Past start-time on today:** when the selected date is today and the user
  changes the start time (on `change`), an inline error must be shown
  immediately if the start time is more than 2 hours in the past. The same
  check must be applied to an already-set start time when the user changes the
  date to today. A 2-hour buffer is used because the user may be entering data
  for an activity that started recently or may have selected today by mistake
  when meaning tomorrow. <!-- 02-§6.14 -->

---

---

## 7. Editing and Removing Activities

Participants can edit their own active events (events whose date has not yet passed)
through a session-cookie-based ownership mechanism. See §18 for the full specification. <!-- 02-§7.1 -->

Administrators with a valid admin token (§91) can edit or remove any activity
through the same edit and delete flows available to participants. <!-- 02-§7.2 -->

A user may edit or delete an event if their session cookie contains a valid
signed ownership entry for that event **or** the user holds a valid admin
token. <!-- 02-§7.3 -->

---

---

## 8. Locations

- Locations must be selected from a predefined list. <!-- 02-§8.3 -->
- Location names must remain consistent throughout the week. <!-- 02-§8.1 -->
- One flexible option ("Annat") must exist for locations not in the list. <!-- 02-§8.2 -->
- The predefined list is maintained in `source/data/local.yaml` — this is the
  only place locations are defined.

Participants cannot modify the location list. <!-- 02-§8.4 -->

---

---

## 9. Form Validation

When a participant submits an activity, the following must be verified:

- `title` is present and non-empty. <!-- 02-§9.1 -->
- `date` falls within the active camp's date range. <!-- 02-§9.2 -->
- `start` is in valid `HH:MM` format. <!-- 02-§9.3 -->
- `end` is present, in valid `HH:MM` format, and is after `start` — or represents
  a valid midnight crossing per the midnight-crossing rule (§54). <!-- 02-§9.4 -->
- `location` is present and non-empty. <!-- 02-§9.5 -->
- `responsible` is present and non-empty. <!-- 02-§9.6 -->

Invalid submissions must be rejected with a clear, specific error message.
Valid submissions must receive a confirmation immediately.

---

---

## 10. API Input Validation

The API server (`app.js`) receives submitted events and commits them to a YAML file
on GitHub. Malformed input that reaches the YAML file can corrupt the file and break
the entire site.

The server must therefore validate all input before touching GitHub:

- All required fields must be present and of the correct type before any write begins. <!-- 02-§10.1 -->
- Only known fields are written to the YAML file. Unknown or extra fields in the
  POST body are ignored — they are never committed. <!-- 02-§10.2 -->
- String values are type-checked and length-limited. Extremely long strings are rejected. <!-- 02-§10.3 -->
- YAML escaping is handled entirely by the YAML serializer. User-provided strings
  are never interpolated directly into YAML text. <!-- 02-§10.4 -->
- Any validation failure results in an HTTP error response. Nothing is committed to GitHub. <!-- 02-§10.5 -->
- When a new event is appended to a camp YAML file, the serialised YAML block must be
  indented to match the existing `events:` list. The resulting file must remain valid YAML
  that parses identically to the original file plus the new event entry. <!-- 02-§10.6 -->

This is separate from form UX validation. Form validation helps users. API validation
protects the site's data integrity.

---

---

## 19. Add-Activity Submit Flow

When validation passes and the user submits the add-activity form, the submission
proceeds through a defined sequence: field locking → optional consent prompt →
progress modal → result.

### 19.1 Field locking

- When validation passes and submission begins, all form inputs (text, date, time,
  select, textarea) and the submit button are immediately disabled. This prevents
  edits and duplicate submissions during the async flow. <!-- 02-§19.1 -->
- Disabled elements are visually distinct from their enabled state (reduced opacity
  or grayed-out appearance). <!-- 02-§19.2 -->

### 19.2 Consent prompt

- The consent prompt (§18.2) is shown as a modal dialog while the form is locked.
  The modal uses the same `#submit-modal` element and styling as the progress and
  result modals. <!-- 02-§19.3 -->
- After the user accepts or declines, the modal content transitions to the
  progress state (spinner) and the submission continues. <!-- 02-§19.4 -->

### 19.3 Progress modal

- After consent is resolved, a modal dialog opens over the page before the fetch
  begins. <!-- 02-§19.5 -->
- The modal displays a loading indicator (spinner or equivalent) and the text
  "Skickar till GitHub…". <!-- 02-§19.6 -->
- The modal carries `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`
  pointing to its heading element. <!-- 02-§19.7 -->
- Keyboard focus is trapped inside the modal while it is open. <!-- 02-§19.8 -->
- The page behind the modal is not scrollable while the modal is open. <!-- 02-§19.9 -->

### 19.4 Success state

- On a successful response, the modal content changes to show: the submitted
  activity title, the text "Aktiviteten är tillagd! Den syns i schemat om ungefär
  en minut.", a primary link "Gå till schemat →" to `schema.html`, and a secondary
  button "Lägg till en till". <!-- 02-§19.10 -->
- If the user declined cookie consent, the success state also shows a Swedish note
  explaining they cannot edit the activity from this browser, and that they can
  resubmit with consent next time. <!-- 02-§19.11 -->
- Clicking "Lägg till en till" closes the modal, resets the form, and re-enables
  all form fields. <!-- 02-§19.12 -->

### 19.5 Error state

- On an error response or network failure, the modal content changes to show the
  error message in Swedish and a "Försök igen" button. <!-- 02-§19.13 -->
- Clicking "Försök igen" closes the modal and re-enables all form fields, allowing
  the user to correct and resubmit without losing their typed input. <!-- 02-§19.14 -->

### 19.6 Implementation constraints

- The modal uses only CSS custom properties defined in `docs/07-design/css-strategy.md §7`.
  No hardcoded colors, spacing, or typography values. <!-- 02-§19.15 -->
- The modal is implemented in vanilla JavaScript; no library or framework is
  added. <!-- 02-§19.16 -->
- The existing `#result` section in the page HTML is removed; the modal is the
  sole post-submission feedback mechanism. <!-- 02-§19.17 -->

---

---

## 20. Edit-Activity Submit Flow

When the user submits the edit-activity form, the submission proceeds through a
defined sequence: field locking → progress modal → result. This mirrors the
add-activity submit flow (§19) but without a consent step, and with success text
and actions appropriate for an edit rather than a new submission.

### 20.1 Field locking

- When validation passes and submission begins, all form inputs (text, date, time,
  select, textarea) and the submit button are immediately disabled. This prevents
  edits and duplicate submissions during the async flow. <!-- 02-§20.1 -->
- Disabled elements are visually distinct from their enabled state (reduced opacity
  or grayed-out appearance). <!-- 02-§20.2 -->

### 20.2 Progress modal

- After submission begins, a modal dialog opens over the page before the fetch
  begins. <!-- 02-§20.3 -->
- The modal displays a loading indicator (spinner or equivalent) and the text
  "Sparar till GitHub…". <!-- 02-§20.4 -->
- The modal carries `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`
  pointing to its heading element. <!-- 02-§20.5 -->
- Keyboard focus is trapped inside the modal while it is open. <!-- 02-§20.6 -->
- The page behind the modal is not scrollable while the modal is open. <!-- 02-§20.7 -->

### 20.3 Success state

- On a successful response, the modal shows: the edited activity title, the text
  "Aktiviteten är uppdaterad! Den syns i schemat om ungefär en minut.", and a
  primary link "Gå till schemat →" to `schema.html`. <!-- 02-§20.8 -->

### 20.4 Error state

- On an error response or network failure, the modal shows the error message in
  Swedish and a "Försök igen" button. <!-- 02-§20.9 -->
- Clicking "Försök igen" closes the modal and re-enables all form fields,
  allowing the user to correct and resubmit without losing their typed input. <!-- 02-§20.10 -->

### 20.5 Implementation constraints

- The modal uses only CSS custom properties defined in `docs/07-design/css-strategy.md §7`.
  No hardcoded colors, spacing, or typography values. <!-- 02-§20.11 -->
- The modal is implemented in vanilla JavaScript; no library or framework is
  added. <!-- 02-§20.12 -->
- The existing `#result` section in the edit-page HTML is removed; the modal is
  the sole post-submission feedback mechanism for the edit form. <!-- 02-§20.13 -->

---

---

## 26. Form Time-Gating

The add-activity and edit-activity forms must only be usable during a defined
period around the active camp. Outside this period, participants cannot create
or edit activities.

### 26.1 Data model

The `opens_for_editing` field on each `camps.yaml` entry defines when the
forms open. The submission period runs from `opens_for_editing` through
`end_date + 1 day` (inclusive on both ends, compared as dates without
timezone). See `05-DATA_CONTRACT.md §1` for the canonical field
definition and the typical default (`start_date − 7 days`). <!-- 02-§26.1 --> <!-- 02-§26.2 -->

### 26.2 UI behaviour — before the period opens

- When the current date is before `opens_for_editing`, the add-activity form
  is rendered but visually greyed out (reduced opacity on all form fields). <!-- 02-§26.3 -->
- The submit button is disabled. <!-- 02-§26.4 -->
- A message is displayed above the form stating when it opens, e.g.
  "Formuläret öppnar den 15 februari 2026." <!-- 02-§26.5 -->

### 26.3 UI behaviour — after the period closes

- When the current date is after `end_date + 1 day`, the add-activity form
  is rendered but visually greyed out (reduced opacity on all form fields). <!-- 02-§26.6 -->
- The submit button is disabled. <!-- 02-§26.7 -->
- A message is displayed above the form stating that the camp has ended, e.g.
  "Lägret är avslutat." <!-- 02-§26.8 -->

### 26.4 UI behaviour — edit form

- The same time-gating rules apply to the edit-activity form
  (`/redigera.html`). <!-- 02-§26.9 -->

### 26.5 API enforcement

- The `POST /add-event` endpoint must reject requests with HTTP 403 when the
  current date is outside the `[opens_for_editing, end_date + 1d]`
  period. <!-- 02-§26.10 -->
- The `POST /edit-event` endpoint must apply the same check. <!-- 02-§26.11 -->
- The error response must include a Swedish message explaining why the
  submission was rejected. <!-- 02-§26.12 -->

### 26.6 Build-time data passing

- The build must embed `opens_for_editing` and `end_date` as `data-` attributes
  on the form element so client-side JavaScript can evaluate the period at page
  load without an API call. <!-- 02-§26.13 -->

### 26.7 Admin bypass before the camp opens

Context: administrators need to prepare the schedule via the website before
`opens_for_editing`. Issues #335 and #336 asked for a way to add and edit
activities during that preparation window without editing YAML by hand. The
bypass is deliberately one-sided: admins can open the form before the camp
opens, but the same forms remain locked for everyone — including admins —
after the camp has ended, so finished camps cannot be altered retroactively
through the website.

- When the current date is before `opens_for_editing` and the client holds a
  valid admin token (§91), the add-activity and edit-activity forms display
  the same locked message as for ordinary users, plus an additional button
  labelled "Öppna ändå (admin)". <!-- 02-§26.14 -->
- The bypass button is rendered on its own row directly below the locked
  message — outside the message box, not inline with any other link or
  text — and has the same placement on `/lagg-till.html` and `/redigera.html`. <!-- 02-§26.20 -->
- Activating the bypass button removes the disabled state on the form
  fieldset and submit button so the admin can complete the submission.
  Activating the button also hides both the locked message and the button
  itself so the form alone remains visible. <!-- 02-§26.15 -->
- The bypass button is only shown when the form is locked because the period
  has not yet opened. It is never shown after `end_date + 1 day`. <!-- 02-§26.16 -->
- `POST /add-event`, `POST /edit-event`, and `POST /delete-event` accept
  requests that carry a valid admin token even when the current date is
  before `opens_for_editing`. <!-- 02-§26.17 -->
- The same endpoints reject requests when the current date is after
  `end_date + 1 day`, regardless of whether an admin token is present. <!-- 02-§26.18 -->
- The add-activity form includes the admin token in the request body (as
  `adminToken`) when an admin submits through the bypass path, using the same
  mechanism as the edit and delete flows (§18.31, §89.13). <!-- 02-§26.19 -->

---

---

## 27. Past-Date Blocking

Events must not be created or edited with a date in the past. This rule applies
to both the add-activity and edit-activity flows, at both the client and server
layers.

### 27.1 Definition

- "Past" means the event's date is strictly before today's local date
  (`YYYY-MM-DD` string comparison). Today itself is not considered past. <!-- 02-§27.1 -->

### 27.2 Add-activity form (client)

- Before submission, the add-activity form must check that the selected date is
  not in the past. If it is, the form must show the error message
  "Datum kan inte vara i det förflutna." and prevent submission. <!-- 02-§27.2 -->

### 27.3 Edit-activity form (client)

- Before submission, the edit-activity form must check that the date field value
  is not in the past. If it is, the form must show the error message
  "Datum kan inte vara i det förflutna." and prevent submission. <!-- 02-§27.3 -->

### 27.4 Add-event API endpoint (server)

- The `POST /add-event` endpoint must reject requests where the `date` field is
  in the past, responding with HTTP 400 and a Swedish error message. <!-- 02-§27.4 -->

### 27.5 Edit-event API endpoint (server)

- The `POST /edit-event` endpoint must reject requests where the submitted
  `date` field is in the past, responding with HTTP 400 and a Swedish error
  message. This is in addition to the existing check that blocks editing events
  whose original date has passed. <!-- 02-§27.5 -->

### 27.6 Server validation location

- The past-date check must be implemented in the shared validation module
  (`source/api/validate.js`) so that both endpoints use the same logic. <!-- 02-§27.6 -->

---

---

## 48. Add-Activity and Edit-Activity Cookie Enhancements

Participants who have accepted the session cookie should get a smoother
experience when adding and editing activities. The add form remembers
the responsible person, and the edit page shows a list of owned events
without requiring the user to navigate from the schedule.

### 48.1 Auto-fill responsible person on the add form

- When a participant successfully submits an activity after accepting the
  cookie, the value of the "Ansvarig" field is saved to `localStorage`
  under the key `sb_responsible`. <!-- 02-§48.1 -->
- On page load of `/lagg-till.html`, if `sb_responsible` exists in
  `localStorage` and the "Ansvarig" field is empty, the field is
  pre-filled with the stored value. <!-- 02-§48.2 -->
- The stored value is updated on every successful submission, so it
  always reflects the most recently used name. <!-- 02-§48.3 -->

### 48.2 Dynamic intro text on the add form

- The add form shows a paragraph (line 46 in the current HTML) explaining
  that a temporary ID will be saved so the user can edit their activity
  later. This is the "cookie paragraph". <!-- 02-§48.4 -->
- If the user has already accepted cookie consent (`sb_cookie_consent`
  is `'accepted'` in `localStorage`), the cookie paragraph is replaced
  with a message stating that the user can edit their submitted activities,
  with a link to `/redigera.html`. <!-- 02-§48.5 -->
- If consent has not been given, the paragraph remains unchanged. <!-- 02-§48.6 -->
- The replacement is done client-side on page load. <!-- 02-§48.7 -->

### 48.3 Edit page without cookie

- When `/redigera.html` is loaded without a URL `id` parameter and the
  user has no session cookie (`sb_session`), the page shows a text
  explaining that this page is for editing activities and that it
  requires accepting the cookie when adding an activity. <!-- 02-§48.8 -->
- The text is written in Swedish. <!-- 02-§48.9 -->
- The loading spinner is hidden; the edit form is not shown. <!-- 02-§48.10 -->

### 48.4 Edit page with cookie but no editable events

- When `/redigera.html` is loaded without a URL `id` parameter and the
  user has a session cookie, but none of the owned event IDs match
  current, non-past events in `/events.json`, the page shows a message
  saying that the user's editable activities will appear here. <!-- 02-§48.11 -->
- The loading spinner is hidden; the edit form is not shown. <!-- 02-§48.12 -->

### 48.5 Edit page with cookie and editable events

- When `/redigera.html` is loaded without a URL `id` parameter and the
  user has a session cookie containing event IDs that match current,
  non-past events in `/events.json`, the page shows a list of those
  events. <!-- 02-§48.13 -->
- Each list item shows only the event title and is a link to
  `/redigera.html?id={eventId}`. <!-- 02-§48.14 -->
- Events whose date has already passed are filtered out entirely. <!-- 02-§48.15 -->
- The loading spinner is hidden; the edit form is not shown until the
  user clicks a specific event link. <!-- 02-§48.16 -->

### 48.6 Edit page with a specific event selected

- When `/redigera.html` is loaded with a URL `id` parameter, the
  existing behaviour is preserved: ownership check, event loading,
  form population. <!-- 02-§48.17 -->
- If the user also has other editable events, the event list from §48.5
  is shown above the edit form so the user can switch between events. <!-- 02-§48.18 -->

---

---

## 53. Synchronous API Error Visibility and Deploy Safety

Background: the add-event and edit-event API endpoints respond with
`{ success: true }` before the GitHub write completes. If the GitHub
operation fails (missing credentials, network error, invalid token), the
user sees a success confirmation but the event is silently lost. This
violates `02-§6.8` ("Submissions must not be silently lost"). Additionally,
the deploy workflow's `.env` backup can be lost if `public_html` is wiped
before the backup step runs.

### 53.1 Synchronous GitHub commit (API requirements)

- The add-event endpoint (`POST /add-event`) must complete the full GitHub
  operation (create branch, commit, create PR, enable auto-merge) before
  returning a response to the client. <!-- 02-§53.1 -->
- The edit-event endpoint (`POST /edit-event`) must complete the full GitHub
  operation before returning a response to the client. <!-- 02-§53.2 -->
- If any step of the GitHub operation fails, the endpoint must return
  `{ "success": false, "error": "<user-facing message>" }` with HTTP
  status 500. <!-- 02-§53.3 -->
- The user-facing error message must be in Swedish and must not expose
  internal details (e.g. no stack traces, no GitHub API error
  messages). <!-- 02-§53.4 -->
- The `flushToClient()` function and `ob_start()` call must be removed —
  they exist only to support the fire-and-forget pattern. <!-- 02-§53.5 -->

### 53.2 Progress feedback during submission (user requirements)

- While the form submission is in progress, the modal must display a
  step-by-step progress list with the following stages: <!-- 02-§53.6 -->
  1. "Skickar till servern…"
  2. "Kontrollerar aktiviteten…"
  3. "Sparar aktiviteten…"
- Each stage must begin with an unchecked indicator and transition to a
  green check mark (✓) after its allotted time. <!-- 02-§53.7 -->
- The timing is client-side (not streamed from the server). Stages
  transition at approximately 0 s, 0.5 s, and 2 s. <!-- 02-§53.8 -->
- When the API responds with success, all remaining stages must immediately
  show green check marks and a final success message must
  appear. <!-- 02-§53.9 -->
- When the API responds with an error, progress must stop at the current
  stage and the error message from the API must be displayed below the
  progress list. <!-- 02-§53.10 -->
- The progress list must be used for both the add-event and edit-event
  forms. <!-- 02-§53.11 -->

### 53.3 Persistent .env backup (superseded by §100)

> `02-§53.12`–`02-§53.14` are superseded by §100 (API `.env` outside the
> web root). The PHP API `.env` now lives at `$DEPLOY_DIR/.env`, outside the
> `public_html` that release swaps replace, so it persists without a
> separate backup-and-restore step. Prose preserved in
> [`archive.md`](./archive.md).

---

---

## 54. Midnight-Crossing Events

Events at a summer camp can legitimately cross midnight (e.g. an evening party
starting at 23:00 and ending at 01:00). The system must allow these while
catching likely user mistakes (e.g. entering 16:00→14:00 when 16:00→17:00 was
intended).

### 54.1 Midnight-crossing rule (event/data requirements)

- When `end < start` (string comparison on HH:MM values), the system must
  interpret the event as crossing midnight and calculate the implied duration
  as `(24 × 60 − startMinutes) + endMinutes`. <!-- 02-§54.1 -->
- A midnight-crossing event with a calculated duration of **1 020 minutes
  (17 hours) or less** must be accepted by all validation layers (client live,
  client submit, server API, build-time lint). <!-- 02-§54.2 -->
- A midnight-crossing event with a calculated duration **greater than
  1 020 minutes** must be rejected with a clear error message indicating the
  times appear incorrect. <!-- 02-§54.3 -->
- When `end == start`, the event must always be rejected — zero-length events
  remain invalid regardless of the midnight-crossing rule. <!-- 02-§54.4 -->
- When `end > start` (normal case), behaviour must remain unchanged — no info
  message, no duration calculation. <!-- 02-§54.5 -->

### 54.2 User feedback (user requirements)

- When a valid midnight crossing is detected during live validation, the
  end-time field must show a **green informational message**:
  *"Tolkas som att aktiviteten slutar nästa dag."* — not a red
  error. <!-- 02-§54.6 -->
- The informational message must use sage-green styling (`.field-info` class)
  and must **not** set `aria-invalid="true"` on the input — the input border
  must remain normal. <!-- 02-§54.7 -->
- When a midnight crossing exceeds the threshold, the end-time field must
  show a red error: *"Aktiviteten verkar vara för lång. Kontrollera start-
  och sluttid."* <!-- 02-§54.8 -->
- The informational or error message must be cleared when the user edits the
  start or end field again. <!-- 02-§54.9 -->

### 54.3 Edit form (site requirements)

- The edit form (`redigera.js`) submit validation must apply the same
  midnight-crossing logic as the add form. <!-- 02-§54.10 -->

### 54.4 Build-time lint (site requirements)

- The build-time YAML linter (`lint-yaml.js`) must apply the same
  midnight-crossing threshold when checking existing event
  files. <!-- 02-§54.11 -->

---

---

## 57. Markdown Toolbar for Description Field

The description textarea in the add-activity form (`/lagg-till.html`) and
the edit-activity form (`/redigera.html`) must include a toolbar that helps
users write Markdown without memorising syntax.

### 57.1 User requirements

- The user must be able to apply bold, italic, heading, bullet list,
  numbered list, and block-quote formatting via toolbar buttons without
  knowing Markdown syntax. <!-- 02-§57.1 -->
- When the user has selected text in the description field, clicking a
  toolbar button must wrap or prefix the selected text with the
  corresponding Markdown syntax. <!-- 02-§57.2 -->
- When no text is selected, clicking a toolbar button must insert the
  Markdown syntax with a placeholder word and select that placeholder so
  the user can type over it immediately. <!-- 02-§57.3 -->
- For list and block-quote buttons, if the selection spans multiple lines,
  the prefix must be applied to each line individually. <!-- 02-§57.4 -->

### 57.2 Site requirements

- The toolbar must appear as a single row of buttons directly above the
  description textarea in both `/lagg-till.html` and
  `/redigera.html`. <!-- 02-§57.5 -->
- The buttons must appear in this order: Bold, Italic, Heading, Bullet
  list, Numbered list, Block quote. <!-- 02-§57.6 -->
- Each button must display an inline SVG icon (no icon font or external
  image dependency). <!-- 02-§57.7 -->
- Each button must have an accessible label (`aria-label`) describing its
  action. <!-- 02-§57.8 -->
- The toolbar must be styled using existing design tokens from
  `07-design/css-strategy.md` — no hardcoded colours, spacing, or typography
  values. <!-- 02-§57.9 -->
- The toolbar logic must live in a single shared JS file
  (`markdown-toolbar.js`) that is loaded by both forms. <!-- 02-§57.10 -->
- The toolbar must not add any external dependencies. <!-- 02-§57.11 -->
- ~~There is no live preview of Markdown — the toolbar only inserts
  syntax.~~ Superseded by §58 (Markdown Preview). <!-- 02-§57.12 -->
- The toolbar buttons must have visible focus indicators that meet the
  existing focus-visible styling. <!-- 02-§57.13 -->

---

---

## 58. Markdown Preview for Description Field

The description textarea in the add-activity form (`/lagg-till.html`) and
the edit-activity form (`/redigera.html`) must include a live preview that
shows the user how their Markdown will render.

### 58.1 User requirements

- The user must see a live preview of their description text rendered as
  formatted HTML below the description textarea. <!-- 02-§58.1 -->
- The preview must update as the user types, with a debounce delay of
  approximately 300 ms so that rendering does not interfere with
  typing. <!-- 02-§58.2 -->
- When the description textarea is empty, the preview area must either be
  hidden or show a discrete placeholder text (e.g. "Förhandsgranskning
  visas här"). <!-- 02-§58.3 -->
- The preview must be read-only — no user interaction (clicking, selecting,
  editing) should be possible within the preview area. <!-- 02-§58.4 -->

### 58.2 Site requirements

- The preview must render using the same `marked` library used at build
  time, loaded as a client-side script (`marked.min.js`), to guarantee
  identical output. <!-- 02-§58.5 -->
- The `marked.min.js` file must be copied from `node_modules` to the
  public JS directory during the build step. <!-- 02-§58.6 -->
- The `marked.min.js` script must be loaded with the `defer` attribute so
  it does not block page rendering. <!-- 02-§58.7 -->
- The preview applies the same sanitization rules as build-time rendering
  (02-§56.6): raw HTML is dropped at parse time and unsafe-scheme URIs in
  links and images are neutralized. The preview consumes the same shared
  marked-renderer module as the build to guarantee byte-for-byte parity
  between preview output and the eventually-published page. <!-- 02-§58.8 -->
- The preview logic must live in a dedicated JS file
  (`markdown-preview.js`) that is loaded by both forms. <!-- 02-§58.9 -->
- The preview area must use `aria-live="polite"` so that screen readers
  announce content changes without interrupting the user. <!-- 02-§58.10 -->
- The preview area must have an accessible label
  (`aria-label`). <!-- 02-§58.11 -->
- The preview must appear in both `/lagg-till.html` and
  `/redigera.html`. <!-- 02-§58.12 -->

### 58.3 Design requirements

- The preview area must be visually distinct from the textarea (e.g.
  different background, border style) so the user can distinguish input
  from output. <!-- 02-§58.13 -->
- The inner content of the preview must match the `.event-description`
  styling used in the schedule, so the user sees an accurate
  representation of the final output. <!-- 02-§58.14 -->
- All styling must use existing design tokens from `07-design/css-strategy.md` — no
  hardcoded colours, spacing, or typography values. <!-- 02-§58.15 -->

---

---

## 80. Multi-Day Selection and Batch Submission

Participants often run the same activity on multiple days at the same time and
place. The add-activity form uses a day grid that is always multi-select —
clicking days toggles them on/off. When more than one day is selected, the
submission uses the batch endpoint. A confirmation modal is shown before every
submission.

### 80.1 Day grid component (user requirements)

- The date picker on the add-activity form is a grid of day buttons replacing
  the native `<input type="date">`. <!-- 02-§80.1 -->
- Each button displays the Swedish weekday abbreviation and the date in
  day/month format (e.g. "Mån 28/7"). <!-- 02-§80.2 -->
- The grid contains exactly the days within the active camp's
  `start_date..end_date`. <!-- 02-§80.3 -->
- When the current date falls within the camp period, only days from today
  onward are shown. Before the camp period, all days are shown. <!-- 02-§80.4 -->
- The day grid is always multi-select. Clicking a day toggles it on or off
  independently. There is no single-select mode. <!-- 02-§80.5 -->

### 80.2 Multi-day info and validation (user requirements)

- The day grid is always multi-select. Clicking any day toggles its
  selection. <!-- 02-§80.6 -->
- When two or more days are selected, an info text is shown below the day grid
  stating the count and that each day becomes a separate editable
  activity. <!-- 02-§80.7 -->
- When exactly one day is selected after having had multiple selected, a soft
  hint is shown reminding the user that only one day is selected. <!-- 02-§80.8 -->
- Clicking a day toggles it on or off independently. <!-- 02-§80.9 -->
- At least one day must be selected before submit. An error message is shown
  immediately (live validation) if no day is selected. <!-- 02-§80.10 -->
- The day grid paginates at 8 days per page. Navigation arrows (← →) allow
  moving between pages. <!-- 02-§80.11 -->

### 80.3 Batch API endpoint (API requirements)

- A new endpoint `POST /add-events` (and PHP equivalent `POST /api/add-events`)
  accepts the same fields as `POST /add-event` but with `dates` (an array of
  `YYYY-MM-DD` strings) instead of `date`. <!-- 02-§80.12 -->
- The endpoint validates every date in the array using the same rules as the
  single-event endpoint (within camp range, not in the past, valid
  format). <!-- 02-§80.13 -->
- The endpoint validates the uniqueness constraint `(title + date + start)` for
  every date in the batch against existing events in the camp
  file. <!-- 02-§80.14 -->
- All validation runs before any write. If any single date fails validation,
  the entire batch is rejected and no events are created
  (all-or-nothing). <!-- 02-§80.15 -->
- On success, all events are committed in a single branch and PR — not one PR
  per event. <!-- 02-§80.16 -->
- The response includes `{ "success": true, "eventIds": [...] }` listing all
  created event IDs. <!-- 02-§80.17 -->
- Time-gating (§26) and injection scanning (§49) apply to the batch endpoint
  identically. <!-- 02-§80.18 -->
- The session cookie is updated with ownership entries for all submitted events
  when consent is given. <!-- 02-§80.19 -->

### 80.4 Confirmation and submit flow (user requirements)

- Before every submission (single or batch), a confirmation modal is shown
  displaying the activity summary: title, date(s), time, location, responsible,
  description, and link. <!-- 02-§80.20 -->
- The progress modal (§53.2) displays the same stages as single submit. The
  final success message states the number of created activities
  (e.g. "5 aktiviteter tillagda!"). <!-- 02-§80.21 -->
- On error, the modal displays the error message. Since the batch is
  all-or-nothing, no partial state needs to be communicated. <!-- 02-§80.22 -->
- "Lägg till en till" resets the form including the day grid. <!-- 02-§80.23 -->

### 80.5 Edit form (site requirements)

- The edit form is not affected by this feature. Editing always operates on a
  single event. The date field on the edit form remains a single day
  selector. <!-- 02-§80.24 -->

### 80.6 Implementation constraints

- The day grid is implemented in vanilla JavaScript. <!-- 02-§80.25 -->
- The day grid uses CSS custom properties from `docs/07-design/css-strategy.md §7`. <!-- 02-§80.26 -->
- The batch endpoint must be implemented in both Node.js and PHP with identical
  validation and response format. <!-- 02-§80.27 -->

### 80.7 Static multi-day hint (user requirements)

- A static hint with the text
  `För återkommande aktivitet — välj flera dagar.` is rendered immediately
  below the `Datum *` label on the add-activity page, above the day
  grid, and is always visible regardless of selection state. <!-- 02-§80.28 -->
- The hint is rendered with the existing `.field-info` class so it
  matches the visual style of other inline field info messages on the
  same page. <!-- 02-§80.29 -->
- The hint is shown only on the add-activity page; the edit page (which
  does not support multi-day selection) does not render it. <!-- 02-§80.30 -->

---

---

## 81. Client-side link field validation

The add-activity form validates the optional link field on blur so that the user
gets immediate feedback when the format is incorrect, without having to submit
the form first.

### 81.1 Blur validation (user requirements)

- When the user leaves the link field and the value is non-empty, the client
  validates that the value starts with `http://` or `https://`
  (case-insensitive). <!-- 02-§81.1 -->
- When the value is non-empty and does not start with `http://` or `https://`,
  the client validates that the value contains at least one dot after the
  protocol. <!-- 02-§81.2 -->
- When validation fails, an error message is shown below the field using the
  same error pattern as other fields (red text, `field-error`
  class). <!-- 02-§81.3 -->
- When the link field is empty, no validation error is shown (the field is
  optional). <!-- 02-§81.4 -->

### 81.2 Clearing errors (user requirements)

- When the user types in the link field after an error has been shown, the error
  is cleared on `input` event. <!-- 02-§81.5 -->

### 81.3 Error messages (user requirements)

- Missing protocol: the error message is
  "Länken måste börja med https:// eller http://". <!-- 02-§81.6 -->
- Missing dot (no valid domain): the error message is
  "Länken ser inte ut som en giltig webbadress". <!-- 02-§81.7 -->

### 81.4 Submit gating (site requirements)

- The form must not allow submission while the link field has a validation
  error. The submit button validation checks must include the link field
  state. <!-- 02-§81.8 -->

### 81.5 Implementation constraints

- The validation is implemented in vanilla JavaScript in
  `lagg-till.js`. <!-- 02-§81.9 -->
- The validation reuses the existing `setFieldError` / `clearFieldError`
  helpers. <!-- 02-§81.10 -->

---

---

## 82. Character counter on text input fields

The add-activity and edit-activity forms display a discreet character counter on
text input fields so the user sees how much space remains before hitting the
maximum length.

### 82.1 Affected fields and maximum lengths (site requirements)

- The following fields display a character counter and enforce a `maxlength`
  attribute in HTML: <!-- 02-§82.1 -->

  | Field       | Max length |
  |-------------|-----------|
  | title       | 80        |
  | responsible | 60        |
  | description | 2000      |
  | link        | 500       |

- The `maxlength` attribute is set on each `<input>` and `<textarea>` element in
  both the add-activity form (`render-add.js`) and the edit-activity form
  (`render-edit.js`). <!-- 02-§82.2 -->
- The API validation in `validate.js` uses the same limits. The `responsible`
  field limit is reduced from 200 to 60 to match the new client-side
  constraint. <!-- 02-§82.3 -->

### 82.2 Counter visibility (user requirements)

- The counter is hidden when the field value is below 70 % of the maximum
  length. <!-- 02-§82.4 -->
- The counter becomes visible when the field value reaches or exceeds 70 % of
  the maximum length. <!-- 02-§82.5 -->
- The counter text turns terracotta (`var(--color-terracotta)`) when the field
  value reaches or exceeds 90 % of the maximum length. <!-- 02-§82.6 -->

### 82.3 Counter format and placement (user requirements)

- The counter text shows the current length and the maximum length in the format
  `N / MAX` (e.g. `58 / 80`). <!-- 02-§82.7 -->
- The counter is placed directly below the input field, right-aligned within the
  `.field` container. <!-- 02-§82.8 -->
- The counter uses `font-size: var(--font-size-small)` and
  `color: var(--color-charcoal)` at `opacity: 0.6` by default. <!-- 02-§82.9 -->

### 82.4 Counter updates (site requirements)

- The counter updates on every `input` event on the field. <!-- 02-§82.10 -->
- When the form is reset (e.g. after successful submission), counters are hidden
  again. <!-- 02-§82.11 -->

### 82.5 Both forms (site requirements)

- The character counter is present on both the add-activity form
  (`lagg-till.html`) and the edit-activity form
  (`redigera.html`). <!-- 02-§82.12 -->

### 82.6 Implementation constraints

- The counters are implemented in vanilla JavaScript. <!-- 02-§82.13 -->
- The counters use CSS custom properties from `docs/07-design/css-strategy.md
  §7`. <!-- 02-§82.14 -->
- No new npm dependencies are added. <!-- 02-§82.15 -->

---

---

## 85. Form Draft Cache (sessionStorage)

When filling in the add-activity form, all field values are saved to
`sessionStorage` so that a page reload preserves the user's input.

### 85.1 User requirements

- When the user reloads the add-activity page, all previously entered field
  values are restored automatically. <!-- 02-§85.1 -->
- After a successful submission, the cached draft is cleared so the form
  starts fresh. <!-- 02-§85.2 -->
- The draft cache does not survive closing the browser tab — it only
  protects against reloads within the same session. <!-- 02-§85.3 -->

### 85.2 Site requirements

- All form fields are persisted to `sessionStorage` under a single key
  (`sb_form_draft`). <!-- 02-§85.4 -->
- Text inputs (title, start time, end time, responsible, description, link)
  are saved on every `input` event. <!-- 02-§85.5 -->
- The selected location is saved on `change`. <!-- 02-§85.6 -->
- Selected day-grid dates are saved on click. <!-- 02-§85.7 -->
- On page load, if a draft exists in `sessionStorage`, all fields are
  restored from it before the user interacts with the form. <!-- 02-§85.8 -->
- Restored day-grid selections re-activate the visual selected state and
  update the hidden input. <!-- 02-§85.9 -->
- The draft is removed from `sessionStorage` after a successful
  submission. <!-- 02-§85.10 -->
- The `sb_responsible` field continues to use `localStorage` as before —
  the draft cache does not replace that existing behaviour. <!-- 02-§85.11 -->
- The implementation uses vanilla JavaScript with no new
  dependencies. <!-- 02-§85.12 -->

---

---

## 89. Delete Activity

Participants who submitted an activity can delete it from the edit page.
Deletion removes the event entirely from the camp's YAML file.

### 89.1 Delete button on edit page (user requirements)

- When an event is loaded for editing on `/redigera.html`, a delete button
  is visible below the form. <!-- 02-§89.1 -->
- The button label is "Radera aktivitet" and is styled as a destructive
  action (visually distinct from the save button). <!-- 02-§89.2 -->
- Clicking the delete button shows a confirmation dialog asking the user
  to confirm deletion before proceeding. <!-- 02-§89.3 -->
- The confirmation dialog includes the event title so the user knows
  which event will be deleted. <!-- 02-§89.4 -->
- The confirmation dialog has two buttons: "Ja, radera" (confirm) and
  "Avbryt" (cancel). <!-- 02-§89.5 -->
- After successful deletion, a clear Swedish confirmation is shown. <!-- 02-§89.6 -->
- The delete button is not shown when the editing period is closed or
  when the event date has passed. <!-- 02-§89.7 -->

### 89.2 Delete submit flow (site requirements)

- After the user confirms deletion, a progress modal is shown with
  status steps, matching the style of the edit submit flow (§20). <!-- 02-§89.8 -->
- The progress modal shows steps: sending request, checking activity,
  deleting activity. <!-- 02-§89.9 -->
- On success, the modal shows a confirmation message and a link back
  to the schedule page. <!-- 02-§89.10 -->
- On failure, the modal shows an error message with a retry
  option. <!-- 02-§89.11 -->

### 89.3 Server-side delete endpoint (site requirements)

- A `POST /delete-event` endpoint accepts delete requests. <!-- 02-§89.12 -->
- The server reads the `sb_session` cookie from the request and verifies a valid
  ownership entry for the target event ID — or that the request body contains a
  valid `adminToken` (§91). <!-- 02-§89.13 -->
- If the cookie does not contain valid ownership for the event and no valid admin
  token is provided, the server responds with HTTP 403. <!-- 02-§89.14 -->
- If the event's date has already passed, the server responds with
  HTTP 400. <!-- 02-§89.15 -->
- If the editing period is closed, the server responds with
  HTTP 400. <!-- 02-§89.16 -->
- If validation passes, the server reads the YAML file from GitHub,
  removes the target event entirely, and commits the change via an
  ephemeral branch and PR with auto-merge — the same pipeline used
  for additions and edits. <!-- 02-§89.17 -->

### 89.4 Client-side session cleanup (site requirements)

- After a successful delete, the event ID is removed from the
  `sb_session` cookie on the client side. <!-- 02-§89.18 -->

### 89.5 Constraints

- The delete flow must reuse existing modal, progress, and accessibility
  patterns from the edit submit flow. <!-- 02-§89.19 -->
- CSS must use custom properties from `docs/07-design/css-strategy.md §7`. <!-- 02-§89.20 -->
- No new npm dependencies. <!-- 02-§89.21 -->
- All user-facing text must be in Swedish. <!-- 02-§89.22 -->
- The delete endpoint must use `credentials: 'include'` so that the
  `sb_session` cookie is sent cross-origin. <!-- 02-§89.23 -->

---

---

## 90. Cookie Debug Panel and Session Cookie Repair

### 90.1 Context

The `sb_session` cookie tracks which events the current user has created,
enabling the edit and delete flows. A bug in `removeIdFromCookie`
(redigera.js) writes the cookie back without the `Secure` flag and without
the `Domain` attribute, which can create duplicate cookies with the same
name. Additionally, there is no way for users to inspect what is stored
in the cookie or understand why editing may not work, making cookie
problems difficult to diagnose.

### 90.2 Cookie debug panel (user requirements)

- The edit page (`redigera.html`) must include a collapsible information
  section (e.g. `<details>`) that shows the contents of the user's
  session cookie. <!-- 02-§90.1 -->
- The section must display: <!-- 02-§90.2 -->
  - Whether the page is loaded over HTTP or HTTPS, with a warning if
    HTTP (since the `Secure` flag prevents the cookie from being saved
    over plain HTTP).
  - The cookie domain (from the `data-cookie-domain` attribute on
    `<body>`), or "ej satt" if absent.
  - The number of event IDs currently stored in the cookie.
  - A list of each event ID with its status:
    - "finns i schemat" — the ID exists in `events.json` and the event
      date has not passed.
    - "passerat" — the ID exists in `events.json` but the event date
      has passed (will be cleaned automatically).
    - "hittades inte i schemat" — the ID does not appear in
      `events.json` (may be pending deploy or orphaned).
  - Whether automatic cookie repair was performed during this page
    load (see §90.4).
- The section must be collapsed by default and use a descriptive Swedish
  heading (e.g. "Om din cookie"). <!-- 02-§90.3 -->
- The section must update its content dynamically after `events.json`
  has been fetched. <!-- 02-§90.4 -->

### 90.3 Informational text about event cleanup (user requirements)

- The edit page must display a brief explanation that events whose date
  has passed are automatically removed from the cookie and will not
  appear in the user's list of editable events. <!-- 02-§90.5 -->
- The purpose is to set expectations so the user understands this is
  normal behaviour, not an error. <!-- 02-§90.6 -->

### 90.4 Cookie repair — duplicate detection and merge (site requirements)

- On every page load, `session.js` must detect if more than one
  `sb_session` cookie exists (e.g. one with `Domain` and one
  without). <!-- 02-§90.7 -->
- If duplicates are found, all ID arrays must be parsed, merged, and
  deduplicated. <!-- 02-§90.8 -->
- All existing `sb_session` cookies must be deleted (both the
  exact-host variant and the domain-scoped variant) by setting
  `Max-Age=0`. <!-- 02-§90.9 -->
- A single correct cookie must then be written back with the proper
  attributes (`Path=/`, `Max-Age`, `Secure`, `SameSite=Strict`, and
  `Domain` when configured). <!-- 02-§90.10 -->
- The repair must happen before the existing expiry cleanup, so that
  all valid IDs are preserved. <!-- 02-§90.11 -->

### 90.5 Bug fix — `removeIdFromCookie` attributes (site requirements)

- The `removeIdFromCookie` function in `redigera.js` must write the
  cookie with the same attributes as `session.js`: `Path=/`,
  `Max-Age=604800`, `Secure`, `SameSite=Strict`, and `Domain` when
  `data-cookie-domain` is set on `<body>`. <!-- 02-§90.12 -->
- This fixes a violation of 02-§44.16 (cookie attributes must match
  across all write paths). <!-- 02-§90.13 -->

### 90.6 Constraints

- All user-facing text must be in Swedish. <!-- 02-§90.14 -->
- CSS must use custom properties from `docs/07-design/css-strategy.md §7`. <!-- 02-§90.15 -->
- The debug panel must be accessible (keyboard-navigable, screen-reader
  friendly). <!-- 02-§90.16 -->

---

---

## 99. Conflict Warning in Add/Edit Forms and Activity Pages

### 99.1 Context

The Locale Overview page (§98) shows which locales are already booked,
but a participant filling in the add- or edit-activity form is not
automatically told when the values they have just entered collide with
an existing booking. The server accepts conflicting bookings on
purpose — clashes can be deliberate — so the warning must never
prevent submission. Its job is to surface the clash early, while the
participant is still choosing, and offer a quick path to the Locale
Overview where free slots are visible.

The same warning is also useful on the per-event detail page at
`/schema/<slug>/`: when someone opens an activity that is already in
conflict with another activity, they should see it immediately
alongside the booking details, not have to piece it together from the
schedule. Issue #332 (Session 2).

### 99.2 Shared detection module

- A module at `source/assets/js/client/conflict-check.js` exposes
  `effectiveEnd`, `overlaps`, `markClashes`, `findConflicts`, and
  `findConflictsMulti`. The module contains no DOM access and no
  network code. <!-- 02-§99.1 -->
- The module is consumed by `lagg-till.js`, `redigera.js`,
  `source/build/render-lokaler.js`, `source/build/render-event.js`,
  and the Node test suite. No other copy of the overlap predicate
  exists in the codebase. <!-- 02-§99.2 -->
- Two events conflict when they share the same `date`, share the same
  `location` string (exact match), and their time intervals overlap
  strictly. Back-to-back events (one's `end` equals another's
  `start`) do not conflict. Cross-midnight events (those where
  `end <= start`) are compared with an effective end of `24:00`.
  <!-- 02-§99.3 -->

### 99.3 Add-activity form

- `/lagg-till.html` fetches `/events.json` once per page load and
  caches the response in memory for subsequent conflict checks.
  <!-- 02-§99.4 -->
- When the form has at least one selected date, a start time, an end
  time, and a location, a conflict check runs on every change to any
  of those fields. <!-- 02-§99.5 -->
- When at least one conflict exists on the add form, a banner is
  rendered immediately before the submit button listing each
  conflicting event's time range, title, and responsible person.
  When multiple dates are selected, the banner groups conflicts
  under one subheading per date; dates without conflicts do not
  appear in the banner. <!-- 02-§99.6 -->
- The banner includes a link "Se lokalöversikt →" pointing to
  `/lokaler.html`. <!-- 02-§99.7 -->
- The banner never prevents submit. Submitting a form while the
  banner is visible proceeds normally. <!-- 02-§99.8 -->
- The banner uses `role="status"` and `aria-live="polite"` so
  assistive tech announces new conflicts without stealing focus.
  <!-- 02-§99.9 -->

### 99.4 Edit-activity form

- `/redigera.html` runs the same conflict check after the form is
  populated from `/events.json` and on every subsequent change to
  date, start, end, or location. <!-- 02-§99.10 -->
- The event currently being edited (matched by `id`) is always
  excluded from its own conflict set. <!-- 02-§99.11 -->
- When the form first populates with an event whose current slot
  already conflicts with another event, the banner is shown
  immediately without requiring user interaction. <!-- 02-§99.12 -->
- On the edit form the banner is rendered at the top of the form —
  before the first fieldset — so a clash on a populated event is
  visible right next to the "Redigera aktivitet" heading without
  requiring the user to scroll to the submit button. <!-- 02-§99.18 -->

### 99.5 Language and styling

- All user-facing text in the banner is in Swedish, consistent with
  §14. <!-- 02-§99.13 -->
- Banner styling uses the CSS custom properties defined in
  `docs/07-design/css-strategy.md §7`. The banner reuses the same
  `var(--color-error)` accent and
  `color-mix(in srgb, var(--color-error) 35%, var(--color-white))`
  background as the clash marker on the Locale Overview
  (`.event-block--clash`), so the two clash signals are visually
  related. <!-- 02-§99.14 -->

### 99.6 Per-event activity pages

- Per-event detail pages at `/schema/<slug>/index.html`, rendered by
  `source/build/render-event.js`, include the same conflict-warning
  banner at build time when the event overlaps at least one other
  event in the active camp. The event itself is always excluded from
  its own conflict set. <!-- 02-§99.15 -->
- The banner markup on per-event pages uses the same CSS classes and
  DOM structure as the client-rendered banner in the forms, so a
  single CSS rule styles both. <!-- 02-§99.16 -->
- On the per-event page the banner is rendered inside the
  `.event-detail` container, after the location/responsible row and
  any external-link row, and before the `.event-description` block.
  <!-- 02-§99.17 -->

---

## 101. Signed Session Ownership

### 101.1 Context

The `sb_session` cookie lets participants find, edit, and delete activities
they submitted from the same browser. Event IDs are public because the schedule
and `events.json` expose them, so a plain event-ID list is suitable for UI hints
but not for server-side authorization.

### 101.2 Ownership cookie format

- The session cookie must contain ownership entries that are tamper-resistant
  for server-side authorization. <!-- 02-§101.1 -->
- Each ownership entry must bind an event ID and expiry time to an unguessable
  server-generated proof, such as a signed capability or equivalent verifier.
  <!-- 02-§101.2 -->
- The cookie must remain readable by client-side JavaScript so static schedule
  pages can show edit links for events owned in the current browser.
  <!-- 02-§101.3 -->
- The cookie must keep the existing security attributes: `Path=/`,
  `Max-Age=604800`, `Secure`, `SameSite=Strict`, and `Domain` when configured.
  <!-- 02-§101.4 -->

### 101.3 Server-side authorization

- `POST /edit-event` must authorize participant edits only when the request
  includes a valid ownership entry for the target event ID. <!-- 02-§101.5 -->
- `POST /delete-event` must authorize participant deletes only when the request
  includes a valid ownership entry for the target event ID. <!-- 02-§101.6 -->
- A manually constructed cookie containing only a public event ID must not grant
  edit or delete permission. <!-- 02-§101.7 -->
- Invalid, malformed, expired, or unverifiable ownership entries must be ignored
  for authorization. <!-- 02-§101.8 -->
- Administrators with a valid admin token must retain the existing ability to
  edit or delete any activity. <!-- 02-§101.9 -->

### 101.4 Cookie lifecycle and compatibility

- When an activity is submitted and cookie consent is accepted, the response
  must store a valid ownership entry for each submitted event. <!-- 02-§101.10 -->
- Existing valid ownership entries must be preserved and deduplicated when
  another event is stored in the cookie. <!-- 02-§101.11 -->
- Legacy cookies that contain only event ID strings may be read for client-side
  display or cleanup, but they must not authorize edit or delete requests.
  <!-- 02-§101.12 -->
- The edit page's cookie debug panel must describe unverifiable legacy entries
  clearly enough that users understand why those events may not be editable.
  <!-- 02-§101.13 -->
