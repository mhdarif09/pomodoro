<?php
// File: app/Http/Controllers/OpenAIController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Smalot\PdfParser\Parser;
use Illuminate\Support\Facades\Log;
use thiagoalessio\TesseractOCR\TesseractOCR;
use Imagick;
use Exception;

class OpenAIController extends Controller
{
      protected string $apiBaseUrl;
    protected PendingRequest $httpClient;
    protected ?string $serperApiKey;

    public function __construct()
    {
        $this->apiBaseUrl = "https://api.openai.com/v1/chat/completions";
        $apiKey = env('OPENAI_API_KEY');
        $this->serperApiKey = env('SERPER_API_KEY'); // Ambil kunci API Serper

        if (empty($apiKey)) {
            throw new Exception("OPENAI_API_KEY tidak diatur.");
        }
        
        $this->httpClient = Http::withToken($apiKey)
                                ->withHeaders(['Content-Type' => 'application/json'])
                                ->retry(3, 1500)
                                ->timeout(120);
    }

    public function ask(Request $request)
    {
        $request->validate([
            'query'     => 'required|string|max:4000',
            'history'   => 'nullable|array',
            'webSearch' => 'nullable|boolean',
        ]);

        $query = $request->input('query');
        $history = $request->input('history', []);
        $isWebSearchEnabled = $request->input('webSearch', false);

        $sources = [];
        $messages = [];
        
        if ($isWebSearchEnabled) {
            Log::info('Fitur Pencarian Web diaktifkan untuk query: ' . $query);
            try {
                // Langkah 1: Panggil API Pencari untuk dapatkan LINK ASLI
                $searchResult = $this->performWebSearch($query);
                $sources = $searchResult['sources']; // Ini daftar link asli untuk frontend
                
                // Langkah 2: Buat konteks untuk diberikan ke AI
                $messages[] = [
                    'role' => 'system',
                    'content' => "Anda adalah asisten AI peneliti. Jawab pertanyaan pengguna secara komprehensif HANYA berdasarkan konteks dari hasil pencarian web di bawah ini. Sebutkan sumber yang Anda gunakan dengan format [Sumber 1], [Sumber 2], dst. di akhir kalimat yang relevan.\n\n--- KONTEKS HASIL PENCARIAN WEB ---\n" . $searchResult['context'] . "\n--- AKHIR KONTEKS ---"
                ];

            } catch (Exception $e) {
                Log::error('Gagal melakukan pencarian web: ' . $e->getMessage());
                return response()->json(['error' => 'Gagal mengambil data dari web. Silakan coba lagi.'], 500);
            }
        }

        foreach ($history as $msg) {
            if (isset($msg['role']) && isset($msg['content'])) {
                $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
            }
        }
        $messages[] = ['role' => 'user', 'content' => $query];

        $payload = [
            'model'       => 'gpt-4o-mini',
            'messages'    => $messages,
            'max_tokens'  => 1500,
            'temperature' => 0.5,
        ];

        try {
            // Langkah 3: Panggil AI untuk meringkas konteks
            $response = $this->httpClient->post($this->apiBaseUrl, $payload);
            $response->throw();
            $content = $response->json('choices.0.message.content', 'Tidak ada respons dari AI.');

            // Langkah 4: Kirim jawaban AI + DAFTAR LINK ASLI ke frontend
            return response()->json([
                'response' => $content,
                'sources'  => $sources,
            ]);

        } catch (RequestException $e) {
            Log::error('OpenAI Request Exception (ask): ' . $e->getMessage());
            return $this->handleApiException($e);
        }
    }

