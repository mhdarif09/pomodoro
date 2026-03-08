import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrophyIcon, FireIcon, StarIcon, ChartBarIcon,
    AcademicCapIcon, RocketLaunchIcon, SparklesIcon,
    ChevronRightIcon, WalletIcon
} from '@heroicons/react/24/outline';
import WeeklyJourney from '@/Components/Gamification/WeeklyJourney';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const BentoTile = ({ children, className = "", delay = 0, useGlass = true }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        className={`${useGlass ? 'apple-glass' : ''} rounded-[2.5rem] p-6 shadow-xl border border-white/10 ${className}`}
    >
        {children}
    </motion.div>
);

export default function GamificationDashboard({ auth, challenges = [], achievements = [], leaderboard = [], userRank = {}, pointsBalance = 0, agentBriefing = null }) {
    const user = auth.user;
    const currentXp = user?.xp || 0;
    const progressToNextLevel = (currentXp % 1000) / 10; // Assuming 1000 XP per level for simplicity

    return (
        <AuthenticatedLayout header={<h2 className="font-[1000] text-2xl text-slate-900 dark:text-white tracking-tight">Pusat Gamifikasi</h2>}>
            <Head title="Gamification" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

                {/* 1. HERO ROW: Profile & Briefing */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Level & Rank Tile */}
                    <BentoTile
                        useGlass={false}
                        className="col-span-12 lg:col-span-5 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                            <AcademicCapIcon className="w-48 h-48 rotate-12" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 shadow-2xl">
                                    <span className="text-3xl font-[1000]">{user.level}</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black leading-tight">Elite Achiever</h3>
                                    <div className="flex items-center gap-2 text-indigo-100 font-bold text-sm">
                                        <ChartBarIcon className="w-4 h-4" />
                                        <span>Rank #{userRank.rank || 'N/A'} of {userRank.total || '0'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-indigo-100">
                                    <span>XP Progression</span>
                                    <span>{currentXp} XP</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-4 overflow-hidden shadow-inner border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressToNextLevel}%` }}
                                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                                    />
                                </div>
                                <p className="text-[11px] text-indigo-200 font-bold italic">
                                    Next level at {Math.ceil((currentXp + 1) / 1000) * 1000} XP
                                </p>
                            </div>
                        </div>
                    </BentoTile>

                    {/* Agent Briefing Tile */}
                    <BentoTile className="col-span-12 lg:col-span-7 bg-white dark:bg-slate-900 group">
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 flex-shrink-0 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] flex items-center justify-center relative overflow-hidden">
                                <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="text-5xl"
                                >
                                    🤖
                                </motion.div>
                                <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Kiko's Daily Intel</span>
                                    <span className="text-[10px] font-bold text-slate-400">{dayjs().format('DD MMM YYYY')}</span>
                                </div>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3">Siap beraksi hari ini?</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed italic border-l-4 border-emerald-500 pl-4 bg-emerald-50/50 dark:bg-emerald-900/10 py-3 rounded-r-xl">
                                    {agentBriefing?.message || "Kiko sedang menganalisa data produktivitasmu. Tetap fokus!"}
                                </p>
                                <div className="mt-4 flex gap-3">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                                        <WalletIcon className="w-4 h-4" />
                                        <span>Wallet: {(pointsBalance || 0).toLocaleString()} XP</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </BentoTile>
                </div>

                {/* Weekly Journey - Full Width */}
                <WeeklyJourney auth={auth} />

                {/* 2. MAIN ROW: Challenges & Leaderboard */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Active Challenges Tile */}
                    <BentoTile className="col-span-12 lg:col-span-8 group">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="text-xl font-[1000] text-slate-900 dark:text-white flex items-center gap-2">
                                <FireIcon className="w-6 h-6 text-orange-500" />
                                Active Ops <span className="text-slate-400 text-sm font-bold ml-2">({challenges.length})</span>
                            </h3>
                            <Link href={route('tasks.index')} className="text-xs font-black text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                                View Missions <ChevronRightIcon className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {challenges.length > 0 ? challenges.map((challenge, idx) => (
                                <motion.div
                                    key={challenge.id}
                                    whileHover={{ y: -2 }}
                                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden group/card"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-lg shadow-sm">
                                            {challenge.type === 'daily' ? '🔥' : '💪'}
                                        </div>
                                        <span className="text-[10px] font-black bg-orange-500 text-white px-3 py-1 rounded-full shadow-lg shadow-orange-500/20">
                                            +{challenge.xp_reward} XP
                                        </span>
                                    </div>
                                    <h5 className="font-black text-slate-900 dark:text-white text-sm mb-1">{challenge.title}</h5>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mb-4 line-clamp-1">{challenge.description}</p>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                            <span>Progress</span>
                                            <span>{challenge.progress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${challenge.progress}%` }}
                                                className="h-full bg-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="col-span-2 py-12 text-center">
                                    <SparklesIcon className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold">No active ops. Complete tasks to unlock!</p>
                                </div>
                            )}
                        </div>
                    </BentoTile>

                    {/* Leaderboard Tile */}
                    <BentoTile
                        useGlass={false}
                        className="col-span-12 lg:col-span-4 bg-slate-900 dark:bg-black text-white p-0 overflow-hidden"
                    >
                        <div className="p-8 pb-4">
                            <h3 className="text-xl font-[1000] flex items-center gap-2">
                                <RocketLaunchIcon className="w-6 h-6 text-indigo-400" />
                                Top Agents
                            </h3>
                        </div>
                        <div className="px-2 space-y-1">
                            {leaderboard.slice(0, 5).map((entry, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${idx === 0 ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-white/5'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/20' : 'bg-slate-800'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black truncate">{entry.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Level {entry.level}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-[1000] text-indigo-400">{(entry.xp || 0).toLocaleString()}</p>
                                        <p className="text-[9px] font-black text-slate-500">TOTAL XP</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-4 text-center border-t border-white/5">
                            <Link href="#" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
                                View Full Rankings
                            </Link>
                        </div>
                    </BentoTile>
                </div>

                {/* 3. BOTTOM ROW: Achievements */}
                <BentoTile className="group">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <h3 className="text-xl font-[1000] text-slate-900 dark:text-white flex items-center gap-2">
                            <StarIcon className="w-6 h-6 text-yellow-500" />
                            Collection Hall <span className="text-slate-400 text-sm font-bold ml-2">({achievements.filter(a => a.unlocked).length}/{achievements.length})</span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                        {achievements.map((achievement) => (
                            <motion.div
                                key={achievement.id}
                                whileHover={{ scale: 1.05 }}
                                className={`flex flex-col items-center justify-center p-6 rounded-[2.5rem] border transition-all relative overflow-hidden group/badge
                                    ${achievement.unlocked
                                        ? 'bg-white dark:bg-slate-800 border-yellow-500/20 shadow-xl shadow-yellow-500/5'
                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 grayscale opacity-60'
                                    }`}
                            >
                                <div className={`w-20 h-20 rounded-[2rem] mb-4 flex items-center justify-center text-4xl shadow-inner transition-transform duration-500 group-hover/badge:rotate-12
                                    ${achievement.unlocked ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-slate-200 dark:bg-slate-800'}`}
                                >
                                    {achievement.icon || '🏆'}
                                </div>
                                <h5 className="font-black text-[13px] text-center text-slate-900 dark:text-white mb-1 line-clamp-1">{achievement.name}</h5>
                                <div className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter
                                    ${achievement.rarity === 'legendary' ? 'bg-purple-100 text-purple-600' :
                                        achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-600' :
                                            'bg-slate-100 text-slate-600'}`}
                                >
                                    {achievement.rarity}
                                </div>

                                {!achievement.unlocked && (
                                    <div className="absolute inset-0 bg-black/5 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover/badge:opacity-100 transition-opacity">
                                        <AcademicCapIcon className="w-8 h-8 text-slate-400" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </BentoTile>
            </div>
        </AuthenticatedLayout>
    );
}
