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
            'meta'        => ['created_at' => $now, 'updated_at' => $now],
        ];

        // 1. Resolve active camp
        $camp = $this->resolveActiveCamp();

        // 2. Build the fragment file and verify it parses with the expected id
        // before any branch/PR is created (02-§102.5, §109.5, §109.17).
        $fragPath   = self::fragmentPath($camp['file'], $event['id']);
        $content    = self::buildFragmentYaml($event) . "\n";
        self::assertFragmentYamlValid($content, $event['id']);
        $commitMsg  = "Add event to {$camp['name']}: {$title} ({$date})";

        // 3. Ephemeral branch → create the new fragment file (no sha) → PR → auto-merge.
        $mainSha    = $this->getMainSha();
        $branchName = 'event/' . $date . '-' . self::slugify($title) . '-' . time();
        $this->createBranch($branchName, $mainSha);
        $this->putFile($fragPath, $content, null, $commitMsg, $branchName);
        $pr = $this->createPullRequest($commitMsg, $branchName, 'Automatically created by the SB Sommar add-event API.');
        $this->enableAutoMerge($pr['node_id']);
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
                'meta'        => ['created_at' => $now, 'updated_at' => $now],
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
            $fragments[] = [self::fragmentPath($camp['file'], $event['id']), $content];
        }
        $commitMsg  = "Add " . count($dates) . " recurring events to {$camp['name']}: {$title}";

        // 3. Ephemeral branch → create every fragment file on it → PR → auto-merge.
        $mainSha    = $this->getMainSha();
        $branchName = 'event/batch-' . self::slugify($title) . '-' . time();
        $this->createBranch($branchName, $mainSha);
        foreach ($fragments as [$fragPath, $content]) {
            $this->putFile($fragPath, $content, null, $commitMsg, $branchName);
        }
        $pr = $this->createPullRequest($commitMsg, $branchName, 'Automatically created by the SB Sommar add-events API (batch).');
        $this->enableAutoMerge($pr['node_id']);

        return $eventIds;
    }

    /**
     * Patch an existing event in the active camp's YAML file.
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

        // Fragment first (02-§109.9): rewrite the fragment file in place.
        $fragPath = self::fragmentPath($camp['file'], $eventId);
        $frag     = $this->getFileMaybe($fragPath);
        if ($frag !== null) {
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
            return;
        }

        // Fallback (02-§109.12): patch the camp YAML file in place.
        $campFilePath = 'source/data/' . $camp['file'];
        [$campContent, $fileSha] = $this->getFile($campFilePath);
        $newContent = self::patchEventInYaml($campContent, $eventId, $updates);
        if ($newContent === null) {
            throw new \RuntimeException("Event not found: {$eventId}");
        }
        $this->createBranch($branchName, $mainSha);
        $this->putFile($campFilePath, $newContent, $fileSha, $commitMsg, $branchName);
        $pr = $this->createPullRequest($commitMsg, $branchName, 'Automatically created by the SB Sommar edit-event API.');
        $this->enableAutoMerge($pr['node_id']);
    }

    /**
     * Remove an event from the active camp's YAML file via ephemeral
     * branch → PR → auto-merge.
     */
    public function removeEventFromActiveCamp(string $eventId): void
    {
        $camp       = $this->resolveActiveCamp();
        $commitMsg  = "Delete event in {$camp['name']}: {$eventId}";
        $mainSha    = $this->getMainSha();
        $branchName = "event-delete/{$eventId}-" . time();

        // Fragment first (02-§109.11): delete the fragment file.
        $fragPath = self::fragmentPath($camp['file'], $eventId);
        $frag     = $this->getFileMaybe($fragPath);
        if ($frag !== null) {
            [, $fragSha] = $frag;
            $this->createBranch($branchName, $mainSha);
            $this->deleteFile($fragPath, $fragSha, $commitMsg, $branchName);
            $pr = $this->createPullRequest($commitMsg, $branchName, 'Automatically created by the SB Sommar delete-event API.');
            $this->enableAutoMerge($pr['node_id']);
            return;
        }

        // Fallback (02-§109.12): remove from the camp YAML file.
        $campFilePath = 'source/data/' . $camp['file'];
        [$campContent, $fileSha] = $this->getFile($campFilePath);
        $newContent = self::removeEventFromYaml($campContent, $eventId);
        if ($newContent === null) {
            throw new \RuntimeException("Event not found: {$eventId}");
        }
        $this->createBranch($branchName, $mainSha);
        $this->putFile($campFilePath, $newContent, $fileSha, $commitMsg, $branchName);
        $pr = $this->createPullRequest($commitMsg, $branchName, 'Automatically created by the SB Sommar delete-event API.');
        $this->enableAutoMerge($pr['node_id']);
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
        $lines[] = "{$fp}owner:";
        $lines[] = "{$dp}name: '" . str_replace("'", "''", $event['owner']['name'] ?? '') . "'";
        $lines[] = "{$dp}email: ''";
        $lines[] = "{$fp}meta:";
        $lines[] = "{$dp}created_at: {$event['meta']['created_at']}";
        $lines[] = "{$dp}updated_at: {$event['meta']['updated_at']}";

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
     * Apply $updates to a single event array, mirroring patchEventInYaml's
     * mutable-field rules. Used for fragment edits (02-§109.10).
     *
     * @param array<string,mixed> $event
     * @param array<string,mixed> $updates
     * @return array<string,mixed>
     */
    public static function patchEventObject(array $event, array $updates, string $now): array
    {
        return [
            'id'          => $event['id'],
            'title'       => array_key_exists('title', $updates) ? ($updates['title'] ?: $event['title']) : $event['title'],
            'date'        => array_key_exists('date', $updates) ? ($updates['date'] ?: $event['date']) : $event['date'],
            'start'       => array_key_exists('start', $updates) ? ($updates['start'] ?: $event['start']) : $event['start'],
            'end'         => array_key_exists('end', $updates) ? ($updates['end'] ?: null) : ($event['end'] ?? null),
            'location'    => array_key_exists('location', $updates) ? ($updates['location'] ?: $event['location']) : $event['location'],
            'responsible' => array_key_exists('responsible', $updates) ? ($updates['responsible'] ?: $event['responsible']) : $event['responsible'],
            'description' => array_key_exists('description', $updates) ? ($updates['description'] ?: null) : ($event['description'] ?? null),
            'link'        => array_key_exists('link', $updates) ? ($updates['link'] ?: null) : ($event['link'] ?? null),
            'owner'       => $event['owner'] ?? ['name' => '', 'email' => ''],
            'meta'        => [
                'created_at' => $event['meta']['created_at'] ?? null,
                'updated_at' => $now,
            ],
        ];
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
     * Remove an event from a YAML string, returning the new YAML or null if not found.
     */
    public static function removeEventFromYaml(string $yamlContent, string $eventId): ?string
    {
        $data = Yaml::parse($yamlContent);
        if (!is_array($data) || !is_array($data['events'] ?? null)) {
            return null;
        }

        $idx = null;
        foreach ($data['events'] as $i => $event) {
            if (($event['id'] ?? null) === $eventId) {
                $idx = $i;
                break;
            }
        }
        if ($idx === null) {
            return null;
        }

        array_splice($data['events'], $idx, 1);

        return Yaml::dump($data, 4, 2, Yaml::DUMP_NULL_AS_TILDE);
    }

    /**
     * Patch an event in a YAML string, returning the new YAML or null if not found.
     */
    public static function patchEventInYaml(string $yamlContent, string $eventId, array $updates): ?string
    {
        $data = Yaml::parse($yamlContent);
        if (!is_array($data) || !is_array($data['events'] ?? null)) {
            return null;
        }

        $idx = null;
        foreach ($data['events'] as $i => $event) {
            if (($event['id'] ?? null) === $eventId) {
                $idx = $i;
                break;
            }
        }
        if ($idx === null) {
            return null;
        }

        $event = $data['events'][$idx];
        $now   = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Y-m-d H:i');

        $data['events'][$idx] = [
            'id'          => $event['id'],
            'title'       => array_key_exists('title', $updates) ? ($updates['title'] ?: $event['title']) : $event['title'],
            'date'        => array_key_exists('date', $updates) ? ($updates['date'] ?: $event['date']) : $event['date'],
            'start'       => array_key_exists('start', $updates) ? ($updates['start'] ?: $event['start']) : $event['start'],
            'end'         => array_key_exists('end', $updates) ? ($updates['end'] ?: null) : $event['end'],
            'location'    => array_key_exists('location', $updates) ? ($updates['location'] ?: $event['location']) : $event['location'],
            'responsible' => array_key_exists('responsible', $updates) ? ($updates['responsible'] ?: $event['responsible']) : $event['responsible'],
            'description' => array_key_exists('description', $updates) ? ($updates['description'] ?: null) : ($event['description'] ?? null),
            'link'        => array_key_exists('link', $updates) ? ($updates['link'] ?: null) : ($event['link'] ?? null),
            'owner'       => $event['owner'] ?? null,
            'meta'        => [
                'created_at' => $event['meta']['created_at'] ?? null,
                'updated_at' => $now,
            ],
        ];

        return Yaml::dump($data, 4, 2, Yaml::DUMP_NULL_AS_TILDE);
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
