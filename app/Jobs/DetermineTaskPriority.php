<?php
// app/Jobs/DetermineTaskPriority.php
namespace App\Jobs;

use App\Models\Task;
use App\Services\OpenAIService;
use App\Support\AIFeature;
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
            set_time_limit(0); 

            $priority = $this->determinePriorityHybrid($openAiService);

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

    private function determinePriorityHybrid(OpenAIService $openAiService): string
    {
        // Hybrid/AI modes: try AI first. If feature is disabled (none), use local heuristic.
        if (AIFeature::allowsAI('priority')) {
            return $openAiService->determineTaskPriority(
                $this->task->title,
                $this->task->description ?? '',
                $this->task->due_date
            );
        }

        $title = strtolower((string) ($this->task->title ?? ''));
        $desc = strtolower((string) ($this->task->description ?? ''));
        $text = $title . ' ' . $desc;

        $urgentKeywords = ['urgent', 'mendesak', 'segera', 'asap', 'kritikal', 'critical', 'bug', 'prod', 'production', 'error', 'down'];
        foreach ($urgentKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return 'Mendesak';
            }
        }

        if ($this->task->due_date) {
            $hoursUntilDue = now()->diffInHours($this->task->due_date, false);
            if ($hoursUntilDue < 0) return 'Mendesak';
            if ($hoursUntilDue <= 6) return 'Mendesak';
            if ($hoursUntilDue <= 24) return 'Tinggi';
            if ($hoursUntilDue <= 72) return 'Tinggi';
        }

        $highSignal = ['submit', 'laporan', 'presentasi', 'invoice', 'pajak', 'ujian', 'deadline', 'meeting', 'client', 'customer'];
        foreach ($highSignal as $keyword) {
            if (str_contains($text, $keyword)) {
                return 'Tinggi';
            }
        }

        return 'Sedang';
    }
}
