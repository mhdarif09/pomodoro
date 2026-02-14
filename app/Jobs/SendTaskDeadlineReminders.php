<?php

namespace App\Jobs;

use App\Models\Task;
use App\Services\FonnteService;
use App\Services\ReminderMessageService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendTaskDeadlineReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $task;
    protected $type;

    /**
     * Create a new job instance.
     */
    public function __construct($task = null, $type = 'scheduled')
    {
        $this->task = $task;
        $this->type = $type; // 'instant' or 'scheduled'
    }

    /**
     * Execute the job.
     */
    public function handle(FonnteService $fonnteService, ReminderMessageService $reminderService): void
    {
        // If specific task provided (instant notification)
        if ($this->task) {
            $this->sendNotification($this->task, $fonnteService, $reminderService, 'instant');
            return;
        }

        // Otherwise, process all tasks with deadline tomorrow (scheduled)
        $this->processScheduledReminders($fonnteService, $reminderService);
    }

    /**
     * Process scheduled reminders for all users
     */
    private function processScheduledReminders(FonnteService $fonnteService, ReminderMessageService $reminderService): void
    {
        // Get tomorrow's date
        $tomorrow = Carbon::tomorrow()->format('Y-m-d');

        // Find all tasks with deadline tomorrow and not completed
        $tasks = Task::with(['user.subscription']) // Eager load subscription for efficiency
            ->whereDate('due_date', $tomorrow)
            ->where('is_completed', false)
            ->get();

        Log::info('Checking tasks for deadline reminders', [
            'tomorrow' => $tomorrow,
            'tasks_found' => $tasks->count(),
        ]);

        // Group tasks by user to apply limits
        $tasksByUser = $tasks->groupBy('user_id');

        foreach ($tasksByUser as $userId => $userTasks) {
            $user = $userTasks->first()->user;
            
            if (!$user) continue;

            // Determine limit based on premium status
            $limit = $user->is_premium ? PHP_INT_MAX : 3;
            
            // Take only the allowed number of tasks
            $tasksToSend = $userTasks->take($limit);

            foreach ($tasksToSend as $task) {
                $this->sendNotification($task, $fonnteService, $reminderService, 'scheduled');
            }

            // Log if some tasks were skipped due to limit
            if ($userTasks->count() > $limit) {
                Log::info('Skipped reminders for free user', [
                    'user_id' => $userId,
                    'total_tasks' => $userTasks->count(),
                    'sent' => $limit,
                    'skipped' => $userTasks->count() - $limit
                ]);
            }
        }

        Log::info('Deadline reminders job completed', [
            'tasks_processed' => $tasks->count(),
        ]);
    }

    /**
     * Send notification for a specific task
     */
    private function sendNotification(Task $task, FonnteService $fonnteService, ReminderMessageService $reminderService, string $type): void
    {
        // Skip if user doesn't have a phone number
        if (!$task->user || !$task->user->phone) {
            Log::warning('User has no phone number, skipping reminder', [
                'task_id' => $task->id,
                'user_id' => $task->user_id,
            ]);
            return;
        }

        // Generate friendly message using ReminderMessageService
        $user = $task->user;
        
        // Try AI personalization for premium users first
        if ($user->is_premium) {
            $message = $reminderService->generateAIPersonalizedMessage($task, $user);
        }
        
        // Fallback to friendly template-based message
        if (empty($message)) {
            $message = $reminderService->generateFriendlyReminder($task, $type);
        }

        // Send WhatsApp notification
        $result = $fonnteService->sendReminder($user, $message);

        // Check for limit reached
        if (isset($result['limit_reached']) && $result['limit_reached']) {
            Log::warning('Deadline reminder limit reached', [
                'user_id' => $user->id,
                'task_id' => $task->id
            ]);
            return;
        }

        if ($result['success']) {
            Log::info("Deadline reminder sent successfully ({$type})", [
                'task_id' => $task->id,
                'user_id' => $task->user_id,
                'phone' => $task->user->phone,
                'type' => $type,
                'used_ai' => $user->is_premium
            ]);
        } else {
            Log::error("Failed to send deadline reminder ({$type})", [
                'task_id' => $task->id,
                'user_id' => $task->user_id,
                'phone' => $task->user->phone,
                'type' => $type,
                'error' => $result['error'] ?? $result['data'] ?? 'Unknown error',
            ]);
        }
    }

    /**
     * Get PHP timezone string from Indonesian timezone code
     */
    private function getTimezoneString($timezone)
    {
        $timezones = [
            'WIB' => 'Asia/Jakarta',      // UTC+7
            'WITA' => 'Asia/Makassar',    // UTC+8
            'WIT' => 'Asia/Jayapura',     // UTC+9
        ];

        return $timezones[$timezone] ?? 'Asia/Jakarta';
    }
}
