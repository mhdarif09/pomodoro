<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Collection;

class BossBattleService
{
    /**
     * Get active boss battles for the user.
     * A task is a "Boss" if it is High/Urgent priority AND not done.
     * 
     * @param User $user
     * @return Collection
     */
    public function getActiveBosses(User $user): Collection
    {
        $bosses = $user->tasks()
            ->with('subtasks')
            ->where('status', '!=', 'done')
            ->whereIn('priority', ['Tinggi', 'Mendesak', 'High', 'Urgent'])
            ->get()
            ->filter(function ($task) {
                // A boss must have estimated minutes > 240 (4 hours) OR have subtasks.
                // Simple logic: If it's hard, it's a boss.
                return $task->estimated_minutes >= 240 || $task->subtasks->count() > 0;
            });

        return $bosses->map(function ($task) {
            return $this->formatBossStats($task);
        });
    }

    /**
     * Calculate Boss Stats (Health, etc)
     */
    private function formatBossStats(Task $task): array
    {
        $totalSubtasks = $task->subtasks->count();
        
        // If no subtasks, logic is binary: 0% or 100%. 
        // But for a Boss, we usually want subtasks.
        // If no subtasks, maybe we can't show a health bar effectively.
        // Let's assume Health = 100% if no subtasks completed.
        
        if ($totalSubtasks === 0) {
             return [
                'id' => $task->id,
                'name' => $task->title,
                'health_percent' => 100,
                'status' => 'Full Health',
                'is_boss' => true
            ];
        }

        $completedSubtasks = $task->subtasks->where('is_completed', true)->count();
        $remainingSubtasks = $totalSubtasks - $completedSubtasks;
        
        // Health = Remaining / Total * 100
        $healthPercent = ($remainingSubtasks / $totalSubtasks) * 100;

        return [
            'id' => $task->id,
            'name' => $task->title,
            'health_percent' => round($healthPercent),
            'max_hp' => $totalSubtasks,
            'current_hp' => $remainingSubtasks,
            'status' => $this->getHealthStatus($healthPercent),
            'is_boss' => true
        ];
    }

    private function getHealthStatus(float $health): string
    {
        if ($health <= 20) return 'Critical 🩸';
        if ($health <= 50) return 'Weakened ⚠️';
        return 'Strong 💪';
    }
}
