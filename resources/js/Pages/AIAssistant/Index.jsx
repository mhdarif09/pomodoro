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
import MathRenderer from '@/Components/MathRenderer';
import StepByStepSolver from '@/Components/StepByStepSolver';

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
                max-w-[85%] sm:max-w-[80%] rounded-[2rem] p-6 shadow-xl
                ${isBot
                    ? 'apple-glass border-white/10 text-slate-800 dark:text-slate-200'
                    : 'bg-teal-500 text-white shadow-teal-500/25'}
            `}>
                {isBot && (
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <SparklesIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[11px] font-extrabold uppercase tracking-tight text-slate-500">GrowthBot</span>
                    </div>
                )}
                <div className="text-[15px] leading-[1.6] font-medium tracking-tight whitespace-pre-wrap">
                    {isBot ? (
                        <StepByStepSolver content={message.content} />
                    ) : (
                        <MathRenderer content={message.content} />
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
                                    className="px-3 py-1.5 rounded-full apple-glass border-none text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:bg-white/40 max-w-[180px] truncate transition-all"
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
    const fileInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

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

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file type and size
            if (!file.type.startsWith('image/')) {
                alert('Silakan upload file gambar.');
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB
                alert('Ukuran file maksimal 10MB.');
                return;
            }

            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!input.trim() && !selectedImage) || isLoading) return;

        let sessionObj = activeSession;
        if (!sessionObj) {
            const res = await axios.post(route('api.ai.store-session'), { title: 'Chat Baru' });
            sessionObj = res.data;
            setSessions([sessionObj, ...sessions]);
            setActiveSession(sessionObj);
        }

        const userMsg = {
            role: 'user',
            content: input,
            image: imagePreview // Store preview for UI display
        };
        setMessages([...messages, userMsg]);
        setInput('');

        // Clear image state but keep for sending
        const imageToSend = selectedImage;
        const previewToSend = imagePreview;
        removeImage();

        setIsLoading(true);

        try {
            // Use FormData for file upload
            const formData = new FormData();
            formData.append('message', userMsg.content || '[Image Upload]');
            if (imageToSend) {
                formData.append('image', imageToSend);
            }
            formData.append('webSearch', webSearch ? '1' : '0');
            formData.append('history', JSON.stringify(messages));

            const res = await axios.post(route('api.ai.send-message', sessionObj.id), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // If user only sent image, update content based on AI's understanding or default text
            if (!userMsg.content) {
                setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastMsg = newMsgs[newMsgs.length - 2]; // The user message
                    if (lastMsg) lastMsg.content = "Help me solve this math problem";
                    return [...newMsgs, res.data.message];
                });
            } else {
                setMessages(prev => [...prev, res.data.message]);
            }

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

            <div className="relative flex h-[calc(100vh-160px)] apple-glass rounded-[2.5rem] border-white/10 overflow-hidden shadow-2xl">
                {/* Sidebar History */}
                <div className="hidden lg:flex flex-col w-72 border-r border-slate-200/30 dark:border-slate-800/50 bg-white/40 dark:bg-black/20">
                    <div className="p-6">
                        <button
                            onClick={createNewSession}
                            disabled={!auth.user.premium_features.ai_assistant}
                            className="apple-button w-full bg-slate-900 dark:bg-teal-500 text-white flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                        >
                            <PlusIcon className="w-5 h-5 stroke-2" />
                            Diskusi Baru
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
                        {sessions.map(s => (
                            <div
                                key={s.id}
                                onClick={() => auth.user.premium_features.ai_assistant && setActiveSession(s)}
                                className={`
                                    group relative p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300
                                    ${activeSession?.id === s.id
                                        ? 'apple-glass bg-white dark:bg-slate-800 shadow-lg border-white/20'
                                        : 'hover:bg-white/40 dark:hover:bg-white/5 text-slate-500'}
                                    ${!auth.user.premium_features.ai_assistant ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeSession?.id === s.id ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 scale-110' : 'bg-slate-200/50 dark:bg-slate-700/50'}`}>
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
                            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
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
                                    <SparklesIcon className="w-12 h-12 text-teal-500" />
                                </motion.div>
                                <h3 className="text-3xl font-[900] text-slate-900 dark:text-white mb-4 tracking-tight">GrowthBot Intel</h3>
                                <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed tracking-tight">
                                    Tanyakan strategi, analisis laporan, atau rencanakan langkah produktifmu selanjutnya.
                                </p>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto w-full">
                                {messages.map((m, idx) => (
                                    <MessageBubble key={idx} message={m} />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-8 backdrop-blur-3xl">
                        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative group">
                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="absolute bottom-full left-0 mb-4 ml-4">
                                    <div className="relative group/preview inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-24 w-auto rounded-xl shadow-lg border-2 border-white/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                        >
                                            <XMarkIcon className="w-3 h-3 stroke-[3]" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                className="hidden"
                            />

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading || !auth.user.premium_features.ai_assistant}
                                placeholder={auth.user.premium_features.ai_assistant ? "Tanyakan sesuatu atau upload foto soal..." : "Upgrade ke Premium untuk bertanya"}
                                className="w-full pl-14 pr-16 py-6 rounded-[2.5rem] apple-glass bg-white dark:bg-black/20 border-white/20 text-[15px] font-medium shadow-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all disabled:opacity-50"
                            />

                            {/* Upload Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading || !auth.user.premium_features.ai_assistant}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-xl transition-all disabled:opacity-50"
                                title="Upload foto soal matematika"
                            >
                                <PhotoIcon className="w-6 h-6" />
                            </button>

                            <button
                                type="submit"
                                disabled={(!input.trim() && !selectedImage) || isLoading || !auth.user.premium_features.ai_assistant}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3.5 bg-teal-500 hover:bg-teal-600 text-white rounded-[1.3rem] shadow-xl shadow-teal-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                            >
                                <PaperAirplaneIcon className={`w-5 h-5 stroke-2 ${isLoading ? 'animate-pulse' : ''}`} />
                            </button>
                        </form>
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
                                    className="apple-button h-16 text-lg bg-teal-500 text-white shadow-2xl shadow-teal-500/20"
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
