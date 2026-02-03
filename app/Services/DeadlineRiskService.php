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
        $this->user = $user;
        
        // Get tasks due within next 48 hours that are not completed
        $urgentTasks = Task::where('user_id', $user->id)
            ->where('is_completed', false)
            ->whereNotNull('due_date')
            ->where('due_date', '<=', now()->addHours(48))
            ->get();

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
        $subtaskCount = $task->subtasks()->where('is_completed', false)->count();
        
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
