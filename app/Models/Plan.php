<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price', 
        'duration',
        'description',
        'features',
        'is_active',
        'max_subtasks',
        'has_ai_assistant',
        'ai_chat_limit',
        'has_productivity_report',
        'has_auto_open_url',
        'has_quick_notes',
        'max_guild_members',
        'has_ai_guild_features',
        'has_journal_access',
        'has_learning_hub_access',
        'has_gamification_access',
        'has_ai_genius_access',
        'whatsapp_reminder_limit',
        'journal_limit',
    ];

    protected $casts = [
        'price' => 'integer',
        'features' => 'array',
        'is_active' => 'boolean',
        'max_subtasks' => 'integer',
        'has_ai_assistant' => 'boolean',
        'ai_chat_limit' => 'integer',
        'has_productivity_report' => 'boolean',
        'has_auto_open_url' => 'boolean',
        'has_quick_notes' => 'boolean',
        'max_guild_members' => 'integer',
        'has_ai_guild_features' => 'boolean',
        'has_journal_access' => 'boolean',
        'has_learning_hub_access' => 'boolean',
        'has_gamification_access' => 'boolean',
        'has_ai_genius_access' => 'boolean',
        'whatsapp_reminder_limit' => 'integer',
        'journal_limit' => 'integer',
    ];

    protected $attributes = [
        'is_active' => true,
        'features' => '[]'
    ];

    /**
     * Relationship with subscriptions
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'plan', 'name');
    }

    /**
     * Scope active plans
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get formatted duration
     */
    public function getFormattedDurationAttribute(): string
    {
        return $this->duration === 'monthly' ? 'bulan' : 'tahun';
    }
}