// File: resources/js/Pages/Pomodoro/index.jsx
// Versi final yang bersih dan terstruktur

import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import dayjs from 'dayjs';

// Impor komponen-komponen baru dari folder `components`
import PomodoroTimer from './components/PomodoroTimer';
import SessionSettings from './components/SessionSettings';
import AIAssistantPanel from './components/AIAssistantPanel';
import PDFQueryModal from './components/PDFQueryModal';
import UpgradeModal from './components/UpgradeModal';
import FloatingActionButtons from './components/FloatingActionButtons';

export const FREE_AI_CHAT_LIMIT = 2; // Diekspor untuk digunakan oleh komponen anak

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
    const [showPdfAI, setShowPdfAI] = useState(false);
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
            if (!document.hidden && isRunning) {
                setTabWarningCount(prev => prev + 1);
                setShowTabWarning(true);
                if (notificationPermission === 'granted') {
                    new Notification('🍅 Kembali Fokus!', { body: 'Timer masih berjalan.' });
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
        sessionStorage.removeItem('aiChatHistory'); // Hapus riwayat chat lama saat sesi baru mulai
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

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pomodoro Timer" />
            <audio ref={audioRef} src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSBvT19PAN/6/f8A/gD+/P7+/v79/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/vD+/PwC" />

            <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 -z-10" />

            <main className="w-full h-full text-slate-800 dark:text-slate-200 px-4 py-8 flex flex-col items-center">
                <div className="w-full max-w-2xl mx-auto space-y-8">
                    <PomodoroTimer
                        secondsLeft={secondsLeft}
                        isRunning={isRunning}
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
                isPremium={isPremium}
                onAIChatClick={() => setShowAIAssistant(true)}
                onPDFQueryClick={() => isPremium ? setShowPdfAI(true) : triggerUpgradeModal()}
            />

            <AIAssistantPanel
                isOpen={showAIAssistant}
                onClose={() => setShowAIAssistant(false)}
                isPremium={isPremium}
                freeAiChatsUsed={freeAiChatsUsed}
                setFreeAiChatsUsed={setFreeAiChatsUsed}
                onUpgrade={triggerUpgradeModal}
            />

            <PDFQueryModal
                isOpen={showPdfAI && isPremium}
                onClose={() => setShowPdfAI(false)}
            />
            
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                plans={plans}
            />
        </AuthenticatedLayout>
    );
}