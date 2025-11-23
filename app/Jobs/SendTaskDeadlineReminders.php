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

    /**
     * Execute the job.
     */
    public function handle(FonnteService $fonnteService): void
    {
        // Get tomorrow's date
        $tomorrow = Carbon::tomorrow()->format('Y-m-d');

        // Find all tasks with deadline tomorrow and not completed
        $tasks = Task::with('user')
            ->whereDate('due_date', $tomorrow)
            ->where('is_completed', false)
            ->get();

        Log::info('Checking tasks for deadline reminders', [
            'tomorrow' => $tomorrow,
            'tasks_found' => $tasks->count(),
        ]);

        foreach ($tasks as $task) {
            // Skip if user doesn't have a phone number
            if (!$task->user || !$task->user->phone) {
                Log::warning('User has no phone number, skipping reminder', [
                    'task_id' => $task->id,
                    'user_id' => $task->user_id,
                ]);
                continue;
            }

            // Format the message
            $dueDate = Carbon::parse($task->due_date)->format('d M Y');
            $message = "🔔 *Reminder Task Deadline*\n\n";
            $message .= "Halo {$task->user->name}! 👋\n\n";
            $message .= "Task *\"{$task->title}\"* akan deadline besok ({$dueDate})!\n\n";
            $message .= "Jangan lupa diselesaikan ya 😊\n\n";
            $message .= "Semangat! 💪";

            // Send WhatsApp notification
            $result = $fonnteService->sendMessage($task->user->phone, $message);

            if ($result['success']) {
                Log::info('Deadline reminder sent successfully', [
                    'task_id' => $task->id,
                    'user_id' => $task->user_id,
                    'phone' => $task->user->phone,
                ]);
            } else {
                Log::error('Failed to send deadline reminder', [
                    'task_id' => $task->id,
                    'user_id' => $task->user_id,
                    'phone' => $task->user->phone,
                    'error' => $result['error'] ?? $result['data'] ?? 'Unknown error',
                ]);
            }
        }

        Log::info('Deadline reminders job completed', [
            'tasks_processed' => $tasks->count(),
        ]);
    }
}
