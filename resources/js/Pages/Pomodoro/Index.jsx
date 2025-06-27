import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';

export default function Pomodoro({ auth }) {
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        let timer;
        if (isRunning && secondsLeft > 0) {
            timer = setInterval(() => {
                setSecondsLeft((prev) => prev - 1);
            }, 1000);
        } else if (secondsLeft === 0 && isRunning) {
            setIsRunning(false);
            saveSession();
        }
        return () => clearInterval(timer);
    }, [isRunning, secondsLeft]);

    const startSession = () => {
        setStartTime(dayjs());
        setIsRunning(true);
    };

    const saveSession = () => {
        router.post('/pomodoro/store', {
            focus_minutes: 25,
            break_minutes: 5,
            started_at: startTime.toISOString(),
            ended_at: dayjs().toISOString(),
        });
    };

    const resetTimer = () => {
        setSecondsLeft(25 * 60);
        setIsRunning(false);
    };

    const formatTime = () => {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pomodoro Timer" />
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
                <div className="max-w-md w-full text-center space-y-8">
                    <motion.h2
                        className="text-4xl font-extrabold tracking-tight"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Pomodoro Timer
                    </motion.h2>

                    <motion.div
                        className="text-6xl font-mono"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        {formatTime()}
                    </motion.div>

                    <div className="flex justify-center gap-4 flex-wrap">
                        {!isRunning && (
                            <motion.button
                                onClick={startSession}
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl shadow transition"
                                whileTap={{ scale: 0.95 }}
                            >
                                Start
                            </motion.button>
                        )}

                        {isRunning && (
                            <motion.button
                                onClick={() => setIsRunning(false)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl shadow transition"
                                whileTap={{ scale: 0.95 }}
                            >
                                Pause
                            </motion.button>
                        )}

                        <motion.button
                            onClick={resetTimer}
                            className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-xl shadow transition"
                            whileTap={{ scale: 0.95 }}
                        >
                            Reset
                        </motion.button>
                    </div>

                    <p className="text-gray-400 text-sm pt-4">
                        Stay focused, take short breaks, and build your study habit 💪
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
