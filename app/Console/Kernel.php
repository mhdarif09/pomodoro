<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Send WhatsApp reminders for tasks with deadline tomorrow
        // Runs at 23:00 for each Indonesian timezone (H-1 hour before deadline day)
        // WIB (UTC+7): 23:00 = 16:00 UTC
        // WITA (UTC+8): 23:00 = 15:00 UTC  
        // WIT (UTC+9): 23:00 = 14:00 UTC
        $schedule->command('reminders:send-deadline')->dailyAt('16:00'); // 23:00 WIB
        $schedule->command('reminders:send-deadline')->dailyAt('15:00'); // 23:00 WITA
        $schedule->command('reminders:send-deadline')->dailyAt('14:00'); // 23:00 WIT

        // Custom WhatsApp reminders (user-set times)
        $schedule->command('reminders:send-custom')->everyMinute();

        // Gamification
        $schedule->command('challenges:generate')->dailyAt('00:01');

        $schedule->command('challenges:check-progress')->hourly();
        
        // Task Aging
        $schedule->command('tasks:check-stagnant')->weeklyOn(1, '09:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
