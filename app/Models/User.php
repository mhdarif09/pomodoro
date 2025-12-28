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
        'phone',
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

    protected $appends = [
        'is_premium',
        'is_banned',
        'premium_features',
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
        // Admin or staff might have full access
        if (strtolower($this->role) === 'admin') {
            return true;
        }

        $subscription = $this->subscription;

        return $subscription &&
               $subscription->status === 'paid' &&
               $subscription->expired_at &&
               $subscription->expired_at->isFuture();
    }

    /**
     * Check if user can access a specific premium feature
     */
    public function canAccessFeature(string $feature): bool
    {
        if (strtolower($this->role) === 'admin') {
            return true;
        }

        if (!$this->is_premium) {
            return false;
        }

        $plan = $this->subscription->planDetail;
        if (!$plan) {
            // If no plan detail found but user is premium, allow base features
            // but for safety, return false if a specific toggle is requested
            return true; 
        }

        return match ($feature) {
            'ai_assistant' => (bool) $plan->has_ai_assistant,
            'productivity_report' => (bool) $plan->has_productivity_report,
            'auto_open_url' => (bool) $plan->has_auto_open_url,
            'quick_notes' => (bool) $plan->has_quick_notes,
            default => true,
        };
    }

    /**
     * Get all premium features as an array
     */
    public function getPremiumFeaturesAttribute(): array
    {
        return [
            'ai_assistant' => $this->canAccessFeature('ai_assistant'),
            'productivity_report' => $this->canAccessFeature('productivity_report'),
            'auto_open_url' => $this->canAccessFeature('auto_open_url'),
            'quick_notes' => $this->canAccessFeature('quick_notes'),
        ];
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

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
    
    public function reflections()
    {
        return $this->hasMany(Reflection::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function chatSessions()
    {
        return $this->hasMany(ChatSession::class);
    }

      public function sharedDocuments()
    {
        return $this->belongsToMany(Document::class, 'document_user')
                    ->withPivot('role')
                    ->withTimestamps();
    }
}
