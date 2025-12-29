<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserModulProgress extends Model
{
    use HasFactory;

    protected $table = 'user_modul_progress';

    protected $fillable = [
        'user_id', 'mini_modul_id', 'chapter_id', 'is_completed', 'completed_at', 'ai_discussions'
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'ai_discussions' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function miniModul()
    {
        return $this->belongsTo(MiniModul::class);
    }

    public function chapter()
    {
        return $this->belongsTo(MiniModulChapter::class, 'chapter_id');
    }

    public function markAsCompleted()
    {
        $this->update([
            'is_completed' => true,
            'completed_at' => now(),
        ]);
    }

    public function addAiDiscussion($discussion)
    {
        $discussions = $this->ai_discussions ?? [];
        $discussions[] = [
            'timestamp' => now(),
            'discussion' => $discussion
        ];
        
        $this->update(['ai_discussions' => $discussions]);
    }
}