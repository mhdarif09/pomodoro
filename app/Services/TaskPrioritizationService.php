<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class TaskPrioritizationService
{
    /**
     * Get top priority tasks for user
     */
    public function getTopPriorityTasks(User $user, int $limit = 3): Collection
    {
        return $user->tasks()
            ->where('is_completed', false)
            ->where('status', '!=', 'done')
            ->whereNull('is_archived')
            ->get()
            ->map(function ($task) {
                $task->priority_score = $this->calculatePriorityScore($task);
                return $task;
            })
            ->sortByDesc('priority_score')
            ->take($limit)
            ->values();
    }
    
    /**
     * Calculate weighted priority score (0-100)
     */
    public function calculatePriorityScore(Task $task): int
    {
        $urgencyScore = $this->getUrgencyScore($task);      // 40%
        $effortScore = $this->getEffortScore($task);        // 30%
        $priorityScore = $this->getUserPriorityScore($task); // 20%
        $ageScore = $this->getAgeScore($task);              // 10%
        
        return (int) (
            ($urgencyScore * 0.4) +
            ($effortScore * 0.3) +
            ($priorityScore * 0.2) +
            ($ageScore * 0.1)
        );
    }
    
    private function getUrgencyScore(Task $task): int
    {
        if (!$task->due_date) return 20;
        
        $hoursUntilDue = now()->diffInHours($task->due_date, false);
        
        if ($hoursUntilDue < 0) return 100;      // Overdue
        if ($hoursUntilDue < 4) return 95;       // <4 hours
        if ($hoursUntilDue < 24) return 80;      // <1 day
        if ($hoursUntilDue < 72) return 60;      // <3 days
        if ($hoursUntilDue < 168) return 40;     // <1 week
        
        return 20;
    }
    
    private function getEffortScore(Task $task): int
    {
        $complexity = $task->complexity_score ?? 3;
        $minutes = $task->estimated_minutes ?? 60;
        
        $effortValue = ($complexity * 10) + ($minutes / 10);
        return min(100, (int) $effortValue);
    }
    
    private function getUserPriorityScore(Task $task): int
    {
        return match($task->priority) {
            'Tinggi' => 100,
            'Sedang' => 50,
            'Rendah' => 25,
            default => 50
        };
    }
    
    private function getAgeScore(Task $task): int
    {
        if (!$task->created_at) return 20;
        
        $daysOld = $task->created_at->diffInDays(now());
        
        if ($daysOld > 14) return 80;
        if ($daysOld > 7) return 60;
        if ($daysOld > 3) return 40;
        
        return 20;
    }
    
    /**
     * Get human-readable reasoning for priority
     */
    public function getReasoningText(Task $task): string
    {
        $urgency = $this->getUrgencyScore($task);
        
        if ($urgency >= 95) {
            return "⚠️ Deadline dalam " . now()->diffForHumans($task->due_date, true) . "!";
        }
        if ($urgency >= 80) {
            return "⏰ Due " . $task->due_date->format('H:i') . " hari ini";
        }
        if (($task->complexity_score ?? 0) >= 7) {
            return "💪 Task kompleks, mulai sekarang";
        }
        if ($task->priority === 'Tinggi') {
            return "🔥 Prioritas tinggi";
        }
        
        return "🎯 Recommended task";
    }
}
