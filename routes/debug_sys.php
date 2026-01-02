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

    // 3. Check Service Logic (Real Call)
    try {
        $service = app(TaskAIService::class);
        $task = new \App\Models\Task([
            'title' => 'Test AI Debug Task',
            'description' => 'Ini adalah task percobaan untuk debug sistem AI.',
            'estimated_minutes' => 60
        ]);
        // Mock ID for logging purposes in service
        $task->id = 999999; 
        
        $result = $service->suggestSubtasks($task);
        
        $checks['full_ai_test'] = $result;
    } catch (\Exception $e) {
        $checks['full_ai_test'] = [
            'success' => false,
            'exception' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ];
    }
    
    // 4. Check Environment
    $checks['app_env'] = Config::get('app.env');
    $checks['php_version'] = phpversion();

    return response()->json($checks);
});
