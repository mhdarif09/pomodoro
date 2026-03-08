<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CognitiveArenaMatch extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'simulation_id',
        'user_answer',
        'time_taken_seconds',
        'ai_feedback_text',
        'stat_changes',
        'xp_earned',
        'completed',
    ];

    protected $casts = [
        'stat_changes' => 'array',
        'completed' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function simulation()
    {
        return $this->belongsTo(CognitiveSimulation::class, 'simulation_id');
    }
}
