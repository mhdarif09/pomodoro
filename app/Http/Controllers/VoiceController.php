<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Cloud\Speech\V1p1beta1\SpeechClient;
use Google\Cloud\Speech\V1p1beta1\RecognitionConfig;
use Google\Cloud\Speech\V1p1beta1\RecognitionAudio;
use Google\Cloud\Speech\V1p1beta1\RecognitionConfig\AudioEncoding;
use Google\Cloud\TextToSpeech\V1\TextToSpeechClient;
use Google\Cloud\TextToSpeech\V1\SynthesisInput;
use Google\Cloud\TextToSpeech\V1\VoiceSelectionParams;
use Google\Cloud\TextToSpeech\V1\AudioConfig;
use Google\Cloud\TextToSpeech\V1\AudioEncoding as TtsAudioEncoding;
use Google\Cloud\TextToSpeech\V1\SsmlVoiceGender;
use Google\ApiCore\ApiException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class VoiceController extends Controller
{
    /**
     * Menerima audio, mentranskripsikannya, dan memberikan respon AI.
     */
    public function transcribe(Request $request)
    {
        set_time_limit(0);
        $request->validate([
            'audio' => 'required|file|mimes:webm,wav,opus',
        ]);

        $audioFile = $request->file('audio');
        $audioContent = file_get_contents($audioFile->getRealPath());

        try {
            // Otentikasi menggunakan API Key dari file .env
            $speechClient = new SpeechClient([
                'key' => env('GOOGLE_API_KEY')
            ]);

            // Konfigurasi untuk transkripsi
            $config = new RecognitionConfig([
                'encoding' => AudioEncoding::WEBM_OPUS,
                'sample_rate_hertz' => 48000,
                'language_code' => 'id-ID',
                'enable_automatic_punctuation' => true,
            ]);

            // Buat objek audio
            $audio = new RecognitionAudio(['content' => $audioContent]);

            // Kirim request ke Google
            $response = $speechClient->recognize($config, $audio);
            $userTranscription = 'Maaf, saya tidak dapat memahami ucapan Anda.';

            // Ambil hasil transkripsi terbaik
            if ($response->getResults() && $response->getResults()[0]->getAlternatives()) {
                $userTranscription = $response->getResults()[0]->getAlternatives()[0]->getTranscript();
            }

            // Dapatkan jawaban dari Gemini AI berdasarkan hasil transkripsi
            $aiResponse = $this->getGeminiResponse($userTranscription);
            
            // Konversi respons AI menjadi audio
            $audioUrl = $this->convertTextToSpeech($aiResponse);
            
            // Tutup koneksi client
            $speechClient->close();

            // Kembalikan hasil transkripsi, jawaban AI, dan audio URL ke frontend
            return response()->json([
                'user_text' => $userTranscription,
                'ai_text' => $aiResponse,
                'ai_audio_url' => $audioUrl
            ]);

        } catch (ApiException $e) {
            return response()->json(['error' => 'Error Google API: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Terjadi kesalahan pada server: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Fungsi untuk mendapatkan respons dari Gemini AI
     */
    private function getGeminiResponse(string $text): string
    {
        try {
            // Jika transkripsi gagal, berikan pesan default
            if (str_contains($text, 'tidak dapat memahami')) {
                return 'Silakan coba lagi. Ucapkan pertanyaan Anda dengan jelas.';
            }

            $geminiApiKey = env('GEMINI_API_KEY');
            
            if (!$geminiApiKey) {
                return 'Maaf, konfigurasi API tidak tersedia. Silakan hubungi administrator.';
            }

            // Endpoint Gemini API
            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={$geminiApiKey}";

            // Payload untuk Gemini API
            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => "Jawab pertanyaan berikut dalam bahasa Indonesia dengan lengkap dan informatif: {$text}"
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 1024,
                ]
            ];

            // Kirim request ke Gemini API
            $response = Http::timeout(30)
                ->post($url, $payload);

            if ($response->successful()) {
                $responseData = $response->json();
                
                // Ekstrak teks dari respons Gemini
                if (isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
                    return $responseData['candidates'][0]['content']['parts'][0]['text'];
                }
            }

            // Jika ada error atau respons tidak sesuai format
            return 'Maaf, saya mengalami kesulitan memproses pertanyaan Anda. Silakan coba lagi.';

        } catch (\Exception $e) {
            // Log error untuk debugging
            \Log::error('Gemini API Error: ' . $e->getMessage());
            
            return 'Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi nanti.';
        }
    }

    /**
     * Konversi teks menjadi audio menggunakan Google Cloud Text-to-Speech
     */
    private function convertTextToSpeech(string $text): ?string
    {
        try {
            // Inisialisasi Text-to-Speech client
            $textToSpeechClient = new TextToSpeechClient([
                'key' => env('GOOGLE_API_KEY')
            ]);

            // Buat input synthesis
            $synthesisInputText = new SynthesisInput();
            $synthesisInputText->setText($text);

            // Konfigurasi suara (Indonesian voice)
            $voice = new VoiceSelectionParams();
            $voice->setLanguageCode('id-ID');
            $voice->setSsmlGender(SsmlVoiceGender::FEMALE); // Atau MALE
            $voice->setName('id-ID-Standard-A'); // Suara Indonesia standar

            // Konfigurasi audio output
            $audioConfig = new AudioConfig();
            $audioConfig->setAudioEncoding(TtsAudioEncoding::MP3);
            $audioConfig->setSpeakingRate(1.0); // Kecepatan bicara normal
            $audioConfig->setPitch(0.0); // Nada suara normal

            // Lakukan synthesis
            $response = $textToSpeechClient->synthesizeSpeech($synthesisInputText, $voice, $audioConfig);
            $audioContent = $response->getAudioContent();

            // Simpan audio ke storage
            $fileName = 'ai_response_' . time() . '_' . uniqid() . '.mp3';
            $filePath = 'public/audio/' . $fileName;
            
            Storage::put($filePath, $audioContent);

            // Tutup client
            $textToSpeechClient->close();

            // Return URL yang bisa diakses dari frontend
            return Storage::url($filePath);

        } catch (\Exception $e) {
            \Log::error('Text-to-Speech Error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Method alternatif menggunakan Web Speech API (client-side)
     * Untuk mengurangi beban server dan latensi
     */
    public function getVoiceSettings()
    {
        return response()->json([
            'voice_settings' => [
                'lang' => 'id-ID',
                'rate' => 1.0,
                'pitch' => 1.0,
                'volume' => 1.0
            ]
        ]);
    }

    /**
     * Method untuk membersihkan file audio lama (bisa dipanggil via cron job)
     */
    public function cleanupOldAudioFiles()
    {
        try {
            $audioPath = storage_path('app/public/audio');
            
            if (is_dir($audioPath)) {
                $files = glob($audioPath . '/*.mp3');
                $now = time();
                
                foreach ($files as $file) {
                    // Hapus file yang lebih dari 1 jam
                    if (is_file($file) && ($now - filemtime($file)) > 3600) {
                        unlink($file);
                    }
                }
            }
            
            return response()->json(['message' => 'Cleanup completed']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}