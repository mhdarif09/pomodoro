<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::first();
$bot = app()->make(App\Services\WhatsAppBotService::class);
$text = $bot->processMessage($user, '/help');

$wa = app()->make(App\Services\WhatsAppService::class);
$result = $wa->sendMessage('628123456789', $text);

echo "Sending /help response:\n";
echo json_encode($result);
echo "\n";
