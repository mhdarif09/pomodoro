import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ChatBubbleLeftRightIcon, TrophyIcon, UserGroupIcon,
    BoltIcon, ArrowRightIcon, FireIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function GuildOverview({ auth, guild, members }) {
    const [messages, setMessages] = useState(guild.chats || []);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await axios.post(route('api.guilds.chat.send', guild.id), {
                message: newMessage
            });
            setMessages(prev => [...prev, {
                id: res.data.message.id,
                user_name: auth.user.name,
                message: res.data.message.message,
                time: 'Just now',
                is_system: false
            }]);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <AuthenticatedLayout header={null}>
            <Head title={`${guild.name} - Overview`} />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-slate-900 dark:text-white">
                {/* Header / Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-8 mb-8 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">
                        {guild.emblem}
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="text-6xl bg-white/10 p-4 rounded-3xl backdrop-blur-md shadow-inner border border-white/20">
                            {guild.emblem}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
                                {guild.name}
                            </h1>
                            <p className="text-emerald-200 text-lg max-w-2xl font-medium">
                                {guild.description || "A guild for productive heroes."}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm border border-white/10 flex items-center gap-1">
                                    <UserGroupIcon className="w-3 h-3" /> {guild.member_count}/{guild.max_members} Members
                                </span>
                                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold backdrop-blur-sm border border-amber-500/30 flex items-center gap-1">
                                    <BoltIcon className="w-3 h-3" /> {guild.total_xp} XP Generated
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Stats & QuickNav */}
                    <div className="space-y-8">
                        {/* Navigation Menu */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Command Center</h3>
                            <nav className="space-y-2">
                                <Link
                                    href={route('guilds.tasks.index', guild.id)}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                                >
                                    <span className="font-bold flex items-center gap-3">
                                        <BoltIcon className="w-5 h-5" /> Mission Board
                                    </span>
                                    <ArrowRightIcon className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href={route('guilds.nexus', guild.id)}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                                >
                                    <span className="font-bold flex items-center gap-3">
                                        <FireIcon className="w-5 h-5" /> Focus Nexus
                                    </span>
                                    <ArrowRightIcon className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href={route('guilds.report', guild.id)}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                                >
                                    <span className="font-bold flex items-center gap-3">
                                        <TrophyIcon className="w-5 h-5" /> Guild Report
                                    </span>
                                    <ArrowRightIcon className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </nav>
                        </div>

                        {/* Members Widget */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Squad Members</h3>
                                <Link href="#" className="text-xs font-bold text-emerald-500 hover:underline">View All</Link>
                            </div>
                            <div className="flex -space-x-3 overflow-hidden py-2">
                                {members.map((member) => (
                                    <div key={member.id} title={member.name} className="relative inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">
                                        {member.avatar ? <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full object-cover" /> : member.name.charAt(0)}
                                    </div>
                                ))}
                                {(guild.member_count > 5) && (
                                    <div className="relative inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-xs">
                                        +{guild.member_count - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Chat / Activity Feed */}
                    <div className="lg:col-span-2 h-[600px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur">
                            <div className="flex items-center gap-2">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald-500" />
                                <h3 className="font-bold text-slate-700 dark:text-slate-200">Guild Hall (Chat & Activity)</h3>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
                            {messages.length === 0 && (
                                <div className="text-center text-slate-400 py-10 text-sm">
                                    No activity yet. Start the conversation!
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div key={msg.id || idx} className={`flex gap-3 ${msg.user_name === auth.user.name ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${msg.user_name === auth.user.name ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {msg.user_name.charAt(0)}
                                    </div>
                                    <div className={`max-w-[75%] space-y-1 ${msg.user_name === auth.user.name ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-400">{msg.user_name}</span>
                                            <span className="text-[9px] text-slate-300">{msg.time}</span>
                                        </div>
                                        <div className={`px-4 py-2 rounded-2xl text-sm ${msg.user_name === auth.user.name
                                            ? 'bg-emerald-600 text-white rounded-tr-none'
                                            : (msg.message.includes('telah menyelesaikan misi')
                                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 w-full'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none')
                                            }`}>
                                            {/* Render markdown-ish bold for system messages */}
                                            {msg.message.includes('**') ? (
                                                <span dangerouslySetInnerHTML={{ __html: msg.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                            ) : msg.message}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Message Guild Hall..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-emerald-500/50 font-medium placeholder-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 hover:scale-105 transition-transform"
                                >
                                    <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
