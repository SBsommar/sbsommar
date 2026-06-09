<?php

declare(strict_types=1);

// ── Bootstrap ────────────────────────────────────────────────────────────

require_once __DIR__ . '/vendor/autoload.php';

use SBSommar\ActiveCamp;
use SBSommar\Admin;
use SBSommar\Feedback;
use SBSommar\GitHub;
use SBSommar\RateLimit;
use SBSommar\Session;
use SBSommar\TimeGate;
use SBSommar\Validate;
use Symfony\Component\Yaml\Yaml;

// Load .env from outside the web root (server-managed, not committed).
// On the server the API runs from $DEPLOY_DIR/public_html/api/, so the
// secret lives two levels up at $DEPLOY_DIR/.env — never under public_html
// (§100, 02-§100.1–02-§100.2).
$envDir = dirname(__DIR__, 2);
if (file_exists($envDir . '/.env')) {
    \Dotenv\Dotenv::createImmutable($envDir)->load();
}

// ── CORS ─────────────────────────────────────────────────────────────────

$allowedOrigins = array_filter([
    $_ENV['ALLOWED_ORIGIN'] ?? '',
    $_ENV['QA_ORIGIN'] ?? '',
]);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Rate-limit configuration (02-§93.1–93.4) ─────────────────────────────

const HOUR_SECONDS              = 3600;
const RATE_LIMIT_MSG            = 'För många förfrågningar. Försök igen senare.';
const RATE_LIMIT_VERIFY_ADMIN   = 5;
const RATE_LIMIT_ADD_EVENT      = 30;
const RATE_LIMIT_EDIT_EVENT     = 30;
const RATE_LIMIT_DELETE_EVENT   = 30;
const RATE_LIMIT_FEEDBACK       = 5;

function clientIp(): string
{
    return (string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '');
}

// ── Routing ──────────────────────────────────────────────────────────────

// Strip /api prefix and query string to get the route path.
$uri   = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$route = preg_replace('#^/api#', '', $uri);
$route = $route === '' ? '/' : $route;

$method = $_SERVER['REQUEST_METHOD'];

// ── Resolve active camp for time-gating ──────────────────────────────────

$activeCamp = null;
try {
    $campsPath = dirname(__DIR__) . '/source/data/camps.yaml';
    if (file_exists($campsPath)) {
        $campsData  = Yaml::parseFile($campsPath);
        $buildEnv   = $_ENV['BUILD_ENV'] ?? null;
        $activeCamp = ActiveCamp::resolve($campsData['camps'] ?? [], null, $buildEnv);
    }
} catch (\Throwable $e) {
    // Non-fatal: if camp resolution fails, time-gating is skipped.
    // This can happen when deployed without the source/ directory.
}

// ── Parse configured admin tokens once ───────────────────────────────────

$adminTokens = Admin::parseAdminTokens($_ENV['ADMIN_TOKENS'] ?? null);

// ── Handlers ─────────────────────────────────────────────────────────────

header('Content-Type: application/json; charset=utf-8');

