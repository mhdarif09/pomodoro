<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;

class TaskReminderScheduler
{
    public function applyDefaultReminder(Task $task, User $user): void
    {
        if (!$task->due_date || !$user->default_reminder_enabled) {
            return;
        }

        $timezone = $this->resolveTimezone($user->timezone ?? 'WIB');
        $daysBefore = (int) ($user->default_reminder_days_before ?? 1);
        $daysBefore = max(0, min(7, $daysBefore));
        $time = $this->normalizeTime($user->default_reminder_time ?? '09:00');

        $dueLocal = Carbon::parse($task->due_date, $timezone)->startOfDay();
        $reminderLocal = $dueLocal
            ->copy()
            ->subDays($daysBefore)
            ->setTimeFromTimeString($time);

        if ($reminderLocal->lte(now($timezone))) {
            $reminderLocal = now($timezone)->addMinutes(5);
        }

        $task->forceFill([
            'reminder_at' => $reminderLocal->setTimezone(config('app.timezone', 'UTC')),
            'reminder_sent' => false,
            'reminder_strategy' => 'custom_default',
        ])->save();
    }

    public function applyManualReminder(Task $task, Carbon $reminderAt): void
    {
        $task->forceFill([
            'reminder_at' => $reminderAt,
            'reminder_sent' => false,
            'reminder_strategy' => 'custom_manual',
        ])->save();
    }

    private function normalizeTime(string $time): string
    {
        if (preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time) === 1) {
            return $time;
        }

        return '09:00';
    }

    private function resolveTimezone(string $timezone): string
    {
        return match ($timezone) {
            'WITA' => 'Asia/Makassar',
            'WIT' => 'Asia/Jayapura',
            default => 'Asia/Jakarta',
        };
    }
}

