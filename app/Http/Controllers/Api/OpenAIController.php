<?php
// File: app/Http/Controllers/OpenAIController.php
// Versi: Godfather Edition (Powerful, Smart, Definitive)

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

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
    protected string $mainModel = 'gpt-4o';
    protected string $retrievalModel = 'gpt-4o';
    protected int $maxOutputTokens = 4095;
    protected bool $enableRagDebugLogging = true;

    public function __construct()
    {
        $this->apiBaseUrl = "https://api.openai.com/v1/chat/completions";
        $apiKey = config('services.openai.api_key');
        $this->serperApiKey = env('SERPER_API_KEY');

        if (empty($apiKey)) {
            Log::critical("FATAL: OPENAI_API_KEY is not configured.");
            throw new Exception("Konfigurasi kunci API OpenAI tidak ditemukan.");
        }
        
        $this->httpClient = Http::withToken($apiKey)
                                ->withHeaders(['Content-Type' => 'application/json'])
                                ->retry(3, 1500)
                                ->timeout(600);
    }

    public function ask(Request $request)
    {
        $validated = $request->validate([
            'query'     => 'required|string|max:4000',
            'history'   => 'nullable|array',
            'webSearch' => 'nullable|boolean',
        ]);

        $query = $validated['query'];
        
        try {
            if (preg_match('/(youtube\.com\/watch\?v=|youtu\.be\/)([^&?#\s]+)/', $query, $matches)) {
                return $this->handleYoutubeQuery($query, $matches[2]);
            }
            if ($validated['webSearch']) {
                return $this->handleWebSearchQuery($query, $validated['history'] ?? []);
            }
            return $this->handleSimpleChat($query, $validated['history'] ?? []);

        } catch (Exception $e) {
            Log::error('Orchestration Hub Error in ask(): ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['error' => 'Terjadi kesalahan internal saat memproses permintaan Anda.'], 500);
        }
    }
    
    public function askFromPdf(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|mimes:pdf|max:204800',
            'query' => 'required|string|max:4000',
        ]);
        
        try {
            $textContent = $this->extractTextFromPdf($request->file('file'));
            if (empty(trim($textContent))) {
                 return response()->json(['error' => 'Gagal membaca teks dari PDF. Dokumen mungkin hanya berisi gambar atau terproteksi.'], 422);
            }

            $systemPrompt = "Anda adalah asisten AI ahli analisis dokumen. Jawab pertanyaan pengguna HANYA berdasarkan konteks yang diberikan. Jika informasi tidak ada secara eksplisit, katakan 'Berdasarkan konteks yang diberikan, informasi spesifik mengenai hal tersebut tidak ditemukan, namun ada informasi terkait...'. Jangan berbohong atau mengarang.";

            return $this->generateAnswerFromContext($validated['query'], $textContent, $systemPrompt);

        } catch(Exception $e) {
            Log::error('PDF Processing Error in askFromPdf(): ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    public function askFromSheet(Request $request){
        $validated = $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240',
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
3.  **Filter & Segmentasi:** Jawab pertanyaan yang memerlukan pemfilteran data.
4.  **Analisis Tren & Perbandingan:** Identifikasi tren dari waktu ke waktu, bandingkan performa antar kategori, dan temukan anomali.
5.  **Korelasi Sederhana:** Jawab pertanyaan tentang hubungan antar kolom.
6.  **Peringkat (Ranking):** Tentukan peringkat item.
7.  **Bahasa Natural:** Pahami pertanyaan yang diajukan dalam bahasa natural.
**ATURAN WAJIB:**
-   **SELALU DASARKAN JAWABAN PADA DATA.** Jika informasi tidak ada, katakan demikian.
-   **TUNJUKKAN CARA KERJA ANDA.** Jelaskan secara singkat proses atau filter yang Anda gunakan.
-   **GUNAKAN FORMATTING.** Sajikan jawaban yang kompleks dalam bentuk daftar atau tabel.
PROMPT;
            return $this->generateAnswerFromContext($validated['query'], $markdownTable, $systemPrompt);

        } catch(Exception $e) {
            Log::error('Spreadsheet Processing Error in askFromSheet(): ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function askFromPaper(Request $request)
    {
        $validated = $request->validate([ 'file' => 'required|mimes:pdf|max:204800', ]);

        try {
            $pdfText = $this->extractTextFromPdf($request->file('file'));
            if (empty(trim($pdfText))) { return response()->json(['error' => 'Tidak dapat membaca teks dari file PDF.'], 422); }
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
            return $this->generateAnswerFromContext("Analisis dan review jurnal ini secara akademik.", $pdfText, $systemPrompt);
        } catch (Exception $e) {
            Log::error('Academic Review Error: ' . $e->getMessage());
            return response()->json(['error' => 'Gagal menganalisis jurnal.'], 500);
        }
    }

    public function askAcademicWriter(Request $request)
    {
        $validated = $request->validate([
            'topic' => 'required|string|max:4000', 'references' => 'nullable|string|max:8000', 'section' => 'nullable|string|max:100'
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

    private function extractTableFromSheet($file): string
    {
        Log::info("Attempting to parse spreadsheet file: " . $file->getClientOriginalName());
        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $maxRows = 200; 
            $data = $sheet->toArray(null, true, true, true);
            $data = array_slice($data, 0, $maxRows);
            if (empty($data)) return "";
            $markdown = "";
            $header = array_shift($data);
            $header = array_filter($header, fn($cell) => !is_null($cell) && $cell !== '');
            $columnKeys = array_keys($header);
            if(empty($header)) return "";
            $markdown .= "| " . implode(" | ", $header) . " |\n";
            $markdown .= "| " . implode(" | ", array_fill(0, count($header), '---')) . " |\n";
            foreach ($data as $row) {
                $rowData = [];
                foreach ($columnKeys as $key) { $rowData[] = $row[$key] ?? ''; }
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
        $systemPrompt = <<<PROMPT
You are Super Agent AI, a personal productivity and study mentor.

Your mission:
Help users become productive, disciplined, and successful in study and task completion.

You act as:
- productivity coach
- study mentor
- accountability partner
- intelligent assistant

Rules:
- Friendly and conversational.
- Encourage small productive actions.
- Break big tasks into small steps.
- Be supportive, not judgmental.
- Always guide toward real action.

If user confused:
clarify and simplify.

If user unmotivated:
give encouragement based on progress.

Never chat aimlessly.
Always guide toward progress.

Goal:
User becomes productive daily.
PROMPT;
        
        $messages = [];
        $messages[] = ['role' => 'system', 'content' => $systemPrompt];
        foreach ($history as $msg) {
            if (isset($msg['role'], $msg['content'])) $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
        }
        $messages[] = ['role' => 'user', 'content' => $query];
        try {
            $response = $this->httpClient->post($this->apiBaseUrl, [ 'model' => $this->mainModel, 'messages' => $messages, 'max_tokens' => $this->maxOutputTokens, 'temperature' => 0.7, ]);
            $response->throw();
            $content = $response->json('choices.0.message.content', 'Tidak ada respons dari AI.');
            return response()->json(['response' => $content, 'sources' => []]);
        } catch (RequestException $e) {
            return $this->handleApiException($e, 'Simple Chat');
        }
    }

    private function generateAnswerFromContext(string $query, string $fullContext, string $systemPrompt, array $history = [], array $sources = [])
    {
        $chunks = $this->chunkText($fullContext);
        $relevantChunkIndices = $this->findRelevantChunkIndices($query, $chunks);
        $relevantChunks = array_map(fn($index) => $chunks[$index] ?? null, $relevantChunkIndices);
        $relevantChunks = array_filter($relevantChunks);
        $contextForPrompt = implode("\n\n---\n\n", array_slice($relevantChunks, 0, 5));
        
        if ($this->enableRagDebugLogging) {
            Log::channel('daily')->info("================== RAG DEBUG ==================");
            Log::channel('daily')->info("QUERY: " . $query);
            Log::channel('daily')->info("TOTAL CHUNKS: " . count($chunks));
            Log::channel('daily')->info("SELECTED CHUNK INDICES: " . implode(', ', $relevantChunkIndices));
            Log::channel('daily')->info("FINAL CONTEXT PASSED TO MODEL: \n" . $contextForPrompt);
            Log::channel('daily')->info("================ END RAG DEBUG ================");
        }

        $messages = array_merge([['role' => 'system', 'content' => $systemPrompt]], $history);
        $messages[] = ['role' => 'user', 'content' => "Berdasarkan KONTEKS berikut:\n\"" . $contextForPrompt . "\"\n\nJawab pertanyaan ini: " . $query];

        try {
            $response = $this->httpClient->post($this->apiBaseUrl, [
                'model' => $this->mainModel, 'messages' => $messages, 'max_tokens' => $this->maxOutputTokens, 'temperature' => 0.1,
            ]);
            $response->throw();
            $content = $response->json('choices.0.message.content', 'AI tidak dapat menghasilkan jawaban.');
            return response()->json(['response' => $content, 'sources'  => $sources]);
        } catch (RequestException $e) {
            return $this->handleApiException($e, 'RAG');
        }
    }
    
    private function findRelevantChunkIndices(string $query, array $chunks): array
    {
        if (count($chunks) <= 5) return array_keys($chunks);

        $chunkList = "";
        foreach ($chunks as $index => $chunk) {
            $chunkList .= "CHUNK {$index}:\n\"" . $chunk . "\"\n\n";
        }
        
        $prompt = "Anda adalah AI pemilah informasi super cerdas. Identifikasi semua potongan teks (CHUNK) yang relevan untuk menjawab pertanyaan pengguna. Berikan hanya nomor-nomor CHUNK yang relevan, dipisahkan koma, dari yang paling relevan hingga kurang relevan. Contoh: 5,2,8\n\nPertanyaan Pengguna: \"{$query}\"\n\n--- DAFTAR CHUNK ---\n{$chunkList}";
        
        try {
            $response = $this->httpClient->post($this->apiBaseUrl, [
                'model' => $this->retrievalModel, 'messages' => [['role' => 'user', 'content' => $prompt]], 'max_tokens' => 150, 'temperature' => 0.0,
            ]);
            $response->throw();
            preg_match_all('/\d+/', $response->json('choices.0.message.content'), $matches);
            $relevantIndices = array_unique($matches[0] ?? []);
            if (empty($relevantIndices)) {
                Log::warning("RAG Retrieval: Gagal memilih chunk, fallback ke 3 chunk pertama.", ['query' => $query]);
                return [0, 1, 2];
            }
            return array_values($relevantIndices);
        } catch (Exception $e) {
            Log::warning('RAG Retrieval: Exception, fallback ke 3 chunk pertama.', ['error' => $e->getMessage()]);
            return [0, 1, 2];
        }
    }

    private function chunkText(string $text, int $size = 2000, int $overlap = 400): array
    {
        $text = preg_replace('/\s+/', ' ', $text);
        if (strlen($text) <= $size) return [$text];
        $paragraphs = preg_split('/(\r\n|\n|\r){2,}/', $text);
        $sentences = [];
        foreach ($paragraphs as $p) {
            $sentences = array_merge($sentences, preg_split('/(?<=[.?!])\s+/', $p, -1, PREG_SPLIT_NO_EMPTY));
        }
        if(empty($sentences)) $sentences = [$text]; // Fallback jika tidak ada pemisah
        $chunks = [];
        $currentChunk = "";
        foreach ($sentences as $sentence) {
            $sentence = trim($sentence);
            if(strlen($currentChunk) + strlen($sentence) + 1 > $size) {
                if(!empty(trim($currentChunk))) $chunks[] = trim($currentChunk);
                $overlapSentences = array_slice($sentences, -3); // Ambil 3 kalimat terakhir
                $overlapText = implode(' ', $overlapSentences);
                $currentChunk = (strlen($overlapText) < $size - $overlap) ? $overlapText . " " . $sentence : $sentence;
            } else {
                $currentChunk .= " " . $sentence;
            }
        }
        if (!empty(trim($currentChunk))) { $chunks[] = trim($currentChunk); }
        return empty($chunks) ? [$text] : $chunks;
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
                Log::error($errorMessage . ". Response Body: " . $response->body());
                throw new Exception($errorMessage);
            }
            $xmlString = $response->body();
            $xml = @simplexml_load_string($xmlString);
            if ($xml === false || !isset($xml->text)) {
                if (str_contains(strtolower($xmlString), 'could not retrieve a transcript')) {
                     Log::warning("Transkrip tidak tersedia untuk video {$videoId}.");
                     throw new Exception("Maaf, transkrip tidak tersedia untuk video ini.");
                }
                Log::error("Gagal mem-parse respons XML dari API transkrip untuk video {$videoId}. Response: " . substr($xmlString, 0, 500) . "...");
                throw new Exception("Terjadi kesalahan saat mengambil transkrip. Coba lagi nanti.");
            }
            $transcriptParts = [];
            foreach ($xml->text as $line) { $transcriptParts[] = html_entity_decode(strip_tags($line->asXML())); }
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
        $response = Http::withHeaders(['X-API-KEY' => $this->serperApiKey, 'Content-Type' => 'application/json'])->post('https://google.serper.dev/search', ['q' => $query, 'num' => 3, 'gl' => 'id']);
        if (!$response->successful()) throw new Exception('Gagal menghubungi layanan pencarian web Serper.');
        $results = $response->json('organic', []);
        $scrapedResults = [];
        foreach ($results as $result) {
            $url = $result['link'] ?? null;
            if (!$url || filter_var($url, FILTER_VALIDATE_URL) === false) continue;
            $content = $this->scrapeUrlContent($url);
            if(!empty(trim($content))) { $scrapedResults[] = [ 'title' => $result['title'] ?? 'Tanpa Judul', 'url' => $url, 'content' => $content ]; }
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