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
        'is_active'
    ];

    protected $casts = [
        'price' => 'integer',
        'features' => 'array',
        'is_active' => 'boolean'
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