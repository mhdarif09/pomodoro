<?php
// File: app/Http/Controllers/OpenAIController.php
// Versi: Titanium Edition (Definitive, Powerful, Stable)

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Smalot\PdfParser\Parser;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\DomCrawler\Crawler;
use Exception;
use Imagick;
use TesseractOCR;

class OpenAIController extends Controller
{
    protected string $apiBaseUrl;
    protected PendingRequest $httpClient;
    protected ?string $serperApiKey;
    protected string $mainModel = 'gpt-4o'; // Model utama untuk kualitas jawaban terbaik
    protected string $retrievalModel = 'gpt-4o-mini'; // Model cepat & murah untuk menemukan konteks

    public function __construct()
    {
        $this->apiBaseUrl = "https://api.openai.com/v1/chat/completions";
        $apiKey = env('OPENAI_API_KEY');
        $this->serperApiKey = env('SERPER_API_KEY');

        if (empty($apiKey)) {
            Log::critical("FATAL: OPENAI_API_KEY is not configured.");
            throw new Exception("Konfigurasi kunci API OpenAI tidak ditemukan.");
        }
        
        $this->httpClient = Http::withToken($apiKey)
                                ->withHeaders(['Content-Type' => 'application/json'])
                                ->retry(3, 1500) // Coba lagi 3x jika gagal, dengan jeda 1.5 detik
                                ->timeout(180); // Timeout lebih panjang untuk proses scraping/analisis
    }

    // ==========================================================
    // == ORCHESTRATION HUB - OTAK UTAMA DARI FITUR CHAT
    // ==========================================================
    public function ask(Request $request)
    {
        $validated = $request->validate([
            'query'     => 'required|string|max:4000',
            'history'   => 'nullable|array',
            'webSearch' => 'nullable|boolean',
        ]);

        $query = $validated['query'];
        
        try {
            // Deteksi #1: Apakah ada link YouTube di query?
            if (preg_match('/(youtube\.com\/watch\?v=|youtu\.be\/)([^&?#\s]+)/', $query, $matches)) {
                return $this->handleYoutubeQuery($query, $matches[2]);
            }
            
            // Deteksi #2: Apakah fitur Web Search diaktifkan?
            if ($validated['webSearch']) {
                return $this->handleWebSearchQuery($query, $validated['history'] ?? []);
            }

            // Fallback: Jika tidak keduanya, ini adalah chat biasa
            return $this->handleSimpleChat($query, $validated['history'] ?? []);

        } catch (Exception $e) {
            Log::error('Orchestration Hub Error in ask(): ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['error' => 'Terjadi kesalahan internal saat memproses permintaan Anda.'], 500);
        }
    }
    
    // ==========================================================
    // == PDF ANALYSIS - Menggunakan RAG
    // ==========================================================
    public function askFromPdf(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|mimes:pdf|max:10240', // Maks 10MB
            'query' => 'required|string|max:4000',
        ]);
        
