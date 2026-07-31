'use strict';

// Locale overview page (02-§98). Issue #332.
//
// Renders a week-wide visual timeline that shows which locales are already
// booked at which times. One row per locale (from local.yaml, in file order),
// one column per camp day, events as absolute-positioned blocks inside their
// day's hour band. Everything is produced server-side; the page ships no
// client-side grid JS.

const { escapeHtml, toDateString } = require('./utils');
const { pageNav, pageFooter } = require('./layout');
const { goatcounterScript } = require('./analytics');
const { pwaHeadTags } = require('./pwa');
const { effectiveEnd, markClashes } = require('../assets/js/client/conflict-check.js');

const FALLBACK_LOCATION = 'Annat';
const WEEKDAYS_SV = ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'];

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseHHMM(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h + (m || 0) / 60;
}

function enumerateDates(startDate, endDate) {
  const out = [];
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function formatDayHeader(isoDate) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  const weekday = WEEKDAYS_SV[d.getUTCDay()];
  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1;
  return `${weekday} ${day}/${month}`;
}

/**
 * Groups events by locale name in the order they appear in the locations list.
 * Events whose `location` value is not found in the list fold into "Annat".
 * Each locale's event list is sorted by date then start time.
 *
 * @param {Array<{id?:string,date:string,start:string,end:string,title:string,location:string,responsible:string}>} events
 * @param {Array<{name:string}>} locations — objects from local.yaml
 * @returns {Map<string, Array>}
 */
function groupEventsByLocation(events, locations) {
  const groups = new Map();
  for (const loc of locations) {
    groups.set(loc.name, []);
  }
  // Ensure an Annat bucket exists even if local.yaml is ever missing it.
  if (!groups.has(FALLBACK_LOCATION)) groups.set(FALLBACK_LOCATION, []);

  for (const ev of events) {
    const key = groups.has(ev.location) ? ev.location : FALLBACK_LOCATION;
    groups.get(key).push(ev);
  }

  for (const arr of groups.values()) {
    arr.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      if (a.start !== b.start) return a.start < b.start ? -1 : 1;
      return 0;
    });
  }

  return groups;
}

/**
 * Computes the horizontal hour band for the grid based on actual event hours.
 * Floors earliest start to the whole hour, ceils latest end. Cross-midnight
 * events (end <= start) are treated as ending at 24:00 for the purpose of
 * this range. Falls back to 08–22 when there are no events.
 *
 * @param {Array} events
 * @returns {{startHour:number, endHour:number}}
 */
function computeHourRange(events) {
  if (!events || events.length === 0) return { startHour: 8, endHour: 22 };
  let minStart = Infinity;
  let maxEnd = -Infinity;
  for (const ev of events) {
    const s = parseHHMM(ev.start);
    let e = parseHHMM(ev.end);
    if (e <= s) e = 24;
    if (s < minStart) minStart = s;
    if (e > maxEnd) maxEnd = e;
  }
  return { startHour: Math.floor(minStart), endHour: Math.ceil(maxEnd) };
}

// `effectiveEnd` comes from the shared conflict-check module (02-§99.1).
// Events where start === end have zero duration and keep their end as-is
// so positionBlock produces width 0 and the block is skipped.

function addOneDayIso(isoDate) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Cross-midnight events (end < start) span two calendar days. Splits such
 * an event into two render slots: one on its own date (start..24:00) and
 * one on the following date (00:00..end). Each slot carries `_part` ("start"
 * or "end") and `_origTime` (the original start–end range for aria-label).
 * Non-cross-midnight events pass through unchanged.
 */
function expandCrossMidnight(events) {
  const out = [];
  for (const ev of events) {
    if (ev.end < ev.start) {
      const origTime = `${ev.start}–${ev.end}`;
      out.push({ ...ev, end: '24:00', _part: 'start', _origTime: origTime });
      out.push({
        ...ev,
        date: addOneDayIso(ev.date),
        start: '00:00',
        _part: 'end',
        _origTime: origTime,
      });
    } else {
      out.push(ev);
    }
  }
  return out;
}

/**
 * Assigns each event to a "lane" so overlapping events stack vertically in
 * the same day band rather than drawing on top of each other. Greedy first-fit:
 * iterate events by start time; place into the first lane whose last event has
 * finished. Returns a shallow clone of events (each with a `_lane` integer)
 * and the total number of lanes needed.
 */
function assignLanes(events) {
  const sorted = [...events]
    .map((e) => ({ ...e }))
    .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  const laneEnds = [];
  for (const ev of sorted) {
    let laneIdx = laneEnds.findIndex((end) => end <= ev.start);
    if (laneIdx === -1) {
      laneIdx = laneEnds.length;
      laneEnds.push(effectiveEnd(ev));
    } else {
      laneEnds[laneIdx] = effectiveEnd(ev);
    }
    ev._lane = laneIdx;
  }
  return { events: sorted, laneCount: laneEnds.length };
}

// `markClashes` comes from the shared conflict-check module (02-§99.2).
// Back-to-back events (end == other.start) do not count as overlapping.

