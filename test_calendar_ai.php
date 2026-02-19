<?php

use App\Models\User;
use App\Services\WhatsAppAIService;
use App\Services\GoogleCalendarService;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Mock User
$user = User::first();
if (!$user) {
    die("No user found. Please migrate and seed.\n");
}

// Set fake token to trigger the 'if token exists' block
$user->google_access_token = 'fake_token'; 
$user->timezone = 'WIB';

// Mock GoogleCalendarService
$mockCalendar = Mockery::mock(GoogleCalendarService::class);
$mockCalendar->shouldReceive('getUpcomingEvents')
    ->with($user, 2)
    ->andReturn([
        [
            'id' => 'evt1',
            'summary' => 'Deep Work Session',
            'start' => date('Y-m-d') . 'T09:00:00+07:00',
            'end' => date('Y-m-d') . 'T11:00:00+07:00',
            'is_all_day' => false
        ],
        [
            'id' => 'evt2',
            'summary' => 'Team Meeting',
            'start' => date('Y-m-d') . 'T13:00:00+07:00',
            'end' => date('Y-m-d') . 'T14:00:00+07:00', // 1 PM - 2 PM
            'is_all_day' => false
        ]
    ]);

// Instantiate AI Service with Mock
$aiService = new WhatsAppAIService($mockCalendar);

echo "Testing AI with Calendar Context...\n";
echo "User: {$user->name}\n";
echo "Simulated Events: Deep Work (9-11), Meeting (13-14)\n\n";

$queries = [
    "Halo, jadwal gue hari ini gimana?",
    "Gue ada slot kosong jam berapa buat ngerjain tugas?",
    "Lagi hectic nih, saranin tugas yang cepet kelar dong."
];

foreach ($queries as $q) {
    echo "---------------------------------------------------\n";
    echo "User: $q\n";
    echo "AI Support: Generating response...\n";
    
    // Temporarily uncomment to print debug prompt in Service if needed
    $response = $aiService->generateResponse($user, $q);
    
    echo "Assistant: $response\n\n";
}
