<?php

declare(strict_types=1);

namespace SBSommar;

use Symfony\Component\Yaml\Yaml;

/**
 * GitHub Contents API integration – mirrors source/api/github.js.
 */
final class GitHub
{
    private string $owner;
    private string $repo;
    private string $branch;
    private string $token;
    private ?string $buildEnv;

    private const CAMPS_PATH = 'source/data/camps.yaml';

    public function __construct()
    {
        $this->owner    = self::env('GITHUB_OWNER');
        $this->repo     = self::env('GITHUB_REPO');
        $this->branch   = self::env('GITHUB_BRANCH');
        $this->token    = self::env('GITHUB_TOKEN');
        $this->buildEnv = $_ENV['BUILD_ENV'] ?? null;
    }

    // ── Public API ───────────────────────────────────────────────────────

    /**
     * Append a new event to the active camp's YAML file via ephemeral
     * branch → PR → auto-merge.
     *
     * @param array<string,mixed> $body  Validated request body
     */
    public function addEventToActiveCamp(array $body): void
    {
        $title       = trim((string) ($body['title'] ?? ''));
        $date        = trim((string) ($body['date'] ?? ''));
        $start       = trim((string) ($body['start'] ?? ''));
        $end         = trim((string) ($body['end'] ?? ''));
        $location    = trim((string) ($body['location'] ?? ''));
        $responsible = trim((string) ($body['responsible'] ?? ''));
        $description = is_string($body['description'] ?? null) ? trim($body['description']) : null;
        $link        = is_string($body['link'] ?? null) ? trim($body['link']) : null;
        $ownerName   = is_string($body['ownerName'] ?? null) ? trim($body['ownerName']) : '';

        $description = $description !== '' ? $description : null;
        $link        = $link !== '' ? $link : null;

        $now = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Y-m-d H:i');

        $event = [
            'id'          => self::slugify($title) . "-{$date}-" . str_replace(':', '', $start),
            'title'       => $title,
            'date'        => $date,
            'start'       => $start,
            'end'         => $end,
            'location'    => $location,
            'responsible' => $responsible,
            'description' => $description,
            'link'        => $link,
            'owner'       => ['name' => $ownerName, 'email' => ''],
            'meta'        => ['created_at' => $now, 'updated_at' => $now, 'location_set_at' => $now],
        ];

        // 1. Resolve active camp
        $camp = $this->resolveActiveCamp();

        // 2. Build the fragment file and verify it parses with the expected id
        // before any branch/PR is created (02-§102.5, §109.5, §109.17).
        $fragPath   = self::fragmentPath($camp['file'], $event['id']);
        $content    = self::buildFragmentYaml($event) . "\n";
        self::assertFragmentYamlValid($content, $event['id']);
        $commitMsg  = "Add event to {$camp['name']}: {$title} ({$date})";

        // Reject a duplicate before any branch/PR is created, so an already-merged
        // identical activity fails cleanly (409) instead of a dangling branch and a
        // generic write-conflict error (02-§111.1, §111.2).
        if ($this->getFileMaybe($fragPath) !== null) {
            throw new DuplicateEventException("Event already exists: {$event['id']}");
        }

        // 3. Ephemeral branch → create the new fragment file (no sha) → PR → auto-merge.
        $mainSha    = $this->getMainSha();
        $branchName = 'event/' . $date . '-' . self::slugify($title) . '-' . time();
        $this->createBranch($branchName, $mainSha);
        $this->putFile($fragPath, $content, null, $commitMsg, $branchName);
        $pr = $this->createPullRequest($commitMsg, $branchName, 'Automatically created by the SB Sommar add-event API.');
        $this->enableAutoMerge($pr['node_id']);
        // Place the PR in the merge queue right away to merge in ~50 s instead of
        // waiting for the reactive recovery sweep. Best-effort: never fails the
        // submission (02-§113.1, §113.4).
        $this->enqueueBestEffort($pr['node_id']);
    }

