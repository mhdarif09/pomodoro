<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuildQuest extends Model
{
    use HasFactory;

    protected $fillable = [
        'guild_id',
        'title',
        'target_type',
        'target_amount',
        'current_progress',
        'reward_xp',
        'is_completed',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_completed' => 'boolean',
    ];

    public function guild()
    {
        return $this->belongsTo(Guild::class);
    }
}
