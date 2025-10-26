<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PomodoroController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Auth\GoogleLoginController;
use App\Http\Controllers\VoiceController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\DailyGoalController;
use App\Http\Controllers\ReflectionController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\MiniModulCategoryController;
use App\Http\Controllers\Admin\MiniModulController as AdminMiniModulController;
use App\Http\Controllers\Admin\MiniModulChapterController;
use App\Http\Controllers\MiniModulController;
use App\Http\Controllers\MiniModulAiController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\TaskController;
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

    // General Features
    Route::post('/daily-goal', [DailyGoalController::class, 'storeOrUpdate'])->name('daily-goal.store');
    Route::patch('/tasks/{task}/toggle-complete', [TaskController::class, 'toggleComplete'])->name('tasks.toggle-complete');
    Route::resource('tasks', TaskController::class)->only(['store', 'update', 'destroy']);
    Route::get('/voice', fn() => inertia('Voice/Index'))->name('voice.index');

    // Subscription Routes
    Route::post('/subscribe/checkout', [SubscriptionController::class, 'checkout'])->name('subscribe.checkout');
    Route::post('/subscribe/direct-checkout', [SubscriptionController::class, 'directCheckout'])->name('subscribe.direct-checkout');
    Route::get('/subscription/payment-success', [SubscriptionController::class, 'paymentSuccessRedirect'])->name('subscription.payment.success');
    Route::get('/subscription/payment-cancel', [SubscriptionController::class, 'paymentCancel'])->name('subscription.payment.cancel');
    Route::post('/subscription/dismiss-modal', [SubscriptionController::class, 'dismissModal'])->name('subscription.dismiss-modal');


    // =========================================================================
    // === KELOMPOK ROUTE DENGAN PREFIX /dashboard UNTUK FITUR UTAMA ===
    // =========================================================================
    Route::prefix('dashboard')->group(function() {

        // --- Pomodoro ---
        Route::get('/pomodoro', [PomodoroController::class, 'index'])->name('pomodoro.index');
        Route::post('/pomodoro/store', [PomodoroController::class, 'store'])->name('pomodoro.store');

        // --- History / Transactions ---
        Route::get('/transactions', [SubscriptionController::class, 'history'])->name('transactions.history');

        // --- Docs ---
        Route::get('/docs', [DocumentController::class, 'index'])->name('docs.index');
        Route::post('/docs', [DocumentController::class, 'store'])->name('docs.store'); // <-- INI PERBAIKANNYA
        Route::get('/docs/{document}', [DocumentController::class, 'show'])->name('docs.show');
        Route::put('/docs/{document}', [DocumentController::class, 'update'])->name('docs.update');
        Route::delete('/docs/{document}', [DocumentController::class, 'destroy'])->name('docs.destroy');
        Route::post('/docs/{document}/toggle-sharing', [DocumentController::class, 'toggleSharing'])->name('docs.toggle-sharing');
        Route::get('/docs/{document}/export', [DocumentController::class, 'exportDocx'])->name('docs.export');
        Route::post('/docs/{document}/invite', [DocumentController::class, 'invite'])->name('docs.invite');

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

    // Premium Routes (bisa dipertimbangkan untuk dimasukkan ke prefix juga jika relevan)
    Route::middleware(['premium'])->group(function () {
        Route::get('/pomodoro/custom', fn() => inertia('Pomodoro/Custom'))->name('pomodoro.custom');
        Route::get('/pomodoro/statistics', fn() => inertia('Pomodoro/Statistics'))->name('pomodoro.statistics');
    });

});

// --- DOCS SHARING (PUBLIC) ---
Route::get('/share/docs/{share_token}', [DocumentController::class, 'showPublic'])->name('docs.share');

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

require __DIR__.'/auth.php';