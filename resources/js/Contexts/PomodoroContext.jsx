import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { startBackgroundTimer, stopBackgroundTimer, requestNotificationPermission, showIOSStyleNotification } from '@/Utils/NotificationHelper';

const PomodoroContext = createContext(null);

export function usePomodoroTimer() {
    const ctx = useContext(PomodoroContext);
    if (!ctx) throw new Error('usePomodoroTimer must be used within PomodoroProvider');
    return ctx;
}

/**
 * Global Pomodoro Timer Provider
 * Lives in AuthenticatedLayout so timer persists across Inertia page navigations.
 * Syncs with server to stay accurate and tamper-proof.
 */
export function PomodoroProvider({ children, auth }) {
    const [activeTask, setActiveTask] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [gamificationData, setGamificationData] = useState(null);
    const [showGamificationPopup, setShowGamificationPopup] = useState(false);
    const hasCheckedSession = useRef(false);

    // Check for active session on mount (server sync)
    useEffect(() => {
        if (hasCheckedSession.current) return;
        hasCheckedSession.current = true;

        requestNotificationPermission();

        const checkActiveSession = async () => {
            try {
                const res = await axios.get('/api/dashboard/pomodoro/active');
                if (res.data.session) {
                    const session = res.data.session;
                    const startedAt = dayjs(session.started_at);
                    const elapsed = dayjs().diff(startedAt, 'seconds');
                    const totalSecs = session.focus_minutes * 60;
                    const remaining = Math.max(0, totalSecs - elapsed);

                    if (remaining > 0) {
                        setActiveTask(session.task || { id: session.task_id, title: 'Sesi Fokus' });
                        setSecondsLeft(remaining);
                        setTotalDuration(totalSecs);
                        setStartTime(startedAt);
                        setIsRunning(true);
                    }
                }
            } catch (err) {
                console.error('Failed to check active session:', err);
            }
        };
        checkActiveSession();
    }, []);

    // Timer tick
    useEffect(() => {
        let timer;
        if (isRunning && secondsLeft > 0) {
            timer = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
        } else if (secondsLeft === 0 && isRunning) {
            // Timer completed — stop session
            stopSession(false);
        }
        return () => clearInterval(timer);
    }, [isRunning, secondsLeft]);

    // Start focus session
    const startFocus = useCallback(async (task, durationOverride) => {
        const duration = durationOverride || task.estimated_minutes || 25;

        try {
            await axios.post('/api/dashboard/pomodoro/start', {
                task_id: task.id,
                duration_minutes: duration
            });

            setActiveTask(task);
            setSecondsLeft(duration * 60);
            setTotalDuration(duration * 60);
            setStartTime(dayjs());
            setIsRunning(true);

            startBackgroundTimer({
                taskId: task.id,
                taskTitle: task.title,
                totalSeconds: duration * 60,
                remainingSeconds: duration * 60
            });

            if (auth?.user?.is_premium && task.auto_open_url) {
                window.open(task.auto_open_url, '_blank');
            }
        } catch (err) {
            console.error('Failed to start session:', err);
        }
    }, [auth]);

    // Stop session
    const stopSession = useCallback(async (manuallyStopped = true) => {
        if (!isRunning && manuallyStopped) return;
        setIsRunning(false);

        try {
            stopBackgroundTimer();

            const res = await axios.post('/api/dashboard/pomodoro/stop', {
                break_minutes: 0,
                tab_switches: 0,
                ai_questions_asked: 0,
            });

            if (!manuallyStopped && res.data?.gamification) {
                setGamificationData({
                    xpAwarded: res.data.gamification.xp_awarded || 0,
                    newStreak: res.data.gamification.current_streak || 0,
                    levelUp: res.data.gamification.level_up || false,
                    newLevel: res.data.gamification.new_level || 0,
                    achievements: res.data.gamification.achievements || [],
                    taskTitle: activeTask?.title || 'Pomodoro Session'
                });
                setShowGamificationPopup(true);
                setCurrentStreak(res.data.gamification.current_streak || currentStreak);

                // Notify even if on different page
                showIOSStyleNotification('🎉 Sesi Fokus Selesai!', {
                    body: `${activeTask?.title || 'Pomodoro'} — Saatnya istirahat!`,
                    tag: 'pomodoro-complete',
                    requireInteraction: true,
                });
                try { new Audio('/sounds/complete.mp3').play(); } catch (e) { }
            }
        } catch (error) {
            console.error("Failed to save session:", error);
        }
    }, [isRunning, activeTask, currentStreak]);

    // Reset timer
    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setSecondsLeft(totalDuration);
    }, [totalDuration]);

    // Close timer island
    const closeTimer = useCallback(() => {
        if (isRunning) {
            if (confirm('Timer masih berjalan. Berhenti dan simpan progres?')) {
                stopSession(true);
                setActiveTask(null);
            }
        } else {
            setActiveTask(null);
        }
    }, [isRunning, stopSession]);

    const value = {
        // State
        activeTask,
        secondsLeft,
        totalDuration,
        isRunning,
        startTime,
        currentStreak,
        gamificationData,
        showGamificationPopup,
        // Actions
        startFocus,
        stopSession,
        resetTimer,
        closeTimer,
        setIsRunning,
        setShowGamificationPopup,
        setGamificationData,
        setCurrentStreak,
    };

    return (
        <PomodoroContext.Provider value={value}>
            {children}
        </PomodoroContext.Provider>
    );
}

export default PomodoroContext;
