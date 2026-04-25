<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\LlmClient;

class ReminderMessageService
{
    protected $openaiApiKey;
    protected $apiUrl;

    // Collection of friendly message templates
    private $morningGreetings = [
        "Selamat pagi! ☀️",
        "Pagi yang cerah! 🌅",
        "Good morning! ☕",
        "Hai, sudah bangun? 😊",
    ];

    private $afternoonGreetings = [
        "Halo! 👋",
        "Hai! Gimana harinya? 😊",
        "Semangat siang! ⚡",
        "Hey! 🙌",
    ];

    private $eveningGreetings = [
        "Hai! 🌙",
        "Good evening! ✨",
        "Halo! Masih semangat? 💪",
        "Selamat malam! 🌃",
    ];

    private $motivationalMessages = [
        "Kamu pasti bisa! 💪",
        "Semangat! 🚀",
        "Let's finish strong! ✨",
        "Satu langkah lagi! 🎯",
        "You got this! 💯",
        "Tetap fokus! 🔥",
        "Progress is progress! 📈",
        "Ayo selesaikan! 🎉",
    ];

    public function __construct()
    {
        // Requests go via LlmClient (supports fallback OpenAI -> Groq).
        $this->openaiApiKey = null;
        $this->apiUrl = null;
    }

    /**
     * Generate friendly reminder based on context
     *
     * @param Task $task
     * @param string $context (instant|scheduled|morning|afternoon|evening)
     * @return string
     */
    public function generateFriendlyReminder(Task $task, string $context = 'scheduled'): string
    {
        $timeContext = $this->getTimeContext();
        $greeting = $this->getGreeting($timeContext);
        $motivation = $this->getMotivationalMessage();
        
        $user = $task->user;
        $userName = $user->name;
        $taskTitle = $task->title;
        $dueDate = Carbon::parse($task->due_date)->format('d M Y');
        $priority = $task->priority ?? 'Sedang';

        // Build friendly message based on context
        if ($context === 'instant') {
            // Message when task is just created with deadline tomorrow
            $message = "{$greeting}\n\n";
            $message .= "Hai {$userName}! Ada task baru nih:\n\n";
            $message .= "📋 *{$taskTitle}*\n";
            $message .= "📅 Deadline: Besok ({$dueDate})\n";
            $message .= "🎯 Priority: {$priority}\n\n";
            $message .= "Jangan lupa diselesaikan ya! {$motivation}";
        } else {
            // Scheduled reminder (default)
            $hoursLeft = Carbon::parse($task->due_date)->diffInHours(now());
            
            if ($hoursLeft <= 3) {
                $urgency = "⏰ *Waktunya tinggal {$hoursLeft} jam lagi!*\n\n";
            } elseif ($hoursLeft <= 12) {
                $urgency = "⏳ Masih ada waktu {$hoursLeft} jam lagi nih!\n\n";
            } else {
                $urgency = "";
            }

            $message = "{$greeting}\n\n";
            $message .= "{$urgency}";
            $message .= "Hai {$userName}! Ingetin ya:\n\n";
            $message .= "📋 *{$taskTitle}*\n";
            $message .= "📅 Deadline: {$dueDate}\n";
            
            if ($hoursLeft <= 12) {
                $message .= "\nYuk, selesaikan sebelum terlambat! {$motivation}";
            } else {
                $message .= "\nSemangat menyelesaikannya! {$motivation}";
            }
        }

        return $message;
    }

    /**
     * Get random motivational message
     *
     * @return string
     */
    public function getMotivationalMessage(): string
    {
        return $this->motivationalMessages[array_rand($this->motivationalMessages)];
    }

    /**
     * Generate AI-personalized message (premium feature)
     *
     * @param Task $task
     * @param User $user
     * @return string|null
     */
    public function generateAIPersonalizedMessage(Task $task, User $user): ?string
    {
        // Only for premium users
        if (!$user->is_premium) {
            return null;
        }

        try {
            $timeContext = $this->getTimeContext();
            $taskHistory = $this->getUserTaskHistory($user);
            
            $prompt = $this->buildPersonalizationPrompt($task, $user, $timeContext, $taskHistory);
            
            $result = app(LlmClient::class)->chatCompletions([
                'model' => config('llm.model', 'gpt-4o-mini'),
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Kamu adalah teman yang supportive dan friendly yang mengingatkan user tentang task mereka. Gunakan bahasa Indonesia casual, emoji yang sesuai, dan tone yang warm & encouraging.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.8,
                'max_tokens' => 200,
            ]);

            $content = data_get($result, 'data.choices.0.message.content');
            if ($content !== null) return $content;

            return null;

        } catch (\Exception $e) {
            Log::error('ReminderMessageService: Error generating AI message', [
                'task_id' => $task->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return null;
        }
    }

    /**
     * Get time context (morning/afternoon/evening)
     */
    private function getTimeContext(): string
    {
        $hour = now()->hour;
        
        if ($hour >= 5 && $hour < 12) {
            return 'morning';
        } elseif ($hour >= 12 && $hour < 18) {
            return 'afternoon';
        } else {
            return 'evening';
        }
    }

    /**
     * Get greeting based on time
     */
    private function getGreeting(string $timeContext): string
    {
        switch ($timeContext) {
            case 'morning':
                return $this->morningGreetings[array_rand($this->morningGreetings)];
            case 'afternoon':
                return $this->afternoonGreetings[array_rand($this->afternoonGreetings)];
            case 'evening':
                return $this->eveningGreetings[array_rand($this->eveningGreetings)];
            default:
                return "Hai! 👋";
        }
    }

    /**
     * Get user's task completion history for personalization
     */
    private function getUserTaskHistory(User $user): array
    {
        $completedCount = $user->tasks()->where('is_completed', true)->count();
        $totalCount = $user->tasks()->count();
        $completionRate = $totalCount > 0 ? round(($completedCount / $totalCount) * 100) : 0;
        
        $recentlyCompleted = $user->tasks()
            ->where('is_completed', true)
            ->where('updated_at', '>=', now()->subDays(7))
            ->count();

        return [
            'completion_rate' => $completionRate,
            'recently_completed' => $recentlyCompleted,
            'total_tasks' => $totalCount,
        ];
    }

    /**
     * Build prompt for AI personalization
     */
    private function buildPersonalizationPrompt(Task $task, User $user, string $timeContext, array $taskHistory): string
    {
        $prompt = "Generate pesan reminder WhatsApp yang personal dan friendly untuk user:\n\n";
        $prompt .= "**Context:**\n";
        $prompt .= "- Waktu: {$timeContext}\n";
        $prompt .= "- Nama user: {$user->name}\n";
        $prompt .= "- Task: \"{$task->title}\"\n";
        $prompt .= "- Deadline: " . Carbon::parse($task->due_date)->format('d M Y') . "\n";
        $prompt .= "- Completion rate user: {$taskHistory['completion_rate']}%\n";
        $prompt .= "- Task selesai minggu ini: {$taskHistory['recently_completed']}\n\n";
        
        $prompt .= "**Requirements:**\n";
        $prompt .= "1. Maksimal 4-5 baris\n";
        $prompt .= "2. Tone casual & friendly (seperti teman dekat)\n";
        $prompt .= "3. Gunakan emoji yang sesuai\n";
        $prompt .= "4. Sebutkan nama user\n";
        $prompt .= "5. Berikan motivasi atau encouragement yang personal\n";
        $prompt .= "6. Bahasa Indonesia yang natural\n\n";
        $prompt .= "Generate pesan reminder sekarang:";

        return $prompt;
    }
}
