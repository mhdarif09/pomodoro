<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'type',
        'xp_reward',
        'points_reward',
        'requirements',
        'is_active',
        'starts_at',
        'ends_at',
        'is_team_mission',
        'guild_id',
    ];

    protected $casts = [
        'requirements' => 'array',
        'is_active' => 'boolean',
        'is_team_mission' => 'boolean',
        'starts_at' => 'date',
        'ends_at' => 'date',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_challenges')
            ->withPivot('progress', 'completed', 'completed_at')
            ->withTimestamps();
    }

    public function guild()
    {
        return $this->belongsTo(Guild::class);
    }
}
