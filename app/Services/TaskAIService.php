<?php

namespace App\Services;

use App\Models\Task;
use App\Support\AIFeature;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TaskAIService
{
    protected $openaiApiKey;
    protected $apiUrl = 'https://api.openai.com/v1/chat/completions';

    public function __construct()
    {
        $this->openaiApiKey = config('services.openai.api_key');
        // In hybrid/none modes, missing key is fine (we should not call external AI).
    }

    /**
     * Suggest subtasks for a given task using AI
     *
     * @param Task $task
     * @return array
     */
    public function suggestSubtasks(Task $task): array
    {
        // Hybrid default: local-first breakdown unless explicitly set to AI-only.
        if (!AIFeature::allowsAI('breakdown') || empty($this->openaiApiKey)) {
            return [
                'success' => true,
                'subtasks' => $this->generateHybridBreakdown($task),
                'raw_response' => null,
                'mode' => 'hybrid',
            ];
        }

        try {
            $prompt = $this->buildSubtaskPrompt($task);
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->apiUrl, [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Kamu adalah asisten produktivitas yang membantu memecah task besar menjadi subtask yang actionable dan spesifik. Berikan response dalam bahasa Indonesia.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.7,
                'max_tokens' => 800,
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $content = $result['choices'][0]['message']['content'] ?? '';
                
                // Parse the AI response into array of subtasks
                $subtasks = $this->parseSubtasksFromResponse($content);
                
                // Save to task history
                $this->saveAISuggestionHistory($task, $subtasks);
                
                return [
                    'success' => true,
                    'subtasks' => $subtasks,
                    'raw_response' => $content
                ];
            }

            return [
                'success' => false,
                'error' => 'Failed to get AI response',
                'status' => $response->status()
            ];

        } catch (\Exception $e) {
            Log::error('TaskAIService: Error suggesting subtasks', [
                'task_id' => $task->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Analyze task complexity and estimate time
     *
     * @param Task $task
     * @return array
     */
    public function analyzeTaskComplexity(Task $task): array
    {
        if (!AIFeature::allowsAI('breakdown') || empty($this->openaiApiKey)) {
            $estimated = $task->estimated_minutes ?? $this->estimateMinutesFromText($task->title, $task->description);
            return [
                'success' => true,
                'analysis' => [
                    'complexity_score' => $task->complexity_score ?? $this->estimateComplexityFromText($task->title, $task->description),
                    'estimated_minutes' => $estimated,
                    'reasoning' => 'Hybrid estimate (local heuristic)',
                ],
                'mode' => 'hybrid',
            ];
        }

        try {
            $prompt = "Analisis kompleksitas task berikut dan berikan estimasi waktu dalam menit:\n\n";
            $prompt .= "Judul: {$task->title}\n";
            if ($task->description) {
                $prompt .= "Deskripsi: {$task->description}\n";
            }
            $prompt .= "\nBerikan response dalam format JSON:\n";
            $prompt .= "{\n";
            $prompt .= '  "complexity_score": 1-10,';
            $prompt .= '  "estimated_minutes": number,';
            $prompt .= '  "reasoning": "penjelasan singkat"';
            $prompt .= "\n}";

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
                'Content-Type' => 'application/json',
            ])->timeout(20)->post($this->apiUrl, [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Kamu adalah expert dalam estimasi waktu dan kompleksitas task. Berikan estimasi yang realistis.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.5,
                'max_tokens' => 300,
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $content = $result['choices'][0]['message']['content'] ?? '';
                
                // Try to parse JSON from response
                $analysis = $this->parseJSONFromResponse($content);
                
                return [
                    'success' => true,
                    'analysis' => $analysis
                ];
            }

            return ['success' => false, 'error' => 'Failed to analyze complexity'];

        } catch (\Exception $e) {
            Log::error('TaskAIService: Error analyzing complexity', [
                'task_id' => $task->id,
                'error' => $e->getMessage()
            ]);

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Generate task breakdown with detailed steps
     *
     * @param string $taskTitle
     * @param string|null $taskDescription
     * @return array
     */
    public function generateTaskBreakdown(string $taskTitle, ?string $taskDescription = null): array
    {
        if (!AIFeature::allowsAI('breakdown') || empty($this->openaiApiKey)) {
            $task = new Task();
            $task->title = $taskTitle;
            $task->description = $taskDescription;

            return [
                'success' => true,
                'subtasks' => $this->generateHybridBreakdown($task),
                'mode' => 'hybrid',
            ];
        }

        $prompt = "Pecah task berikut menjadi langkah-langkah yang jelas dan actionable:\n\n";
        $prompt .= "Task: {$taskTitle}\n";
        if ($taskDescription) {
            $prompt .= "Detail: {$taskDescription}\n";
        }
        $prompt .= "\nBerikan 3-7 subtask yang:\n";
        $prompt .= "1. Spesifik dan actionable\n";
        $prompt .= "2. Terurut secara logis\n";
        $prompt .= "3. Bisa dikerjakan dalam 15-60 menit\n";
        $prompt .= "4. Gunakan bahasa Indonesia yang natural\n\n";
        $prompt .= "Format: Berikan setiap subtask dalam baris baru, tanpa nomor atau bullet.";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->apiUrl, [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => 'Kamu adalah asisten produktivitas yang ahli memecah task kompleks.'],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.7,
                'max_tokens' => 500,
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $content = $result['choices'][0]['message']['content'] ?? '';
                $subtasks = $this->parseSubtasksFromResponse($content);
                
                return ['success' => true, 'subtasks' => $subtasks];
            }

            return ['success' => false, 'error' => 'Failed to generate breakdown'];

        } catch (\Exception $e) {
            Log::error('TaskAIService: Error generating breakdown', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Build prompt for subtask suggestions
     */
    private function buildSubtaskPrompt(Task $task): string
    {
        $prompt = "Tolong bantu pecah task ini menjadi subtask yang lebih kecil:\n\n";
        $prompt .= "**Task**: {$task->title}\n";
        
        if ($task->description) {
            $prompt .= "**Deskripsi**: {$task->description}\n";
        }
        
        if ($task->estimated_minutes) {
            $prompt .= "**Estimasi Total**: {$task->estimated_minutes} menit\n";
        }
        
        $prompt .= "\nBerikan 3-7 subtask yang:\n";
        $prompt .= "- Spesifik dan bisa langsung dikerjakan\n";
        $prompt .= "- Terurut secara logis (dependencies)\n";
        $prompt .= "- Masing-masing bisa diselesaikan dalam 15-60 menit\n";
        $prompt .= "- Gunakan bahasa Indonesia yang natural dan friendly\n\n";
        $prompt .= "Format response: Tulis setiap subtask dalam baris baru, tanpa numbering atau bullet points.";
        
        return $prompt;
    }

    /**
     * Parse subtasks from AI response
     */
    private function parseSubtasksFromResponse(string $response): array
    {
        // Remove common prefixes and clean up
        $response = preg_replace('/^\d+[\.\)]\s*/m', '', $response);
        $response = preg_replace('/^[-*•]\s*/m', '', $response);
        
        // Split by newlines
        $lines = explode("\n", $response);
        
        $subtasks = [];
        foreach ($lines as $line) {
            $line = trim($line);
            // Skip empty lines or lines that are too short/long
            if (strlen($line) > 5 && strlen($line) < 200) {
                $subtasks[] = $line;
            }
        }
        
        return array_values(array_filter($subtasks));
    }

    /**
     * Parse JSON from AI response (handles markdown code blocks)
     */
    private function parseJSONFromResponse(string $response): ?array
    {
        // Remove markdown code blocks if present
        $response = preg_replace('/```json\s*/', '', $response);
        $response = preg_replace('/```\s*/', '', $response);
        $response = trim($response);
        
        try {
            return json_decode($response, true);
        } catch (\Exception $e) {
            Log::warning('TaskAIService: Failed to parse JSON', ['response' => $response]);
            return null;
        }
    }

    /**
     * Save AI suggestion history to task
     */
    private function saveAISuggestionHistory(Task $task, array $subtasks): void
    {
        try {
            $history = $task->ai_suggested_subtasks ?? [];
            
            $history[] = [
                'suggested_at' => now()->toISOString(),
                'subtasks' => $subtasks,
                'count' => count($subtasks)
            ];
            
            // Keep only last 5 suggestions
            if (count($history) > 5) {
                $history = array_slice($history, -5);
            }
            
            $task->update(['ai_suggested_subtasks' => $history]);
        } catch (\Exception $e) {
            Log::warning('TaskAIService: Failed to save suggestion history', ['error' => $e->getMessage()]);
        }
    }

    private function generateHybridBreakdown(Task $task): array
    {
        $title = trim((string) $task->title);
        $desc = trim((string) ($task->description ?? ''));

        $subtasks = [];

        if ($desc !== '') {
            $lines = preg_split('/\r\n|\r|\n/', $desc);
            foreach ($lines as $line) {
                $line = trim((string) $line);
                $line = trim((string) preg_replace('/^[-*•\d\.\)\s]+/', '', $line));
                if (strlen($line) >= 6 && strlen($line) <= 160) {
                    $subtasks[] = $line;
                }
            }
        }

        if (count($subtasks) < 3 && $title !== '') {
            $split = preg_split('/\s+(dan|&|\+|lalu|terus)\s+/i', $title);
            if (is_array($split) && count($split) >= 2) {
                foreach ($split as $part) {
                    $part = trim((string) $part);
                    if (strlen($part) >= 6) {
                        $subtasks[] = $part;
                    }
                }
            }
        }

        $text = strtolower($title . ' ' . $desc);
        if (count($subtasks) < 3) {
            if (preg_match('/(belajar|study|latihan|kursus|materi|baca)/', $text)) {
                $subtasks = array_merge($subtasks, [
                    "Tentukan topik & target belajar (30 menit)",
                    "Baca/lihat materi inti dan catat poin penting",
                    "Kerjakan 5–10 latihan soal / praktik singkat",
                    "Rangkum 5 bullet + next step besok",
                ]);
            } elseif (preg_match('/(tulis|write|artikel|laporan|proposal|script)/', $text)) {
                $subtasks = array_merge($subtasks, [
                    "Bikin outline 5–7 poin (10 menit)",
                    "Tulis draft kasar tanpa edit (25–45 menit)",
                    "Edit: rapihin struktur + perjelas 3 bagian",
                    "Final check + kirim/publish",
                ]);
            } elseif (preg_match('/(meeting|rapat|call|zoom|sync)/', $text)) {
                $subtasks = array_merge($subtasks, [
                    "Tulis agenda + 3 hasil yang diinginkan",
                    "Kumpulin data/notes yang dibutuhkan",
                    "Jalanin meeting + capture action items",
                    "Kirim recap + assign next steps",
                ]);
            } else {
                $subtasks = array_merge($subtasks, [
                    "Tentukan hasil akhir yang jelas (definition of done)",
                    "Siapkan bahan/akses yang dibutuhkan",
                    "Kerjakan bagian paling kecil dulu (15–30 menit)",
                    "Review hasil + tentukan langkah berikutnya",
                ]);
            }
        }

        $subtasks = array_values(array_unique(array_filter(array_map(fn ($s) => trim((string) $s), $subtasks))));
        return array_slice($subtasks, 0, 7);
    }

    private function estimateMinutesFromText(?string $title, ?string $description): int
    {
        $text = strtolower(trim((string) $title . ' ' . (string) $description));
        if ($text === '') return 25;

        if (preg_match('/\b(5|10|15|20|25|30|45|60|90|120)\s*(menit|min)\b/', $text, $m)) {
            return (int) $m[1];
        }

        if (preg_match('/(meeting|rapat|call|zoom)/', $text)) return 45;
        if (preg_match('/(tulis|laporan|proposal|artikel)/', $text)) return 60;
        if (preg_match('/(belajar|study|latihan|materi)/', $text)) return 45;
        return 30;
    }

    private function estimateComplexityFromText(?string $title, ?string $description): int
    {
        $text = strtolower(trim((string) $title . ' ' . (string) $description));
        if ($text === '') return 3;

        $score = 3;
        if (preg_match('/(bug|critical|migrasi|refactor|arsitektur|proposal|pajak)/', $text)) $score += 3;
        if (preg_match('/(meeting|presentasi|client|customer)/', $text)) $score += 2;
        if (strlen($text) > 250) $score += 1;
        return max(1, min(10, $score));
    }
}