    /**
     * Batch: add multiple events (same activity on different dates) in one PR.
     *
     * @param array $body Request body with 'dates' array instead of 'date'.
     * @return string[] Array of created event IDs.
     */
    public function addEventsToActiveCamp(array $body): array
    {
        $title       = trim((string) ($body['title'] ?? ''));
        $start       = trim((string) ($body['start'] ?? ''));
        $end         = trim((string) ($body['end'] ?? ''));
        $location    = trim((string) ($body['location'] ?? ''));
        $responsible = trim((string) ($body['responsible'] ?? ''));
        $description = is_string($body['description'] ?? null) ? trim($body['description']) : null;
        $link        = is_string($body['link'] ?? null) ? trim($body['link']) : null;
        $ownerName   = is_string($body['ownerName'] ?? null) ? trim($body['ownerName']) : '';

        $description = $description !== '' ? $description : null;
        $link        = $link !== '' ? $link : null;

        $now = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Y-m-d H:i');

        $dates    = $body['dates'];
        $eventIds = [];
        $events   = [];

        foreach ($dates as $date) {
            $date = trim((string) $date);
            $eventId = self::slugify($title) . "-{$date}-" . str_replace(':', '', $start);
            $eventIds[] = $eventId;

            $events[] = [
                'id'          => $eventId,
                'title'       => $title,
                'date'        => $date,
                'start'       => $start,
                'end'         => $end,
                'location'    => $location,
                'responsible' => $responsible,
                'description' => $description,
                'link'        => $link,
                'owner'       => ['name' => $ownerName, 'email' => ''],
                'meta'        => ['created_at' => $now, 'updated_at' => $now, 'location_set_at' => $now],
            ];
        }

        // 1. Resolve active camp
        $camp = $this->resolveActiveCamp();

        // 2. Build one fragment file per date and verify each parses with its
        // expected id before any branch/PR (02-§102.5, §109.6, §109.17). The file
        // names are distinct (one per date), so even the batch's own files never
        // collide and the PR cannot conflict with another submission (02-§109.7).
        $fragments = [];
        foreach ($events as $event) {
            $content = self::buildFragmentYaml($event) . "\n";
            self::assertFragmentYamlValid($content, $event['id']);
            $fragments[] = [self::fragmentPath($camp['file'], $event['id']), $content, $event['id']];
        }
        $commitMsg  = "Add " . count($dates) . " recurring events to {$camp['name']}: {$title}";

        // Reject the whole batch before any branch/PR if any date's fragment already
        // exists on main — atomic, so a partial overlap never creates some files
        // (02-§111.4, §111.5).
        foreach ($fragments as [$fragPath, , $eventId]) {
            if ($this->getFileMaybe($fragPath) !== null) {
                throw new DuplicateEventException("Event already exists: {$eventId}");
            }
        }

        // 3. Ephemeral branch → create every fragment file on it → PR → auto-merge.
        $mainSha    = $this->getMainSha();
        $branchName = 'event/batch-' . self::slugify($title) . '-' . time();
        $this->createBranch($branchName, $mainSha);
        foreach ($fragments as [$fragPath, $content]) {
            $this->putFile($fragPath, $content, null, $commitMsg, $branchName);
        }
        $pr = $this->createPullRequest($commitMsg, $branchName, 'Automatically created by the SB Sommar add-events API (batch).');
        $this->enableAutoMerge($pr['node_id']);
        // Proactive merge-queue enqueue, best-effort (02-§113.1, §113.4).
        $this->enqueueBestEffort($pr['node_id']);

        return $eventIds;
    }

    /**
     * Edit an existing event by rewriting its fragment file in place. The camp
     * YAML file is never read or rewritten (02-§109.9, §109.26).
     *
     * @param array<string,mixed> $updates  Validated request body
     */
    public function updateEventInActiveCamp(string $eventId, array $updates): void
    {
        $camp       = $this->resolveActiveCamp();
        $now        = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Y-m-d H:i');
        $commitMsg  = "Edit event in {$camp['name']}: {$eventId}";
        $mainSha    = $this->getMainSha();
        $branchName = "event-edit/{$eventId}-" . time();

        // Edit operates only on the event's fragment file; no fragment → no
        // change, error raised (02-§109.12).
        $fragPath = self::fragmentPath($camp['file'], $eventId);
        $frag     = $this->getFileMaybe($fragPath);
        if ($frag === null) {
            throw new \RuntimeException("Event not found: {$eventId}");
        }
        [$fragContent, $fragSha] = $frag;
        $doc = Yaml::parse($fragContent);
        if (!is_array($doc) || !is_array($doc['event'] ?? null)) {
            throw new \RuntimeException("Event not found: {$eventId}");
        }
        $patched = self::patchEventObject($doc['event'], $updates, $now);
        $content = self::buildFragmentYaml($patched) . "\n";
        self::assertFragmentYamlValid($content, $eventId);
        $this->createBranch($branchName, $mainSha);
        $this->putFile($fragPath, $content, $fragSha, $commitMsg, $branchName);
        $pr = $this->createPullRequest($commitMsg, $branchName, 'Automatically created by the SB Sommar edit-event API.');
        $this->enableAutoMerge($pr['node_id']);
        // Proactive merge-queue enqueue, best-effort (02-§113.1, §113.4).
        $this->enqueueBestEffort($pr['node_id']);
    }

