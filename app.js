'use strict';

const express   = require('express');
const rateLimit = require('express-rate-limit');
const fs        = require('fs');
const path      = require('path');
const yaml      = require('js-yaml');

const { addEventToActiveCamp, updateEventInActiveCamp, removeEventFromActiveCamp, slugify } = require('./source/api/github');
const { validateEventRequest, validateEditRequest }              = require('./source/api/validate');
const { isEventPast }                                            = require('./source/api/edit-event');
const {
  parseVerifiedSessionIds,
  createOwnershipEntry,
  buildSetCookieHeader,
  mergeOwnershipEntries,
} = require('./source/api/session');
const { isBeforeEditingPeriod, isAfterEditingPeriod }            = require('./source/api/time-gate');
const { validateFeedbackRequest, createFeedbackIssue }           = require('./source/api/feedback');
const { parseAdminTokens, verifyAdminToken }                     = require('./source/api/admin');
const { resolveActiveCamp }                                      = require('./source/scripts/resolve-active-camp');

const app = express();

// 02-§93.15: only honour X-Forwarded-For from a loopback-connected proxy.
app.set('trust proxy', 'loopback');

// ── Load active camp metadata for time-gating ───────────────────────────────

const campsPath = path.join(__dirname, 'source', 'data', 'camps.yaml');
const campsData = yaml.load(fs.readFileSync(campsPath, 'utf8'));
const BUILD_ENV = process.env.BUILD_ENV || undefined;
const activeCamp = resolveActiveCamp(campsData.camps || [], undefined, BUILD_ENV);
const adminTokens = parseAdminTokens(process.env.ADMIN_TOKENS);
const sessionSecret = process.env.SESSION_SECRET || '';

// ── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json());

// 02-§93.1–§93.8: per-endpoint rate limiters.
const HOUR_MS = 60 * 60 * 1000;
const RATE_LIMIT_MSG = 'För många förfrågningar. Försök igen senare.';

function makeLimiter({ limit, windowMs, includeSuccess = true }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      const body = includeSuccess
        ? { success: false, error: RATE_LIMIT_MSG }
        : { error: RATE_LIMIT_MSG };
      res.status(429).json(body);
    },
  });
}

const verifyAdminLimiter = makeLimiter({ limit: 5,  windowMs: HOUR_MS, includeSuccess: false });
const addEventLimiter    = makeLimiter({ limit: 30, windowMs: HOUR_MS });
const editEventLimiter   = makeLimiter({ limit: 30, windowMs: HOUR_MS });
const deleteEventLimiter = makeLimiter({ limit: 30, windowMs: HOUR_MS });
const feedbackLimiter    = makeLimiter({ limit: 5,  windowMs: HOUR_MS });

