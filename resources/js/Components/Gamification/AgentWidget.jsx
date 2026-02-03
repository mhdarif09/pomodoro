import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, ExclamationTriangleIcon, CheckCircleIcon, SpeakerWaveIcon, MicrophoneIcon } from '@heroicons/react/24/solid';
import { router } from '@inertiajs/react';

export default function AgentWidget({ briefing }) {
    if (!briefing) return null;

    const { message, risk_level, action_needed, persona } = briefing;
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const speak = (text) => {
        if (!window.speechSynthesis) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.onend = () => setIsSpeaking(false);

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const listen = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Browser doesn't support voice recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();
        setIsListening(true);

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            console.log("Voice Command:", command);
            setIsListening(false);

            if (command.includes('rescue') || command.includes('fix')) {
                if (briefing.rescue_plan) {
                    router.post(route('gamification.rescue'), { plan: briefing.rescue_plan });
                } else {
                    speak("No rescue plan needed right now.");
                }
            } else if (command.includes('status') || command.includes('read')) {
                speak(message);
            }
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
    };

    const getRiskColor = () => {
        switch (risk_level) {
            case 'HIGH': return 'from-red-500 to-pink-600 shadow-red-500/30';
            case 'MEDIUM': return 'from-amber-400 to-orange-500 shadow-amber-500/30';
            default: return 'from-emerald-400 to-teal-500 shadow-emerald-500/30';
        }
    };

    const getIcon = () => {
        switch (risk_level) {
            case 'HIGH': return <ExclamationTriangleIcon className="w-6 h-6 text-white" />;
            case 'MEDIUM': return <SparklesIcon className="w-6 h-6 text-white" />;
            default: return <CheckCircleIcon className="w-6 h-6 text-white" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-1"
        >
            <div className={`relative p-6 rounded-2xl bg-gradient-to-r ${getRiskColor()} shadow-lg`}>

                {/* Header: Persona & Controls */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm border border-white/10 mb-2">
                            {persona || 'Agent'} Mode
                        </span>
                        {briefing.success_probability && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/20 text-white backdrop-blur-sm border border-white/10 mb-2">
                                Success Probability: {briefing.success_probability}%
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => speak(message)}
                            className={`p-2 rounded-full backdrop-blur-sm transition ${isSpeaking ? 'bg-white text-emerald-600 animate-pulse' : 'bg-white/20 text-white hover:bg-white/30'}`}
                            title="Read Briefing"
                        >
                            <SpeakerWaveIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={listen}
                            className={`p-2 rounded-full backdrop-blur-sm transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/20 text-white hover:bg-white/30'}`}
                            title="Voice Command (Try 'Rescue' or 'Status')"
                        >
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-start gap-4 text-white relative z-10">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                        {getIcon()}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-1">
                            Super Agent Warning
                        </h3>
                        <p className="text-lg md:text-xl font-medium leading-relaxed mb-3">
                            "{message}"
                        </p>

                        {briefing.rescue_plan && (
                            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20 mb-3">
                                <p className="text-sm text-white/90 mb-2">
                                    💡 {briefing.rescue_plan.message}
                                </p>
                                <button
                                    onClick={() => router.post(route('gamification.rescue'), { plan: briefing.rescue_plan })}
                                    className="bg-white text-emerald-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-50 transition shadow-lg"
                                >
                                    {briefing.rescue_plan.action_label || "Yes, Fix My Schedule"}
                                </button>
                            </div>
                        )}

                        {briefing.memory_insights && (
                            <div className="bg-purple-500/20 rounded-lg p-3 backdrop-blur-sm border border-purple-300/30 mb-3">
                                <h4 className="text-sm font-bold text-white/90 flex items-center gap-2 mb-1.5">
                                    🧠 Memory Agent
                                </h4>
                                <p className="text-sm text-white leading-relaxed">
                                    {briefing.memory_insights.advice}
                                </p>
                                {briefing.memory_insights.best_study_time && (
                                    <p className="text-xs text-white/80 mt-2">
                                        ⏰ Best time: {briefing.memory_insights.best_study_time}
                                    </p>
                                )}
                            </div>
                        )}

                        {briefing.social_message && (
                            <div className="bg-blue-500/20 rounded-lg p-3 backdrop-blur-sm border border-blue-300/30 mb-3">
                                <p className="text-sm text-white leading-relaxed">
                                    🏆 {briefing.social_message}
                                </p>
                            </div>
                        )}

                        {briefing.active_bosses && briefing.active_bosses.length > 0 && (
                            <div className="space-y-2 mt-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">
                                    Active Boss Battles ⚔️
                                </h4>
                                {briefing.active_bosses.map(boss => (
                                    <div key={boss.id} className="bg-black/30 rounded-lg p-2 border border-white/10">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold text-white">{boss.name}</span>
                                            <span className="text-xs text-white/80">{boss.status} ({boss.current_hp}/{boss.max_hp} subtasks)</span>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${boss.health_percent <= 20 ? 'bg-red-500 animate-pulse' : boss.health_percent <= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${boss.health_percent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black/5 rounded-full blur-xl" />
            </div>
        </motion.div>
    );
}
