<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuildMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'guild_id',
        'user_id',
        'role',
        'contribution_xp',
        'weekly_contribution_xp',
        'division_id',
    ];

    public function guild()
    {
        return $this->belongsTo(Guild::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function division()
    {
        return $this->belongsTo(GuildDivision::class);
    }
}
