<?php

declare(strict_types=1);

namespace SBSommar;

/**
 * Admin token helpers – mirrors source/api/admin.js.
 *
 * Tokens are self-validating: each carries its claims and an HMAC signature
 * keyed by ADMIN_TOKEN_SECRET, so the server validates a token by recomputing
 * its signature — there is no stored list of issued tokens (02-§91.1, §91.2).
 *
 * Format: "namn_roll_epoch_sig", where `sig` is the base64url HMAC-SHA256 of
 * "namn_roll_epoch" keyed by the secret; `roll` is admin | early | superadmin.
 */
final class Admin
{
    /** @var list<string> */
    private const VALID_ROLES = ['admin', 'early', 'superadmin'];

    /** @var list<string> */
    private const ADMIN_ROLES = ['admin', 'superadmin'];

    /** @var list<string> */
    private const PRE_CAMP_BYPASS_ROLES = ['admin', 'early', 'superadmin'];

    /**
     * Per-process random key used only to equalise lengths before comparison,
     * so the comparison leaks neither validity nor value length via timing
     * (02-§91.8, #386).
     */
    private static function compareKey(): string
    {
        static $key = null;
        if ($key === null) {
            $key = random_bytes(32);
        }

        return $key;
    }

    private static function tokenDigest(string $value): string
    {
        return hash_hmac('sha256', $value, self::compareKey(), true);
    }

    private static function base64url(string $raw): string
    {
        return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
    }

    /**
     * Compute the base64url HMAC-SHA256 signature of the claim string.
     */
    private static function signClaims(string $message, string $secret): string
    {
        return self::base64url(hash_hmac('sha256', $message, $secret, true));
    }

    /**
     * Produce a signed token for the given claims (02-§91.2).
     */
    public static function signToken(string $name, string $role, int $epoch, string $secret): string
    {
        $message = "{$name}_{$role}_{$epoch}";

        return "{$message}_" . self::signClaims($message, $secret);
    }

    /**
     * Extract the embedded expiry epoch (seconds), or 0 if malformed. `namn`,
     * `roll`, `epoch` are underscore-free, so the first three underscores are
     * the field delimiters (the base64url signature may contain underscores).
     */
    private static function embeddedEpoch(string $token): int
    {
        $parts = explode('_', $token, 4);
        if (count($parts) < 4 || preg_match('/^\d+$/', $parts[2]) !== 1) {
            return 0;
        }
        $epoch = (int) $parts[2];

        return $epoch > 0 ? $epoch : 0;
    }

    /**
     * Returns true when the embedded expiry has passed. A malformed token
     * (epoch 0) is treated as expired (fail-closed).
     */
    public static function isTokenExpired(string $token): bool
    {
        $epoch = self::embeddedEpoch($token);
        if ($epoch === 0) {
            return true;
        }

        return time() > $epoch;
    }

    /**
     * Validate a token against the signing secret. Returns
     * ['name' => ..., 'role' => ..., 'epoch' => ...] when the recomputed
     * signature matches (constant-time), the role is recognised, and the epoch
     * is in the future; otherwise null (02-§91.2, §91.29).
     *
     * @return array{name: string, role: string, epoch: int}|null
     */
    public static function verifyToken(?string $candidate, string $secret): ?array
    {
        if ($secret === '' || $candidate === null || $candidate === '') {
            return null;
        }
        $parts = explode('_', $candidate, 4);
        if (count($parts) < 4) {
            return null;
        }
        [$name, $role, $epochStr, $sig] = $parts;
        if ($name === '' || $role === '' || $sig === '' || preg_match('/^\d+$/', $epochStr) !== 1) {
            return null;
        }
        $epoch = (int) $epochStr;
        if ($epoch <= 0 || !in_array($role, self::VALID_ROLES, true)) {
            return null;
        }
        if (time() > $epoch) {
            return null;
        }

        $expected = self::signClaims("{$name}_{$role}_{$epoch}", $secret);
        if (!hash_equals(self::tokenDigest($expected), self::tokenDigest($sig))) {
            return null;
        }

        return ['name' => $name, 'role' => $role, 'epoch' => $epoch];
    }

    /**
     * True only for administrator-equivalent roles (admin, superadmin).
     * Preserves the boolean contract used by the add/edit/delete handlers
     * (02-§91.31).
     */
    public static function verifyAdminToken(?string $candidate, string $secret): bool
    {
        $token = self::verifyToken($candidate, $secret);

        return $token !== null && in_array($token['role'], self::ADMIN_ROLES, true);
    }

    /**
     * True for roles allowed to bypass the pre-camp time gate: administrators
     * plus early-access contributors (02-§105.1). Unlike verifyAdminToken,
     * passing this check grants no ownership bypass — an early holder still
     * only edits and deletes their own cookie-owned events (02-§105.2,
     * §105.5).
     */
    public static function verifyPreCampBypassToken(?string $candidate, string $secret): bool
    {
        $token = self::verifyToken($candidate, $secret);

        return $token !== null && in_array($token['role'], self::PRE_CAMP_BYPASS_ROLES, true);
    }
}
