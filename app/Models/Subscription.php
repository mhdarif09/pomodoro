<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'user_id', 'plan', 'status', 'midtrans_order_id', 'midtrans_transaction_id', 'paid_at'
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
