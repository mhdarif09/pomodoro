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
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'due_date' => 'date',
        'start_date' => 'date',
        'ai_suggested_subtasks' => 'array',
        'reminder_at' => 'datetime',
        'reminder_sent' => 'boolean',
    ];

    /**
     * Mendefinisikan bahwa sebuah Task dimiliki oleh seorang User.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function subtasks()
    {
        return $this->hasMany(Subtask::class);
    }
}