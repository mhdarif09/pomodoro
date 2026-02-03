import { useState, useEffect } from 'react';
import axios from 'axios';
import { LightBulbIcon, ExclamationTriangleIcon, FireIcon, ClockIcon, CalendarDaysIcon, ArrowTrendingUpIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartSuggestionWidget() {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const response = await axios.get(route('api.suggestions'));
                setSuggestions(response.data.suggestions || []);
            } catch (error) {
                console.error("Failed to fetch smart suggestions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    if (loading || suggestions.length === 0) return null;

    // Only show top 1 suggestion for now to avoid clutter
    const topSuggestion = suggestions[0];

    const getIcon = (type) => {
        switch (type) {
            case 'procrastination_alert': return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />;
            case 'productivity_peak': return <ClockIcon className="w-5 h-5 text-indigo-500" />;
            case 'streak_keeper': return <FireIcon className="w-5 h-5 text-orange-500" />;
            case 'risk_management': return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
            case 'schedule_adjustment': return <CalendarDaysIcon className="w-5 h-5 text-teal-500" />;
            case 'level_up_near': return <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-500" />;
            case 'guild_call': return <UserGroupIcon className="w-5 h-5 text-indigo-500" />;
            default: return <LightBulbIcon className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'procrastination_alert': return 'bg-amber-50 border-amber-200 text-amber-900';
            case 'productivity_peak': return 'bg-indigo-50 border-indigo-200 text-indigo-900';
            case 'streak_keeper': return 'bg-orange-50 border-orange-200 text-orange-900';
            case 'risk_management': return 'bg-red-50 border-red-200 text-red-900';
            case 'schedule_adjustment': return 'bg-teal-50 border-teal-200 text-teal-900';
            case 'level_up_near': return 'bg-emerald-50 border-emerald-200 text-emerald-900';
            case 'guild_call': return 'bg-indigo-50 border-indigo-200 text-indigo-900';
            default: return 'bg-blue-50 border-blue-200 text-blue-900';
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl border flex items-start gap-3 shadow-sm ${getBgColor(topSuggestion.type)}`}
            >
                <div>{getIcon(topSuggestion.type)}</div>
                <div>
                    <h4 className="font-bold text-sm mb-0.5">Habit Intel says:</h4>
                    <p className="text-sm">{topSuggestion.message}</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
