<?php

declare(strict_types=1);

namespace SBSommar\Tests;

use PHPUnit\Framework\TestCase;
use SBSommar\Admin;

/**
 * PHP behavioural coverage for web token minting — parity with
 * tests/mint-token.test.js (02-§106).
 *
 * The fixed inputs (secret, now) match the Node suite, so a mint performed
 * by one runtime is byte-identical to the other (cross-runtime proof via
 * signToken over the same sanitised claims).
 */
final class MintTokenTest extends TestCase
{
    private const SECRET = 'mint-token-test-secret-32-bytes!';
    private const NOW    = 2000000000;
    private const DAY    = 86400;

    public function testMintsAdminWithDefaultValidity(): void
    {
        $r = Admin::mintRequest(['name' => 'Anna Söder', 'role' => 'admin'], self::SECRET, self::NOW);
        self::assertTrue($r['ok']);
        self::assertSame(
            ['name' => 'anna-söder', 'role' => 'admin', 'epoch' => self::NOW + 60 * self::DAY],
            Admin::verifyToken($r['token'], self::SECRET),
        );
        self::assertSame(
            Admin::signToken('anna-söder', 'admin', self::NOW + 60 * self::DAY, self::SECRET),
            $r['token'],
        );
    }

    public function testMintsEarlyWithDefaultValidity(): void
    {
        $r = Admin::mintRequest(['name' => 'erik', 'role' => 'early'], self::SECRET, self::NOW);
        self::assertTrue($r['ok']);
        self::assertSame(self::NOW + 90 * self::DAY, Admin::verifyToken($r['token'], self::SECRET)['epoch']);
    }

    public function testHonoursExplicitDaysWithinRange(): void
    {
        $r = Admin::mintRequest(['name' => 'erik', 'role' => 'admin', 'days' => 7], self::SECRET, self::NOW);
        self::assertSame(self::NOW + 7 * self::DAY, Admin::verifyToken($r['token'], self::SECRET)['epoch']);
    }

    public function testRejectsDaysOutsideRange(): void
    {
        foreach ([['admin', 0], ['admin', 61], ['early', 91], ['admin', -5], ['admin', 2.5], ['admin', 'nan']] as [$role, $days]) {
            $r = Admin::mintRequest(['name' => 'erik', 'role' => $role, 'days' => $days], self::SECRET, self::NOW);
            self::assertFalse($r['ok'], "{$role}/{$days} should be rejected");
            self::assertNotSame('', $r['error']);
        }
    }

    public function testRejectsNonWhitelistedRoles(): void
    {
        self::assertFalse(Admin::mintRequest(['name' => 'x', 'role' => 'superadmin'], self::SECRET, self::NOW)['ok']);
        self::assertFalse(Admin::mintRequest(['name' => 'x', 'role' => 'root'], self::SECRET, self::NOW)['ok']);
        self::assertFalse(Admin::mintRequest(['name' => 'x', 'role' => ''], self::SECRET, self::NOW)['ok']);
    }

    public function testRejectsEmptyNameAfterSanitisation(): void
    {
        self::assertFalse(Admin::mintRequest(['name' => '!!!', 'role' => 'admin'], self::SECRET, self::NOW)['ok']);
        self::assertFalse(Admin::mintRequest(['role' => 'admin'], self::SECRET, self::NOW)['ok']);
    }

    public function testSanitisesNameLikeTheCli(): void
    {
        $r = Admin::mintRequest(['name' => '  Erik  Ek_! ', 'role' => 'early'], self::SECRET, self::NOW);
        self::assertTrue($r['ok']);
        self::assertSame('erik-ek', Admin::verifyToken($r['token'], self::SECRET)['name']);
    }
}
