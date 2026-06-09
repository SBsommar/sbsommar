<?php

declare(strict_types=1);

namespace SBSommar;

/**
 * Session cookie handling – mirrors source/api/session.js.
 */
final class Session
{
    public const COOKIE_NAME     = 'sb_session';
    public const MAX_AGE_SECONDS = 604800; // 7 days

    /**
     * Parse the sb_session cookie from the raw Cookie header.
     *
     * @return string[]
     */
    public static function parseSessionIds(string $cookieHeader): array
    {
        return array_values(array_filter(array_map(
            static function (mixed $entry): ?string {
                if (is_string($entry) && $entry !== '') {
                    return $entry;
                }
                if (self::isOwnershipEntry($entry)) {
                    return $entry['id'];
                }

                return null;
            },
            self::parseSessionPayload($cookieHeader),
        )));
    }

    /**
     * Create a signed ownership entry for one event ID.
     *
     * @return array{id:string,exp:int,sig:string}
     */
    public static function createOwnershipEntry(string $id, string $secret): array
    {
        if ($id === '' || $secret === '') {
            throw new \InvalidArgumentException('id and secret are required');
        }

        $exp = time() + self::MAX_AGE_SECONDS;

        return ['id' => $id, 'exp' => $exp, 'sig' => self::signatureForEntry($id, $exp, $secret)];
    }

    /**
     * Parse only entries with valid server-side ownership signatures.
     *
     * @return string[]
     */
    public static function parseVerifiedSessionIds(string $cookieHeader, string $secret): array
    {
        if ($secret === '') {
            return [];
        }

        $ids = [];
        foreach (self::parseSessionPayload($cookieHeader) as $entry) {
            if (self::verifyOwnershipEntry($entry, $secret)) {
                $ids[] = $entry['id'];
            }
        }

        return $ids;
    }

    /** @return array<int,mixed> */
    private static function parseSessionPayload(string $cookieHeader): array
    {
        if ($cookieHeader === '') {
            return [];
        }

        $pairs = array_map('trim', explode(';', $cookieHeader));
        $prefix = self::COOKIE_NAME . '=';

        foreach ($pairs as $pair) {
            if (str_starts_with($pair, $prefix)) {
                $raw = substr($pair, strlen($prefix));
                $decoded = urldecode($raw);
                $parsed = json_decode($decoded, true);

                if (!is_array($parsed)) {
                    return [];
                }

                return array_values($parsed);
            }
        }

        return [];
    }

    private static function signatureForEntry(string $id, int $exp, string $secret): string
    {
        return hash_hmac('sha256', "{$id}.{$exp}", $secret);
    }

    private static function isOwnershipEntry(mixed $entry): bool
    {
        return is_array($entry)
            && is_string($entry['id'] ?? null)
            && $entry['id'] !== ''
            && is_int($entry['exp'] ?? null)
            && $entry['exp'] > 0
            && is_string($entry['sig'] ?? null)
            && $entry['sig'] !== '';
    }

    private static function verifyOwnershipEntry(mixed $entry, string $secret): bool
    {
        if ($secret === '' || !self::isOwnershipEntry($entry)) {
            return false;
        }

        if ($entry['exp'] < time()) {
            return false;
        }

        return hash_equals(self::signatureForEntry($entry['id'], $entry['exp'], $secret), $entry['sig']);
    }

    /**
     * Build the Set-Cookie header value.
     */
    public static function buildSetCookieHeader(array $ids, ?string $domain = null): string
    {
        $value = urlencode(json_encode(array_values($ids), JSON_UNESCAPED_UNICODE));
        $domainPart = $domain ? "; Domain={$domain}" : '';

        return sprintf(
            '%s=%s; Path=/; Max-Age=%d; Secure; SameSite=Strict%s',
            self::COOKIE_NAME,
            $value,
            self::MAX_AGE_SECONDS,
            $domainPart,
        );
    }

    /**
     * Merge a new ownership entry into an existing list (deduplicating by ID).
     *
     * @param array<int,mixed> $existing
     * @param array{id:string,exp:int,sig:string} $newEntry
     * @return array<int,array{id:string,exp:int,sig:string}>
     */
    public static function mergeOwnershipEntries(array $existing, array $newEntry): array
    {
        $entries = array_values(array_filter($existing, static fn(mixed $entry): bool => self::isOwnershipEntry($entry)));
        if (!self::isOwnershipEntry($newEntry)) {
            return $entries;
        }

        foreach ($entries as $entry) {
            if ($entry['id'] === $newEntry['id']) {
                return $entries;
            }
        }

        return [...$entries, $newEntry];
    }
}
