<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PomodoroController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\GeminiController;
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


Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

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



Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/admin', function () {
        return Inertia::render('Admin/Dashboard');
    });
});

Route::middleware(['auth'])->group(function () {
    Route::get('/pomodoro', [PomodoroController::class, 'index'])->name('pomodoro.index');
    Route::post('/pomodoro/store', [PomodoroController::class, 'store'])->name('pomodoro.store');
    Route::post('/subscribe/checkout', [SubscriptionController::class, 'checkout']);
});


// Route::middleware(['auth'])->group(function () {
//     Route::get('/subscribe', [SubscriptionController::class, 'index'])->name('subscribe.index');
//     Route::post('/subscribe', [SubscriptionController::class, 'checkout'])->name('subscribe.checkout');
// });

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

Route::post('/midtrans/webhook', [WebhookController::class, 'handle'])->name('midtrans.webhook');

Route::middleware(['auth'])->group(function () {
    Route::get('/transactions', [SubscriptionController::class, 'history'])->name('transactions.history');
});

require __DIR__.'/auth.php';