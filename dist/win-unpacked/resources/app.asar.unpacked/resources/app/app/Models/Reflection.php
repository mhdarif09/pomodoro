<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reflection extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'ai_question',
        'user_answer',
        'ai_feedback',
        'reflection_date',
    ];
    
    public function user() {
        return $this->belongsTo(User::class);
    }
}