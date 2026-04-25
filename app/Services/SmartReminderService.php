<?php

namespace App\Services;

use App\Models\User;
use App\Models\NotificationLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmartReminderService
{
    protected $openaiApiKey;
    protected $apiUrl = 'https://api.openai.com/v1/chat/completions';

    public function __construct()
    {
        $this->openaiApiKey = config('services.openai.api_key');
    }

    /**
     * Check notification frequency and send if allowed.
     */
    public function sendWithFrequencyCheck(User $user, string $type, string $message, string $channel = 'whatsapp'): bool
    {
        $now = Carbon::now();

        // 1. Frequency Checks
        if ($type === 'reminder') {
            // Max 1x per day
            $sentToday = NotificationLog::where('user_id', $user->id)
                ->where('type', 'reminder')
                ->where('channel', $channel)
                ->whereDate('sent_at', $now->toDateString())
                ->exists();
            if ($sentToday) return false;
            
        } elseif ($type === 'identity_trigger') {
            // Max 3x per week
            $startOfWeek = $now->copy()->startOfWeek();
            $sentThisWeek = NotificationLog::where('user_id', $user->id)
                ->where('type', 'identity_trigger')
                ->where('channel', $channel)
                ->where('sent_at', '>=', $startOfWeek)
                ->count();
            if ($sentThisWeek >= 3) return false;
            
        } elseif ($type === 'evaluation') {
            // 1x per week (Sunday 20.00) usually controlled by the scheduler itself,
            // but we can add a safety check (max 1 per 6 days)
            $sentRecently = NotificationLog::where('user_id', $user->id)
                ->where('type', 'evaluation')
                ->where('channel', $channel)
                ->where('sent_at', '>=', $now->copy()->subDays(6))
                ->exists();
            if ($sentRecently) return false;
            
        } // achievement is unlimited, so no check.

        // 2. Send via Fonnte/WhatsApp
        $isSent = $this->sendWhatsAppMessage($user, $message);

        // 3. Log
        if ($isSent) {
            NotificationLog::create([
                'user_id' => $user->id,
                'type' => $type,
                'channel' => $channel,
                'sent_at' => $now,
            ]);
        }

        return $isSent;
    }

    /**
     * Send WhatsApp message via Fonnte
     */
    protected function sendWhatsAppMessage(User $user, string $message): bool
    {
        // Integration with WhatsApp sender (Fonnte)
        // Ensure user has phone
        if (!$user->phone) return false;
        if (isset($user->default_reminder_enabled) && !$user->default_reminder_enabled) return false;
        
        $result = app(WhatsAppService::class)->sendMessage($user->phone, $message);
        return $result['success'] ?? false;
    }

    /**
     * Generate contextual message based on type using System Prompt
     */
    public function generateNotificationMessage(User $user, string $type, array $context = []): string
    {
        $stats = $user->gamificationStats;
        
        // 1. Format Inputs
        $name = $user->name;
        $rank = $stats ? "{$stats->rank_title} #{$stats->rank_position}" : "Beginner #0";
        
        $taskListStr = "Tidak ada task spesifik.";
        if (isset($context['tasks'])) {
            $taskListStr = "";
            foreach($context['tasks'] as $task) {
                $status = $task->is_completed ? 'Selesai' : 'Pending';
                $due = $task->due_date ? $task->due_date->format('d M') : 'No deadline';
                $taskListStr .= "- {$task->title} [Status: {$status}] [Due: {$due}]\n";
            }
        } elseif (isset($context['task_name'])) {
            $taskListStr = "- {$context['task_name']}";
        }

        $statsStr = "Score minggu ini: " . ($context['score'] ?? 'N/A') . "%, ";
        $statsStr .= "Streak: " . ($stats->streak ?? 0) . ", ";
        $statsStr .= "Perubahan rank: " . ($stats->last_rank_change ?? 0);

        $konteksStr = $context['moment'] ?? "Tidak ada momen spesifik.";

        // 2. Build User Prompt Payload
        $userPayload = "NAMA: {$name}\n";
        $userPayload .= "RANK: {$rank}\n";
        $userPayload .= "NOTIF_TYPE: {$type}\n";
        $userPayload .= "TASK_LIST:\n{$taskListStr}\n";
        $userPayload .= "STATS: {$statsStr}\n";
        $userPayload .= "KONTEKS: {$konteksStr}";

        // 3. System Prompt (From UI Spec)
        $systemPrompt = "ROLE:
Kamu adalah sekretaris personal elite untuk pengguna SarangTumbuh.
Bukan bot. Bukan reminder biasa.
Kamu tahu siapa mereka, di mana posisi mereka, dan apa yang sedang dipertaruhkan.
Tugasmu: tulis pesan WhatsApp yang bikin mereka bergerak — bukan sekadar dibaca lalu tutup.

ATURAN WAJIB:
- Tulis seperti manusia yang peduli, bukan robot
- JANGAN buka kalimat dengan nama user
- Selalu sebut rank/posisi mereka — ini cermin identitas
- Pendek, tajam, bisa dibaca 5 detik
- Akhiri dengan 1 kalimat yang bikin mereka pengen buka app
- Maks 2-3 emoji per pesan
- JANGAN pakai kata: reminder, pengingat, tolong, mohon

Pola TIPE A - REMINDER (NOTIF_TYPE = reminder):
[Fakta mengejutkan]
[1 task paling kritis]
[Kalimat trigger]

Pola TIPE B - SUNDAY CONSISTENCY REPORT (NOTIF_TYPE = evaluation):
📊 Sunday Consistency Report — Week [X]
✔ [X] selesai  ✖ [X] telat  ⚠ [X] gak disentuh
Score: [X]%  |  Rank: [naik/turun X]
[1-2 kalimat refleksi]
[Kalimat closing]

Pola TIPE C - IDENTITY TRIGGER (NOTIF_TYPE = identity_trigger):
[Fakta posisi/momen langsung]
[Stakes/pertaruhan]
[Pertanyaan menantang identitas]

Pola TIPE D - ACHIEVEMENT (NOTIF_TYPE = achievement):
[Pencapaian spesifik]
[Kenapa ini meaningful]
[Kalimat affirm identitas]

OUTPUT:
Kembalikan HANYA teks pesan WhatsApp. Tanpa label penjelasan. Siap kirim.";

        // 4. Call OpenAI
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->apiUrl, [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPayload]
                ],
                'temperature' => 0.8,
            ]);

            if ($response->successful()) {
                $content = $response->json()['choices'][0]['message']['content'] ?? null;
                if ($content) {
                    return trim($content);
                }
            }
            
            Log::error('OpenAI failed to generate notification', ['status' => $response->status(), 'body' => $response->body()]);
        } catch (\Exception $e) {
            Log::error('Exception in generateNotificationMessage', ['error' => $e->getMessage()]);
        }

        // 5. Fallback messages if AI fails
        return $this->getFallbackMessage($type, $rank, $context);
    }

    private function getFallbackMessage(string $type, string $rank, array $context): string
    {
        switch ($type) {
            case 'reminder':
                return "{$rank}, ada task yang belum disentuh nih. Masih bisa dikejar kalau mulai sekarang. Gas?";
            case 'evaluation':
                return "📊 Sunday Consistency Report\nEvaluasi mingguanmu udah siap. Cek aplikasinya buat lihat pergerakan rank kamu minggu ini.";
            case 'identity_trigger':
                return "Posisi {$rank} lagi dipertaruhkan hari ini. Mau biarin streak mu pecah gitu aja?";
            case 'achievement':
                return "Nice! Progress yang solid hari ini. Ini bukan hoki, ini sistem yang kamu bangun. Pertahankan {$rank}!";
            default:
                return "Waktunya fokus lagi, {$rank}!";
        }
    }
}

