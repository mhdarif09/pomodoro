import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { SparklesIcon, LockClosedIcon, CheckCircleIcon, ChartBarIcon, ClockIcon, TrophyIcon } from '@heroicons/react/24/outline'; // Re-verify icons

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
            const resp = await axios.post(route('cognitive-arena.generate'));
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
            const resp = await axios.post(route('cognitive-arena.submit', match.id), {
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
                            <p className="text-slate-500 dark:text-slate-400 mb-6">Complete at least one Smart Focus session today to unlock the Arena.</p>
                            <Link href={route('dashboard')} className="px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors inline-block">
                                Go to Dashboard
                            </Link>
                        </div>
                    )}

                    {viewState === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Your Daily Challenge</h3>
                                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                                        You have unlocked today's simulation! The Game Master has prepared a unique scenario based on your current cognitive level.
                                    </p>
                                    <button
                                        onClick={handleEnterArena}
                                        disabled={isGenerating}
                                        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-75"
                                    >
                                        {isGenerating ? 'Generating Scenario...' : '⚔️ Enter The Arena'}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <ChartBarIcon className="w-5 h-5 text-indigo-500" /> Cognitive Stats
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-400">
                                                <span>Critical Thinking</span>
                                                <span className="font-bold">{stats.critical_thinking_level}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500" style={{ width: `${Math.min(stats.critical_thinking_level * 2, 100)}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-400">
                                                <span>Communication</span>
                                                <span className="font-bold">{stats.communication_level}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500" style={{ width: `${Math.min(stats.communication_level * 2, 100)}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-400">
                                                <span>Decision Speed</span>
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
                                    <ClockIcon className="w-4 h-4" /> Take your time
                                </span>
                            </div>
                            <h2 className="text-xl leading-relaxed text-slate-800 dark:text-slate-200 mb-8 whitespace-pre-wrap">
                                {simulation.scenario_text}
                            </h2>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Your Action / Response</label>
                                <textarea
                                    value={answer}
                                    onChange={e => setAnswer(e.target.value)}
                                    placeholder="I would choose to..."
                                    className="w-full h-40 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                />
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={isSubmitting || !answer.trim()}
                                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Evaluating...' : 'Submit Decision'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewState === 'result' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-3 mb-6">
                                    <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Match Evaluated</h2>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mb-6">
                                    {feedback || "Great thinking! The Game Master has no additional feedback at this time."}
                                </p>
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-emerald-800 dark:text-emerald-400 font-bold">Earned {xpEarned} XP!</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-500">Your cognitive stats have grown.</p>
                                    </div>
                                    <TrophyIcon className="w-8 h-8 text-emerald-500" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white flex flex-col justify-center">
                                <h3 className="text-xl font-bold mb-2">Reflect on your thought process</h3>
                                <p className="text-indigo-100 mb-8 italic">
                                    "{reflectionPrompt || 'How will you apply this lesson today?'}"
                                </p>
                                <Link
                                    href={route('journal.index')}
                                    data={{ prefilled_prompt: reflectionPrompt }}
                                    className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold text-center hover:bg-slate-50 transition-colors"
                                >
                                    Write in Journal
                                </Link>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
