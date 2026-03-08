<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Carbon\Carbon;

class CheckDailyStreakReset extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sarang:streak-reset';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset daily streak for users who were not active yesterday';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $yesterday = Carbon::yesterday();
        
        $usersToReset = User::whereHas('gamificationStats', function ($query) use ($yesterday) {
            $query->where('streak', '>', 0)
                  ->where(function ($q) use ($yesterday) {
                      $q->whereNull('last_active_date')
                        ->orWhere('last_active_date', '<', $yesterday);
                  });
        })->get();

        $count = 0;
        foreach ($usersToReset as $user) {
            $stats = $user->gamificationStats;
            $stats->streak = 0;
            $stats->save();
            $count++;
        }

        $this->info("Successfully reset streak for {$count} users.");
    }
}
