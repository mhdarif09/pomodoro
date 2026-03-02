<?php

namespace App\Services;

use PostHog\PostHog;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Exception;

class AnalyticsService
{
    /**
     * Identify a user and set global user properties.
     */
    public function identify(User $user): void
    {
        try {
            if (!config('services.posthog.key')) return;

            $properties = $this->getGlobalProperties($user);
            
            PostHog::identify([
                'distinctId' => (string) $user->id,
                'properties' => $properties,
            ]);
        } catch (Exception $e) {
            Log::error('PostHog Identify Error: ' . $e->getMessage(), ['user_id' => $user->id]);
        }
    }

    /**
     * Capture an event for a user.
     */
    public function capture(User $user, string $event, array $properties = []): void
    {
        try {
            if (!config('services.posthog.key')) return;

            $globalProperties = $this->getGlobalProperties($user);
            $mergedProperties = array_merge($globalProperties, $properties);

            PostHog::capture([
                'distinctId' => (string) $user->id,
                'event' => $event,
                'properties' => $mergedProperties,
            ]);
        } catch (Exception $e) {
            Log::error('PostHog Capture Error: ' . $e->getMessage(), ['event' => $event, 'user_id' => $user->id]);
        }
    }

    /**
     * Get auto-attached global properties for the user.
     */
    protected function getGlobalProperties(User $user): array
    {
        return [
            'user_id' => $user->id,
            'plan_name' => $user->subscription_plan_id ? 'premium' : 'free',
            'account_age_days' => $user->created_at ? $user->created_at->diffInDays(now()) : 0,
            'user_role' => $user->is_admin ? 'admin' : 'user',
            'environment' => config('app.env'),
            'app_version' => env('APP_VERSION', '1.0.0'),
        ];
    }
}
