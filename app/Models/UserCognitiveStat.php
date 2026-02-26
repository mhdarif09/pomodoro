<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserCognitiveStat extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'critical_thinking_level',
        'communication_level',
        'decision_speed',
        'consistency_score',
        'arena_rank',
        'arena_xp',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