    /**
     * Delete an event by removing its fragment file via ephemeral
     * branch → PR → auto-merge. The camp YAML file is never rewritten
     * (02-§109.9, §109.26).
     */
    public function removeEventFromActiveCamp(string $eventId): void
    {
        $camp       = $this->resolveActiveCamp();
        $commitMsg  = "Delete event in {$camp['name']}: {$eventId}";
        $mainSha    = $this->getMainSha();
        $branchName = "event-delete/{$eventId}-" . time();

        // Delete operates only on the event's fragment file; no fragment → no
        // change, error raised (02-§109.12).
        $fragPath = self::fragmentPath($camp['file'], $eventId);
        $frag     = $this->getFileMaybe($fragPath);
        if ($frag === null) {
            throw new \RuntimeException("Event not found: {$eventId}");
        }
        [, $fragSha] = $frag;
        $this->createBranch($branchName, $mainSha);
        $this->deleteFile($fragPath, $fragSha, $commitMsg, $branchName);
        $pr = $this->createPullRequest($commitMsg, $branchName, 'Automatically created by the SB Sommar delete-event API.');
        $this->enableAutoMerge($pr['node_id']);
        // Proactive merge-queue enqueue, best-effort (02-§113.1, §113.4).
        $this->enqueueBestEffort($pr['node_id']);
    }

    // ── Camp resolution ──────────────────────────────────────────────────

