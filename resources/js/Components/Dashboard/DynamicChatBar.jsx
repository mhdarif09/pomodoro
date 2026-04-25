import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePage, Link } from '@inertiajs/react';
import {
    SparklesIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    ChevronUpIcon,
    LockClosedIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

// Terima prop 'user' disini
export default function DynamicChatBar({ user }) {
    const { auth } = usePage().props;

    // Prioritaskan user dari prop, kalau tidak ada ambil dari global auth
    const currentUser = user || auth.user;

    const hasAiAssistant = currentUser?.premium_features?.ai_assistant || false;

    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [session, setSession] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (isExpanded && !session && hasAiAssistant) {
            initSession();
        }
    }, [isExpanded, hasAiAssistant]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const initSession = async () => {
        try {
            const res = await axios.post(route('api.ai.store-session'), { title: 'Quick Task Help', type: 'general' });
            setSession(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !session) return;

        const userMsg = { role: 'user', content: input };
        setMessages([...messages, userMsg]);
        setInput('');
        setIsLoading(true);

        const payload = {
            message: input,
            history: messages,
            webSearch: false
        };

        try {
            let res;
            try {
                res = await axios.post(route('api.ai.send-message', session.id), payload);
            } catch (err) {
                if (err?.response?.status === 404) {
                    const recreate = await axios.post(route('api.ai.store-session'), { title: 'Quick Task Help', type: 'general' });
                    const freshSession = recreate.data;
                    setSession(freshSession);
                    res = await axios.post(route('api.ai.send-message', freshSession.id), payload);
                } else {
                    throw err;
                }
            }
            setMessages([...messages, userMsg, res.data.message]);
        } catch (err) {
            console.error(err);
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, originX: 1, originY: 1 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-[90vw] sm:w-[400px] h-[500px] bg-black/80 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden mb-4 pointer-events-auto flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <SparklesIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80 leading-none">Intelligence v2.0</p>
                                    <p className="text-xs font-bold text-white mt-0.5">GrowthBot Assist</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-2 rounded-full hover:bg-white/10 text-white/50 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {!hasAiAssistant ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white/5 to-transparent">
                                <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 mb-6 transition-transform">
                                    <LockClosedIcon className="w-12 h-12 text-amber-500 animate-pulse" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">Akses Eksklusif</h3>
                                <p className="text-xs text-white/60 mb-8 leading-relaxed max-w-[240px]">
                                    GrowthBot Intelligence hanya tersedia untuk member <strong>Premium</strong>. Upgrade sekarang untuk mendapatkan asisten AI super cerdas.
                                </p>
                                <Link
                                    href={route('subscribe.index')}
                                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                                >
                                    Upgrade ke Premium
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                                    {messages.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-500 blur-2xl absolute opacity-20 animate-pulse" />
                                            <SparklesIcon className="w-8 h-8 text-white mb-4 relative" />
                                            <p className="text-sm font-bold text-white">Ada yang bisa dibantu, Bos?</p>
                                            <p className="text-[10px] text-white/40 mt-1 max-w-[200px]">GrowthBot siap jawab pertanyaan kilat seputar tugas atau produktivitas.</p>
                                        </div>
                                    )}
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`
                                                max-w-[85%] px-4 py-3 rounded-[1.5rem] text-[13px] leading-relaxed
                                                ${m.role === 'user'
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                    : 'bg-white/5 border border-white/10 text-white/90'}
                                            `}>
                                                {m.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-3 flex gap-1.5 items-center">
                                                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSend} className="p-4 bg-white/5 backdrop-blur-xl">
                                    <div className="relative flex items-center gap-2 px-2">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Tulis pesan..."
                                            className="flex-1 bg-white/5 border-white/10 border rounded-full px-6 py-4 text-xs text-white placeholder-white/20 focus:ring-1 focus:ring-emerald-500/50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading || !input.trim()}
                                            className={`
                                                p-4 rounded-full transition-all
                                                ${input.trim() ? 'bg-white text-black scale-100 shadow-xl' : 'bg-white/5 text-white/20 scale-90'}
                                            `}
                                        >
                                            <PaperAirplaneIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dynamic FAB Handle */}
            {!isExpanded && (
                <motion.button
                    layoutId="dynamic-chat-fab"
                    onClick={() => setIsExpanded(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 bg-black/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl pointer-events-auto flex items-center justify-center group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    {!hasAiAssistant && (
                        <div className="absolute top-0 right-0 p-1">
                            <LockClosedIcon className="w-3 h-3 text-amber-500" />
                        </div>
                    )}

                    <SparklesIcon className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform" />
                </motion.button>
            )}
        </div>
    );
}
