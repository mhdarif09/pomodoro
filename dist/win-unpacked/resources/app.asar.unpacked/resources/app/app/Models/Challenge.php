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
        'requirements',
        'is_active',
        'starts_at',
        'ends_at',
    ];

    protected $casts = [
        'requirements' => 'array',
        'is_active' => 'boolean',
        'starts_at' => 'date',
        'ends_at' => 'date',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_challenges')
            ->withPivot('progress', 'completed', 'completed_at')
            ->withTimestamps();
    }
}
