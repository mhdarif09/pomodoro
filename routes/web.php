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

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


Route::middleware(['auth', 'verified'])->group(function () {
    // Rute utama Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::post('/dashboard/dismiss-upgrade-modal', [DashboardController::class, 'dismissUpgradeModal'])->name('dashboard.dismiss-upgrade-modal');    // Rute BARU untuk menyimpan data Onboarding

        Route::post('/daily-goal', [DailyGoalController::class, 'storeOrUpdate'])->name('daily-goal.store');
 Route::get('/refleksi', [ReflectionController::class, 'index'])->name('refleksi.index');
    Route::post('/refleksi', [ReflectionController::class, 'store'])->name('refleksi.store');    // Route::post('/onboarding/complete', [OnboardingController::class, 'store'])->name('onboarding.store');

    
    // Rute yang sudah ada (pastikan masih ada)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Route untuk halaman refleksi
    Route::get('/refleksi', [ReflectionController::class, 'index'])->name('refleksi.index');
    
    // Route untuk submit jawaban refleksi
    Route::post('/refleksi', [ReflectionController::class, 'store'])->name('refleksi.store');
});
// Route::get('/dashboard', [DashboardController::class, 'index'])
//     ->middleware(['auth', 'verified'])
//     ->name('dashboard');

    Route::get('/login/google/redirect', [GoogleLoginController::class, 'redirectToGoogle'])->name('login.google.redirect');
Route::get('/login/google/callback', [GoogleLoginController::class, 'handleGoogleCallback'])->name('login.google.callback');
// Route::middleware(['auth'])->group(function () {
//     Route::middleware(['auth'])->group(function () {
//     Route::get('/dashboard', function () {
//         return Inertia::render('Dashboard', [
//             'plans' => \App\Models\Plan::all(),
//             'subscription' => \App\Models\Subscription::where('user_id', auth()->id())
//                 ->orderByDesc('expired_at')
//                 ->first(),
//         ]);
//     })->name('dashboard');

// //     Route::get('/subscribe', [SubscriptionController::class, 'index'])->name('subscribe.index');
// //     Route::post('/subscribe', [SubscriptionController::class, 'checkout'])->name('subscribe.checkout');
// // });
// });



// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    // Arahkan ke controller yang baru dibuat
    Route::get('/admin', AdminDashboardController::class)->name('admin.dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/pomodoro', [PomodoroController::class, 'index'])->name('pomodoro.index');
    Route::post('/pomodoro/store', [PomodoroController::class, 'store'])->name('pomodoro.store');
Route::post('/subscribe/checkout', [SubscriptionController::class, 'checkout'])->name('subscribe.checkout');
});


Route::middleware(['auth'])->group(function () {
    Route::get('/subscribe', [SubscriptionController::class, 'index'])->name('subscribe.index');
    Route::post('/subscribe', [SubscriptionController::class, 'checkout'])->name('subscribe.checkout');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/premium-plans', [PlanController::class, 'index'])->name('admin.plans.index');
    Route::post('/premium-plans', [PlanController::class, 'update'])->name('admin.plans.update');
    Route::post('/premium-plans/store', [PlanController::class, 'store'])->name('admin.plans.store');
    Route::delete('/premium-plans/{plan}', [PlanController::class, 'destroy'])->name('admin.plans.destroy');
});

Route::middleware(['auth', 'premium'])->group(function () {
    Route::get('/pomodoro/custom', function () {
        return inertia('Pomodoro/Custom');
    })->name('pomodoro.custom');

    Route::get('/pomodoro/statistics', function () {
        return inertia('Pomodoro/Statistics');
    })->name('pomodoro.statistics');
});

Route::post('//webhook', [WebhookController::class, 'handle'])->name('midtrans.webhook');

Route::middleware(['auth'])->group(function () {
    Route::get('/transactions', [SubscriptionController::class, 'history'])->name('transactions.history');
});

Route::get('/subscription/payment-success', [SubscriptionController::class, 'paymentSuccessRedirect'])
    ->middleware(['auth', 'verified'])
    ->name('subscription.success');

Route::get('/voice', function () {
    return inertia('Voice/Index');
})->middleware(['auth', 'verified'])->name('voice.index'); 

Route::get('/pricing', [SubscriptionController::class, 'index'])->name('subscribe.index');


Route::middleware(['auth', 'can:viewAdmin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/promote', [AdminUserController::class, 'promote'])->name('users.promote');
    Route::post('/users/{user}/demote', [AdminUserController::class, 'demote'])->name('users.demote');
    Route::post('/users/{user}/ban', [AdminUserController::class, 'ban'])->name('users.ban');
    Route::post('/users/{user}/unban', [AdminUserController::class, 'unban'])->name('users.unban');
});

// Admin Routes - Mini Modul Management
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    
    // Categories Management
    Route::resource('mini-modul-categories', MiniModulCategoryController::class);
    
    // Moduls Management
    Route::resource('mini-moduls', AdminMiniModulController::class);
    
    // Chapters Management
    Route::prefix('mini-moduls/{miniModul}')->name('mini-moduls.')->group(function () {
        Route::resource('chapters', MiniModulChapterController::class);
        Route::post('chapters/reorder', [MiniModulChapterController::class, 'reorder'])
            ->name('chapters.reorder');
    });
});

// User Routes - Mini Modul Learning
Route::middleware(['auth'])->group(function () {
    
    // Mini Modul Index & Detail
    Route::get('/mini-moduls', [MiniModulController::class, 'index'])->name('mini-moduls.index');
    Route::get('/mini-moduls/{miniModul:slug}', [MiniModulController::class, 'show'])->name('mini-moduls.show');
    Route::get('/mini-moduls/{miniModul:slug}/{chapter:slug}', [MiniModulController::class, 'chapter'])->name('mini-moduls.chapter');
    
    // Progress Management
    Route::post('/mini-moduls/{miniModul}/{chapter}/complete', [MiniModulController::class, 'completeChapter'])
        ->name('mini-moduls.complete-chapter');
    
    // AI Discussion Routes
    Route::prefix('mini-moduls/{miniModul}/{chapter}')->name('mini-moduls.ai.')->group(function () {
        Route::post('/ai/discuss', [MiniModulAiController::class, 'startDiscussion'])->name('discuss');
        Route::get('/ai/discussions', [MiniModulAiController::class, 'getDiscussions'])->name('discussions');
        Route::post('/ai/role-play', [MiniModulAiController::class, 'simulateRole'])->name('role-play');
    });
});

require __DIR__.'/auth.php';
