<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CognitiveSimulation extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'type',
        'difficulty_level',
        'scenario_text',
        'questions',
        'options',
        'correct_option',
    ];

    protected $casts = [
        'questions' => 'array',
        'options' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function matches()
    {
        return $this->hasMany(CognitiveArenaMatch::class, 'simulation_id');
    }
}
