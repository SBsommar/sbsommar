<?php

declare(strict_types=1);

namespace SBSommar;

/**
 * Feedback validation and GitHub Issue creation — mirrors source/api/feedback.js.
 */
final class Feedback
{
    private const VALID_CATEGORIES = ['bug', 'suggestion', 'other'];

    private const CATEGORY_LABELS = [
        'bug'        => 'feedback:bug',
        'suggestion' => 'feedback:suggestion',
        'other'      => 'feedback:other',
    ];

    private const CATEGORY_DISPLAY = [
        'bug'        => 'Bugg',
        'suggestion' => 'Förslag',
        'other'      => 'Övrigt',
    ];

    private const MAX_LENGTHS = [
        'title'       => 200,
        'description' => 2000,
        'name'        => 200,
    ];

    private const TEXT_FIELDS = ['title', 'description', 'name'];

    /**
     * Length caps for client-supplied metadata fields (issue #383). These
     * fields are not run through the injection scan and end up in a
     * GitHub-issue Markdown table.
     */
    private const META_MAX_LENGTHS = [
        'url'       => 500,
        'viewport'  => 20,
        'userAgent' => 400,
        'timestamp' => 40,
        'name'      => 200,
    ];

    private const INJECTION_PATTERNS = [
        '/<script/i'         => '<script>',
        '/javascript:/i'     => 'javascript: URI',
        '/on\w+\s*=/i'       => 'event handler (on*=)',
        '/<iframe/i'         => '<iframe>',
        '/<object/i'         => '<object>',
        '/<embed/i'          => '<embed>',
        '/data:text\/html/i' => 'data:text/html URI',
    ];

    // ── Validation ──────────────────────────────────────────────────────

    /**
     * @param array<string,mixed> $body
     * @return array{ok:bool,error?:string,honeypot?:bool}
     */
    public static function validate(array $body): array
    {
        // Honeypot check
        $website = trim((string) ($body['website'] ?? ''));
        if ($website !== '') {
            return ['ok' => true, 'honeypot' => true];
        }

        $category    = trim((string) ($body['category'] ?? ''));
        $title       = trim((string) ($body['title'] ?? ''));
        $description = trim((string) ($body['description'] ?? ''));
        $name        = trim((string) ($body['name'] ?? ''));

        if ($category === '' || !in_array($category, self::VALID_CATEGORIES, true)) {
            return ['ok' => false, 'error' => 'category måste vara bug, suggestion eller other'];
        }
        if ($title === '') {
            return ['ok' => false, 'error' => 'title är obligatoriskt'];
        }
        if ($description === '') {
            return ['ok' => false, 'error' => 'description är obligatoriskt'];
        }

        // Length limits
        if (mb_strlen($title) > self::MAX_LENGTHS['title']) {
            return ['ok' => false, 'error' => 'title överskrider maxlängd ' . self::MAX_LENGTHS['title'] . ' tecken'];
        }
        if (mb_strlen($description) > self::MAX_LENGTHS['description']) {
            return ['ok' => false, 'error' => 'description överskrider maxlängd ' . self::MAX_LENGTHS['description'] . ' tecken'];
        }
        if (mb_strlen($name) > self::MAX_LENGTHS['name']) {
            return ['ok' => false, 'error' => 'name överskrider maxlängd ' . self::MAX_LENGTHS['name'] . ' tecken'];
        }

        // Injection scan
        foreach (self::TEXT_FIELDS as $field) {
            $val = trim((string) ($body[$field] ?? ''));
            if ($val === '') {
                continue;
            }
            foreach (self::INJECTION_PATTERNS as $pattern => $label) {
                if (preg_match($pattern, $val)) {
                    return ['ok' => false, 'error' => "{$field} innehåller otillåtet mönster: {$label}"];
                }
            }
        }

        return ['ok' => true];
    }

    // ── GitHub Issue creation ────────────────────────────────────────────

    /**
     * Make a value safe to drop into a single Markdown table cell (issue #383):
     * collapse control characters (incl. CR/LF/TAB) to a single space so a
     * value cannot break the table row, escape the `|` column delimiter, and
     * cap the length so a client cannot inject table structure or an unbounded
     * payload into the issue.
     */
    public static function sanitizeMetaField(mixed $value, int $maxLen): string
    {
        // Only scalars become text; arrays/objects from the JSON body are dropped
        // (avoids an "Array to string conversion" warning and is safe).
        $s = is_scalar($value) ? (string) $value : '';
        $s = (string) preg_replace('/[\x00-\x1f\x7f]+/', ' ', $s);
        // Escape the backslash FIRST, then the table delimiter — otherwise an
        // input like `\|` becomes `\\|` (literal backslash + an unescaped pipe)
        // and still breaks the Markdown table (mirrors feedback.js, #383).
        $s = str_replace('\\', '\\\\', $s);
        $s = str_replace('|', '\\|', $s);
        $s = trim($s);

        return mb_substr($s, 0, $maxLen);
    }

    /**
     * @param array<string,mixed> $body  Validated request body
     * @return string  HTML URL of the created issue
     */
    public static function createIssue(array $body): string
    {
        $category    = trim((string) ($body['category'] ?? ''));
        $title       = trim((string) ($body['title'] ?? ''));
        $description = trim((string) ($body['description'] ?? ''));
        $name        = self::sanitizeMetaField(trim((string) ($body['name'] ?? '')), self::META_MAX_LENGTHS['name']);
        $pageUrl     = self::sanitizeMetaField(trim((string) ($body['url'] ?? '')), self::META_MAX_LENGTHS['url']);
        $viewport    = self::sanitizeMetaField($body['viewport'] ?? '', self::META_MAX_LENGTHS['viewport']);
        $userAgent   = self::sanitizeMetaField($body['userAgent'] ?? '', self::META_MAX_LENGTHS['userAgent']);
        $timestamp   = self::sanitizeMetaField($body['timestamp'] ?? '', self::META_MAX_LENGTHS['timestamp']);

        $display = self::CATEGORY_DISPLAY[$category] ?? $category;

        $issueTitle = "[Feedback] {$display}: {$title}";
        $issueBody  = "{$description}\n\n---\n\n"
            . "| Metadata | Värde |\n"
            . "|----------|-------|\n"
            . "| Kategori | {$display} |\n"
            . '| Sida | ' . ($pageUrl ?: 'Ej angivet') . " |\n"
            . '| Viewport | ' . ($viewport ?: 'Ej angivet') . " |\n"
            . '| Tid | ' . ($timestamp ?: 'Ej angivet') . " |\n"
            . '| Namn/kontakt | ' . ($name ?: 'Ej angivet') . " |\n"
            . '| User-Agent | ' . ($userAgent ?: 'Ej angivet') . " |\n";

        $labels = [self::CATEGORY_LABELS[$category] ?? 'feedback:bug'];

        $gh = new GitHub();

        return $gh->createIssue($issueTitle, $issueBody, $labels);
    }
}
