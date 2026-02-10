<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Services\FonnteService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendCustomReminders extends Command
{
    protected $signature = 'reminders:send-custom';
    protected $description = 'Send WhatsApp reminders for tasks with custom reminder_at times';

    public function handle(FonnteService $fonnteService): int
    {
        $now = Carbon::now();

        $tasks = Task::with('user')
            ->whereNotNull('reminder_at')
            ->where('reminder_sent', false)
            ->where('is_completed', false)
            ->where('reminder_at', '<=', $now)
            ->get();

        if ($tasks->isEmpty()) {
            $this->line('No custom reminders to send.');
            return Command::SUCCESS;
        }

        $this->info("Found {$tasks->count()} reminder(s) to send...");

        foreach ($tasks as $task) {
            $user = $task->user;

            if (!$user || !$user->phone) {
                Log::warning('SendCustomReminders: User has no phone', ['task_id' => $task->id]);
                $task->update(['reminder_sent' => true]);
                continue;
            }

            $due = $task->due_date ? Carbon::parse($task->due_date)->format('d M Y') : 'Tanpa deadline';
            $priority = $task->priority ?? 'Sedang';

            $message = "⏰ *Reminder!*\n\n"
                . "Hai {$user->name}, ini pengingat untuk task kamu:\n\n"
                . "📋 *{$task->title}*\n"
                . "📅 Deadline: {$due}\n"
                . "🎯 Priority: {$priority}\n\n"
                . "Yuk segera dikerjakan! 💪🚀\n\n"
                . "Ketik /list untuk lihat semua task.";

            $result = $fonnteService->sendMessage($user->phone, $message);

            $task->update(['reminder_sent' => true]);

            if ($result['success']) {
                $this->info("✅ Reminder sent: {$task->title} → {$user->phone}");
                Log::info('Custom reminder sent', ['task_id' => $task->id, 'user_id' => $user->id]);
            } else {
                $this->error("❌ Failed: {$task->title} → {$user->phone}");
                Log::error('Custom reminder failed', ['task_id' => $task->id, 'error' => $result['error'] ?? 'unknown']);
            }
        }

        $this->info("Done! Processed {$tasks->count()} reminder(s).");
        return Command::SUCCESS;
    }
}
