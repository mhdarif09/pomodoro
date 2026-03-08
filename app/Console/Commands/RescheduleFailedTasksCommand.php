<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class RescheduleFailedTasksCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tasks:reschedule-failed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reschedule tasks with today\'s deadline that are not completed to tomorrow';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today()->format('Y-m-d');
        $tomorrow = Carbon::tomorrow();

        $this->info("Finding tasks with due_date = {$today} and is_completed = false...");

        // Find all failed tasks for today
        $failedTasks = Task::whereDate('due_date', $today)
            ->where('is_completed', false)
            ->get();

        if ($failedTasks->isEmpty()) {
            $this->info('No failed tasks found. All done for today!');
            return Command::SUCCESS;
        }

        $this->info("Found {$failedTasks->count()} tasks to reschedule.");

        $bar = $this->output->createProgressBar($failedTasks->count());
        $bar->start();

        $rescheduledCount = 0;

        foreach ($failedTasks as $task) {
            $task->update([
                'due_date' => $tomorrow,
                'auto_rescheduled_count' => $task->auto_rescheduled_count + 1
            ]);

            $rescheduledCount++;
            $bar->advance();

            Log::info('Task rescheduled', [
                'task_id' => $task->id,
                'task_title' => $task->title,
                'user_id' => $task->user_id,
                'old_due_date' => $today,
                'new_due_date' => $tomorrow->format('Y-m-d'),
                'reschedule_count' => $task->auto_rescheduled_count
            ]);
        }

        $bar->finish();
        $this->newLine();

        $this->info("✅ Successfully rescheduled {$rescheduledCount} tasks to tomorrow ({$tomorrow->format('Y-m-d')})");

        return Command::SUCCESS;
    }
}
