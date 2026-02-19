<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppAIService
{
    protected $openaiApiKey;
    protected $apiUrl = 'https://api.openai.com/v1/chat/completions';

    public function __construct()
    {
        $this->openaiApiKey = config('services.openai.api_key');
    }

    /**
     * Generate a smart response for the WhatsApp bot
     *
     * @param User $user
     * @param string $userMessage
     * @return string
     */
    public function generateResponse(User $user, string $userMessage): string
    {
        try {
            // --- 1. Fetch Task Context ---
            $tasks = $user->tasks()
                ->where('status', '!=', 'completed')
                ->orderBy('due_date', 'asc')
                ->take(5)
                ->get();

            $contextData = "=== KONTEKS USER ===\n";
            
            // Tasks
            $contextData .= "[TUGAS PENDING]\n";
            if ($tasks->count() > 0) {
                foreach ($tasks as $task) {
                    $due = $task->due_date ? " (Deadline: {$task->due_date->format('d M Y')})" : "";
                    $prio = $task->priority ? "[{$task->priority}]" : "";
                    $contextData .= "- {$task->title} {$prio}{$due}\n";
                }
            } else {
                $contextData .= "Tidak ada tugas pending.\n";
            }

            // --- 2. Fetch Learning Context ---
            // Get ongoing modules
            $learningProgress = \App\Models\UserModulProgress::with('miniModul')
                ->where('user_id', $user->id)
                ->where('is_completed', false)
                ->latest()
                ->take(3)
                ->get();

            $contextData .= "\n[PEMBELAJARAN SEDANG BERJALAN]\n";
            if ($learningProgress->count() > 0) {
                foreach ($learningProgress as $progress) {
                    $modulName = $progress->miniModul->title ?? 'Modul';
                    $contextData .= "- {$modulName} (Chapter sedang dipelajari)\n";
                }
            } else {
                $contextData .= "Belum ada modul yang sedang dipelajari aktif.\n";
            }

            // --- 3. Fetch Gamification & Guild Context ---
            $levelTitle = $user->level_title ?? 'Pemula';
            $xp = $user->xp ?? 0;
            $guild = $user->guilds->first();
            $guildName = $guild ? $guild->name : "Belum gabung Guild";

            $contextData .= "\n[STATUS GAMIFIKASI]\n";
            $contextData .= "- Level: {$user->level} ({$levelTitle})\n";
            $contextData .= "- XP: {$xp}\n";
            $contextData .= "- Guild: {$guildName}\n";

            $now = now()->format('l, d F Y H:i');
            $userName = $user->name;

            // --- 4. Build System Prompt ---
            $systemPrompt = "Kamu adalah asisten produktivitas pribadi untuk {$userName} yang hidup di dalam WhatsApp.
            Waktu saat ini: {$now}
            
            {$contextData}
            
            Instruksi Utama:
            1. Jawab pertanyaan user dengan ramah, singkat, dan padat (style chatting WhatsApp).
            2. Gunakan emoji secukupnya.
            3. Kamu BISA menjawab seputar Tugas, Pembelajaran (Learning), dan update Gamification/Guild user.
            4. Jika user bertanya 'progres belajar saya?', 'xp saya berapa?', atau 'guild saya apa?', jawab berdasarkan data di atas.
            5. Motivasi user untuk terus produktif (selesaikan tugas atau lanjut belajar).
            6. Jangan halusinasi data yang tidak ada di konteks.
            7. Bahasa: Indonesia (Gaul, akrab, tapi tetap sopan).
            ";

            // 5. Call OpenAI
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->apiUrl, [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userMessage]
                ],
                'temperature' => 0.7,
                'max_tokens' => 350,
            ]);

            if ($response->successful()) {
                $result = $response->json();
                return $result['choices'][0]['message']['content'] ?? 'Maaf, aku lagi loading nih. Coba tanya lagi ya!';
            }

            Log::error('WhatsAppAI: OpenAI API failed', ['status' => $response->status(), 'body' => $response->body()]);
            return 'Waduh, otakku lagi error nih. Coba nanti lagi ya kak! 🤕';

        } catch (\Exception $e) {
            Log::error('WhatsAppAI: Exception', ['error' => $e->getMessage()]);
            return 'Ada gangguan teknis nih kak. Maaf ya! 🙏';
        }
    }
}
