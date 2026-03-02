<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $user = \App\Models\User::first();
    
    $req = new \Illuminate\Http\Request();
    $req->setUserResolver(function () use ($user) { return $user; });
    $user->update(['phone' => '1234567890']);
    $tomorrow = now($user->timezone ?? 'WIB')->addDay()->toDateString();
    
    $req->merge([
        'title' => 'Test Task with Deadline',
        'status' => 'todo',
        'priority' => 'Sedang',
        'estimated_minutes' => 25,
        'due_date' => $tomorrow,
        'start_date' => now()->toDateString(),
    ]);

    $controller = app(\App\Http\Controllers\Api\KanbanController::class);
    
    // Create equivalent of FormRequest
    $storeReq = \App\Http\Requests\StoreTaskRequest::createFrom($req);
    $storeReq->setContainer(app());
    $storeReq->validateResolved();

    $response = $controller->store($storeReq);
    
    echo "SUCCESS: " . $response->getStatusCode() . PHP_EOL;
    echo $response->getContent() . PHP_EOL;

} catch (\Throwable $e) {
    echo "ERROR: " . get_class($e) . " - " . $e->getMessage() . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
}
