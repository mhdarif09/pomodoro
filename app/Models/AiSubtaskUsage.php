<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiSubtaskUsage extends Model
{
    use HasFactory;

    protected $table = 'ai_subtask_usage';
    
    protected $fillable = [
        'user_id',
        'count',
        'month',
    ];

    protected $casts = [
        'count' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create usage record for current month
     */
    public static function getUsageForMonth($userId, $month = null)
    {
        $month = $month ?? now()->format('Y-m');
        
        return self::firstOrCreate(
            ['user_id' => $userId, 'month' => $month],
            ['count' => 0]
        );
    }
}
