<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use App\Services\WhatsAppAIService;

class SmartReminderService
{
    /**
     * Get tasks that haven't been touched for X days
     */
    public function getUntouchedTasks(User $user, int $days = 3): Collection
    {
        return $user->tasks()
            ->where('status', '!=', 'done')
            ->where('is_completed', false)
            ->whereNotNull('created_at')
            ->get()
            ->filter(function ($task) use ($days) {
                return $task->isUntouched($days);
            });
    }

    /**
     * Check if user has too many pending tasks (pile-up detection)
     */
    public function getPiledUpTasks(User $user, int $threshold = 5): ?Collection
    {
        $pendingTasks = $user->tasks()
            ->where('status', '!=', 'done')
            ->where('is_completed', false)
            ->get();

        if ($pendingTasks->count() > $threshold) {
            return $pendingTasks;
        }

        return null;
    }

    /**
     * Get tasks that were in-progress yesterday
     */
    public function getYesterdayInProgressTasks(User $user): Collection
    {
        return $user->tasks()
            ->where('status', 'in_progress')
            ->where('is_completed', false)
            ->whereDate('updated_at', '<', Carbon::today())
            ->get();
    }

    /**
     * Check if it's a good time to send work invitation
     */
    public function shouldSendWorkInvitation(User $user): bool
    {
        $hour = Carbon::now()->hour;
        
        // Morning invitation (8-10 AM) or afternoon productive time (14-16)
        if (($hour >= 8 && $hour <= 10) || ($hour >= 14 && $hour <= 16)) {
            // Check if user hasn't been active today
            $todayActivity = $user->pomodoroSessions()
                ->whereDate('created_at', Carbon::today())
                ->count();
                
            return $todayActivity === 0;
        }
        
        return false;
    }

    /**
     * Generate contextual message based on reminder type
     */
    protected $aiService;

    public function __construct(WhatsAppAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Generate contextual message based on reminder type
     */
    public function generateSmartMessage(User $user, string $type, $data = null): string
    {
        $name = $user->name;
        
        // Use AI for specific types if data (Task/Tasks) is available
        if (($type === 'untouched' || $type === 'resume_work') && $data instanceof Collection && $data->isNotEmpty()) {
            return $this->aiService->generateSmartReminder($user, $data->first());
        }

        switch ($type) {
            case 'untouched': // Fallback if no AI or error
                return $this->getUntouchedMessage($name, $data);
                
            case 'pile_up':
                return $this->getPileUpMessage($name, $data);
                
            case 'resume_work': // Fallback
                return $this->getResumeWorkMessage($name, $data);
                
            case 'work_invitation':
                return $this->getWorkInvitationMessage($name);
                
            default:
                return "Halo {$name}, produktif yuk!";
        }
    }

    /**
     * Generate message for untouched tasks
     */
    private function getUntouchedMessage(string $name, Collection $tasks): string
    {
        $task = $tasks->first();
        $days = $task->last_touched_at 
                ? $task->last_touched_at->diffInDays(now()) 
                : now()->diffInDays($task->created_at);
        
        $messages = [
            "Hey {$name}! '{$task->title}' belum disentuh {$days} hari nih 🤔 Mau mulai 5 menit aja?",
            "Psst {$name}... '{$task->title}' masih nunggu kamu dari {$days} hari lalu 👀 Quick check?",
            "{$name}, '{$task->title}' udah {$days} hari nganggur. Yuk kasih perhatian dikit! 💪",
        ];
        
        return $messages[array_rand($messages)];
    }

    /**
     * Generate message for task pile-up
     */
    private function getPileUpMessage(string $name, Collection $tasks): string
    {
        $count = $tasks->count();
        
        $messages = [
            "{$name}, {$count} tasks numpuk nih 😅 Pilih 1 yang paling gampang buat quick win!",
            "Woah {$count} pending tasks! Mau bikin progress kecil di 1 task dulu, {$name}?",
            "Todo list kamu udah ada {$count} items 📝 Pick one, crush it, feel good! 🚀",
        ];
        
        return $messages[array_rand($messages)];
    }

    /**
     * Generate message for resuming yesterday's work
     */
    private function getResumeWorkMessage(string $name, Collection $tasks): string
    {
        $task = $tasks->first();
        
        $messages = [
            "Pagi {$name}! Kemarin kamu lagi ngerjain '{$task->title}'. Lanjut sekarang? 🔥",
            "Continue where you left off? '{$task->title}' tinggal dikit lagi! 🚀",
            "Good morning! '{$task->title}' dari kemarin nunggu finishing touch nih 😊",
        ];
        
        return $messages[array_rand($messages)];
    }

    /**
     * Generate work invitation message
     */
    private function getWorkInvitationMessage(string $name): string
    {
        $hour = Carbon::now()->hour;
        
        if ($hour >= 8 && $hour <= 10) {
            $messages = [
                "Pagi {$name}! ☀️ Ready untuk productive day? Mau mulai dari mana?",
                "Good morning! Fresh mind = perfect time buat tackle task terberat. Yuk {$name}! 💪",
                "Morning vibes {$name}! Pilih 1 task paling menantang buat kickstart hari ini 🚀",
            ];
        } else {
            $messages = [
                "Afternoon {$name}! Energi masih bagus nih. Mau produktif sebentar? ⚡",
                "Hey {$name}! Perfect time buat satu quick win. Pick a task! 💪",
                "Sore! Masih ada waktu buat progress {$name}. Yuk mulai! 🔥",
            ];
        }
        
        return $messages[array_rand($messages)];
    }
}
