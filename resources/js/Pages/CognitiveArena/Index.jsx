import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { SparklesIcon, LockClosedIcon, CheckCircleIcon, ChartBarIcon, ClockIcon, TrophyIcon, FireIcon, ShareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import QuizShareCard from '@/Components/CognitiveArena/QuizShareCard';

export default function CognitiveArena({ auth, initialStats, isUnlocked, active_match }) {
    const [stats, setStats] = useState(initialStats);
    const [viewState, setViewState] = useState(() => {
        if (!isUnlocked) return 'locked';
        if (active_match && active_match.completed) return 'result';
        if (active_match && !active_match.completed) return 'simulation';
        return 'dashboard';
    });

    const [match, setMatch] = useState(active_match);
    const [simulation, setSimulation] = useState(active_match?.simulation || null);

    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState(active_match?.user_answers || []);
    const [score, setScore] = useState(active_match?.score || 0);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [timeTaken, setTimeTaken] = useState(0);

    const [feedback, setFeedback] = useState(active_match?.ai_feedback_text || '');
    const [reflectionPrompt, setReflectionPrompt] = useState(active_match?.reflection_prompt || 'What did you learn from this scenario?');
    const [xpEarned, setXpEarned] = useState(active_match?.xp_earned || 0);

    const quizCardRef = useRef(null);
    const [isSharing, setIsSharing] = useState(false);

    const handleEnterArena = async () => {
        setIsGenerating(true);
        try {
            const resp = await axios.post(route('api.cognitive-arena.generate'), { 
                topic: selectedTopic,
                difficulty: selectedDifficulty
            });
            setSimulation(resp.data.simulation);
            setMatch({ id: resp.data.match_id });
            setViewState('simulation');
            setCurrentQuestionIndex(0);
            setAnswers([]);
            setTimeTaken(0);
        } catch (error) {
            console.error("Failed to generate simulation", error);
            alert("Simulation is locked or failed to generate.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (answers.length < (simulation?.questions?.length || 10)) return;
        setIsSubmitting(true);
        try {
            const resp = await axios.post(route('api.cognitive-arena.submit', match.id), {
                user_answers: answers,
                time_taken_seconds: 120, // To do: actual timer
            });
            setMatch(resp.data.match);
            setScore(resp.data.match.score);
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

    const handleShareQuiz = async (download = false) => {
        if (!quizCardRef.current) return;
        setIsSharing(true);
        try {
            const canvas = await html2canvas(quizCardRef.current, {
                scale: 1,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#020617',
                logging: false,
                width: 1080,
                height: 1080,
            });
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
            if (!blob) return;

            if (download) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cognitive_arena_${score}pct.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                const file = new File([blob], `quiz_result_${score}.png`, { type: 'image/png' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: `Skor Quiz Kognitif: ${score}%`,
                        text: `Aku baru selesai latihan di Cognitive Arena SarangTumbuh dengan skor ${score}%! 🧠🔥 Coba juga yuk!`,
                        files: [file]
                    });
                } else {
                    // fallback download
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cognitive_arena_${score}pct.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Share failed:', err);
        } finally {
            setIsSharing(false);
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
                                        Atur sendiri topik materi dan tingkat kesulitan untuk sesi latihanmu hari ini!
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <select
                                            className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                                            value={selectedTopic}
                                            onChange={(e) => setSelectedTopic(e.target.value)}
                                        >
                                            <option value="">🔮 Topik: Bebas / Acak</option>
                                            <option value="Logical Fallacy Detection">Logical Fallacy</option>
                                            <option value="Ethical Dilemma">Dilema Etika</option>
                                            <option value="Problem Solving">Problem Solving</option>
                                            <option value="Bias Awareness">Kesadaran Bias</option>
                                            <option value="Argument Analysis">Analisis Argumen</option>
                                        </select>

                                        <select
                                            className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                                            value={selectedDifficulty}
                                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                                        >
                                            <option value="">⚙️ Level: Auto (Sesuai Rank)</option>
                                            <option value="Beginner">Beginner (Pemula)</option>
                                            <option value="Intermediate">Intermediate (Menengah)</option>
                                            <option value="Advanced">Advanced (Mahir)</option>
                                            <option value="Expert">Expert (Suhu)</option>
                                        </select>
                                    </div>
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

                    {viewState === 'simulation' && simulation && simulation.questions && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-6">
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {simulation.type.replace('_', ' ')}
                                </span>
                                <span className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                                    <ClockIcon className="w-4 h-4" /> Soal {currentQuestionIndex + 1} dari {simulation.questions.length}
                                </span>
                            </div>
                            
                            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-l-4 border-indigo-500">
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Skenario:</p>
                                <p className="text-slate-700 dark:text-slate-300 text-sm italic">{simulation.scenario_text}</p>
                            </div>

                            <h2 className="text-xl font-bold leading-relaxed text-slate-800 dark:text-slate-200 mb-8">
                                {simulation.questions[currentQuestionIndex].text}
                            </h2>
                            
                            <div className="space-y-4">
                                {simulation.questions[currentQuestionIndex].options && Object.entries(simulation.questions[currentQuestionIndex].options).map(([key, text]) => {
                                    const isSelected = answers[currentQuestionIndex] === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                const newAnswers = [...answers];
                                                newAnswers[currentQuestionIndex] = key;
                                                setAnswers(newAnswers);
                                            }}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-200 dark:ring-indigo-700' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                    {key}
                                                </span>
                                                <span className="text-slate-800 dark:text-slate-200 mt-1">{text}</span>
                                            </div>
                                        </button>
                                    );
                                })}

                                <div className="flex justify-between pt-8">
                                    <button
                                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                        disabled={currentQuestionIndex === 0}
                                        className="px-6 py-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-30"
                                    >
                                        Kembali
                                    </button>
                                    
                                    {currentQuestionIndex < simulation.questions.length - 1 ? (
                                        <button
                                            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                            disabled={!answers[currentQuestionIndex]}
                                            className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50"
                                        >
                                            Selanjutnya
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmitAnswer}
                                            disabled={isSubmitting || answers.length < simulation.questions.length || answers.includes(undefined)}
                                            className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Mengevaluasi...' : 'Kirim Jawaban'}
                                        </button>
                                    )}
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
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-b-4 border-indigo-200 dark:border-indigo-900/50 text-center shadow-sm relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 opacity-10">
                                        <ChartBarIcon className="w-24 h-24 text-indigo-500" />
                                    </div>
                                    <span className="uppercase text-xs font-bold text-indigo-500 tracking-wider mb-2 block relative z-10">Skor Kuis</span>
                                    <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2 relative z-10">
                                        {score} <span className="text-2xl">%</span>
                                    </div>
                                </div>
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
                            
                                {/* Share Buttons */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mt-6">
                                    <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                        <ShareIcon className="w-5 h-5 text-indigo-500" /> Bagikan Hasil Kuis
                                    </h3>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleShareQuiz(false)}
                                            disabled={isSharing}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                                        >
                                            <ShareIcon className="w-5 h-5" />
                                            {isSharing ? 'Menyiapkan...' : 'Share'}
                                        </button>
                                        <button
                                            onClick={() => handleShareQuiz(true)}
                                            disabled={isSharing}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all disabled:opacity-50"
                                        >
                                            <ArrowDownTrayIcon className="w-5 h-5" />
                                            Download PNG
                                        </button>
                                    </div>
                                </div>

                                {/* Hidden share card for canvas capture */}
                                <div className="fixed" style={{ left: '-9999px', top: 0, pointerEvents: 'none', zIndex: -1 }}>
                                    <QuizShareCard
                                        ref={quizCardRef}
                                        format="square"
                                        data={{
                                            score,
                                            xp_earned: xpEarned,
                                            user_name: auth.user.name,
                                            topic: simulation?.type,
                                            difficulty: simulation?.difficulty_level,
                                            arena_rank: stats.arena_rank,
                                            arena_xp: stats.arena_xp,
                                        }}
                                    />
                                </div>

                            <div className="text-center pt-8 pb-12 space-y-4">
                                <button
                                    onClick={() => {
                                        setMatch(null);
                                        setSimulation(null);
                                        setViewState('dashboard');
                                    }}
                                    className="px-6 py-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors w-full sm:w-auto mx-auto block"
                                >
                                    Pilih Topik & Latihan Lagi 🚀
                                </button>
                                <Link href={route('dashboard')} className="block text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold transition-colors uppercase tracking-wider text-sm mt-4">
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
