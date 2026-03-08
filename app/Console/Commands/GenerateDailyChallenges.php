<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AutoChallengeService;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class GenerateDailyChallenges extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'challenges:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate daily challenges for all active users';

    /**
     * Execute the console command.
     */
    public function handle(AutoChallengeService $service)
    {
        $this->info('Generating daily challenges...');
        try {
            $service->generateDailyChallenges();
            $this->info('Daily challenges generated successfully.');
        } catch (\Exception $e) {
            $this->error('Error generating challenges: ' . $e->getMessage());
            Log::error('Error generating challenges', ['error' => $e]);
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
