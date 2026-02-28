<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGamificationStat extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'streak',
        'highest_streak',
        'journal_streak',
        'total_xp',
        'rank_title',
        'rank_position',
        'rank_points',
        'last_active_date',
        'last_rank_change',
    ];

    protected $casts = [
        'last_active_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
