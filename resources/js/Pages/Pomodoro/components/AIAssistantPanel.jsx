// Misal di: resources/js/Components/AIAssistantPanel.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon, ArrowPathIcon, ArrowsPointingOutIcon, ComputerDesktopIcon, GlobeAltIcon } from '@heroicons/react/24/solid';

// Anggap konstanta ini ada di file terpisah, misal `resources/js/constants.js`
// export const FREE_AI_CHAT_LIMIT = 5;
const FREE_AI_CHAT_LIMIT = 5; // Untuk contoh ini kita letakkan di sini

const sizeOptions = {
    default: 'sm:max-w-md',
    wide: 'sm:max-w-2xl',
};

const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function AIAssistantPanel({ isOpen, onClose, isPremium, freeAiChatsUsed, setFreeAiChatsUsed, onUpgrade }) {
    const [aiQuery, setAiQuery] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [aiChatHistory, setAiChatHistory] = useState(() => JSON.parse(sessionStorage.getItem('aiChatHistory') || '[]'));
    const [size, setSize] = useState('default');
    const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        sessionStorage.setItem('aiChatHistory', JSON.stringify(aiChatHistory));
        if (!isLoadingAI) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [aiChatHistory, isLoadingAI]);

    const handleAIQuery = async () => {
        if (!isPremium && freeAiChatsUsed >= FREE_AI_CHAT_LIMIT) {
            onUpgrade();
            return;
        }
        if (!aiQuery.trim() || isLoadingAI) return;

        if (!isPremium) {
            setFreeAiChatsUsed(prev => prev + 1);
        }

        const userMessage = { role: 'user', content: aiQuery, webSearch: isWebSearchEnabled };
        
        const newHistory = [...aiChatHistory, userMessage];
        setAiChatHistory(newHistory);
        setIsLoadingAI(true);
        setAiQuery('');

        try {
            const response = await axios.post('/api/ask', {
                query: aiQuery,
                history: aiChatHistory,
                webSearch: isWebSearchEnabled,
            });

            const aiMessage = {
                role: 'assistant',
                content: response.data.response,
                sources: response.data.sources || [],
            };
            setAiChatHistory(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Maaf, terjadi kesalahan tak terduga.';
            const errorMsg = { role: 'assistant', content: errorMessage, isError: true };
            setAiChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsLoadingAI(false);
            setIsWebSearchEnabled(false);
        }
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAIQuery();
        }
    };

    const handleClearChat = () => setAiChatHistory([]);
    const toggleSize = () => setSize(currentSize => (currentSize === 'default' ? 'wide' : 'default'));

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={`fixed inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:h-full w-full bg-slate-100 dark:bg-slate-900 shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out ${sizeOptions[size]}`}
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg flex-shrink-0">
                        <h3 className="text-lg font-bold flex items-center gap-2"><SparklesIcon className="h-6 w-6 text-teal-500"/>Asisten AI</h3>
                        <div>
                            <button onClick={toggleSize} title="Ubah Ukuran" className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors hidden sm:inline-block">
                                {size === 'default' ? <ArrowsPointingOutIcon className="h-5 w-5" /> : <ComputerDesktopIcon className="h-5 w-5" />}
                            </button>
                            <button onClick={handleClearChat} title="Hapus Chat" className="p-2 text-slate-500 hover:text-rose-500 rounded-full transition-colors"><ArrowPathIcon className="h-5 w-5"/></button>
                            <button onClick={onClose} title="Tutup" className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"><XMarkIcon className="h-6 w-6"/></button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 ai-panel-chat-area">
                        <AnimatePresence initial={false}>
                            {aiChatHistory.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    layout
                                    variants={messageVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className={`flex my-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`p-3 rounded-xl max-w-sm lg:max-w-md text-sm shadow-md ${msg.role === 'user' ? 'bg-teal-500 text-white rounded-br-lg' : (msg.isError ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 rounded-bl-lg' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg')}`}>
                                        {msg.role === 'user' && msg.webSearch && (
                                            <div className="flex items-center gap-1.5 text-white/80 mb-1 text-xs">
                                                <GlobeAltIcon className="h-3 w-3" />
                                                <span>Pencarian Web Aktif</span>
                                            </div>
                                        )}
                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                        
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-600/50">
                                                <h4 className="text-xs font-bold mb-1.5 text-slate-600 dark:text-slate-400">Referensi:</h4>
                                                <ul className="space-y-1.5">
                                                    {msg.sources.map((source, i) => (
                                                        <li key={i} className="text-xs flex items-start gap-2">
                                                            <span className="text-teal-400 mt-0.5">🔗</span>
                                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-teal-600 dark:text-teal-400 break-all">
                                                                {source.title}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {isLoadingAI && (
                            <motion.div layout variants={messageVariants} initial="hidden" animate="visible" className="flex justify-start my-2">
                                <div className="p-3 rounded-lg bg-white dark:bg-slate-700 rounded-bl-lg shadow-md">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
                                        Berpikir...
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <footer className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg flex-shrink-0">
                        {!isPremium && (
                           <div className="text-center text-xs text-slate-500 mb-2">
                               Jatah chat gratis tersisa: {Math.max(0, FREE_AI_CHAT_LIMIT - freeAiChatsUsed)} / {FREE_AI_CHAT_LIMIT}
                           </div>
                       )}

                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="web-search-toggle" className="flex items-center cursor-pointer select-none">
                                <GlobeAltIcon className={`h-5 w-5 mr-2 transition-colors ${isWebSearchEnabled ? 'text-teal-500' : 'text-slate-400'}`} />
                                <span className={`text-sm font-medium transition-colors ${isWebSearchEnabled ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>
                                    Cari di Web
                                </span>
                            </label>
                            <button
                                id="web-search-toggle"
                                onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-all duration-300 ease-in-out ${isWebSearchEnabled ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${isWebSearchEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        
                        <form onSubmit={(e) => { e.preventDefault(); handleAIQuery(); }}>
                           <div className="flex items-end bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden ring-1 ring-transparent focus-within:ring-teal-500">
                               <TextareaAutosize
                                   value={aiQuery}
                                   onChange={(e) => setAiQuery(e.target.value)}
                                   onKeyDown={handleKeyDown}
                                   placeholder={!isPremium && freeAiChatsUsed >= FREE_AI_CHAT_LIMIT ? "Jatah chat gratis habis..." : "Tanya apa saja..."}
                                   className="flex-1 p-3 bg-transparent focus:outline-none text-sm text-slate-900 dark:text-white resize-none"
                                   disabled={isLoadingAI || (!isPremium && freeAiChatsUsed >= FREE_AI_CHAT_LIMIT)}
                                   rows={1}
                                   maxRows={5}
                               />
                               <button
                                   type="submit"
                                   disabled={isLoadingAI || !aiQuery.trim() || (!isPremium && freeAiChatsUsed >= FREE_AI_CHAT_LIMIT)}
                                   className="p-3 text-white bg-teal-500 hover:bg-teal-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors self-stretch flex items-center"
                               >
                                   <PaperAirplaneIcon className="h-5 w-5"/>
                               </button>
                           </div>
                       </form>
                    </footer>
                </motion.div>
            )}
        </AnimatePresence>
    );
}