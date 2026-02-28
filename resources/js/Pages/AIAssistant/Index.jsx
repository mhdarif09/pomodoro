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
    LockClosedIcon,
    PhotoIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import LatexRenderer from '@/Components/LatexRenderer';
import StepByStepSolution from '@/Components/StepByStepSolution';

const MessageBubble = ({ message }) => {
    const isBot = message.role === 'assistant';
    return (
        <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-10`}
        >
            <div className={`
                max-w-[85%] sm:max-w-[80%] rounded-[2rem] px-6 py-5 shadow-xl
                ${isBot
                    ? 'apple-glass border-white/10 text-slate-800 dark:text-slate-200'
                    : 'bg-emerald-500 text-white shadow-emerald-500/25'}
            `}>
                {isBot && (
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <SparklesIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[11px] font-extrabold uppercase tracking-tight text-slate-500">GrowthBot</span>
                    </div>
                )}

                {/* Image Display for User Messages */}
                {(message.metadata?.image_path || message.metadata?.preview_url) && (
                    <div className="mb-3 rounded-xl overflow-hidden shadow-sm border border-white/20">
                        <img
                            src={message.metadata.preview_url || `/storage/${message.metadata.image_path}`}
                            alt="Uploaded question"
                            className="max-w-full h-auto max-h-64 object-cover"
                        />
                    </div>
                )}

                <div className="text-[15px] leading-[1.6] font-medium tracking-tight whitespace-pre-wrap">
                    {isBot && (message.content.match(/(?:^|\n)(?:\*\*)?(?:Step )?\d+\.?(?:\*\*)?[:\s]/gi) || message.content.includes('follow these steps')) ? (
                        <StepByStepSolution content={message.content} />
                    ) : (
                        <LatexRenderer content={message.content} />
                    )}
                </div>

                {message.metadata?.sources?.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tight mb-3">Referensi Terkait</p>
                        <div className="flex flex-wrap gap-2">
                            {message.metadata.sources.map((source, idx) => (
                                <a
                                    key={idx}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-full apple-glass border-none text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-white/40 max-w-[180px] truncate transition-all"
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
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);
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
        try {
            const res = await axios.get(route('api.ai.sessions'));
            setSessions(res.data);
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        }
    };

    const fetchMessages = async (sessionId) => {
        try {
            const res = await axios.get(route('api.ai.messages', sessionId));
            setMessages(res.data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const createNewSession = async () => {
        try {
            const res = await axios.post(route('api.ai.store-session'), { title: 'Chat Baru' });
            setSessions([res.data, ...sessions]);
            setActiveSession(res.data);
            setMessages([]);
        } catch (error) {
            console.error("Failed to create session", error);
        }
    };

    const deleteSession = async (e, sessionId) => {
        e.stopPropagation();
        if (!confirm('Hapus percakapan ini?')) return;
        try {
            await axios.delete(route('api.ai.destroy-session', sessionId));
            setSessions(sessions.filter(s => s.id !== sessionId));
            if (activeSession?.id === sessionId) {
                setActiveSession(null);
                setMessages([]);
            }
        } catch (error) {
            console.error("Failed to delete session", error);
        }
    };

    const handleImageSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage({
                file: file,
                preview: URL.createObjectURL(file)
            });
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!input.trim() && !selectedImage) || isLoading) return;

        let sessionObj = activeSession;
        if (!sessionObj) {
            try {
                const res = await axios.post(route('api.ai.store-session'), { title: 'Chat Baru' });
                sessionObj = res.data;
                setSessions([sessionObj, ...sessions]);
                setActiveSession(sessionObj);
            } catch (error) {
                console.error("Failed to create session", error);
                return;
            }
        }

        const userMsg = {
            role: 'user',
            content: input.trim() || (selectedImage ? 'Analyze this image and provide relevant advice or solution.' : ''),
            metadata: selectedImage ? { image_path: 'temp_preview', preview_url: selectedImage.preview } : null
        };

        // Optimistic update (show preview immediately)
        // Note: Real path comes from server response, but for now we show local preview
        // We'll replace it with server response data mostly.

        // Actually, let's keep it simple. We append userMsg. 
        // If we want to show image, MessageBubble needs to handle the preview url or we rely on server response replacement.
        // For smoother UX, we can just show the message bubble with image preview if metadata.preview_url exists.
        // But MessageBubble uses /storage/ path. We might need logic there.
        // Let's rely on server response for the image path primarily, but to avoid "disappearing" image,
        // we could wait or handle it. For now, simple append.

        setMessages([...messages, userMsg]);
        setInput('');
        const imagePayload = selectedImage; // Store ref
        clearImage();
        setIsLoading(true);

        const formData = new FormData();
        const messageToSend = input.trim() || (imagePayload ? 'Analyze this image and provide relevant advice or solution.' : '');
        formData.append('message', messageToSend);
        if (imagePayload) {
            formData.append('image', imagePayload.file);
        }
        // history is calculated on backend now for security/consistency, 
        // or we can pass it if we want client-side context control.
        // Controller implementation uses DB messages, so we don't need to pass history.

        try {
            const res = await axios.post(route('api.ai.send-message', sessionObj.id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('Backend response:', res.data);

            // Backend returns { message: aiMessage, session: updatedSession (with all messages) }
            // Add defensive checks
            if (res.data && res.data.session && Array.isArray(res.data.session.messages)) {
                const latestMessages = res.data.session.messages.slice(-2); // Last 2: [userMsg with real image_path, aiMsg]

                setMessages(prev => {
                    const withoutOptimistic = prev.slice(0, -1); // Remove optimistic user message
                    return [...withoutOptimistic, ...latestMessages]; // Add real user msg + AI msg
                });

                // Update title if it changed
                if (res.data.session.title !== sessionObj.title) {
                    setSessions(sessions.map(s => s.id === sessionObj.id ? res.data.session : s));
                    setActiveSession(res.data.session);
                }
            } else {
                console.error('Invalid response structure:', res.data);
                // Fallback: just add AI message
                if (res.data && res.data.message) {
                    setMessages(prev => [...prev, res.data.message]);
                }
            }
        } catch (err) {
            console.error(err);
            // Revert or show error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="AI Assistant" />

            <div className="relative flex h-[calc(100vh-160px)] apple-glass rounded-[2.5rem] border-white/10 overflow-hidden shadow-2xl">
                {/* Sidebar History */}
                <div className="hidden lg:flex flex-col w-72 border-r border-slate-200/30 dark:border-slate-800/50 bg-white/40 dark:bg-black/20">
                    <div className="p-6">
                        <button
                            onClick={createNewSession}
                            disabled={isLoading}
                            className="apple-button w-full bg-slate-900 dark:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                        >
                            <PlusIcon className="w-5 h-5 stroke-2" />
                            Diskusi Baru
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
                        {sessions.map(s => (
                            <div
                                key={s.id}
                                onClick={() => setActiveSession(s)}
                                className={`
                                    group relative p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300
                                    ${activeSession?.id === s.id
                                        ? 'apple-glass bg-white dark:bg-slate-800 shadow-lg border-white/20'
                                        : 'hover:bg-white/40 dark:hover:bg-white/5 text-slate-500'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeSession?.id === s.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110' : 'bg-slate-200/50 dark:bg-slate-700/50'}`}>
                                        <SparklesIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[13px] font-extrabold truncate tracking-tight ${activeSession?.id === s.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {s.title}
                                        </p>
                                        <p className="text-[10px] font-bold opacity-60 tracking-tight">
                                            {s.updated_at === s.created_at ? 'Baru saja' : new Date(s.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => deleteSession(e, s.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                    {/* Header */}
                    <div className="h-20 border-b border-slate-200/30 dark:border-slate-800/50 flex items-center justify-between px-8 backdrop-blur-3xl z-10 sticky top-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <CpuChipIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-[900] text-slate-900 dark:text-white tracking-tight leading-none">
                                    {activeSession?.title || 'GrowthBot Intelligence'}
                                </h2>
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-tight mt-1.5 opacity-60">
                                    Engine v2.0 • Real-time Intelligence
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-8 py-12 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-24 h-24 rounded-[2rem] apple-glass flex items-center justify-center mb-8 shadow-2xl"
                                >
                                    <SparklesIcon className="w-12 h-12 text-emerald-500" />
                                </motion.div>
                                <h3 className="text-3xl font-[900] text-slate-900 dark:text-white mb-4 tracking-tight">GrowthBot Intel</h3>
                                <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed tracking-tight mb-8">
                                    Tanyakan strategi, analisis laporan, atau upload foto soal matematika untuk penjelasan step-by-step! 📚📸
                                </p>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto w-full">
                                {messages.map((m, idx) => (
                                    <MessageBubble key={idx} message={m} />
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start mb-10">
                                        <div className="apple-glass rounded-[2rem] px-6 py-5 border-white/10 flex items-center gap-3">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-8 backdrop-blur-3xl">
                        <div className="max-w-4xl mx-auto relative group">
                            {/* Image Preview */}
                            <AnimatePresence>
                                {selectedImage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-full left-0 mb-4 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100">
                                            <img src={selectedImage.preview} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 truncate max-w-[120px]">{selectedImage.file.name}</p>
                                        </div>
                                        <button
                                            onClick={clearImage}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* File Input - Outside Form for Better Browser Compatibility */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                className="hidden"
                                accept="image/*"
                            />

                            <form onSubmit={handleSendMessage} className="relative">
                                {/* Photo Button */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('📷 Camera clicked');
                                        if (fileInputRef.current) {
                                            console.log('✅ fileInputRef exists, triggering click');
                                            fileInputRef.current.click();
                                        } else {
                                            console.error('❌ fileInputRef is null!');
                                        }
                                    }}
                                    disabled={isLoading}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                                    title="Upload Foto"
                                >
                                    <PhotoIcon className="w-6 h-6 stroke-2" />
                                </button>

                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={isLoading}
                                    placeholder="Ketik soal atau upload foto..."
                                    className="w-full pl-16 pr-16 py-6 rounded-[2.5rem] apple-glass bg-white dark:bg-black/20 border-white/20 text-[15px] font-medium shadow-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={(!input.trim() && !selectedImage) || isLoading}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.3rem] shadow-xl shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                                >
                                    <PaperAirplaneIcon className={`w-5 h-5 stroke-2 ${isLoading ? 'animate-pulse' : ''}`} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* PREMIUM LOCK OVERLAY */}
                {!auth.user.premium_features.ai_assistant && (
                    <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="apple-glass rounded-[4rem] p-12 max-w-lg w-full text-center shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] border-white/10"
                        >
                            <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-8">
                                <LockClosedIcon className="w-12 h-12 text-amber-500" />
                            </div>
                            <h3 className="text-4xl font-[900] text-slate-900 dark:text-white mb-4 tracking-tight">Kekuatan Terkunci</h3>
                            <p className="text-[17px] font-medium text-slate-500 dark:text-slate-400 mb-12 leading-relaxed tracking-tight">
                                GrowthBot Intelligence eksklusif untuk member Premium. Tingkatkan produktivitasmu dengan AI hari ini.
                            </p>
                            <div className="flex flex-col gap-4">
                                <Link
                                    href={route('subscribe.index')}
                                    className="apple-button h-16 text-lg bg-emerald-500 text-white shadow-2xl shadow-emerald-500/20"
                                >
                                    Buka Akses Sekarang
                                </Link>
                                <Link
                                    href={route('dashboard')}
                                    className="text-sm font-extrabold text-slate-400 hover:text-slate-600 py-2 transition-colors"
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
