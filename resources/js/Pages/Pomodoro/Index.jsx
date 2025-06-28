// resources/js/Pages/Pomodoro.jsx
// Versi final dengan limitasi fitur untuk user gratis

import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { SparklesIcon, DocumentTextIcon, XMarkIcon, PaperAirplaneIcon, ArrowPathIcon, LockClosedIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

// Main Pomodoro Component
export default function Pomodoro({ auth, isPremium, plans = [] }) {
    // --- State ---
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [blockedUrls, setBlockedUrls] = useState(['']);
    const [customFocusTime, setCustomFocusTime] = useState(25);
    const [customBreakTime, setCustomBreakTime] = useState(5);
    const [tabWarningCount, setTabWarningCount] = useState(0);
    const [showTabWarning, setShowTabWarning] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState('default');
    const audioRef = useRef(null);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [aiChatHistory, setAiChatHistory] = useState([]);

    // --- STATE BARU UNTUK LIMIT FITUR ---
    const [freeAiChatsUsed, setFreeAiChatsUsed] = useState(0);
    const FREE_AI_CHAT_LIMIT = 2; // Definisikan limit di sini agar mudah diubah
    // ------------------------------------

    const chatEndRef = useRef(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfQuery, setPdfQuery] = useState('');
    const [pdfAnswer, setPdfAnswer] = useState('');
    const [loadingPdfAI, setLoadingPdfAI] = useState(false);
    const [showPdfAI, setShowPdfAI] = useState(false);

    // --- Hooks & Effects ---
    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission().then(setNotificationPermission);
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [aiChatHistory]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && isRunning) {
                setTabWarningCount(prev => prev + 1);
                setShowTabWarning(true);
                if (notificationPermission === 'granted') {
                    new Notification('🍅 Kembali Fokus!', { body: 'Timer masih berjalan.' });
                }
                if (audioRef.current) audioRef.current.play().catch(e => console.log(e));
                setTimeout(() => setShowTabWarning(false), 3000);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isRunning, notificationPermission]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isRunning) {
                e.preventDefault();
                e.returnValue = 'Timer sedang berjalan. Yakin ingin keluar?';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isRunning]);

    useEffect(() => {
        let timer;
        if (isRunning && secondsLeft > 0) {
            timer = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
        } else if (secondsLeft === 0 && isRunning) {
            setIsRunning(false);
            saveSession(false);
            if (notificationPermission === 'granted') {
                new Notification('🎉 Sesi Selesai!', { body: 'Waktunya istirahat sejenak.' });
            }
        }
        return () => clearInterval(timer);
    }, [isRunning, secondsLeft]);

    // --- Handlers & Functions ---

    const handleAIQuery = async () => {
        // 1. Cek apakah pengguna boleh mengirim pesan
        if (!isPremium && freeAiChatsUsed >= FREE_AI_CHAT_LIMIT) {
            setShowUpgradeModal(true); // Tampilkan modal upgrade jika jatah habis
            return; // Hentikan fungsi
        }

        if (!aiQuery.trim() || isLoadingAI) return;

        // 2. Jika bukan premium, tambahkan hitungan penggunaan
        if (!isPremium) {
            setFreeAiChatsUsed(prev => prev + 1);
        }

        const userMessage = { role: 'user', content: aiQuery };
        setAiChatHistory(prev => [...prev, userMessage]);
        setIsLoadingAI(true);
        setAiQuery('');
        try {
            const response = await axios.post('/api/gemini/ask', { query: aiQuery });
            const aiMessage = { role: 'assistant', content: response.data.response };
            setAiChatHistory(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMsg = { role: 'assistant', content: 'Maaf, terjadi kesalahan.', isError: true };
            setAiChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsLoadingAI(false);
        }
    };
    
    const handlePdfSubmit = async () => {
        if (!pdfFile || !pdfQuery.trim()) return;
        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append('query', pdfQuery);
        setLoadingPdfAI(true);
        setPdfAnswer('');
        try {
            const res = await axios.post('/api/gemini/pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setPdfAnswer(res.data.response || "Tidak ditemukan jawaban dari dokumen.");
        } catch (err) {
            const errorText = err.response?.data?.error || 'Gagal membaca PDF atau menjawab pertanyaan.';
            setPdfAnswer(errorText);
        } finally {
            setLoadingPdfAI(false);
        }
    };
    
    const startSession = () => {
        setStartTime(dayjs());
        setIsRunning(true);
        setTabWarningCount(0);
        setSecondsLeft(customFocusTime * 60);
        setFreeAiChatsUsed(0); // Reset jatah chat gratis setiap sesi baru
    };

    const resetTimer = () => { setSecondsLeft(customFocusTime * 60); setIsRunning(false); };
    const stopSession = () => { if(isRunning) saveSession(true); resetTimer(); };
    const saveSession = (manuallyStopped = false) => {
        if (!startTime) return;
        router.post('/pomodoro/store', {
            focus_minutes: customFocusTime, break_minutes: customBreakTime,
            started_at: startTime?.toISOString(), ended_at: dayjs().toISOString(),
            manually_stopped: manuallyStopped, blocked_urls: blockedUrls.filter(Boolean),
            tab_switches: tabWarningCount,
            ai_questions_asked: aiChatHistory.filter(msg => msg.role === 'user').length,
        }, { preserveState: true });
    };

    const formatTime = () => {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const handleBlockedUrlChange = (index, value) => {
        const newUrls = [...blockedUrls]; newUrls[index] = value; setBlockedUrls(newUrls);
    };

    const addBlockedUrl = () => {
        if (!isPremium && blockedUrls.filter(url => url.trim() !== '').length >= 1) {
            setShowUpgradeModal(true); return;
        }
        setBlockedUrls([...blockedUrls, '']);
    };

    const removeBlockedUrl = (index) => {
        if (blockedUrls.length > 1) { setBlockedUrls(blockedUrls.filter((_, i) => i !== index)); } 
        else { setBlockedUrls(['']); }
    };

    const handleCustomTimeChange = (type, value) => {
        const numValue = Number(value);
        if (!isPremium && ((type === 'focus' && numValue !== 25) || (type === 'break' && numValue !== 5))) {
            setShowUpgradeModal(true); return;
        }
        if (type === 'focus') {
            setCustomFocusTime(numValue); if (!isRunning) setSecondsLeft(numValue * 60);
        } else { setCustomBreakTime(numValue); }
    };

    const handlePdfFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file); setPdfAnswer('');
        } else { alert('Harap pilih file PDF yang valid.'); }
    };

    const handleUpgrade = async (plan) => {
        try {
            const response = await axios.post('/subscribe/checkout', { plan: plan.name });
            if (window.snap) window.snap.pay(response.data.snap_token);
        } catch (err) { alert('Gagal memulai pembayaran.'); }
    };

    // Sub-komponen LockOverlay
    const LockOverlay = ({ message }) => (
        <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 p-4 text-center">
            <div className="space-y-3">
                <LockClosedIcon className="h-10 w-10 text-yellow-400 mx-auto" />
                <p className="font-medium text-white">{message}</p>
                <button onClick={() => setShowUpgradeModal(true)} className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold px-5 py-2 rounded-full shadow-lg text-sm">
                    ✨ Upgrade
                </button>
            </div>
        </div>
    );
    
    // --- JSX Render ---
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pomodoro Timer" />
            <audio ref={audioRef} src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSBvT19PAN/6/f8A/gD+/P7+/v79/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/vD+/PwC" />

            <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
                <motion.button onClick={() => setShowAIAssistant(true)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-3">
                    <SparklesIcon className="h-6 w-6" />
                    <span className="font-semibold hidden sm:block">AI Chat</span>
                </motion.button>
                <motion.button onClick={() => isPremium ? setShowPdfAI(true) : setShowUpgradeModal(true)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="bg-slate-700 hover:bg-slate-800 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 relative">
                    {!isPremium && <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 text-black text-[10px] items-center justify-center font-bold">✨</span></span>}
                    <DocumentTextIcon className="h-6 w-6" />
                    <span className="font-semibold hidden sm:block">PDF AI</span>
                </motion.button>
            </div>

            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-8 flex flex-col items-center space-y-8">
                <div className="w-full max-w-2xl mx-auto space-y-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 rounded-2xl shadow-xl text-center">
                        <h1 className="text-xl font-bold text-teal-600 dark:text-teal-400 mb-2">Fokus Sesi</h1>
                        <p className="text-8xl md:text-9xl font-mono font-bold text-slate-900 dark:text-white mb-6">{formatTime()}</p>
                        <div className="flex justify-center items-center space-x-4">
                            {!isRunning ? (
                                <motion.button onClick={startSession} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-10 rounded-full shadow-md">Mulai</motion.button>
                            ) : (
                                <motion.button onClick={stopSession} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-10 rounded-full shadow-md">Berhenti</motion.button>
                            )}
                            <button onClick={resetTimer} className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold transition-colors">Reset</button>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 rounded-2xl shadow-xl">
                        <h2 className="text-xl font-bold mb-6">Pengaturan Sesi</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-4 relative">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Durasi</h3>
                                <label className="block"><span className="text-sm text-slate-600 dark:text-slate-400">Waktu Fokus (menit)</span><input type="number" value={customFocusTime} onChange={(e) => handleCustomTimeChange('focus', e.target.value)} className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-teal-500 focus:ring-teal-500" min="1" /></label>
                                <label className="block"><span className="text-sm text-slate-600 dark:text-slate-400">Waktu Istirahat (menit)</span><input type="number" value={customBreakTime} onChange={(e) => handleCustomTimeChange('break', e.target.value)} className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-teal-500 focus:ring-teal-500" min="1" /></label>
                                {!isPremium && <LockOverlay message="Kustomisasi durasi timer." />}
                            </div>
                            <div className="space-y-3 relative">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Blokir Situs</h3>
                                {blockedUrls.map((url, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <input type="text" value={url} onChange={(e) => handleBlockedUrlChange(index, e.target.value)} placeholder="contoh: youtube.com" className="block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-teal-500 focus:ring-teal-500" />
                                        <button onClick={() => removeBlockedUrl(index)} className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-full transition-colors"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                ))}
                                <button onClick={addBlockedUrl} className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"><PlusIcon className="h-4 w-4"/>Tambah URL</button>
                                {!isPremium && blockedUrls.length > 1 && <LockOverlay message="Blokir lebih dari 1 situs." />}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- MODALS & SIDEBARS --- */}
            <AnimatePresence>
                {showAIAssistant && (
                     <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-100 dark:bg-slate-800 shadow-2xl z-50 flex flex-col">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800/80 backdrop-blur-lg">
                            <h3 className="text-lg font-bold flex items-center gap-2"><SparklesIcon className="h-6 w-6 text-teal-500"/>Asisten AI</h3>
                            <div>
                                <button onClick={() => setAiChatHistory([])} title="Clear Chat" className="p-2 text-slate-500 hover:text-rose-500 rounded-full transition-colors"><ArrowPathIcon className="h-5 w-5"/></button>
                                <button onClick={() => setShowAIAssistant(false)} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"><XMarkIcon className="h-6 w-6"/></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {aiChatHistory.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-sm text-sm shadow-sm ${msg.role === 'user' ? 'bg-teal-500 text-white rounded-br-none' : (msg.isError ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 rounded-bl-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none')}`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoadingAI && <div className="flex justify-start"><div className="p-3 rounded-lg bg-white dark:bg-slate-700 rounded-bl-none"><div className="flex items-center gap-2 text-sm text-slate-500"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>Berpikir...</div></div></div>}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-lg">
                             {!isPremium && (
                                <div className="text-center text-xs text-slate-500 mb-2">
                                    Jatah chat gratis tersisa: {Math.max(0, FREE_AI_CHAT_LIMIT - freeAiChatsUsed)} / {FREE_AI_CHAT_LIMIT}
                                </div>
                            )}
                             <form onSubmit={(e) => { e.preventDefault(); handleAIQuery(); }}>
                                <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <input
                                        value={aiQuery}
                                        onChange={(e) => setAiQuery(e.target.value)}
                                        placeholder={!isPremium && freeAiChatsUsed >= FREE_AI_CHAT_LIMIT ? "Jatah chat gratis habis..." : "Tanya apa saja..."}
                                        className="flex-1 p-3 bg-transparent focus:outline-none text-sm"
                                        disabled={isLoadingAI || (!isPremium && freeAiChatsUsed >= FREE_AI_CHAT_LIMIT)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoadingAI || !aiQuery.trim() || (!isPremium && freeAiChatsUsed >= FREE_AI_CHAT_LIMIT)}
                                        className="p-3 text-white bg-teal-500 rounded-r-lg hover:bg-teal-600 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                                    >
                                        <PaperAirplaneIcon className="h-5 w-5"/>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showPdfAI && isPremium && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPdfAI(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
                            <div className="flex justify-between items-center"><h3 className="text-lg font-bold">Tanya Jawab PDF</h3><button onClick={() => setShowPdfAI(false)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><XMarkIcon className="h-6 w-6"/></button></div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Upload PDF</label>
                                    <input type="file" accept="application/pdf" onChange={handlePdfFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                                    {pdfFile && <p className="text-xs mt-2 text-slate-500 bg-slate-100 dark:bg-slate-700 p-2 rounded-md">File terpilih: {pdfFile.name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="pdf-query" className="block text-sm font-medium mb-1">Pertanyaan Anda</label>
                                    <textarea id="pdf-query" value={pdfQuery} onChange={(e) => setPdfQuery(e.target.value)} rows="3" className="w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-teal-500 focus:ring-teal-500"></textarea>
                                </div>
                                <button onClick={handlePdfSubmit} disabled={loadingPdfAI || !pdfFile || !pdfQuery.trim()} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-4 rounded-lg disabled:bg-slate-400 transition-colors flex items-center justify-center gap-2">
                                    {loadingPdfAI && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                                    {loadingPdfAI ? 'Menganalisis...' : 'Tanya'}
                                </button>
                                {pdfAnswer && <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg max-h-40 overflow-y-auto"><h4 className="font-semibold mb-2">Jawaban:</h4><p className="text-sm whitespace-pre-wrap">{pdfAnswer}</p></div>}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showUpgradeModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUpgradeModal(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
                            <h2 className="text-2xl font-bold mb-2">✨ Upgrade ke Premium</h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-6">Buka semua fitur canggih untuk produktivitas maksimal.</p>
                            <div className="space-y-4">
                                {plans.map((plan) => (
                                    <div key={plan.id} className="p-4 border dark:border-slate-700 rounded-lg flex justify-between items-center text-left">
                                        <div>
                                            <h3 className="font-semibold">{plan.name}</h3>
                                            <p className="text-sm text-slate-500">Rp {Number(plan.price).toLocaleString('id-ID')}</p>
                                        </div>
                                        <button onClick={() => handleUpgrade(plan)} className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition-colors">Pilih Paket</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setShowUpgradeModal(false)} className="mt-6 text-sm text-slate-500 hover:underline">Lain kali</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}