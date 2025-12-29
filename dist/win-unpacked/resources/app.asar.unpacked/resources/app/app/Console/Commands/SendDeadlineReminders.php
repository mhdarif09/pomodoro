<?php

namespace App\Console\Commands;

use App\Jobs\SendTaskDeadlineReminders;
use Illuminate\Console\Command;

class SendDeadlineReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reminders:send-deadline';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send WhatsApp reminders for tasks with deadline tomorrow (H-1)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔔 Checking for tasks with deadline tomorrow...');

        // Dispatch the job
        SendTaskDeadlineReminders::dispatch();

        $this->info('✅ Deadline reminder job has been dispatched!');

        return Command::SUCCESS;
    }
}
