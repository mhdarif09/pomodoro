<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ReminderService
{
    protected $fonnteService;
    protected $habitService;

    public function __construct(FonnteService $fonnteService, HabitService $habitService)
    {
        $this->fonnteService = $fonnteService;
        $this->habitService = $habitService;
    }

    /**
     * Send a context-aware reminder to the user if applicable.
     */
    public function sendContextualReminder(User $user)
    {
        if (!$user->phone) {
            return;
        }

        // Avoid spam: Check if we sent a message recently (e.g., last 24 hours)
        // For MVP, we'll assume the Command scheduler handles frequency (e.g., runs once a day)
        
        $message = $this->determineMessage($user);

        if ($message) {
            $this->fonnteService->sendMessage($user->phone, $message);
            Log::info("Contextual reminder sent to {$user->id}: {$message}");
        }
    }

    /**
     * Logic to determine the best message for right now.
     */
    private function determineMessage(User $user): ?string
    {
        $hour = Carbon::now()->hour;

        // 1. Deadline Check (Most Important)
        $urgentTasks = $user->tasks()
            ->where('status', '!=', 'done')
            ->whereBetween('due_date', [Carbon::today(), Carbon::today()->addDay()])
            ->count();

        if ($urgentTasks > 0) {
            return "Hey {$user->name} 👋. Just a friendly nudge: You have {$urgentTasks} tasks due soon. Even 15 minutes now will save you a headache later. You got this!";
        }

        // 2. Peak Time Check (If it's currently their peak time)
        if ($this->habitService->isPeakTime($user)) {
             return "Psst, usually you're on fire at this time 🔥. Want to use this energy to clear one small task?";
        }

        // 3. Streak Check (Late evening, distinct from deadline)
        if ($hour >= 20 && !$user->last_active_date) { // Simplified check for "active today"
             return "Long day? 🌙 Just a quick check-in. Don't let your {$user->current_streak}-day streak break. Even checking one box counts!";
        }
        
        // 4. General Motivation (Morning)
        if ($hour >= 8 && $hour <= 10) {
            return "Good morning {$user->name}! ☀️ Ready to conquer the day? Pick one 'Boss Task' to crush first.";
        }

        return null; // No message needed right now
    }
}
