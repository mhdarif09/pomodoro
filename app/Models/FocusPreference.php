<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FocusPreference extends Model
{
    protected $fillable = [
        'user_id',
        'task_id',
        'action',
        'task_priority',
        'task_days_until_deadline',
        'task_stagnancy_days',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
