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
        'is_private',
        'emblem',
        'invite_code',
        'max_members',
        'total_xp',
        'weekly_xp',
        'weekly_xp_reset_at',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($guild) {
            if (empty($guild->invite_code)) {
                $guild->invite_code = strtoupper(\Illuminate\Support\Str::random(8));
            }
        });
    }

    protected $casts = [
        'weekly_xp_reset_at' => 'datetime',
        'is_private' => 'boolean',
    ];

    /**
     * Guild members relationship
     */
    public function members()
    {
        return $this->belongsToMany(User::class, 'guild_members')
            ->withPivot('role', 'contribution_xp', 'weekly_contribution_xp')
            ->withTimestamps();
    }

    /**
     * Direct guild_members records
     */
    public function guildMembers()
    {
        return $this->hasMany(GuildMember::class);
    }

    /**
     * Guild challenges (team missions)
     */
    public function challenges()
    {
        return $this->hasMany(Challenge::class);
    }

    /**
     * Guild chat messages
     */
    public function chats()
    {
        return $this->hasMany(GuildChat::class)->latest();
    }

    /**
     * Guild tasks (team to-do)
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Guild divisions
     */
    public function divisions()
    {
        return $this->hasMany(GuildDivision::class);
    }

    /**
     * Guild documents
     */
    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Get guild leader
     */
    public function getLeaderAttribute()
    {
        return $this->members()->wherePivot('role', 'leader')->first();
    }

    /**
     * Get leaderboard rank
     */
    public function getLeaderboardRank(): int
    {
        return Guild::where('total_xp', '>', $this->total_xp)->count() + 1;
    }

    /**
     * Check if guild is full
     */
    public function isFull(): bool
    {
        return $this->members()->count() >= $this->max_members;
    }
}
