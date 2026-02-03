<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guild extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'invite_code',
        'total_xp',
        'level',
        'capacity',
        'is_private',
    ];

    public function members()
    {
        return $this->belongsToMany(User::class, 'guild_members')
            ->withPivot('role', 'contribution_xp', 'joined_at');
    }

    public function quests()
    {
        return $this->hasMany(GuildQuest::class);
    }
}
