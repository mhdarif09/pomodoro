<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuildDivision extends Model
{
    use HasFactory;
    protected $fillable = ['guild_id', 'name', 'description'];

    public function guild()
    {
        return $this->belongsTo(Guild::class);
    }

    public function members()
    {
        return $this->hasMany(GuildMember::class, 'division_id');
    }
}
