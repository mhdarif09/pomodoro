<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;

class TaskRecoveryService
{
    /**
     * Detect if user is overwhelmed with tasks
     */
    public function detectOverwhelm(User $user): bool
    {
        $pendingCount = $user->tasks()->where('is_completed', false)->count();
        $daysInactive = $user->last_active_date 
            ? Carbon::parse($user->last_active_date)->diffInDays(now()) 
            : 0;
        
        return $pendingCount > 20 || $daysInactive > 7;
    }
    
    /**
     * Generate smart recovery plan
     */
    public function generateRecoveryPlan(User $user): array
    {
        $tasks = $user->tasks()
            ->where('is_completed', false)
            ->whereNull('is_archived')
            ->get();
        
        // Tasks to archive: old + low priority + no deadline
        $toArchive = $tasks->filter(function ($task) {
            return $task->created_at->lt(now()->subDays(30)) &&
                   $task->priority === 'Rendah' &&
                   !$task->due_date;
        });
        
        // Tasks to reschedule: medium priority, not urgent
        $toReschedule = $tasks->filter(function ($task) use ($toArchive) {
            return !$toArchive->contains($task) &&
                   $task->priority === 'Sedang' &&
                   (!$task->due_date || $task->due_date->gt(now()->addWeek()));
        });
        
        // Keep: high priority or urgent
        $toKeep = $tasks->reject(function ($task) use ($toArchive, $toReschedule) {
            return $toArchive->contains($task) || $toReschedule->contains($task);
        });
        
        return [
            'total_tasks' => $tasks->count(),
            'to_archive' => $toArchive->count(),
            'to_reschedule' => $toReschedule->count(),
            'to_keep' => $toKeep->count(),
            'archived_tasks' => $toArchive,
            'rescheduled_tasks' => $toReschedule,
            'kept_tasks' => $toKeep,
        ];
    }
    
    /**
     * Apply recovery plan to user's tasks
     */
    public function applyRecoveryPlan(User $user, array $plan): void
    {
        // Archive old low-priority tasks
        foreach ($plan['archived_tasks'] as $task) {
            $task->update(['is_archived' => true]);
        }
        
        // Reschedule to next week
        foreach ($plan['rescheduled_tasks'] as $task) {
            $task->update([
                'due_date' => now()->addWeek(),
                'status' => 'pending',
            ]);
        }
        
        // Record recovery history
        $user->taskRecoveryHistory()->create([
            'tasks_before_recovery' => $plan['total_tasks'],
            'tasks_archived' => $plan['to_archive'],
            'tasks_rescheduled' => $plan['to_reschedule'],
            'tasks_kept' => $plan['to_keep'],
            'recovery_details' => $plan,
        ]);
        
        $user->update(['last_recovery_date' => now()]);
    }
    
    /**
     * Check if user should be offered recovery
     */
    public function shouldOfferRecovery(User $user): bool
    {
        if (!$this->detectOverwhelm($user)) {
            return false;
        }
        
        // Don't offer too frequently (once per week)
        if ($user->last_recovery_date && $user->last_recovery_date->gt(now()->subWeek())) {
            return false;
        }
        
        return true;
    }
}
