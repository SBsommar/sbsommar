<?php

declare(strict_types=1);

namespace SBSommar\Tests;

use PHPUnit\Framework\TestCase;
use SBSommar\Admin;

/**
 * PHP behavioural coverage for the HMAC admin-token model — parity with
 * tests/admin-token.test.js (02-§91.1–91.31).
 *
 * The fixed vectors below are byte-identical to the Node suite: if PHP and
 * Node sign the same claims to the same token string, the runtimes are proven
 * interoperable (a token minted by one validates in the other).
 */
final class AdminTokenTest extends TestCase
{
    private const VEC_SECRET = '0123456789abcdef0123456789abcdef';
    private const VEC_EPOCH  = 2000000000;
    private const VEC_ADMIN  = 'erik_admin_2000000000_BxCLVBJtH61eKTpsn8zsTvYzhL83yf-nF-2HwbBIBVI';
    private const VEC_EARLY  = 'anna_early_2000000000_0jz-8E6aG-x-z2jjKaEY2YgV6Me9qFAJyG5s4mLl61w';
    private const VEC_SUPER  = 'sigge_superadmin_2000000000_4oTZ8CsILnVAvDRIqO8ZZj1tuVF52KAxRDKjPs7xyAQ';

    private const SECRET = 'unit-test-secret-32-bytes-long!!';

    private static function future(): int
    {
        return time() + 86400;
    }

    public function testSignTokenMatchesNodeVector(): void
    {
        self::assertSame(self::VEC_ADMIN, Admin::signToken('erik', 'admin', self::VEC_EPOCH, self::VEC_SECRET));
        self::assertSame(self::VEC_EARLY, Admin::signToken('anna', 'early', self::VEC_EPOCH, self::VEC_SECRET));
        self::assertSame(self::VEC_SUPER, Admin::signToken('sigge', 'superadmin', self::VEC_EPOCH, self::VEC_SECRET));
    }

    public function testVerifyTokenAcceptsFreshToken(): void
    {
        $epoch = self::future();
        $tok   = Admin::signToken('erik', 'admin', $epoch, self::SECRET);
        self::assertSame(['name' => 'erik', 'role' => 'admin', 'epoch' => $epoch], Admin::verifyToken($tok, self::SECRET));
    }

    public function testVerifyTokenValidatesNodeVector(): void
    {
        self::assertSame('admin', Admin::verifyToken(self::VEC_ADMIN, self::VEC_SECRET)['role']);
        self::assertSame('early', Admin::verifyToken(self::VEC_EARLY, self::VEC_SECRET)['role']);
    }

    public function testVerifyTokenRejectsWrongSecret(): void
    {
        self::assertNull(Admin::verifyToken(Admin::signToken('erik', 'admin', self::future(), 'a-secret'), self::SECRET));
    }

    public function testVerifyTokenRejectsTamperedRole(): void
    {
        $tok = Admin::signToken('erik', 'early', self::future(), self::SECRET);
        self::assertNull(Admin::verifyToken(str_replace('_early_', '_admin_', $tok), self::SECRET));
    }

    public function testVerifyTokenRejectsUnknownRole(): void
    {
        self::assertNull(Admin::verifyToken(Admin::signToken('erik', 'root', self::future(), self::SECRET), self::SECRET));
    }

    public function testVerifyTokenRejectsExpired(): void
    {
        self::assertNull(Admin::verifyToken(Admin::signToken('e', 'admin', time() - 10, self::SECRET), self::SECRET));
    }

    public function testVerifyTokenRejectsEmptySecret(): void
    {
        self::assertNull(Admin::verifyToken(self::VEC_ADMIN, ''));
    }

    public function testVerifyTokenRejectsMalformed(): void
    {
        foreach (['', 'noseparators', 'a_b_c', 'a_b_notnum_sig'] as $bad) {
            self::assertNull(Admin::verifyToken($bad, self::SECRET), "should reject: {$bad}");
        }
    }

    public function testVerifyTokenHandlesUnderscoreSignatures(): void
    {
        for ($i = 0; $i < 50; $i++) {
            $epoch = self::future();
            $tok   = Admin::signToken("user{$i}", 'admin', $epoch, self::SECRET);
            self::assertSame(['name' => "user{$i}", 'role' => 'admin', 'epoch' => $epoch], Admin::verifyToken($tok, self::SECRET));
        }
    }

    public function testVerifyAdminTokenRoleGating(): void
    {
        self::assertTrue(Admin::verifyAdminToken(Admin::signToken('a', 'admin', self::future(), self::SECRET), self::SECRET));
        self::assertTrue(Admin::verifyAdminToken(Admin::signToken('s', 'superadmin', self::future(), self::SECRET), self::SECRET));
        self::assertFalse(Admin::verifyAdminToken(Admin::signToken('e', 'early', self::future(), self::SECRET), self::SECRET));
        self::assertFalse(Admin::verifyAdminToken('', self::SECRET));
    }

    public function testIsTokenExpired(): void
    {
        self::assertTrue(Admin::isTokenExpired(Admin::signToken('e', 'admin', time() - 10, self::SECRET)));
        self::assertFalse(Admin::isTokenExpired(Admin::signToken('e', 'admin', self::future(), self::SECRET)));
        self::assertTrue(Admin::isTokenExpired('a_b_c'));
    }

    public function testVerifyPreCampBypassTokenAcceptsAllRoles(): void
    {
        // 02-§105.1, §105.5 — early bypasses the pre-camp gate like admins.
        self::assertTrue(Admin::verifyPreCampBypassToken(Admin::signToken('a', 'admin', self::future(), self::SECRET), self::SECRET));
        self::assertTrue(Admin::verifyPreCampBypassToken(Admin::signToken('e', 'early', self::future(), self::SECRET), self::SECRET));
        self::assertTrue(Admin::verifyPreCampBypassToken(Admin::signToken('s', 'superadmin', self::future(), self::SECRET), self::SECRET));
        self::assertTrue(Admin::verifyPreCampBypassToken(self::VEC_EARLY, self::VEC_SECRET));
    }

    public function testVerifyPreCampBypassTokenRejectsInvalid(): void
    {
        self::assertFalse(Admin::verifyPreCampBypassToken(Admin::signToken('x', 'root', self::future(), self::SECRET), self::SECRET));
        self::assertFalse(Admin::verifyPreCampBypassToken(Admin::signToken('e', 'early', time() - 10, self::SECRET), self::SECRET));
        self::assertFalse(Admin::verifyPreCampBypassToken(Admin::signToken('e', 'early', self::future(), 'other'), self::SECRET));
        self::assertFalse(Admin::verifyPreCampBypassToken(self::VEC_EARLY, ''));
        self::assertFalse(Admin::verifyPreCampBypassToken(null, self::SECRET));
    }
}