    /** @return array<string,mixed> */
    private function resolveActiveCamp(): array
    {
        [$campsYaml] = $this->getFile(self::CAMPS_PATH);
        $data = Yaml::parse($campsYaml);

        return ActiveCamp::resolve($data['camps'] ?? [], null, $this->buildEnv);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    public static function slugify(string $str): string
    {
        $str = mb_strtolower($str);
        $str = strtr($str, ['å' => 'a', 'ä' => 'a', 'ö' => 'o']);
        $str = (string) preg_replace('/[^a-z0-9]+/', '-', $str);
        $str = trim($str, '-');

        return substr($str, 0, 48);
    }

    /**
     * Wrap a YAML scalar in single quotes only when necessary.
     */
    public static function yamlScalar(mixed $val): string
    {
        if ($val === null) {
            return 'null';
        }
        $s = (string) $val;
        if ($s === '') {
            return "''";
        }
        if (preg_match('/[:#{}[\],&*?|<>=!%@`]/', $s)
            || preg_match('/^[\s"\'0-9]/', $s)
            || $s !== trim($s)
        ) {
            return "'" . str_replace("'", "''", $s) . "'";
        }

        return $s;
    }

    /**
     * Serialise an event's field lines (everything after the id line), using
     * $fp as the field-line prefix and $dp as the description/sub-key prefix.
     * Shared by buildEventYaml (camp-file list item) and buildFragmentYaml.
     *
     * @return string[]
     */
    private static function eventBodyLines(array $event, string $fp, string $dp): array
    {
        $lines = [
            "{$fp}title: " . self::yamlScalar($event['title']),
            "{$fp}date: '{$event['date']}'",
            "{$fp}start: '{$event['start']}'",
            "{$fp}end: '{$event['end']}'",
            "{$fp}location: " . self::yamlScalar($event['location']),
            "{$fp}responsible: " . self::yamlScalar($event['responsible']),
        ];

        if (($event['description'] ?? null) !== null) {
            $lines[] = "{$fp}description: |";
            // Normalise CRLF / lone CR to LF so the literal block has no stray
            // carriage returns regardless of the submitter's platform (02-§102.4).
            $normalised = str_replace(["\r\n", "\r"], "\n", (string) $event['description']);
            foreach (explode("\n", $normalised) as $l) {
                $lines[] = "{$dp}{$l}";
            }
        } else {
            $lines[] = "{$fp}description: null";
        }

        $lines[] = "{$fp}link: " . (($event['link'] ?? null) !== null ? self::yamlScalar($event['link']) : 'null');
        // Only write the cancelled line when the activity is cancelled (02-§118).
        // An active activity omits it, so un-cancelling removes the line and
        // existing fragments are untouched until they are edited.
        if (!empty($event['cancelled'])) {
            $lines[] = "{$fp}cancelled: true";
        }
        // Only write the moved block when the activity carries a previous-slot
        // marker (02-§119.1). Moving it back to its original slot drops it again.
        if (!empty($event['moved']) && !empty($event['moved']['from_date'])) {
            $fromEnd  = $event['moved']['from_end'] ?? null;
            $lines[]  = "{$fp}moved:";
            $lines[]  = "{$dp}from_date: '{$event['moved']['from_date']}'";
            $lines[]  = "{$dp}from_start: '{$event['moved']['from_start']}'";
            $lines[]  = "{$dp}from_end: " . ($fromEnd ? "'{$fromEnd}'" : 'null');
        }
        // Only write the relocated block when the activity carries a previous
        // location (02-§119.14). Restoring the original location drops it again.
        if (!empty($event['relocated']) && !empty($event['relocated']['from_location'])) {
            $lines[] = "{$fp}relocated:";
            $lines[] = "{$dp}from_location: " . self::yamlScalar($event['relocated']['from_location']);
        }
        $lines[] = "{$fp}owner:";
        $lines[] = "{$dp}name: '" . str_replace("'", "''", $event['owner']['name'] ?? '') . "'";
        $lines[] = "{$dp}email: ''";
        $lines[] = "{$fp}meta:";
        $lines[] = "{$dp}created_at: {$event['meta']['created_at']}";
        $lines[] = "{$dp}updated_at: {$event['meta']['updated_at']}";
        // Only write location_set_at when the activity carries it (02-§120.8);
        // events that have never changed room and predate the field stay untouched.
        if (!empty($event['meta']['location_set_at'])) {
            $lines[] = "{$dp}location_set_at: {$event['meta']['location_set_at']}";
        }

        return $lines;
    }

    /**
     * Serialise a single event as a YAML block ready to append.
     */
    public static function buildEventYaml(array $event, int $indent = 0): string
    {
        $p  = str_repeat(' ', $indent);       // prefix for "- id:" line
        $fp = str_repeat(' ', $indent + 2);   // prefix for field lines
        $dp = str_repeat(' ', $indent + 4);   // prefix for description body

        return implode("\n", array_merge(
            ["{$p}- id: {$event['id']}"],
            self::eventBodyLines($event, $fp, $dp),
        ));
    }

    /**
     * Serialise a single event as a standalone fragment file: one top-level
     * `event:` mapping with fields indented two spaces (02-§109.2).
     */
    public static function buildFragmentYaml(array $event): string
    {
        return implode("\n", array_merge(
            ['event:', "  id: {$event['id']}"],
            self::eventBodyLines($event, '  ', '    '),
        ));
    }

    /** Per-camp fragment directory (02-§109.1). */
    public static function fragmentDir(string $campFile): string
    {
        return 'source/data/' . preg_replace('/\.ya?ml$/', '', $campFile);
    }

    /** Fragment file path for an event id (02-§109.3). */
    public static function fragmentPath(string $campFile, string $eventId): string
    {
        return self::fragmentDir($campFile) . "/{$eventId}.yaml";
    }

    /**
     * Backstop before any branch/PR (02-§109.17): the proposed fragment must
     * parse to a single `event:` mapping whose id matches the expected one.
     */
    public static function assertFragmentYamlValid(string $content, string $expectedId): void
    {
        try {
            $doc = Yaml::parse($content);
        } catch (\Throwable $e) {
            throw new \RuntimeException('Proposed fragment YAML failed to parse: ' . $e->getMessage(), 0, $e);
        }
        if (!is_array($doc) || !is_array($doc['event'] ?? null)) {
            throw new \RuntimeException('Proposed fragment YAML is missing the event mapping');
        }
        if (($doc['event']['id'] ?? null) !== $expectedId) {
            throw new \RuntimeException('Proposed fragment YAML has wrong event id: ' . $expectedId);
        }
    }

    /**
     * Apply $updates to a single event array using the project's mutable-field
     * rules. This is the only edit path — every event lives in its own fragment
     * file (02-§109.9, §109.10).
     *
     * @param array<string,mixed> $event
     * @param array<string,mixed> $updates
     * @return array<string,mixed>
     */
    public static function patchEventObject(array $event, array $updates, string $now): array
    {
        $date  = array_key_exists('date', $updates) ? ($updates['date'] ?: $event['date']) : $event['date'];
        $start = array_key_exists('start', $updates) ? ($updates['start'] ?: $event['start']) : $event['start'];
        $end   = array_key_exists('end', $updates) ? ($updates['end'] ?: null) : ($event['end'] ?? null);

        $moved = self::resolveMoved($event, $date, $start, $end);

        $location  = array_key_exists('location', $updates) ? ($updates['location'] ?: $event['location']) : $event['location'];
        $relocated = self::resolveRelocated($event, (string) $location);

        // Room-choice time (02-§120.8): renew it when the location actually
        // changes, otherwise preserve whatever the activity already carried.
        $prevLocationSetAt = $event['meta']['location_set_at'] ?? null;
        $locationSetAt     = ($location !== $event['location']) ? $now : ($prevLocationSetAt ?: null);

        $patched = [
            'id'          => $event['id'],
            'title'       => array_key_exists('title', $updates) ? ($updates['title'] ?: $event['title']) : $event['title'],
            'date'        => $date,
            'start'       => $start,
            'end'         => $end,
            'location'    => $location,
            'responsible' => array_key_exists('responsible', $updates) ? ($updates['responsible'] ?: $event['responsible']) : $event['responsible'],
            'description' => array_key_exists('description', $updates) ? ($updates['description'] ?: null) : ($event['description'] ?? null),
            'link'        => array_key_exists('link', $updates) ? ($updates['link'] ?: null) : ($event['link'] ?? null),
            'cancelled'   => array_key_exists('cancelled', $updates) ? (bool) $updates['cancelled'] : (bool) ($event['cancelled'] ?? false),
            'owner'       => $event['owner'] ?? ['name' => '', 'email' => ''],
            'meta'        => [
                'created_at' => $event['meta']['created_at'] ?? null,
                'updated_at' => $now,
            ],
        ];
        if ($locationSetAt) {
            $patched['meta']['location_set_at'] = $locationSetAt;
        }
        if ($moved !== null) {
            $patched['moved'] = $moved;
        }
        if ($relocated !== null) {
            $patched['relocated'] = $relocated;
        }

        return $patched;
    }

    /**
     * Normalise a raw `relocated` value into null or a clean { from_location }
     * array. A marker needs a non-empty previous location (02-§119.14).
     *
     * @param mixed $raw
     * @return array{from_location:string}|null
     */
    public static function normaliseRelocated(mixed $raw): ?array
    {
        if (!is_array($raw) || empty($raw['from_location'])) {
            return null;
        }

        return ['from_location' => (string) $raw['from_location']];
    }

    /**
     * Decide the event's `relocated` marker after an edit (02-§119.15): record
     * the location it left when the location changes, clear it when the change
     * restores the recorded original, and keep the existing marker untouched when
     * the location is unchanged. Mirrors resolveRelocated() in
     * source/api/edit-event.js.
     *
     * @param array<string,mixed> $event
     * @return array{from_location:string}|null
     */
    public static function resolveRelocated(array $event, string $newLocation): ?array
    {
        $oldLocation = (string) $event['location'];
        $prev        = self::normaliseRelocated($event['relocated'] ?? null);

        if ($newLocation === $oldLocation) {
            return $prev;
        }
        if ($prev !== null && $prev['from_location'] === $newLocation) {
            return null;
        }

        return ['from_location' => $oldLocation];
    }

    /**
     * Normalise a raw `moved` value into null or a clean
     * { from_date, from_start, from_end } array. A marker needs a previous date
     * and start; from_end may be null (02-§119.1).
     *
     * @param mixed $raw
     * @return array{from_date:string,from_start:string,from_end:?string}|null
     */
    public static function normaliseMoved(mixed $raw): ?array
    {
        if (!is_array($raw) || empty($raw['from_date']) || empty($raw['from_start'])) {
            return null;
        }
        $fromEnd = $raw['from_end'] ?? null;

        return [
            'from_date'  => (string) $raw['from_date'],
            'from_start' => (string) $raw['from_start'],
            'from_end'   => $fromEnd ? (string) $fromEnd : null,
        ];
    }

    /**
     * Decide the event's `moved` marker after an edit (02-§119.3–§119.5):
     * record the slot it left when date/start/end change, clear it when the move
     * returns it to the slot already recorded in `moved`, and keep the existing
     * marker untouched on a text-only edit. Mirrors resolveMoved() in
     * source/api/edit-event.js.
     *
     * @param array<string,mixed> $event
     * @return array{from_date:string,from_start:string,from_end:?string}|null
     */
    public static function resolveMoved(array $event, string $newDate, string $newStart, ?string $newEnd): ?array
    {
        $oldDate  = (string) $event['date'];
        $oldStart = (string) $event['start'];
        $oldEnd   = isset($event['end']) && $event['end'] !== null ? (string) $event['end'] : null;
        $prev     = self::normaliseMoved($event['moved'] ?? null);

        $timeChanged = $newDate !== $oldDate || $newStart !== $oldStart || $newEnd !== $oldEnd;
        if (!$timeChanged) {
            return $prev;
        }

        if ($prev !== null
            && $prev['from_date'] === $newDate
            && $prev['from_start'] === $newStart
            && ($prev['from_end'] ?? null) === $newEnd
        ) {
            return null;
        }

        return ['from_date' => $oldDate, 'from_start' => $oldStart, 'from_end' => $oldEnd];
    }

    /**
     * Determine the indentation (number of leading spaces) of the existing
     * `events:` list items so an appended block matches and the file stays valid
     * YAML (02-§10.6, 02-§102.8). Defaults to 2 when the list has no items yet.
     */
    public static function detectEventIndent(string $campContent): int
    {
        $lines     = explode("\n", $campContent);
        $eventsIdx = null;
        foreach ($lines as $i => $line) {
            if (preg_match('/^events:/', $line)) {
                $eventsIdx = $i;
                break;
            }
        }
        if ($eventsIdx !== null) {
            $count = count($lines);
            for ($i = $eventsIdx + 1; $i < $count; $i++) {
                if (preg_match('/^( *)- +id:/', $lines[$i], $m)) {
                    return strlen($m[1]);
                }
                // A non-indented, non-empty line means the events list has ended.
                if (preg_match('/^\S/', $lines[$i]) && trim($lines[$i]) !== '') {
                    break;
                }
            }
        }

        return 2;
    }

    /**
     * Defence-in-depth backstop (02-§102.5): parse the complete proposed camp
     * document and confirm it contains every newly created event id before any
     * branch or pull request is created. Throws on a parse failure or a missing
     * id so the caller aborts without writing anything to git.
     *
     * @param string[] $expectedIds
     */
    public static function assertEventYamlValid(string $yamlContent, array $expectedIds): void
    {
        try {
            $doc = Yaml::parse($yamlContent);
        } catch (\Throwable $e) {
            throw new \RuntimeException('Proposed camp YAML failed to parse: ' . $e->getMessage(), 0, $e);
        }
        if (!is_array($doc) || !is_array($doc['events'] ?? null)) {
            throw new \RuntimeException('Proposed camp YAML is missing the events list');
        }
        $ids = [];
        foreach ($doc['events'] as $e) {
            if (is_array($e) && isset($e['id'])) {
                $ids[] = $e['id'];
            }
        }
        foreach ($expectedIds as $id) {
            if (!in_array($id, $ids, true)) {
                throw new \RuntimeException('Proposed camp YAML is missing expected event id: ' . $id);
            }
        }
    }

    /**
     * Create a GitHub Issue and return its HTML URL.
     *
     * @param string   $title  Issue title
     * @param string   $body   Issue body (Markdown)
     * @param string[] $labels Label names to apply
     * @return string  The HTML URL of the created issue
     */
    public function createIssue(string $title, string $body, array $labels): string
    {
        $apiPath = "/repos/{$this->owner}/{$this->repo}/issues";
        $data = $this->githubRequest('POST', $apiPath, [
            'title'  => $title,
            'body'   => $body,
            'labels' => $labels,
        ]);

        return $data['html_url'] ?? '';
    }

    // ── GitHub API primitives ────────────────────────────────────────────

    private static function env(string $name): string
    {
        $val = $_ENV[$name] ?? '';
        if ($val === '') {
            throw new \RuntimeException("Missing environment variable: {$name}");
        }

        return $val;
    }

    /**
     * @return array{string,string} [content, sha]
     */
    private function getFile(string $filePath): array
    {
        $apiPath = "/repos/{$this->owner}/{$this->repo}/contents/{$filePath}?ref={$this->branch}";
        $data = $this->githubRequest('GET', $apiPath);

        $content = base64_decode($data['content'], true);

        return [$content, $data['sha']];
    }

    /**
     * Like getFile, but returns null when the file does not exist (HTTP 404)
     * instead of throwing — used to decide whether an event lives in a fragment
     * file (02-§109.9).
     *
     * @return array{string,string}|null [content, sha] or null
     */
    private function getFileMaybe(string $filePath): ?array
    {
        try {
            return $this->getFile($filePath);
        } catch (\RuntimeException $e) {
            if (str_starts_with($e->getMessage(), 'GitHub API 404')) {
                return null;
            }
            throw $e;
        }
    }

    /**
     * Commit a file to a branch. Pass $sha = null to create a new file; pass the
     * current blob sha to update an existing one.
     */
    private function putFile(string $filePath, string $content, ?string $sha, string $message, string $branch): void
    {
        $apiPath = "/repos/{$this->owner}/{$this->repo}/contents/{$filePath}";
        $payload = [
            'message' => $message,
            'content' => base64_encode($content),
            'branch'  => $branch,
        ];
        if ($sha !== null) {
            $payload['sha'] = $sha;
        }
        $this->githubRequest('PUT', $apiPath, $payload);
    }

    /** Delete a file on a branch (02-§109.11). */
    private function deleteFile(string $filePath, string $sha, string $message, string $branch): void
    {
        $apiPath = "/repos/{$this->owner}/{$this->repo}/contents/{$filePath}";
        $this->githubRequest('DELETE', $apiPath, [
            'message' => $message,
            'sha'     => $sha,
            'branch'  => $branch,
        ]);
    }

    private function getMainSha(): string
    {
        $apiPath = "/repos/{$this->owner}/{$this->repo}/git/refs/heads/{$this->branch}";
        $data = $this->githubRequest('GET', $apiPath);

        return $data['object']['sha'];
    }

    private function createBranch(string $name, string $sha): void
    {
        $apiPath = "/repos/{$this->owner}/{$this->repo}/git/refs";
        $this->githubRequest('POST', $apiPath, [
            'ref' => "refs/heads/{$name}",
            'sha' => $sha,
        ]);
    }

    /**
     * @return array{number:int,node_id:string}
     */
    private function createPullRequest(string $title, string $head, string $body): array
    {
        $apiPath = "/repos/{$this->owner}/{$this->repo}/pulls";
        $data = $this->githubRequest('POST', $apiPath, [
            'title' => $title,
            'head'  => $head,
            'base'  => $this->branch,
            'body'  => $body,
        ]);

        return ['number' => $data['number'], 'node_id' => $data['node_id']];
    }

    private function enableAutoMerge(string $nodeId): void
    {
        $query = '
            mutation($id: ID!) {
                enablePullRequestAutoMerge(input: { pullRequestId: $id, mergeMethod: SQUASH }) {
                    pullRequest { number }
                }
            }
        ';

        $data = $this->githubRequest('POST', '/graphql', [
            'query'     => $query,
            'variables' => ['id' => $nodeId],
        ]);

        if (!empty($data['errors'])) {
            throw new \RuntimeException('GraphQL error enabling auto-merge: ' . $data['errors'][0]['message']);
        }
    }

    /**
     * Build the GraphQL mutation that places a pull request in the merge queue
     * (02-§113.1). Pure (no network) so it can be unit-tested. Unlike
     * enablePullRequestAutoMerge, enqueuePullRequest takes no merge method — the
     * merge queue's configured method is used (02-§113.3).
     *
     * @return array{query:string,variables:array{id:string}}
     */
    public static function buildEnqueueMutation(string $nodeId): array
    {
        return [
            'query' => '
                mutation($id: ID!) {
                    enqueuePullRequest(input: { pullRequestId: $id }) {
                        mergeQueueEntry { id }
                    }
                }
            ',
            'variables' => ['id' => $nodeId],
        ];
    }

    /**
     * Place a pull request in the merge queue via the GraphQL API (02-§113.1).
     * GraphQL errors arrive as HTTP 200 with a body-level errors array — checked
     * explicitly, mirroring enableAutoMerge. Best-effort containment lives in the
     * caller (enqueueBestEffort), so this stays a plain "enqueue or throw"
     * primitive.
     */
    private function enqueuePullRequest(string $nodeId): void
    {
        ['query' => $query, 'variables' => $variables] = self::buildEnqueueMutation($nodeId);

        $data = $this->githubRequest('POST', '/graphql', [
            'query'     => $query,
            'variables' => $variables,
        ]);

        if (!empty($data['errors'])) {
            throw new \RuntimeException('GraphQL error enqueuing pull request: ' . $data['errors'][0]['message']);
        }
    }

    /**
     * Best-effort wrapper around enqueuePullRequest (02-§113.4–113.7): it must
     * never fail the user's submission. The pull request has already been created
     * with auto-merge enabled, so a failed enqueue — most commonly because the
     * required checks are still running, so the queue declines an unmergeable pull
     * request (02-§113.5) — is logged as a warning and falls back to auto-merge
     * plus the reactive recovery in §112.
     */
    private function enqueueBestEffort(string $nodeId): void
    {
        try {
            $this->enqueuePullRequest($nodeId);
        } catch (\Throwable $e) {
            error_log('Proactive enqueue failed (best-effort; falling back to auto-merge + recovery): ' . $e->getMessage());
        }
    }

    /**
     * Make a single HTTPS request to the GitHub API.
     *
     * @return array<string,mixed>
     */
    private function githubRequest(string $method, string $path, ?array $body = null): array
    {
        $url = 'https://api.github.com' . $path;
        $payload = $body !== null ? json_encode($body, JSON_UNESCAPED_UNICODE) : null;

        $headers = [
            'Authorization: Bearer ' . $this->token,
            'Accept: application/vnd.github+json',
            'User-Agent: sbsommar-api/1.0',
            'X-GitHub-Api-Version: 2022-11-28',
        ];
        if ($payload !== null) {
            $headers[] = 'Content-Type: application/json';
            $headers[] = 'Content-Length: ' . strlen($payload);
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST  => $method,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 30,
        ]);
        if ($payload !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        }

        $response   = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError  = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            throw new \RuntimeException("GitHub API request failed: {$curlError}");
        }

