<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Auth\GoogleLoginController;
use App\Http\Controllers\VoiceController;
use App\Http\Controllers\OnboardingController;

use App\Http\Controllers\ReflectionController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\MiniModulCategoryController;
use App\Http\Controllers\Admin\MiniModulController as AdminMiniModulController;
use App\Http\Controllers\Admin\MiniModulChapterController;
use App\Http\Controllers\MiniModulController;
use App\Http\Controllers\Api\MiniModulAiController;
use App\Http\Controllers\DocumentPageController;
use App\Http\Controllers\LearningController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// --- PUBLIC ROUTES ---
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/terms-of-service', fn() => Inertia::render('TermsOfService'))->name('terms.show');
Route::get('/privacy-policy', fn() => Inertia::render('PrivacyPolicy'))->name('policy.show');
Route::get("/about", fn() => Inertia::render('About'))->name('about');

Route::get('/login/google/redirect', [GoogleLoginController::class, 'redirectToGoogle'])->name('login.google.redirect');
Route::get('/login/google/callback', [GoogleLoginController::class, 'handleGoogleCallback'])->name('login.google.callback');

Route::get('/pricing', [SubscriptionController::class, 'index'])->name('subscribe.index');
Route::post('/webhook/midtrans', [WebhookController::class, 'handle'])->name('midtrans.webhook');

// --- AUTHENTICATED ROUTES ---
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Core Dashboard & Profile
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/dismiss-upgrade-modal', [DashboardController::class, 'dismissUpgradeModal'])->name('dashboard.dismiss-upgrade-modal');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/tutorial-seen', [ProfileController::class, 'markTutorialSeen'])->name('profile.tutorial-seen');

    // General Features
    // General Features
    // Task routes moved to API
    Route::get('/voice', fn() => inertia('Voice/Index'))->name('voice.index');

    // Subscription Routes with Rate Limiting
    Route::post('/subscribe/checkout', [SubscriptionController::class, 'checkout'])
        ->middleware('throttle:5,1') // Max 5 requests per minute
        ->name('subscribe.checkout');
    Route::post('/subscribe/direct-checkout', [SubscriptionController::class, 'directCheckout'])
        ->middleware('throttle:5,1')
        ->name('subscribe.direct-checkout');
    Route::get('/subscription/payment-success', [SubscriptionController::class, 'paymentSuccessRedirect'])->name('subscription.payment.success');
    Route::get('/subscription/payment-cancel', [SubscriptionController::class, 'paymentCancel'])->name('subscription.payment.cancel');
    Route::post('/subscription/dismiss-modal', [SubscriptionController::class, 'dismissModal'])->name('subscription.dismiss-modal');


    // =========================================================================
    // === INTERNAL API ROUTES (JSON DATA) ===
    // =========================================================================
    // =========================================================================
    // === INTERNAL API ROUTES (JSON DATA) ===
    // =========================================================================
    Route::prefix('dashboard/api')->name('api.')->group(function() {
        // Auth
        Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login'])->name('login');
        Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout'])->name('logout');
        
        // Tasks & Kanban
        Route::get('/kanban', [\App\Http\Controllers\Api\KanbanController::class, 'index'])->name('kanban.index');
        Route::post('/tasks', [\App\Http\Controllers\Api\KanbanController::class, 'store'])->name('tasks.store');
        Route::patch('/tasks/{task}', [\App\Http\Controllers\Api\KanbanController::class, 'update'])->name('tasks.update');
        Route::delete('/tasks/{task}', [\App\Http\Controllers\Api\KanbanController::class, 'destroy'])->name('tasks.destroy');
        Route::patch('/tasks/{task}/toggle-complete', [\App\Http\Controllers\Api\KanbanController::class, 'toggleComplete'])->name('tasks.toggle-complete');
        
        // Subtasks
        Route::post('/tasks/{task}/subtasks', [\App\Http\Controllers\Api\SubtaskController::class, 'store'])->name('subtasks.store');
        Route::patch('/subtasks/{subtask}', [\App\Http\Controllers\Api\SubtaskController::class, 'update'])->name('subtasks.update');
        Route::delete('/subtasks/{subtask}', [\App\Http\Controllers\Api\SubtaskController::class, 'destroy'])->name('subtasks.destroy');

        // Documents
        Route::get('/documents', [\App\Http\Controllers\Api\DocumentController::class, 'index'])->name('documents.index');
        Route::post('/documents', [\App\Http\Controllers\Api\DocumentController::class, 'store'])->name('documents.store');
        Route::get('/documents/{document}', [\App\Http\Controllers\Api\DocumentController::class, 'show'])->name('documents.show');
        Route::patch('/documents/{document}', [\App\Http\Controllers\Api\DocumentController::class, 'update'])->name('documents.update');
        Route::delete('/documents/{document}', [\App\Http\Controllers\Api\DocumentController::class, 'destroy'])->name('documents.destroy');
        Route::post('/documents/{document}/toggle-sharing', [\App\Http\Controllers\Api\DocumentController::class, 'toggleSharing'])->name('documents.toggle-sharing');
        Route::post('/documents/{document}/invite', [\App\Http\Controllers\Api\DocumentController::class, 'invite'])->name('documents.invite');
        
        // Pomodoro
        Route::post('/pomodoro', [\App\Http\Controllers\Api\PomodoroController::class, 'store'])->name('pomodoro.store');

        // User Activity Tracking
        Route::post('/heartbeat', [\App\Http\Controllers\Api\UserActivityController::class, 'heartbeat'])->name('heartbeat');
    });

    // =========================================================================
    // === VIEW ROUTES (MAIN) ===
    // =========================================================================
    Route::prefix('dashboard')->group(function() {

        // --- Learning Hub (Pomodoro + Mini Modul) ---
        Route::get('/learning', [LearningController::class, 'index'])->name('learning.index');
        
        // --- History / Transactions ---
        Route::get('/transactions', [SubscriptionController::class, 'history'])->name('transactions.history');

        // --- Docs View ---
        Route::get('/docs', [DocumentPageController::class, 'index'])->name('docs.index');
        Route::get('/docs/{document}', [DocumentPageController::class, 'show'])->name('docs.show'); // Still needed for the main view wrapper
        Route::get('/docs/{document}/export', [DocumentPageController::class, 'exportDocx'])->name('docs.export');
        


        // Mini Moduls (Previously AI Assistant View was here, moved to premium)

        // --- Mini Moduls ---
        Route::prefix('mini-moduls')->name('mini-moduls.')->group(function () {
            Route::get('/', [MiniModulController::class, 'index'])->name('index');
            Route::get('/{miniModul:slug}', [MiniModulController::class, 'show'])->name('show');
            Route::get('/{miniModul:slug}/{chapter:slug}', [MiniModulController::class, 'chapter'])->name('chapter');
            
            Route::post('/{miniModul}/{chapter}/complete', [MiniModulController::class, 'completeChapter'])->name('complete-chapter');
            
            Route::prefix('{miniModul}/{chapter}')->name('ai.')->group(function () {
                Route::post('/ai/discuss', [MiniModulAiController::class, 'startDiscussion'])->name('discuss');
                Route::get('/ai/discussions', [MiniModulAiController::class, 'getDiscussions'])->name('discussions');
                Route::post('/ai/role-play', [MiniModulAiController::class, 'simulateRole'])->name('role-play');
            });
        });
        
    });

    // Premium Routes moved or integrated
    Route::middleware(['premium'])->group(function () {
        // Handled via API or integrated in Dashboard
    });

});

