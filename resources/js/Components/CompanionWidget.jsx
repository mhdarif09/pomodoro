import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

const TumbuhAvatarSmall = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M50 80C50 80 50 63.816 50 50C50 36.184 35 25 35 25C35 25 45 25 50 35M50 50C50 36.184 65 25 65 25C65 25 55 25 50 35" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M50 80V50" stroke="#fff" strokeWidth="8" strokeLinecap="round"/>
    </svg>
);

export default function CompanionWidget() {
    const { auth } = usePage().props;
    const user = auth?.user;

    if (!user) return null;

    const [contextData, setContextData] = useState(null);
    const [currentMsg, setCurrentMsg] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    
    const lastInteractionRef = useRef(Date.now());
    const messageTimerRef = useRef(null);
    const evalTimerRef = useRef(null);
    const contextDataRef = useRef(null);
    
    const storageKey = `companion_state_${user.id}`;

    const getCooldowns = () => {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) || {};
        } catch {
            return {};
        }
    };

    const setCooldown = (eventKey) => {
        const cooldowns = getCooldowns();
        cooldowns[eventKey] = Date.now();
        localStorage.setItem(storageKey, JSON.stringify(cooldowns));
    };

    const isOnCooldown = (eventKey, minutes) => {
        const cooldowns = getCooldowns();
        if (!cooldowns[eventKey]) return false;
        return (Date.now() - cooldowns[eventKey]) < (minutes * 60 * 1000);
    };

    const showMessage = (text, eventKey) => {
        setCurrentMsg(text);
        setIsVisible(true);
        setCooldown(eventKey);

        if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
        messageTimerRef.current = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => setCurrentMsg(null), 500);
        }, 6000);
    };

    useEffect(() => {
        const updateInteraction = () => { lastInteractionRef.current = Date.now(); };
        window.addEventListener('mousemove', updateInteraction);
        window.addEventListener('keydown', updateInteraction);
        window.addEventListener('scroll', updateInteraction, true);

        return () => {
            window.removeEventListener('mousemove', updateInteraction);
            window.removeEventListener('keydown', updateInteraction);
            window.removeEventListener('scroll', updateInteraction, true);
        };
    }, []);

    useEffect(() => {
        contextDataRef.current = contextData;
    }, [contextData]);

    useEffect(() => {
        window.axios.get('/api/companion/context')
            .then(res => {
                setContextData(res.data);
            })
            .catch(() => {});

        evalTimerRef.current = setInterval(() => {
            evaluateEvents();
        }, 5000);

        return () => {
            if (evalTimerRef.current) clearInterval(evalTimerRef.current);
            if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (contextData) evaluateEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contextData]);

    const evaluateEvents = () => {
        const ctx = contextDataRef.current;
        if (!ctx || isVisible) return; 
        
        const now = Date.now();
        const firstName = user.name.split(' ')[0];
        const taskCount = ctx.active_tasks || 0;
        const completedToday = ctx.completed_today || 0;

        // 1. APP_OPEN
        if (!isOnCooldown('APP_OPEN', 60 * 12)) {
            if (taskCount > 0) {
                showMessage(`Halo ${firstName}… aku lihat ada ${taskCount} task, kita cicil bareng ya 🌱`, 'APP_OPEN');
            } else {
                showMessage(`Halo ${firstName}… kita mulai pelan-pelan ya hari ini 🌱`, 'APP_OPEN');
            }
            return;
        }

        // 2. POMODORO_LONG
        if (ctx.pomodoro_status === 'running') {
            if (!isOnCooldown('POMODORO_LONG', 10)) {
                showMessage("Kamu udah fokus lama… mau istirahat bentar?", 'POMODORO_LONG');
                return;
            }
        }

        // 3. TASK_OVERLOAD
        if (taskCount >= 5 && !isOnCooldown('TASK_OVERLOAD', 10)) {
            const msgs = [
                "Task kamu lumayan banyak… kita ambil satu dulu yuk",
                "Nggak usah buru-buru, selesaikan satu-satu aja ya"
            ];
            showMessage(msgs[Math.floor(Math.random() * msgs.length)], 'TASK_OVERLOAD');
            return;
        }

        // 4. IDLE
        const idleTime = now - lastInteractionRef.current;
        if (idleTime > 75000 && !isOnCooldown('IDLE', 5)) {
            const msgs = [
                "Masih di situ? aku temenin kok…",
                "Kalau capek, kita berhenti bentar juga gapapa",
                "Ambil napas bentar yuk..."
            ];
            showMessage(msgs[Math.floor(Math.random() * msgs.length)], 'IDLE');
            return;
        }

        // 5. LOW_ACTIVITY
        if (completedToday === 0 && !isOnCooldown('LOW_ACTIVITY', 15)) {
             const msgs = [
                "Hari ini pelan juga gapapa kok",
                "Mulai dari yang kecil aja ya",
                "Nggak usah paksain diri kalau lagi capek 🌱"
            ];
            showMessage(msgs[Math.floor(Math.random() * msgs.length)], 'LOW_ACTIVITY');
            return;
        }

        // 6. RANDOM_SOFT
        if (!isOnCooldown('RANDOM_SOFT', 12) && Math.random() < 0.3) {
             const msgs = [
                "Aku di sini ya…",
                "Pelan-pelan juga gapapa",
                "Makasih udah mau berusaha keras hari ini 🌱"
            ];
            showMessage(msgs[Math.floor(Math.random() * msgs.length)], 'RANDOM_SOFT');
            return;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <div 
                className={`transition-all duration-700 ease-in-out transform origin-bottom-right mb-3 ${
                    isVisible
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-2 scale-[0.98]'
                } max-w-[260px] bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-br-sm shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-3.5 px-4`}
            >
                {currentMsg && (
                    <p className="text-sm font-medium leading-relaxed tracking-wide text-gray-600">
                        {currentMsg}
                    </p>
                )}
            </div>

            <div className="bg-emerald-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg pointer-events-auto ring-4 ring-emerald-50 z-10 transition-transform duration-500 ease-out hover:scale-105 group relative overflow-hidden">
                <TumbuhAvatarSmall className={`w-5 h-5 relative z-10 ${isVisible ? 'animate-pulse' : ''}`} />
                <div className={`absolute inset-0 bg-white/20 blur-md ${isVisible ? 'animate-ping opacity-50' : 'opacity-0'}`}></div>
            </div>
        </div>
    );
}
