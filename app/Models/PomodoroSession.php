<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomodoroSession extends Model
{
    use HasFactory;

     protected $fillable = [
        'focus_minutes',
        'break_minutes',
        'started_at',
        'ended_at',
        'blocked_urls',
        'user_id',
          'manually_stopped', 
        'tab_switches',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
