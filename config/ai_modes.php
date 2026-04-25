<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AI feature modes
    |--------------------------------------------------------------------------
    |
    | Modes:
    |  - 'none'   => do not use AI for this feature
    |  - 'hybrid' => prefer hybrid approach (local + AI)
    |  - 'ai'     => use AI-only behavior
    |
    */

    'default' => env('AI_FEATURE_DEFAULT', 'hybrid'),

    'features' => [
        // Cost-saving defaults: hybrid first, optional AI fallback only when explicitly enabled
        'priority' => env('AI_FEATURE_PRIORITY', 'hybrid'),
        'digital_companion' => env('AI_FEATURE_DIGITAL_COMPANION', 'hybrid'),
        'breakdown' => env('AI_FEATURE_BREAKDOWN', 'hybrid'),
        'motivate' => env('AI_FEATURE_MOTIVATE', 'hybrid'),
        'greeting' => env('AI_FEATURE_GREETING', 'hybrid'),
        'whatsapp_bot' => env('AI_FEATURE_WHATSAPP_BOT', 'hybrid'),
        'whatsapp_ai_service' => env('AI_FEATURE_WHATSAPP_AI_SERVICE', 'hybrid'),

        // Keep pure-AI behavior for chat and learning
        'ai_chat' => env('AI_FEATURE_CHAT', 'ai'),
        'learning' => env('AI_FEATURE_LEARNING', 'ai'),
    ],
];
