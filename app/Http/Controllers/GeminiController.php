<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Smalot\PdfParser\Parser;

class GeminiController extends Controller
{
   public function ask(Request $request)
{
    \Log::debug('Gemini Ask Hit', $request->all());

    $payload = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $request->input('query')],
                ],
            ],
        ],
    ];

    \Log::debug('Sending to Gemini', $payload);

    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . env('GEMINI_API_KEY');

    $response = Http::withHeaders([
        'Content-Type' => 'application/json',
    ])->retry(3, 2000)->post($url, $payload);

    \Log::debug('Gemini Response:', [$response->body()]);

    if ($response->status() === 503) {
        return response()->json(['response' => 'Model sedang sibuk, coba lagi beberapa saat.'], 503);
    }

    if (!$response->successful()) {
        return response()->json(['response' => 'Gagal terhubung ke AI.'], 500);
    }

    $output = $response->json();
    $content = $output['candidates'][0]['content']['parts'][0]['text'] ?? 'Tidak ada respons.';

    return response()->json(['response' => $content]);
}

public function askFromPdf(Request $request)
{
    // 1. Validasi input tetap sama, sudah bagus.
    $request->validate([
        'file' => 'required|mimes:pdf|max:2048', // max 2MB
        'query' => 'required|string',
    ]);

    $file = $request->file('file');
    $query = $request->input('query');
    $text = ''; // Inisialisasi variabel $text

    // 2. Bungkus proses parsing dalam try-catch
    try {
        \Log::info('Mencoba mem-parsing PDF: ' . $file->getClientOriginalName());
        $parser = new Parser();
        $pdf = $parser->parseFile($file->getPathname());
        $text = $pdf->getText();
        \Log::info('Parsing PDF berhasil, jumlah karakter: ' . strlen($text));
    } catch (\Exception $e) {
        // Jika parsing gagal karena file rusak/tidak didukung
        \Log::error('Gagal mem-parsing PDF: ' . $e->getMessage());
        // Kirim response error yang jelas ke frontend
        return response()->json(['error' => 'Gagal memproses file PDF. File mungkin rusak atau formatnya tidak didukung.'], 500);
    }

    // 3. Periksa apakah hasil parsing kosong
    if (empty(trim($text))) {
        \Log::warning('PDF tidak berisi teks yang bisa dibaca: ' . $file->getClientOriginalName());
        // Kirim response yang ramah ke pengguna
        return response()->json(['response' => 'Maaf, saya tidak dapat menemukan teks apapun di dalam PDF ini. Pastikan file bukan hasil scan (berbasis gambar).'], 200);
    }
    
    // Batasi panjang teks untuk menghindari limit token API
    $textContent = substr($text, 0, 15000); 

    // 4. Buat prompt yang lebih jelas untuk AI
    $prompt = "Anda adalah asisten AI yang bertugas menjawab pertanyaan berdasarkan konteks dokumen yang diberikan. "
            . "Berikut adalah isi dokumennya:\n\n--- KONTEKS DOKUMEN ---\n"
            . $textContent
            . "\n--- AKHIR KONTEKS ---\n\n"
            . "Berdasarkan konteks di atas, jawab pertanyaan berikut: " . $query;

    $payload = [
        'contents' => [
            [ 'parts' => [ ['text' => $prompt] ] ]
        ],
        // Menambahkan safety settings untuk mengurangi blokir
        'safetySettings' => [
            ['category' => 'HARM_CATEGORY_HARASSMENT', 'threshold' => 'BLOCK_NONE'],
            ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_NONE'],
            ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_NONE'],
            ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_NONE'],
        ]
    ];

    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . env('GEMINI_API_KEY');

    $response = Http::withHeaders(['Content-Type' => 'application/json'])->post($url, $payload);
    
    // Penanganan error dari API sudah bagus, kita bisa tambahkan logging
    if (!$response->successful()) {
        \Log::error('Error dari Gemini API: ' . $response->body());
        return response()->json(['error' => 'Terjadi kesalahan saat berkomunikasi dengan AI. ' . $response->body()], 500);
    }

    // Periksa jika respons diblokir karena safety
    $data = $response->json();
    if (empty($data['candidates'])) {
         \Log::warning('Respons dari Gemini diblokir (kemungkinan karena safety setting): ', $data);
         return response()->json(['response' => 'Jawaban dari AI tidak dapat ditampilkan karena terblokir oleh filter keamanan. Coba dengan pertanyaan lain.']);
    }

    $content = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Tidak ada jawaban yang bisa saya berikan dari dokumen tersebut.';

    return response()->json(['response' => $content]);
}
}

