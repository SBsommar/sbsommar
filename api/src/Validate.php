<?php

declare(strict_types=1);

namespace SBSommar;

/**
 * Input validation – mirrors source/api/validate.js.
 */
final class Validate
{
    private const TIME_RE = '/^\d{2}:\d{2}$/';

    private const MAX_LENGTHS = [
        'title'       => 80,
        'location'    => 200,
        'responsible' => 60,
        'description' => 2000,
        'link'        => 500,
    ];

    /** Single-line scalar fields scanned for control characters (02-§102.1). */
    private const SINGLE_LINE_FIELDS = ['title', 'location', 'responsible', 'link', 'ownerName'];

    /** Control characters allowed inside the multi-line description field (02-§102.3): tab, LF, CR. */
    private const DESCRIPTION_ALLOWED_CONTROLS = [0x09, 0x0A, 0x0D];

    /** Fields rendered in public HTML — scanned for injection patterns (02-§49.1). */
    private const TEXT_FIELDS = ['title', 'location', 'responsible', 'description'];

    /** Patterns indicating potential injection attempts (02-§49.2). */
    private const INJECTION_PATTERNS = [
        '/<script/i'         => '<script>',
        '/javascript:/i'     => 'javascript: URI',
        '/on\w+\s*=/i'       => 'event handler (on*=)',
        '/<iframe/i'         => '<iframe>',
        '/<object/i'         => '<object>',
        '/<embed/i'          => '<embed>',
        '/data:text\/html/i' => 'data:text/html URI',
    ];

    /**
     * @param array<string,mixed>      $body
     * @param array{start_date?:string,end_date?:string}|null $campDates
     * @return array{ok:bool,error?:string}
     */
    public static function validateEventRequest(array $body, ?array $campDates = null): array
    {
        return self::validateFields($body, false, $campDates);
    }

    /**
     * @param array<string,mixed>      $body
     * @param array{start_date?:string,end_date?:string}|null $campDates
     * @return array{ok:bool,error?:string}
     */
    public static function validateEditRequest(array $body, ?array $campDates = null): array
    {
        return self::validateFields($body, true, $campDates);
    }

    /**
     * Batch validation: same rules as single, but with dates[] instead of date.
     *
     * @param array<string,mixed>      $body
     * @param array{start_date?:string,end_date?:string}|null $campDates
     * @return array{ok:bool,error?:string,eventIds?:string[]}
     */
    public static function validateBatchEventRequest(array $body, ?array $campDates = null): array
    {
        if (!isset($body['dates']) || !is_array($body['dates'])) {
            return self::fail('dates måste vara en array');
        }
        if (count($body['dates']) === 0) {
            return self::fail('dates får inte vara tom');
        }

        // Validate non-date fields using a proxy body with the first date.
        $proxyBody = $body;
        $proxyBody['date'] = $body['dates'][0];
        unset($proxyBody['dates']);
        $fieldResult = self::validateFields($proxyBody, false, $campDates);
        if (!$fieldResult['ok']) {
            return $fieldResult;
        }

        // Validate each date individually.
        $eventIds = [];
        $title = trim((string) ($body['title'] ?? ''));
        $start = trim((string) ($body['start'] ?? ''));

        foreach ($body['dates'] as $d) {
            $date = is_string($d) ? trim($d) : '';
            if ($date === '') {
                return self::fail('date är obligatoriskt');
            }
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                return self::fail("date {$date} måste vara YYYY-MM-DD");
            }
            if (strtotime($date) === false) {
                return self::fail("date {$date} är inte ett giltigt datum");
            }
            if ($date < date('Y-m-d')) {
                return self::fail('Datum kan inte vara i det förflutna.');
            }
            if ($campDates !== null
                && isset($campDates['start_date'], $campDates['end_date'])
            ) {
                if ($date < $campDates['start_date'] || $date > $campDates['end_date']) {
                    return self::fail(sprintf(
                        'date %s är utanför lägrets datumintervall (%s – %s)',
                        $date,
                        $campDates['start_date'],
                        $campDates['end_date'],
                    ));
                }
            }

            $slug = GitHub::slugify($title) . "-{$date}-" . str_replace(':', '', $start);
            $eventIds[] = $slug;
        }

