// File: resources/js/Pages/Pomodoro/index.jsx
// VERSI FINAL LENGKAP - Modern & Terintegrasi

import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import dayjs from 'dayjs';

import PomodoroTimer from './components/PomodoroTimer';
import SessionSettings from './components/SessionSettings';
import AIAssistantPanel from './components/AIAssistantPanel';
import UpgradeModal from './components/UpgradeModal';
import FloatingActionButtons from './components/FloatingActionButtons';

import { FREE_AI_CHAT_LIMIT } from './constants';

export default function Pomodoro({ auth, isPremium, plans = [] }) {
    // --- State Utama & Timer ---
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [customFocusTime, setCustomFocusTime] = useState(25);
    const [customBreakTime, setCustomBreakTime] = useState(5);
    const [tabWarningCount, setTabWarningCount] = useState(0);

    // --- State Visibilitas UI ---
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    
    // --- State Fungsional ---
    const [blockedUrls, setBlockedUrls] = useState(['']);
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [freeAiChatsUsed, setFreeAiChatsUsed] = useState(0);
    const [showTabWarning, setShowTabWarning] = useState(false);
    const audioRef = useRef(null);

    // --- Hooks Inti ---
    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission().then(setNotificationPermission);
        }
    }, []);
    
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isRunning) {
                setTabWarningCount(prev => prev + 1);
                setShowTabWarning(true);
                if (notificationPermission === 'granted') {
                    new Notification('🍅 Kembali Fokus!', { body: 'Timer masih berjalan. Jangan tinggalkan sesi fokus Anda.' });
                }
                if (audioRef.current) audioRef.current.play().catch(e => console.error("Audio play failed:", e));
                setTimeout(() => setShowTabWarning(false), 3000);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isRunning, notificationPermission]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isRunning) {
                e.preventDefault();
                e.returnValue = 'Timer sedang berjalan. Yakin ingin keluar?';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isRunning]);

    useEffect(() => {
        let timer;
        if (isRunning && secondsLeft > 0) {
            timer = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
        } else if (secondsLeft === 0 && isRunning) {
            setIsRunning(false);
            saveSession({ manuallyStopped: false });
            if (notificationPermission === 'granted') {
                new Notification('🎉 Sesi Selesai!', { body: 'Waktunya istirahat sejenak.' });
            }
            if (audioRef.current) audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
        return () => clearInterval(timer);
    }, [isRunning, secondsLeft]);

    // --- Handlers ---
    const startSession = () => {
        setStartTime(dayjs());
        setIsRunning(true);
        setTabWarningCount(0);
        setSecondsLeft(customFocusTime * 60);
        setFreeAiChatsUsed(0);
        sessionStorage.removeItem('aiChatHistory');
    };

    const stopSession = () => {
        if (isRunning) saveSession({ manuallyStopped: true });
        setIsRunning(false);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setSecondsLeft(customFocusTime * 60);
    };
    
    const saveSession = ({ manuallyStopped }) => {
        if (!startTime) return;
        const chatHistory = JSON.parse(sessionStorage.getItem('aiChatHistory') || '[]');
        router.post('/pomodoro/store', {
            focus_minutes: customFocusTime,
            break_minutes: customBreakTime,
            started_at: startTime?.toISOString(),
            ended_at: dayjs().toISOString(),
            manually_stopped: manuallyStopped,
            blocked_urls: blockedUrls.filter(Boolean),
            tab_switches: tabWarningCount,
            ai_questions_asked: chatHistory.filter(msg => msg.role === 'user').length,
        }, { 
            preserveState: true,
            onSuccess: () => sessionStorage.removeItem('aiChatHistory')
        });
    };
    
    const triggerUpgradeModal = () => setShowUpgradeModal(true);

    const totalDuration = customFocusTime * 60;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pomodoro Timer" />
            <audio ref={audioRef} src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSBvT19PAN/6/f8A/gD+/P7+/v79/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/vD+/wC" />

            <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 -z-10 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />

            <main className="min-h-screen w-full text-slate-800 dark:text-slate-200 px-4 py-8 sm:py-12 flex flex-col items-center">
                
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Pomodoro Focus</h1>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-10">Selesaikan tugas Anda, satu sesi pada satu waktu.</p>
                
                <div className="w-full max-w-lg mx-auto space-y-8">
                    <PomodoroTimer
                        secondsLeft={secondsLeft}
                        isRunning={isRunning}
                        totalDuration={totalDuration}
                        onStart={startSession}
                        onStop={stopSession}
                        onReset={resetTimer}
                    />
                    <SessionSettings
                        isPremium={isPremium}
                        customFocusTime={customFocusTime}
                        setCustomFocusTime={(v) => { setCustomFocusTime(v); if(!isRunning) setSecondsLeft(v * 60); }}
                        customBreakTime={customBreakTime}
                        setCustomBreakTime={setCustomBreakTime}
                        blockedUrls={blockedUrls}
                        setBlockedUrls={setBlockedUrls}
                        onUpgrade={triggerUpgradeModal}
                    />
                </div>
            </main>

            <FloatingActionButtons
                onAIChatClick={() => setShowAIAssistant(true)}
            />

            <AIAssistantPanel
                isOpen={showAIAssistant}
                onClose={() => setShowAIAssistant(false)}
                isPremium={isPremium}
                freeAiChatsUsed={freeAiChatsUsed}
                setFreeAiChatsUsed={setFreeAiChatsUsed}
                onUpgrade={triggerUpgradeModal}
            />
            
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                plans={plans}
            />
        </AuthenticatedLayout>
    );
}