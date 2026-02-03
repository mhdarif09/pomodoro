<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
    ];

    /**
     * Users who have progressed in this skill
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_skills')
            ->withPivot('level', 'xp', 'total_xp')
            ->withTimestamps();
    }

    /**
     * Tasks associated with this skill
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
