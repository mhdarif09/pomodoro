<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskRecoveryHistory extends Model
{
    protected $table = 'task_recovery_history';
    
    protected $fillable = [
        'user_id',
        'tasks_before_recovery',
        'tasks_archived',
        'tasks_rescheduled',
        'tasks_kept',
        'recovery_details',
    ];
    
    protected $casts = [
        'recovery_details' => 'array',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
