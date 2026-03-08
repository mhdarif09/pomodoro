<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class XpTopup extends Model
{
    protected $fillable = [
        'guild_id',
        'user_id',
        'amount_xp',
        'amount_idr',
        'status',
        'midtrans_order_id',
        'snap_token',
    ];

    public function guild()
    {
        return $this->belongsTo(Guild::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
