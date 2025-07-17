<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Cloud\Speech\V1p1beta1\SpeechClient;
use Google\Cloud\Speech\V1p1beta1\RecognitionConfig;
use Google\Cloud\Speech\V1p1beta1\RecognitionAudio;
use Google\Cloud\Speech\V1p1beta1\RecognitionConfig\AudioEncoding;
use Exception;

class VoiceController extends Controller
{
    public function transcribe(Request $request)
    {
        // Validasi bahwa file audio ada
        $request->validate([
            'audio' => 'required|file',
        ]);

        $audioFile = $request->file('audio');
        $audioContent = file_get_contents($audioFile->getRealPath());

        try {
            // Konfigurasi otentikasi menggunakan API Key dari file .env
            $speechClient = new SpeechClient([
                'key' => env('GOOGLE_API_KEY')
            ]);

            // Konfigurasi untuk proses transkripsi
            $config = new RecognitionConfig([
                // Browser biasanya merekam dalam format WEBM dengan codec OPUS
                'encoding' => AudioEncoding::WEBM_OPUS,
                // Kita tidak tahu sample rate-nya, jadi biarkan Google mendeteksi otomatis
                // dengan menyetel sample_rate_hertz = 0 atau tidak menyetelnya sama sekali.
                // Jika Anda tahu sample rate-nya, misalnya 48000, Anda bisa menambahkannya di sini.
                // 'sample_rate_hertz' => 48000,
                'language_code' => 'id-ID', // Bahasa Indonesia
                'enable_automatic_punctuation' => true, // Aktifkan tanda baca otomatis
            ]);

            // Buat objek audio
            $audio = new RecognitionAudio([
                'content' => $audioContent,
            ]);

            // Kirim request ke Google Cloud Speech-to-Text API
            $response = $speechClient->recognize($config, $audio);

            $transcription = 'Tidak ada transkripsi yang terdeteksi.';

            // Loop melalui hasil untuk mendapatkan transkripsi terbaik
            foreach ($response->getResults() as $result) {
                $alternatives = $result->getAlternatives();
                if ($alternatives) {
                    // Ambil transkripsi dengan tingkat kepercayaan tertinggi
                    $transcription = $alternatives[0]->getTranscript();
                    break; // Kita hanya butuh yang pertama dan terbaik
                }
            }

            // Tutup koneksi client
            $speechClient->close();

            return response()->json([
                'text' => $transcription,
            ]);

        } catch (Exception $e) {
            // Tangani error jika terjadi
            return response()->json(['error' => 'Gagal memproses audio: ' . $e->getMessage()], 500);
        }
    }
}