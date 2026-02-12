<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class DeadlineRiskService
{
    protected $user;
    protected $tasks;

    /**
     * Detect risks for a specific user
     */
    public function detectRisks(User $user)
    {
        set_time_limit(0);
        $this->user = $user;
        
        // If tasks are already loaded (from DashboardController), use the collection to filter
        // Otherwise, query efficiently as fallback.
        if ($user->relationLoaded('tasks')) {
            $urgentTasks = $user->tasks->where('is_completed', false)
                ->whereNotNull('due_date')
                ->filter(function($task) {
                    return $task->due_date->lte(now()->addHours(48));
                });
            // Note: withCount won't work on collection, we'll rely on pre-loaded subtasks
            // DashboardController currently loads 'subtasks'
        } else {
            $urgentTasks = $user->tasks()
                ->where('is_completed', false)
                ->whereNotNull('due_date')
                ->where('due_date', '<=', now()->addHours(48))
                ->withCount(['subtasks' => function($query) {
                    $query->where('is_completed', false);
                }])
                ->get();
        }

        $risks = [];

        foreach ($urgentTasks as $task) {
            $risk = $this->analyzeTaskRisk($task);
            if ($risk) {
                $risks[] = $risk;
            }
        }

        return $risks;
    }

    /**
     * Analyze a single task for deadline risk
     */
    public function analyzeTaskRisk(Task $task)
    {
        // 1. Calculate Time Remaining (in hours)
        $dueDate = Carbon::parse($task->due_date);
        $now = now();
        $hoursRemaining = $now->diffInHours($dueDate, false);
        
        if ($hoursRemaining < 0) return null; // Already overdue

        // 2. Estimate Workload Remaining
        // Use estimated_minutes or subtasks count as proxy
        $estimatedMinutes = $task->estimated_minutes ?? 60; // Default 1 hour
        $subtaskCount = $task->subtasks_count ?? 0;
        
        // Adjust estimate if subtasks exist (e.g., 30 mins per subtask)
        if ($subtaskCount > 0) {
            $estimatedMinutes = max($estimatedMinutes, $subtaskCount * 30);
        }

        // 3. User Velocity (Pattern)
        // Check recent productivity (avg min / day) from Pomodoro sessions
        // For simple logic now: assume 4 hours productive time per day remaining
        $dailyCapacityMinutes = 4 * 60; 
        
        // 4. Risk Calculation
        $workloadHours = $estimatedMinutes / 60;
        
        // Risk Factors
        $isTightSchedule = $workloadHours > ($hoursRemaining * 0.5); // Work takes > 50% of remaining total time
        $isComplex = ($task->complexity_score ?? 1) >= 7;
        
        if ($isTightSchedule || ($isComplex && $hoursRemaining < 24)) {
            return [
                'task_id' => $task->id,
                'task_title' => $task->title,
                'risk_level' => $isTightSchedule ? 'high' : 'medium',
                'reason' => $isTightSchedule 
                    ? "Workload ({$estimatedMinutes}m) is tight for remaining time ({$hoursRemaining}h)" 
                    : "Complex task due soon",
                'suggestion' => $this->generateSuggestion($task, $estimatedMinutes, $hoursRemaining)
            ];
        }

        return null;
    }

    private function generateSuggestion(Task $task, $estimatedMinutes, $hoursRemaining)
    {
        if ($hoursRemaining < 4) {
             return "Kalau progress sekarang lanjut, tugas ini bisa telat. Mau mulai sedikit sekarang?";
        }
        
        if ($estimatedMinutes > 120) {
            return "Tugas ini cukup besar. Coba pecah jadi subtask kecil biar ga berat?";
        }

        return "Deadline makin dekat. Yuk cicil 25 menit sekarang!";
    }
}
