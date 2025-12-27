import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PaperAirplaneIcon,
    SparklesIcon,
    GlobeAltIcon,
    DocumentIcon,
    PlusIcon,
    TrashIcon,
    EllipsisVerticalIcon,
    MagnifyingGlassIcon,
    ShareIcon,
    CpuChipIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const MessageBubble = ({ message }) => {
    const isBot = message.role === 'assistant';
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-6`}
        >
            <div className={`
                max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 shadow-sm
                ${isBot
                    ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    : 'bg-teal-500 text-white shadow-teal-500/20'}
            `}>
                {isBot && (
                    <div className="flex items-center gap-1.5 mb-2">
                        <SparklesIcon className="w-3.5 h-3.5 text-teal-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">GrowthBot</span>
                    </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                {message.metadata?.sources?.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sumber Informasi</p>
                        <div className="flex flex-wrap gap-2">
                            {message.metadata.sources.map((source, idx) => (
                                <a
                                    key={idx}
                                    href={source.url}
                                    target="_blank"
                                    className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-[10px] text-teal-600 dark:text-teal-400 hover:underline max-w-[150px] truncate"
                                >
                                    {source.title}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default function AIAssistantIndex() {
    const { auth } = usePage().props;
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [webSearch, setWebSearch] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        if (activeSession) {
            fetchMessages(activeSession.id);
        }
    }, [activeSession]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchSessions = async () => {
        const res = await axios.get(route('api.ai.sessions'));
        setSessions(res.data);
    };

    const fetchMessages = async (sessionId) => {
        const res = await axios.get(route('api.ai.messages', sessionId));
        setMessages(res.data);
    };

    const createNewSession = async () => {
        const res = await axios.post(route('api.ai.store-session'), { title: 'Chat Baru' });
        setSessions([res.data, ...sessions]);
        setActiveSession(res.data);
        setMessages([]);
    };

    const deleteSession = async (e, sessionId) => {
        e.stopPropagation();
        if (!confirm('Hapus percakapan ini?')) return;
        await axios.delete(route('api.ai.destroy-session', sessionId));
        setSessions(sessions.filter(s => s.id !== sessionId));
        if (activeSession?.id === sessionId) {
            setActiveSession(null);
            setMessages([]);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        let sessionObj = activeSession;
        if (!sessionObj) {
            const res = await axios.post(route('api.ai.store-session'), { title: 'Chat Baru' });
            sessionObj = res.data;
            setSessions([sessionObj, ...sessions]);
            setActiveSession(sessionObj);
        }

        const userMsg = { role: 'user', content: input };
        setMessages([...messages, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await axios.post(route('api.ai.send-message', sessionObj.id), {
                message: input,
                history: messages,
                webSearch: webSearch
            });

            setMessages([...messages, userMsg, res.data.message]);

            // Update title in sidebar if it changed
            if (res.data.session.title !== sessionObj.title) {
                setSessions(sessions.map(s => s.id === sessionObj.id ? res.data.session : s));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="AI Assistant" />

            <div className="relative flex h-[calc(100vh-140px)] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl">
                {/* Sidebar History */}
                <div className="hidden lg:flex flex-col w-72 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="p-6">
                        <button
                            onClick={createNewSession}
                            disabled={!auth.user.is_premium}
                            className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Chat Baru
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
                        {sessions.map(s => (
                            <div
                                key={s.id}
                                onClick={() => auth.user.is_premium && setActiveSession(s)}
                                className={`
                                    group relative p-3.5 rounded-2xl cursor-pointer transition-all
                                    ${activeSession?.id === s.id
                                        ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400'}
                                    ${!auth.user.is_premium ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${activeSession?.id === s.id ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                        <SparklesIcon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold truncate ${activeSession?.id === s.id ? 'text-slate-900 dark:text-white' : ''}`}>
                                            {s.title}
                                        </p>
                                        <p className="text-[10px] mt-0.5 opacity-60">
                                            {new Date(s.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 relative">
                    {/* Header */}
                    <div className="h-20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 sticky top-0">
                        <div className="flex items-center gap-4">
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    <CpuChipIcon className="w-5 h-5 text-teal-500" />
                                    {activeSession?.title || 'GrowthBot Assistant'}
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">
                                    GrowthBot Engine v2.0 • Premium Access Only
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-6 py-8 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                                <div className="w-20 h-20 rounded-3xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-6">
                                    <SparklesIcon className="w-10 h-10 text-teal-500" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Pusat Intelijen Sarang Tumbuh</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Tanyakan apa pun, mulai dari analisis laporan, riset pasar, hingga strategi pertumbuhan pribadi Anda.
                                </p>
                            </div>
                        ) : (
                            <>
                                {messages.map((m, idx) => (
                                    <MessageBubble key={idx} message={m} />
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Area (Visible but disabled) */}
                    <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <div className="max-w-4xl mx-auto relative group">
                            <input
                                type="text"
                                disabled
                                placeholder="Upgrade ke Premium untuk mulai mengobrol..."
                                className="w-full pl-6 pr-16 py-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none text-sm shadow-inner transition-all opacity-50 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* PREMIUM LOCK OVERLAY */}
                {!auth.user.is_premium && (
                    <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 max-w-lg w-full text-center shadow-2xl border border-white/10"
                        >
                            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                                <LockClosedIcon className="w-10 h-10 text-amber-500" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Fitur Terkunci</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
                                GrowthBot Intelligence adalah fitur premium yang dirancang untuk mempercepat pertumbuhan Anda dengan AI canggih.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href={route('subscribe.index')}
                                    className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-teal-500/20 transition-all active:scale-95"
                                >
                                    Upgrade Sekarang
                                </Link>
                                <Link
                                    href={route('dashboard')}
                                    className="px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    Kembali ke Dashboard
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