        try {
            $textContent = $this->extractTextFromPdf($request->file('file'));
            if (empty(trim($textContent))) {
                 return response()->json(['error' => 'Gagal membaca teks dari PDF. Dokumen mungkin hanya berisi gambar atau terproteksi.'], 422);
            }

            $systemPrompt = "Anda adalah asisten AI yang ahli dalam menganalisis dokumen. Jawab pertanyaan pengguna secara akurat dan ringkas HANYA berdasarkan konteks yang diberikan di bawah ini. Jika informasi tidak ada di dalam konteks, jawab dengan 'Berdasarkan dokumen yang diberikan, informasi tersebut tidak ditemukan.'. Jangan membuat asumsi atau memberikan informasi dari luar konteks.";

            return $this->generateAnswerFromContext($validated['query'], $textContent, $systemPrompt);

        } catch(Exception $e) {
            Log::error('PDF Processing Error in askFromPdf(): ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    public function askFromSheet(Request $request){
        $validated = $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240', // Maks 10MB
            'query' => 'required|string|max:4000',
        ]);
        try {
            $markdownTable = $this->extractTableFromSheet($request->file('file'));
            if (empty(trim($markdownTable))) {
                    return response()->json(['error' => 'Gagal membaca tabel dari file spreadsheet. Pastikan file memiliki setidaknya satu tabel dengan data.'], 422);
    }

            $systemPrompt = <<<PROMPT
Anda adalah seorang Analis Data AI senior yang sangat ahli bernama 'DataGPT'. Anda sedang disajikan data dalam format tabel Markdown. Misi Anda adalah menjawab pertanyaan pengguna secara akurat, mendalam, dan cerdas HANYA berdasarkan data yang diberikan.

**KEMAMPUAN ANDA MELIPUTI:**

1.  **Agregasi Dasar:** Hitung total (SUM), rata-rata (AVERAGE), nilai tengah (MEDIAN), nilai yang paling sering muncul (MODE), nilai tertinggi (MAX), dan nilai terendah (MIN).
2.  **Analisis Statistik:** Hitung standar deviasi, varians, dan lakukan analisis distribusi data jika relevan.
3.  **Filter & Segmentasi:** Jawab pertanyaan yang memerlukan pemfilteran data. Contoh: 'Berapa total penjualan untuk produk kategori "Elektronik" di bulan Maret?'
4.  **Analisis Tren & Perbandingan:** Identifikasi tren dari waktu ke waktu (misalnya, pertumbuhan penjualan bulanan), bandingkan performa antar kategori, dan temukan anomali atau *outlier* dalam data.
5.  **Korelasi Sederhana:** Jawab pertanyaan tentang hubungan antar kolom. Contoh: 'Apakah ada hubungan antara biaya iklan dengan jumlah unit terjual?'
6.  **Peringkat (Ranking):** Tentukan peringkat item. Contoh: 'Sebutkan 5 produk dengan penjualan tertinggi.'
7.  **Bahasa Natural:** Pahami pertanyaan yang diajukan dalam bahasa natural, bahkan jika tidak eksplisit menyebutkan fungsi (misalnya, "Bagaimana performa penjualan kita kuartal lalu?" harus ditafsirkan sebagai permintaan untuk ringkasan penjualan).

**ATURAN WAJIB:**
-   **SELALU DASARKAN JAWABAN PADA DATA.** Jika informasi tidak ada di tabel, jawab dengan tegas: 'Berdasarkan data yang diberikan, informasi tersebut tidak dapat saya temukan.'
-   **TUNJUKKAN CARA KERJA ANDA.** Saat memberikan jawaban numerik (misal, total penjualan), jelaskan secara singkat proses atau filter yang Anda gunakan untuk mendapatkan angka tersebut. Contoh: "Total penjualan untuk kategori 'Pakaian' adalah Rp 5.000.000, yang dihitung dengan menjumlahkan kolom 'Harga' untuk semua baris di mana kolom 'Kategori' adalah 'Pakaian'."
-   **GUNAKAN FORMATTING.** Sajikan jawaban yang kompleks (seperti daftar peringkat) dalam bentuk daftar (list) atau tabel Markdown sederhana untuk keterbacaan.
PROMPT;


            return $this->generateAnswerFromContext($validated['query'], $markdownTable, $systemPrompt);

        } catch(Exception $e) {
            Log::error('Spreadsheet Processing Error in askFromSheet(): ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ==========================================================
// == ACADEMIC INTELLIGENCE MODULES (REVIEWER & WRITER)
// ==========================================================

public function askFromPaper(Request $request)
{
    $validated = $request->validate([
        'file' => 'required|mimes:pdf|max:10240', // Maks 10MB
    ]);

    try {
        $pdfText = $this->extractTextFromPdf($request->file('file'));
        if (empty(trim($pdfText))) {
            return response()->json(['error' => 'Tidak dapat membaca teks dari file PDF.'], 422);
        }

        $systemPrompt = <<<PROMPT
Anda adalah **AI Reviewer Akademik Profesional** bernama "ScholarGPT".
Analisis jurnal berikut berdasarkan struktur IMRaD (Introduction, Methods, Results, Discussion).
Beri penilaian pada tiap aspek berikut (skala 1–10) dan jelaskan alasannya secara ilmiah:

1. **Kejelasan Tujuan Penelitian**
2. **Kekuatan Metodologi**
3. **Kualitas Analisis Data**
4. **Kebaruan (Originalitas)**
5. **Relevansi & Dampak**
6. **Keterbacaan dan Gaya Penulisan**

Tuliskan hasil review dengan format berikut:
- **Ringkasan Jurnal (3–5 kalimat)**
- **Kelebihan Utama**
- **Kekurangan Utama**
- **Skor Tiap Aspek (dalam tabel Markdown)**
- **Rekomendasi Akhir** (Diterima / Direvisi / Ditolak)
PROMPT;

        return $this->generateAnswerFromContext(
            "Analisis dan review jurnal ini secara akademik.",
            $pdfText,
            $systemPrompt
        );
    } catch (Exception $e) {
        Log::error('Academic Review Error: ' . $e->getMessage());
        return response()->json(['error' => 'Gagal menganalisis jurnal.'], 500);
    }
}

public function askAcademicWriter(Request $request)
{
    $validated = $request->validate([
        'topic' => 'required|string|max:4000',
        'references' => 'nullable|string|max:8000',
        'section' => 'nullable|string|max:100' // contoh: "pendahuluan", "abstrak", "pembahasan"
    ]);

    $topic = $validated['topic'];
    $references = $validated['references'] ?? '';
    $section = strtolower($validated['section'] ?? 'umum');

    $systemPrompt = <<<PROMPT
Anda adalah **AI Academic Writer** bernama "ScholarWriter".
Tugas Anda adalah menulis bagian teks akademik yang berkualitas tinggi berdasarkan topik dan referensi yang diberikan.
Gunakan gaya penulisan ilmiah formal (bukan opini pribadi), dengan bahasa yang padat dan objektif.

Gunakan format sesuai bagian berikut:
- Jika pengguna meminta *abstrak*, buat dalam satu paragraf 150–250 kata.
- Jika *pendahuluan*, jelaskan latar belakang, gap riset, dan tujuan penelitian.
- Jika *metodologi*, jelaskan pendekatan dan metode yang logis.
- Jika *pembahasan*, analisis hasil dengan kedalaman akademik.
PROMPT;

    $context = "TOPIK: {$topic}\n\nREFERENSI TAMBAHAN (jika ada):\n{$references}";
    return $this->generateAnswerFromContext("Tulis bagian {$section} untuk topik di atas.", $context, $systemPrompt);
}

    // ==========================================================
    // == PRIVATE HANDLERS - Logika spesifik untuk setiap jenis chat
    // ==========================================================

      private function extractDataFromSheet($file): string
    {
        Log::info("Attempting to parse spreadsheet file: " . $file->getClientOriginalName());

        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            
            // Batasi jumlah baris dan kolom untuk menghindari token limit dan menjaga relevansi
            $maxRows = 200; 
            $maxCols = 26; // 'Z'
            
            $data = $sheet->toArray(null, true, true, true);
            $data = array_slice($data, 0, $maxRows);
            
            if (empty($data)) return "";

            $markdown = "";
            $header = array_shift($data); // Ambil baris pertama sebagai header

            // Filter kolom kosong dari header
            $header = array_filter($header, fn($cell) => !is_null($cell) && $cell !== '');
            $columnKeys = array_keys($header);

            if(empty($header)) return "";
            
            // Buat header tabel Markdown
            $markdown .= "| " . implode(" | ", $header) . " |\n";
            $markdown .= "| " . implode(" | ", array_fill(0, count($header), '---')) . " |\n";

            // Buat baris-baris data
            foreach ($data as $row) {
                $rowData = [];
                // Hanya ambil data dari kolom yang memiliki header
                foreach ($columnKeys as $key) {
                    $rowData[] = $row[$key] ?? ''; 
                }
                $markdown .= "| " . implode(" | ", $rowData) . " |\n";
            }

            Log::info("Spreadsheet successfully converted to Markdown. Length: " . strlen($markdown));
            return $markdown;
        } catch (Exception $e) {
            Log::error('PhpSpreadsheet Error: ' . $e->getMessage());
            throw new Exception("Gagal memproses file spreadsheet. File mungkin rusak atau dalam format yang tidak didukung.");
        }
    }

    private function handleYoutubeQuery(string $query, string $videoId)
    {
        Log::info("Handling YouTube query for Video ID: {$videoId}");
        $transcript = $this->getYouTubeTranscript($videoId);

        $systemPrompt = "Anda adalah asisten AI yang dapat 'menonton' dan merangkum video YouTube. Jawab pertanyaan pengguna HANYA berdasarkan transkrip video yang diberikan di bawah ini. Abaikan URL YouTube dari pertanyaan asli dan fokus pada inti pertanyaannya.";

        $userQuestion = trim(preg_replace('/https?:\/\/[^\s]+/', '', $query));
        if (empty($userQuestion)) $userQuestion = "Buatkan ringkasan lengkap dari video ini dalam beberapa poin utama.";
        
        return $this->generateAnswerFromContext($userQuestion, $transcript, $systemPrompt);
    }

    private function handleWebSearchQuery(string $query, array $history)
    {
        Log::info("Handling Web Search query: {$query}");
        $searchResults = $this->performWebSearch($query);
        
        if (empty($searchResults)) {
            Log::warning("Web search for '{$query}' yielded no usable content.");
            return $this->handleSimpleChat("Saya tidak dapat menemukan informasi relevan di web untuk: '{$query}'. Bisakah Anda mencoba pertanyaan lain?", $history);
        }

        $context = "Hasil pencarian web:\n";
        foreach($searchResults as $index => $result) {
            $context .= "--- Sumber " . ($index + 1) . ": {$result['title']} ({$result['url']}) ---\n";
            $context .= $result['content'] . "\n\n";
        }
        
        $systemPrompt = "Anda adalah Asisten AI Peneliti. Jawab pertanyaan pengguna secara komprehensif HANYA berdasarkan konteks hasil pencarian web yang diberikan. Saat mengutip informasi, sebutkan sumbernya dengan format [Sumber 1], [Sumber 2], dst. di akhir kalimat yang relevan. Sintesiskan informasi dari beberapa sumber untuk memberikan jawaban yang kaya dan detail.";

        $messages = array_map(fn($msg) => ['role' => $msg['role'], 'content' => $msg['content']], $history);
        return $this->generateAnswerFromContext($query, $context, $systemPrompt, $messages, $searchResults);
    }

    private function handleSimpleChat(string $query, array $history)
    {
        Log::info("Handling simple chat query: {$query}");
        $messages = [];
        $messages[] = ['role' => 'system', 'content' => 'Anda adalah asisten AI yang membantu dan ramah.'];
        foreach ($history as $msg) {
            if (isset($msg['role'], $msg['content'])) $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
        }
        $messages[] = ['role' => 'user', 'content' => $query];

        try {
            $response = $this->httpClient->post($this->apiBaseUrl, [
                'model' => $this->mainModel,
                'messages' => $messages,
                'max_tokens' => 2000,
                'temperature' => 0.7,
            ]);
            $response->throw();
            $content = $response->json('choices.0.message.content', 'Tidak ada respons dari AI.');
            return response()->json(['response' => $content, 'sources' => []]);
        } catch (RequestException $e) {
            return $this->handleApiException($e, 'Simple Chat');
        }
    }

    // ==========================================================
    // == CORE LOGIC (RAG PATTERN) - INTI KECERDASAN
    // ==========================================================
    private function generateAnswerFromContext(string $query, string $fullContext, string $systemPrompt, array $history = [], array $sources = [])
    {
        // 1. Chunking: Memecah konteks besar menjadi potongan-potongan logis.
        $chunks = $this->chunkText($fullContext);
        
        // 2. Retrieval: Menemukan potongan paling relevan menggunakan model AI yang lebih kecil/cepat.
        $relevantChunks = $this->findRelevantChunks($query, $chunks);
        $contextForPrompt = implode("\n\n---\n\n", $relevantChunks);

        // 3. Generation: Membuat jawaban berdasarkan potongan relevan tersebut.
        $messages = array_merge([['role' => 'system', 'content' => $systemPrompt]], $history);
        $messages[] = ['role' => 'user', 'content' => "KONTEKS:\n\"" . $contextForPrompt . "\"\n\nPERTANYAAN: " . $query];

        try {
            $response = $this->httpClient->post($this->apiBaseUrl, [
                'model' => $this->mainModel,
                'messages' => $messages,
                'max_tokens' => 2000,
                'temperature' => 0.2, // Lebih rendah untuk jawaban berbasis fakta
            ]);
            $response->throw();
            $content = $response->json('choices.0.message.content', 'AI tidak dapat menghasilkan jawaban dari konteks yang diberikan.');

            return response()->json(['response' => $content, 'sources'  => $sources]);
        } catch (RequestException $e) {
            return $this->handleApiException($e, 'RAG');
        }
    }
    
    // ==========================================================
    // == UTILITIES & HELPERS
    // ==========================================================
    private function findRelevantChunks(string $query, array $chunks): array
    {
        if (count($chunks) <= 3) return $chunks; // Jika hanya ada sedikit chunk, pakai semuanya.

        $chunkList = "";
        foreach ($chunks as $index => $chunk) $chunkList .= "CHUNK {$index}:\n\"" . substr($chunk, 0, 1000) . "...\"\n\n";

        $prompt = "Anda adalah AI pemilah informasi. Tugas Anda adalah mengidentifikasi potongan teks (CHUNK) yang paling relevan untuk menjawab pertanyaan pengguna. Berikan hanya nomor-nomor CHUNK yang relevan, dipisahkan koma, tanpa penjelasan. Contoh: 1,5,8\n\nPertanyaan Pengguna: \"{$query}\"\n\n--- DAFTAR CHUNK ---\n{$chunkList}";
        
        try {
            $response = $this->httpClient->post($this->apiBaseUrl, [
                'model' => $this->retrievalModel,
                'messages' => [['role' => 'user', 'content' => $prompt]],
                'max_tokens' => 100, 'temperature' => 0.0,
            ]);
            $response->throw();
            
            preg_match_all('/\d+/', $response->json('choices.0.message.content'), $matches);
            $relevantIndices = array_unique($matches[0] ?? []);

            if (empty($relevantIndices)) {
                Log::warning("Retrieval model failed to select chunks for query: '{$query}'. Using first chunk as fallback.");
                return [array_shift($chunks)];
            }
            Log::info("Relevant chunks for query '{$query}': " . implode(', ', $relevantIndices));

            $relevantChunks = [];
            foreach ($relevantIndices as $index) if (isset($chunks[$index])) $relevantChunks[] = $chunks[$index];
            return $relevantChunks;
        } catch (Exception $e) {
            Log::warning('Gagal menemukan chunk relevan, menggunakan 3 chunk pertama sebagai fallback: ' . $e->getMessage());
            return array_slice($chunks, 0, 3);
        }
    }

    private function chunkText(string $text, int $size = 2000, int $overlap = 300): array
    {
        $text = preg_replace('/\s+/', ' ', $text); // Normalisasi spasi
        $chunks = []; $length = strlen($text);
        if ($length <= $size) return [$text];
        for ($start = 0; $start < $length; $start += ($size - $overlap)) {
            $chunks[] = substr($text, $start, $size);
        }
        return array_filter($chunks, fn($c) => trim($c) !== '');
    }
    
     private function getYouTubeTranscript(string $videoId): string
    {
        Log::info("Fetching transcript for YouTube video ID: {$videoId} using external API.");

        $apiUrl = "https://youtubetranscript.com/?server_vid2={$videoId}";

        try {
            $response = Http::timeout(30)->get($apiUrl);
            if (!$response->successful()) {
                $errorCode = $response->status();
                $errorMessage = "API youtubetranscript.com gagal. Kode status: {$errorCode}";
                Log::error($errorMessage . ". Response Body: " . $response->body()); // Tambahkan log body
                throw new Exception($errorMessage);
            }

            $xmlString = $response->body();
            $xml = @simplexml_load_string($xmlString);

            if ($xml === false || !isset($xml->text)) {
                if (str_contains(strtolower($xmlString), 'could not retrieve a transcript')) {
                     Log::warning("Transkrip tidak tersedia untuk video {$videoId}. Kemungkinan karena tidak ada subtitle atau video dibatasi.");
                     throw new Exception("Maaf, transkrip tidak tersedia untuk video ini.");
                }
                Log::error("Gagal mem-parse respons XML dari API transkrip untuk video {$videoId}. Response: " . substr($xmlString, 0, 500) . "...");
                throw new Exception("Terjadi kesalahan saat mengambil transkrip. Coba lagi nanti.");
            }

            $transcriptParts = [];
            foreach ($xml->text as $line) {
                $transcriptParts[] = html_entity_decode(strip_tags($line->asXML()));
            }

            if (empty($transcriptParts)) {
                Log::warning("Transkrip kosong untuk video {$videoId}.");
                throw new Exception("Transkrip kosong.");
            }

            $fullTranscript = implode(" ", $transcriptParts);
            Log::info("Transcript for {$videoId} fetched, length: " . strlen($fullTranscript));
            return $fullTranscript;

        } catch (Exception $e) {
            Log::error("Failed to get YouTube transcript: " . $e->getMessage());
            throw new Exception("Gagal mendapatkan transkrip dari video YouTube. Video mungkin tidak memiliki subtitle, bersifat pribadi, atau ada masalah dengan layanan eksternal.");
        }
    }
    
    private function performWebSearch(string $query): array
    {
        if (empty($this->serperApiKey)) throw new Exception('SERPER_API_KEY tidak dikonfigurasi.');
    
        $response = Http::withHeaders(['X-API-KEY' => $this->serperApiKey, 'Content-Type' => 'application/json'])
                        ->post('https://google.serper.dev/search', ['q' => $query, 'num' => 3, 'gl' => 'id']);
        if (!$response->successful()) throw new Exception('Gagal menghubungi layanan pencarian web Serper.');
    
        $results = $response->json('organic', []);
        $scrapedResults = [];
    
        foreach ($results as $result) {
            $url = $result['link'] ?? null;
            if (!$url || filter_var($url, FILTER_VALIDATE_URL) === false) continue;
            
            $content = $this->scrapeUrlContent($url);
            if(!empty(trim($content))) {
                $scrapedResults[] = [
                    'title'   => $result['title'] ?? 'Tanpa Judul', 'url' => $url,
                    'content' => $content
                ];
            }
        }
        return $scrapedResults;
    }

    private function scrapeUrlContent(string $url): string
    {
        try {
            $response = Http::timeout(15)->get($url);
            if (!$response->successful()) return "";
            
            $html = $response->body();
            $crawler = new Crawler($html);
            $crawler->filter('script, style, nav, header, footer, aside, form, .cookie, #cookie-banner')->each(fn (Crawler $node) => $node->getNode(0)->parentNode->removeChild($node->getNode(0)));
            $mainContent = $crawler->filter('article, main, [role="main"]')->first();
            $text = ($mainContent->count() > 0) ? $mainContent->text() : $crawler->filter('body')->text();
            
            Log::info("Successfully scraped content from {$url}");
            return $text;
        } catch (Exception $e) {
            Log::error("Failed to scrape URL {$url}: " . $e->getMessage());
            return "";
        }
    }
    
    private function extractTextFromPdf($file): string
    {
        try {
            Log::info("Attempting to parse PDF with Smalot\PdfParser for file: " . $file->getClientOriginalName());
            $parser = new Parser();
            $text = $parser->parseFile($file->getPathname())->getText();
        } catch (Exception $e) {
            Log::warning('Gagal parsing PDF dengan PDFParser: ' . $e->getMessage());
            $text = '';
        }

        if (empty(trim($text))) {
            Log::info('Teks dari PDF Parser kosong. Menjalankan fallback ke OCR Tesseract.');

            if (!class_exists('Imagick')) throw new Exception('Gagal OCR: Class Imagick tidak ditemukan. Pastikan ekstensi PHP Imagick sudah terpasang dan aktif di server Anda.');
            if (!class_exists('TesseractOCR')) throw new Exception('Gagal OCR: Class TesseractOCR tidak ditemukan. Pastikan Anda sudah menjalankan "composer require thiagoalessio/tesseract_ocr".');
            
            try {
                $imagick = new Imagick();
                $imagick->setResolution(300, 300);
                $imagick->readImage($file->getPathname());
                $ocrText = (new TesseractOCR())
                    ->imageData($imagick->getImageBlob(), $imagick->getNumberImages())
                    ->lang('ind', 'eng')
                    ->run();
                
                $text = $ocrText;
                $imagick->clear();
                Log::info('OCR lokal berhasil, total panjang teks: ' . strlen($text));
            } catch (Exception $e) {
                Log::error('Gagal melakukan proses OCR: ' . $e->getMessage());
                throw new Exception('Gagal melakukan proses OCR. Pastikan Tesseract dan Imagick terinstall dengan benar di server dan dapat diakses oleh PHP.');
            }
        }
        Log::info('PDF text extraction successful. Total characters: ' . strlen($text));
        return $text;
    }
    
    private function handleApiException(RequestException $e, string $context = 'General')
    {
        if (!$e->response) return response()->json(['error' => 'Gagal terhubung ke layanan AI. Periksa koneksi jaringan server.'], 504);
        
        $status = $e->response->status();
        $body = $e->response->json();
        $errorMessage = $body['error']['message'] ?? 'Terjadi kesalahan tidak diketahui pada layanan AI.';

        Log::error("OpenAI API Error ({$context}): Status {$status} - {$errorMessage}");

        switch ($status) {
            case 401: return response()->json(['error' => 'Autentikasi gagal. Kunci API OpenAI Anda tidak valid.'], 401);
            case 429: return response()->json(['error' => 'Anda telah mencapai batas penggunaan API. Silakan coba lagi nanti.'], 429);
            case 500: return response()->json(['error' => 'Terjadi masalah di server AI. Coba lagi nanti.'], 502);
            case 503: return response()->json(['error' => 'Server AI sedang sibuk atau tidak tersedia. Silakan coba lagi.'], 503);
            default:  return response()->json(['error' => $errorMessage], $status > 500 ? 502 : $status);
        }
    }
}