<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AppSetting extends Model
{
    protected $table = 'app_settings';

    protected $fillable = ['key', 'value', 'description', 'group'];

    /**
     * Get a setting value by key with optional default.
     * Results are cached for 60 minutes for performance.
     */
    public static function get(string $key, $default = null)
    {
        return Cache::remember("app_setting_{$key}", 3600, function () use ($key, $default) {
            return static::where('key', $key)->value('value') ?? $default;
        });
    }

    /**
     * Set a setting value by key (creates or updates).
     * Clears the cache for this key.
     */
    public static function set(string $key, $value, ?string $description = null, string $group = 'general')
    {
        Cache::forget("app_setting_{$key}");

        return static::updateOrCreate(
            ['key' => $key],
            array_filter([
                'value' => $value,
                'description' => $description,
                'group' => $group,
            ])
        );
    }

    /**
     * Get all settings grouped.
     */
    public static function allGrouped()
    {
        return static::all()->groupBy('group');
    }
}
