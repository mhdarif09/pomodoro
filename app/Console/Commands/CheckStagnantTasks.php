<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Services\FonnteService;
use Carbon\Carbon;

class CheckStagnantTasks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tasks:check-stagnant';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for stagnant tasks (updated > 7 days ago) and notify users via WhatsApp';

    /**
     * Execute the console command.
     */
    public function handle(FonnteService $fonnteService)
    {
        $this->info('Checking for stagnant tasks...');

        $stagnantDate = Carbon::now()->subDays(7);
        
        // Find tasks not completed, updated > 7 days ago
        $tasks = Task::where('is_completed', false)
            ->where('updated_at', '<', $stagnantDate)
            ->whereHas('user', function($q) {
                // Only users with phone number
                $q->whereNotNull('phone')->where('phone', '!=', '');
            })
            ->with('user')
            ->get()
            ->groupBy('user_id');

        if ($tasks->isEmpty()) {
            $this->info('No stagnant tasks found.');
            return;
        }

        foreach ($tasks as $userId => $userTasks) {
            $user = $userTasks->first()->user;
            $count = $userTasks->count();
            
            // Limit to top 3 oldest
            $taskList = $userTasks->sortBy('updated_at')->take(3)->map(function($t) {
                return "• " . $t->title . " (" . $t->updated_at->diffForHumans() . ")";
            })->join("\n");

            if ($count > 3) {
                $taskList .= "\n...dan " . ($count - 3) . " task lainnya.";
            }

            $message = "👋 Halo *{$user->name}*!\n\n" .
                "Ada *{$count} tugas* yang sudah lama tidak disentuh (lebih dari 7 hari) nih. 😅\n\n" .
                $taskList . "\n\n" .
                "💡 *Saran Sarang Tumbuh:*\n" .
                "1. Pecah jadi langkah kecil kalau terlalu berat.\n" .
                "2. Arsipkan kalau sudah tidak relevan (/hapus).\n" .
                "3. Atau gas kerjain sekarang! 🚀\n\n" .
                "Ketik */list* untuk lihat semua tugas.";

            $this->info("Sending notification to {$user->name} ({$user->phone})...");
            
            try {
                // Use rate-limited sender
                $sent = $fonnteService->sendReminder($user, $message);
                
                if ($sent) {
                    $this->info("Message sent to {$user->name}.");
                } else {
                    $this->warn("Limit reached for {$user->name}. Message skipped.");
                }
                
                // Optional: Sleep to prevent rate limiting if distinct users are many
                sleep(1); 
            } catch (\Exception $e) {
                $this->error("Failed to send to {$user->name}: " . $e->getMessage());
            }
        }

        $this->info('Stagnant tasks check completed.');
    }
}
