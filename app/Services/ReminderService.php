<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ReminderService
{
    protected $whatsAppService;
    protected $habitService;
    protected $smartReminder;

    public function __construct(WhatsAppService $whatsAppService, HabitService $habitService, SmartReminderService $smartReminder)
    {
        $this->whatsAppService = $whatsAppService;
        $this->habitService = $habitService;
        $this->smartReminder = $smartReminder;
    }

    /**
     * Send context-aware reminders to the user.
     * Each task gets its own individual WhatsApp message for a personal assistant feel.
     */
    public function sendContextualReminder(User $user)
    {
        if (!$user->phone) {
            return;
        }

        if (!$user->canSendWhatsAppReminder()) {
            Log::info("WhatsApp reminder limit reached for user {$user->id} ({$user->name})");
            return;
        }

        $name = $user->name;
        $hour = Carbon::now()->hour;
        $sentCount = 0;
        $maxPerSession = 5; // Max messages per scheduled run to avoid spamming

        // ===================================================================
        // PRIORITY 1: DEADLINE TASKS (Due today / tomorrow) — 1 message each
        // ===================================================================
        $urgentTasks = $user->tasks()
            ->where('status', '!=', 'done')
            ->where('is_completed', false)
            ->whereBetween('due_date', [Carbon::today(), Carbon::today()->addDay()])
            ->orderBy('due_date', 'asc')
            ->get();

        foreach ($urgentTasks as $task) {
            if ($sentCount >= $maxPerSession || !$user->canSendWhatsAppReminder()) break;

            $dueDate = Carbon::parse($task->due_date);
            $isToday = $dueDate->isToday();
            $msg = $this->buildDeadlineMessage($name, $task, $isToday);

            $this->sendAndLog($user, $msg);
            $sentCount++;
            usleep(800000); // 800ms delay between messages for natural pacing
        }

        // ===================================================================
        // PRIORITY 2: UNTOUCHED TASKS (not worked on for 3+ days)
        // ===================================================================
        if ($sentCount < $maxPerSession) {
            $untouchedTasks = $this->smartReminder->getUntouchedTasks($user);
            foreach ($untouchedTasks->take(2) as $task) {
                if ($sentCount >= $maxPerSession || !$user->canSendWhatsAppReminder()) break;

                $days = $task->last_touched_at
                    ? $task->last_touched_at->diffInDays(now())
                    : now()->diffInDays($task->created_at);

                $msg = $this->buildUntouchedMessage($name, $task, $days);
                $this->sendAndLog($user, $msg);
                $sentCount++;
                usleep(800000);
            }
        }

        // ===================================================================
        // PRIORITY 3: RESUME YESTERDAY'S WORK (morning only)
        // ===================================================================
        if ($sentCount < $maxPerSession && $hour >= 8 && $hour <= 10) {
            $yesterdayTasks = $this->smartReminder->getYesterdayInProgressTasks($user);
            foreach ($yesterdayTasks->take(1) as $task) {
                if (!$user->canSendWhatsAppReminder()) break;

                $msg = $this->buildResumeMessage($name, $task);
                $this->sendAndLog($user, $msg);
                $sentCount++;
                usleep(800000);
            }
        }

        // ===================================================================
        // PRIORITY 4: PILE-UP ALERT (soft nudge, if >5 pending tasks)
        // ===================================================================
        if ($sentCount < $maxPerSession) {
            $piledUpTasks = $this->smartReminder->getPiledUpTasks($user);
            if ($piledUpTasks && !$user->canSendWhatsAppReminder() === false) {
                $count = $piledUpTasks->count();
                $easiest = $piledUpTasks->sortBy('priority')->first();
                $msg = $this->buildPileUpMessage($name, $count, $easiest);
                $this->sendAndLog($user, $msg);
                $sentCount++;
            }
        }

        // ===================================================================
        // PRIORITY 5: MOTIVATIONAL (only if nothing else was sent)
        // ===================================================================
        if ($sentCount === 0) {
            // Work invitation / Streak / Morning boost
            if ($this->smartReminder->shouldSendWorkInvitation($user)) {
                $this->sendAndLog($user, $this->buildWorkInvitationMessage($name, $hour));
            } elseif ($this->habitService->isPeakTime($user)) {
                $this->sendAndLog($user, $this->buildPeakTimeMessage($name, $user));
            } elseif ($hour >= 19 && $hour <= 22 && $user->current_streak > 0) {
                $todayActivity = $user->pomodoroSessions()->whereDate('created_at', Carbon::today())->count();
                if ($todayActivity === 0) {
                    $this->sendAndLog($user, $this->buildStreakMessage($name, $user->current_streak));
                }
            } elseif ($hour >= 8 && $hour <= 10) {
                $this->sendAndLog($user, $this->buildMorningMessage($name, $user));
            } else {
                $lastActive = $user->last_active_date ? Carbon::parse($user->last_active_date) : null;
                if ($lastActive && $lastActive->diffInDays(Carbon::today()) > 2) {
                    $this->sendAndLog($user, $this->buildComebackMessage($name, $user));
                }
            }
        }

        Log::info("Reminder session complete for {$user->name}: {$sentCount} message(s) sent.");
    }

    // =========================================================================
    // MESSAGE BUILDERS — Personal Secretary / Assistant Tone
    // =========================================================================

    private function buildDeadlineMessage(string $name, $task, bool $isToday): string
    {
        $title = $task->title;
        $priority = $task->priority ?? 'Sedang';

        if ($isToday) {
            $templates = [
                "Halo {$name} 👋\n\nIni pengingat dari aku — tugas *{$title}* deadlinenya *hari ini* ya.\n\nKalau butuh bantuan prioritas atau breakdown, tinggal bilang aja. Semangat! 💪",
                "Hi {$name}!\n\nJust a heads up: *{$title}* jatuh tempo *hari ini*.\n\nMau aku bantu atur strategi penyelesaiannya? Atau langsung gas aja? 🚀",
                "{$name}, reminder penting nih 📌\n\n*{$title}* — deadline hari ini.\nPrioritas: {$priority}\n\nFokus di tugas ini dulu ya. Kamu pasti bisa! ✨",
            ];
        } else {
            $templates = [
                "Selamat pagi {$name} ☀️\n\nBesok deadline untuk *{$title}*. Sudah sampai mana progressnya?\n\nKalau masih banyak, coba pecah jadi langkah-langkah kecil. Aku siap bantu! 😊",
                "Hi {$name}!\n\nReminder dari aku: *{$title}* deadlinenya *besok*.\n\nMasih ada waktu untuk finishing touch. Yuk diselesaikan mumpung masih segar 💡",
                "{$name}, jangan lupa ya 📋\n\n*{$title}* — besok sudah harus selesai.\nPrioritas: {$priority}\n\nMau mulai sekarang? Even 15 menit bisa bikin progress besar lho 🎯",
            ];
        }

        return $templates[array_rand($templates)];
    }

    private function buildUntouchedMessage(string $name, $task, int $days): string
    {
        $title = $task->title;
        $templates = [
            "Hi {$name} 👀\n\nAku perhatiin tugas *{$title}* sudah {$days} hari belum disentuh.\n\nKalau memang masih relevan, yuk mulai dari 5 menit aja. Kalau sudah nggak perlu, bisa di-archive biar list-nya bersih 🧹",
            "{$name}, boleh aku tanya? 🤔\n\nTugas *{$title}* belum ada progress sejak {$days} hari lalu.\n\nApa masih jadi prioritas? Atau mau aku bantu pecah jadi langkah yang lebih kecil supaya lebih gampang dimulai?",
            "Reminder halus dari aku, {$name} 💭\n\n*{$title}* sudah menunggu {$days} hari.\n\nKadang yang bikin susah mulai itu karena terasa berat. Coba mulai dari bagian terkecilnya dulu ya!",
        ];

        return $templates[array_rand($templates)];
    }

    private function buildResumeMessage(string $name, $task): string
    {
        $title = $task->title;
        $templates = [
            "Pagi {$name}! ☀️\n\nKemarin kamu lagi ngerjain *{$title}*.\n\nMau lanjut sekarang mumpung masih segar? Konsistensi itu kunci 🔑",
            "Good morning {$name}!\n\n*{$title}* masih terbuka dari kemarin. Tinggal lanjutin aja dari titik terakhir.\n\nAyo, momentum jangan sampai hilang! 🚀",
            "Selamat pagi! 🌅\n\n{$name}, *{$title}* nunggu kamu nih. Kemarin progress-nya udah bagus.\n\nLanjut sekarang? Aku yakin hari ini bisa selesai! 💪",
        ];

        return $templates[array_rand($templates)];
    }

    private function buildPileUpMessage(string $name, int $count, $easiestTask): string
    {
        $easyTitle = $easiestTask ? $easiestTask->title : 'tugas ringan';
        $templates = [
            "{$name}, aku notice ada {$count} tugas yang menumpuk 📚\n\nTips dari aku: mulai dari yang paling gampang dulu, misalnya *{$easyTitle}*.\n\nSetelah 1 selesai, yang lain akan terasa lebih ringan. Trust the process! ✨",
            "Hi {$name}!\n\nTodo list kamu sudah ada {$count} item belum selesai.\n\nDaripada overwhelmed, coba pick 1 yang bisa diselesaikan dalam 15 menit. *{$easyTitle}* kayaknya cocok sebagai quick win 🏆",
        ];

        return $templates[array_rand($templates)];
    }

    private function buildWorkInvitationMessage(string $name, int $hour): string
    {
        if ($hour >= 8 && $hour <= 10) {
            $templates = [
                "Pagi {$name}! ☀️\n\nBelum ada aktivitas hari ini. Yuk mulai dengan 1 sesi fokus — 25 menit aja.\n\nKamu akan surprised betapa banyak yang bisa dicapai! 🎯",
                "Good morning {$name}!\n\nHari baru, energi baru 💫 Mau mulai dari mana hari ini?\n\nCek task list kamu dan pilih 1 yang paling penting ya!",
            ];
        } else {
            $templates = [
                "Hi {$name}! 👋\n\nMasih ada waktu di sore ini untuk bikin progress.\n\nEven 1 small win hari ini bisa boost mood kamu besok. Mau coba? ⚡",
                "{$name}, sore yang produktif menanti 🌤\n\nBelum ada progress hari ini tapi masih ada waktu. Pick 1 task, crush it! 💪",
            ];
        }

        return $templates[array_rand($templates)];
    }

    private function buildPeakTimeMessage(string $name, User $user): string
    {
        $highTask = $user->tasks()
            ->where('status', '!=', 'done')
            ->where('priority', 'Tinggi')
            ->first();

        if ($highTask) {
            return "{$name}, ini jam produktif kamu biasanya ⚡\n\nPerfect timing untuk tackle *{$highTask->title}*.\n\nFokus 25 menit sekarang, hasilnya pasti terasa! 🔥";
        }

        return "{$name}, energi kamu biasanya puncak di jam segini ⚡\n\nMumpung lagi 'in the zone', yuk manfaatin buat progress! 💪";
    }

    private function buildStreakMessage(string $name, int $streak): string
    {
        $templates = [
            "{$name}, streak kamu sudah {$streak} hari! 🔥\n\nSayang banget kalau putus sekarang.\n\nCukup selesaikan 1 task ringan aja malam ini supaya streak terjaga 🏅",
            "Malam {$name}! 🌙\n\n{$streak} hari berturut-turut produktif — keren banget!\n\nJangan lupa cek off 1 task kecil hari ini ya. Consistency is key 🔑",
        ];

        return $templates[array_rand($templates)];
    }

    private function buildMorningMessage(string $name, User $user): string
    {
        $pendingCount = $user->tasks()->where('status', '!=', 'done')->where('is_completed', false)->count();

        if ($pendingCount > 0) {
            $templates = [
                "Selamat pagi {$name}! ☀️\n\n{$pendingCount} tugas menunggu hari ini.\n\nPilih 1 'boss task' yang paling penting dan selesaikan duluan. Sisanya akan mengikuti! 🚀",
                "Morning {$name}! 🌅\n\nFresh start hari ini. Ada {$pendingCount} task di list kamu.\n\nTips: mulai dari yang paling challenging — otak pagi hari paling tajam! 🧠✨",
            ];
        } else {
            $templates = [
                "Pagi {$name}! ☀️\n\nTodo list bersih! Perfect time untuk set goals baru.\n\nMau achieve apa hari ini? 🎯",
                "Good morning {$name}!\n\nSemua task selesai — hebat! 🎉\n\nHari ini waktunya bikin progress di hal baru. Apa yang ingin kamu kerjakan?",
            ];
        }

        return $templates[array_rand($templates)];
    }

    private function buildComebackMessage(string $name, User $user): string
    {
        $pendingCount = $user->tasks()->where('status', '!=', 'done')->where('is_completed', false)->count();

        $templates = [
            "Hai {$name}! Lama nggak keliatan nih 😊\n\nMasih ada {$pendingCount} tugas yang nunggu kamu.\n\nNo pressure ya — mulai kecil aja. Even 5 menit hari ini udah progress 💙",
            "{$name}, we miss you! 👋\n\n{$pendingCount} task masih sabar menunggu.\n\nKapanpun kamu siap, aku di sini buat bantu. Yuk mulai lagi pelan-pelan 🌱",
        ];

        return $templates[array_rand($templates)];
    }

    // =========================================================================
    // HELPER
    // =========================================================================

    private function sendAndLog(User $user, string $message): void
    {
        $result = $this->whatsAppService->sendReminder($user, $message, null, 'contextual_reminder');

        if (!empty($result['success'])) {
            Log::info("Reminder sent to {$user->id} ({$user->name}): " . mb_substr($message, 0, 80) . '...');
        }
    }
}
