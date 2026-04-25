<?php

namespace App\Services;

use App\Models\User;
use App\Support\AIFeature;
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
     * Generate a response for the WhatsApp bot.
     *
     * Default behavior: hybrid routing (rules/templates first; AI fallback only for free-form chat).
     */
    public function generateResponse(User $user, string $userMessage): string
    {
        return $this->generateHybridResponse($user, $userMessage);
    }

    /**
     * Generate a reminder message for a specific task.
     *
     * Default behavior: hybrid template reminder. AI reminder only when explicitly enabled.
     */
    public function generateSmartReminder(User $user, $task): string
    {
        if (!AIFeature::allowsAI('whatsapp_ai_service') || empty($this->openaiApiKey)) {
            return $this->generateTemplateReminder($user, $task);
        }

        $userName = $user->name;
        $taskTitle = $task->title;
        $dueDate = $task->due_date ? $task->due_date->format('d M Y H:i') : 'secepatnya';

        $prompt = "Buatkan pesan reminder WhatsApp yang natural, ramah, dan 'memancing interaksi' untuk {$userName}.
Tugas: '{$taskTitle}'. Deadline: {$dueDate}.

Buat variasi yang beda, singkat, dan personal. Akhiri dengan pertanyaan yang bikin user mau bales ('udah brp persen?', 'gas skrg?', dll).";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->apiUrl, [
                'model' => 'gpt-4o-mini',
                'messages' => [['role' => 'user', 'content' => $prompt]],
                'temperature' => 0.9,
                'max_tokens' => 150,
            ]);

            return $response->json()['choices'][0]['message']['content'] ?? "Halo {$userName}, jangan lupa tugas {$taskTitle} ya!";
        } catch (\Exception $e) {
            return $this->generateTemplateReminder($user, $task);
        }
    }

    private function generateHybridResponse(User $user, string $userMessage): string
    {
        try {
            $messageRaw = trim($userMessage);
            $message = strtolower($messageRaw);

            $tasks = $user->tasks()
                ->where('is_completed', false)
                ->where('status', '!=', 'done')
                ->orderByRaw("case when due_date is null then 1 else 0 end, due_date asc")
                ->take(5)
                ->get();

            if ($this->isGreeting($message)) {
                return $this->replyAndLog($user, $this->randomGreeting($user->name));
            }

            if ($this->isMotivationRequest($message)) {
                $taskHint = $tasks->first()?->title;
                return $this->replyAndLog($user, $this->randomMotivation($taskHint));
            }

            if ($this->isDoneSignal($message)) {
                return $this->replyAndLog($user, $this->randomCelebrate($tasks->first()?->title));
            }

            if ($this->isNotDoneSignal($message)) {
                $hint = $tasks->first()?->title;
                $reply = "Oke, santai. Kendalanya apa? Kalau mau, gue bisa bantu pecah jadi langkah kecil" . ($hint ? " buat \"{$hint}\"" : "") . ".";
                return $this->replyAndLog($user, $reply);
            }

            if ($this->isPriorityAsk($message)) {
                if ($tasks->count() === 0) {
                    return $this->replyAndLog($user, "Saat ini nggak ada task pending yang kebaca. Mau nambah task baru dulu?");
                }

                $list = $tasks->take(3)->values()->map(function ($t, $i) {
                    $due = $t->due_date ? $t->due_date->format('d M') : 'no deadline';
                    return ($i + 1) . ". {$t->title} ({$due})";
                })->implode("\n");

                return $this->replyAndLog($user, "Top prioritas versi gue sekarang:\n{$list}\n\nMau gas yang nomor berapa?");
            }

            if ($this->isBreakdownAsk($message)) {
                $task = $tasks->first();
                if (!$task) {
                    return $this->replyAndLog($user, "Gue siap bantu breakdown, tapi gue belum nemu task pending kamu. Kirim judul task-nya ya.");
                }

                $steps = $this->simpleBreakdownForText($task->title, $task->description);
                $lines = collect($steps)->map(fn ($s, $i) => ($i + 1) . ". " . $s)->implode("\n");
                return $this->replyAndLog($user, "Oke, breakdown cepat buat \"{$task->title}\":\n{$lines}\n\nMau gue kecilin lagi jadi 15-menitan?");
            }

            if (AIFeature::allowsAI('ai_chat') && !empty($this->openaiApiKey)) {
                return $this->generateAIChatResponse($user, $messageRaw, $tasks);
            }

            return $this->replyAndLog($user, "Mau fokus ke prioritas, breakdown, atau butuh motivasi dulu?");
        } catch (\Exception $e) {
            Log::error('WhatsAppAI: Hybrid exception', ['error' => $e->getMessage()]);
            return "Ada gangguan teknis nih. Coba ulang bentar ya.";
        }
    }

    private function generateAIChatResponse(User $user, string $userMessage, $tasks): string
    {
        $history = \App\Models\ReminderLog::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->sortBy('created_at');

        $conversationHistory = "";
        foreach ($history as $log) {
            $role = $log->sender === 'user' ? 'user' : 'assistant';
            $conversationHistory .= "{$role}: {$log->message}\n";
        }

        $contextData = "[TUGAS PENDING]\n";
        if ($tasks->count() > 0) {
            foreach ($tasks as $task) {
                $due = $task->due_date ? " (Deadline: {$task->due_date->format('d M Y')})" : "";
                $est = $task->estimated_minutes ? " ({$task->estimated_minutes} min)" : "";
                $contextData .= "- {$task->title}{$due}{$est}\n";
            }
        } else {
            $contextData .= "Tidak ada tugas pending.\n";
        }

        $userName = $user->name;
        $systemPrompt = "Kamu adalah personal assistant untuk {$userName}. Jawab singkat, natural, dan membantu.\n\n"
            . "KONTEKS CHAT TERAKHIR:\n{$conversationHistory}\n\n"
            . "KONTEKS TASK:\n{$contextData}\n\n"
            . "Jika user bilang 'udah'/'belum', follow up dengan empatik dan actionable.";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->apiUrl, [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userMessage],
                ],
                'temperature' => 0.8,
                'max_tokens' => 300,
            ]);

            if ($response->successful()) {
                $reply = $response->json('choices.0.message.content') ?? 'Maaf, aku lagi loading nih.';
                return $this->replyAndLog($user, $reply);
            }

            Log::error('WhatsAppAI: OpenAI API failed', ['status' => $response->status(), 'body' => $response->body()]);
            return $this->replyAndLog($user, 'Waduh, otakku lagi error nih. Coba nanti lagi ya.');
        } catch (\Exception $e) {
            Log::error('WhatsAppAI: AI exception', ['error' => $e->getMessage()]);
            return $this->replyAndLog($user, 'Ada gangguan teknis nih. Maaf ya!');
        }
    }

    private function replyAndLog(User $user, string $reply): string
    {
        \App\Models\ReminderLog::create([
            'user_id' => $user->id,
            'message' => $reply,
            'sender' => 'assistant',
            'type' => 'chat',
        ]);

        return $reply;
    }

    private function isGreeting(string $message): bool
    {
        return (bool) preg_match('/\b(halo|hai|hi|pagi|siang|sore|malam|ass?alam|hey)\b/u', $message);
    }

    private function isMotivationRequest(string $message): bool
    {
        return (bool) preg_match('/\b(motivasi|semangat|capek|mager|burnout|malas)\b/u', $message);
    }

    private function isPriorityAsk(string $message): bool
    {
        return (bool) preg_match('/\b(prioritas|priority|yang mana dulu|mulai dari mana)\b/u', $message);
    }

    private function isBreakdownAsk(string $message): bool
    {
        return (bool) preg_match('/\b(breakdown|pecah|subtask|step by step|langkah)\b/u', $message);
    }

    private function isDoneSignal(string $message): bool
    {
        return (bool) preg_match('/^(udah|sudah|done|beres|selesai)\b/u', $message);
    }

    private function isNotDoneSignal(string $message): bool
    {
        return (bool) preg_match('/^(belum|blm)\b/u', $message);
    }

    private function randomGreeting(string $name): string
    {
        $greetings = [
            "Halo {$name}! Lagi fokus apa hari ini?",
            "Hai {$name}! Mau gue bantu pilih prioritas dulu?",
            "Yo {$name}! Gimana progressnya?",
        ];

        return $greetings[array_rand($greetings)];
    }

    private function randomMotivation(?string $taskHint = null): string
    {
        $tail = $taskHint ? " Coba 15 menit dulu buat \"{$taskHint}\"—cukup start aja." : " Coba 15 menit dulu—cukup start aja.";
        $motives = [
            "Gas pelan-pelan ya. Yang penting konsisten, bukan sempurna." . $tail,
            "Kalau lagi mager, targetin versi mini aja." . $tail,
            "Santai. Fokus 1 langkah kecil dulu." . $tail,
        ];

        return $motives[array_rand($motives)];
    }

    private function randomCelebrate(?string $taskHint = null): string
    {
        $tail = $taskHint ? " Next, mau lanjut ke \"{$taskHint}\" atau break dulu?" : " Next, mau lanjut task lain atau break dulu?";
        $celebrates = [
            "Mantap! Itu progress beneran." . $tail,
            "GG! Satu langkah lagi lebih dekat." . $tail,
            "Nice! Keep the momentum." . $tail,
        ];

        return $celebrates[array_rand($celebrates)];
    }

    private function generateTemplateReminder(User $user, $task): string
    {
        $userName = $user->name;
        $taskTitle = $task->title;
        $due = $task->due_date ? $task->due_date->format('d M H:i') : 'secepatnya';

        $templates = [
            "Halo {$userName}, reminder kecil buat \"{$taskTitle}\" ya. Deadline {$due}. Mau gas 15 menit sekarang?",
            "Hey {$userName}! \"{$taskTitle}\" udah disentuh belum? Deadline {$due}. Mau gue bantu breakdown?",
            "{$userName}, quick ping: \"{$taskTitle}\" (due {$due}). Start kecil: 10 menit dulu aja.",
        ];

        return $templates[array_rand($templates)];
    }

    private function simpleBreakdownForText(string $title, ?string $description = null): array
    {
        $text = strtolower(trim($title . ' ' . (string) $description));

        if (preg_match('/(tulis|laporan|proposal|artikel)/', $text)) {
            return ["Bikin outline 5 poin", "Tulis draft kasar 25 menit", "Edit + kirim"];
        }
        if (preg_match('/(belajar|study|materi|latihan)/', $text)) {
            return ["Tentukan target sesi", "Pelajari inti + catat", "Latihan 10 menit"];
        }
        if (preg_match('/(meeting|rapat|call|zoom)/', $text)) {
            return ["Tulis agenda 3 poin", "Siapkan data/notes", "Recap action items"];
        }

        return ["Tentukan definisi selesai", "Kerjain bagian paling kecil dulu", "Review + next step"];
    }
}

