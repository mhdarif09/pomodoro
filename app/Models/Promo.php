<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'is_active',
        'expires_at',
        'usage_limit',
        'usage_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
        'discount_value' => 'integer',
        'usage_limit' => 'integer',
        'usage_count' => 'integer',
    ];

    public function isValid()
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) return false;
        return true;
    }

    public function calculateDiscount($originalPrice)
    {
        if ($this->discount_type === 'percentage') {
            return ($originalPrice * $this->discount_value) / 100;
        }
        return min($originalPrice, $this->discount_value);
    }
}
