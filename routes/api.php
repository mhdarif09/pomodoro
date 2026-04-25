<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OpenAIController;

// ==========================
// INTERNAL API (Dashboard)
// ==========================
Route::middleware(['auth:sanctum'])->prefix('dashboard')->name('api.')->group(function() {
    // Auth (Logout is an API call from dashboard)
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout'])->name('logout');
    
    // Tasks & Kanban
    Route::get('/kanban', [\App\Http\Controllers\Api\KanbanController::class, 'index'])->name('kanban.index');
    Route::post('/tasks', [\App\Http\Controllers\Api\KanbanController::class, 'store'])->name('tasks.store');
    Route::patch('/tasks/{task}', [\App\Http\Controllers\Api\KanbanController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [\App\Http\Controllers\Api\KanbanController::class, 'destroy'])->name('tasks.destroy');
    Route::patch('/tasks/{task}/toggle-complete', [\App\Http\Controllers\Api\KanbanController::class, 'toggleComplete'])->name('tasks.toggle-complete');
    Route::patch('/tasks/{task}/toggle-focus', [\App\Http\Controllers\Api\KanbanController::class, 'toggleFocus'])->name('tasks.toggle-focus');
    Route::post('/tasks/{task}/dismiss-suggestion', [\App\Http\Controllers\Api\KanbanController::class, 'dismissSuggestion'])->name('tasks.dismiss-suggestion');
    Route::post('/tasks/focus-round-complete', [\App\Http\Controllers\Api\KanbanController::class, 'completeFocusRound'])->name('tasks.focus-round-complete');
    
    // AI Task Features
    Route::post('/tasks/{task}/suggest-breakdown', [\App\Http\Controllers\Api\KanbanController::class, 'suggestBreakdown'])->name('tasks.suggest-breakdown');
    Route::post('/tasks/reschedule-failed', [\App\Http\Controllers\Api\KanbanController::class, 'rescheduleFailedTasks'])->name('tasks.reschedule-failed');
    
    // Subtasks
    Route::post('/tasks/{task}/subtasks', [\App\Http\Controllers\Api\SubtaskController::class, 'store'])->name('subtasks.store');
    Route::patch('/subtasks/{subtask}', [\App\Http\Controllers\Api\SubtaskController::class, 'update'])->name('subtasks.update');
    Route::delete('/subtasks/{subtask}', [\App\Http\Controllers\Api\SubtaskController::class, 'destroy'])->name('subtasks.destroy');

    // Tags
    Route::get('/tags', [\App\Http\Controllers\Api\TagController::class, 'index'])->name('tags.index');
    Route::post('/tags', [\App\Http\Controllers\Api\TagController::class, 'store'])->name('tags.store');
    Route::delete('/tags/{tag}', [\App\Http\Controllers\Api\TagController::class, 'destroy'])->name('tags.destroy');

    // Documents
    Route::get('/documents/search', [\App\Http\Controllers\Api\DocumentController::class, 'search'])->name('documents.search');
    Route::get('/documents', [\App\Http\Controllers\Api\DocumentController::class, 'index'])->name('documents.index');
    Route::post('/documents', [\App\Http\Controllers\Api\DocumentController::class, 'store'])->name('documents.store');
    Route::get('/documents/{document}', [\App\Http\Controllers\Api\DocumentController::class, 'show'])->name('documents.show');
    Route::patch('/documents/{document}', [\App\Http\Controllers\Api\DocumentController::class, 'update'])->name('documents.update');
    Route::delete('/documents/{document}', [\App\Http\Controllers\Api\DocumentController::class, 'destroy'])->name('documents.destroy');
    Route::post('/documents/{document}/toggle-sharing', [\App\Http\Controllers\Api\DocumentController::class, 'toggleSharing'])->name('documents.toggle-sharing');
    Route::post('/documents/{document}/invite', [\App\Http\Controllers\Api\DocumentController::class, 'invite'])->name('documents.invite');
    
    // Pomodoro
    Route::post('/pomodoro', [\App\Http\Controllers\Api\PomodoroController::class, 'store'])->name('pomodoro.store');
    Route::post('/pomodoro/start', [\App\Http\Controllers\Api\PomodoroController::class, 'startSession'])->name('pomodoro.start');
    Route::get('/pomodoro/active', [\App\Http\Controllers\Api\PomodoroController::class, 'getActiveSession'])->name('pomodoro.active');
    Route::post('/pomodoro/stop', [\App\Http\Controllers\Api\PomodoroController::class, 'stopActiveSession'])->name('pomodoro.stop');
    Route::get('/focus/analytics', [\App\Http\Controllers\Api\PomodoroController::class, 'getFocusAnalytics'])->name('focus.analytics');

    // User Activity Tracking
    Route::post('/heartbeat', [\App\Http\Controllers\Api\UserActivityController::class, 'heartbeat'])->name('heartbeat');

    // Gamification & Cashback API
    Route::get('/challenges/active', [\App\Http\Controllers\Api\ChallengeController::class, 'getActive'])->name('challenges.active');
    Route::get('/challenges/history', [\App\Http\Controllers\Api\ChallengeController::class, 'getHistory'])->name('challenges.history');
    
    // Streak API
    Route::get('/gamification/streak', [\App\Http\Controllers\Api\GamificationController::class, 'getStreak'])->name('gamification.streak');
    Route::get('/gamification/weekly-journey', [\App\Http\Controllers\Api\GamificationController::class, 'getWeeklyJourney'])->name('gamification.weekly-journey');
    
    Route::get('/points/balance', [\App\Http\Controllers\Api\PointsController::class, 'getBalance'])->name('points.balance');
    
    Route::post('/cashback/redeem', [\App\Http\Controllers\Api\CashbackController::class, 'redeemToPromoCode'])->name('cashback.redeem');
    Route::get('/cashback/history', [\App\Http\Controllers\Api\CashbackController::class, 'getRedemptionHistory'])->name('cashback.history');
    
    // Productivity Features
    Route::get('/productivity/priority-tasks', [\App\Http\Controllers\ProductivityController::class, 'priorityRecommendations'])->name('productivity.priority-tasks');
    Route::get('/productivity/continue-work', [\App\Http\Controllers\ProductivityController::class, 'continueWork'])->name('productivity.continue-work');
    Route::get('/productivity/recovery-plan', [\App\Http\Controllers\ProductivityController::class, 'recoveryPlan'])->name('productivity.recovery-plan');
    Route::post('/productivity/recovery-apply', [\App\Http\Controllers\ProductivityController::class, 'applyRecovery'])->name('productivity.apply-recovery');
    Route::get('/productivity/daily-focus-stats', [\App\Http\Controllers\ProductivityController::class, 'dailyFocusStats'])->name('productivity.daily-focus-stats');
    Route::post('/tasks/{task}/set-daily-focus', [\App\Http\Controllers\ProductivityController::class, 'setDailyFocus'])->name('tasks.set-daily-focus');
    Route::post('/tasks/{task}/move-tomorrow', [\App\Http\Controllers\ProductivityController::class, 'moveToTomorrow'])->name('tasks.move-tomorrow');
    
    // Guild Voice Signaling
    Route::post('/voice/join', [\App\Http\Controllers\Api\VoiceSessionController::class, 'join'])->name('voice.join');
    Route::post('/voice/leave', [\App\Http\Controllers\Api\VoiceSessionController::class, 'leave'])->name('voice.leave');
    Route::get('/voice/peers', [\App\Http\Controllers\Api\VoiceSessionController::class, 'peers'])->name('voice.peers');

    // 📊 Productivity Stats (Session Context)
    Route::get('/productivity/summary', [\App\Http\Controllers\Api\ProductivityController::class, 'summary'])->name('productivity.summary');
    Route::get('/productivity/trends', [\App\Http\Controllers\Api\ProductivityController::class, 'trends'])->name('productivity.trends');
    Route::get('/productivity/insights', [\App\Http\Controllers\Api\ProductivityController::class, 'insights'])->name('productivity.insights');
    Route::get('/productivity/report', [\App\Http\Controllers\Api\ReportController::class, 'downloadWeeklyReport'])->name('productivity.report');
    
    // --- COGNITIVE ARENA API ---
    Route::get('/cognitive-arena', [\App\Http\Controllers\Api\CognitiveArenaController::class, 'index'])->name('cognitive-arena.index');
    Route::post('/cognitive-arena/generate', [\App\Http\Controllers\Api\CognitiveArenaController::class, 'generate'])->name('cognitive-arena.generate');
    Route::post('/cognitive-arena/matches/{match}/submit', [\App\Http\Controllers\Api\CognitiveArenaController::class, 'submit'])->name('cognitive-arena.submit');

    // --- STREAK SHARE API ---
    Route::get('/gamification/streak-summary', [\App\Http\Controllers\Api\StreakShareController::class, 'summary'])->name('gamification.streak-summary');
});

// ==========================
// AI ASSISTANT ROUTES (PREMIUM)
// ==========================
Route::middleware(['auth:sanctum', 'premium', 'throttle:ai'])->prefix('ai')->name('api.ai.')->group(function () {
    // 🧠 Chat Mode (AI umum)
    Route::post('/ask', [OpenAIController::class, 'ask'])->name('ask');
    // 🧾 List models (OpenAI-compatible providers, incl. Groq)
    Route::get('/models', [OpenAIController::class, 'models'])->name('models');
    // 📄 Reviewer Mode (analisis PDF jurnal)
    Route::post('/ask-from-paper', [OpenAIController::class, 'askFromPaper'])->name('askFromPaper');
    // ✍️ Writer Mode (penulisan akademik otomatis)
    Route::post('/ask-academic-writer', [OpenAIController::class, 'askAcademicWriter'])->name('askAcademicWriter');
    // 📚 Analisis dari file PDF / Excel (fitur unggah)
    Route::post('/ask-from-pdf', [OpenAIController::class, 'askFromPdf'])->name('askFromPdf');
    Route::post('/ask-from-sheet', [OpenAIController::class, 'askFromSheet'])->name('askFromSheet');

    // Chat Sessions
    Route::get('/sessions', [\App\Http\Controllers\Api\ChatAssistantController::class, 'getSessions'])->name('sessions');
    Route::post('/sessions', [\App\Http\Controllers\Api\ChatAssistantController::class, 'storeSession'])->name('store-session');
    Route::get('/sessions/{session}', [\App\Http\Controllers\Api\ChatAssistantController::class, 'getMessages'])->name('messages');
    Route::post('/sessions/{session}/messages', [\App\Http\Controllers\Api\ChatAssistantController::class, 'sendMessage'])->name('send-message');
    Route::delete('/sessions/{session}', [\App\Http\Controllers\Api\ChatAssistantController::class, 'destroySession'])->name('destroy-session');

    // Text Editor Actions
    Route::post('/text-action', [OpenAIController::class, 'processTextAction'])->name('text-action');
});

// ==========================
// MEDIA API
// ==========================
Route::middleware(['auth:sanctum'])->group(function() {
    Route::get('/media/search', [\App\Http\Controllers\Api\MediaController::class, 'search'])->name('api.media.search');
    Route::get('/guilds/leaderboard', [\App\Http\Controllers\GuildController::class, 'leaderboard'])->name('api.guilds.leaderboard');
});

// ==========================
// WEBHOOKS
// ==========================
// 💳 Midtrans Webhook
Route::post('/webhooks/midtrans', [\App\Http\Controllers\PaymentCallbackController::class, 'handle'])
    ->middleware('verify.midtrans.signature')
    ->name('api.midtrans.webhook');