/**
 * Computes the horizontal position (left%, width%) for an event block within
 * a day band spanning [dayStartHour, dayEndHour]. Events extending past the
 * band edges are clipped. Cross-midnight events (end <= start) are clipped
 * at the day end.
 *
 * @param {{start:string,end:string}} event
 * @param {number} dayStartHour
 * @param {number} dayEndHour
 * @returns {{leftPct:number, widthPct:number}}
 */
function positionBlock(event, dayStartHour, dayEndHour) {
  const startH = parseHHMM(event.start);
  let endH = parseHHMM(event.end);
  // Strict `<`: cross-midnight clips to 24:00. Zero-duration (end === start)
  // keeps the original end so widthPct comes out 0 and the caller skips.
  if (endH < startH) endH = 24;

  const clippedStart = Math.max(startH, dayStartHour);
  const clippedEnd = Math.min(endH, dayEndHour);
  const bandHours = dayEndHour - dayStartHour;

  const leftPct = ((clippedStart - dayStartHour) / bandHours) * 100;
  const widthPct = Math.max(0, ((clippedEnd - clippedStart) / bandHours) * 100);
  return { leftPct, widthPct };
}

// ── Rendering ───────────────────────────────────────────────────────────────

function ariaLabelFor(event, locationName, isoDate) {
  const day = formatDayHeader(isoDate);
  const who = event.responsible ? `, ansvarig ${event.responsible}` : '';
  // Cross-midnight events use _origTime (the full original span) in the
  // aria-label, with a trailing hint about the midnight split, so the
  // listener understands both halves represent the same booking.
  const timeLabel = event._origTime || `${event.start}–${event.end}`;
  let continuation = '';
  if (event._part === 'start') continuation = ' (fortsätter nästa dag)';
  else if (event._part === 'end') continuation = ' (från föregående dag)';
  return `${locationName}, ${day}, ${timeLabel} ${event.title}${who}${continuation}`;
}

// CSS is emitted in a single <style> block to keep the HTML free of inline
// style attributes (html-validate: no-inline-style). Each event block gets a
// data-lb attribute that is targeted from that block.
function blockCssSelector(dataLb) {
  // dataLb values come from event IDs which are slug-format (letters, digits,
  // hyphens). We still escape for safety.
  return `[data-lb="${dataLb.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`;
}

function renderEventBlock(event, locationName, isoDate, positionRules, blockIndex) {
  const { leftPct, widthPct } = positionBlock(
    event,
    positionRules.dayStartHour,
    positionRules.dayEndHour,
  );
  if (widthPct <= 0) return '';

  // Cross-midnight events produce two slots with the same event.id; suffix
  // the split part so data-lb stays unique (CSS selectors need uniqueness).
  const partSuffix = event._part ? `--${event._part}` : '';
  const dataLb = `${event.id || `evt-${blockIndex}`}${partSuffix}`;
  // left/width position the block horizontally; --lane selects its vertical
  // sub-row, and --group is the local lane count (how many events actually
  // overlap this one in time, counting itself). Using a per-event --group
  // instead of a day-wide lane count means non-clashing events in an
  // otherwise-crowded day still take their full day-band height.
  const lane = event._lane || 0;
  const group = event._groupSize || 1;
  positionRules.rules.push(
    `${blockCssSelector(dataLb)}{left:${leftPct.toFixed(4)}%;width:${widthPct.toFixed(4)}%;--lane:${lane};--group:${group};}`,
  );

  const href = event.id ? `schema/${encodeURIComponent(event.id)}/` : 'schema.html';
  const aria = escapeHtml(ariaLabelFor(event, locationName, isoDate));
  const title = escapeHtml(event.title);
  const time = `${escapeHtml(event.start)}–${escapeHtml(event.end)}`;
  const resp = event.responsible ? escapeHtml(event.responsible) : '';
  const dataLbAttr = escapeHtml(dataLb);
  const clashClass = event._clash ? ' event-block--clash' : '';
  return `<a class="event-block${clashClass}" data-lb="${dataLbAttr}" href="${href}" aria-label="${aria}"><span class="event-block__title">${title}</span><span class="event-block__time">${time}</span>${resp ? `<span class="event-block__resp">${resp}</span>` : ''}</a>`;
}

function renderDayBand(eventsOnDay, locationName, isoDate, positionRules) {
  const { events: laned, laneCount } = assignLanes(eventsOnDay);
  markClashes(laned);

  // Per-event "group size": how many events (including itself) are active
  // during any moment of this event's time range. Used for per-event height
  // so non-overlapping events take full band height even on crowded days.
  for (const ev of laned) {
    let count = 0;
    for (const other of laned) {
      if (other.start < effectiveEnd(ev) && effectiveEnd(other) > ev.start) count++;
    }
    ev._groupSize = count;
  }

  const blocks = laned
    .map((ev, i) => renderEventBlock(ev, locationName, isoDate, positionRules, `${locationName}-${isoDate}-${i}`))
    .filter(Boolean)
    .join('');
  const lanesClass = laneCount > 1 ? ` day-band--lanes-${Math.min(laneCount, 5)}` : '';
  return `<td class="day-band${lanesClass}">${blocks}</td>`;
}

