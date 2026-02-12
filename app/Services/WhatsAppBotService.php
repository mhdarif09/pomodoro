<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppBotService
{
    protected FonnteService $fonnteService;

    public function __construct(FonnteService $fonnteService)
    {
        $this->fonnteService = $fonnteService;
    }

    /**
     * Process an incoming WhatsApp message and return a response.
     */
    public function processMessage(User $user, string $message): string
    {
        $message = trim($message);

        // Layer 1: Slash Commands
        if (str_starts_with($message, '/')) {
            return $this->handleCommand($user, $message);
        }

        // Layer 2: AI Natural Language Understanding
        return $this->handleNaturalLanguage($user, $message);
    }

    /**
     * Handle slash commands.
     */
    protected function handleCommand(User $user, string $message): string
    {
        $parts = explode(' ', $message, 2);
        $command = strtolower($parts[0]);
        $args = $parts[1] ?? '';

        return match ($command) {
            '/help', '/bantuan' => $this->cmdHelp(),
            '/list', '/tugas' => $this->cmdList($user),
            '/tambah', '/add' => $this->cmdAdd($user, $args),
            '/selesai', '/done' => $this->cmdDone($user, $args),
            '/hapus', '/delete' => $this->cmdDelete($user, $args),
            '/detail' => $this->cmdDetail($user, $args),
            '/reminder' => $this->cmdReminder($user, $args),
            default => "❓ Command tidak dikenal.\n\nKetik /help untuk melihat daftar command.",
        };
    }

    // =========================================================================
    // SLASH COMMANDS
    // =========================================================================

    protected function cmdHelp(): string
    {
        return "📋 *Sarang Tumbuh — WhatsApp Bot*\n\n"
            . "Berikut command yang tersedia:\n\n"
            . "📌 */tambah [judul] - [deadline]*\n"
            . "   Buat task baru\n"
            . "   Contoh: /tambah Belajar Kalkulus - 2026-02-15\n\n"
            . "📄 */list* atau */tugas*\n"
            . "   Lihat semua pending tasks\n\n"
            . "✅ */selesai [nomor]*\n"
            . "   Tandai task selesai\n"
            . "   Contoh: /selesai 1\n\n"
            . "🗑️ */hapus [nomor]*\n"
            . "   Hapus task\n"
            . "   Contoh: /hapus 2\n\n"
            . "📎 */detail [nomor]*\n"
            . "   Lihat detail + subtask\n\n"
            . "⏰ */reminder [nomor] [waktu]*\n"
            . "   Set reminder custom\n"
            . "   Contoh: /reminder 1 2026-02-11 08:00\n\n"
            . "💬 Atau kirim pesan biasa (natural language) dan AI kami akan membantu!\n"
            . "   Contoh: \"besok deadline apa ya?\"";
    }

    protected function cmdList(User $user): string
    {
        $tasks = $user->tasks()
            ->where('is_completed', false)
            ->orderBy('due_date', 'asc')
            ->get();

        if ($tasks->isEmpty()) {
            return "🎉 Tidak ada task pending. Kamu sudah menyelesaikan semuanya!\n\nGunakan /tambah untuk buat task baru.";
        }

        $msg = "📋 *Daftar Task Kamu* ({$tasks->count()} pending)\n\n";
        foreach ($tasks->values() as $i => $task) {
            $num = $i + 1;
            $priority = $this->priorityEmoji($task->priority);
            $due = $task->due_date ? Carbon::parse($task->due_date)->format('d M Y') : 'Tanpa deadline';
            $status = $this->statusLabel($task->status);
            $msg .= "{$num}. {$priority} *{$task->title}*\n";
            $msg .= "   📅 {$due} | {$status}\n\n";
        }

        $msg .= "Gunakan /selesai [nomor] untuk menandai selesai.";
        return $msg;
    }

    protected function cmdAdd(User $user, string $args): string
    {
        if (empty($args)) {
            return "⚠️ Format: /tambah [judul] - [deadline]\n\nContoh: /tambah Belajar Kalkulus - 2026-02-15";
        }

        // Parse title and deadline
        $parts = explode(' - ', $args, 2);
        $title = trim($parts[0]);
        $deadline = isset($parts[1]) ? trim($parts[1]) : null;

        if (empty($title)) {
            return "⚠️ Judul task tidak boleh kosong.";
        }

        $taskData = [
            'title' => $title,
            'status' => 'todo',
            'is_completed' => false,
            'created_via' => 'whatsapp',
        ];

        if ($deadline) {
            try {
                $dueDate = Carbon::parse($deadline);
                $taskData['due_date'] = $dueDate->format('Y-m-d');
            } catch (\Exception $e) {
                return "⚠️ Format tanggal tidak valid. Gunakan format: YYYY-MM-DD\nContoh: 2026-02-15";
            }
        }

        // Auto-determine priority
        $taskData['priority'] = $this->determinePriority($taskData['due_date'] ?? null);

        $task = $user->tasks()->create($taskData);

        $response = "✅ *Task berhasil dibuat!*\n\n"
            . "📋 {$task->title}\n"
            . "🎯 Priority: {$task->priority}\n";

        if ($task->due_date) {
            $response .= "📅 Deadline: " . Carbon::parse($task->due_date)->format('d M Y') . "\n";
        }

        $response .= "\nGunakan /list untuk melihat semua task.";
        return $response;
    }

    protected function cmdDone(User $user, string $args): string
    {
        $num = (int) trim($args);
        if ($num < 1) {
            return "⚠️ Format: /selesai [nomor]\nContoh: /selesai 1\n\nGunakan /list untuk melihat daftar task.";
        }

        $task = $this->getTaskByNumber($user, $num);
        if (!$task) {
            return "⚠️ Task #{$num} tidak ditemukan. Gunakan /list untuk melihat daftar task.";
        }

        $task->update([
            'is_completed' => true,
            'status' => 'done',
        ]);

        return "✅ *Task selesai!*\n\n"
            . "📋 ~~{$task->title}~~ ✔️\n\n"
            . "Keren! Satu langkah lebih dekat ke tujuanmu! 🚀";
    }

    protected function cmdDelete(User $user, string $args): string
    {
        $num = (int) trim($args);
        if ($num < 1) {
            return "⚠️ Format: /hapus [nomor]\nContoh: /hapus 2";
        }

        $task = $this->getTaskByNumber($user, $num);
        if (!$task) {
            return "⚠️ Task #{$num} tidak ditemukan. Gunakan /list untuk melihat daftar task.";
        }

        $title = $task->title;
        $task->delete();

        return "🗑️ Task *{$title}* berhasil dihapus.";
    }

    protected function cmdDetail(User $user, string $args): string
    {
        $num = (int) trim($args);
        if ($num < 1) {
            return "⚠️ Format: /detail [nomor]\nContoh: /detail 1";
        }

        $task = $this->getTaskByNumber($user, $num);
        if (!$task) {
            return "⚠️ Task #{$num} tidak ditemukan.";
        }

        $msg = "📎 *Detail Task #{$num}*\n\n"
            . "📋 *{$task->title}*\n"
            . "🎯 Priority: {$task->priority}\n"
            . "📊 Status: {$this->statusLabel($task->status)}\n";

        if ($task->due_date) {
            $msg .= "📅 Deadline: " . Carbon::parse($task->due_date)->format('d M Y') . "\n";
        }

        if ($task->description) {
            $msg .= "📝 Deskripsi: {$task->description}\n";
        }

        if ($task->notes) {
            $msg .= "🗒️ Notes: {$task->notes}\n";
        }

        if ($task->reminder_at) {
            $msg .= "⏰ Reminder: " . Carbon::parse($task->reminder_at)->format('d M Y H:i') . "\n";
        }

        // Subtasks
        $subtasks = $task->subtasks;
        if ($subtasks && $subtasks->isNotEmpty()) {
            $msg .= "\n📌 *Subtasks:*\n";
            foreach ($subtasks as $sub) {
                $check = $sub->is_completed ? '✅' : '⬜';
                $msg .= "   {$check} {$sub->title}\n";
            }
        }

        return $msg;
    }

    protected function cmdReminder(User $user, string $args): string
    {
        $parts = preg_split('/\s+/', trim($args), 2);
        $num = (int) ($parts[0] ?? 0);
        $timeStr = $parts[1] ?? '';

        if ($num < 1 || empty($timeStr)) {
            return "⚠️ Format: /reminder [nomor] [waktu]\nContoh: /reminder 1 2026-02-11 08:00";
        }

        $task = $this->getTaskByNumber($user, $num);
        if (!$task) {
            return "⚠️ Task #{$num} tidak ditemukan.";
        }

        try {
            $reminderAt = Carbon::parse($timeStr);
        } catch (\Exception $e) {
            return "⚠️ Format waktu tidak valid.\nGunakan: YYYY-MM-DD HH:MM\nContoh: 2026-02-11 08:00";
        }

        if ($reminderAt->isPast()) {
            return "⚠️ Waktu reminder harus di masa depan.";
        }

        $task->update([
            'reminder_at' => $reminderAt,
            'reminder_sent' => false,
        ]);

        return "⏰ *Reminder di-set!*\n\n"
            . "📋 {$task->title}\n"
            . "🔔 Kamu akan diingatkan pada: " . $reminderAt->format('d M Y H:i') . "\n\n"
            . "Kami akan kirim notif WhatsApp tepat waktu! 🚀";
    }

    // =========================================================================
    // AI NATURAL LANGUAGE UNDERSTANDING (Layer 2)
    // =========================================================================

    protected function handleNaturalLanguage(User $user, string $message): string
    {
        try {
            // Build context from user's tasks
            $context = $this->buildUserContext($user);

            $systemPrompt = <<<PROMPT
Kamu adalah "Sarang Tumbuh AI Partner", rekan kerja virtual yang pintar, asik, dan suportif.
Tugasmu adalah membantu user ($user->name) menjadi lebih produktif, manajemen waktu, dan mengurangi stres kerja.

GAYA KOMUNIKASI:
- Bahasa Indonesia yang natural, santai, tapi tetap cerdas (seperti rekan kerja senior yang asik).
- Gunakan emoji secukupnya untuk ekspresi.
- Boleh bercanda dikit kalau konteksnya pas, tap tetap fokus ke solusi.
- JANGAN kaku seperti robot/mesin penjawab otomatis.

KONTEKS USER HARI INI:
{$context}

KEMAMPUAN KAMU:
1.  **Diskusi Kerja:** Bantu brainstorming ide, draft email, atau kasih masukan logika.
2.  **Manajemen Task:** Ingatkan deadline, saran prioritas, atau pecah task besar jadi kecil.
3.  **Support Mental:** Semangati kalau user lagi pusing/stres. Appreciate kalau ada task selesai.
4.  **Pertanyaan Teknis:** Jawab pertanyaan umum soal kerjaan/coding/tulis-menulis.

INSTRUKSI KHUSUS:
- Jika user minta **TELPON/CALL**: Jawab dengan playful, misalnya "Waduh, aku belum punya mulut beneran nih buat nelpon 😂 Tapi aku bisa nemenin kamu chatting 24 jam non-stop! Mau bahas apa?".
- Jika user tanya "harus ngapain?": Cek list task pending, sarankan yang prioritas tinggi atau deadline dekat.
- Jika user lapor task selesai: Berikan pujian yang tulus! 🎉

UNTUK AKSI NYATA (Database):
Beri tahu user command ini jika mereka MINTA melakukan aksi (karena kamu belum bisa manipulasi DB langsung):
- /tambah [judul] - [deadline]
- /selesai [nomor]
- /hapus [nomor]

Jawablah secara ringkas (max 1-2 paragraf) kecuali diminta menjelaskan panjang lebar.
PROMPT;

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . config('services.gemini.api_key', env('GEMINI_API_KEY')), [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [['text' => $systemPrompt . "\n\nChat User: " . $message]],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 500,
                ],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                if ($text) {
                    return trim($text);
                }
            }

            Log::warning('WhatsAppBot: Gemini API response unsuccessful', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return $this->fallbackResponse($user, $message);

        } catch (\Exception $e) {
            Log::error('WhatsAppBot: AI processing error', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return $this->fallbackResponse($user, $message);
        }
    }

    /**
     * Build context string from user's tasks.
     */
    protected function buildUserContext(User $user): string
    {
        // 1. Pending Tasks
        $tasks = $user->tasks()
            ->where('is_completed', false)
            ->orderBy('due_date', 'asc')
            ->limit(10)
            ->get();
        
        // 2. Completed Tasks Today
        $completedToday = $user->tasks()
            ->where('is_completed', true)
            ->whereDate('updated_at', Carbon::today())
            ->get();

        $context = "TANGGAL HARI INI: " . $this->today() . "\n\n";

        if ($completedToday->isNotEmpty()) {
            $context .= "✅ SELESAI HARI INI (Kasih apresiasi!):\n";
            foreach ($completedToday as $task) {
                $context .= "- {$task->title}\n";
            }
            $context .= "\n";
        }

        if ($tasks->isEmpty()) {
            $context .= "📝 PENDING TASK: Tidak ada task pending. User bebas!\n";
        } else {
            $context .= "📝 PENDING TASK (Urut deadline):\n";
            foreach ($tasks as $i => $task) {
                $num = $i + 1;
                $due = $task->due_date ? Carbon::parse($task->due_date)->format('Y-m-d') : 'kapan aja';
                $notes = $task->notes ? "(Note: " . substr(strip_tags($task->notes), 0, 30) . "...)" : "";
                $context .= "{$num}. [{$task->priority}] {$task->title} (Deadline: {$due}) {$notes}\n";
            }
        }

        return $context;
    }

    /**
     * Fallback response when AI is unavailable.
     */
    protected function fallbackResponse(User $user, string $message): string
    {
        $lowerMsg = strtolower($message);

        // Simple keyword matching
        if (str_contains($lowerMsg, 'deadline') || str_contains($lowerMsg, 'besok') || str_contains($lowerMsg, 'hari ini')) {
            $tasks = $user->tasks()
                ->where('is_completed', false)
                ->whereBetween('due_date', [Carbon::today(), Carbon::today()->addDays(2)])
                ->orderBy('due_date', 'asc')
                ->get();

            if ($tasks->isEmpty()) {
                return "🎉 Tidak ada deadline dalam 2 hari ke depan. Santai dulu!\n\nGunakan /list untuk lihat semua task.";
            }

            $msg = "📅 *Task dengan deadline dekat:*\n\n";
            foreach ($tasks as $task) {
                $due = Carbon::parse($task->due_date)->format('d M Y');
                $msg .= "• {$task->title} — {$due}\n";
            }
            return $msg;
        }

        if (str_contains($lowerMsg, 'list') || str_contains($lowerMsg, 'tugas') || str_contains($lowerMsg, 'task')) {
            return $this->cmdList($user);
        }

        return "👋 Hai {$user->name}! Aku bot Sarang Tumbuh.\n\n"
            . "Kamu bisa tanya aku soal task-mu, atau gunakan command untuk manage task.\n\n"
            . "Ketik /help untuk melihat daftar command yang tersedia! 📋";
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    /**
     * Get a task by its display number (1-based index of pending tasks).
     */
    protected function getTaskByNumber(User $user, int $number): ?Task
    {
        $tasks = $user->tasks()
            ->where('is_completed', false)
            ->orderBy('due_date', 'asc')
            ->get();

        return $tasks->values()->get($number - 1);
    }

    protected function priorityEmoji(?string $priority): string
    {
        return match ($priority) {
            'Tinggi' => '🔴',
            'Sedang' => '🟡',
            'Rendah' => '🟢',
            default => '⚪',
        };
    }

    protected function statusLabel(?string $status): string
    {
        return match ($status) {
            'todo' => '📝 To Do',
            'in_progress' => '🔄 In Progress',
            'done' => '✅ Done',
            default => '📝 To Do',
        };
    }

    protected function determinePriority(?string $dueDate): string
    {
        if (!$dueDate) return 'Sedang';

        $daysUntil = Carbon::today()->diffInDays(Carbon::parse($dueDate), false);

        if ($daysUntil <= 1) return 'Tinggi';
        if ($daysUntil <= 3) return 'Sedang';
        return 'Rendah';
    }

    protected function today(): string
    {
        return Carbon::now()->format('Y-m-d H:i (l)');
    }
}
