import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LockClosedIcon, SparklesIcon, FireIcon } from '@heroicons/react/24/solid';

export default function ProductivityPulse({ className = '', refreshTrigger = 0 }) {
    const { auth } = usePage().props;
    const isPremium = auth.user.is_premium;

    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState([]);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Now using web routes (session based) to avoid 401
                const [summaryRes, trendsRes, insightsRes] = await Promise.all([
                    axios.get('/api/dashboard/productivity/summary'),
                    axios.get('/api/dashboard/productivity/trends'),
                    axios.get('/api/dashboard/productivity/insights').catch(() => ({ data: { insights: null } }))
                ]);

                setSummary(summaryRes.data);
                setTrends(trendsRes.data.trends || []);
                setInsights(insightsRes.data);
            } catch (error) {
                console.error("Failed to load productivity stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refreshTrigger]);

    if (loading) return <div className={`animate-pulse h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl ${className}`} />;

    // Custom Tooltip for Recharts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-white mb-1">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-emerald-500">{payload[0].value} mins</span> focus
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Summary Card */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FireIcon className="w-12 h-12 text-orange-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fokus Hari Ini</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{summary?.focus_minutes || 0}</h3>
                        <span className="text-xs font-bold text-slate-500">menit</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <SparklesIcon className="w-12 h-12 text-purple-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Task Selesai</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{summary?.tasks_completed || 0}</h3>
                        <span className="text-xs font-bold text-slate-500">tugas</span>
                    </div>
                </div>
            </div>

            {/* Trends Chart (OPEN FOR ALL) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="text-emerald-500">⚡</span> Focus Trends
                    </h3>
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">LAST 7 DAYS</span>
                </div>

                <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trends && trends.length > 0 ? trends : []}>
                            <XAxis
                                dataKey="day_name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                dy={10}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="focus_minutes" radius={[6, 6, 6, 6]}>
                                {trends.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === new Date().getDay() - 1 ? '#14b8a6' : '#e2e8f0'} className="dark:fill-slate-800" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}
