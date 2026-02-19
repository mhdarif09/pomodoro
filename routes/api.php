<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OpenAIController;

// ==========================
// ROUTE UNTUK AI ASSISTANT
// ==========================

// 🧠 Chat Mode (AI umum)
Route::post('/ask', [OpenAIController::class, 'ask'])->name('ai.ask');

// 📄 Reviewer Mode (analisis PDF jurnal)
Route::post('/ask-from-paper', [OpenAIController::class, 'askFromPaper'])->name('ai.askFromPaper');

// ✍️ Writer Mode (penulisan akademik otomatis)
Route::post('/ask-academic-writer', [OpenAIController::class, 'askAcademicWriter'])->name('ai.askAcademicWriter');

// 📚 Analisis dari file PDF / Excel (fitur unggah)
Route::post('/ask-from-pdf', [OpenAIController::class, 'askFromPdf'])->name('ai.askFromPdf');
Route::post('/ask-from-sheet', [OpenAIController::class, 'askFromSheet'])->name('ai.askFromSheet');

// 💳 Midtrans Webhook
Route::post('midtrans/webhook', [\App\Http\Controllers\PaymentCallbackController::class, 'handle'])->name('midtrans.webhook');

// 📱 WhatsApp Webhook (Fonnte)
Route::post('whatsapp/webhook', [\App\Http\Controllers\Api\WhatsAppWebhookController::class, 'handle'])->name('whatsapp.webhook');

