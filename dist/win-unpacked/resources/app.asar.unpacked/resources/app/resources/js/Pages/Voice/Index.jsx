import React, { useState, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';

// Ikon-ikon lainnya (Mic, Stop, Spinner) sama seperti sebelumnya...
const MicIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-12 0v1.5a6 6 0 006 6z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a3 3 0 01-3-3v-1.5a3 3 0 016 0v1.5a3 3 0 01-3 3z" /> </svg> );
const StopIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" /> </svg> );
const SpinnerIcon = ({ className }) => ( <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> );


export default function VoiceIndex({ auth }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [userText, setUserText] = useState('');
    const [aiText, setAiText] = useState('');
    const [aiAudioUrl, setAiAudioUrl] = useState('');
    const [error, setError] = useState('');

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioPlayerRef = useRef(null); // Ref untuk elemen audio player

    // Gunakan useEffect untuk memutar audio secara otomatis ketika URL berubah
    useEffect(() => {
        if (aiAudioUrl && audioPlayerRef.current) {
            audioPlayerRef.current.src = aiAudioUrl;
            audioPlayerRef.current.play().catch(e => console.error("Gagal memutar audio:", e));
        }
    }, [aiAudioUrl]);

    const startRecording = async () => {
        if (isProcessing) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            
            // Reset state untuk percakapan baru
            setUserText('');
            setAiText('');
            setAiAudioUrl('');
            setError('');
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                setIsProcessing(true);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('audio', audioBlob, 'user_voice.webm');

                try {
                    // Panggil endpoint API baru
                    const response = await axios.post('/api/voice/transcribe', formData);
                    
                    // Set state dari response controller
                    setUserText(response.data.user_text);
                    setAiText(response.data.ai_text);
                    setAiAudioUrl(response.data.ai_audio_url); // Ini akan memicu useEffect untuk memutar audio

                } catch (err) {
                    const errorMessage = err.response?.data?.error || 'Gagal terhubung ke server.';
                    setError(errorMessage);
                    console.error("API Error:", err);
                } finally {
                    setIsProcessing(false);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            setError("Izin mikrofon ditolak atau tidak ditemukan. Mohon izinkan akses mikrofon pada browser Anda.");
            console.error("Microphone Error:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleButtonClick = () => {
        // Hentikan pemutaran audio jika sedang berjalan
        if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current.currentTime = 0;
        }

        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };
    
    // Fungsi untuk memutar ulang audio AI
    const replayAiAudio = () => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.play();
        }
    }

    const getStatusLabel = () => {
        if (isProcessing) return 'AI sedang berpikir...';
        if (isRecording) return 'Sedang merekam... Tekan untuk berhenti.';
        return 'Tekan ikon untuk mulai berbicara.';
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Kelas AI Interaktif</h2>}>
            <Head title="Kelas Suara" />

            {/* Elemen audio yang tidak terlihat untuk memutar suara AI */}
            <audio ref={audioPlayerRef} style={{ display: 'none' }} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 md:p-10 flex flex-col items-center justify-center text-center">

                            <h1 className="text-3xl font-bold text-gray-900">Tanya Jawab dengan AI</h1>
                            <p className="mt-2 mb-8 text-gray-600">Ajukan pertanyaan dengan suara, dapatkan jawaban cerdas.</p>

                            <div className="relative flex flex-col items-center justify-center">
                                {/* Tombol Utama */}
                                <button
                                    onClick={handleButtonClick}
                                    disabled={isProcessing}
                                    className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50 ${isRecording ? 'bg-red-600 hover:bg-red-700 focus:ring-red-400' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-400'} ${isProcessing ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : ''} ${!isRecording && !isProcessing ? 'animate-pulse' : ''}`}
                                >
                                    {isProcessing ? <SpinnerIcon className="w-10 h-10" /> : isRecording ? <StopIcon className="w-10 h-10 text-white" /> : <MicIcon className="w-10 h-10 text-white" />}
                                </button>
                                <p className="mt-4 text-sm text-gray-500 h-5">{getStatusLabel()}</p>
                            </div>
                            
                            {error && (
                                <div className="w-full max-w-lg mt-6 p-4 text-sm text-red-800 rounded-lg bg-red-100" role="alert">
                                    <span className="font-medium">Oops! Terjadi kesalahan:</span> {error}
                                </div>
                            )}

                            {/* Area Hasil Percakapan */}
                            <div className="w-full max-w-2xl mt-8 space-y-4">
                                <div className="p-5 border rounded-lg bg-gray-50 text-left min-h-[100px]">
                                    <p className="text-sm font-semibold text-gray-500 mb-2">Anda bertanya:</p>
                                    <p className="text-lg text-gray-800">
                                        {isProcessing && !userText ? <span className="text-gray-400">Menganalisis...</span> : userText || <span className="text-gray-400">Hasil transkripsi Anda akan muncul di sini...</span>}
                                    </p>
                                </div>
                                <div className="p-5 border-2 border-indigo-200 rounded-lg bg-indigo-50 text-left min-h-[150px]">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm font-semibold text-indigo-600">AI Menjawab:</p>
                                        {aiAudioUrl && !isProcessing && (
                                            <button onClick={replayAiAudio} title="Dengarkan Lagi" className="text-indigo-500 hover:text-indigo-700">
                                                <SpeakerWaveIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-lg text-gray-800">
                                        {isProcessing && !aiText ? <span className="text-gray-400">Menyiapkan jawaban...</span> : aiText || <span className="text-gray-400">Jawaban dari AI akan muncul di sini...</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}