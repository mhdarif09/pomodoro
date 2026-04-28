<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaperExplorerController extends Controller
{
    private const TRUSTED_PAPER_HOST_HINTS = [
        'arxiv.org',
        'openreview.net',
        'aclanthology.org',
        'ieeexplore.ieee.org',
        'springer.com',
        'sciencedirect.com',
        'nature.com',
        'wiley.com',
        'aaai.org',
        'proceedings.neurips.cc',
        'jmlr.org',
        'doi.org',
    ];

    public function index()
    {
        return Inertia::render('PaperExplorer');
    }

    public function search(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:200',
        ]);

        $title = $request->input('title');
        $scholarCandidates = $this->fetchScholarCandidates($title, 20);

        try {
            $graph = $this->buildFallbackGraph($title, $scholarCandidates);
            return response()->json($graph ?? ['nodes' => [], 'links' => []]);
        } catch (\Throwable $e) {
            Log::error('PaperExplorer: Unhandled search exception.', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'title' => $title,
            ]);
            $fallback = $this->buildFallbackGraph($title, $scholarCandidates);
            if ($fallback) {
                return response()->json($fallback);
            }

            return response()->json(['error' => 'Paper explorer service unavailable. Please try again.'], 500);
        }
    }

    private function enrichNodesWithSerper(array $nodes): array
    {
        $serperApiKey = env('SERPER_API_KEY');
        if (empty($serperApiKey)) {
            return $nodes;
        }

        return array_map(function ($node) use ($serperApiKey) {
            $existingPaper = $this->sanitizeExternalUrl($node['paper_url'] ?? null);
            $existingPdf = $this->sanitizePdfUrl($node['pdf_url'] ?? null);

            // If both are already valid, keep them
            if ($existingPaper && $existingPdf) {
                $node['paper_url'] = $existingPaper;
                $node['pdf_url'] = $existingPdf;
                return $node;
            }

            $resolved = $this->resolvePaperLinksFromSerper($serperApiKey, $node['title'] ?? '', $node['authors'] ?? []);
            $node['paper_url'] = $existingPaper ?: ($resolved['paper_url'] ?? null);
            $node['pdf_url'] = $existingPdf ?: ($resolved['pdf_url'] ?? null);
            return $node;
        }, $nodes);
    }

    private function resolvePaperLinksFromSerper(string $apiKey, string $title, array $authors = []): array
    {
        if (trim($title) === '') {
            return ['paper_url' => null, 'pdf_url' => null];
        }

        $authorToken = count($authors) > 0 ? (' "'.$authors[0].'"') : '';
        $paperQuery = "\"{$title}\"{$authorToken} research paper";
        $pdfQuery = "\"{$title}\"{$authorToken} filetype:pdf";

        $paperUrl = null;
        $pdfUrl = null;

        try {
            // Query 1: landing page / source page
            $paperResponse = Http::timeout(15)->withHeaders([
                'X-API-KEY' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://google.serper.dev/scholar', [
                'q' => $paperQuery,
                'num' => 8,
                'gl' => 'us',
            ]);

            if ($paperResponse->successful()) {
                $organic = (array) $paperResponse->json('organic', []);
                foreach ($organic as $item) {
                    $candidate = $this->sanitizeExternalUrl($item['link'] ?? ($item['publicationInfo']['link'] ?? null));
                    if (!$candidate) {
                        continue;
                    }
                    $paperUrl = $candidate;
                    if ($this->isTrustedAcademicHost($candidate)) {
                        break;
                    }
                }
            } else {
                Log::warning('PaperExplorer: Serper paper query failed.', [
                    'status' => $paperResponse->status(),
                    'title' => $title,
                ]);
            }

            // Query 2: direct PDF from scholar
            $pdfResponse = Http::timeout(15)->withHeaders([
                'X-API-KEY' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://google.serper.dev/scholar', [
                'q' => $pdfQuery,
                'num' => 8,
                'gl' => 'us',
            ]);

            if ($pdfResponse->successful()) {
                $organic = (array) $pdfResponse->json('organic', []);
                foreach ($organic as $item) {
                    $candidate = $this->sanitizePdfUrl($item['link'] ?? ($item['publicationInfo']['link'] ?? null));
                    if (!$candidate) {
                        continue;
                    }
                    $pdfUrl = $candidate;
                    break;
                }
            } else {
                Log::warning('PaperExplorer: Serper PDF query failed.', [
                    'status' => $pdfResponse->status(),
                    'title' => $title,
                ]);
            }

            // Query 3 fallback: general web search for actual downloadable PDF links
            if (!$pdfUrl) {
                $pdfWebResponse = Http::timeout(15)->withHeaders([
                    'X-API-KEY' => $apiKey,
                    'Content-Type' => 'application/json',
                ])->post('https://google.serper.dev/search', [
                    'q' => $pdfQuery,
                    'num' => 10,
                    'gl' => 'us',
                ]);

                if ($pdfWebResponse->successful()) {
                    $organic = (array) $pdfWebResponse->json('organic', []);
                    foreach ($organic as $item) {
                        $candidate = $this->sanitizePdfUrl($item['link'] ?? null);
                        if (!$candidate) {
                            continue;
                        }
                        $pdfUrl = $candidate;
                        break;
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('PaperExplorer: Serper enrichment skipped due to exception.', [
                'message' => $e->getMessage(),
                'title' => $title,
            ]);
            return [
                'paper_url' => $paperUrl,
                'pdf_url' => $pdfUrl,
            ];
        }

        // ArXiv fallback: convert /abs/ to /pdf/ if needed
        if (!$pdfUrl && $paperUrl && str_contains($paperUrl, 'arxiv.org/abs/')) {
            $pdfUrl = preg_replace('#arxiv\.org/abs/#', 'arxiv.org/pdf/', $paperUrl);
            if ($pdfUrl && !str_ends_with(strtolower($pdfUrl), '.pdf')) {
                $pdfUrl .= '.pdf';
            }
            $pdfUrl = $this->sanitizePdfUrl($pdfUrl);
        }

        return [
            'paper_url' => $paperUrl,
            'pdf_url' => $pdfUrl,
        ];
    }

    private function sanitizeExternalUrl(?string $url): ?string
    {
        if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
            return null;
        }

        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        if ($host === '' || str_contains($host, 'example.') || str_contains($host, 'localhost')) {
            return null;
        }

        return $url;
    }

    private function sanitizePdfUrl(?string $url): ?string
    {
        $clean = $this->sanitizeExternalUrl($url);
        if (!$clean) {
            return null;
        }

        $lower = strtolower($clean);
        if (
            str_contains($lower, '.pdf') ||
            str_contains($lower, 'download') ||
            str_contains($lower, '/pdf/') ||
            str_contains($lower, 'pdf?') ||
            str_contains($lower, 'format=pdf') ||
            str_contains($lower, 'view=pdf')
        ) {
            return $clean;
        }

        return null;
    }

    private function isTrustedAcademicHost(string $url): bool
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        foreach (self::TRUSTED_PAPER_HOST_HINTS as $hint) {
            if (str_contains($host, $hint)) {
                return true;
            }
        }
        return false;
    }

    private function buildFallbackGraph(string $title, array $prefetchedCandidates = []): ?array
    {
        $serperApiKey = env('SERPER_API_KEY');
        $rootNode = [
            'id' => '0',
            'title' => $title,
            'year' => null,
            'field' => 'General',
            'relevance' => 1,
            'abstract' => 'Primary query node.',
            'authors' => [],
            'venue' => '',
            'paper_url' => null,
            'pdf_url' => null,
        ];

        if (!empty($prefetchedCandidates)) {
            return $this->buildGraphFromCandidates($title, $prefetchedCandidates);
        }

        if (empty($serperApiKey)) {
            return [
                'nodes' => [$rootNode],
                'links' => [],
            ];
        }

        try {
            $response = Http::timeout(15)->withHeaders([
                'X-API-KEY' => $serperApiKey,
                'Content-Type' => 'application/json',
            ])->post('https://google.serper.dev/scholar', [
                'q' => "\"{$title}\" related paper",
                'num' => 10,
                'gl' => 'us',
            ]);

            if (!$response->successful()) {
                Log::warning('PaperExplorer fallback: Serper search failed.', [
                    'status' => $response->status(),
                    'title' => $title,
                ]);

                return [
                    'nodes' => [$rootNode],
                    'links' => [],
                ];
            }

            $candidates = $this->normalizeScholarOrganic((array) $response->json('organic', []), 10);
            return $this->buildGraphFromCandidates($title, $candidates);
        } catch (\Throwable $e) {
            Log::warning('PaperExplorer fallback: Serper exception.', [
                'message' => $e->getMessage(),
                'title' => $title,
            ]);

            return [
                'nodes' => [$rootNode],
                'links' => [],
            ];
        }
    }

    private function fetchScholarCandidates(string $query, int $limit = 18): array
    {
        $apiKey = env('SERPER_API_KEY');
        if (empty($apiKey)) {
            return [];
        }

        try {
            $response = Http::timeout(20)->withHeaders([
                'X-API-KEY' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://google.serper.dev/scholar', [
                'q' => "\"{$query}\"",
                'num' => max(10, min(20, $limit)),
                'gl' => 'us',
            ]);

            if (!$response->successful()) {
                Log::warning('PaperExplorer: prefetch scholar candidates failed', [
                    'status' => $response->status(),
                    'query' => $query,
                ]);
                return [];
            }

            $candidates = $this->normalizeScholarOrganic((array) $response->json('organic', []), $limit);
            return $this->attachDirectPdfLinks($candidates, $apiKey);
        } catch (\Throwable $e) {
            Log::warning('PaperExplorer: prefetch scholar candidates exception', [
                'message' => $e->getMessage(),
                'query' => $query,
            ]);
            return [];
        }
    }

    private function attachDirectPdfLinks(array $candidates, string $apiKey): array
    {
        if (empty($candidates)) {
            return $candidates;
        }

        return array_map(function ($candidate) use ($apiKey) {
            if (!empty($candidate['pdf_url'])) {
                return $candidate;
            }

            $title = trim((string) ($candidate['title'] ?? ''));
            if ($title === '') {
                return $candidate;
            }

            try {
                $response = Http::timeout(12)->withHeaders([
                    'X-API-KEY' => $apiKey,
                    'Content-Type' => 'application/json',
                ])->post('https://google.serper.dev/search', [
                    'q' => "\"{$title}\" filetype:pdf",
                    'num' => 5,
                    'gl' => 'us',
                ]);

                if ($response->successful()) {
                    $organic = (array) $response->json('organic', []);
                    foreach ($organic as $item) {
                        $pdf = $this->sanitizePdfUrl($item['link'] ?? null);
                        if ($pdf) {
                            $candidate['pdf_url'] = $pdf;
                            break;
                        }
                    }
                }
            } catch (\Throwable $e) {
                // Soft fail: keep candidate without pdf_url.
            }

            return $candidate;
        }, $candidates);
    }

    private function normalizeScholarOrganic(array $organic, int $limit): array
    {
        return collect($organic)
            ->map(function ($item) {
                $title = trim((string) ($item['title'] ?? ''));
                $paperUrl = $this->sanitizeExternalUrl($item['link'] ?? ($item['publicationInfo']['link'] ?? null));
                $snippet = trim((string) ($item['snippet'] ?? ''));
                $year = null;
                if (preg_match('/\b(19|20)\d{2}\b/', $snippet, $m)) {
                    $year = (int) $m[0];
                }

                return [
                    'title' => $title,
                    'paper_url' => $paperUrl,
                    'pdf_url' => $this->sanitizePdfUrl($paperUrl),
                    'abstract' => $snippet,
                    'year' => $year,
                ];
            })
            ->filter(fn($x) => $x['title'] !== '' && !empty($x['paper_url']))
            ->unique(fn($x) => strtolower($x['title']))
            ->take($limit)
            ->values()
            ->all();
    }

    private function hydrateNodesFromCandidates(array $nodes, array $candidates): array
    {
        if (empty($nodes) || empty($candidates)) {
            return $nodes;
        }

        $indexed = collect($candidates)->keyBy(fn($c) => strtolower((string) $c['title']));

        return array_map(function ($node) use ($indexed) {
            if (($node['id'] ?? '') === '0') {
                return $node;
            }

            $key = strtolower((string) ($node['title'] ?? ''));
            $candidate = $indexed->get($key);
            if (!$candidate) {
                return $node;
            }

            $node['paper_url'] = $candidate['paper_url'] ?? $node['paper_url'];
            $node['pdf_url'] = $candidate['pdf_url'] ?? $node['pdf_url'];
            $node['year'] = $node['year'] ?: ($candidate['year'] ?? null);
            if (empty($node['abstract']) && !empty($candidate['abstract'])) {
                $node['abstract'] = $candidate['abstract'];
            }

            return $node;
        }, $nodes);
    }

    private function buildGraphFromCandidates(string $title, array $candidates): array
    {
        $nodes = [[
            'id' => '0',
            'title' => $title,
            'year' => null,
            'field' => 'General',
            'relevance' => 1,
            'abstract' => 'Primary query node.',
            'authors' => [],
            'venue' => '',
            'paper_url' => null,
            'pdf_url' => null,
        ]];

        $links = [];
        foreach (array_values(array_slice($candidates, 0, 10)) as $index => $candidate) {
            $id = (string) ($index + 1);
            $nodes[] = [
                'id' => $id,
                'title' => (string) $candidate['title'],
                'year' => $candidate['year'] ?? null,
                'field' => 'Research',
                'relevance' => max(0.45, 0.95 - ($index * 0.06)),
                'abstract' => (string) ($candidate['abstract'] ?? 'Related research result.'),
                'authors' => [],
                'venue' => '',
                'paper_url' => $candidate['paper_url'] ?? null,
                'pdf_url' => $candidate['pdf_url'] ?? null,
            ];

            $links[] = [
                'source' => '0',
                'target' => $id,
                'strength' => max(0.35, 0.85 - ($index * 0.05)),
                'reason' => 'Selected from validated scholar search results related to the query.',
            ];
        }

        return ['nodes' => $nodes, 'links' => $links];
    }

    private function filterNodesByQueryRelevance(string $query, array $nodes): array
    {
        if (empty($nodes)) {
            return $nodes;
        }

        $queryTokens = $this->extractMeaningfulTokens($query);
        if (empty($queryTokens)) {
            return $nodes;
        }

        $kept = [];
        foreach ($nodes as $node) {
            if (($node['id'] ?? null) === '0') {
                $kept[] = $node;
                continue;
            }

            $title = (string) ($node['title'] ?? '');
            $abstract = (string) ($node['abstract'] ?? '');
            $field = (string) ($node['field'] ?? '');
            $haystackTokens = $this->extractMeaningfulTokens($title.' '.$abstract.' '.$field);

            $overlapCount = count(array_intersect($queryTokens, $haystackTokens));
            $minOverlap = count($queryTokens) >= 4 ? 2 : 1;

            if ($overlapCount >= $minOverlap) {
                $kept[] = $node;
            }
        }

        // Keep a stable, useful graph: root + at least up to 8 most relevant nodes.
        if (count($kept) <= 1) {
            return array_slice($nodes, 0, min(9, count($nodes)));
        }

        $root = array_values(array_filter($kept, fn($n) => ($n['id'] ?? null) === '0'));
        $others = array_values(array_filter($kept, fn($n) => ($n['id'] ?? null) !== '0'));

        usort($others, function ($a, $b) use ($queryTokens) {
            $scoreA = $this->scoreNodeRelevance($queryTokens, $a);
            $scoreB = $this->scoreNodeRelevance($queryTokens, $b);
            return $scoreB <=> $scoreA;
        });

        return array_merge($root, array_slice($others, 0, 8));
    }

    private function scoreNodeRelevance(array $queryTokens, array $node): float
    {
        $title = (string) ($node['title'] ?? '');
        $abstract = (string) ($node['abstract'] ?? '');
        $field = (string) ($node['field'] ?? '');
        $haystackTokens = $this->extractMeaningfulTokens($title.' '.$abstract.' '.$field);
        $overlapCount = count(array_intersect($queryTokens, $haystackTokens));

        return ($overlapCount * 10) + ((float) ($node['relevance'] ?? 0.5) * 3);
    }

    private function extractMeaningfulTokens(string $text): array
    {
        $text = strtolower($text);
        $tokens = preg_split('/[^a-z0-9]+/i', $text) ?: [];

        $stopwords = [
            'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'using', 'based',
            'paper', 'study', 'approach', 'method', 'analysis', 'towards', 'via', 'new',
            'on', 'in', 'of', 'to', 'a', 'an', 'is', 'are', 'be', 'by',
        ];

        $filtered = array_values(array_filter($tokens, function ($t) use ($stopwords) {
            return $t !== '' && strlen($t) >= 3 && !in_array($t, $stopwords, true);
        }));

        return array_values(array_unique($filtered));
    }
}
