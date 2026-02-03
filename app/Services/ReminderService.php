<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserReminder;
use App\Models\ReminderLog;
use Carbon\Carbon;

class ReminderService
{
    protected MemoryAgentService $memoryAgent;
    protected FonnteService $fonnte;

    public function __construct(MemoryAgentService $memoryAgent, FonnteService $fonnte)
    {
        $this->memoryAgent = $memoryAgent;
        $this->fonnte = $fonnte;
    }

    /**
     * Generate personalized reminder message
     */
    public function generateMessage(User $user, string $type): string
    {
        $name = explode(' ', $user->name)[0]; // First name only
        $bestHour = $this->memoryAgent->getBestProductivityHour($user);
        $currentHour = now()->hour;
        
        switch ($type) {
            case 'study':
                return $this->generateStudyReminder($user, $name, $bestHour, $currentHour);
            
            case 'deadline':
                return $this->generateDeadlineReminder($user, $name);
            
            case 'habit':
                return $this->generateHabitReminder($user, $name);
            
            case 'comeback':
                return $this->generateComebackReminder($user, $name);
            
            case 'motivation':
                return $this->generateMotivationReminder($user, $name);
            
            default:
                return "Halo {$name}! Jangan lupa produktif hari ini ya 😊";
        }
    }

    protected function generateStudyReminder(User $user, string $name, int $bestHour, int $currentHour): string
    {
        $messages = [];
        
        // If it's their best hour
        if (abs($currentHour - $bestHour) <= 1) {
            $messages[] = "Biasanya jam segini kamu mulai belajar. Mau mulai 15 menit dulu?";
            $messages[] = "Ini jam {$bestHour}:00, waktu emasmu! Yuk mulai fokus sekarang 🎯";
            $messages[] = "{$name}, jam produktifmu nih. Mau tackle tugas tersulit sekarang?";
        } else {
            $messages[] = "Udah lama ga belajar nih. Mau mulai pelan-pelan?";
            $messages[] = "Gimana kalau kita mulai 1 sesi Pomodoro sekarang? 25 menit aja 🍅";
            $messages[] = "Yuk {$name}, mulai produktif. Pilih 1 tugas mudah dulu?";
        }
        
        return $messages[array_rand($messages)];
    }

    protected function generateDeadlineReminder(User $user, string $name): string
    {
        $dueTomorrow = $user->tasks()
            ->where('is_completed', false)
            ->whereDate('due_date', Carbon::tomorrow())
            ->count();
            
        $dueToday = $user->tasks()
            ->where('is_completed', false)
            ->whereDate('due_date', today())
            ->count();

        if ($dueToday > 0) {
            $messages = [
                "Ada {$dueToday} tugas deadline hari ini. Mau kita selesaikan yang termudah dulu?",
                "{$name}, tugas kamu masih sedikit lagi selesai. Mau kita lanjut sekarang?",
                "Deadline hari ini nih! Yuk fokus 30 menit buat nyelesaiin 1 tugas 💪",
            ];
        } elseif ($dueTomorrow > 0) {
            $messages = [
                "Besok ada {$dueTomorrow} deadline. Mau kita cicil sekarang biar besok santai?",
                "Tugas besok bisa kita mulai hari ini. 20 menit aja dulu?",
            ];
        } else {
            return ""; // No deadline reminder needed
        }

        return $messages[array_rand($messages)];
    }

    protected function generateHabitReminder(User $user, string $name): string
    {
        $streak = $user->current_streak ?? 0;
        
        if ($streak > 0) {
            $messages = [
                "Streak {$streak} hari! Jangan putus rantai hari ini ya {$name} 🔥",
                "Quest harian kamu tinggal satu lagi nih. Yuk selesaikan!",
                "Udah {$streak} hari berturut-turut! Pertahankan momentum 💪",
            ];
        } else {
            $messages = [
                "Yuk mulai streak baru hari ini! Selesaikan 1 quest kecil dulu?",
                "Hari ini belum ada progress, mau mulai pelan-pelan?",
            ];
        }

        return $messages[array_rand($messages)];
    }

    protected function generateComebackReminder(User $user, string $name): string
    {
        $messages = [
            "Udah lama ga keliatan nih {$name}. Kangen produktif bareng? 😊",
            "Ayo comeback! Mulai dari 1 tugas kecil aja dulu",
            "Semangat kamu kemana? Yuk kita mulai lagi, pelan-pelan aja 🌱",
            "Ga apa-apa istirahat, tapi jangan lama-lama ya. Yuk mulai lagi!",
        ];

        return $messages[array_rand($messages)];
    }

    protected function generateMotivationReminder(User $user, string $name): string
    {
        $nextLevelXp = $user->getXpForNextLevel();
        $gap = $nextLevelXp - $user->xp;
        
        if ($gap > 0 && $gap <= 200) {
            $messages = [
                "Tinggal {$gap} XP lagi level up! Selesaikan 3 tugas sekarang 🚀",
                "{$name}, kamu hampir naik level! Yuk gas!",
            ];
        } else {
            $guild = $user->guilds()->first();
            if ($guild) {
                $messages = [
                    "Guild '{$guild->name}' butuh kontribusi kamu hari ini 🛡️",
                    "Temen-temen guild nunggu progress kamu nih!",
                ];
            } else {
                $messages = [
                    "Level {$user->level}! Keren! Yuk lanjut produktif 🎯",
                    "Kamu bisa lebih dari ini. Yuk mulai sekarang!",
                ];
            }
        }

        return $messages[array_rand($messages)];
    }

    /**
     * Send reminder via WhatsApp
     */
    public function sendReminder(User $user, string $type): bool
    {
        // Check if user has phone number
        if (!$user->phone) {
            return false;
        }

        // Generate message
        $message = $this->generateMessage($user, $type);
        
        if (empty($message)) {
            return false;
        }

        // Send via Fonnte
        try {
            $this->fonnte->sendMessage($user->phone, $message);
            
            // Log the reminder
            ReminderLog::create([
                'user_id' => $user->id,
                'type' => $type,
                'message' => $message,
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            return true;
        } catch (\Exception $e) {
            \Log::error("Failed to send reminder to user {$user->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Process scheduled reminders
     */
    public function processScheduledReminders(): int
    {
        $sent = 0;
        
        $reminders = UserReminder::where('is_active', true)
            ->where(function($query) {
                $query->whereNull('next_send_at')
                      ->orWhere('next_send_at', '<=', now());
            })
            ->with('user')
            ->get();

        foreach ($reminders as $reminder) {
            // Respect Do Not Disturb hours (10 PM - 7 AM)
            $hour = now()->hour;
            if ($hour >= 22 || $hour < 7) {
                continue;
            }

            if ($this->sendReminder($reminder->user, $reminder->type)) {
                $reminder->last_sent_at = now();
                $reminder->calculateNextSendTime();
                $sent++;
            }
        }

        return $sent;
    }

    /**
     * Create default reminders for new user
     */
    public function createDefaultReminders(User $user): void
    {
        $defaults = [
            ['type' => 'study', 'frequency' => 'daily', 'preferred_time' => '09:00'],
            ['type' => 'habit', 'frequency' => 'daily', 'preferred_time' => '20:00'],
        ];

        foreach ($defaults as $default) {
            UserReminder::create(array_merge($default, ['user_id' => $user->id]));
        }
    }
}
