<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'user_id', 
        'plan', 
        'status', 
        'price',
        'duration',
        'promo_code',
        'discount_amount',
        'final_price',
        'expired_at',
        'paid_at',
        'payment_type',
        'midtrans_order_id', 
        'midtrans_transaction_id',
        'snap_token'
    ];

    // TAMBAHKAN CAST UNTUK TANGGAL
    protected $casts = [
        'expired_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function planDetail()
    {
        return $this->hasOne(Plan::class, 'name', 'plan');
    }
}