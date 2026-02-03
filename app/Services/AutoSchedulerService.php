<?php

namespace App\Services;

use App\Models\User;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AutoSchedulerService
{
    /**
     * Analyze current load and suggest a rescue plan.
     * Returns array with 'type', 'message', and localized properties.
     * 
     * @param User $user
     * @return array|null Null if no rescue needed.
     */
    public function suggestRescuePlan(User $user): ?array
    {
        $today = Carbon::today();
        
        // 1. Check for Heavy Task (> 90 mins)
        $heavyTask = $user->tasks()
            ->where('status', '!=', 'done')
            ->where('due_date', '>=', $today)
            ->where('estimated_minutes', '>', 90)
            ->first();

        if ($heavyTask) {
            return [
                'type' => 'breakdown',
                'task_id' => $heavyTask->id,
                'task_title' => $heavyTask->title,
                'message' => "Tugas '{$heavyTask->title}' cukup berat. Mau Agent bantu pecah jadi langkah-langkah kecil?",
                'action_label' => "Bagi Jadi Subtask"
            ];
        }

        // 2. Check for Overload (> 5 tasks)
        $overloaded = $this->isOverloaded($user);
        
        if ($overloaded) {
             // Strategy: Move all "low" or "medium" priority tasks due today/overdue to tomorrow.
            $tasksToMove = $user->tasks()
                ->where('status', '!=', 'done')
                ->where('due_date', '<=', Carbon::today())
                ->whereIn('priority', ['Rendah', 'Sedang']) // Low/Medium
                ->get();
                
            if ($tasksToMove->isNotEmpty()) {
                return [
                    'type' => 'reschedule',
                    'tasks_count' => $tasksToMove->count(),
                    'task_ids' => $tasksToMove->pluck('id')->toArray(),
                    'target_date' => Carbon::tomorrow()->toDateString(),
                    'message' => "Ada {$tasksToMove->count()} tugas yang bisa ditunda. Geser ke besok supaya lebih santai?",
                    'action_label' => "Geser Jadwal"
                ];
            }
        }
        
        // 3. Late Start Check (If > 3 PM and remaining work > 2 hours)
        if (now()->hour >= 15) {
             $remainingMinutes = $user->tasks()
                ->where('status', '!=', 'done')
                ->where('due_date', '<=', $today)
                ->sum('estimated_minutes');

             if ($remainingMinutes > 120) {
                 return [
                     'type' => 'late_start',
                     'message' => "Sudah sore tapi masih banyak tugas. Pilih 1 prioritas utama saja untuk diselesaikan hari ini?",
                     'action_label' => "Lihat Prioritas"
                 ];
             }
        }

        return null;
    }

    /**
     * Apply the reschedule plan.
     */
    public function applyReschedule(User $user, array $taskIds, string $newDate): int
    {
        return $user->tasks()
            ->whereIn('id', $taskIds)
            ->update([
                'due_date' => $newDate,
                'auto_rescheduled_count' => DB::raw('auto_rescheduled_count + 1')
            ]);
    }

    private function isOverloaded(User $user): bool
    {
        // Simple logic: If > 5 tasks due today, consider overloaded.
        // In future, link this to PredictionService capability.
        $count = $user->tasks()
            ->where('status', '!=', 'done')
            ->where('due_date', '<=', Carbon::today())
            ->count();
            
        return $count > 5;
    }
}
