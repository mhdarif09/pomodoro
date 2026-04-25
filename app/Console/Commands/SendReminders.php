<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Services\ReminderService;

class SendReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'gamification:send-reminders {--dry-run : Only log output without sending}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send WhatsApp productivity reminders to users via Fonnte';

    /**
     * Execute the console command.
     */
    public function handle(ReminderService $reminderService)
    {
        $this->info("Starting Reminder Agent...");
        
        $users = User::whereNotNull('phone')
            ->where('default_reminder_enabled', true)
            ->get();
        $count = 0;

        foreach ($users as $user) {
            $this->line("Checking user: {$user->name} ({$user->phone})...");
            
            if ($this->option('dry-run')) {
                // In dry run, we just simulate
                $this->info("[DRY RUN] Would simulate check for {$user->name}");
            } else {
                $reminderService->sendContextualReminder($user);
                $this->info("Processed {$user->name}");
            }
            $count++;
        }

        $this->info("Done! Processed {$count} users.");
    }
}
