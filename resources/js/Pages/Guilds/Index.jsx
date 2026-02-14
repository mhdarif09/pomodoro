import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import debounce from 'lodash/debounce'; // Inertia typically includes lodash or we can use custom
import {
    UserGroupIcon,
    PlusIcon,
    TrophyIcon,
    MagnifyingGlassIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function GuildIndex({ auth, guilds, userGuild, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        emblem: '🏰',
        is_private: false
    });
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Debounce search
    const performSearch = useCallback(
        debounce((query) => {
            router.get(route('guilds.index'), { search: query }, { preserveState: true, replace: true });
        }, 500),
        []
    );

    useEffect(() => {
        // Only trigger if searchTerm changed from initial filters to avoid double load? 
        // Actually better to just bind input to local state and debounce the router call
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        performSearch(value);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('guilds.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            }
        });
    };

    const handleJoin = (guildId) => {
        if (confirm('Are you sure you want to join this guild?')) {
            // Use Inertia router for post request outside of form
            // Or create a form on the fly? Better to use useForm or router
            // Since it's a simple action, we can import router
            // But let's keep it simple
            // We'll create a simple form helper if needed, or import router
        }
    };

    // Helper to send post request
    const sendJoinRequest = (guildId) => {
        // Inertia link as method="post" works too, or use router
        // For now we'll use a form component or just Link with as="button" method="post"
    };

    return (
        <AuthenticatedLayout>
            <Head title="Guilds" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* Hero Section */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-emerald-900 text-white shadow-2xl">
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

                        <div className="relative p-10 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-2xl">
                                <h1 className="text-4xl sm:text-5xl font-[900] tracking-tight mb-4">
                                    Join a Guild. <br />
                                    <span className="text-emerald-300">Conquer Together.</span>
                                </h1>
                                <p className="text-lg text-emerald-100 font-medium leading-relaxed mb-8 max-w-lg">
                                    Collaborate on missions, compete in weekly leaderboards, and boost your productivity with social accountability.
                                </p>

                                {userGuild ? (
                                    <Link
                                        href={route('guilds.show', userGuild.id)}
                                        className="apple-button px-8 py-4 bg-white text-emerald-900 font-bold shadow-xl shadow-emerald-900/20 hover:bg-emerald-50"
                                    >
                                        Go to My Guild
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="apple-button px-8 py-4 bg-teal-400 text-emerald-950 font-bold shadow-xl shadow-teal-400/20 hover:bg-teal-300"
                                    >
                                        <PlusIcon className="w-5 h-5 mr-2" />
                                        Create New Guild
                                    </button>
                                )}
                            </div>

                            <div className="hidden md:block">
                                <div className="w-64 h-64 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-all duration-500 shadow-2xl">
                                    <span className="text-8xl">🏰</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search guilds..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Join by Code */}
                        {!userGuild && (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const code = e.target.elements.code.value;
                                if (code) router.post(route('guilds.join-code'), { invite_code: code });
                            }} className="relative sm:w-64">
                                <input
                                    name="code"
                                    type="text"
                                    placeholder="Enter Invite Code"
                                    className="w-full pl-4 pr-12 py-4 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white uppercase tracking-widest font-mono"
                                    maxLength={8}
                                />
                                <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl flex items-center justify-center transition-colors">
                                    <ArrowRightIcon className="w-5 h-5" />
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Guild Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {guilds.data.map(guild => (
                            <div key={guild.id} className="group bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-4xl shadow-inner">
                                        {guild.emblem}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Members</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${guild.is_full ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {guild.member_count}/{guild.max_members}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{guild.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 min-h-[40px]">
                                    {guild.description || 'No description provided.'}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                                        <TrophyIcon className="w-4 h-4" />
                                        <span>{guild.total_xp} XP</span>
                                    </div>

                                    {!userGuild && !guild.is_full && (
                                        <Link
                                            href={route('guilds.join', guild.id)}
                                            method="post"
                                            as="button"
                                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                                        >
                                            Join Guild
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6">
                        {guilds.prev_page_url ? (
                            <Link href={guilds.prev_page_url} className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-2">
                                <ChevronLeftIcon className="w-4 h-4" /> Previous
                            </Link>
                        ) : <div></div>}

                        {guilds.next_page_url && (
                            <Link href={guilds.next_page_url} className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-2">
                                Next <ChevronRightIcon className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create New Guild</h2>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Guild Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                                    placeholder="e.g. Pomodoro Masters"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Emblem</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {['🏰', '⚔️', '🛡️', '🦁', '🦅', '🐺', '🐉', '⚡', '🌟', '💎'].map(emoji => (
                                        <button
                                            type="button"
                                            key={emoji}
                                            onClick={() => setData('emblem', emoji)}
                                            className={`h-10 rounded-lg flex items-center justify-center text-xl transition-all ${data.emblem === emoji ? 'bg-emerald-100 border-2 border-emerald-500' : 'hover:bg-slate-100'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                                    rows="3"
                                    placeholder="Tell us about your guild..."
                                />
                            </div>

                            {/* Privacy Toggle */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Privacy</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setData('is_private', false)}
                                        className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${!data.is_private ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'}`}
                                    >
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <UserGroupIcon className="w-5 h-5" /> Public
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">Anyone can see and request to join.</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('is_private', true)}
                                        className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${data.is_private ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'}`}
                                    >
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <ShieldCheckIcon className="w-5 h-5" /> Private
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">Hidden from list. Invite code only.</div>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Guild'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
