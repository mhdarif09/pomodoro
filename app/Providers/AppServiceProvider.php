<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use PostHog\PostHog;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('services.posthog.key')) {
            // Initialize PostHog globally for backend tracking
            PostHog::init(config('services.posthog.key'), [
                'host' => config('services.posthog.host', 'https://us.i.posthog.com'),
                
                // Real-time tracking settings for PHP
                // "flush_at" => 1: Send HTTP request immediately after capture instead of waiting for a batch.
                // "flush_interval" => 0: Disable time-based background dispatch since PHP is stateless/request-scoped.
                // "sync_mode" => true: Wait for network request to finish before proceeding to avoid data drop upon process termination.
                'flush_at' => 1,
                'flush_interval' => 0,
                'sync_mode' => true,
            ]);
        }
    }
}
