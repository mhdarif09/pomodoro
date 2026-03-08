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
            ->where('deadline_reminder_1day_sent', false)
            ->get();

        Log::info('H-1 Reminders:', ['count' => $tasks->count()]);

        foreach ($tasks as $task) {
            if (!$task->user || !$task->user->phone) continue;
            
            if ($task->user->canSendWhatsAppReminder()) {
                $message = $this->getOneDayMessage($task);
                $whatsAppService->sendMessage($task->user->phone, $message);
                
                $task->update(['deadline_reminder_1day_sent' => true]);
                $task->user->incrementWhatsAppReminderCount();
                
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
            ->whereBetween('due_date', [
                $threeHoursLater->copy()->subMinutes(30),
                $threeHoursLater->copy()->addMinutes(30)
            ])
            ->where('deadline_reminder_3hour_sent', false)
            ->get();

        Log::info('3-Hour Reminders:', ['count' => $tasks->count()]);

        foreach ($tasks as $task) {
            if (!$task->user || !$task->user->phone) continue;
            
            if ($task->user->canSendWhatsAppReminder()) {
                $message = $this->getThreeHourMessage($task);
                $whatsAppService->sendMessage($task->user->phone, $message);
                
                $task->update(['deadline_reminder_3hour_sent' => true]);
                $task->user->incrementWhatsAppReminderCount();
                
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
            ->whereBetween('due_date', [
                $thirtyMinutesLater->copy()->subMinutes(5),
                $thirtyMinutesLater->copy()->addMinutes(5)
            ])
            ->where('deadline_reminder_30min_sent', false)
            ->get();

        Log::info('30-Min Reminders:', ['count' => $tasks->count()]);

        foreach ($tasks as $task) {
            if (!$task->user || !$task->user->phone) continue;
            
            if ($task->user->canSendWhatsAppReminder()) {
                $message = $this->getThirtyMinuteMessage($task);
                $whatsAppService->sendMessage($task->user->phone, $message);
                
                $task->update(['deadline_reminder_30min_sent' => true]);
                $task->user->incrementWhatsAppReminderCount();
                
                Log::info("30m reminder sent: Task #{$task->id} to user #{$task->user->id}");
            }
        }
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
