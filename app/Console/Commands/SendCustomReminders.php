<?php

namespace App\Console\Commands;

use App\Models\ReminderLog;
use App\Models\Task;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendCustomReminders extends Command
{
    protected $signature = 'reminders:send-custom';
    protected $description = 'Send WhatsApp reminders for tasks with custom reminder_at times';

    public function handle(WhatsAppService $whatsAppService): int
    {
        $now = Carbon::now();

        // If user disables reminders or removes phone, mark pending custom reminders as processed
        // so old backlog won't suddenly spam when settings change later.
        Task::whereNotNull('reminder_at')
            ->where('reminder_sent', false)
            ->where('is_completed', false)
            ->whereHas('user', function ($q) {
                $q->whereNull('phone')->orWhere('default_reminder_enabled', false);
            })
            ->update(['reminder_sent' => true]);

        $tasks = Task::with('user')
            ->whereNotNull('reminder_at')
            ->where('reminder_sent', false)
            ->where('is_completed', false)
            ->where('reminder_at', '<=', $now)
            ->whereHas('user', function ($q) {
                $q->whereNotNull('phone')
                  ->where('default_reminder_enabled', true);
            })
            ->orderBy('reminder_at', 'asc')
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

            if (!$this->canSendNow($user->id, $task->id)) {
                // Delay retry to avoid hammering every minute and keep reminders human-like.
                $task->update(['reminder_at' => now()->addMinutes(30)]);
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

            $result = $whatsAppService->sendReminder($user, $message, $task->id, 'custom_reminder');
            
            // If limit reached, don't mark as sent (try again tomorrow)
            if (isset($result['limit_reached']) && $result['limit_reached']) {
                $this->warn("⚠️ Limit reached for user {$user->id}. Skipping.");
                continue; 
            }

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

    private function canSendNow(int $userId, int $taskId): bool
    {
        $sentToday = ReminderLog::where('user_id', $userId)
            ->where('type', 'like', '%reminder%')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        if ($sentToday >= 4) {
            return false;
        }

        $lastUserReminder = ReminderLog::where('user_id', $userId)
            ->where('type', 'like', '%reminder%')
            ->latest('created_at')
            ->first();

        if ($lastUserReminder && $lastUserReminder->created_at->gt(now()->subMinutes(45))) {
            return false;
        }

        $taskSentToday = ReminderLog::where('user_id', $userId)
            ->where('task_id', $taskId)
            ->where('type', 'like', '%reminder%')
            ->whereDate('created_at', now()->toDateString())
            ->exists();

        return !$taskSentToday;
    }
}