// --- DOCS SHARING (PUBLIC) ---
Route::get('/share/docs/{share_token}', [DocumentPageController::class, 'showPublic'])->name('docs.share');

// --- ADMIN ROUTES ---
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', AdminDashboardController::class)->name('dashboard');

    // Admin Users Management
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/promote', [AdminUserController::class, 'promote'])->name('users.promote');
    Route::post('/users/{user}/demote', [AdminUserController::class, 'demote'])->name('users.demote');
    Route::post('/users/{user}/ban', [AdminUserController::class, 'ban'])->name('users.ban');
    Route::post('/users/{user}/unban', [AdminUserController::class, 'unban'])->name('users.unban');
    Route::post('/users/{user}/make-admin', [AdminUserController::class, 'makeAdmin'])->name('users.make-admin');
    Route::post('/users/{user}/revoke-admin', [AdminUserController::class, 'revokeAdmin'])->name('users.revoke-admin');

    // Admin Plans Management
    Route::resource('plans', PlanController::class)->except(['create', 'edit', 'show']);
    Route::post('/plans/bulk-update', [PlanController::class, 'bulkUpdate'])->name('plans.bulk-update');
    Route::patch('/plans/{plan}/toggle-status', [PlanController::class, 'toggleStatus'])->name('plans.toggle-status');
    
    // Admin Mini Moduls Management
    Route::resource('mini-modul-categories', MiniModulCategoryController::class);
    Route::resource('mini-moduls', AdminMiniModulController::class);
    
    Route::prefix('mini-moduls/{miniModul}')->name('mini-moduls.')->group(function () {
        Route::resource('chapters', MiniModulChapterController::class);
        Route::post('chapters/reorder', [MiniModulChapterController::class, 'reorder'])->name('chapters.reorder');
    });
});

// --- PREMIUM ROUTES (AI Assistant) ---
Route::middleware(['auth', 'verified', 'premium'])->prefix('dashboard')->group(function () {
    // --- AI Assistant API ---
    Route::prefix('api/ai')->name('api.ai.')->group(function() {
        Route::get('/sessions', [\App\Http\Controllers\Api\ChatAssistantController::class, 'getSessions'])->name('sessions');
        Route::post('/sessions', [\App\Http\Controllers\Api\ChatAssistantController::class, 'storeSession'])->name('store-session');
        Route::get('/sessions/{session}', [\App\Http\Controllers\Api\ChatAssistantController::class, 'getMessages'])->name('messages');
        Route::post('/sessions/{session}/messages', [\App\Http\Controllers\Api\ChatAssistantController::class, 'sendMessage'])->name('send-message');
        Route::delete('/sessions/{session}', [\App\Http\Controllers\Api\ChatAssistantController::class, 'destroySession'])->name('destroy-session');
    });

    // --- AI Assistant View ---
    Route::get('/ai-assistant', [\App\Http\Controllers\AIAssistantPageController::class, 'index'])->name('ai-assistant.index');
});

require __DIR__.'/auth.php';