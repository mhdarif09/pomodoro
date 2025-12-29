<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'user_id', 
        'plan', 
        'status', 
        'expired_at',    // TAMBAHKAN INI (karena ada di database)
        'paid_at',
        'payment_type',  // TAMBAHKAN INI jika ada di database
        'midtrans_order_id', 
        'midtrans_transaction_id'
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