function renderLokalRow(locationName, locationEvents, campDates, positionRules) {
  const hasEvents = locationEvents.length > 0;
  const emptyTag = hasEvents ? '' : '<span class="lokal-empty">Inga bokningar</span>';
  const label = `<th class="lokal-label" scope="row">${escapeHtml(locationName)}${emptyTag}</th>`;

  const byDate = new Map(campDates.map((d) => [d, []]));
  for (const ev of locationEvents) {
    if (byDate.has(ev.date)) byDate.get(ev.date).push(ev);
  }

  const bands = campDates
    .map((d) => renderDayBand(byDate.get(d) || [], locationName, d, positionRules))
    .join('');

  const rowClass = hasEvents ? 'lokal-row' : 'lokal-row lokal-row--empty';
  return `<tr class="${rowClass}">${label}${bands}</tr>`;
}

function renderDayHeader(isoDate) {
  return `<th class="day-band-label" scope="col">${escapeHtml(formatDayHeader(isoDate))}</th>`;
}

/**
 * Renders the full /lokaler.html page.
 *
 * @param {Object} camp                  — active camp (with name, start_date, end_date)
 * @param {Array<{name:string}>} locations — locations from local.yaml (order matters)
 * @param {Array} events                 — events for the active camp
 * @param {string} [footerHtml]
 * @param {Array} [navSections]
 * @param {string} [goatcounterCode]
 * @returns {string}
 */
function renderLokalerPage(camp, locations, events, footerHtml = '', navSections = [], goatcounterCode = '', today = null) {
  const campName = escapeHtml(camp.name);
  const startDate = toDateString(camp.start_date);
  const endDate = toDateString(camp.end_date);
  const todayIso = today || new Date().toISOString().slice(0, 10);

  // Show today..end_date. If the camp is fully in the past the filter would
  // give an empty grid — fall back to the full camp span so the page still
  // renders meaningfully (defensive; resolveActiveCamp would typically have
  // picked the next upcoming camp before we get here).
  const allDates = enumerateDates(startDate, endDate);
  const futureDates = allDates.filter((d) => d >= todayIso);
  const campDates = futureDates.length > 0 ? futureDates : allDates;

  // Filter events to the same window so the hour band and per-locale
  // groupings reflect only what's shown. Cross-midnight events are split
  // here so each half lands in the correct day's column.
  const visibleDateSet = new Set(campDates);
  const expanded = expandCrossMidnight(events);
  const visibleEvents = expanded.filter((e) => visibleDateSet.has(e.date));

  const { startHour, endHour } = computeHourRange(visibleEvents);
  const groups = groupEventsByLocation(visibleEvents, locations);

  const positionRules = { dayStartHour: startHour, dayEndHour: endHour, rules: [] };

  const dayHeaders = campDates.map(renderDayHeader).join('');
  const rows = [...groups.entries()]
    .map(([name, evts]) => renderLokalRow(name, evts, campDates, positionRules))
    .join('\n');

  // One inline <style> block covers the grid sizing and per-event positions.
  // This avoids `style=""` attributes in rendered markup (html-validate:
  // no-inline-style) while still allowing dynamic per-event placement.
  const gridStyleBlock = `<style>
.lokaler-grid { --lokaler-day-count: ${campDates.length}; --lokaler-hour-span: ${endHour - startHour}; }
${positionRules.rules.join('\n')}
</style>`;

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Lokalöversikt – ${campName}</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="site.css">
  <link rel="icon" type="image/png" href="images/sbsommar-icon-192.png">
${pwaHeadTags()}
  ${gridStyleBlock}
</head>
<body>
${pageNav('lokaler.html', navSections)}
<main>
  <h1>Lokalöversikt</h1>
  <p class="intro">Se vilka tider varje lokal redan är upptagen — välj en ledig tid när du <a href="lagg-till.html">lägger till en aktivitet</a>. Klicka på ett tidsblock för mer information.</p>

  <p class="lokaler-legend">Varje färgat block är en bokad aktivitet. Rader märkta "Inga bokningar" betyder att lokalen är ledig hela lägret. Behöver du flytta något du lagt till? <a href="redigera.html">Redigera aktivitet</a>.</p>

  <div class="lokaler-grid-wrapper">
    <table class="lokaler-grid" aria-label="Lokaler mot dagar — bokningsöversikt">
      <thead>
        <tr class="lokaler-grid-header-row">
          <th class="lokaler-grid-corner" scope="col">Lokaler \\ Dag</th>
${dayHeaders}
        </tr>
      </thead>
      <tbody>
${rows}
      </tbody>
    </table>
  </div>
</main>
  <script src="wp-cleanup.js"></script>
  <script src="nav.js" defer></script>
  <script src="feedback.js" defer></script>
  <script src="sw-register.js" defer></script>
  <script src="pwa-install.js" defer></script>${goatcounterScript(goatcounterCode)}
${pageFooter(footerHtml)}
</body>
</html>
`;
}

module.exports = {
  renderLokalerPage,
  groupEventsByLocation,
  computeHourRange,
  positionBlock,
};
