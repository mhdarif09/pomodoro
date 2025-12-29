import React, { useEffect, useRef } from 'react';
import { SparklesIcon, PaperAirplaneIcon, UserIcon } from '@heroicons/react/24/solid';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AiDiscussionPanel({ 
    discussions, newMessage, setNewMessage, sendMessage, startRolePlay, 
    isLoading, selectedRole, setSelectedRole 
}) {
    const discussionEndRef = useRef(null);
    useEffect(() => { discussionEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [discussions]);

    return (
        <div className="mt-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white leading-none">SinauBot AI</h3>
                        <p className="text-xs font-bold text-teal-500 mt-1 uppercase tracking-wider">Online</p>
                    </div>
                </div>
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-white dark:bg-slate-800 border-none text-xs font-bold rounded-xl py-2 pl-3 pr-8 focus:ring-2 focus:ring-teal-500 shadow-sm"
                >
                    <option value="teacher">Guru</option>
                    <option value="student">Teman</option>
                    <option value="expert">Pakar</option>
                </select>
            </div>

            {/* Chat Area */}
            <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto scrollbar-hide px-2">
                {discussions.length === 0 && (
                    <div className="text-center py-12 opacity-50 flex flex-col items-center">
                        <SparklesIcon className="w-8 h-8 mb-2"/>
                        <p className="text-sm font-bold">Mulai diskusi materi ini dengan AI.</p>
                    </div>
                )}
                
                {discussions.map((msg, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        {/* User Bubble (Right) */}
                        <div className="flex justify-end gap-2">
                             <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-[1.3rem] rounded-tr-sm max-w-[85%] text-sm leading-relaxed shadow-lg shadow-blue-500/20">
                                 {msg.user_message}
                             </div>
                             <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center mt-auto"><UserIcon className="w-4 h-4 text-slate-500"/></div>
                        </div>

                        {/* AI Bubble (Left) */}
                        <div className="flex justify-start gap-2 mt-2">
                             <div className="w-8 h-8 bg-teal-100 rounded-full flex-shrink-0 flex items-center justify-center mt-auto"><SparklesIcon className="w-4 h-4 text-teal-600"/></div>
                             <div className="bg-white dark:bg-slate-800 px-5 py-3 rounded-[1.3rem] rounded-tl-sm max-w-[90%] text-sm leading-relaxed shadow-sm border border-slate-100 dark:border-slate-700 prose prose-sm dark:prose-invert">
                                 <Markdown remarkPlugins={[remarkGfm]}>{msg.ai_response}</Markdown>
                             </div>
                        </div>
                    </div>
                ))}
                <div ref={discussionEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative">
                <form onSubmit={sendMessage} className="relative z-10">
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ketik pertanyaan..."
                        className="w-full pl-6 pr-14 py-4 bg-white dark:bg-slate-800 border-none rounded-[1.5rem] shadow-lg shadow-slate-200/50 dark:shadow-black/20 text-sm focus:ring-2 focus:ring-teal-500 transition-all placeholder-slate-400"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !newMessage.trim()}
                        className="absolute right-2 top-2 p-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-colors shadow-md"
                    >
                        <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                </form>
                
                {/* Quick Actions */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {["Jelaskan Simpel", "Contoh Kasus", "Kuis Singkat"].map((txt) => (
                        <button 
                            key={txt} 
                            onClick={() => startRolePlay(txt)}
                            disabled={isLoading}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-teal-500 transition-colors shadow-sm active:scale-95"
                        >
                            {txt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}