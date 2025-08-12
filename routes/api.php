<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OpenAIController; // Ganti dari DeepseekController
use App\Http\Controllers\VoiceController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Semua route di sini akan otomatis punya prefix `/api`
| dan biasanya digunakan untuk API (AJAX, frontend JS, mobile, dsb).
|--------------------------------------------------------------------------
*/

// Auth check
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// OpenAI (ganti dari Deepseek)
Route::post('/ask', [OpenAIController::class, 'ask']);
Route::post('/ask-from-pdf', [OpenAIController::class, 'askFromPdf']);

// Voice processing
Route::post('/voice/transcribe', [VoiceController::class, 'transcribe']);
Route::get('/voice/settings', [VoiceController::class, 'getVoiceSettings']);
Route::delete('/voice/cleanup', [VoiceController::class, 'cleanupOldAudioFiles']);

// Optional: CORS middleware untuk API tertentu
Route::group(['middleware' => ['cors']], function () {
    Route::post('/voice/transcribe', [VoiceController::class, 'transcribe']);
});