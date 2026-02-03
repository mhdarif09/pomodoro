<?php
namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class OpenAIService
{
    private const CONTEXT_WINDOW_LIMIT = 15;
    private const PERSONALITY_UPDATE_THRESHOLD = 3;
    private string $apiKey;
    private string $apiUrl;


    public function determineTaskPriority(?string $title, ?string $description, $dueDate): string
    {
        $title = $title ?? 'Tugas Tanpa Judul';
        $description = $description ?? 'Tidak ada deskripsi';
        $dueDateText = $dueDate ? (is_string($dueDate) ? $dueDate : $dueDate->format('Y-m-d')) : 'Tidak ditentukan';
        $today = date('Y-m-d');

        // Definisikan pilihan prioritas yang valid sesuai dengan enum di database
        $availablePriorities = ['Rendah', 'Sedang', 'Tinggi', 'Mendesak'];

        // Buat prompt yang sangat spesifik untuk tugas ini
        $prompt = <<<PROMPT
Anda adalah asisten manajer proyek yang sangat efisien. Tugas Anda adalah menentukan tingkat prioritas untuk sebuah tugas baru.
Pilihan prioritas yang tersedia adalah: Rendah, Sedang, Tinggi, Mendesak.

Analisis informasi berikut:
Judul Tugas: "{$title}"
Deskripsi: "{$description}"
Tenggat Waktu: {$dueDateText} (Hari ini adalah: {$today})

Pertimbangkan urgensi dalam judul/deskripsi (misalnya kata 'segera', 'bug', 'critical') dan kedekatan tenggat waktu.
Berikan jawaban HANYA SATU KATA nama prioritasnya dari pilihan yang ada (contoh: 'Tinggi') tanpa penjelasan atau teks tambahan apapun.
PROMPT;

        try {
            // Kita gunakan ulang method generateOpenAIResponse yang sudah ada
            $result = $this->generateOpenAIResponse($prompt);
            $priority = trim($result);

            // Validasi: pastikan respons dari AI sesuai dengan pilihan yang kita miliki
            if (in_array($priority, $availablePriorities)) {
                return $priority;
            }
            
            // Jika respons tidak valid, kembalikan nilai default
            Log::warning('OpenAI returned an invalid priority: ' . $priority);
            return 'Sedang';

        } catch (\Exception $e) {
            // Jika API gagal, catat error dan kembalikan nilai default yang aman
            Log::error('Failed to determine task priority from OpenAI: ' . $e->getMessage(), [
                'title' => $title
            ]);
            return 'Sedang';
        }
    }
    
    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
        $this->apiUrl = 'https://api.openai.com/v1/chat/completions';
    }

    public function getInitialReflectionQuestion(string $userName): string
    {
        $greetings = [
            "Halo {$userName}! Gimana kabarmu hari ini? Yuk cerita apa aja yang lagi ada di pikiranmu.",
            "Hi {$userName}! Gue di sini buat dengerin kamu. Ada yang pengen kamu share atau refleksiin hari ini?",
            "Hey {$userName}! Semoga harimu baik ya. Gue siap jadi teman ngobrol kamu. Mulai dari mana nih?",
        ];

        return $greetings[array_rand($greetings)];
    }

    public function getConversationResponse(Collection $chatHistory, User $user, string $currentUserInput = ''): array
    {
        try {
            $relevantHistory = $this->getRelevantContext($chatHistory, $user->id);
            $contextAnalysis = $this->analyzeConversationContext($relevantHistory, $currentUserInput);
            $formattedHistory = $this->formatConversationHistory($relevantHistory, $contextAnalysis);

            $prompt = $user->is_premium
                ? $this->getPremiumContextualPrompt($user, $formattedHistory, $contextAnalysis)
                : $this->getStandardContextualPrompt($formattedHistory, $contextAnalysis);

            $result = $this->generateOpenAIResponse($prompt);

            $parsedResponse = $this->parseResponse($result, $user, $contextAnalysis);

            if ($user->is_premium && !empty($parsedResponse['personality_insight'])) {
                $this->updatePersonalityInsights($user, $parsedResponse['personality_insight'], $contextAnalysis);
            }

            $this->cacheConversationInsights($user->id, $contextAnalysis);

            return $parsedResponse;

        } catch (\Exception $e) {
            Log::error('OpenAIService Error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'history_count' => $chatHistory->count(),
            ]);

            return $this->getFallbackResponse($user, $currentUserInput);
        }
    }

    private function getRelevantContext(Collection $chatHistory, int $userId): Collection
    {
        $recentHistory = $chatHistory->sortByDesc('created_at')
            ->take(self::CONTEXT_WINDOW_LIMIT)
            ->sortBy('created_at');

        $importantChats = Cache::get("important_chats_user_{$userId}", collect());

        return $recentHistory->merge($importantChats)->unique('id')->sortBy('created_at');
    }

    private function analyzeConversationContext(Collection $history, string $currentInput): array
    {
        $analysis = [
            'mood_progression' => [],
            'recurring_topics' => [],
            'emotional_state' => 'neutral',
            'conversation_depth' => 'surface',
            'growth_indicators' => [],
            'concern_flags' => [],
        ];

        if ($history->isEmpty()) {
            return $analysis;
        }

        $moodKeywords = [
            'positive' => ['senang', 'bahagia', 'semangat', 'grateful', 'optimis', 'bangga', 'lega'],
            'negative' => ['sedih', 'kecewa', 'frustasi', 'marah', 'anxious', 'stress', 'takut', 'khawatir'],
            'neutral' => ['biasa', 'oke', 'normal', 'standar', 'fine'],
        ];

        foreach ($history as $chat) {
            if ($chat->user_answer) {
                $answer = strtolower($chat->user_answer);
                foreach ($moodKeywords as $mood => $keywords) {
                    foreach ($keywords as $keyword) {
                        if (str_contains($answer, $keyword)) {
                            $analysis['mood_progression'][] = $mood;
                            break 2;
                        }
                    }
                }
            }
        }

        $allText = $history->pluck('user_answer')->filter()->implode(' ') . ' ' . $currentInput;
        $topicKeywords = [
            'karir' => ['kerja', 'karir', 'job', 'bos', 'karyawan'],
            'relationship' => ['pacar', 'putus', 'teman', 'keluarga', 'ortu'],
            'personal_growth' => ['belajar', 'skill', 'develop', 'goal'],
            'mental_health' => ['stress', 'anxiety', 'depresi', 'burnout'],
        ];

        foreach ($topicKeywords as $topic => $keywords) {
            $count = 0;
            foreach ($keywords as $keyword) {
                $count += substr_count(strtolower($allText), $keyword);
            }
            if ($count > 0) {
                $analysis['recurring_topics'][$topic] = $count;
            }
        }

        $recentMoods = array_slice($analysis['mood_progression'], -3);
        if (!empty($recentMoods)) {
            $moodCount = array_count_values($recentMoods);
            arsort($moodCount);
            $analysis['emotional_state'] = array_key_first($moodCount);
        }

        return $analysis;
    }

    private function formatConversationHistory(Collection $history, array $context): string
    {
        if ($history->isEmpty()) {
            return "Ini adalah percakapan pertama kita.";
        }

        $formatted = $history->map(function ($turn, $index) {
            $turnNumber = $index + 1;
            $userAnswer = $turn->user_answer ?? "[Belum dijawab]";
            $aiFeedback = $turn->ai_feedback ? "\nGrowthBot: " . $turn->ai_feedback : "";

            return "Turn {$turnNumber}:\nGrowthBot: {$turn->ai_question}\n{$turn->user->name}: {$userAnswer}{$aiFeedback}";
        })->implode("\n\n");

        return $formatted;
    }

    private function getPremiumContextualPrompt(User $user, string $formattedHistory, array $context): string
    {
        $personalityMemory = $user->personality_summary
            ? "PERSONALITY INSIGHTS SEJAUH INI:\n" . $user->personality_summary . "\n\n"
            : "PERSONALITY INSIGHTS: Masih dalam tahap eksplorasi awal.\n\n";

        return <<<PROMPT
Kamu adalah 'GrowthBot', AI companion yang sangat empatik dan expert dalam psikologi serta personal development.
Kamu sedang berbicara dengan {$user->name}.

{$personalityMemory}

CONVERSATION HISTORY:
{$formattedHistory}

MOOD SAAT INI: {$context['emotional_state']}

INSTRUKSI:
1. Berikan respons yang personal dan sesuai dengan mood {$user->name}.
2. Buat percakapan terasa nyambung dengan obrolan sebelumnya.
3. Hindari pengulangan topik yang sama.
4. Gunakan bahasa Indonesia santai ala Gen Z.
5. Batasi respons maksimal 100 kata agar efisien.

FORMAT RESPONSE:
[Feedback singkat dan personal]|||[Pertanyaan lanjutan]|||[Insight kepribadian singkat atau NONE]
PROMPT;
    }

    private function getStandardContextualPrompt(string $formattedHistory, array $context): string
    {
        return <<<PROMPT
Kamu adalah GrowthBot, teman curhat yang asik dan perhatian.

CONVERSATION HISTORY:
{$formattedHistory}

MOOD SAAT INI: {$context['emotional_state']}

ATURAN:
1. Refer ke obrolan sebelumnya agar natural.
2. Tunjukkan empati sesuai mood user.
3. Batasi respons maksimal 80 kata.

FORMAT:
[Feedback singkat]|||[Pertanyaan lanjutan]
PROMPT;
    }

    public function getEducationalResponse(Collection $history, string $currentInput, ?array $imageData = null): string
    {
        $systemPrompt = <<<PROMPT
You are an expert tutor who teaches by:
1. Breaking problems into clear, numbered steps (Step 1, Step 2, etc.)
2. Explaining WHY each step works (using 💡)
3. Checking understanding
4. Encouraging progress with a friendly, supportive tone

**For Math & Science:**
- Use LaTeX notation: $...$ for inline math, $$...$$ for distinct display math.
- Example: "The quadratic formula is $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$"
- NEVER provide just the answer. Always explain the method.

**For General Questions:**
- Focus on conceptual understanding.
- Use analogies where helpful.

Your Goal: Help the user TRULY understand, not just get the answer. Build their confidence! 💪
PROMPT;

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt]
        ];

        // Format history
        foreach ($history as $msg) {
            $role = $msg->role === 'user' ? 'user' : 'assistant';
            $messages[] = ['role' => $role, 'content' => $msg->content];
        }

        // Add current input
        if ($imageData) {
            // GPT-4 Vision Format
            $messages[] = [
                'role' => 'user', 
                'content' => [
                    ['type' => 'text', 'text' => $currentInput ?: "Please help me solve this problem step-by-step."],
                    ['type' => 'image_url', 'image_url' => ['url' => $imageData['url']]]
                ]
            ];
            $model = 'gpt-4o'; // Use vision model
        } else {
            $messages[] = ['role' => 'user', 'content' => $currentInput];
            $model = 'gpt-4o-mini'; // Standard efficient model
        }

        return $this->generateRawOpenAIResponse($messages, $model);
    }

    private function generateRawOpenAIResponse(array $messages, string $model = 'gpt-4o-mini'): string
    {
        $maxRetries = 3;
        $retryCount = 0;

        while ($retryCount < $maxRetries) {
            try {
                $response = Http::withToken($this->apiKey)
                    ->timeout(60) // Longer timeout for vision/edu
                    ->post($this->apiUrl, [
                        'model' => $model,
                        'messages' => $messages,
                        'max_tokens' => 1000, // Allow longer explanations
                        'temperature' => 0.7,
                    ]);

                if ($response->successful()) {
                    return $response->json('choices.0.message.content');
                }
                
                throw new \Exception('API request failed: ' . $response->body());
            } catch (\Exception $e) {
                $retryCount++;
                if ($retryCount >= $maxRetries) {
                    throw $e;
                }
                sleep(1);
            }
        }
        return "Maaf, saya sedang mengalami gangguan. Coba lagi nanti ya!";
    }

    private function generateOpenAIResponse(string $prompt): string
    {
        return $this->generateRawOpenAIResponse([
            ['role' => 'user', 'content' => $prompt]
        ]);
    }

    private function parseResponse(string $result, User $user, array $context): array
    {
        $parts = explode('|||', $result, 3);

        $feedback = trim($parts[0] ?? '');
        $nextQuestion = trim($parts[1] ?? '');
        $personalityInsight = isset($parts[2]) ? trim($parts[2]) : '';

        if (empty($feedback)) {
            $feedback = $this->generateContextualFallbackFeedback($context);
        }

        if (empty($nextQuestion)) {
            $nextQuestion = $this->generateContextualFallbackQuestion($context);
        }

        return [
            'feedback' => $feedback,
            'next_question' => $nextQuestion,
            'personality_insight' => $personalityInsight === 'NONE' ? '' : $personalityInsight,
            'mood_detected' => $context['emotional_state'],
            'topics_discussed' => array_keys($context['recurring_topics'] ?? []),
        ];
    }

    private function updatePersonalityInsights(User $user, string $newInsight, array $context): void
    {
        $currentInsight = $user->personality_summary ?? '';

        if (!empty($currentInsight)) {
            $updatedInsight = $this->mergePersonalityInsights($currentInsight, $newInsight, $context);
        } else {
            $updatedInsight = $newInsight;
        }

        $user->update(['personality_summary' => $updatedInsight]);
    }

    private function mergePersonalityInsights(string $current, string $new, array $context): string
    {
        if (strlen($current) > 500) {
            return $new . " | Previous: " . substr($current, 0, 200) . "...";
        }

        return $current . " | Update: " . $new;
    }

    private function cacheConversationInsights(int $userId, array $insights): void
    {
        Cache::put("conversation_insights_user_{$userId}", $insights, now()->addHours(24));
    }

    private function generateContextualFallbackFeedback(array $context): string
    {
        $fallbacks = [
            'positive' => 'Seneng denger update dari kamu! Keep it up ya.',
            'negative' => 'Gue ngerti ini nggak gampang. Makasih udah cerita.',
            'neutral' => 'Thanks udah cerita, appreciate openness kamu.',
        ];

        return $fallbacks[$context['emotional_state']] ?? $fallbacks['neutral'];
    }

    private function generateContextualFallbackQuestion(array $context): string
    {
        $questions = [
            'positive' => 'Dengan energi positif ini, apa yang pengen kamu capai?',
            'negative' => 'Ada hal kecil yang bisa bikin kamu lega gak?',
            'neutral' => 'Ada hal lain yang pengen kita obrolin?',
        ];

        return $questions[$context['emotional_state']] ?? $questions['neutral'];
    }

    private function getFallbackResponse(User $user, string $currentInput): array
    {
        return [
            'feedback' => "Hey {$user->name}, ada masalah teknis sebentar. Tapi gue tetap siap dengerin kamu kok.",
            'next_question' => 'Mau lanjut cerita? Gue siap dengerin.',
            'personality_insight' => '',
            'mood_detected' => 'neutral',
            'topics_discussed' => [],
        ];
    }

    public function getConversationAnalytics(User $user): array
    {
        $insights = Cache::get("conversation_insights_user_{$user->id}", []);

        return [
            'total_conversations' => $user->chatHistories()->count(),
            'mood_trend' => $insights['mood_progression'] ?? [],
            'main_topics' => $insights['recurring_topics'] ?? [],
            'conversation_depth' => $insights['conversation_depth'] ?? 'surface',
            'personality_growth' => !empty($user->personality_summary),
        ];
    }
}