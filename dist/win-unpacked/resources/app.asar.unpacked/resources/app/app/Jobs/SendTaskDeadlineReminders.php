<?php

namespace App\Jobs;

use App\Models\Task;
use App\Services\FonnteService;
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
    public function handle(FonnteService $fonnteService): void
    {
        // If specific task provided (instant notification)
        if ($this->task) {
            $this->sendNotification($this->task, $fonnteService, 'instant');
            return;
        }

        // Otherwise, process all tasks with deadline tomorrow (scheduled)
        $this->processScheduledReminders($fonnteService);
    }

    /**
     * Process scheduled reminders for all users
     */
    private function processScheduledReminders(FonnteService $fonnteService): void
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
                $this->sendNotification($task, $fonnteService, 'scheduled');
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
    private function sendNotification(Task $task, FonnteService $fonnteService, string $type): void
    {
        // Skip if user doesn't have a phone number
        if (!$task->user || !$task->user->phone) {
            Log::warning('User has no phone number, skipping reminder', [
                'task_id' => $task->id,
                'user_id' => $task->user_id,
            ]);
            return;
        }

        // Get user timezone
        $timezone = $this->getTimezoneString($task->user->timezone ?? 'WIB');
        $timezoneCode = $task->user->timezone ?? 'WIB';

        // Format the message based on type
        $dueDate = Carbon::parse($task->due_date)->format('d M Y');
        
        if ($type === 'instant') {
            // Instant notification when task created
            $message = "🔔 *Task Baru dengan Deadline Besok!*\n\n";
            $message .= "Halo {$task->user->name}! 👋\n\n";
            $message .= "Task: *\"{$task->title}\"*\n";
            $message .= "Due Date: {$dueDate} 23:59 {$timezoneCode}\n";
            $message .= "Priority: {$task->priority}\n\n";
            $message .= "Jangan lupa diselesaikan ya! 😊\n\n";
            $message .= "Semangat! 💪";
        } else {
            // Scheduled notification at 23:00
            $message = "⏰ *Reminder: 1 Jam Lagi Deadline!*\n\n";
            $message .= "Halo {$task->user->name}! 👋\n\n";
            $message .= "Task: *\"{$task->title}\"*\n";
            $message .= "Due Date: Besok, {$dueDate} 23:59 {$timezoneCode}\n";
            $message .= "Priority: {$task->priority}\n\n";
            $message .= "Tinggal 1 jam lagi sebelum hari deadline! ⏳\n\n";
            $message .= "Semangat menyelesaikannya! 💪";
        }

        // Send WhatsApp notification
        $result = $fonnteService->sendMessage($task->user->phone, $message);

        if ($result['success']) {
            Log::info("Deadline reminder sent successfully ({$type})", [
                'task_id' => $task->id,
                'user_id' => $task->user_id,
                'phone' => $task->user->phone,
                'type' => $type,
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
