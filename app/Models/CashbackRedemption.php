<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashbackRedemption extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'points_spent',
        'cashback_value',
        'promo_code',
        'is_used',
        'used_at',
        'subscription_id',
        'expires_at',
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'used_at' => 'datetime',
        'expires_at' => 'datetime',
        'cashback_value' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subscription()
    {
        // Assuming Subscription model exists or will be created eventually, 
        // using nullable relation mainly for record keeping if needed
        return $this->belongsTo(Subscription::class);
    }
}
