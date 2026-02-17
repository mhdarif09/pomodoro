<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class XpPayout extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount_xp',
        'amount_idr',
        'fee',
        'net_amount_idr',
        'status',
        'payment_details', // JSON or structured string
        'payment_method',
        'account_number',
        'account_name',
        'admin_notes',
        'processed_at',
    ];

    protected $casts = [
        'amount_idr' => 'decimal:2',
        'fee' => 'decimal:2',
        'net_amount_idr' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
