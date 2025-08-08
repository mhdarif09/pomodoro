// File: resources/js/Pages/ReflectionPage.jsx (Versi dengan Kuota Gratis)

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { PaperAirplaneIcon, LockClosedIcon } from '@heroicons/react/24/solid'; // Tambah LockClosedIcon
import { motion, AnimatePresence } from 'framer-motion';

// --- Komponen UI Chat (Tidak berubah) ---
const AiAvatar = () => (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
    </div>
);
const AIMessage = ({ content }) => (
    <div className="flex items-end gap-3">
        <AiAvatar />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg max-w-lg shadow-sm">
            <p className="text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{content}</p>
        </motion.div>
    </div>
);
const UserMessage = ({ content }) => (
    <div className="flex justify-end">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="bg-teal-500 text-white p-3 rounded-lg max-w-lg shadow-sm">
            <p className="whitespace-pre-wrap">{content}</p>
        </motion.div>
    </div>
);
const TypingIndicator = () => (
    <div className="flex items-end gap-3">
        <AiAvatar />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-1.5">
                <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, delay: 0.1, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, ease: "easeInOut" }} />
            </div>
        </motion.div>
    </div>
);
// --- Komponen Baru untuk Prompt Upgrade ---
const UpgradePrompt = () => (
    <div className="p-4 text-center bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
        <LockClosedIcon className="w-8 h-8 mx-auto text-yellow-500 mb-2"/>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Kuota Refleksi Habis</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-3">
            Anda telah menggunakan seluruh kuota refleksi gratis Anda.
        </p>
        <Link 
            href={route('dashboard')}
            className="inline-block px-4 py-2 text-sm font-bold text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
        >
            Upgrade ke Premium
        </Link>
    </div>
);

// --- Komponen Halaman Utama (Sudah Dimodifikasi) ---
export default function ReflectionPage({ auth, history = [], isPremium, remainingQuota }) {
    const lastTurn = history[history.length - 1];
    const sessionId = lastTurn?.session_id;

    const { data, setData, post, processing, errors, reset } = useForm({
        answer: '',
        session_id: sessionId,
    });
    
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    
    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
    useEffect(() => {
        scrollToBottom();
        // Hanya fokus jika input aktif
        if (isPremium || remainingQuota > 0) {
            textareaRef.current?.focus();
        }
    }, [history, isPremium, remainingQuota]);
    
    const submit = (e) => {
        e.preventDefault();
        if (processing || !data.answer) return;
        post(route('refleksi.store'), {
            preserveScroll: true,
            onSuccess: () => reset('answer'),
            onFinish: () => setTimeout(scrollToBottom, 100),
        });
    };

    const isLimitReached = !isPremium && remainingQuota <= 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight flex items-center">
                            <span className="relative mr-3">
                                <img className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500" alt="GrowthBot Avatar"/>
                                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-2 ring-white dark:ring-slate-800"></span>
                            </span>
                            GrowthBot
                        </h2>
                        {/* Tampilkan Sisa Kuota */}
                        {!isPremium && (
                            <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${remainingQuota > 3 ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                {Math.max(0, remainingQuota)} Sesi Gratis Tersisa
                            </span>
                        )}
                    </div>
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
                        <div className="flex-grow p-4 sm:p-6 space-y-6 overflow-y-auto">
                            <AnimatePresence>
                                {history.map((turn) => (
                                    <div key={turn.id} className="space-y-4">
                                        <AIMessage content={turn.ai_question} />
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
                        
                        <div className="p-2 sm:p-4 border-t border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm">
                            {/* Ganti Form dengan Prompt Upgrade jika kuota habis */}
                            {isLimitReached ? (
                                <UpgradePrompt />
                            ) : (
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
