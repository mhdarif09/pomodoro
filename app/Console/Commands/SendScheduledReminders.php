<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ReminderService;

class SendScheduledReminders extends Command
{
    protected $signature = 'reminders:send';
    protected $description = 'Send scheduled WhatsApp reminders to users';

    public function handle(ReminderService $reminderService): int
    {
        $this->info('Processing scheduled reminders...');
        
        $sent = $reminderService->processScheduledReminders();
        
        $this->info("✅ Sent {$sent} reminders successfully.");
        
        return Command::SUCCESS;
    }
}
