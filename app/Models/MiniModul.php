<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class MiniModul extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'title', 'slug', 'description', 'thumbnail', 
        'difficulty', 'estimated_duration', 'tags', 'sort_order', 'is_published'
    ];

    protected $casts = [
        'tags' => 'array',
        'is_published' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($modul) {
            if (!$modul->slug) {
                $modul->slug = Str::slug($modul->title);
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(MiniModulCategory::class, 'category_id');
    }

    public function chapters()
    {
        return $this->hasMany(MiniModulChapter::class)->orderBy('chapter_number');
    }

    public function publishedChapters()
    {
        return $this->hasMany(MiniModulChapter::class)->where('is_published', true)->orderBy('chapter_number');
    }

    public function userProgress()
    {
        return $this->hasMany(UserModulProgress::class);
    }

    public function userProgressForUser($userId)
    {
        return $this->userProgress()->where('user_id', $userId);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhereJsonContains('tags', $search);
        });
    }

    public function getProgressPercentageAttribute()
    {
        if (auth()->check()) {
            $totalChapters = $this->publishedChapters()->count();
            $completedChapters = $this->userProgressForUser(auth()->id())->where('is_completed', true)->count();
            
            return $totalChapters > 0 ? round(($completedChapters / $totalChapters) * 100) : 0;
        }
        
        return 0;
    }

    public function getTotalDurationAttribute()
    {
        return $this->chapters()->sum('estimated_duration');
    }
}
