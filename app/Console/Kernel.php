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
        // Multi-stage deadline reminders - runs every 30 minutes
        // This will check and send H-1, 3h, and 30min reminders
        $schedule->command('reminders:send-deadline')
                 ->everyThirtyMinutes()
                 ->between('6:00', '23:00');

        // Smart contextual reminders - 3x daily
        $schedule->command('gamification:send-reminders')
                 ->dailyAt('09:00')  // Morning work invitation
                 ->timezone('Asia/Jakarta');
                 
        $schedule->command('gamification:send-reminders')
                 ->dailyAt('14:00')  // Afternoon check-in
                 ->timezone('Asia/Jakarta');
                 
        $schedule->command('gamification:send-reminders')
                 ->dailyAt('20:00')  // Evening reminder
                 ->timezone('Asia/Jakarta');

        // Custom WhatsApp reminders (user-set times)
        $schedule->command('reminders:send-custom')->everyMinute();

        // Gamification
        $schedule->command('challenges:generate')->dailyAt('00:01');

        $schedule->command('challenges:check-progress')->hourly();
        
        // Task Aging
        $schedule->command('tasks:check-stagnant')->weeklyOn(1, '09:00');

        // SarangTumbuh Gamification Scheduled Tasks
        $schedule->command('sarang:streak-reset')->dailyAt('00:01');
        $schedule->command('sarang:daily-reminder')->dailyAt('18:00');
        $schedule->command('sarang:sunday-report')->weeklyOn(0, '20:00');
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
