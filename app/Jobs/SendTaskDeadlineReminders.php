<?php

namespace App\Jobs;

use App\Models\Task;
use App\Services\WhatsAppService;
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
    public function handle(WhatsAppService $whatsAppService): void
    {
        Log::info('🔔 Starting multi-stage deadline reminder job...');

        // Send H-1 day reminders
        $this->sendOneDayReminders($whatsAppService);
        
        // Send 3-hour reminders
        $this->sendThreeHourReminders($whatsAppService);
        
        // Send 30-minute reminders
        $this->sendThirtyMinuteReminders($whatsAppService);

        // Send overdue reminders (NEW: untuk tasks yang sudah lewat deadline)
        $this->sendOverdueReminders($whatsAppService);

        Log::info('✅ Multi-stage deadline reminder job completed');
    }

    /**
     * Send reminders for tasks due tomorrow (H-1)
     */
    private function sendOneDayReminders(WhatsAppService $whatsAppService): void
    {
        $tomorrow = Carbon::tomorrow();
        
        $tasks = Task::with('user')
            ->where('status', '!=', 'done')
            ->where('is_completed', false)
            ->whereDate('due_date', $tomorrow)
            ->whereNull('reminder_at')
            ->where('deadline_reminder_1day_sent', false)
            ->whereHas('user', function ($q) {
                $q->whereNotNull('phone')
                  ->where('default_reminder_enabled', true);
            })
            ->get();

        Log::info('H-1 Reminders:', ['count' => $tasks->count()]);

        foreach ($tasks as $task) {
            if (!$task->user || !$task->user->phone) continue;
            
            $message = $this->getOneDayMessage($task);
            $result = $whatsAppService->sendReminder($task->user, $message, $task->id, 'deadline_reminder_h1');

            if (!empty($result['success'])) {
                $task->update(['deadline_reminder_1day_sent' => true]);
                Log::info("H-1 reminder sent: Task #{$task->id} to user #{$task->user->id}");
            }
        }
    }

    /**
     * Send reminders for tasks due in 3 hours
     */
    private function sendThreeHourReminders(WhatsAppService $whatsAppService): void
    {
        $threeHoursLater = Carbon::now()->addHours(3);
        
        $tasks = Task::with('user')
            ->where('status', '!=', 'done')
            ->where('is_completed', false)
            ->whereNull('reminder_at')
            ->whereBetween('due_date', [
                $threeHoursLater->copy()->subMinutes(30),
                $threeHoursLater->copy()->addMinutes(30)
            ])
            ->where('deadline_reminder_3hour_sent', false)
            ->whereHas('user', function ($q) {
                $q->whereNotNull('phone')
                  ->where('default_reminder_enabled', true);
            })
            ->get();

        Log::info('3-Hour Reminders:', ['count' => $tasks->count()]);

        foreach ($tasks as $task) {
            if (!$task->user || !$task->user->phone) continue;
            
            $message = $this->getThreeHourMessage($task);
            $result = $whatsAppService->sendReminder($task->user, $message, $task->id, 'deadline_reminder_h3');

            if (!empty($result['success'])) {
                $task->update(['deadline_reminder_3hour_sent' => true]);
                Log::info("3h reminder sent: Task #{$task->id} to user #{$task->user->id}");
            }
        }
    }

    /**
     * Send reminders for tasks due in 30 minutes
     */
    private function sendThirtyMinuteReminders(WhatsAppService $whatsAppService): void
    {
        $thirtyMinutesLater = Carbon::now()->addMinutes(30);
        
        $tasks = Task::with('user')
            ->where('status', '!=', 'done')
            ->where('is_completed', false)
            ->whereNull('reminder_at')
            ->whereBetween('due_date', [
                $thirtyMinutesLater->copy()->subMinutes(5),
                $thirtyMinutesLater->copy()->addMinutes(5)
            ])
            ->where('deadline_reminder_30min_sent', false)
            ->whereHas('user', function ($q) {
                $q->whereNotNull('phone')
                  ->where('default_reminder_enabled', true);
            })
            ->get();

        Log::info('30-Min Reminders:', ['count' => $tasks->count()]);

        foreach ($tasks as $task) {
            if (!$task->user || !$task->user->phone) continue;
            
            $message = $this->getThirtyMinuteMessage($task);
            $result = $whatsAppService->sendReminder($task->user, $message, $task->id, 'deadline_reminder_h30m');

            if (!empty($result['success'])) {
                $task->update(['deadline_reminder_30min_sent' => true]);
                Log::info("30m reminder sent: Task #{$task->id} to user #{$task->user->id}");
            }
        }
    }

    /**
     * Send reminders for tasks that are OVERDUE (deadline has passed)
     * NO SPAM! Only sends reminder once per task, or max once per 24 hours
     */
    private function sendOverdueReminders(WhatsAppService $whatsAppService): void
    {
        $now = Carbon::now();
        $twentyFourHoursAgo = $now->copy()->subHours(24);
        
        // Get tasks where:
        // 1. Deadline has passed (due_date < now)
        // 2. Task is not completed
        // 3. Either:
        //    a) Never sent overdue reminder yet (overdue_reminder_sent_at is NULL), OR
        //    b) Last overdue reminder was sent MORE than 24 hours ago (for persistent reminders)
        // 4. User has WhatsApp enabled
        $tasks = Task::with('user')
            ->where('status', '!=', 'done')
            ->where('is_completed', false)
            ->whereNull('reminder_at')
            ->where('due_date', '<', $now)
            ->where(function ($query) use ($twentyFourHoursAgo) {
                $query->whereNull('overdue_reminder_sent_at') // Never sent yet
                      ->orWhere('overdue_reminder_sent_at', '<', $twentyFourHoursAgo); // Sent but > 24h ago
            })
            ->whereHas('user', function ($q) {
                $q->whereNotNull('phone')
                  ->where('default_reminder_enabled', true);
            })
            ->get();

        Log::info('Overdue Reminders:', ['count' => $tasks->count()]);

        foreach ($tasks as $task) {
            if (!$task->user || !$task->user->phone) continue;
            
            $message = $this->getOverdueMessage($task);
            $result = $whatsAppService->sendReminder($task->user, $message, $task->id, 'deadline_reminder_overdue');

            if (!empty($result['success'])) {
                // Update timestamp instead of boolean flag
                $task->update(['overdue_reminder_sent_at' => $now]);
                Log::info("Overdue reminder sent: Task #{$task->id} to user #{$task->user->id}");
            }
        }
    }

    /**
     * Generate overdue reminder message
     */
    private function getOverdueMessage(Task $task): string
    {
        $hoursOverdue = $task->due_date->diffInHours(now());
        
        $messages = [
            "⚠️ URGENT! Task '{$task->title}' sudah {$hoursOverdue} jam OVERDUE! Ini serius nih, butuh diselesaikan ASAP! 🔥",
            "🚨 Reminder URGENT: '{$task->title}' sudah lewat deadline {$hoursOverdue} jam yang lalu. Ini prioritas pertama sekarang! ⚡",
            "⏰ OVERDUE ALERT! '{$task->title}' belum diselesaikan padahal sudah {$hoursOverdue} jam melewati deadline. Mulai sekarang juga! 💪",
        ];
        
        return $messages[array_rand($messages)];
    }

    /**
     * Generate H-1 day reminder message
     */
    private function getOneDayMessage(Task $task): string
    {
        $messages = [
            "⏰ Besok deadline '{$task->title}'! Udah 80% kah? Atau mau mulai sekarang? 😊",
            "Reminder: '{$task->title}' deadline besok! Progress gimana? Butuh final push? 💪",
            "Hey! '{$task->title}' besok due date-nya. Masih ada waktu buat polish nih 🚀",
        ];
        
        return $messages[array_rand($messages)];
    }

    /**
     * Generate 3-hour reminder message
     */
    private function getThreeHourMessage(Task $task): string
    {
        $messages = [
            "🚨 3 JAM lagi deadline '{$task->title}'! Final sprint yuk! 💨",
            "⚡ Tinggal 3 jam! '{$task->title}' butuh finishing touch sekarang!",
            "Ayo ayo! '{$task->title}' 3 jam lg due. Time to wrap it up! 🔥",
        ];
        
        return $messages[array_rand($messages)];
    }

    /**
     * Generate 30-minute reminder message
     */
    private function getThirtyMinuteMessage(Task $task): string
    {
        $messages = [
            "⚠️ URGENT! 30 menit lagi deadline '{$task->title}'! Finishing touch sekarang! ⚡",
            "🚨 30 MENIT! '{$task->title}' harus selesai sekarang! Go go go!",
            "LAST CALL! '{$task->title}' tinggal 30 menit. Final check now! 🏃",
        ];
        
        return $messages[array_rand($messages)];
    }
}
