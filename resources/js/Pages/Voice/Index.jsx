import React, { useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// Komponen Ikon SVG untuk desain yang bersih
const MicIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-12 0v1.5a6 6 0 006 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a3 3 0 01-3-3v-1.5a3 3 0 016 0v1.5a3 3 0 01-3 3z" />
    </svg>
);

const StopIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
        <path d="M6.75 6.75a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H6.75z" />
        <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
);

const SpinnerIcon = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export default function VoiceIndex({ auth }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        if (isProcessing) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];
            setText('');
            setError('');

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                setIsProcessing(true);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], 'voice.webm', { type: 'audio/webm' });

                const formData = new FormData();
                formData.append('audio', audioFile);

                try {
                    const response = await axios.post(route('transcribe.store'), formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    setText(response.data.text);
                    setError('');
                } catch (err) {
                    console.error(err);
                    const errorMessage = err.response?.data?.error || 'Gagal memproses audio. Coba lagi.';
                    setError(errorMessage);
                    setText('');
                } finally {
                    setIsProcessing(false);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone: ", err);
            setError("Mikrofon tidak dapat diakses. Mohon berikan izin pada browser Anda.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            // Membersihkan track mikrofon agar lampu/indikator mikrofon di browser mati
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleButtonClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    // Dinamis menentukan teks label di bawah tombol utama
    const getStatusLabel = () => {
        if (isProcessing) return 'Menganalisis suara...';
        if (isRecording) return 'Sedang merekam... Tekan untuk berhenti.';
        return 'Tekan ikon untuk mulai berbicara.';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Kelas Suara Interaktif</h2>}
        >
            <Head title="Kelas Suara" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 md:p-10 flex flex-col items-center justify-center text-center">

                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Ubah Suara Menjadi Teks
                            </h1>
                            <p className="mt-2 mb-8 text-gray-600 dark:text-gray-400">
                                Ucapkan sesuatu dan biarkan AI menuliskannya untuk Anda secara otomatis.
                            </p>

                            {/* Tombol Utama */}
                            <div className="relative flex flex-col items-center justify-center">
                                <button
                                    onClick={handleButtonClick}
                                    disabled={isProcessing}
                                    className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50
                                        ${isRecording 
                                            ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-400'
                                        }
                                        ${isProcessing 
                                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                                            : ''
                                        }
                                        ${!isRecording && !isProcessing ? 'animate-pulse' : ''}
                                    `}
                                >
                                    {isProcessing 
                                        ? <SpinnerIcon className="w-10 h-10" /> 
                                        : isRecording 
                                            ? <StopIcon className="w-10 h-10" /> 
                                            : <MicIcon className="w-10 h-10" />
                                    }
                                </button>
                                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 h-5">
                                    {getStatusLabel()}
                                </p>
                            </div>
                            
                            {error && (
                                <div className="w-full max-w-lg mt-6 p-4 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-red-900/40 dark:text-red-300" role="alert">
                                    <span className="font-medium">Oops!</span> {error}
                                </div>
                            )}

                            {/* Area Hasil Transkripsi */}
                            <div className="w-full max-w-lg mt-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-left min-h-[150px] flex flex-col">
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Hasil Transkripsi:</p>
                                <p className="text-lg text-gray-800 dark:text-gray-200 flex-grow">
                                    {isProcessing
                                        ? <span className="text-gray-400 dark:text-gray-500">Menganalisis...</span>
                                        : text || <span className="text-gray-400 dark:text-gray-500">Hasil akan ditampilkan di sini...</span>
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}