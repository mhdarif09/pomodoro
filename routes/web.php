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

// [ PENAMBAHAN 1: Impor TaskController di sini ]
use App\Http\Controllers\TaskController;

use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// [ KODE ASLI ANDA - TIDAK DIUBAH ]
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/terms-of-service', function () {
    return Inertia::render('TermsOfService');
})->name('terms.show');

Route::get('/privacy-policy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('policy.show');

Route::get("/about", function () {
    return Inertia::render('About');
})->name('about');

// Google OAuth Routes
Route::get('/login/google/redirect', [GoogleLoginController::class, 'redirectToGoogle'])->name('login.google.redirect');
Route::get('/login/google/callback', [GoogleLoginController::class, 'handleGoogleCallback'])->name('login.google.callback');

// Public subscription page
Route::get('/pricing', [SubscriptionController::class, 'index'])->name('subscribe.index');

// Webhook route (must be public and without CSRF protection)
Route::post('/webhook/midtrans', [WebhookController::class, 'handle'])->name('midtrans.webhook');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // [ KODE ASLI ANDA - TIDAK DIUBAH ]
    // Dashboard Routes
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/dismiss-upgrade-modal', [DashboardController::class, 'dismissUpgradeModal'])->name('dashboard.dismiss-upgrade-modal');

    // [ KODE ASLI ANDA - TIDAK DIUBAH ]
    // Daily Goal Routes
    Route::post('/daily-goal', [DailyGoalController::class, 'storeOrUpdate'])->name('daily-goal.store');

    // // [ KODE ASLI ANDA - TIDAK DIUBAH ]
    // // Reflection Routes
    // Route::get('/refleksi', [ReflectionController::class, 'index'])->name('refleksi.index');
    // Route::post('/refleksi', [ReflectionController::class, 'store'])->name('refleksi.store');

     Route::patch('/tasks/{task}/toggle-complete', [TaskController::class, 'toggleComplete'])->name('tasks.toggle-complete');

    // [ PENAMBAHAN 2: Daftarkan route untuk To-Do List (Tasks) di sini ]
    // Ini secara otomatis akan membuat route untuk store, update, destroy, dll.
    Route::resource('tasks', TaskController::class)->only([
        'store', 'update', 'destroy'
    ]);
    
    // [ KODE ASLI ANDA - TIDAK DIUBAH ]
    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // [ KODE ASLI ANDA - TIDAK DIUBAH ]
    // Pomodoro Routes
    Route::get('/pomodoro', [PomodoroController::class, 'index'])->name('pomodoro.index');
    Route::post('/pomodoro/store', [PomodoroController::class, 'store'])->name('pomodoro.store');

    // [ KODE ASLI ANDA - TIDAK DIUBAH ]
    // Subscription Routes
     Route::get('/subscribe', [SubscriptionController::class, 'index'])->name('subscribe.index');
    Route::post('/subscribe/checkout', [SubscriptionController::class, 'checkout'])->name('subscribe.checkout');
    Route::post('/subscribe/direct-checkout', [SubscriptionController::class, 'directCheckout'])->name('subscribe.direct-checkout');
    Route::get('/subscription/payment-success', [SubscriptionController::class, 'paymentSuccessRedirect'])->name('subscription.payment.success');
    Route::get('/subscription/payment-cancel', [SubscriptionController::class, 'paymentCancel'])->name('subscription.payment.cancel');
    Route::get('/transactions', [SubscriptionController::class, 'history'])->name('transactions.history');
    Route::post('/subscription/dismiss-modal', [SubscriptionController::class, 'dismissModal'])->name('subscription.dismiss-modal');

    // [ KODE ASLI ANDA - TIDAK DIUBAH ]
    // Voice Routes
    Route::get('/voice', function () {
        return inertia('Voice/Index');
    })->name('voice.index');

    // [ KODE ASLI ANDA - TIDAK DIUBAH ]
    // Premium-only Pomodoro Features
    Route::middleware(['premium'])->group(function () {
        Route::get('/pomodoro/custom', function () {
            return inertia('Pomodoro/Custom');
        })->name('pomodoro.custom');

        Route::get('/pomodoro/statistics', function () {
            return inertia('Pomodoro/Statistics');
        })->name('pomodoro.statistics');
    });

    // [ KODE ASLI ANDA - TIDAK DIUBAH ]
    // Mini Modul Learning Routes
    Route::prefix('mini-moduls')->group(function () {
        Route::get('/', [MiniModulController::class, 'index'])->name('mini-moduls.index');
        Route::get('/{miniModul:slug}', [MiniModulController::class, 'show'])->name('mini-moduls.show');
        Route::get('/{miniModul:slug}/{chapter:slug}', [MiniModulController::class, 'chapter'])->name('mini-moduls.chapter');
        
        // Progress Management
        Route::post('/{miniModul}/{chapter}/complete', [MiniModulController::class, 'completeChapter'])
            ->name('mini-moduls.complete-chapter');
        
        // AI Discussion Routes
        Route::prefix('{miniModul}/{chapter}')->name('mini-moduls.ai.')->group(function () {
            Route::post('/ai/discuss', [MiniModulAiController::class, 'startDiscussion'])->name('discuss');
            Route::get('/ai/discussions', [MiniModulAiController::class, 'getDiscussions'])->name('discussions');
            Route::post('/ai/role-play', [MiniModulAiController::class, 'simulateRole'])->name('role-play');
        });
    });
});

// [ KODE ASLI ANDA - TIDAK DIUBAH ]
// Admin Routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Admin Dashboard
    Route::get('/', AdminDashboardController::class)->name('dashboard');

    // User Management
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/promote', [AdminUserController::class, 'promote'])->name('users.promote');
    Route::post('/users/{user}/demote', [AdminUserController::class, 'demote'])->name('users.demote');
    Route::post('/users/{user}/ban', [AdminUserController::class, 'ban'])->name('users.ban');
    Route::post('/users/{user}/unban', [AdminUserController::class, 'unban'])->name('users.unban');
    Route::post('/users/{user}/make-admin', [AdminUserController::class, 'makeAdmin'])->name('users.make-admin');
    Route::post('/users/{user}/revoke-admin', [AdminUserController::class, 'revokeAdmin'])->name('users.revoke-admin');
    

    // Plan Management
    Route::prefix('plans')->name('plans.')->group(function () {
        Route::get('/', [PlanController::class, 'index'])->name('index');
        Route::post('/', [PlanController::class, 'store'])->name('store');
        Route::put('/{plan}', [PlanController::class, 'update'])->name('update');
        Route::post('/bulk-update', [PlanController::class, 'bulkUpdate'])->name('bulk-update');
        Route::delete('/{plan}', [PlanController::class, 'destroy'])->name('destroy');
        Route::patch('/{plan}/toggle-status', [PlanController::class, 'toggleStatus'])->name('toggle-status');        Route::delete('/{plan}', [PlanController::class, 'destroy'])->name('destroy');
    });

    // Mini Modul Management
    Route::resource('mini-modul-categories', MiniModulCategoryController::class);
    Route::resource('mini-moduls', AdminMiniModulController::class);
    
    // Chapters Management
    Route::prefix('mini-moduls/{miniModul}')->name('mini-moduls.')->group(function () {
        Route::resource('chapters', MiniModulChapterController::class);
        Route::post('chapters/reorder', [MiniModulChapterController::class, 'reorder'])
            ->name('chapters.reorder');
    });
});

require __DIR__.'/auth.php';