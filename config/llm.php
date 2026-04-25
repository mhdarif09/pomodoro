<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Provider Routing
    |--------------------------------------------------------------------------
    |
    | Mode A (single provider):
    |   LLM_PROVIDER=openai|groq
    |
    | Mode B (fallback):
    |   LLM_PRIMARY_PROVIDER=openai
    |   LLM_SECONDARY_PROVIDER=groq
    |
    */

    // Backward compatible single-provider flag (still supported).
    'provider' => env('LLM_PROVIDER', null),

    'primary_provider' => env('LLM_PRIMARY_PROVIDER', env('LLM_PROVIDER', 'openai')),
    'secondary_provider' => env('LLM_SECONDARY_PROVIDER', null),

    'providers' => [
        'openai' => [
            'api_key' => env('OPENAI_API_KEY'),
            'base_url' => 'https://api.openai.com/v1',
            'default_model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
        ],
        'groq' => [
            'api_key' => env('GROQ_API_KEY'),
            'base_url' => env('GROQ_BASE_URL', 'https://api.groq.com/openai/v1'),
            'default_model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
        ],
    ],

    'model' => env('LLM_MODEL', env('OPENAI_MODEL', 'gpt-4o-mini')),
    'timeout' => (int) env('LLM_REQUEST_TIMEOUT', env('OPENAI_REQUEST_TIMEOUT', 30)),
];
