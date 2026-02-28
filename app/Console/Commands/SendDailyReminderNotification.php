<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Services\GamificationEngine;
use App\Services\SmartReminderService;
use Carbon\Carbon;

class SendDailyReminderNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sarang:daily-reminder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send AI daily reminders to users with urgent pending tasks';

    /**
     * Execute the console command.
     */
    public function handle(GamificationEngine $gamification, SmartReminderService $reminderService)
    {
        $today = Carbon::today();
        
        // Find users who have overdue tasks or tasks due today that aren't completed
        $users = User::whereHas('tasks', function ($query) use ($today) {
            $query->where('is_completed', false)
                  ->whereNotNull('due_date')
                  ->where('due_date', '<=', $today)
                  ->personal(); // only personal tasks
        })->get();

        $count = 0;
        foreach ($users as $user) {
            // Check identity trigger first (high urgency like streak risk)
            $trigger = $gamification->checkIdentityTrigger($user);
            
            if ($trigger && $trigger['urgency'] === 'high') {
                $message = $reminderService->generateNotificationMessage($user, 'identity_trigger', [
                    'moment' => $trigger['context']
                ]);
                $sent = $reminderService->sendWithFrequencyCheck($user, 'identity_trigger', $message);
                if ($sent) $count++;
                continue; // Skip normal reminder if identity trigger sent
            }

            // Normal reminder
            $urgentTasks = $user->tasks()
                ->where('is_completed', false)
                ->whereNotNull('due_date')
                ->where('due_date', '<=', $today)
                ->personal()
                ->orderBy('due_date', 'asc')
                ->take(3)
                ->get();
                
            $message = $reminderService->generateNotificationMessage($user, 'reminder', [
                'tasks' => $urgentTasks
            ]);
            
            $sent = $reminderService->sendWithFrequencyCheck($user, 'reminder', $message);
            if ($sent) $count++;
        }

        $this->info("Tried sending daily reminders to {$users->count()} users. Sent: {$count}.");
    }
}
