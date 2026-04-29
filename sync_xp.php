<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$stats = \App\Models\UserGamificationStat::all();

foreach ($stats as $stat) {
    $user = $stat->user;
    if ($user) {
        $stat->update([
            'total_xp' => $user->total_xp,
            'streak' => $user->current_streak,
            'highest_streak' => $user->longest_streak,
        ]);
        echo "Updated user {$user->id}: XP {$user->total_xp}, Streak {$user->current_streak}, Best {$user->longest_streak}\n";
    }
}

echo "Sync completed\n";