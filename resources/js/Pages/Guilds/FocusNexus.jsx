import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    ClockIcon, UserGroupIcon, BoltIcon, FireIcon,
    ChatBubbleLeftEllipsisIcon, HandThumbUpIcon
} from '@heroicons/react/24/outline';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

export default function FocusNexus({ auth, guild, activeMembers }) {
    const [isFocusing, setIsFocusing] = useState(false);
    const [timer, setTimer] = useState(0); // Seconds
    const [nudgeCooldown, setNudgeCooldown] = useState({});

    useEffect(() => {
        let interval;
        if (isFocusing) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isFocusing]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleNudge = (memberId) => {
        if (nudgeCooldown[memberId]) return;

        // Mock Nudge
        // In real app, send websocket event / notification
        alert(`Nudged ${activeMembers.find(m => m.id === memberId).name}! Keep it up!`);

        setNudgeCooldown(prev => ({ ...prev, [memberId]: true }));
        setTimeout(() => {
            setNudgeCooldown(prev => ({ ...prev, [memberId]: false }));
        }, 5000);
    };

    return (
        <AuthenticatedLayout header={null}>
            <Head title={`${guild.name} - Focus Nexus`} />

            <div className="min-h-screen bg-slate-900 text-white font-sans relative overflow-hidden">
                {/* Ambient Background Effects */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

                <div className="max-w-7xl mx-auto p-6 relative z-10 flex flex-col h-screen max-h-screen">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                                <BoltIcon className="w-8 h-8 text-amber-400" />
                                Focus Nexus
                            </h1>
                            <p className="text-slate-400 text-sm font-medium ml-1">Real-time Co-working Space for {guild.name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {activeMembers.slice(0, 3).map(m => (
                                    <div key={m.id} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs font-bold">
                                        {m.avatar ? <img src={m.avatar} className="w-full h-full rounded-full" /> : m.name.charAt(0)}
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-slate-500">{activeMembers.length} focusing now</span>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">

                        {/* Center: My Focus Station */}
                        <div className="lg:col-span-2 flex flex-col justify-center items-center bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 p-10 shadow-2xl relative">
                            <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 animate-pulse">
                                Live Connection Stable
                            </div>

                            {/* Timer Display */}
                            <div className="text-center mb-10">
                                <h2 className="text-slate-400 font-medium uppercase tracking-[0.2em] mb-4">Current Session</h2>
                                <div className="text-[8rem] leading-none font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 drop-shadow-2xl">
                                    {formatTime(timer)}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setIsFocusing(!isFocusing)}
                                    className={`group relative duration-300 transition-all ${isFocusing
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/50 hover:bg-amber-500/20'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-110 shadow-lg shadow-emerald-600/40'} 
                                        w-24 h-24 rounded-[2.5rem] flex items-center justify-center border-2 border-transparent`}
                                >
                                    {isFocusing ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10 pl-1" />}
                                </button>
                            </div>

                            <div className="mt-8 text-center max-w-md">
                                <p className="text-slate-400 text-sm">
                                    {isFocusing
                                        ? "You are synced with the guild. Stay focused!"
                                        : "Ready to dive in? Start your timer to join the session."}
                                </p>
                            </div>
                        </div>

                        {/* Right: Active Members Grid */}
                        <div className="bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/5 flex flex-col overflow-hidden">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                <UserGroupIcon className="w-4 h-4" /> Squad Activity
                            </h3>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {activeMembers.map((member) => (
                                    <div key={member.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-500 flex items-center justify-center text-lg font-bold shadow-lg">
                                                {member.avatar ? <img src={member.avatar} className="w-full h-full rounded-xl object-cover" /> : member.name.charAt(0)}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 animate-bounce"></div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold truncate text-emerald-200">{member.name}</h4>
                                            <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                                                <FireIcon className="w-3 h-3 text-amber-500" />
                                                {member.current_task}
                                            </p>
                                        </div>

                                        {member.id !== auth.user.id && (
                                            <button
                                                onClick={() => handleNudge(member.id)}
                                                disabled={nudgeCooldown[member.id]}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/20 text-slate-400 hover:text-white transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Nudge / Encourage"
                                            >
                                                <HandThumbUpIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {activeMembers.length === 0 && (
                                    <div className="text-center py-10 text-slate-600">
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ClockIcon className="w-8 h-8 opacity-20" />
                                        </div>
                                        <p>No one is focusing right now.</p>
                                        <p className="text-xs mt-1">Be the first to start the engine!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
