import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function GuildDivisionsIndex({ auth, guild, divisions, members }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingDivision, setEditingDivision] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        description: '',
    });

    const openCreate = () => {
        reset();
        setEditingDivision(null);
        setIsCreateOpen(true);
    };

    const openEdit = (division) => {
        setData({
            name: division.name,
            description: division.description || '',
        });
        setEditingDivision(division);
        setIsCreateOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingDivision) {
            put(route('guilds.divisions.update', [guild.id, editingDivision.id]), {
                onSuccess: () => setIsCreateOpen(false),
            });
        } else {
            post(route('guilds.divisions.store', guild.id), {
                onSuccess: () => setIsCreateOpen(false),
            });
        }
    };

    const handleDelete = (division) => {
        if (confirm('Are you sure you want to delete this division?')) {
            router.delete(route('guilds.divisions.destroy', [guild.id, division.id]));
        }
    };

    const handleAssignMember = (userId, divisionId) => {
        router.post(route('guilds.divisions.assign-member', guild.id), {
            user_id: userId,
            division_id: divisionId || null,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout header={null}>
            <Head title={`${guild.name} - Divisions`} />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 font-sans text-slate-900 dark:text-white">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserGroupIcon className="w-8 h-8 text-teal-500" />
                        Divisions & Roles
                    </h1>
                    {guild.leader?.id === auth.user.id && (
                         <button onClick={openCreate} className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-bold hover:bg-teal-600 transition-colors flex items-center gap-2">
                            <PlusIcon className="w-5 h-5" /> New Division
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Divisions List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {divisions.map(division => (
                                <div key={division.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{division.name}</h3>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(division)} className="p-1 text-slate-400 hover:text-teal-500"><PencilIcon className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(division)} className="p-1 text-slate-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 line-clamp-2">{division.description || 'No description provided.'}</p>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <UserGroupIcon className="w-4 h-4" />
                                        {division.members_count || 0} Members
                                    </div>
                                </div>
                            ))}
                            {divisions.length === 0 && (
                                <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400">
                                    No divisions created yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Member Assignment */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="font-bold text-lg mb-4">Member Assignments</h3>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {members.map(member => {
                                // Find guild pivot data
                                const guildMember = member.guild_members.find(gm => gm.guild_id === guild.id);
                                const currentDivisionId = guildMember?.division_id || '';

                                return (
                                    <div key={member.id} className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</div>
                                                <div className="text-xs text-slate-500 capitalize">{guildMember?.role || 'Member'}</div>
                                            </div>
                                        </div>
                                        <select 
                                            value={currentDivisionId}
                                            onChange={(e) => handleAssignMember(member.id, e.target.value)}
                                            className="text-xs border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 py-1 pl-2 pr-8 w-32 focus:ring-teal-500"
                                            disabled={auth.user.id !== guild.leader?.id && auth.user.id !== member.id /* Allow self-change? Maybe not. Only leader/admin usually. */}
                                        >
                                            <option value="">No Division</option>
                                            {divisions.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Create/Edit Modal */}
                <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                            {editingDivision ? 'Edit Division' : 'Create New Division'}
                        </h2>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <InputLabel value="Name" />
                                <TextInput 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full mt-1"
                                    placeholder="e.g. Recon Unit, Logistics"
                                />
                                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                            </div>
                            <div>
                                <InputLabel value="Description" />
                                <TextInput 
                                    value={data.description} 
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full mt-1"
                                    placeholder="Short description of responsibilities..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <SecondaryButton onClick={() => setIsCreateOpen(false)}>Cancel</SecondaryButton>
                                <PrimaryButton disabled={processing}>Save</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
