<?php

declare(strict_types=1);

namespace SBSommar\Tests;

use PHPUnit\Framework\TestCase;
use SBSommar\Validate;

/**
 * Mirrors tests/validate.test.js — verifies the PHP validator behaves the same
 * as the Node validator, with emphasis on the §102 control-character hardening
 * and the §82.3 responsible = 60 limit.
 */
final class ValidateTest extends TestCase
{
    /**
     * @param array<string,mixed> $overrides
     * @return array<string,mixed>
     */
    private static function valid(array $overrides = []): array
    {
        return array_merge([
            'title'       => 'Frukost',
            'date'        => '2099-06-22',
            'start'       => '08:00',
            'end'         => '09:00',
            'location'    => 'Matsalen',
            'responsible' => 'Alla',
        ], $overrides);
    }

    /**
     * @param array<string,mixed> $overrides
     * @return array<string,mixed>
     */
    private static function validEdit(array $overrides = []): array
    {
        return array_merge([
            'id'          => '2099-08-04-frukost',
            'title'       => 'Frukost',
            'date'        => '2099-06-22',
            'start'       => '08:00',
            'end'         => '09:00',
            'location'    => 'Matsalen',
            'responsible' => 'Alla',
        ], $overrides);
    }

    // ── Required fields / happy path ────────────────────────────────────────

    public function testRejectsMissingTitle(): void
    {
        $r = Validate::validateEventRequest(self::valid(['title' => '']));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('title', $r['error']);
    }

    public function testAcceptsFullyValidRequest(): void
    {
        $r = Validate::validateEventRequest(self::valid([
            'description' => 'Ta med din dator.',
            'link'        => 'https://meet.example.com',
            'ownerName'   => 'Lisa',
        ]));
        $this->assertTrue($r['ok']);
    }

    // ── String length limits — responsible = 60 (02-§82.3 mirror) ───────────

    public function testRejectsResponsibleOver60(): void
    {
        $r = Validate::validateEventRequest(self::valid(['responsible' => str_repeat('A', 61)]));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('responsible', $r['error']);
    }

    public function testAcceptsResponsibleAt60(): void
    {
        $r = Validate::validateEventRequest(self::valid(['responsible' => str_repeat('A', 60)]));
        $this->assertTrue($r['ok']);
    }

    // ── Injection scanning (02-§49) ─────────────────────────────────────────

    public function testRejectsScriptTagInTitle(): void
    {
        $r = Validate::validateEventRequest(self::valid(['title' => '<script>alert(1)</script>']));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('title', $r['error']);
    }

    public function testRejectsNonHttpLink(): void
    {
        $r = Validate::validateEventRequest(self::valid(['link' => 'ftp://example.com/file']));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('link', $r['error']);
    }

    // ── Control characters / line breaks in single-line fields (02-§102.1) ──

    public function testRejectsNewlineInTitle(): void
    {
        $r = Validate::validateEventRequest(self::valid(['title' => "Frukost\n  responsible: hacker"]));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('title', $r['error']);
    }

    public function testRejectsNewlineInLocation(): void
    {
        $r = Validate::validateEventRequest(self::valid(['location' => "Matsalen\n  smuggled: true"]));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('location', $r['error']);
    }

    public function testRejectsNewlineInResponsible(): void
    {
        $r = Validate::validateEventRequest(self::valid(['responsible' => "Alla\nEvil"]));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('responsible', $r['error']);
    }

    public function testRejectsNewlineInLink(): void
    {
        $r = Validate::validateEventRequest(self::valid(['link' => "https://example.com\nEvil"]));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('link', $r['error']);
    }

    public function testRejectsNewlineInOwnerName(): void
    {
        $r = Validate::validateEventRequest(self::valid(['ownerName' => "Anna\nEvil"]));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('ownerName', $r['error']);
    }

    public function testRejectsCarriageReturnInTitle(): void
    {
        $r = Validate::validateEventRequest(self::valid(['title' => "Frukost\rmiddag"]));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('title', $r['error']);
    }

    public function testRejectsTabInResponsible(): void
    {
        $r = Validate::validateEventRequest(self::valid(['responsible' => "Alla\tEvil"]));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('responsible', $r['error']);
    }

    public function testRejectsNulByteInLocation(): void
    {
        $r = Validate::validateEventRequest(self::valid(['location' => "Mat\0salen"]));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('location', $r['error']);
    }

    public function testAcceptsTrailingNewlineInTitle(): void
    {
        // The only line break is trailing — trimmed away before the write, so accepted.
        $r = Validate::validateEventRequest(self::valid(['title' => "Frukost\n"]));
        $this->assertTrue($r['ok']);
    }

    // ── description multi-line handling (02-§102.3) ─────────────────────────

    public function testAcceptsNewlineInDescription(): void
    {
        $r = Validate::validateEventRequest(self::valid(['description' => "Rad ett.\nRad två."]));
        $this->assertTrue($r['ok']);
    }

    public function testAcceptsTabInDescription(): void
    {
        $r = Validate::validateEventRequest(self::valid(['description' => "Kolumn1\tKolumn2"]));
        $this->assertTrue($r['ok']);
    }

    public function testRejectsNulByteInDescription(): void
    {
        $r = Validate::validateEventRequest(self::valid(['description' => "Text\0slut"]));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('description', $r['error']);
    }

    // ── Edit request parity (02-§102.1) ─────────────────────────────────────

    public function testEditRejectsNewlineInTitle(): void
    {
        $r = Validate::validateEditRequest(self::validEdit(['title' => "Frukost\nEvil"]));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('title', $r['error']);
    }

    public function testEditRejectsNewlineInOwnerName(): void
    {
        $r = Validate::validateEditRequest(self::validEdit(['ownerName' => "Anna\nEvil"]));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('ownerName', $r['error']);
    }

    // ── Cancelled field (02-§118.1, 05-§3.5) ───────────────────────────────

    public function testCancelledTrueAccepted(): void
    {
        $r = Validate::validateEditRequest(self::validEdit(['cancelled' => true]));
        $this->assertTrue($r['ok']);
    }

    public function testCancelledFalseAccepted(): void
    {
        $r = Validate::validateEditRequest(self::validEdit(['cancelled' => false]));
        $this->assertTrue($r['ok']);
    }

    public function testCancelledAbsentAccepted(): void
    {
        $r = Validate::validateEditRequest(self::validEdit());
        $this->assertTrue($r['ok']);
    }

    public function testCancelledNonBooleanRejected(): void
    {
        $r = Validate::validateEditRequest(self::validEdit(['cancelled' => 'yes']));
        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('cancelled', $r['error']);
    }
}
