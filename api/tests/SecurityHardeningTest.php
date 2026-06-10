<?php

declare(strict_types=1);

namespace SBSommar\Tests;

use PHPUnit\Framework\TestCase;
use SBSommar\Admin;
use SBSommar\Feedback;
use SBSommar\RateLimit;

/**
 * PHP-side coverage for the 2026-06 security-hardening sweep — parity with
 * tests/security-hardening.test.js (issues #383, #386, #371).
 */
final class SecurityHardeningTest extends TestCase
{
    // ── #383 Feedback metadata sanitisation ─────────────────────────────────

    public function testSanitizeEscapesPipe(): void
    {
        self::assertSame('a\\|b', Feedback::sanitizeMetaField('a|b', 100));
    }

    public function testSanitizeEscapesBackslashBeforePipe(): void
    {
        // Bare backslash is doubled (CodeQL js/incomplete-sanitization parity).
        self::assertSame('a\\\\b', Feedback::sanitizeMetaField('a\\b', 100));
        // "\|" must not become "\\|" (literal backslash + unescaped pipe).
        foreach (['a\\|b', 'x\\\\|y', '\\|\\|', 'plain'] as $input) {
            $out      = Feedback::sanitizeMetaField($input, 100);
            $stripped = str_replace('\\|', '', str_replace('\\\\', '', $out));
            self::assertStringNotContainsString('|', $stripped, "unescaped pipe survives for {$input} → {$out}");
        }
    }

    public function testSanitizeCollapsesControlChars(): void
    {
        self::assertSame('a b c', Feedback::sanitizeMetaField("a\r\n\tb c", 100));
    }

    public function testSanitizeCapsLength(): void
    {
        self::assertSame(10, mb_strlen(Feedback::sanitizeMetaField(str_repeat('x', 50), 10)));
    }

    public function testFeedbackTableRowsKeepTwoColumns(): void
    {
        // A malicious userAgent must not introduce extra table columns/rows.
        $body = [
            'category'    => 'bug',
            'title'       => 'Test',
            'description' => 'desc',
            'userAgent'   => "Evil | extra | row\n| Injected | row |",
            'url'         => 'https://qa.sbsommar.se/',
            'viewport'    => '100x100',
            'timestamp'   => '2026-06-10T00:00:00Z',
            'name'        => 'A | B',
        ];
        $ua = Feedback::sanitizeMetaField($body['userAgent'], 400);
        self::assertStringNotContainsString("\n", $ua);
        self::assertStringNotContainsString('| extra |', $ua);
    }

    // ── #386 Constant-time admin token ──────────────────────────────────────

    private const HARDENING_SECRET = 'hardening-test-secret-value-xyz!';

    public function testAdminTokenAcceptsValidSignature(): void
    {
        $tok = Admin::signToken('admin', 'admin', time() + 86400, self::HARDENING_SECRET);
        self::assertTrue(Admin::verifyAdminToken($tok, self::HARDENING_SECRET));
    }

    public function testAdminTokenRejectsWrongSecret(): void
    {
        $tok = Admin::signToken('admin', 'admin', time() + 86400, 'other-secret');
        self::assertFalse(Admin::verifyAdminToken($tok, self::HARDENING_SECRET));
    }

    public function testAdminTokenRejectsExpired(): void
    {
        $tok = Admin::signToken('admin', 'admin', time() - 10, self::HARDENING_SECRET);
        self::assertFalse(Admin::verifyAdminToken($tok, self::HARDENING_SECRET));
    }

    // ── #371 Rate-limit counting under the lock ─────────────────────────────

    public function testRateLimitCountsAndTrips(): void
    {
        $ns = 'test-' . bin2hex(random_bytes(4));
        $ip = '198.51.100.7';
        // limit 3 within the window: calls 1-3 allowed, 4th tripped.
        self::assertFalse(RateLimit::isLimited($ip, $ns, 3, 3600));
        self::assertFalse(RateLimit::isLimited($ip, $ns, 3, 3600));
        self::assertFalse(RateLimit::isLimited($ip, $ns, 3, 3600));
        self::assertTrue(RateLimit::isLimited($ip, $ns, 3, 3600));
    }

    public function testRateLimitSeparatesNamespaces(): void
    {
        $a  = 'nsa-' . bin2hex(random_bytes(4));
        $b  = 'nsb-' . bin2hex(random_bytes(4));
        $ip = '198.51.100.8';
        self::assertFalse(RateLimit::isLimited($ip, $a, 1, 3600));
        self::assertTrue(RateLimit::isLimited($ip, $a, 1, 3600));
        // Different namespace has its own counter.
        self::assertFalse(RateLimit::isLimited($ip, $b, 1, 3600));
    }
}
