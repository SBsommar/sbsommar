<?php

declare(strict_types=1);

// ── Bootstrap ────────────────────────────────────────────────────────────

require_once __DIR__ . '/vendor/autoload.php';

use SBSommar\ActiveCamp;
use SBSommar\Admin;
use SBSommar\DuplicateEventException;
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
const RATE_LIMIT_MINT_TOKEN     = 5;
const RATE_LIMIT_ADD_EVENT      = 30;
const RATE_LIMIT_EDIT_EVENT     = 30;
const RATE_LIMIT_DELETE_EVENT   = 30;
const RATE_LIMIT_FEEDBACK       = 5;

/**
 * Resolve the client IP used as the rate-limit key (#371, 02-§93.6).
 *
 * `X-Forwarded-For` is attacker-controlled and is only honoured when the
 * direct peer (`REMOTE_ADDR`) is a configured trusted proxy — otherwise a
 * client could rotate the header to mint a fresh rate-limit bucket per
 * request and bypass throttling. `TRUSTED_PROXIES` is a comma-separated list
 * of proxy IPs; when unset, the raw `REMOTE_ADDR` is always used.
 */
function clientIp(): string
{
    $remote = (string) ($_SERVER['REMOTE_ADDR'] ?? '');

    $trusted = array_filter(array_map('trim', explode(',', (string) ($_ENV['TRUSTED_PROXIES'] ?? ''))));
    if ($remote !== '' && in_array($remote, $trusted, true)) {
        $forwarded = (string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? '');
        if ($forwarded !== '') {
            // Use the RIGHT-most entry — the address the trusted proxy appended
            // (the peer it accepted the connection from). A client can prepend
            // spoofed entries to X-Forwarded-For, but cannot control the value
            // the trusted proxy adds last, so the right-most entry is the
            // spoof-resistant rate-limit key. The left-most entry is
            // attacker-controlled whenever the proxy appends (the common
            // `$proxy_add_x_forwarded_for` behaviour) rather than replaces.
            $parts     = array_map('trim', explode(',', $forwarded));
            $candidate = end($parts);
            if ($candidate !== false && filter_var($candidate, FILTER_VALIDATE_IP) !== false) {
                return $candidate;
            }
        }
    }

    return $remote;
}

// ── Routing ──────────────────────────────────────────────────────────────

// Strip /api prefix and query string to get the route path.
$uri   = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$route = preg_replace('#^/api#', '', $uri);
$route = $route === '' ? '/' : $route;

$method = $_SERVER['REQUEST_METHOD'];

// ── Resolve active camp for time-gating ──────────────────────────────────

// $activeCamp stays null only when the metadata cannot be loaded, parsed, or
// resolved. Mutation handlers treat null as "metadata unavailable" and fail
// closed (#370) — they must never silently skip time-gating. The camps file is
// looked up in the deploy-bundled location first (api/data/, shipped alongside
// the API) and then the repo layout (source/data/, for local dev and tests).
$activeCamp = null;
try {
    $campsCandidates = [
        __DIR__ . '/data/camps.yaml',
        dirname(__DIR__) . '/source/data/camps.yaml',
    ];
    $campsPath = null;
    foreach ($campsCandidates as $candidate) {
        if (file_exists($candidate)) {
            $campsPath = $candidate;
            break;
        }
    }
    if ($campsPath !== null) {
        $campsData  = Yaml::parseFile($campsPath);
        $buildEnv   = $_ENV['BUILD_ENV'] ?? null;
        $activeCamp = ActiveCamp::resolve($campsData['camps'] ?? [], null, $buildEnv);
    }
} catch (\Throwable $e) {
    // Leave $activeCamp null → mutation endpoints fail closed below.
    error_log('Camp metadata resolution failed: ' . $e->getMessage());
}

// ── Parse configured admin tokens once ───────────────────────────────────

$adminTokenSecret = (string) ($_ENV['ADMIN_TOKEN_SECRET'] ?? '');
$sessionSecret = (string) ($_ENV['SESSION_SECRET'] ?? '');

// Warn (don't fail) when SESSION_SECRET is set but too weak to resist
// ownership-cookie forgery (#387). An unset secret disables cookie ownership
// entirely and fails closed, which is safe.
if ($sessionSecret !== '' && strlen($sessionSecret) < 32) {
    error_log('WARNING: SESSION_SECRET is shorter than 32 characters — use a long random value to protect activity-ownership signatures.');
}

