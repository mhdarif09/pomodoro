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
        'affiliate_code',
        'referred_by_id',
        'affiliate_balance',
    ];

    protected $appends = [
        'is_premium',
        'is_banned',
        'premium_features',
        'active_plan',
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

    /**
     * Get the active plan for the user.
     * Returns the subscription plan or a default "Free" plan structure.
     */
    public function getActivePlanAttribute()
    {
        if ($this->is_premium && $this->subscription && $this->subscription->planDetail) {
            return $this->subscription->planDetail;
        }

        // Default "Free" Plan Limits
        return (object) [
            'name' => 'Free',
            'max_guild_members' => 10,
            'has_ai_guild_features' => false,
            'has_journal_access' => true,
            'has_learning_hub_access' => true,
            'has_gamification_access' => true,
            'has_ai_genius_access' => false,
            'max_subtasks' => 3,
            'ai_chat_limit' => 0,
            'has_ai_assistant' => false,
            'has_productivity_report' => false,
            'has_auto_open_url' => false,
            'has_quick_notes' => false,
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

    // --- Gamification Relationships ---
    
    public function challenges()
    {
        return $this->belongsToMany(Challenge::class, 'user_challenges')
                    ->withPivot('progress', 'completed', 'completed_at')
                    ->withTimestamps();
    }

    public function achievements()
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
                    ->withPivot('unlocked_at')
                    ->withTimestamps();
    }

    public function xpTransactions()
    {
        return $this->hasMany(XpTransaction::class);
    }

    // --- Guild Relationships ---

    public function guilds()
    {
        return $this->belongsToMany(Guild::class, 'guild_members')
            ->withPivot('role', 'contribution_xp', 'weekly_contribution_xp')
            ->withTimestamps();
    }

    public function guild()
    {
        return $this->guilds()->first();
    }

    public function guildMember()
    {
        return $this->hasOne(GuildMember::class);
    }

    /**
     * Get XP required for next level
     */
    public function getXpForNextLevel(): int
    {
        return (int) (100 * $this->level * 1.5);
    }

    /**
     * Get level title based on current level
     */
    public function getLevelTitleAttribute(): string
    {
        return match(true) {
            $this->level >= 50 => 'Legenda',
            $this->level >= 40 => 'Fokus Master',
            $this->level >= 30 => 'Penakluk Produktif',
            $this->level >= 20 => 'Navigator Ahli',
            $this->level >= 10 => 'Penjelajah Berpengalaman',
            default => 'Pemula'
        };
    }

    // --- Affiliate Relationships ---

    public function referredBy()
    {
        return $this->belongsTo(User::class, 'referred_by_id');
    }

    public function referrals()
    {
        return $this->hasMany(Referral::class, 'affiliate_id');
    }

    public function invitedUsers()
    {
        return $this->hasMany(User::class, 'referred_by_id');
    }

    /**
     * Generate unique affiliate code
     */
    public static function generateAffiliateCode($name)
    {
        $base = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $name), 0, 4));
        $code = $base . rand(1000, 9999);
        
        while (self::where('affiliate_code', $code)->exists()) {
            $code = $base . rand(1000, 9999);
        }
        
        return $code;
    }
}

