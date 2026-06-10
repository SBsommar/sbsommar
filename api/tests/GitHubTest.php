<?php

declare(strict_types=1);

namespace SBSommar\Tests;

use PHPUnit\Framework\TestCase;
use SBSommar\GitHub;

/**
 * Mirrors tests/github.test.js — verifies the PHP YAML helpers behave the same
 * as the Node helpers, with emphasis on the §102 hardening (CR normalisation,
 * indentation detection, whole-document validation). Network methods are not
 * exercised; only the pure helpers.
 */
final class GitHubTest extends TestCase
{
    /**
     * @param array<string,mixed> $overrides
     * @return array<string,mixed>
     */
    private static function baseEvent(array $overrides = []): array
    {
        return array_merge([
            'id'          => 'frukost-2026-06-22-0800',
            'title'       => 'Frukost',
            'date'        => '2026-06-22',
            'start'       => '08:00',
            'end'         => '09:00',
            'location'    => 'Matsalen',
            'responsible' => 'Alla',
            'description' => null,
            'link'        => null,
            'owner'       => ['name' => 'Anna', 'email' => ''],
            'meta'        => ['created_at' => '2026-06-22 07:00', 'updated_at' => '2026-06-22 07:00'],
        ], $overrides);
    }

    /**
     * @param string[] $eventBlocks
     */
    private static function campFile(array $eventBlocks = []): string
    {
        $header = [
            'camp:',
            '  id: test-camp',
            '  name: Test',
            '  location: Here',
            "  start_date: '2026-06-22'",
            "  end_date: '2026-06-28'",
            'events:',
        ];

        return implode("\n", array_merge($header, $eventBlocks)) . "\n";
    }

    // ── slugify ─────────────────────────────────────────────────────────────

    public function testSlugifyLowercasesAscii(): void
    {
        $this->assertSame('hello-world', GitHub::slugify('Hello World'));
    }

    public function testSlugifyReplacesSwedishChars(): void
    {
        $this->assertSame('aang', GitHub::slugify('åäng'));
        $this->assertSame('oppen', GitHub::slugify('öppen'));
    }

    public function testSlugifyCapsAt48Chars(): void
    {
        $this->assertSame(48, strlen(GitHub::slugify(str_repeat('a', 100))));
    }

    // ── yamlScalar ──────────────────────────────────────────────────────────

    public function testYamlScalarNull(): void
    {
        $this->assertSame('null', GitHub::yamlScalar(null));
    }

    public function testYamlScalarEmptyString(): void
    {
        $this->assertSame("''", GitHub::yamlScalar(''));
    }

    public function testYamlScalarPlainTextUnchanged(): void
    {
        $this->assertSame('Hello world', GitHub::yamlScalar('Hello world'));
    }

    public function testYamlScalarQuotesColon(): void
    {
        $r = GitHub::yamlScalar('key: value');
        $this->assertStringStartsWith("'", $r);
    }

    // ── buildEventYaml ──────────────────────────────────────────────────────

    public function testBuildEventYamlStartsWithId(): void
    {
        $yaml = GitHub::buildEventYaml(self::baseEvent());
        $this->assertStringStartsWith('- id: frukost-2026-06-22-0800', $yaml);
    }

    public function testBuildEventYamlNormalisesCrlfInDescription(): void
    {
        $yaml = GitHub::buildEventYaml(self::baseEvent(['description' => "Rad ett.\r\nRad två."]));
        $this->assertStringNotContainsString("\r", $yaml);
        $this->assertStringContainsString('    Rad ett.', $yaml);
        $this->assertStringContainsString('    Rad två.', $yaml);
    }

    public function testBuildEventYamlNormalisesLoneCrInDescription(): void
    {
        $yaml = GitHub::buildEventYaml(self::baseEvent(['description' => "Rad ett.\rRad två."]));
        $this->assertStringNotContainsString("\r", $yaml);
        $this->assertStringContainsString('    Rad två.', $yaml);
    }

    // ── detectEventIndent (02-§10.6, 02-§102.8) ─────────────────────────────

    public function testDetectEventIndentColumnZero(): void
    {
        $yaml = "camp:\n  id: c\nevents:\n- id: lunch-2026-06-22-1200\n  title: Lunch\n";
        $this->assertSame(0, GitHub::detectEventIndent($yaml));
    }

    public function testDetectEventIndentTwoSpaces(): void
    {
        $yaml = "camp:\n  id: c\nevents:\n  - id: lunch-2026-06-22-1200\n    title: Lunch\n";
        $this->assertSame(2, GitHub::detectEventIndent($yaml));
    }

    public function testDetectEventIndentFallsBackToTwoWhenEmpty(): void
    {
        $yaml = "camp:\n  id: c\nevents: []\n";
        $this->assertSame(2, GitHub::detectEventIndent($yaml));
    }

    // ── assertEventYamlValid (02-§102.5) ────────────────────────────────────

    public function testAssertEventYamlValidPassesForDocWithId(): void
    {
        $ev = self::baseEvent();
        $content = self::campFile([GitHub::buildEventYaml($ev)]);
        GitHub::assertEventYamlValid($content, [$ev['id']]);
        // Reaching here without an exception is the pass condition.
        $this->addToAssertionCount(1);
    }

    public function testAssertEventYamlValidThrowsOnUnparseableYaml(): void
    {
        $this->expectException(\RuntimeException::class);
        GitHub::assertEventYamlValid("camp:\n  id: t\nevents: [unclosed", ['x']);
    }

    public function testAssertEventYamlValidThrowsWhenIdMissing(): void
    {
        $ev = self::baseEvent();
        $content = self::campFile([GitHub::buildEventYaml($ev)]);
        $this->expectException(\RuntimeException::class);
        GitHub::assertEventYamlValid($content, ['does-not-exist']);
    }

    public function testAppendingAtDetectedIndentToTwoSpaceFileYieldsValidYaml(): void
    {
        // Regression guard for the indent-0-append-into-2-space-file bug.
        $existing = implode("\n", [
            'camp:',
            '  id: test-camp',
            '  name: Test',
            '  location: Here',
            "  start_date: '2026-06-22'",
            "  end_date: '2026-06-28'",
            'events:',
            '  - id: lunch-2026-06-22-1200',
            '    title: Lunch',
            "    date: '2026-06-22'",
            "    start: '12:00'",
            "    end: '13:00'",
            '    location: Matsalen',
            '    responsible: Alla',
            '    description: null',
            '    link: null',
            '    owner:',
            "      name: ''",
            "      email: ''",
            '    meta:',
            '      created_at: 2026-06-21 07:00',
            '      updated_at: 2026-06-21 07:00',
        ]) . "\n";

        $ev = self::baseEvent();
        $indent = GitHub::detectEventIndent($existing);
        $this->assertSame(2, $indent);

        $combined = rtrim($existing) . "\n" . GitHub::buildEventYaml($ev, $indent) . "\n";
        GitHub::assertEventYamlValid($combined, [$ev['id']]);
        $this->addToAssertionCount(1);
    }
}
