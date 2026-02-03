import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { ShieldCheckIcon, UserGroupIcon, TrophyIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/solid';

export default function GuildDashboard({ auth, guild, members, quests }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-extrabold text-2xl text-slate-900 dark:text-white">Markas Guild</h2>}
        >
            <Head title={guild.name} />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Guild Banner / Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] p-8 text-white mb-8 shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Level {guild.level}</span>
                            <span className="px-3 py-1 bg-emerald-500/80 rounded-full text-xs font-bold font-mono tracking-widest backdrop-blur-sm">CODE: {guild.invite_code}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4">{guild.name}</h1>
                        <p className="text-indigo-100 max-w-2xl text-lg">{guild.description || "Bersama kita kuat, sendiri kita... kurang kuat."}</p>
                    </div>
                    <TrophyIcon className="absolute -bottom-6 -right-6 w-64 h-64 text-white/10 rotate-12" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Quests */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2 mb-4">
                                <ClipboardDocumentCheckIcon className="w-6 h-6 text-emerald-500" />
                                Misi Guild Aktif
                            </h3>

                            <div className="grid gap-4">
                                {quests.length > 0 ? quests.map(quest => (
                                    <div key={quest.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-lg dark:text-white">{quest.title}</h4>
                                                <p className="text-slate-500 text-sm">Reward: <span className="text-amber-500 font-bold">+{quest.reward_xp} XP Guild</span></p>
                                            </div>
                                            <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                                                Expires in {Math.ceil((new Date(quest.expires_at) - new Date()) / (1000 * 60 * 60 * 24))} days
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-2 flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            <span>Progress</span>
                                            <span>{quest.current_progress} / {quest.target_amount} {quest.target_type === 'minutes_focused' ? 'mins' : ''}</span>
                                        </div>
                                        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-1000"
                                                style={{ width: `${Math.min(100, (quest.current_progress / quest.target_amount) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                        <p className="text-slate-500">Tidak ada misi aktif saat ini.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat / Feed Placeholder */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold mb-4 dark:text-white">P papan Pengumuman</h3>
                            <div className="space-y-4">
                                <p className="text-slate-500 italic text-center text-sm">Fitur chat guild akan segera hadir...</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Stats & Members */}
                    <div className="space-y-8">
                        {/* Stats */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold dark:text-white mb-4">Statistik Guild</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b dark:border-slate-700">
                                    <span className="text-slate-500">Total XP</span>
                                    <span className="font-bold text-amber-500">{guild.total_xp.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b dark:border-slate-700">
                                    <span className="text-slate-500">Anggota</span>
                                    <span className="font-bold dark:text-white">{members.length} / {guild.capacity}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-500">Rank Global</span>
                                    <span className="font-bold text-indigo-500">#1 (Alpha)</span>
                                </div>
                            </div>
                        </div>

                        {/* Members List */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                                <UserGroupIcon className="w-5 h-5 text-indigo-500" />
                                Anggota
                            </h3>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                {members.map((member, index) => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold dark:text-white truncate">
                                                {member.name}
                                                {member.id === auth.user.id && <span className="ml-1 text-slate-400">(You)</span>}
                                            </p>
                                            <p className="text-xs text-slate-500">Lvl {member.level} • {member.pivot.role}</p>
                                        </div>
                                        {member.pivot.role === 'leader' && <ShieldCheckIcon className="w-4 h-4 text-amber-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
