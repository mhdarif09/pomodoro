import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { SparklesIcon, LockClosedIcon, CheckCircleIcon, ChartBarIcon, ClockIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/outline'; // Re-verify icons

export default function CognitiveArena({ auth, initialStats, isUnlocked, todayMatch }) {
    const [stats, setStats] = useState(initialStats);
    const [viewState, setViewState] = useState(() => {
        if (!isUnlocked) return 'locked';
        if (todayMatch && todayMatch.completed) return 'result';
        if (todayMatch && !todayMatch.completed) return 'simulation';
        return 'dashboard';
    });

    const [match, setMatch] = useState(todayMatch);
    const [simulation, setSimulation] = useState(todayMatch?.simulation || null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [answer, setAnswer] = useState(todayMatch?.user_answer || '');
    const [timeTaken, setTimeTaken] = useState(0);

    const [feedback, setFeedback] = useState(todayMatch?.ai_feedback_text || '');
    const [reflectionPrompt, setReflectionPrompt] = useState(todayMatch?.reflection_prompt || 'What did you learn from this scenario?');
    const [xpEarned, setXpEarned] = useState(todayMatch?.xp_earned || 0);

    const handleEnterArena = async () => {
        setIsGenerating(true);
        try {
            const resp = await axios.post(route('api.cognitive-arena.generate'));
            setSimulation(resp.data.simulation);
            setMatch({ id: resp.data.match_id });
            setViewState('simulation');
            setTimeTaken(0);
        } catch (error) {
            console.error("Failed to generate simulation", error);
            alert("Simulation is locked or failed to generate.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) return;
        setIsSubmitting(true);
        try {
            const resp = await axios.post(route('api.cognitive-arena.submit', match.id), {
                user_answer: answer,
                time_taken_seconds: 120,
            });
            setMatch(resp.data.match);
            setFeedback(resp.data.match.ai_feedback_text);
            setXpEarned(resp.data.match.xp_earned);
            setReflectionPrompt(resp.data.reflection_prompt);
            setViewState('result');

            setStats(prev => ({
                ...prev,
                arena_xp: prev.arena_xp + resp.data.match.xp_earned,
            }));
        } catch (error) {
            console.error("Failed to submit", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-gray-200 leading-tight">Cognitive Arena</h2>}
        >
            <Head title="Cognitive Arena" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                            <SparklesIcon className="w-64 h-64 -mt-12 -mr-12" />
                        </div>
                        <div className="relative z-10">
                            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                                <SparklesIcon className="w-10 h-10 text-yellow-300" />
                                Cognitive Arena
                            </h1>
                            <p className="text-purple-100 text-lg max-w-2xl">
                                Train your brain with daily AI-generated simulations. Test your logical, analytical, and ethical reasoning skills.
                            </p>
                        </div>
                    </div>

                    {viewState === 'locked' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <LockClosedIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Arena is Locked</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">Complete a Pomodoro session or finish a task today to unlock the Arena.</p>
                            <Link href={route('dashboard')} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors inline-block">
                                Go to Dashboard
                            </Link>
                        </div>
                    )}

                    {viewState === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Tantangan Harianmu</h3>
                                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                                        Kamu telah membuka simulasi hari ini! Game Master telah menyiapkan skenario unik berdasarkan tingkat kognitifmu saat ini.
                                    </p>
                                    <button
                                        onClick={handleEnterArena}
                                        disabled={isGenerating}
                                        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-75"
                                    >
                                        {isGenerating ? 'Menyiapkan Skenario...' : '⚔️ Mulai Simulasi'}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <ChartBarIcon className="w-5 h-5 text-indigo-500" /> Statistik Kognitif
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-400">
                                                <span>Berpikir Kritis</span>
                                                <span className="font-bold">{stats.critical_thinking_level}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500" style={{ width: `${Math.min(stats.critical_thinking_level * 2, 100)}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-400">
                                                <span>Komunikasi</span>
                                                <span className="font-bold">{stats.communication_level}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500" style={{ width: `${Math.min(stats.communication_level * 2, 100)}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-400">
                                                <span>Kecepatan Keputusan</span>
                                                <span className="font-bold">{stats.decision_speed}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-pink-500" style={{ width: `${Math.min(stats.decision_speed * 2, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Rank</p>
                                            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{stats.arena_rank}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">XP</p>
                                            <p className="text-lg font-black text-slate-800 dark:text-white">{stats.arena_xp}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewState === 'simulation' && simulation && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-6">
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {simulation.type.replace('_', ' ')}
                                </span>
                                <span className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                                    <ClockIcon className="w-4 h-4" /> Luangkan waktumu
                                </span>
                            </div>
                            <h2 className="text-xl leading-relaxed text-slate-800 dark:text-slate-200 mb-8 whitespace-pre-wrap">
                                {simulation.scenario_text}
                            </h2>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Pilih Tindakanmu (A, B, atau C)</label>
                                
                                {simulation.options && Object.entries(simulation.options).map(([key, text]) => (
                                    <button
                                        key={key}
                                        onClick={() => setAnswer(key)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answer === key ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-200 dark:ring-indigo-700' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-900'}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold ${answer === key ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                {key}
                                            </span>
                                            <span className="text-slate-800 dark:text-slate-200 mt-1">{text}</span>
                                        </div>
                                    </button>
                                ))}

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={isSubmitting || !answer}
                                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Mengevaluasi...' : 'Kirim Jawaban'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewState === 'result' && (
                        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
                            {/* Celebration Header */}
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 rounded-full mb-6 relative">
                                    <div className="absolute inset-0 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                                    <CheckCircleIcon className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">Simulasi Selesai!</h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400">Pikiranmu semakin tajam dan berkembang hari ini.</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-b-4 border-emerald-200 dark:border-emerald-900/50 text-center shadow-sm relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 opacity-10">
                                        <TrophyIcon className="w-24 h-24 text-emerald-500" />
                                    </div>
                                    <span className="uppercase text-xs font-bold text-emerald-500 tracking-wider mb-2 block relative z-10">XP Diperoleh</span>
                                    <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2 relative z-10">
                                        +{xpEarned} <span className="text-2xl">XP</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-b-4 border-orange-200 dark:border-orange-900/50 text-center shadow-sm relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 opacity-10">
                                        <FireIcon className="w-24 h-24 text-orange-500" />
                                    </div>
                                    <span className="uppercase text-xs font-bold text-orange-500 tracking-wider mb-2 block relative z-10">SarangTumbuh Streak</span>
                                    <div className="text-4xl font-black text-orange-600 dark:text-orange-400 flex items-center justify-center gap-2 relative z-10">
                                        <FireIcon className="w-8 h-8 text-orange-500 animate-pulse" /> Aktif!
                                    </div>
                                </div>
                            </div>

                            {/* Feedback Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 mt-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <SparklesIcon className="w-6 h-6 text-indigo-500" /> Masukan Game Master
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                    {feedback || "Pemikiran yang luar biasa! Insting dan analisamu sangat tajam."}
                                </p>
                            </div>

                            {/* Reflection */}
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mt-6 text-center shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                                    <ChartBarIcon className="w-48 h-48 -mt-8 -mr-8" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-4">Renungkan Keputusanmu</h3>
                                    <p className="text-indigo-100 mb-8 italic text-lg max-w-xl mx-auto">
                                        "{reflectionPrompt || 'Bagaimana kamu akan mengaplikasikan cara berpikir ini di dunia nyata?'}"
                                    </p>
                                    <Link
                                        href={route('journal.index')}
                                        data={{ prefilled_prompt: reflectionPrompt }}
                                        className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-slate-50 transition-all hover:scale-105 transform duration-200 shadow-md"
                                    >
                                        Tulis di Jurnal
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="text-center pt-8 pb-12">
                                <Link href={route('dashboard')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold transition-colors uppercase tracking-wider text-sm">
                                    Kembali ke Dashboard
                                </Link>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