        $data = json_decode($response, true) ?? [];

        if ($statusCode >= 400) {
            $msg = $data['message'] ?? $response;
            throw new \RuntimeException("GitHub API {$statusCode}: {$msg}");
        }

        return $data;
    }

    /**
     * Classify a GitHub API error into a user-facing Swedish message.
     *
     * Parses the exception message produced by githubRequest() to determine
     * the error category. Never exposes tokens, paths, or stack traces.
     */
    public static function classifyGitHubError(\Throwable $e): string
    {
        $msg = $e->getMessage();

        // Network / curl failure (no HTTP status)
        if (str_starts_with($msg, 'GitHub API request failed:')) {
            if (str_contains($msg, 'timed out') || str_contains($msg, 'Timeout')) {
                return 'Kunde inte nå GitHub — anslutningen tog för lång tid. Försök igen om en stund.';
            }

            return 'Kunde inte nå GitHub. Kontrollera att tjänsten är tillgänglig och försök igen.';
        }

        // Extract HTTP status code from "GitHub API {code}: ..."
        if (preg_match('/^GitHub API (\d{3}):/', $msg, $m)) {
            $status = (int) $m[1];

            // Rate limiting (403 with rate limit message, or 429)
            if ($status === 429 || ($status === 403 && str_contains($msg, 'rate limit'))) {
                return 'För många förfrågningar just nu. Försök igen om några minuter.';
            }

            // Authentication / authorisation
            if ($status === 401 || $status === 403) {
                return 'Servern kunde inte ansluta till GitHub. Kontakta arrangören.';
            }

            // Conflict or validation
            if ($status === 409 || $status === 422) {
                return 'En skrivkonflikt uppstod. Försök igen.';
            }

            // GitHub server errors
            if ($status >= 500) {
                return 'GitHub har tillfälliga problem. Försök igen om en stund.';
            }
        }

        // Missing environment variables (constructor throws)
        if (str_contains($msg, 'Missing required env')) {
            return 'Servern är inte korrekt konfigurerad. Kontakta arrangören.';
        }

        return 'Ett oväntat fel uppstod. Försök igen eller kontakta arrangören.';
    }
}
