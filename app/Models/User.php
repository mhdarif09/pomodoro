<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Carbon\Carbon;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'banned_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function subscription()
{
    return $this->hasOne(\App\Models\Subscription::class);
}

public function getHasActiveSubscriptionAttribute()
{
    return $this->subscriptions()
        ->where('status', 'paid')
        ->where('expired_at', '>=', Carbon::now())
        ->exists();
}

  public function subscriptions()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

public function isPremium()
{
    return $this->subscription()
        ->where('status', 'paid')
        ->where('expired_at', '>', now())
        ->exists();
}

 public function getIsBannedAttribute(): bool
    {
        return !is_null($this->banned_at);
    }

    /**
     * Atribut untuk memeriksa apakah user premium.
     */
     public function getIsPremiumAttribute(): bool
    {
        // User dianggap premium HANYA JIKA:
        // 1. Memiliki langganan (tidak null)
        // 2. Status langganan adalah 'active'
        // 3. Tanggal expired_at ada (tidak null)
        // 4. Tanggal expired_at belum lewat (ada di masa depan)
        return $this->subscription &&
               $this->subscription->status === 'active' &&
               $this->subscription->expired_at &&
               $this->subscription->expired_at->isFuture();
    }


public function pomodoroSessions()
{
    return $this->hasMany(\App\Models\PomodoroSession::class);
}

}
