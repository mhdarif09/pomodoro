// File: resources/js/Pages/ReflectionPage.jsx (Final "Chat Buddy" Version)

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

// --- Komponen-komponen UI Chat ---

// Avatar untuk "GrowthBot" AI kita
const AiAvatar = () => (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
    </div>
);

// Bubble Chat dari AI
const AIMessage = ({ content }) => (
    <div className="flex items-end gap-3">
        <AiAvatar />
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg max-w-lg shadow-sm"
        >
            <p className="text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{content}</p>
        </motion.div>
    </div>
);

// Bubble Chat dari Pengguna
const UserMessage = ({ content }) => (
    <div className="flex justify-end">
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-teal-500 text-white p-3 rounded-lg max-w-lg shadow-sm"
        >
            <p className="whitespace-pre-wrap">{content}</p>
        </motion.div>
    </div>
);

// Indikator "AI sedang mengetik..."
const TypingIndicator = () => (
    <div className="flex items-end gap-3">
        <AiAvatar />
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-lg shadow-sm"
        >
            <div className="flex items-center gap-1.5">
                <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, delay: 0.1, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, ease: "easeInOut" }} />
            </div>
        </motion.div>
    </div>
);


// --- Komponen Halaman Utama ---
export default function ReflectionPage({ auth, history = [] }) {
    // Cari turn terakhir untuk mendapatkan sessionId
    const lastTurn = history[history.length - 1];
    const sessionId = lastTurn?.session_id;

    const { data, setData, post, processing, errors, reset } = useForm({
        answer: '',
        session_id: sessionId,
    });
    
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    
    // Scroll otomatis ke pesan terbaru
    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
    useEffect(() => {
        scrollToBottom();
        textareaRef.current?.focus();
    }, [history]);

    // Handle pengiriman form
    const submit = (e) => {
        e.preventDefault();
        if (processing || !data.answer) return;

        post(route('refleksi.store'), {
            preserveScroll: true,
            onSuccess: () => reset('answer'),
            onFinish: () => setTimeout(scrollToBottom, 100), // Beri jeda sedikit agar DOM sempat update
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight flex items-center">
                        <span className="relative mr-3">
                            <img className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500" alt="GrowthBot Avatar"/>
                            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-2 ring-white dark:ring-slate-800"></span>
                        </span>
                        GrowthBot
                    </h2>
                    <Link href={route('dashboard')} className="text-sm font-semibold text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 transition-colors">
                        Selesai & Kembali
                    </Link>
                </div>
            }
        >
            <Head title="Refleksi Harian" />

            <div className="pt-2 pb-8 sm:pt-4 sm:pb-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl flex flex-col h-[80vh] sm:h-[75vh]">
                        {/* Area Pesan Chat */}
                        <div className="flex-grow p-4 sm:p-6 space-y-6 overflow-y-auto">
                            <AnimatePresence>
                                {history.map((turn) => (
                                    <div key={turn.id} className="space-y-4">
                                        {/* Pertanyaan atau Feedback dari AI */}
                                        <AIMessage content={turn.ai_question} />

                                        {/* Jika user sudah menjawab, tampilkan jawaban & feedback berikutnya (jika ada) */}
                                        {turn.user_answer && (
                                            <>
                                                <UserMessage content={turn.user_answer} />
                                                {turn.ai_feedback && <AIMessage content={turn.ai_feedback} />}
                                            </>
                                        )}
                                    </div>
                                ))}
                                {processing && <TypingIndicator />}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>
                        
                        {/* Area Input Form */}
                        <div className="p-2 sm:p-4 border-t border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm">
                            <form onSubmit={submit} className="relative flex items-center">
                                <textarea
                                    ref={textareaRef}
                                    value={data.answer}
                                    onChange={(e) => setData('answer', e.target.value)}
                                    placeholder="Ketik balasanmu..."
                                    disabled={processing}
                                    className="w-full rounded-full border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 focus:ring-teal-500 focus:border-teal-500 py-2 pl-4 pr-14 transition resize-none"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            submit(e);
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={processing || !data.answer}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-400 text-white transition-all transform hover:scale-110"
                                >
                                    <PaperAirplaneIcon className="h-5 w-5" />
                                </button>
                                {errors.answer && <p className="absolute bottom-full left-0 text-sm text-red-500 mb-1">{errors.answer}</p>}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}