const ALLOWED_ORIGINS = new Set(
  [process.env.ALLOWED_ORIGIN, process.env.QA_ORIGIN].filter(Boolean)
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────

// Health check (on /api/health so that / serves index.html via express.static)
app.get('/api/health', (req, res) => {
  res.json({ status: 'API running' });
});

// ── Admin token verification (02-§91.4) ─────────────────────────────────────

app.post('/verify-admin', verifyAdminLimiter, (req, res) => {
  const { token } = req.body || {};
  if (verifyAdminToken(token, adminTokens)) {
    return res.json({ valid: true });
  }
  return res.status(403).json({ valid: false });
});

app.post('/add-event', addEventLimiter, (req, res) => {
  // Time-gating with admin bypass (02-§26.17, 02-§26.18).
  if (activeCamp) {
    const today = new Date().toISOString().slice(0, 10);
    if (isAfterEditingPeriod(today, activeCamp.end_date)) {
      return res.status(403).json({ success: false, error: 'Det går inte att lägga till aktiviteter just nu. Formuläret är inte öppet.' });
    }
    if (isBeforeEditingPeriod(today, activeCamp.opens_for_editing)
        && !verifyAdminToken(req.body.adminToken, adminTokens)) {
      return res.status(403).json({ success: false, error: 'Det går inte att lägga till aktiviteter just nu. Formuläret är inte öppet.' });
    }
  }

  const v = validateEventRequest(req.body, activeCamp);
  if (!v.ok) {
    return res.status(400).json({ success: false, error: v.error });
  }

  const consentGiven = req.body.cookieConsent === true;
  if (consentGiven && !sessionSecret) {
    return res.status(500).json({
      success: false,
      error: 'Sessionen kunde inte sparas. Kontakta arrangören.',
    });
  }

  // Build the event ID the same way github.js does, so we can include it
  // in the session cookie before the GitHub commit completes.
  const title  = String(req.body.title).trim();
  const date   = String(req.body.date).trim();
  const start  = String(req.body.start).trim();
  const eventId = `${slugify(title)}-${date}-${start.replace(':', '')}`;

  // If the client signalled cookie consent, update the session cookie.
  if (consentGiven) {
    const existing = parseVerifiedSessionIds(req.headers.cookie || '', sessionSecret)
      .map((id) => createOwnershipEntry(id, sessionSecret));
    const updated  = mergeOwnershipEntries(existing, createOwnershipEntry(eventId, sessionSecret));
    res.setHeader('Set-Cookie', buildSetCookieHeader(updated, process.env.COOKIE_DOMAIN));
  }

  res.json({ success: true, eventId });

  addEventToActiveCamp(req.body).catch((err) => {
    console.error('POST /add-event background error:', err.message);
  });
});

app.post('/edit-event', editEventLimiter, (req, res) => {
  const isAdmin = verifyAdminToken(req.body.adminToken, adminTokens);

  // Time-gating with admin bypass (02-§26.17, 02-§26.18).
  if (activeCamp) {
    const today = new Date().toISOString().slice(0, 10);
    if (isAfterEditingPeriod(today, activeCamp.end_date)) {
      return res.status(403).json({ success: false, error: 'Det går inte att redigera aktiviteter just nu. Formuläret är inte öppet.' });
    }
    if (isBeforeEditingPeriod(today, activeCamp.opens_for_editing) && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Det går inte att redigera aktiviteter just nu. Formuläret är inte öppet.' });
    }
  }

  const v = validateEditRequest(req.body, activeCamp);
  if (!v.ok) {
    return res.status(400).json({ success: false, error: v.error });
  }

  const eventId = String(req.body.id).trim();

  // Verify ownership: event ID must have signed session ownership OR
  // the request must carry a valid admin token (02-§7.3, §18.31).
  const ownedIds = parseVerifiedSessionIds(req.headers.cookie || '', sessionSecret);
  if (!ownedIds.includes(eventId) && !isAdmin) {
    return res.status(403).json({ success: false, error: 'Ej behörig att redigera denna aktivitet.' });
  }

  // Reject past events.
  if (isEventPast(String(req.body.date).trim())) {
    return res.status(400).json({ success: false, error: 'Aktiviteten har redan ägt rum och kan inte redigeras.' });
  }

  res.json({ success: true });

  updateEventInActiveCamp(eventId, req.body).catch((err) => {
    console.error('POST /edit-event background error:', err.message);
  });
});

app.post('/delete-event', deleteEventLimiter, (req, res) => {
  const isAdmin = verifyAdminToken(req.body.adminToken, adminTokens);

  // Time-gating with admin bypass (02-§26.17, 02-§26.18).
  if (activeCamp) {
    const today = new Date().toISOString().slice(0, 10);
    if (isAfterEditingPeriod(today, activeCamp.end_date)) {
      return res.status(400).json({ success: false, error: 'Det går inte att radera aktiviteter just nu. Formuläret är inte öppet.' });
    }
    if (isBeforeEditingPeriod(today, activeCamp.opens_for_editing) && !isAdmin) {
      return res.status(400).json({ success: false, error: 'Det går inte att radera aktiviteter just nu. Formuläret är inte öppet.' });
    }
  }

  const eventId = String(req.body.id || '').trim();
  if (!eventId) {
    return res.status(400).json({ success: false, error: 'Aktivitets-ID saknas.' });
  }

  // Verify ownership: event ID must have signed session ownership OR
  // the request must carry a valid admin token (02-§7.3, §89.13).
  const ownedIds = parseVerifiedSessionIds(req.headers.cookie || '', sessionSecret);
  if (!ownedIds.includes(eventId) && !isAdmin) {
    return res.status(403).json({ success: false, error: 'Ej behörig att radera denna aktivitet.' });
  }

  // Reject past events.
  if (isEventPast(String(req.body.date || '').trim())) {
    return res.status(400).json({ success: false, error: 'Aktiviteten har redan ägt rum och kan inte raderas.' });
  }

  res.json({ success: true });

  removeEventFromActiveCamp(eventId).catch((err) => {
    console.error('POST /delete-event background error:', err.message);
  });
});

app.post('/feedback', feedbackLimiter, async (req, res) => {
  const v = validateFeedbackRequest(req.body);
  if (!v.ok) {
    return res.status(400).json({ success: false, error: v.error });
  }

  // Honeypot triggered — pretend success
  if (v.honeypot) {
    return res.json({ success: true, issueUrl: '' });
  }

  if (BUILD_ENV !== 'production' && BUILD_ENV !== 'qa') {
    console.log('[feedback dry-run]', JSON.stringify(req.body, null, 2));
    return res.json({ success: true, issueUrl: '' });
  }

  try {
    const issueUrl = await createFeedbackIssue(req.body);
    res.json({ success: true, issueUrl });
  } catch (err) {
    console.error('POST /feedback error:', err.message);
    res.status(500).json({ success: false, error: 'Kunde inte skapa feedback. Försök igen om en stund.' });
  }
});

// Static LAST
app.use(express.static(path.join(__dirname, 'public')));

// ── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SB Sommar → http://localhost:${PORT}`);
});

module.exports = app;
