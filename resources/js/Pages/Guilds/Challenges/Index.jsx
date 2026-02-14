import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    PlusIcon, TrophyIcon, FireIcon, ClockIcon,
    PencilIcon, TrashIcon, CheckBadgeIcon
} from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { format } from 'date-fns';

export default function GuildChallengesIndex({ auth, guild, challenges }) {
    const isLeader = guild.leader_id === auth.user.id;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        title: '',
        description: '',
        xp_reward: 100,
        points_reward: 50,
        starts_at: '',
        ends_at: '',
    });

    const openCreate = () => {
        reset();
        setEditingChallenge(null);
        setIsCreateOpen(true);
    };

    const openEdit = (challenge) => {
        setData({
            title: challenge.title,
            description: challenge.description || '',
            xp_reward: challenge.xp_reward,
            points_reward: challenge.points_reward,
            starts_at: challenge.starts_at || '',
            ends_at: challenge.ends_at || '',
        });
        setEditingChallenge(challenge);
        setIsCreateOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingChallenge) {
            put(route('guilds.challenges.update', [guild.id, editingChallenge.id]), {
                onSuccess: () => setIsCreateOpen(false),
            });
        } else {
            post(route('guilds.challenges.store', guild.id), {
                onSuccess: () => setIsCreateOpen(false),
            });
        }
    };

    const handleDelete = (challenge) => {
        if (confirm('Delete this mission?')) {
            router.delete(route('guilds.challenges.destroy', [guild.id, challenge.id]));
        }
    };

    return (
        <AuthenticatedLayout header={null}>
            <Head title={`${guild.name} - Missions`} />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 font-sans text-slate-900 dark:text-white">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FireIcon className="w-8 h-8 text-orange-500" />
                        Guild Missions
                    </h1>
                    {isLeader && (
                        <button onClick={openCreate} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors flex items-center gap-2">
                            <PlusIcon className="w-5 h-5" /> New Mission
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative hover:shadow-md transition-all">
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isLeader && (
                                    <>
                                        <button onClick={() => openEdit(challenge)} className="p-1.5 text-slate-400 hover:text-indigo-500 bg-slate-100 dark:bg-slate-700 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(challenge)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-700 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                    <TrophyIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Mission</span>
                                    <h3 className="text-lg font-bold leading-tight">{challenge.title}</h3>
                                </div>
                            </div>

                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2">
                                {challenge.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex flex-col gap-1">
                                    <div className="text-xs text-slate-400 font-bold uppercase">Rewards</div>
                                    <div className="flex items-center gap-3 text-sm font-bold">
                                        <span className="text-amber-500 flex items-center gap-1"><CheckBadgeIcon className="w-4 h-4" /> {challenge.xp_reward} XP</span>
                                        <span className="text-indigo-500 flex items-center gap-1"><FireIcon className="w-4 h-4" /> {challenge.points_reward} Pts</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {challenge.completed_by_user ? (
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-1">
                                            <CheckBadgeIcon className="w-4 h-4" /> Completed
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {challenge.ends_at && (
                                                <div className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                                                    {format(new Date(challenge.ends_at), 'MMM d')}
                                                </div>
                                            )}
                                            {!isLeader && (
                                                <button
                                                    onClick={() => router.post(route('guilds.challenges.complete', [guild.id, challenge.id]))}
                                                    className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {challenges.length === 0 && (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                            <TrophyIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No active missions.</p>
                            {isLeader && <p className="text-sm text-slate-400">Create one to challenge your guild!</p>}
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                            {editingChallenge ? 'Edit Mission' : 'Create New Mission'}
                        </h2>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <InputLabel value="Title" />
                                <TextInput
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full mt-1"
                                    placeholder="e.g. Weekly Code Sprint"
                                    required
                                />
                                {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                            </div>
                            <div>
                                <InputLabel value="Description" />
                                <TextInput
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full mt-1"
                                    placeholder="Details about the mission..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="XP Reward" />
                                    <TextInput
                                        type="number"
                                        value={data.xp_reward}
                                        onChange={e => setData('xp_reward', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Points Reward" />
                                    <TextInput
                                        type="number"
                                        value={data.points_reward}
                                        onChange={e => setData('points_reward', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Starts At" />
                                    <TextInput
                                        type="date"
                                        value={data.starts_at}
                                        onChange={e => setData('starts_at', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Ends At" />
                                    <TextInput
                                        type="date"
                                        value={data.ends_at}
                                        onChange={e => setData('ends_at', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <SecondaryButton onClick={() => setIsCreateOpen(false)}>Cancel</SecondaryButton>
                                <PrimaryButton disabled={processing}>Save Mission</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
