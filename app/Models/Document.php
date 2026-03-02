<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'share_token',
        'is_public',
        'guild_id',
        'is_pinned',
    ];

    protected $casts = [
        'content' => 'array',
        'is_public' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function guild()
    {
        return $this->belongsTo(Guild::class);
    }

     public function collaborators()
    {
        return $this->belongsToMany(User::class, 'document_user')
                    ->withPivot('role')
                    ->withTimestamps();
    }
}