// Warn (don't fail) when ADMIN_TOKEN_SECRET is set but too weak to resist
// token forgery (02-§91.32). An unset secret disables admin functionality
// entirely (no token validates), which fails closed and is safe.
if ($adminTokenSecret !== '' && strlen($adminTokenSecret) < 32) {
    error_log('WARNING: ADMIN_TOKEN_SECRET is shorter than 32 characters — use a long random value to protect admin token signatures.');
}

// ── Handlers ─────────────────────────────────────────────────────────────

header('Content-Type: application/json; charset=utf-8');

try {
    match (true) {
        $method === 'GET' && $route === '/health'
            => jsonResponse(['status' => 'API running']),

        $method === 'GET' && $route === '/cleanup-cookies'
            => handleCleanupCookies(),

        $method === 'POST' && $route === '/add-event'
            => handleAddEvent($activeCamp, $adminTokenSecret, $sessionSecret),

        $method === 'POST' && $route === '/add-events'
            => handleAddEvents($activeCamp, $adminTokenSecret, $sessionSecret),

        $method === 'POST' && $route === '/edit-event'
            => handleEditEvent($activeCamp, $adminTokenSecret, $sessionSecret),

        $method === 'POST' && $route === '/delete-event'
            => handleDeleteEvent($activeCamp, $adminTokenSecret, $sessionSecret),

        $method === 'POST' && $route === '/feedback'
            => handleFeedback(),

        $method === 'POST' && $route === '/verify-admin'
            => handleVerifyAdmin($adminTokenSecret),

        $method === 'POST' && $route === '/mint-token'
            => handleMintToken($adminTokenSecret),

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

function handleAddEvent(?array $activeCamp, string $adminTokenSecret, string $sessionSecret): void
{
    if (RateLimit::isLimited(clientIp(), 'add-event', RATE_LIMIT_ADD_EVENT, HOUR_SECONDS)) {
        jsonResponse(['success' => false, 'error' => RATE_LIMIT_MSG], 429);

        return;
    }

    // Fail closed when camp metadata is unavailable: never skip time-gating (#370).
    if ($activeCamp === null) {
        jsonResponse(['success' => false, 'error' => 'Formuläret är inte tillgängligt just nu. Kontakta arrangören.'], 503);

        return;
    }

    $body = getJsonBody();

    // Time-gating with pre-camp bypass for admin/early roles (02-§26.17,
    // 02-§26.18, 02-§105.1, 02-§105.3)
    if ($activeCamp !== null) {
        $today   = date('Y-m-d');
        $opens   = (string) ($activeCamp['opens_for_editing'] ?? '');
        $endDate = (string) ($activeCamp['end_date'] ?? '');
        if (TimeGate::isAfterEditingPeriod($today, $endDate)
            || (TimeGate::isBeforeEditingPeriod($today, $opens)
                && !Admin::verifyPreCampBypassToken($body['adminToken'] ?? null, $adminTokenSecret))
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

    $consentGiven = ($body['cookieConsent'] ?? false) === true;
    if ($consentGiven && $sessionSecret === '') {
        jsonResponse([
            'success' => false,
            'error'   => 'Sessionen kunde inte sparas. Kontakta arrangören.',
        ], 500);

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
    } catch (DuplicateEventException $e) {
        // Same activity already in the schedule — reject cleanly (02-§110.2).
        jsonResponse(['success' => false, 'error' => 'Den här aktiviteten finns redan i schemat.'], 409);

        return;
    } catch (\Throwable $e) {
        error_log('POST /add-event error: ' . $e->getMessage());
        jsonResponse(['success' => false, 'error' => GitHub::classifyGitHubError($e)], 500);

        return;
    }

    // Session cookie (only if consent given) — set AFTER successful GitHub
    // commit so the browser never stores an ID for an event that failed to save.
    if ($consentGiven) {
        $existing = array_map(
            static fn(string $id): array => Session::createOwnershipEntry($id, $sessionSecret),
            Session::parseVerifiedSessionIds($_SERVER['HTTP_COOKIE'] ?? '', $sessionSecret),
        );
        $updated  = Session::mergeOwnershipEntries(
            $existing,
            Session::createOwnershipEntry($eventId, $sessionSecret),
        );
        $cookieDomain = !empty($_ENV['COOKIE_DOMAIN']) ? $_ENV['COOKIE_DOMAIN'] : null;
        header('Set-Cookie: ' . Session::buildSetCookieHeader($updated, $cookieDomain));
    }

    jsonResponse(['success' => true, 'eventId' => $eventId]);
}

function handleAddEvents(?array $activeCamp, string $adminTokenSecret, string $sessionSecret): void
{
    if (RateLimit::isLimited(clientIp(), 'add-events', RATE_LIMIT_ADD_EVENT, HOUR_SECONDS)) {
        jsonResponse(['success' => false, 'error' => RATE_LIMIT_MSG], 429);

        return;
    }

    // Fail closed when camp metadata is unavailable: never skip time-gating (#370).
    if ($activeCamp === null) {
        jsonResponse(['success' => false, 'error' => 'Formuläret är inte tillgängligt just nu. Kontakta arrangören.'], 503);

        return;
    }

    $body = getJsonBody();

    // Time-gating with pre-camp bypass for admin/early roles (02-§26.17,
    // 02-§26.18, 02-§105.1, 02-§105.3)
    if ($activeCamp !== null) {
        $today   = date('Y-m-d');
        $opens   = (string) ($activeCamp['opens_for_editing'] ?? '');
        $endDate = (string) ($activeCamp['end_date'] ?? '');
        if (TimeGate::isAfterEditingPeriod($today, $endDate)
            || (TimeGate::isBeforeEditingPeriod($today, $opens)
                && !Admin::verifyPreCampBypassToken($body['adminToken'] ?? null, $adminTokenSecret))
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

    $consentGiven = ($body['cookieConsent'] ?? false) === true;
    if ($consentGiven && $sessionSecret === '') {
        jsonResponse([
            'success' => false,
            'error'   => 'Sessionen kunde inte sparas. Kontakta arrangören.',
        ], 500);

        return;
    }

    // Commit all events to GitHub in a single PR
    try {
        $gh = new GitHub();
        $eventIds = $gh->addEventsToActiveCamp($body);
    } catch (DuplicateEventException $e) {
        // One or more of the chosen dates already have this activity — reject the
        // whole batch cleanly (02-§110.5).
        jsonResponse(['success' => false, 'error' => 'Aktiviteten finns redan i schemat för ett eller flera av de valda datumen.'], 409);

        return;
    } catch (\Throwable $e) {
        error_log('POST /add-events error: ' . $e->getMessage());
        jsonResponse(['success' => false, 'error' => GitHub::classifyGitHubError($e)], 500);

        return;
    }

    // Session cookie — add all event IDs (only if consent given)
    if ($consentGiven) {
        $existing = array_map(
            static fn(string $id): array => Session::createOwnershipEntry($id, $sessionSecret),
            Session::parseVerifiedSessionIds($_SERVER['HTTP_COOKIE'] ?? '', $sessionSecret),
        );
        $updated  = $existing;
        foreach ($eventIds as $eid) {
            $updated = Session::mergeOwnershipEntries(
                $updated,
                Session::createOwnershipEntry((string) $eid, $sessionSecret),
            );
        }
        $cookieDomain = !empty($_ENV['COOKIE_DOMAIN']) ? $_ENV['COOKIE_DOMAIN'] : null;
        header('Set-Cookie: ' . Session::buildSetCookieHeader($updated, $cookieDomain));
    }

    jsonResponse(['success' => true, 'eventIds' => $eventIds]);
}

function handleEditEvent(?array $activeCamp, string $adminTokenSecret, string $sessionSecret): void
{
    if (RateLimit::isLimited(clientIp(), 'edit-event', RATE_LIMIT_EDIT_EVENT, HOUR_SECONDS)) {
        jsonResponse(['success' => false, 'error' => RATE_LIMIT_MSG], 429);

        return;
    }

    // Fail closed when camp metadata is unavailable: never skip time-gating (#370).
    if ($activeCamp === null) {
        jsonResponse(['success' => false, 'error' => 'Formuläret är inte tillgängligt just nu. Kontakta arrangören.'], 503);

        return;
    }

    $body    = getJsonBody();
    $isAdmin = Admin::verifyAdminToken($body['adminToken'] ?? null, $adminTokenSecret);

    // Time-gating with pre-camp bypass for admin/early roles (02-§26.17,
    // 02-§26.18, 02-§105.1, 02-§105.3)
    if ($activeCamp !== null) {
        $today   = date('Y-m-d');
        $opens   = (string) ($activeCamp['opens_for_editing'] ?? '');
        $endDate = (string) ($activeCamp['end_date'] ?? '');
        if (TimeGate::isAfterEditingPeriod($today, $endDate)
            || (TimeGate::isBeforeEditingPeriod($today, $opens)
                && !Admin::verifyPreCampBypassToken($body['adminToken'] ?? null, $adminTokenSecret))
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

    // Verify ownership: signed session ownership OR an admin-role token —
    // the early role does not bypass ownership (02-§7.3, §18.31, 02-§105.2).
    $ownedIds = Session::parseVerifiedSessionIds($_SERVER['HTTP_COOKIE'] ?? '', $sessionSecret);
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

function handleDeleteEvent(?array $activeCamp, string $adminTokenSecret, string $sessionSecret): void
{
    if (RateLimit::isLimited(clientIp(), 'delete-event', RATE_LIMIT_DELETE_EVENT, HOUR_SECONDS)) {
        jsonResponse(['success' => false, 'error' => RATE_LIMIT_MSG], 429);

        return;
    }

    // Fail closed when camp metadata is unavailable: never skip time-gating (#370).
    if ($activeCamp === null) {
        jsonResponse(['success' => false, 'error' => 'Formuläret är inte tillgängligt just nu. Kontakta arrangören.'], 503);

        return;
    }

    $body    = getJsonBody();
    $isAdmin = Admin::verifyAdminToken($body['adminToken'] ?? null, $adminTokenSecret);

    // Time-gating with pre-camp bypass for admin/early roles (02-§26.17,
    // 02-§26.18, 02-§105.1, 02-§105.3)
    if ($activeCamp !== null) {
        $today   = date('Y-m-d');
        $opens   = (string) ($activeCamp['opens_for_editing'] ?? '');
        $endDate = (string) ($activeCamp['end_date'] ?? '');
        if (TimeGate::isAfterEditingPeriod($today, $endDate)
            || (TimeGate::isBeforeEditingPeriod($today, $opens)
                && !Admin::verifyPreCampBypassToken($body['adminToken'] ?? null, $adminTokenSecret))
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

    // Verify ownership: signed session ownership OR an admin-role token —
    // the early role does not bypass ownership (02-§7.3, §89.13, 02-§105.2).
    $ownedIds = Session::parseVerifiedSessionIds($_SERVER['HTTP_COOKIE'] ?? '', $sessionSecret);
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

function handleVerifyAdmin(string $adminTokenSecret): void
{
    if (RateLimit::isLimited(clientIp(), 'verify-admin', RATE_LIMIT_VERIFY_ADMIN, HOUR_SECONDS)) {
        jsonResponse(['error' => RATE_LIMIT_MSG], 429);

        return;
    }

    $body  = getJsonBody();
    $token = trim((string) ($body['token'] ?? ''));

    // Any recognised role validates here — including early — so every token
    // kind activates through the same /token.html flow (02-§91.6, 02-§105.4).
    // Each privileged action applies its own role check.
    if (Admin::verifyToken($token, $adminTokenSecret) !== null) {
        jsonResponse(['valid' => true]);
    } else {
        jsonResponse(['valid' => false], 403);
    }
}

function handleMintToken(string $adminTokenSecret): void
{
    if (RateLimit::isLimited(clientIp(), 'mint-token', RATE_LIMIT_MINT_TOKEN, HOUR_SECONDS)) {
        jsonResponse(['success' => false, 'error' => RATE_LIMIT_MSG], 429);

        return;
    }

    $body = getJsonBody();

    // Privilege boundary: only a valid superadmin token may mint, and only
    // admin/early can be minted — superadmin is CLI-only (02-§106.2,
    // §106.3). With an unset secret nothing verifies, so the gate fails
    // closed (§106.8).
    $requester = Admin::verifyToken((string) ($body['token'] ?? ''), $adminTokenSecret);
    if ($requester === null || $requester['role'] !== 'superadmin') {
        jsonResponse(['success' => false, 'error' => 'Endast superadmin kan skapa tokens.'], 403);

        return;
    }

    $result = Admin::mintRequest($body, $adminTokenSecret);
    if (!$result['ok']) {
        jsonResponse(['success' => false, 'error' => $result['error']], 400);

        return;
    }

    // Stateless: the token is returned, never stored (02-§106.6).
    jsonResponse(['success' => true, 'token' => $result['token']]);
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
