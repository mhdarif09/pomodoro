<?php
// app/Jobs/DetermineTaskPriority.php
namespace App\Jobs;

use App\Models\Task;
use App\Services\OpenAIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DetermineTaskPriority implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @var \App\Models\Task
     */
    protected $task;

    public function __construct(Task $task)
    {
        $this->task = $task;
    }

    public function handle(OpenAIService $openAiService): void
    {
        try {
            $priority = $openAiService->determineTaskPriority(
                $this->task->title,
                $this->task->description ?? '',
                $this->task->due_date
            );

            // Update task dengan prioritas yang didapat dari AI
            $this->task->priority = $priority;
            $this->task->save();
            
            Log::info("Priority for task #{$this->task->id} was set to {$priority}");

        } catch (\Exception $e) {
            Log::error("Failed to process priority for task #{$this->task->id}: " . $e->getMessage());
            // Anda bisa menambahkan logic untuk mencoba lagi (retry) atau notifikasi jika gagal
            $this->fail($e);
        }
    }
}