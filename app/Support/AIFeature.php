<?php

namespace App\Support;

class AIFeature
{
    /**
     * Modes:
     *  - none   => never call external AI
     *  - hybrid => AI first, then local fallback on failure
     *  - ai     => AI-only behavior
     */
    public static function mode(string $feature): string
    {
        $featureMode = (string) config("ai_modes.features.{$feature}", '');
        $defaultMode = (string) config('ai_modes.default', 'hybrid');

        $mode = $featureMode !== '' ? $featureMode : $defaultMode;
        $mode = strtolower(trim($mode));

        return in_array($mode, ['none', 'hybrid', 'ai'], true) ? $mode : 'hybrid';
    }

    public static function allowsAI(string $feature): bool
    {
        return self::mode($feature) !== 'none';
    }

    public static function prefersHybrid(string $feature): bool
    {
        return self::mode($feature) === 'hybrid';
    }
}
