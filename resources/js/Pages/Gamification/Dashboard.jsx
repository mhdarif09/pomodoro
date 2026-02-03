import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import XPBar from '@/Components/Gamification/XPBar';
import LevelBadge from '@/Components/Gamification/LevelBadge';
import ChallengeCard from '@/Components/Gamification/ChallengeCard';
import AchievementBadge from '@/Components/Gamification/AchievementBadge';
import LeaderboardTable from '@/Components/Gamification/LeaderboardTable';
import CashbackRedemptionModal from '@/Components/Gamification/CashbackRedemptionModal';
import AgentWidget from '@/Components/Gamification/AgentWidget';
import { TrophyIcon, FireIcon, StarIcon, TicketIcon } from '@heroicons/react/24/solid';

export default function Dashboard({ auth, challenges, achievements, leaderboard, userRank, pointsBalance, agentBriefing }) {
    const user = auth.user;
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [currentPoints, setCurrentPoints] = useState(pointsBalance || 0);

    const stats = [
        { label: 'Total XP', value: user.total_xp.toLocaleString(), icon: <StarIcon className="w-5 h-5 sm:w-6 sm:h-6" />, color: 'from-amber-400 to-orange-400' },
        { label: 'Current Streak', value: `${user.current_streak} days`, icon: <FireIcon className="w-5 h-5 sm:w-6 sm:h-6" />, color: 'from-red-400 to-orange-500' },
        { label: 'Global Rank', value: `#${userRank}`, icon: <TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6" />, color: 'from-emerald-500 to-teal-500' },
        {
            label: 'Poin Tersedia',
            value: currentPoints.toLocaleString(),
            icon: <TicketIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
            color: 'from-blue-400 to-indigo-500',
            action: (
                <button
                    onClick={() => setIsRedeemModalOpen(true)}
                    className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-md transition-colors mt-1 font-bold"
                >
                    Tukar
                </button>
            )
        },
    ];

    const handleRedeemSuccess = (remainingPoints) => {
        setCurrentPoints(remainingPoints);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gamifikasi" />

            <CashbackRedemptionModal
                isOpen={isRedeemModalOpen}
                onClose={() => setIsRedeemModalOpen(false)}
                pointsBalance={currentPoints}
                onRedeemSuccess={handleRedeemSuccess}
            />

            {/* Scrollable Container - Same as Chapter Reading */}
            <div className="h-full overflow-y-auto scrollbar-hide">
                <div className="py-6 sm:py-12 bg-gradient-to-b from-emerald-50/50 to-transparent min-h-screen">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="mb-6 sm:mb-8">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[900] tracking-tighter text-slate-900 mb-2">🎮 Gamifikasi</h1>
                            <p className="text-sm sm:text-base text-slate-600 font-medium">Level up, unlock achievements, dan compete dengan pemain lain!</p>
                        </div>

                        {/* Agent Widget */}
                        <AgentWidget briefing={agentBriefing} />

                        {/* Level & XP Overview */}
                        <div className="mb-6 sm:mb-8 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl">
                            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 sm:gap-8">
                                <LevelBadge level={user.level} levelTitle={user.level_title} size="lg" />
                                <div className="flex-1 w-full">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4 text-center md:text-left">Progress ke Level {user.level + 1}</h2>
                                    <XPBar
                                        currentXP={user.xp}
                                        xpForNextLevel={user.xp_for_next_level || 150}
                                        level={user.level}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <div className="text-xl sm:text-2xl font-black text-slate-900">{stat.value}</div>
                                            <div className="text-xs sm:text-sm text-slate-600 font-semibold">{stat.label}</div>
                                            {stat.action}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Active Challenges */}
                        <div className="mb-6 sm:mb-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">⚡ Active Challenges</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {challenges && challenges.length > 0 ? (
                                    challenges.map((challenge) => (
                                        <ChallengeCard
                                            key={challenge.id}
                                            challenge={challenge}
                                            progress={challenge.progress || 0}
                                            completed={challenge.completed || false}
                                        />
                                    ))
                                ) : (
                                    <div className="lg:col-span-2 p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white/40 backdrop-blur-xl border border-white/40 text-center text-slate-500">
                                        Tidak ada challenge aktif saat ini. Check back soon!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="mb-6 sm:mb-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">🏅 Achievements</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                                {achievements && achievements.length > 0 ? (
                                    achievements.map((achievement) => (
                                        <AchievementBadge
                                            key={achievement.id}
                                            achievement={achievement}
                                            unlocked={achievement.unlocked || false}
                                            unlockedAt={achievement.unlocked_at}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white/40 backdrop-blur-xl border border-white/40 text-center text-slate-500 text-sm sm:text-base">
                                        Mulai selesaikan tasks untuk unlock achievements!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div className="mb-6 sm:mb-8 pb-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">🏆 Global Leaderboard</h2>
                            <div className="rounded-xl sm:rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
                                {leaderboard && leaderboard.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <LeaderboardTable users={leaderboard} currentUserId={user.id} />
                                    </div>
                                ) : (
                                    <div className="p-6 sm:p-8 text-center text-slate-500 text-sm sm:text-base">
                                        Leaderboard kosong. Be the first to compete!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
