<?php
require __DIR__."/vendor/autoload.php";
$app = require_once __DIR__."/bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$task = App\Models\Task::with("user")->where("is_completed", false)->first();
if (!$task) die("No task found");
$user = $task->user;

auth()->login($user);

$controller = app(App\Http\Controllers\Api\KanbanController::class);
try {
    $response = $controller->toggleComplete($task);
    echo "Success!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}

