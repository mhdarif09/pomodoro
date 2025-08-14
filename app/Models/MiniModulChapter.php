<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class MiniModulChapter extends Model
{
    use HasFactory;

    protected $fillable = [
        'mini_modul_id', 'title', 'slug', 'content', 'content_type', 
        'media_files', 'ai_prompt', 'chapter_number', 'estimated_duration', 'is_published'
    ];

    protected $casts = [
        'media_files' => 'array',
        'is_published' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($chapter) {
            if (!$chapter->slug) {
                $chapter->slug = Str::slug($chapter->title);
            }
        });
    }

    public function miniModul()
    {
        return $this->belongsTo(MiniModul::class);
    }

    public function userProgress()
    {
        return $this->hasMany(UserModulProgress::class, 'chapter_id');
    }

    public function userProgressForUser($userId)
    {
        return $this->userProgress()->where('user_id', $userId)->first();
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function getIsCompletedAttribute()
    {
        if (auth()->check()) {
            $progress = $this->userProgressForUser(auth()->id());
            return $progress ? $progress->is_completed : false;
        }
        
        return false;
    }

    public function getNextChapterAttribute()
    {
        return $this->miniModul->chapters()
            ->where('chapter_number', '>', $this->chapter_number)
            ->where('is_published', true)
            ->orderBy('chapter_number')
            ->first();
    }

    public function getPrevChapterAttribute()
    {
        return $this->miniModul->chapters()
            ->where('chapter_number', '<', $this->chapter_number)
            ->where('is_published', true)
            ->orderByDesc('chapter_number')
            ->first();
    }
}