    private function performWebSearch(string $query): array
    {
        if (empty($this->serperApiKey)) {
            throw new Exception('SERPER_API_KEY tidak diatur. Fitur pencarian web tidak dapat digunakan.');
        }

        // Ini memanggil API pencari (Serper)
        $response = Http::withHeaders([
            'X-API-KEY' => $this->serperApiKey,
            'Content-Type' => 'application/json'
        ])->post('https://google.serper.dev/search', [
            'q' => $query . " filetype:pdf OR site:*.ac.id OR site:*.edu", // Bonus: Prioritaskan jurnal/situs edu
            'num' => 5
        ]);

        if (!$response->successful()) {
            throw new Exception('Gagal menghubungi layanan pencarian web.');
        }

        $results = $response->json('organic', []);
        $context = '';
        $sources = [];

        foreach ($results as $index => $result) {
            $title = $result['title'] ?? 'Tanpa judul';
            $link = $result['link'] ?? '#';
            $snippet = $result['snippet'] ?? 'Tidak ada kutipan.';
            
            // Konteks untuk AI
            $context .= "Sumber " . ($index + 1) . ":\nJudul: {$title}\nURL: {$link}\nKutipan: {$snippet}\n\n";

            // Data bersih untuk frontend
            $sources[] = ['title' => $title, 'url'   => $link];
        }

        if (empty($context)) {
            return ['context' => 'Tidak ditemukan hasil pencarian yang relevan.', 'sources' => []];
        }
        return ['context' => $context, 'sources' => $sources];
    }
    public function askFromPdf(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:pdf|max:10240',
            'query' => 'required|string',
        ]);
        
        try {
            $textContent = $this->extractTextFromPdf($request->file('file'));
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

        if (empty($textContent)) {
            return response()->json(['response' => 'Maaf, tidak ditemukan teks yang bisa dibaca dari dokumen ini.']);
        }
        
        $messages = [
            [
                'role' => 'system',
                'content' => "Anda adalah asisten AI yang ahli dalam menganalisis dokumen. Jawab pertanyaan pengguna hanya berdasarkan teks dari dokumen yang diberikan di bawah ini. Jika jawaban tidak ada di dalam dokumen, katakan 'Berdasarkan dokumen yang diberikan, informasi tersebut tidak ditemukan.'.\n\n--- KONTEKS DOKUMEN ---\n" . substr($textContent, 0, 50000) . "\n--- AKHIR KONTEKS ---" // Potong teks lebih pendek untuk hemat token
            ],
            [
                'role' => 'user',
                'content' => $request->input('query')
            ]
        ];

        $payload = [
            'model' => 'gpt-4o-mini',
            'messages' => $messages,
            'max_tokens' => 1000,
            'temperature' => 0.3, // Lebih rendah untuk analisis dokumen
        ];

        try {
            $response = $this->httpClient->post($this->apiBaseUrl, $payload);
            $response->throw();
            
            $content = $response->json('choices.0.message.content', 'AI tidak memberikan jawaban untuk permintaan ini.');

            return response()->json(['response' => $content]);
        } catch (RequestException $e) {
             \Log::error('OpenAI Request Exception (PDF): ' . $e->getMessage());
            return $this->handleApiException($e);
        }
    }

    private function extractTextFromPdf($file): string
    {
        try {
            $parser = new Parser();
            $text = $parser->parseFile($file->getPathname())->getText();
        } catch (Exception $e) {
            \Log::warning('Gagal parsing PDF dengan PDFParser: ' . $e->getMessage());
            $text = '';
        }

        if (empty(trim($text))) {
            \Log::info('Teks dari PDF Parser kosong. Menjalankan fallback ke OCR Tesseract.');

            if (!class_exists('Imagick')) {
                 throw new Exception('Gagal OCR: Class Imagick tidak ditemukan. Pastikan ekstensi Imagick sudah terpasang.');
            }

            try {
                $imagick = new Imagick();
                $imagick->setResolution(300, 300);
                $imagick->readImage($file->getPathname());
                $ocrText = '';

                foreach ($imagick as $pageImage) {
                    $pageImage->setImageFormat('jpeg');
                    $ocrText .= (new \TesseractOCR($pageImage->getImageBlob()))->lang('ind', 'eng')->run() . "\n";
                }
                
                $text = $ocrText;
                $imagick->clear();
                \Log::info('OCR lokal berhasil, total panjang teks: ' . strlen($text));
            } catch (Exception $e) {
                throw new Exception('Gagal melakukan proses OCR: ' . $e->getMessage() . '. Pastikan Tesseract dan Imagick terinstall.');
            }
        }
        return $text;
    }
    
    private function handleApiException(RequestException $e)
    {
        if (!$e->response) {
            return response()->json(['error' => 'Gagal terhubung ke layanan AI. Cek koneksi server Anda.'], 504);
        }
        $status = $e->response->status();
        $body = $e->response->json();
        $errorMessage = $body['error']['message'] ?? 'Terjadi kesalahan tidak diketahui pada layanan AI.';

        switch ($status) {
            case 401:
                return response()->json(['error' => 'Autentikasi gagal. OPENAI_API_KEY Anda salah atau tidak valid.'], 401);
            case 429:
                return response()->json(['error' => 'Anda telah mencapai batas penggunaan API (Rate Limit). Coba lagi nanti.'], 429);
            case 503:
                return response()->json(['error' => 'Server AI sedang sibuk. Silakan coba lagi beberapa saat.'], 503);
            default:
                return response()->json(['error' => $errorMessage], $status);
        }
    }
}