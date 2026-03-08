<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'title',
        'description',
        'is_completed',
        'status',
        'priority',
        'due_date',
        'start_date',
        'user_id',
        'document_path',
        'auto_open_url',
        'notes',
        'estimated_minutes',
        'ai_suggested_subtasks',
        'complexity_score',
        'auto_rescheduled_count',
        'reminder_at',
        'reminder_sent',
        'created_via',
        'guild_id',
        'is_archived',
        'focus_date',
        'last_touched_at',
        'deadline_reminder_1day_sent',
        'deadline_reminder_3hour_sent',
        'deadline_reminder_30min_sent',
        'is_daily_focus',
        'priority_score',
        'xp_reward',
        'is_mission',
        'funded_by_guild_id',
        'mission_id',
        'assigned_to',
        'completed_by',
        'approval_status',
        'approved_by',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'due_date' => 'date',
        'start_date' => 'date',
        'focus_date' => 'date',
        'ai_suggested_subtasks' => 'array',
        'reminder_at' => 'datetime',
        'reminder_sent' => 'boolean',
        'last_touched_at' => 'datetime',
        'deadline_reminder_1day_sent' => 'boolean',
        'deadline_reminder_3hour_sent' => 'boolean',
        'deadline_reminder_30min_sent' => 'boolean',
        'is_daily_focus' => 'boolean',
        'priority_score' => 'integer',
    ];

    /**
     * Mendefinisikan bahwa sebuah Task dimiliki oleh seorang User.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function completer()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function guild()
    {
        return $this->belongsTo(Guild::class);
    }
    
    public function subtasks()
    {
        return $this->hasMany(Subtask::class);
    }

    public function mission()
    {
        return $this->belongsTo(Task::class, 'mission_id');
    }

    public function comments()
    {
        return $this->hasMany(TaskComment::class);
    }

    public function missionTasks()
    {
        return $this->hasMany(Task::class, 'mission_id');
    }

    /**
     * Scope a query to only include personal tasks.
     */
    public function scopePersonal($query)
    {
        return $query->whereNull('guild_id');
    }

    /**
     * Scope a query to only include guild tasks.
     */
    public function scopeGuild($query, $guildId)
    {
        return $query->where('guild_id', $guildId);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'task_tag');
    }

    /**
     * Touch the task to update last interaction time
     */
    public function touch($attribute = null)
    {
        if ($attribute !== null) {
            return parent::touch($attribute);
        }
        
        $this->update(['last_touched_at' => now()]);
        return parent::touch();
    }

    /**
     * Check if task is untouched for given days
     */
    public function isUntouched(int $days = 3): bool
    {
        return !$this->last_touched_at || 
               $this->last_touched_at->diffInDays(now()) >= $days;
    }

    /**
     * Reset all deadline reminder flags (useful for rescheduled tasks)
     */
    public function resetDeadlineReminders(): void
    {
        $this->update([
            'deadline_reminder_1day_sent' => false,
            'deadline_reminder_3hour_sent' => false,
            'deadline_reminder_30min_sent' => false,
        ]);
    }
}