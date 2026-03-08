<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AutoChallengeService;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class CheckChallengeProgress extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'challenges:check-progress';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and update challenge progress for active users';

    /**
     * Execute the console command.
     */
    public function handle(AutoChallengeService $service)
    {
        $this->info('Checking challenge progress...');
        
        // chunk active users to avoid memory issues
        User::chunk(100, function ($users) use ($service) {
            foreach ($users as $user) {
                try {
                    $service->checkProgress($user);
                } catch (\Exception $e) {
                    Log::error("Error checking challenge progress for user {$user->id}", ['error' => $e->getMessage()]);
                }
            }
        });

        $this->info('Challenge progress updated.');
        return Command::SUCCESS;
    }
}
