<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Collection;

class AntiOverplanningService
{
    /**
     * Check if user can add new daily focus task
     */
    public function canAddNewTask(User $user): bool
    {
        if (!$user->anti_overplanning_enabled) {
            return true;
        }
        
        $todayFocusCount = $user->tasks()
            ->where('is_daily_focus', true)
            ->whereDate('focus_date', today())
            ->count();
            
        return $todayFocusCount < $user->daily_task_limit;
    }
    
    /**
     * Get today's daily focus tasks
     */
    public function getDailyFocusTasks(User $user): Collection
    {
        return $user->tasks()
            ->where('is_daily_focus', true)
            ->whereDate('focus_date', today())
            ->where('is_completed', false)
            ->orderBy('priority_score', 'desc')
            ->get();
    }
    
    /**
     * Set task as daily focus
     */
    public function setDailyFocus(Task $task, bool $focus = true): void
    {
        $task->update([
            'is_daily_focus' => $focus,
            'focus_date' => $focus ? today() : null,
        ]);
    }
    
    /**
     * Move task to tomorrow
     */
    public function moveToTomorrow(Task $task): void
    {
        $task->update([
            'is_daily_focus' => false,
            'focus_date' => null,
            'due_date' => $task->due_date ? $task->due_date->addDay() : tomorrow(),
        ]);
    }
    
    /**
     * Get remaining daily focus slots
     */
    public function getRemainingSlots(User $user): int
    {
        $used = $user->tasks()
            ->where('is_daily_focus', true)
            ->whereDate('focus_date', today())
            ->count();
            
        return max(0, $user->daily_task_limit - $used);
    }
    
    /**
     * Get daily focus stats
     */
    public function getDailyStats(User $user): array
    {
        $tasks = $this->getDailyFocusTasks($user);
        $completed = $tasks->where('is_completed', true)->count();
        $total = $tasks->count();
        
        return [
            'current' => $total,
            'limit' => $user->daily_task_limit,
            'remaining' => $this->getRemainingSlots($user),
            'completed' => $completed,
            'progress_percentage' => $total > 0 ? (int) (($completed / $total) * 100) : 0,
        ];
    }
}
