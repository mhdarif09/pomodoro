<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyGoal extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'goal', 'goal_date', 'is_completed'];
    protected $casts = ['goal_date' => 'date', 'is_completed' => 'boolean'];

    public function user() {
        return $this->belongsTo(User::class);
    }
}