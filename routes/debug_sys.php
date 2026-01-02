<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use App\Models\AiSubtaskUsage;
use App\Services\TaskAIService;

Route::get('/debug-sys', function () {
    $checks = [];

    // 1. Check Config
    $openAIKey = Config::get('services.openai.api_key');
    $checks['openai_config'] = $openAIKey ? 'Present (Starts with ' . substr($openAIKey, 0, 7) . '...)' : 'MISSING';

    // 2. Check Database
    try {
        $count = AiSubtaskUsage::count();
        $checks['db_table_ai_usage'] = "OK (Count: $count)";
    } catch (\Exception $e) {
        $checks['db_table_ai_usage'] = "ERROR: " . $e->getMessage();
    }

    // 3. Check Service Instantiation
    try {
        $service = app(TaskAIService::class);
        $checks['task_ai_service'] = "Instantiated OK";
    } catch (\Exception $e) {
        $checks['task_ai_service'] = "ERROR: " . $e->getMessage();
    }
    
    // 4. Check Environment
    $checks['app_env'] = Config::get('app.env');
    $checks['php_version'] = phpversion();

    return response()->json($checks);
});
