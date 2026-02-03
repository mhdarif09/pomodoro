<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserReminder extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'frequency',
        'preferred_time',
        'is_active',
        'settings',
        'last_sent_at',
        'next_send_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array',
        'last_sent_at' => 'datetime',
        'next_send_at' => 'datetime',
        'preferred_time' => 'datetime:H:i',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ReminderLog::class);
    }

    /**
     * Check if reminder should be sent now
     */
    public function shouldSendNow(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if (!$this->next_send_at) {
            return true; // First time
        }

        return $this->next_send_at->isPast();
    }

    /**
     * Calculate next send time based on frequency
     */
    public function calculateNextSendTime(): void
    {
        $now = now();
        
        switch ($this->frequency) {
            case 'daily':
                $this->next_send_at = $now->addDay();
                break;
            case 'weekly':
                $this->next_send_at = $now->addWeek();
                break;
            default:
                $this->next_send_at = $now->addDay();
        }

        // Adjust to preferred time if set
        if ($this->preferred_time) {
            $time = \Carbon\Carbon::parse($this->preferred_time);
            $this->next_send_at->setTime($time->hour, $time->minute);
        }

        $this->save();
    }
}
