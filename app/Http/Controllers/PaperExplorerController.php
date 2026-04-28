<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class PaperExplorerController extends Controller
{
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
        $apiKey = env('GROQ_API_KEY');

        if (!$apiKey) {
            return response()->json(['error' => 'GROQ API key not configured'], 500);
        }

        $systemPrompt = 'You are an academic paper relationship analyzer.
Return ONLY valid JSON, no markdown, no explanation, no code fences.
Structure:
{
  "nodes": [
    {
      "id":"0",
      "title":"...",
      "year":2023,
      "field":"NLP",
      "relevance":1.0,
      "abstract":"max 2 sentences",
      "authors":["Author A","Author B"],
      "venue":"Conference or Journal",
      "paper_url":"https://...",
      "pdf_url":"https://...pdf"
    }
  ],
  "links": [
    {"source":"0","target":"1","strength":0.85,"reason":"one sentence why connected"}
  ]
}
Rules:
- id "0" = the input paper (root node, relevance=1.0)
- Generate 10-14 related nodes
- relevance: 0.0-1.0, strength: 0.0-1.0
- field: short domain label (NLP, CV, RL, etc.)
- paper_url should be a real landing page URL if known
- pdf_url should be direct PDF URL if known; otherwise null
- authors max 5 names';

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'llama-3.3-70b-versatile',
                'max_tokens' => 2500,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => 'Find connected papers for: '.$title],
                ],
            ]);

            if ($response->failed()) {
                return response()->json(['error' => 'Failed to fetch from Groq API'], 500);
            }

            $data = $response->json();
            $content = $data['choices'][0]['message']['content'] ?? '';

            $content = preg_replace('/^```json\s*/', '', $content);
            $content = preg_replace('/```\s*$/', '', $content);
            $parsed = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['error' => 'Invalid JSON response from API'], 500);
            }

            $nodes = collect($parsed['nodes'] ?? [])->map(function ($n, $index) {
                return [
                    'id' => (string) ($n['id'] ?? $index),
                    'title' => (string) ($n['title'] ?? 'Untitled paper'),
                    'year' => is_numeric($n['year'] ?? null) ? (int) $n['year'] : null,
                    'field' => (string) ($n['field'] ?? 'General'),
                    'relevance' => max(0, min(1, (float) ($n['relevance'] ?? 0.5))),
                    'abstract' => (string) ($n['abstract'] ?? ''),
                    'authors' => array_values(array_filter((array) ($n['authors'] ?? []))),
                    'venue' => (string) ($n['venue'] ?? ''),
                    'paper_url' => !empty($n['paper_url']) ? (string) $n['paper_url'] : null,
                    'pdf_url' => !empty($n['pdf_url']) ? (string) $n['pdf_url'] : null,
                ];
            })->values();

            $links = collect($parsed['links'] ?? [])->map(function ($l) {
                return [
                    'source' => (string) ($l['source'] ?? ''),
                    'target' => (string) ($l['target'] ?? ''),
                    'strength' => max(0, min(1, (float) ($l['strength'] ?? 0.5))),
                    'reason' => (string) ($l['reason'] ?? 'Related research area'),
                ];
            })->filter(fn($l) => $l['source'] !== '' && $l['target'] !== '')->values();

            return response()->json([
                'nodes' => $nodes,
                'links' => $links,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }
}

