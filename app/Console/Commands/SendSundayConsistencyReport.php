<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Services\GamificationEngine;
use App\Services\SmartReminderService;
use Carbon\Carbon;

class SendSundayConsistencyReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sarang:sunday-report {--dry-run}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate and send the Sunday Consistency Report via WhatsApp';

    /**
     * Execute the console command.
     */
    public function handle(SmartReminderService $reminderService)
    {
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        $isDryRun = $this->option('dry-run');

        $users = User::whereHas('tasks', function ($query) use ($startOfWeek, $endOfWeek) {
            $query->whereBetween('updated_at', [$startOfWeek, $endOfWeek])
                  ->orWhereBetween('due_date', [$startOfWeek, $endOfWeek]);
        })->get();

        $count = 0;
        foreach ($users as $user) {
            $completed = $user->tasks()->personal()->where('is_completed', true)->whereBetween('updated_at', [$startOfWeek, $endOfWeek])->count();
            $late = $user->tasks()->personal()->where('is_completed', true)->whereColumn('updated_at', '>', 'due_date')->whereBetween('updated_at', [$startOfWeek, $endOfWeek])->count();
            $untouched = $user->tasks()->personal()->where('is_completed', false)->whereBetween('due_date', [$startOfWeek, $endOfWeek])->count();
            
            $total = $completed + $untouched;
            $score = $total > 0 ? round(($completed / $total) * 100) : 0;

            $context = [
                'score' => $score,
                'moment' => "Total task minggu ini: $total. Selesai: $completed, Telat: $late, Gak disentuh: $untouched."
            ];

            $message = $reminderService->generateNotificationMessage($user, 'evaluation', $context);
            
            if ($isDryRun) {
                $this->info("=== REPORT FOR {$user->name} ===");
                $this->line($message);
                $this->line("=================================");
            } else {
                $sent = $reminderService->sendWithFrequencyCheck($user, 'evaluation', $message);
                if ($sent) $count++;
            }
        }

        if (!$isDryRun) {
            $this->info("Sunday consistency reports sent to {$count} users.");
        }
    }
}
