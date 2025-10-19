<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Carbon\Carbon;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'banned_at',
        'growth_goals',
        'learning_style',
        'focus_time',
        'personal_motivation',
        'onboarding_complete',
        'personality_summary',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'growth_goals' => 'array',
        'onboarding_complete' => 'boolean',
    ];

    // Relasi ke Subscription (ambil yang terbaru)
    public function subscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    // Accessor untuk mengetahui apakah user premium
    public function getIsPremiumAttribute(): bool
    {
        return $this->subscription &&
               $this->subscription->status === 'paid' &&
               $this->subscription->expired_at &&
               $this->subscription->expired_at->isFuture();
    }

    // Accessor untuk mengetahui apakah user dibanned
    public function getIsBannedAttribute(): bool
    {
        return !is_null($this->banned_at);
    }

    public function pomodoroSessions()
    {
        return $this->hasMany(PomodoroSession::class);
    }

    public function todaysGoal()
    {
        return $this->hasOne(DailyGoal::class)->whereDate('goal_date', today());
    }

    public function dailyGoals()
    {
        return $this->hasMany(DailyGoal::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
    
    public function reflections()
    {
        return $this->hasMany(Reflection::class);
    }
}