        return ['ok' => true, 'eventIds' => $eventIds];
    }

    // ── internal ──────────────────────────────────────────────────────────

    /**
     * @param array<string,mixed>      $body
     * @param array{start_date?:string,end_date?:string}|null $campDates
     * @return array{ok:bool,error?:string}
     */
    private static function validateFields(array $body, bool $requireId, ?array $campDates): array
    {
        $id          = self::str($body, 'id');
        $title       = self::str($body, 'title');
        $date        = self::str($body, 'date');
        $start       = self::str($body, 'start');
        $end         = self::str($body, 'end');
        $location    = self::str($body, 'location');
        $responsible = self::str($body, 'responsible');

        if ($requireId && $id === '') {
            return self::fail('id är obligatoriskt');
        }
        if ($title === '') {
            return self::fail('title är obligatoriskt');
        }
        if ($date === '') {
            return self::fail('date är obligatoriskt');
        }
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return self::fail('date måste vara YYYY-MM-DD');
        }
        $ts = strtotime($date);
        if ($ts === false) {
            return self::fail('date är inte ett giltigt datum');
        }
        if ($date < date('Y-m-d')) {
            return self::fail('Datum kan inte vara i det förflutna.');
        }

        // Camp date range check
        if ($campDates !== null
            && isset($campDates['start_date'], $campDates['end_date'])
        ) {
            if ($date < $campDates['start_date'] || $date > $campDates['end_date']) {
                return self::fail(sprintf(
                    'date %s är utanför lägrets datumintervall (%s – %s)',
                    $date,
                    $campDates['start_date'],
                    $campDates['end_date'],
                ));
            }
        }

        if ($start === '') {
            return self::fail('start är obligatoriskt');
        }
        if (!preg_match(self::TIME_RE, $start)) {
            return self::fail('start måste vara HH:MM');
        }
        if ($end === '') {
            return self::fail('end är obligatoriskt');
        }
        if (!preg_match(self::TIME_RE, $end)) {
            return self::fail('end måste vara HH:MM');
        }
        if ($end === $start) {
            return self::fail('end måste vara efter start');
        }
        if ($end < $start) {
            // Midnight crossing: allow if duration ≤ 17 h (1020 min), reject otherwise.
            $sMins = (int) substr($start, 0, 2) * 60 + (int) substr($start, 3, 2);
            $eMins = (int) substr($end, 0, 2) * 60 + (int) substr($end, 3, 2);
            $dur   = (1440 - $sMins) + $eMins;
            if ($dur > 1020) {
                return self::fail('end måste vara efter start');
            }
        }
        if ($location === '') {
            return self::fail('location är obligatoriskt');
        }
        if ($responsible === '') {
            return self::fail('responsible är obligatoriskt');
        }

        // String length limits
        foreach (['title', 'location', 'responsible'] as $field) {
            $val = self::str($body, $field);
            if (mb_strlen($val) > self::MAX_LENGTHS[$field]) {
                return self::fail(sprintf(
                    '%s överskrider maxlängd %d tecken',
                    $field,
                    self::MAX_LENGTHS[$field],
                ));
            }
        }

        // Optional fields
        if (array_key_exists('description', $body) && !is_string($body['description'])) {
            return self::fail('description måste vara en sträng');
        }
        if (is_string($body['description'] ?? null)
            && mb_strlen($body['description']) > self::MAX_LENGTHS['description']
        ) {
            return self::fail(sprintf(
                'description överskrider maxlängd %d tecken',
                self::MAX_LENGTHS['description'],
            ));
        }
        if (array_key_exists('link', $body) && !is_string($body['link'])) {
            return self::fail('link måste vara en sträng');
        }
        if (is_string($body['link'] ?? null)
            && mb_strlen($body['link']) > self::MAX_LENGTHS['link']
        ) {
            return self::fail(sprintf(
                'link överskrider maxlängd %d tecken',
                self::MAX_LENGTHS['link'],
            ));
        }
        if (array_key_exists('ownerName', $body) && !is_string($body['ownerName'])) {
            return self::fail('ownerName måste vara en sträng');
        }

        // Injection pattern scanning (02-§49.1, 02-§49.2, 02-§49.3)
        foreach (self::TEXT_FIELDS as $field) {
            $val = is_string($body[$field] ?? null) ? $body[$field] : '';
            if ($val === '') {
                continue;
            }
            foreach (self::INJECTION_PATTERNS as $pattern => $label) {
                if (preg_match($pattern, $val)) {
                    return self::fail(sprintf(
                        '%s innehåller otillåtet mönster: %s',
                        $field,
                        $label,
                    ));
                }
            }
        }

        // Link protocol validation (02-§49.4)
        if (is_string($body['link'] ?? null)) {
            $link = trim($body['link']);
            if ($link !== '' && !preg_match('/^https?:\/\//i', $link)) {
                return self::fail('link måste använda http:// eller https://');
            }
        }

        // Control characters / line breaks (02-§102.1, 02-§102.2, 02-§102.3).
        // Single-line fields are checked on their trimmed value, so a value whose
        // only line break is leading/trailing whitespace is accepted (it is
        // trimmed away before the event is written).
        foreach (self::SINGLE_LINE_FIELDS as $field) {
            $raw = $body[$field] ?? null;
            if (is_string($raw) && self::hasControlChar(trim($raw))) {
                return self::fail(sprintf(
                    '%s får inte innehålla radbrytningar eller styrtecken',
                    $field,
                ));
            }
        }
        if (is_string($body['description'] ?? null)
            && self::hasControlChar(trim($body['description']), self::DESCRIPTION_ALLOWED_CONTROLS)
        ) {
            return self::fail('description får inte innehålla styrtecken');
        }

        return ['ok' => true];
    }

    /**
     * True if $str contains a C0 control character (0x00–0x1F) or DEL (0x7F)
     * that is not in $allowed. Iterates bytes; UTF-8 multi-byte characters
     * (å, ä, ö, …) are all ≥ 0x80 and never match, so they pass unaffected.
     *
     * @param int[] $allowed
     */
    private static function hasControlChar(string $str, array $allowed = []): bool
    {
        $len = strlen($str);
        for ($i = 0; $i < $len; $i++) {
            $code = ord($str[$i]);
            if (($code <= 0x1F || $code === 0x7F) && !in_array($code, $allowed, true)) {
                return true;
            }
        }

        return false;
    }

    private static function str(array $body, string $key): string
    {
        $val = $body[$key] ?? null;

        return is_string($val) ? trim($val) : '';
    }

    /** @return array{ok:false,error:string} */
    private static function fail(string $error): array
    {
        return ['ok' => false, 'error' => $error];
    }
}
