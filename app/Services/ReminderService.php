<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ReminderService
{
    protected $fonnteService;
    protected $habitService;
    protected $smartReminder;

    public function __construct(FonnteService $fonnteService, HabitService $habitService, SmartReminderService $smartReminder)
    {
        $this->fonnteService = $fonnteService;
        $this->habitService = $habitService;
        $this->smartReminder = $smartReminder;
    }

    /**
     * Send a context-aware reminder to the user based on their todolist.
     */
    public function sendContextualReminder(User $user)
    {
        if (!$user->phone) {
            return;
        }

        // Check if user can send more WhatsApp reminders
        if (!$user->canSendWhatsAppReminder()) {
            Log::info("WhatsApp reminder limit reached for user {$user->id} ({$user->name})");
            return;
        }

        $message = $this->determineMessage($user);

        if ($message) {
            $this->fonnteService->sendMessage($user->phone, $message);
            
            // Track reminder sent
            $user->incrementWhatsAppReminderCount();
            
            Log::info("Reminder sent to {$user->id}: {$message}");
        }
    }

    /**
     * Determine the best reminder message based on user's tasks and context.
     */
    private function determineMessage(User $user): ?string
    {
        $hour = Carbon::now()->hour;

        // Priority 1: UNTOUCHED TASKS (high priority, not started for 3+ days)
        $untouchedTasks = $this->smartReminder->getUntouchedTasks($user);
        if ($untouchedTasks->isNotEmpty()) {
            return $this->smartReminder->generateSmartMessage($user, 'untouched', $untouchedTasks);
        }

        // Priority 2: TASK PILE-UP (too many pending tasks)
        $piledUpTasks = $this->smartReminder->getPiledUpTasks($user);
        if ($piledUpTasks) {
            return $this->smartReminder->generateSmartMessage($user, 'pile_up', $piledUpTasks);
        }

        // Priority 3: DEADLINE REMINDER (Tasks due today/tomorrow)
        $urgentTasks = $user->tasks()
            ->where('status', '!=', 'done')
            ->whereBetween('due_date', [Carbon::today(), Carbon::today()->addDay()])
            ->get();

        if ($urgentTasks->isNotEmpty()) {
            return $this->getDeadlineReminder($user, $urgentTasks);
        }

        // Priority 4: RESUME YESTERDAY'S WORK (morning only)
        if ($hour >= 8 && $hour <= 10) {
            $yesterdayTasks = $this->smartReminder->getYesterdayInProgressTasks($user);
            if ($yesterdayTasks->isNotEmpty()) {
                return $this->smartReminder->generateSmartMessage($user, 'resume_work', $yesterdayTasks);
            }
        }

        // Priority 5: WORK INVITATION (peak time, no activity today)
        if ($this->smartReminder->shouldSendWorkInvitation($user)) {
            return $this->smartReminder->generateSmartMessage($user, 'work_invitation');
        }

        // Priority 6: STUDY REMINDER (Peak productivity time)
        if ($this->habitService->isPeakTime($user)) {
            return $this->getStudyReminder($user);
        }

        // Priority 7: COMEBACK REMINDER (Inactive for a while)
        $lastActiveDate = $user->last_active_date ? Carbon::parse($user->last_active_date) : null;
        if ($lastActiveDate && $lastActiveDate->diffInDays(Carbon::today()) > 2) {
            return $this->getComebackReminder($user);
        }

        // Priority 8: HABIT REMINDER (Streak maintenance - evening)
        if ($hour >= 19 && $hour <= 22) {
            $todayActivity = $user->pomodoroSessions()
                ->whereDate('created_at', Carbon::today())
                ->count();
            
            if ($todayActivity === 0 && $user->current_streak > 0) {
                return $this->getHabitReminder($user);
            }
        }

        // Priority 9: MOTIVATION REMINDER (Morning boost)
        if ($hour >= 8 && $hour <= 10) {
            return $this->getMotivationReminder($user);
        }

        return null;
    }

    /**
     * Deadline reminder for tasks due soon
     */
    private function getDeadlineReminder(User $user, $tasks): string
    {
        $count = $tasks->count();
        $taskTitles = $tasks->take(2)->pluck('title')->implode(', ');
        
        $messages = [
            "Hey {$user->name} 👋, {$count} tugas deadline-nya mepet nih: {$taskTitles}. Yuk mulai sebentar aja!",
            "Deadline alert! {$taskTitles} udah dekat. 15 menit sekarang = less stress nanti 😊",
            "{$user->name}, FYI: {$count} task butuh perhatian. Cek {$taskTitles} dulu yuk!",
        ];

        return $messages[array_rand($messages)];
    }

    /**
     * Study reminder during peak productivity time
     */
    private function getStudyReminder(User $user): string
    {
        $incompleteTasks = $user->tasks()
            ->where('status', '!=', 'done')
            ->where('priority', 'Tinggi')
            ->first();

        if ($incompleteTasks) {
            $messages = [
                "Perfect timing! Biasanya kamu produktif jam segini 🔥. Mau tackle '{$incompleteTasks->title}' sekarang?",
                "Peak time detected! Energi lagi bagus nih. Cocok buat selesain '{$incompleteTasks->title}' 💪",
                "Jam produktif mu! Mumpung fokus, yuk kerjain '{$incompleteTasks->title}' 🚀",
            ];
        } else {
            $messages = [
                "Biasanya jam segini kamu on fire! Mau mulai satu task kecil? 🔥",
                "Peak energy time! Momentum bagus buat produktif nih 💪",
            ];
        }

        return $messages[array_rand($messages)];
    }

    /**
     * Comeback reminder for inactive users
     */
    private function getComebackReminder(User $user): string
    {
        $pendingCount = $user->tasks()->where('status', '!=', 'done')->count();
        
        $messages = [
            "Kangen! Udah {$pendingCount} tasks nunggu kamu balik. No rush, tapi jangan lupa ya 🙌",
            "Long time no see, {$user->name}! Task list masih sabar nunggu. Mau mulai lagi? 😊",
            "Halo! Miss you di app. {$pendingCount} tugas ready whenever you are 💙",
        ];

        return $messages[array_rand($messages)];
    }

    /**
     * Habit reminder to maintain streak
     */
    private function getHabitReminder(User $user): string
    {
        $streak = $user->current_streak;
        
        $messages = [
            "Streak {$streak} hari loh! Sayang banget kalau putus. 10 menit aja cek off satu task? 🔥",
            "{$user->name}, jangan sampai streak {$streak} hari hilang ya. Quick win: selesaiin 1 task ringan!",
            "Reminder malam: {$streak}-day streak kamu keren! Keep it alive dengan satu small task 🌙",
        ];

        return $messages[array_rand($messages)];
    }

    /**
     * Motivation reminder for morning boost
     */
    private function getMotivationReminder(User $user): string
    {
        $todayTasks = $user->tasks()
            ->where('status', '!=', 'done')
            ->whereDate('due_date', '>=', Carbon::today())
            ->count();

        if ($todayTasks > 0) {
            $messages = [
                "Good morning {$user->name}! ☀️ {$todayTasks} tasks waiting. Pick one 'boss task' to crush first!",
                "Pagi! Fresh start, fresh energy. Pilih 1 task paling menantang untuk ditaklukkan dulu yuk 💪",
                "Morning vibes! {$todayTasks} missions hari ini. Mana yang mau kamu selesaikan duluan? 🚀",
            ];
        } else {
            $messages = [
                "Pagi {$user->name}! Todo list kosong = perfect. Time to set goals hari ini! ☀️",
                "Morning! No pending tasks = good sign. Mau bikin progress apa hari ini? 🎯",
            ];
        }

        return $messages[array_rand($messages)];
    }
}
