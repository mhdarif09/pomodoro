<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PredictionService
{
    /**
     * Calculate probability (0-100) of completing all tasks due today.
     */
    public function calculateSuccessProbability(User $user): int
    {
        $velocity = $this->getVelocity($user);
        $tasksDueToday = $user->tasks()
            ->where('status', '!=', 'done')
            ->where('due_date', '<=', Carbon::today())
            ->count();

        if ($tasksDueToday === 0) {
            return 100;
        }

        if ($velocity === 0.0) {
            return 10; // Low confidence if no history
        }

        // Probability = (Velocity / Load) * 100
        // Cap at 100, but allow it to drop if Load > Velocity
        $probability = ($velocity / $tasksDueToday) * 100;

        return min(100, (int) $probability);
    }

    /**
     * Calculate user's average tasks completed per day (Velocity).
     * Based on last 14 days.
     */
    public function getVelocity(User $user): float
    {
        // Get count of completed tasks in last 14 days
        $completedTasks = $user->tasks()
            ->where('status', 'done')
            ->where('updated_at', '>=', Carbon::now()->subDays(14))
            ->count();

        // Avoid division by zero, assume at least 1 day active effectively
        $daysActive = 14; 
        
        // Simple average: Total Completed / 14 days
        // We could refine this to only count "active days", but simple avg is safer for "burnout" prediction.
        return $completedTasks / $daysActive;
    }
}
