<?php
// File: app/Http/Controllers/GeminiController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\RequestException;
use Smalot\PdfParser\Parser;
use Imagick;

class GeminiController extends Controller
{
    /**
     * Menangani pertanyaan umum ke Gemini dengan debugging lengkap.
     */
    public function ask(Request $request)
    {
        \Log::debug('Gemini Ask Hit', $request->all());

        $payload = [
            'contents' => [
                [ 'parts' => [ ['text' => $request->input('query')] ] ]
            ],
        ];

        \Log::debug('Sending to Gemini', $payload);

        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . env('GEMINI_API_KEY');

        try {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                          ->retry(3, 1500)
                          ->post($url, $payload);

            // Debug langsung response status dan body
            dd([
                'status' => $response->status(),
                'body' => $response->body(),
                'json' => $response->json(),
            ]);

            $response->throw();

            $output = $response->json();
            $content = $output['candidates'][0]['content']['parts'][0]['text'] ?? 'Tidak ada respons dari AI.';

            return response()->json(['response' => $content]);

        } catch (RequestException $e) {
            \Log::error('Gemini Request Exception (ask): ' . $e->getMessage());

            // Debug error dan response
            dd([
                'error' => $e->getMessage(),
                'response' => $e->response ? $e->response->body() : null,
                'status' => $e->response ? $e->response->status() : null,
            ]);

            if ($e->response && $e->response->status() === 503) {
                return response()->json(['error' => 'Server AI sedang sibuk. Silakan coba lagi beberapa saat.'], 503);
            }

            return response()->json(['error' => 'Gagal terhubung ke layanan AI.'], 500);
        }
    }

    /**
     * Menangani pertanyaan dari konteks dokumen PDF dengan debugging lengkap.
     */
    public function askFromPdf(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:pdf|max:2048',
            'query' => 'required|string',
        ]);

        $file = $request->file('file');
        $query = $request->input('query');
        $text = '';

        try {
            \Log::info('Mencoba mem-parsing PDF: ' . $file->getClientOriginalName());
            $parser = new Parser();
            $pdf = $parser->parseFile($file->getPathname());
            $text = $pdf->getText();
            \Log::info('Parsing PDF berhasil, jumlah karakter: ' . strlen($text));
        } catch (\Exception $e) {
            \Log::error('Gagal mem-parsing PDF: ' . $e->getMessage());
            return response()->json(['error' => 'Gagal memproses file PDF. File mungkin rusak atau tidak didukung.'], 500);
        }

        if (empty(trim($text))) {
            \Log::warning('Fallback ke OCR (Tesseract) karena teks kosong...');

            try {
                $imagick = new Imagick();
                $imagick->setResolution(300, 300);
                $imagick->readImage($file->getPathname());
                $imagick->setImageFormat('jpeg');

                $ocrText = '';

                foreach ($imagick as $i => $page) {
                    $tempPath = storage_path("app/temp/page_$i.jpg");
                    $page->writeImage($tempPath);

                    $outputFile = tempnam(sys_get_temp_dir(), 'ocr_');
                    $command = "tesseract " . escapeshellarg($tempPath) . " " . escapeshellarg($outputFile) . " -l ind+eng";
                    exec($command);

                    // Debug isi file OCR untuk tiap halaman
                    $ocrPageText = file_get_contents($outputFile . '.txt');
                    \Log::debug("OCR page $i text length: " . strlen($ocrPageText));
                    $ocrText .= "\n" . $ocrPageText;

                    unlink($tempPath);
                    unlink($outputFile . '.txt');
                }

                $text = $ocrText;
                \Log::info('OCR lokal berhasil, panjang teks: ' . strlen($text));
            } catch (\Exception $e) {
                \Log::error('Gagal OCR lokal: ' . $e->getMessage());
                return response()->json(['error' => 'Gagal melakukan OCR. Pastikan Tesseract dan Imagick sudah terpasang.'], 500);
            }
        }

        if (empty(trim($text))) {
            return response()->json(['response' => 'Maaf, tidak ditemukan teks yang bisa dibaca dari dokumen ini.']);
        }

        $textContent = substr($text, 0, 15000);

        $prompt = "Anda adalah asisten AI yang bertugas menjawab pertanyaan berdasarkan konteks dokumen yang diberikan. "
                . "Berikut adalah isi dokumennya:\n\n--- KONTEKS DOKUMEN ---\n"
                . $textContent
                . "\n--- AKHIR KONTEKS ---\n\n"
                . "Berdasarkan konteks di atas, jawab pertanyaan berikut: " . $query;

        $payload = [
            'contents' => [
                [ 'parts' => [ ['text' => $prompt] ] ]
            ],
            'safetySettings' => [
                ['category' => 'HARM_CATEGORY_HARASSMENT', 'threshold' => 'BLOCK_NONE'],
                ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_NONE'],
                ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_NONE'],
                ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_NONE'],
            ]
        ];

        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . env('GEMINI_API_KEY');

        try {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                          ->retry(3, 1500)
                          ->post($url, $payload);

            // Debug langsung response dari API
            dd([
                'status' => $response->status(),
                'body' => $response->body(),
                'json' => $response->json(),
            ]);

            $response->throw();

            $data = $response->json();
            if (empty($data['candidates'])) {
                \Log::warning('Respons diblokir oleh safety setting', $data);
                return response()->json(['response' => 'Jawaban AI tidak tersedia karena diblokir oleh filter keamanan.']);
            }

            $content = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Tidak ada jawaban dari AI.';
            return response()->json(['response' => $content]);

        } catch (RequestException $e) {
            \Log::error('Gemini Request Exception (PDF): ' . $e->getMessage());

            dd([
                'error' => $e->getMessage(),
                'response' => $e->response ? $e->response->body() : null,
                'status' => $e->response ? $e->response->status() : null,
            ]);

            if ($e->response && $e->response->status() === 503) {
                return response()->json(['error' => 'Server AI sedang sibuk. Silakan coba lagi beberapa saat.'], 503);
            }

            return response()->json(['error' => 'Terjadi kesalahan saat berkomunikasi dengan layanan AI.'], 500);
        }
    }

    /**
     * Method lama untuk menjalankan OCR Tesseract pada gambar.
     */
    private function runTesseractOnImage($imagePath)
    {
        $outputFile = tempnam(sys_get_temp_dir(), 'ocr_');
        $command = "tesseract " . escapeshellarg($imagePath) . " " . escapeshellarg($outputFile) . " -l eng";

        exec($command);

        $text = file_get_contents($outputFile . ".txt");
        unlink($outputFile . ".txt");
        return $text;
    }
}