try {
    match (true) {
        $method === 'GET' && $route === '/health'
            => jsonResponse(['status' => 'API running']),

        $method === 'GET' && $route === '/cleanup-cookies'
            => handleCleanupCookies(),

        $method === 'POST' && $route === '/add-event'
            => handleAddEvent($activeCamp, $adminTokens),

        $method === 'POST' && $route === '/add-events'
            => handleAddEvents($activeCamp, $adminTokens),

        $method === 'POST' && $route === '/edit-event'
            => handleEditEvent($activeCamp, $adminTokens),

        $method === 'POST' && $route === '/delete-event'
            => handleDeleteEvent($activeCamp, $adminTokens),

        $method === 'POST' && $route === '/feedback'
            => handleFeedback(),

        $method === 'POST' && $route === '/verify-admin'
            => handleVerifyAdmin($adminTokens),

        default
            => jsonResponse(['error' => 'Not found'], 404),
    };
} catch (\Throwable $e) {
    error_log('PHP API error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'error' => GitHub::classifyGitHubError($e)], 500);
}

// ── Route handlers ───────────────────────────────────────────────────────

function handleCleanupCookies(): void
{
    // Expire known WordPress/Blocksy HttpOnly cookies left over from the
    // previous site.  JavaScript cannot delete these — only the server can.
    $stale = ['PHPSESSID', 'wordpress_test_cookie', 'wp_lang'];

    // Also match dynamic WordPress cookies (e.g. wordpress_logged_in_<hash>).
    foreach (array_keys($_COOKIE) as $name) {
        if (str_starts_with($name, 'wordpress_') || str_starts_with($name, 'wp-')) {
            $stale[] = $name;
        }
    }

    $domain = !empty($_ENV['COOKIE_DOMAIN']) ? $_ENV['COOKIE_DOMAIN'] : '';

    foreach (array_unique($stale) as $name) {
        // Send multiple variations to cover however the cookie was originally set.
        setcookie($name, '', ['expires' => 1, 'path' => '/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
        if ($domain) {
            setcookie($name, '', ['expires' => 1, 'path' => '/', 'domain' => $domain, 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
            setcookie($name, '', ['expires' => 1, 'path' => '/', 'domain' => '.' . $domain, 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
        }
    }

    jsonResponse(['cleaned' => count(array_unique($stale))]);
}

/** @param list<string> $adminTokens */
function handleAddEvent(?array $activeCamp, array $adminTokens): void
{
    if (RateLimit::isLimited(clientIp(), 'add-event', RATE_LIMIT_ADD_EVENT, HOUR_SECONDS)) {
        jsonResponse(['success' => false, 'error' => RATE_LIMIT_MSG], 429);

        return;
    }

    $body = getJsonBody();

    // Time-gating with admin bypass (02-§26.17, 02-§26.18)
    if ($activeCamp !== null) {
        $today   = date('Y-m-d');
        $opens   = (string) ($activeCamp['opens_for_editing'] ?? '');
        $endDate = (string) ($activeCamp['end_date'] ?? '');
        if (TimeGate::isAfterEditingPeriod($today, $endDate)
            || (TimeGate::isBeforeEditingPeriod($today, $opens)
                && !Admin::verifyAdminToken($body['adminToken'] ?? null, $adminTokens))
        ) {
            jsonResponse([
                'success' => false,
                'error'   => 'Det går inte att lägga till aktiviteter just nu. Formuläret är inte öppet.',
            ], 403);

            return;
        }
    }

    $v = Validate::validateEventRequest($body, $activeCamp);
    if (!$v['ok']) {
        jsonResponse(['success' => false, 'error' => $v['error']], 400);

        return;
    }

    // Build event ID (same logic as github.js)
    $title   = trim((string) ($body['title'] ?? ''));
    $date    = trim((string) ($body['date'] ?? ''));
    $start   = trim((string) ($body['start'] ?? ''));
    $eventId = GitHub::slugify($title) . "-{$date}-" . str_replace(':', '', $start);

    // Commit to GitHub synchronously so the user sees errors
    try {
        $gh = new GitHub();
        $gh->addEventToActiveCamp($body);
    } catch (\Throwable $e) {
        error_log('POST /add-event error: ' . $e->getMessage());
        jsonResponse(['success' => false, 'error' => GitHub::classifyGitHubError($e)], 500);

        return;
    }

    // Session cookie (only if consent given) — set AFTER successful GitHub
    // commit so the browser never stores an ID for an event that failed to save.
    $consentGiven = ($body['cookieConsent'] ?? false) === true;
    if ($consentGiven) {
        $existing = Session::parseSessionIds($_SERVER['HTTP_COOKIE'] ?? '');
        $updated  = Session::mergeIds($existing, $eventId);
        $cookieDomain = !empty($_ENV['COOKIE_DOMAIN']) ? $_ENV['COOKIE_DOMAIN'] : null;
        header('Set-Cookie: ' . Session::buildSetCookieHeader($updated, $cookieDomain));
    }

    jsonResponse(['success' => true, 'eventId' => $eventId]);
}

/** @param list<string> $adminTokens */
function handleAddEvents(?array $activeCamp, array $adminTokens): void
{
    if (RateLimit::isLimited(clientIp(), 'add-events', RATE_LIMIT_ADD_EVENT, HOUR_SECONDS)) {
        jsonResponse(['success' => false, 'error' => RATE_LIMIT_MSG], 429);

        return;
    }

    $body = getJsonBody();

    // Time-gating with admin bypass (02-§26.17, 02-§26.18)
    if ($activeCamp !== null) {
        $today   = date('Y-m-d');
        $opens   = (string) ($activeCamp['opens_for_editing'] ?? '');
        $endDate = (string) ($activeCamp['end_date'] ?? '');
        if (TimeGate::isAfterEditingPeriod($today, $endDate)
            || (TimeGate::isBeforeEditingPeriod($today, $opens)
                && !Admin::verifyAdminToken($body['adminToken'] ?? null, $adminTokens))
        ) {
            jsonResponse([
                'success' => false,
                'error'   => 'Det går inte att lägga till aktiviteter just nu. Formuläret är inte öppet.',
            ], 403);

            return;
        }
    }

    $v = Validate::validateBatchEventRequest($body, $activeCamp);
    if (!$v['ok']) {
        jsonResponse(['success' => false, 'error' => $v['error']], 400);

        return;
    }

    // Commit all events to GitHub in a single PR
    try {
        $gh = new GitHub();
        $eventIds = $gh->addEventsToActiveCamp($body);
    } catch (\Throwable $e) {
        error_log('POST /add-events error: ' . $e->getMessage());
        jsonResponse(['success' => false, 'error' => GitHub::classifyGitHubError($e)], 500);

        return;
    }

    // Session cookie — add all event IDs (only if consent given)
    $consentGiven = ($body['cookieConsent'] ?? false) === true;
    if ($consentGiven) {
        $existing = Session::parseSessionIds($_SERVER['HTTP_COOKIE'] ?? '');
        $updated  = $existing;
        foreach ($eventIds as $eid) {
            $updated = Session::mergeIds($updated, $eid);
        }
        $cookieDomain = !empty($_ENV['COOKIE_DOMAIN']) ? $_ENV['COOKIE_DOMAIN'] : null;
        header('Set-Cookie: ' . Session::buildSetCookieHeader($updated, $cookieDomain));
    }

    jsonResponse(['success' => true, 'eventIds' => $eventIds]);
}

/** @param list<string> $adminTokens */
function handleEditEvent(?array $activeCamp, array $adminTokens): void
{
    if (RateLimit::isLimited(clientIp(), 'edit-event', RATE_LIMIT_EDIT_EVENT, HOUR_SECONDS)) {
        jsonResponse(['success' => false, 'error' => RATE_LIMIT_MSG], 429);

        return;
    }

    $body    = getJsonBody();
    $isAdmin = Admin::verifyAdminToken($body['adminToken'] ?? null, $adminTokens);

    // Time-gating with admin bypass (02-§26.17, 02-§26.18)
    if ($activeCamp !== null) {
        $today   = date('Y-m-d');
        $opens   = (string) ($activeCamp['opens_for_editing'] ?? '');
        $endDate = (string) ($activeCamp['end_date'] ?? '');
        if (TimeGate::isAfterEditingPeriod($today, $endDate)
            || (TimeGate::isBeforeEditingPeriod($today, $opens) && !$isAdmin)
        ) {
            jsonResponse([
                'success' => false,
                'error'   => 'Det går inte att redigera aktiviteter just nu. Formuläret är inte öppet.',
            ], 403);

            return;
        }
    }

    $v = Validate::validateEditRequest($body, $activeCamp);
    if (!$v['ok']) {
        jsonResponse(['success' => false, 'error' => $v['error']], 400);

        return;
    }

    $eventId = trim((string) ($body['id'] ?? ''));

    // Verify ownership: event ID in session cookie OR valid admin token
    // (02-§7.3, §18.31).
    $ownedIds = Session::parseSessionIds($_SERVER['HTTP_COOKIE'] ?? '');
    if (!in_array($eventId, $ownedIds, true) && !$isAdmin) {
        jsonResponse([
            'success' => false,
            'error'   => 'Ej behörig att redigera denna aktivitet.',
        ], 403);

        return;
    }

    // Reject past events
    $eventDate = trim((string) ($body['date'] ?? ''));
    if ($eventDate < date('Y-m-d')) {
        jsonResponse([
            'success' => false,
            'error'   => 'Aktiviteten har redan ägt rum och kan inte redigeras.',
        ], 400);

        return;
    }

    // Commit to GitHub synchronously so the user sees errors
    try {
        $gh = new GitHub();
        $gh->updateEventInActiveCamp($eventId, $body);
    } catch (\Throwable $e) {
        error_log('POST /edit-event error: ' . $e->getMessage());
        jsonResponse(['success' => false, 'error' => GitHub::classifyGitHubError($e)], 500);

        return;
    }

    jsonResponse(['success' => true]);
}

/** @param list<string> $adminTokens */
function handleDeleteEvent(?array $activeCamp, array $adminTokens): void
{
    if (RateLimit::isLimited(clientIp(), 'delete-event', RATE_LIMIT_DELETE_EVENT, HOUR_SECONDS)) {
        jsonResponse(['success' => false, 'error' => RATE_LIMIT_MSG], 429);

        return;
    }

    $body    = getJsonBody();
    $isAdmin = Admin::verifyAdminToken($body['adminToken'] ?? null, $adminTokens);

    // Time-gating with admin bypass (02-§26.17, 02-§26.18)
    if ($activeCamp !== null) {
        $today   = date('Y-m-d');
        $opens   = (string) ($activeCamp['opens_for_editing'] ?? '');
        $endDate = (string) ($activeCamp['end_date'] ?? '');
        if (TimeGate::isAfterEditingPeriod($today, $endDate)
            || (TimeGate::isBeforeEditingPeriod($today, $opens) && !$isAdmin)
        ) {
            jsonResponse([
                'success' => false,
                'error'   => 'Det går inte att radera aktiviteter just nu. Formuläret är inte öppet.',
            ], 403);

            return;
        }
    }

    $eventId = trim((string) ($body['id'] ?? ''));
    if ($eventId === '') {
        jsonResponse(['success' => false, 'error' => 'Aktivitets-ID saknas.'], 400);

        return;
    }

    // Verify ownership: event ID in session cookie OR valid admin token
    // (02-§7.3, §89.13).
    $ownedIds = Session::parseSessionIds($_SERVER['HTTP_COOKIE'] ?? '');
    if (!in_array($eventId, $ownedIds, true) && !$isAdmin) {
        jsonResponse([
            'success' => false,
            'error'   => 'Ej behörig att radera denna aktivitet.',
        ], 403);

        return;
    }

    // Reject past events
    $eventDate = trim((string) ($body['date'] ?? ''));
    if ($eventDate !== '' && $eventDate < date('Y-m-d')) {
        jsonResponse([
            'success' => false,
            'error'   => 'Aktiviteten har redan ägt rum och kan inte raderas.',
        ], 400);

        return;
    }

    // Commit to GitHub synchronously so the user sees errors
    try {
        $gh = new GitHub();
        $gh->removeEventFromActiveCamp($eventId);
    } catch (\Throwable $e) {
        error_log('POST /delete-event error: ' . $e->getMessage());
        jsonResponse(['success' => false, 'error' => GitHub::classifyGitHubError($e)], 500);

        return;
    }

    jsonResponse(['success' => true]);
}

function handleFeedback(): void
{
    if (RateLimit::isLimited(clientIp(), 'feedback', RATE_LIMIT_FEEDBACK, HOUR_SECONDS)) {
        jsonResponse(['success' => false, 'error' => RATE_LIMIT_MSG], 429);

        return;
    }

    $body = getJsonBody();
    $v = Feedback::validate($body);

    if (!$v['ok']) {
        jsonResponse(['success' => false, 'error' => $v['error']], 400);

        return;
    }

    // Honeypot triggered — pretend success
    if (!empty($v['honeypot'])) {
        jsonResponse(['success' => true, 'issueUrl' => '']);

        return;
    }

    $buildEnv = $_ENV['BUILD_ENV'] ?? null;
    if ($buildEnv !== 'production' && $buildEnv !== 'qa') {
        error_log('[feedback dry-run] ' . json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        jsonResponse(['success' => true, 'issueUrl' => '']);

        return;
    }

    try {
        $issueUrl = Feedback::createIssue($body);
        jsonResponse(['success' => true, 'issueUrl' => $issueUrl]);
    } catch (\Throwable $e) {
        error_log('POST /feedback error: ' . $e->getMessage());
        jsonResponse([
            'success' => false,
            'error'   => 'Kunde inte skapa feedback. Försök igen om en stund.',
        ], 500);
    }
}

/** @param list<string> $adminTokens */
function handleVerifyAdmin(array $adminTokens): void
{
    if (RateLimit::isLimited(clientIp(), 'verify-admin', RATE_LIMIT_VERIFY_ADMIN, HOUR_SECONDS)) {
        jsonResponse(['error' => RATE_LIMIT_MSG], 429);

        return;
    }

    $body  = getJsonBody();
    $token = trim((string) ($body['token'] ?? ''));

    if (Admin::verifyAdminToken($token, $adminTokens)) {
        jsonResponse(['valid' => true]);
    } else {
        jsonResponse(['valid' => false], 403);
    }
}

// ── Utilities ────────────────────────────────────────────────────────────

/** @return array<string,mixed> */
function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) {
        return [];
    }
    $data = json_decode($raw, true);

    return is_array($data) ? $data : [];
}

/** @param array<string,mixed> $data */
function jsonResponse(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}
