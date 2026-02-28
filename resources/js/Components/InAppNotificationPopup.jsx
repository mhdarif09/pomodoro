import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    SparklesIcon,
    TrophyIcon,
    FireIcon,
    BellAlertIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const iconMap = {
    'identity_trigger': <FireIcon className="w-6 h-6 text-orange-500" />,
    'achievement': <TrophyIcon className="w-6 h-6 text-amber-500" />,
    'evaluation': <SparklesIcon className="w-6 h-6 text-blue-500" />,
    'reminder': <BellAlertIcon className="w-6 h-6 text-purple-500" />,
    'success': <CheckCircleIcon className="w-6 h-6 text-emerald-500" />,
    'error': <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
};

export default function InAppNotificationPopup() {
    const { flash, gamification } = usePage().props;
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const newNotifications = [];

        // 1. Check for standard flash messages
        if (flash?.success) {
            newNotifications.push({ id: Date.now() + '-success', type: 'success', title: 'Success', message: flash.success });
        }
        if (flash?.error) {
            newNotifications.push({ id: Date.now() + '-error', type: 'error', title: 'Error', message: flash.error });
        }

        // 2. Check for Gamification Identity Trigger
        // Only show once per session to avoid annoying the user
        const triggerShown = sessionStorage.getItem('identity_trigger_shown');
        if (gamification?.identity_trigger && !triggerShown) {
            newNotifications.push({
                id: 'identity-trigger',
                type: 'identity_trigger',
                title: 'You are capable of this.',
                message: gamification.identity_trigger
            });
            sessionStorage.setItem('identity_trigger_shown', 'true');
        }

        if (newNotifications.length > 0) {
            setNotifications(prev => [...prev, ...newNotifications]);
        }
    }, [flash, gamification]);

    // Auto-dismiss logic
    useEffect(() => {
        if (notifications.length > 0) {
            const timer = setTimeout(() => {
                setNotifications(prev => prev.slice(1)); // Remove oldest
            }, 6000); // 6 seconds display time
            return () => clearTimeout(timer);
        }
    }, [notifications]);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            <AnimatePresence>
                {notifications.map((notif) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className="pointer-events-auto bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 p-4 flex gap-4 overflow-hidden relative"
                    >
                        {/* Status Sidebar indicator */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${notif.type === 'error' ? 'bg-red-500' :
                                notif.type === 'success' ? 'bg-emerald-500' :
                                    notif.type === 'identity_trigger' ? 'bg-orange-500' :
                                        'bg-blue-500'
                            }`} />

                        <div className="flex-shrink-0 mt-0.5 relative">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center">
                                {iconMap[notif.type] || <BellAlertIcon className="w-6 h-6 text-slate-500" />}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize truncate">
                                {notif.title}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                {notif.message}
                            </p>
                        </div>

                        <button
                            onClick={() => removeNotification(notif.id)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
