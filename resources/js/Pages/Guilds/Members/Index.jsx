import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    UserGroupIcon, EllipsisHorizontalIcon, ShieldCheckIcon,
    UserIcon, TrashIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function GuildMembersIndex({ auth, guild, members }) {
    const isLeader = guild.leader_id === auth.user.id;

    const handleKick = (member) => {
        if (confirm(`Are you sure you want to kick ${member.name}?`)) {
            router.delete(route('guilds.members.destroy', [guild.id, member.id]));
        }
    };

    const handleRoleUpdate = (member, newRole) => {
        router.put(route('guilds.members.update', [guild.id, member.id]), {
            role: newRole
        });
    };

    return (
        <AuthenticatedLayout header={null}>
            <Head title={`${guild.name} - Members`} />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 font-sans text-slate-900 dark:text-white">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserGroupIcon className="w-8 h-8 text-indigo-500" />
                        Guild Members
                        <span className="text-sm px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                            {members.length}
                        </span>
                    </h1>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Member</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contribution</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {members.map(member => (
                                <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                                                {member.avatar ? (
                                                    <img src={`/storage/${member.avatar}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    member.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">{member.name}</div>
                                                <div className="text-xs text-slate-500">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${member.role === 'leader' ? 'bg-amber-100 text-amber-700' :
                                                member.role === 'officer' ? 'bg-indigo-100 text-indigo-700' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500">
                                        {member.joined_at}
                                    </td>
                                    <td className="p-4 text-sm font-mono text-emerald-600 font-bold">
                                        {member.contribution_xp} XP
                                    </td>
                                    <td className="p-4 text-right relative">
                                        {isLeader && member.id !== auth.user.id ? (
                                            <Menu as="div" className="relative inline-block text-left">
                                                <Menu.Button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400">
                                                    <EllipsisHorizontalIcon className="w-5 h-5" />
                                                </Menu.Button>
                                                <Transition
                                                    as={Fragment}
                                                    enter="transition ease-out duration-100"
                                                    enterFrom="transform opacity-0 scale-95"
                                                    enterTo="transform opacity-100 scale-100"
                                                    leave="transition ease-in duration-75"
                                                    leaveFrom="transform opacity-100 scale-100"
                                                    leaveTo="transform opacity-0 scale-95"
                                                >
                                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-slate-100 dark:divide-slate-700">
                                                        <div className="p-1">
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => handleRoleUpdate(member, member.role === 'officer' ? 'member' : 'officer')}
                                                                        className={`${active ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'} group flex w-full items-center rounded-lg px-2 py-2 text-sm font-medium`}
                                                                    >
                                                                        <ShieldCheckIcon className="mr-2 h-4 w-4" />
                                                                        {member.role === 'officer' ? 'Demote to Member' : 'Promote to Officer'}
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                        </div>
                                                        <div className="p-1">
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => handleKick(member)}
                                                                        className={`${active ? 'bg-red-50 dark:bg-red-500/20 text-red-600' : 'text-red-500'} group flex w-full items-center rounded-lg px-2 py-2 text-sm font-medium`}
                                                                    >
                                                                        <TrashIcon className="mr-2 h-4 w-4" />
                                                                        Kick Member
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                        </div>
                                                    </Menu.Items>
                                                </Transition>
                                            </Menu>
                                        ) : (
                                            <span className="text-xs text-slate-300 italic">No actions</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
