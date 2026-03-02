<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use App\Models\AiSubtaskUsage;
use App\Services\TaskAIService;

Route::get('/debug-sys', function () {
    if (!app()->environment('local')) {
        abort(404);
    }

    // Force display errors for debug
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    $checks = [];

    // 1. Check Config
    $openAIKey = Config::get('services.openai.api_key');
    $checks['openai_config'] = $openAIKey ? 'Present (Starts with ' . substr($openAIKey, 0, 7) . '...)' : 'MISSING';

    // 2. Check Database
    try {
        $count = AiSubtaskUsage::count();
        $checks['db_table_ai_usage'] = "OK (Count: $count)";
    } catch (\Throwable $e) {
        $checks['db_table_ai_usage'] = "ERROR: " . $e->getMessage();
    }

    // 3. Check Service Logic (Real Call)
    try {
        $service = app(TaskAIService::class);
        
        // Use REAL task if available, or create minimal dummy safely
        $task = \App\Models\Task::latest()->first();
        
        if (!$task) {
             $checks['info'] = "No tasks found in DB, skipping full test";
             $result = "Skipped";
        } else {
             $result = $service->suggestSubtasks($task);
        }
        
        $checks['full_ai_test'] = $result;
    } catch (\Throwable $e) {
        $checks['full_ai_test'] = [
            'success' => false,
            'exception' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => substr($e->getTraceAsString(), 0, 500) // Truncate trace
        ];
    }
    
    // 4. Check Environment
    $checks['app_env'] = Config::get('app.env');
    $checks['php_version'] = phpversion();

    return response()->json($checks);
});
