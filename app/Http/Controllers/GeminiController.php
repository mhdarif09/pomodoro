<?php
// File: app/Http/Controllers/GeminiController.php
// --- VERSI LENGKAP DAN FINAL ---

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\RequestException; // <-- Import class Exception yang diperlukan
use Smalot\PdfParser\Parser;
use Imagick;

class GeminiController extends Controller
{
    /**
     * Menangani pertanyaan umum ke Gemini.
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
            // Blok untuk mencoba request ke API
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                          ->retry(3, 1500) // Coba lagi 3x jika gagal, jeda 1.5 detik
                          ->post($url, $payload);
            
            // Melempar exception jika status code bukan 2xx (sukses)
            // Ini akan ditangkap oleh blok catch di bawah.
            $response->throw();

            $output = $response->json();
            $content = $output['candidates'][0]['content']['parts'][0]['text'] ?? 'Tidak ada respons dari AI.';

            return response()->json(['response' => $content]);

        } catch (RequestException $e) {
            // Menangkap semua kegagalan koneksi atau server dari Http client
            \Log::error('Gemini Request Exception (ask): ' . $e->getMessage());

            // Periksa jika ada respons error dan status kodenya 503 (Overloaded)
            if ($e->response && $e->response->status() === 503) {
                return response()->json(['error' => 'Server AI sedang sibuk. Silakan coba lagi beberapa saat.'], 503);
            }
            
            // Untuk semua jenis error koneksi lainnya
            return response()->json(['error' => 'Gagal terhubung ke layanan AI.'], 500);
        }
    }

    /**
     * Menangani pertanyaan dari konteks dokumen PDF.
     */
    public function askFromPdf(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:pdf|max:2048', // max 2MB
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

        // Fallback ke OCR jika teks dari parser kosong
        if (empty(trim($text))) {
            \Log::warning('Fallback ke OCR (Tesseract) karena teks kosong...');

            try {
                $imagick = new \Imagick();
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
                    $ocrText .= "\n" . file_get_contents($outputFile . '.txt');

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

        // --- INILAH BLOK KODE YANG DIPERBAIKI ---
        try {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                          ->retry(3, 1500)
                          ->post($url, $payload);
                          
            $response->throw(); // Melempar exception jika status code error (4xx atau 5xx)

            $data = $response->json();
            if (empty($data['candidates'])) {
                \Log::warning('Respons diblokir oleh safety setting', $data);
                return response()->json(['response' => 'Jawaban AI tidak tersedia karena diblokir oleh filter keamanan.']);
            }

            $content = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Tidak ada jawaban dari AI.';
            return response()->json(['response' => $content]);

        } catch (RequestException $e) {
            // "Menangkap" error yang dilempar oleh ->retry() atau ->throw()
            \Log::error('Gemini Request Exception (PDF): ' . $e->getMessage());

            if ($e->response && $e->response->status() === 503) {
                // Jika errornya karena overload, kirim pesan yang jelas dan terkontrol
                return response()->json(['error' => 'Server AI sedang sibuk. Silakan coba lagi beberapa saat.'], 503);
            }
            
            // Untuk semua error koneksi atau server lain dari Gemini
            return response()->json(['error' => 'Terjadi kesalahan saat berkomunikasi dengan layanan AI.'], 500);
        }
    }

    /**
     * Method ini ada di kode Anda sebelumnya.
     * Walaupun tidak dipanggil, kita tetap sertakan agar tidak ada kode yang hilang.
     */
    private function runTesseractOnImage($imagePath)
    {
        $outputFile = tempnam(sys_get_temp_dir(), 'ocr_'); // buat file output temp
        $command = "tesseract " . escapeshellarg($imagePath) . " " . escapeshellarg($outputFile) . " -l eng";

        exec($command); // jalankan perintah tesseract

        $text = file_get_contents($outputFile . ".txt");
        unlink($outputFile . ".txt"); // hapus file hasil
        return $text;
    }
}