<?php
namespace App\Services;

use App\Models\User;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class GeminiService
{
    private const CONTEXT_WINDOW_LIMIT = 15; // Maks chat history yang dipakai
    private const PERSONALITY_UPDATE_THRESHOLD = 3; // Update insight setiap 3 turn

    /**
     * Sapaan awal yang hangat dan variatif
     */
    public function getInitialReflectionQuestion(string $userName): string
    {
        $greetings = [
            "Halo {$userName}! Gimana kabarmu hari ini? Yuk cerita apa aja yang lagi ada di pikiranmu.",
            "Hi {$userName}! Gue di sini buat dengerin kamu. Ada yang pengen kamu share atau refleksiin hari ini?",
            "Hey {$userName}! Semoga harimu baik ya. Gue siap jadi teman ngobrol kamu. Mulai dari mana nih?",
        ];

        return $greetings[array_rand($greetings)];
    }

    /**
     * Dapatkan respons AI dengan personalisasi mendalam dan context awareness
     * @param Collection $chatHistory Obrolan terdahulu (kronologis)
     * @param User $user User aktif
     * @param string $currentUserInput Input terbaru user untuk konteks tambahan
     * @return array feedback, next_question, mood_detected, topics_discussed, personality_insight
     */
    public function getConversationResponse(Collection $chatHistory, User $user, string $currentUserInput = ''): array
    {
        try {
            // Ambil konteks penting dan recent, limit supaya gak overload token
            $relevantHistory = $this->getRelevantContext($chatHistory, $user->id);

            // Analisis konteks: mood, topik, kedalaman pembicaraan
            $contextAnalysis = $this->analyzeConversationContext($relevantHistory, $currentUserInput);

            // Format obrolan lengkap dengan analisis kontekstual untuk prompt
            $formattedHistory = $this->formatConversationHistory($relevantHistory, $contextAnalysis);

            // Pilih prompt premium atau standar sesuai status user
            $prompt = $user->is_premium
                ? $this->getPremiumContextualPrompt($user, $formattedHistory, $contextAnalysis)
                : $this->getStandardContextualPrompt($formattedHistory, $contextAnalysis);

            // Generate respons dari Gemini dengan retry
            $result = $this->generateGeminiResponse($prompt);

            // Parsing hasil respons dan validasi
            $parsedResponse = $this->parseGeminiResponse($result, $user, $contextAnalysis);

            // Update insight kepribadian kalau premium dan ada insight baru
            if ($user->is_premium && !empty($parsedResponse['personality_insight'])) {
                $this->updatePersonalityInsights($user, $parsedResponse['personality_insight'], $contextAnalysis);
            }

            // Cache insights untuk performa dan analitik
            $this->cacheConversationInsights($user->id, $contextAnalysis);

            return $parsedResponse;

        } catch (\Exception $e) {
            Log::error('GeminiService Error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'history_count' => $chatHistory->count(),
                'stack_trace' => $e->getTraceAsString()
            ]);

            return $this->getFallbackResponse($user, $currentUserInput);
        }
    }

    /**
     * Ambil obrolan paling relevan (recent + penting)
     */
    private function getRelevantContext(Collection $chatHistory, int $userId): Collection
    {
        $recentHistory = $chatHistory->sortByDesc('created_at')
            ->take(self::CONTEXT_WINDOW_LIMIT)
            ->sortBy('created_at');

        $importantChats = Cache::get("important_chats_user_{$userId}", collect());

        return $recentHistory->merge($importantChats)->unique('id')->sortBy('created_at');
    }

    /**
     * Analisis konteks: mood, topik, kedalaman percakapan
     */
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

        // Keyword mood positif, negatif, netral (bisa dikembangkan)
        $moodKeywords = [
            'positive' => ['senang', 'bahagia', 'semangat', 'grateful', 'optimis', 'bangga', 'lega', 'happy', 'joy'],
            'negative' => ['sedih', 'kecewa', 'frustasi', 'marah', 'anxious', 'stress', 'takut', 'khawatir', 'down', 'bad'],
            'neutral' => ['biasa', 'oke', 'normal', 'standar', 'fine', 'so so'],
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

        // Topik yang sering muncul
        $allText = $history->pluck('user_answer')->filter()->implode(' ') . ' ' . $currentInput;
        $topicKeywords = [
            'karir' => ['kerja', 'karir', 'job', 'bos', 'karyawan', 'resign', 'promosi'],
            'relationship' => ['pacar', 'putus', 'teman', 'keluarga', 'ortu', 'love', 'cinta'],
            'personal_growth' => ['belajar', 'skill', 'develop', 'goal', 'target', 'growth'],
            'mental_health' => ['stress', 'anxiety', 'depresi', 'burnout', 'overwhelm', 'mental health'],
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

        // Mood terkini berdasarkan 3 jawaban terakhir
        $recentMoods = array_slice($analysis['mood_progression'], -3);
        if (!empty($recentMoods)) {
            $moodCount = array_count_values($recentMoods);
            arsort($moodCount);
            $analysis['emotional_state'] = array_key_first($moodCount);
        }

        // Deteksi kedalaman percakapan berdasarkan kata kunci tertentu
        $deepIndicators = ['kenapa', 'mengapa', 'bagaimana', 'feel', 'rasanya', 'makna', 'tujuan', 'perasaan', 'pikiran'];
        $deepCount = 0;
        foreach ($deepIndicators as $indicator) {
            $deepCount += substr_count(strtolower($allText), $indicator);
        }
        $analysis['conversation_depth'] = $deepCount > 3 ? 'deep' : 'surface';

        return $analysis;
    }

    /**
     * Format obrolan + konteks jadi string untuk prompt AI
     */
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

        $contextSummary = "\n\n=== CONTEXT ANALYSIS ===\n";
        $contextSummary .= "Emotional State: " . $context['emotional_state'] . "\n";
        $contextSummary .= "Conversation Depth: " . $context['conversation_depth'] . "\n";
        if (!empty($context['recurring_topics'])) {
            $contextSummary .= "Main Topics: " . implode(', ', array_keys($context['recurring_topics'])) . "\n";
        }

        return $formatted . $contextSummary;
    }

    /**
     * Prompt premium yang kaya konteks dan insight
     */
    private function getPremiumContextualPrompt(User $user, string $formattedHistory, array $context): string
    {
        $personalityMemory = $user->personality_summary
            ? "PERSONALITY INSIGHTS SEJAUH INI:\n" . $user->personality_summary . "\n\n"
            : "PERSONALITY INSIGHTS: Masih dalam tahap eksplorasi awal.\n\n";

        $contextGuidance = $this->generateContextualGuidance($context);

        return <<<PROMPT
Kamu adalah 'GrowthBot', AI companion yang sangat empatik dan expert dalam psikologi serta personal development.
Kamu sedang berbicara dengan {$user->name} dan sudah membangun hubungan yang dalam.

{$personalityMemory}

CONVERSATION HISTORY & CONTEXT:
{$formattedHistory}

CONTEXTUAL GUIDANCE:
{$contextGuidance}

INSTRUKSI:
1. Berikan respons yang sangat personal, peka, dan menyesuaikan dengan emotional state {$user->name}.
2. Rujuk ke obrolan sebelumnya dan buat percakapan terasa nyambung.
3. Berikan insight baru dan progress, hindari pengulangan.
4. Rayakan growth dan highlight concern jika ada.
5. Gunakan bahasa Indonesia natural, santai, dan penuh perhatian ala Gen Z.

FORMAT RESPONSE:
[Feedback yang dalam, empatik, dan personal]|||[Pertanyaan lanjutan yang mengulik lebih dalam]|||[Updated personality insight singkat, atau NONE]

Pastikan response menunjukkan continuity dan growth yang jelas!
PROMPT;
    }

    /**
     * Prompt standar untuk user non-premium dengan konteks sederhana
     */
    private function getStandardContextualPrompt(string $formattedHistory, array $context): string
    {
        $contextGuidance = $this->generateContextualGuidance($context);

        return <<<PROMPT
Kamu adalah GrowthBot, teman curhat yang asik dan perhatian.
Tunjukkan bahwa kamu ingat dan paham percakapan sebelumnya.

CONVERSATION HISTORY:
{$formattedHistory}

GUIDANCE BERDASARKAN CONTEXT:
{$contextGuidance}

ATURAN:
1. Refer ke obrolan sebelumnya supaya percakapan terasa natural dan nyambung.
2. Bangun pertanyaan dari topik yang sudah dibahas.
3. Tunjukkan empati sesuai mood user.
4. Jangan ulang topik yang sudah dibahas, tapi berikan value baru.

FORMAT:
[Feedback yang personal dan nyambung]|||[Pertanyaan lanjutan]

Jangan buat kesan seperti ngobrol pertama kali!
PROMPT;
    }

    /**
     * Bantu buat guidance konteks berdasarkan analisis
     */
    private function generateContextualGuidance(array $context): string
    {
        $guidance = [];

        // Mood
        switch ($context['emotional_state']) {
            case 'positive':
                $guidance[] = "User sedang mood positif - bisa gali lebih jauh potensi dan goals-nya.";
                break;
            case 'negative':
                $guidance[] = "User lagi struggle - fokus validasi dan support dulu sebelum kasih saran.";
                break;
            default:
                $guidance[] = "User mood netral - cocok untuk eksplorasi santai dan open-ended.";
        }

        // Depth percakapan
        if ($context['conversation_depth'] === 'deep') {
            $guidance[] = "Obrolan cukup dalam - teruskan dengan pertanyaan yang meaningful dan reflektif.";
        } else {
            $guidance[] = "Obrolan masih permukaan - arahkan perlahan ke topik yang lebih bermakna.";
        }

        // Topik utama
        if (!empty($context['recurring_topics'])) {
            $mainTopic = array_key_first($context['recurring_topics']);
            $guidance[] = "Topik utama yang sering muncul: {$mainTopic}. Gali dari berbagai sisi.";
        }

        return implode("\n", $guidance);
    }

    /**
     * Generate respons ke Gemini API dengan retry
     */
    private function generateGeminiResponse(string $prompt): string
    {
        $maxRetries = 3;
        $retryCount = 0;

        while ($retryCount < $maxRetries) {
            try {
                return Gemini::generativeModel('models/gemini-2.5-pro')
                    ->generateContent($prompt)
                    ->text();
            } catch (\Exception $e) {
                $retryCount++;
                if ($retryCount >= $maxRetries) {
                    throw $e;
                }
                sleep(1);
            }
        }
    }

    /**
     * Parse respons AI dan validasi isi
     */
    private function parseGeminiResponse(string $result, User $user, array $context): array
    {
        $parts = explode('|||', $result, 3);

        $feedback = trim($parts[0] ?? '');
        $nextQuestion = trim($parts[1] ?? '');
        $personalityInsight = isset($parts[2]) ? trim($parts[2]) : '';

        // Fallback respons bila kosong
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

    /**
     * Update insight kepribadian secara akumulatif dan cerdas
     */
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

    /**
     * Merge insight personality secara sederhana (bisa dikembangkan pakai AI summarization)
     */
    private function mergePersonalityInsights(string $current, string $new, array $context): string
    {
        if (strlen($current) > 500) {
            // Ringkas jika sudah terlalu panjang
            return $new . " | Previous: " . substr($current, 0, 200) . "...";
        }

        return $current . " | Update: " . $new;
    }

    /**
     * Cache insights untuk performa dan analitik
     */
    private function cacheConversationInsights(int $userId, array $insights): void
    {
        Cache::put("conversation_insights_user_{$userId}", $insights, now()->addHours(24));
    }

    /**
     * Fallback respons personal sesuai mood
     */
    private function generateContextualFallbackFeedback(array $context): string
    {
        $fallbacks = [
            'positive' => 'Seneng banget denger update dari kamu! Keep up the positive vibes ya.',
            'negative' => 'Gue ngerti ini nggak gampang buat kamu. Makasih udah percaya cerita sama gue.',
            'neutral' => 'Thanks udah cerita, gue appreciate openness kamu buat refleksi bareng.',
        ];

        return $fallbacks[$context['emotional_state']] ?? $fallbacks['neutral'];
    }

    private function generateContextualFallbackQuestion(array $context): string
    {
        $questions = [
            'positive' => 'Dengan energi positif ini, apa hal baru yang pengen kamu capai?',
            'negative' => 'Dari situasi ini, ada hal kecil yang bisa bikin kamu lebih lega gak?',
            'neutral' => 'Ada hal lain dari hidup kamu yang pengen kita obrolin lebih dalam gak?',
        ];

        return $questions[$context['emotional_state']] ?? $questions['neutral'];
    }

    /**
     * Fallback response kalau error
     */
    private function getFallbackResponse(User $user, string $currentInput): array
    {
        return [
            'feedback' => "Hey {$user->name}, maaf ya, ada masalah teknis sebentar. Tapi gue tetap siap dengerin kamu kok.",
            'next_question' => 'Mau lanjut cerita? Gue siap dengerin.',
            'personality_insight' => '',
            'mood_detected' => 'neutral',
            'topics_discussed' => [],
        ];
    }

    /**
     * Analitik obrolan untuk dashboard atau laporan
     */
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
