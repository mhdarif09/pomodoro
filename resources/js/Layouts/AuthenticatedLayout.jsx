import React, { useState, useEffect, Fragment } from 'react';
import { Menu, Disclosure, Transition } from '@headlessui/react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bars3Icon, XMarkIcon, HomeIcon, BookOpenIcon, CreditCardIcon,
    DocumentTextIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon,
    SparklesIcon, LockClosedIcon, ChartBarIcon, TrophyIcon,
    ArrowRightOnRectangleIcon, LanguageIcon, QuestionMarkCircleIcon, TicketIcon,
    ShieldCheckIcon, BriefcaseIcon, UserGroupIcon, ChevronDownIcon,
    PlusIcon, CheckIcon, PlusCircleIcon, MagnifyingGlassIcon, TrashIcon, Cog6ToothIcon, FireIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import ApplicationLogo from '@/Components/ApplicationLogo';
import WhatsAppWarningModal from '@/Components/WhatsAppWarningModal';
import TutorialGuide from '@/Components/TutorialGuide';
import ShortcutsHelpModal from '@/Components/ShortcutsHelpModal';
import UpgradeModal from '@/Components/UpgradeModal';
import InviteMemberModal from '@/Components/InviteMemberModal';
import { useLanguage } from '@/Contexts/LanguageContext';
import useKeyboardShortcuts from '@/Hooks/useKeyboardShortcuts';

// Avatar Component
const UserAvatar = ({ user }) => {
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-600 dark:bg-slate-700 dark:text-slate-300 ring-2 ring-white dark:ring-slate-800 shadow-sm">
            {initials}
        </div>
    );
};

export default function Authenticated({ children, header }) {
    const { props } = usePage();
    const { auth, plans } = props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('sidebar_collapsed') === 'true';
        return true; // Default collapsed for Notion-like feel
    });
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const { guild: activeGuild } = usePage().props; // Get active guild from Inertia props if available
    const user = auth.user;
    const { t, toggleLanguage, language } = useLanguage();

    // User's Guilds (mapped to "Teams" concept)
    const userGuilds = user.guilds || [];

    const [workspaceMode, setWorkspaceMode] = useState(() => {
        return activeGuild || route().current('guilds.*') ? 'guild' : 'personal';
    });

    const [currentGuild, setCurrentGuild] = useState(() => {
        if (activeGuild) return activeGuild;
        if (userGuilds.length > 0) return userGuilds[0];
        return null;
    });

    // Sync state with active route/prop changes
    useEffect(() => {
        if (activeGuild) {
            setWorkspaceMode('guild');
            setCurrentGuild(activeGuild);
        } else if (route().current('guilds.*')) {
            setWorkspaceMode('guild');
        } else {
            setWorkspaceMode('personal');
        }
    }, [activeGuild, window.location.href]);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar_collapsed', newState);
    };

    // Global Shortcuts
    useKeyboardShortcuts({
        'Alt+Digit1': () => router.visit(route('dashboard')),
        'Alt+Digit2': () => router.visit(route('gamification.dashboard')),
        'Alt+Digit3': () => router.visit(route('ai-assistant.index')),
        'Alt+Digit4': () => router.visit(route('learning.index')),
        'Alt+Digit5': () => router.visit(route('docs.index')),
        'Shift+Slash': () => setShowShortcuts(prev => !prev)
    });

    const navStructure = [
        {
            type: 'group',
            label: 'Private',
            icon: <UserIcon className="h-5 w-5" />,
            items: [
                { routeName: 'dashboard', label: t('nav_dashboard'), icon: <HomeIcon className="h-4 w-4" /> },
                ...(user.active_plan?.has_ai_genius_access ? [{ routeName: 'ai-assistant.index', label: t('nav_ai_genius'), icon: <SparklesIcon className="h-4 w-4" /> }] : []),
                { routeName: 'gamification.dashboard', label: t('nav_gamification'), icon: <TrophyIcon className="h-4 w-4" /> },
                { routeName: 'transactions.history', label: t('nav_wallet'), icon: <CreditCardIcon className="h-4 w-4" /> },
            ]
        },
        {
            type: 'group',
            label: 'Workspace',
            icon: <BriefcaseIcon className="h-5 w-5" />,
            items: [
                { routeName: 'learning.index', label: t('nav_learning'), icon: <BookOpenIcon className="h-4 w-4" /> },
                { routeName: 'reports.index', label: t('nav_reports'), icon: <ChartBarIcon className="h-4 w-4" /> },
                { routeName: 'docs.index', label: t('nav_docs'), icon: <DocumentTextIcon className="h-4 w-4" /> },
            ]
        },
        {
            type: 'group',
            label: 'Community',
            icon: <UserGroupIcon className="h-5 w-5" />,
            items: [
                { routeName: 'guilds.index', label: 'Guilds', icon: <ShieldCheckIcon className="h-4 w-4" /> },
                { routeName: 'affiliate.dashboard', label: 'Affiliate', icon: <TicketIcon className="h-4 w-4" /> },
            ]
        },
    ];

    const isRouteActive = (item) => {
        if (item.type === 'link') return route().current(item.routeName);
        if (item.type === 'group') return item.items.some(sub => route().current(sub.routeName));
        return false;
    };

    return (
        <div className="flex h-screen bg-[#F5F5F7] dark:bg-[#000000] overflow-hidden text-slate-900 dark:text-white font-sans selection:bg-teal-500 selection:text-white">
            <WhatsAppWarningModal />
            <TutorialGuide setSidebarOpen={setSidebarOpen} />
            <ShortcutsHelpModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                plans={plans || []}
            />
            <InviteMemberModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                guild={currentGuild}
            />

            {/* Desktop Sidebar */}
            {/* Desktop Sidebar - Notion Style */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? '72px' : '240px' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="hidden sm:flex flex-col m-3 mr-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 rounded-2xl relative z-20 shadow-sm"
            >
                {/* Header Workspace Switcher */}
                <div className="px-2 pt-3 pb-2">
                    <Menu as="div" className="relative">
                        <Menu.Button className="w-full hover:bg-black/5 dark:hover:bg-white/5 rounded-lg p-1.5 flex items-center gap-2 transition-colors text-left group">
                            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 text-[10px] font-bold text-white shadow-sm ring-1 ring-black/5">
                                {workspaceMode === 'personal' ? user.name.charAt(0) : (currentGuild?.name?.charAt(0) || 'G')}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-slate-700 dark:text-slate-200">
                                        {workspaceMode === 'personal' ? `${user.name.split(' ')[0]}'s Notion` : (currentGuild?.name || 'Select Guild')}
                                    </p>
                                </div>
                            )}
                            {!isCollapsed && (
                                <ChevronDownIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                            )}
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
                            <Menu.Items className="absolute left-2 right-2 top-full mt-1 z-50 origin-top-left rounded-xl bg-white dark:bg-[#1C1C1E] shadow-xl ring-1 ring-black/5 focus:outline-none divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700">
                                <div className="p-1">
                                    <div className="px-2 py-1 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                        Personal
                                    </div>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => {
                                                    setWorkspaceMode('personal');
                                                    router.visit(route('dashboard'));
                                                }}
                                                className={`${active ? 'bg-slate-50 dark:bg-white/5' : ''
                                                    } group flex w-full items-center rounded-lg px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200`}
                                            >
                                                <UserIcon className="mr-2 h-4 w-4 text-slate-400" />
                                                {user.name}'s Notion
                                                {workspaceMode === 'personal' && <CheckIcon className="ml-auto h-4 w-4 text-teal-500" />}
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                                <div className="p-1">
                                    <div className="px-2 py-1 text-[10px] flex justify-between items-center text-slate-400 uppercase tracking-wider">
                                        <span>Guilds</span>
                                        <Link href={route('guilds.index')} className="hover:text-teal-500"><PlusIcon className="h-3 w-3" /></Link>
                                    </div>
                                    {userGuilds.map((guild) => (
                                        <Menu.Item key={guild.id}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => {
                                                        setWorkspaceMode('guild');
                                                        setCurrentGuild(guild);
                                                        router.visit(route('guilds.show', guild.id));
                                                    }}
                                                    className={`${active ? 'bg-slate-50 dark:bg-white/5' : ''
                                                        } group flex w-full items-center rounded-lg px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200`}
                                                >
                                                    <div className="mr-2 flex h-4 w-4 items-center justify-center rounded bg-emerald-500 text-[8px] text-white font-bold">
                                                        {guild.name.charAt(0)}
                                                    </div>
                                                    {guild.name}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                href={route('guilds.index')}
                                                className={`${active ? 'bg-slate-50 dark:bg-white/5' : ''
                                                    } group flex w-full items-center rounded-lg px-2 py-1.5 text-sm text-slate-500`}
                                            >
                                                <PlusCircleIcon className="mr-2 h-4 w-4 text-slate-400" />
                                                Join or Create Guild
                                            </Link>
                                        )}
                                    </Menu.Item>
                                </div>
                                <div className="p-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className={`${active ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'text-slate-500'
                                                    } group flex w-full items-center rounded-lg px-2 py-1.5 text-sm`}
                                            >
                                                <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4 opacity-50" />
                                                Log Out
                                            </Link>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>

                {/* Quick Actions (Search, New Page) */}
                <div className="px-2 pb-2 space-y-0.5">
                    <button onClick={() => setShowShortcuts(true)} className="w-full flex items-center gap-2 px-2 py-1 text-sm text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors group">
                        <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                        {!isCollapsed && <span className="font-medium text-slate-600 dark:text-slate-400">Search</span>}
                        {!isCollapsed && <span className="ml-auto text-[10px] border border-slate-200 dark:border-slate-700 rounded px-1.5 text-slate-400 bg-slate-50 dark:bg-slate-800">Ctrl K</span>}
                    </button>
                    {!isCollapsed && (
                        <div className="flex items-center gap-2 px-2 py-1 text-sm text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors cursor-pointer group">
                            <PlusCircleIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                            <span className="font-medium text-slate-600 dark:text-slate-400">New Page</span>
                        </div>
                    )}
                </div>

                {/* Scrollable Navigation */}
                <nav className="flex-1 overflow-y-auto px-2 space-y-6 pt-2 scrollbar-hide">
                    {/* Favorites / Shortcuts - Shared */}
                    <div>
                        {!isCollapsed && <div className="px-2 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Favorites</div>}
                        <div className="space-y-0.5">
                            <Link href={route('dashboard')} className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('dashboard') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                <HomeIcon className="h-4 w-4" />
                                {!isCollapsed && <span>Dashboard</span>}
                            </Link>
                            {user.active_plan?.has_ai_genius_access && (
                                <Link href={route('ai-assistant.index')} className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('ai-assistant.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                    <SparklesIcon className="h-4 w-4 text-amber-500" />
                                    {!isCollapsed && <span>AI Genius</span>}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Context Specific Navigation */}
                    {workspaceMode === 'personal' ? (
                        <div>
                            {!isCollapsed && <div className="px-2 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Private</div>}
                            <div className="space-y-0.5">
                                <Link
                                    href={route('tasks.index')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors group ${route().current('tasks.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <DocumentTextIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>My Tasks</span>}
                                </Link>
                                <Link
                                    href={route('journal.index')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors group ${route().current('journal.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <BookOpenIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>Journal</span>}
                                </Link>
                                <Link
                                    href={route('transactions.history')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('transactions.history') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <CreditCardIcon className="h-4 w-4" />
                                    {!isCollapsed && <span>Wallet</span>}
                                </Link>
                                <Link
                                    href={route('gamification.dashboard')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('gamification.dashboard') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <TrophyIcon className="h-4 w-4" />
                                    {!isCollapsed && <span>Gamification</span>}
                                </Link>
                                <Link
                                    href={route('affiliate.dashboard')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('affiliate.dashboard') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <TicketIcon className="h-4 w-4" />
                                    {!isCollapsed && <span>Affiliate</span>}
                                </Link>
                                <Link
                                    href={route('reports.index')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('reports.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <ChartBarIcon className="h-4 w-4" />
                                    {!isCollapsed && <span>Report</span>}
                                </Link>
                                <Link
                                    href={route('upgrade.index')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors group ${route().current('upgrade.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <SparklesIcon className="h-4 w-4 text-amber-400 group-hover:text-amber-500" />
                                    {!isCollapsed && <span>Upgrade Plan</span>}
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {!isCollapsed && <div className="px-2 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Guild Workspace</div>}
                            <div className="space-y-0.5">
                                <Link
                                    href={currentGuild ? route('guilds.show', currentGuild.id) : route('guilds.index')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors group ${route().current('guilds.show') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <BriefcaseIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>Overview</span>}
                                </Link>
                                <Link
                                    href={currentGuild ? route('guilds.tasks.index', currentGuild.id) : '#'}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors group ${route().current('guilds.tasks.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <DocumentTextIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>Tasks</span>}
                                </Link>
                                <Link
                                    href={currentGuild ? route('guilds.challenges.index', currentGuild.id) : '#'}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('guilds.challenges.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <FireIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>Missions</span>}
                                </Link>
                                <Link
                                    href={currentGuild ? route('guilds.members.index', currentGuild.id) : '#'}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('guilds.members.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <UserGroupIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>Members</span>}
                                </Link>
                                <Link
                                    href={currentGuild ? route('guilds.report', currentGuild.id) : '#'}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('guilds.report') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <ChartBarIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>Reports</span>}
                                </Link>
                                <Link
                                    href={route('guilds.index')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('guilds.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <ShieldCheckIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>Guilds</span>}
                                </Link>
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 px-2 py-1 rounded-md text-sm text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                                >
                                    <UserGroupIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>Team Members</span>}
                                </Link>

                                {!isCollapsed && (
                                    <div className="mt-2">
                                        <button
                                            onClick={() => setShowInviteModal(true)}
                                            className="w-full flex items-center gap-2 px-2 py-1 text-sm text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors group"
                                        >
                                            <div className="h-4 w-4 flex items-center justify-center rounded-full border border-dashed border-slate-400 text-slate-400 hover:border-slate-600 hover:text-slate-600">
                                                <PlusIcon className="h-3 w-3" />
                                            </div>
                                            <span>Invite Member</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Shared Bottom Section */}
                    <div>
                        {!isCollapsed && <div className="px-2 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Library</div>}
                        <div className="space-y-0.5">
                            <Disclosure as="div">
                                {({ open }) => (
                                    <>
                                        <Disclosure.Button className="w-full flex items-center px-2 py-1 text-sm text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors group text-left">
                                            <ChevronRightIcon className={`h-3 w-3 mr-2 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
                                            {!isCollapsed && <span>Archives</span>}
                                        </Disclosure.Button>
                                        <Disclosure.Panel className="pl-6 space-y-0.5 pt-0.5">
                                            {!isCollapsed && (
                                                <>
                                                    <div className="flex items-center gap-2 px-2 py-1 text-xs text-slate-500 hover:bg-black/5 rounded-md cursor-pointer">
                                                        <TrashIcon className="h-3 w-3" />
                                                        <span>Trash</span>
                                                    </div>
                                                </>
                                            )}
                                        </Disclosure.Panel>
                                    </>
                                )}
                            </Disclosure>

                            <Link
                                href={route('docs.index')}
                                className="flex items-center gap-2 px-2 py-1 rounded-md text-sm text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                            >
                                <BookOpenIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                {!isCollapsed && <span>Templates</span>}
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Footer User Profile & Actions */}
                <div className="p-2 border-t border-slate-200/50 dark:border-slate-700/50 mt-auto">
                    {!isCollapsed ? (
                        <Link href={route('profile.edit')} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                            <UserAvatar user={user} className="h-5 w-5 text-[9px]" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate text-slate-700 dark:text-slate-200">{user.name}</p>
                            </div>
                            <Cog6ToothIcon className="h-4 w-4 text-slate-400" />
                        </Link>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <UserAvatar user={user} />
                        </div>
                    )}
                </div>

                {/* Collapse Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-teal-500 transition-colors z-30 opacity-0 group-hover:opacity-100 dark:hover:bg-slate-700"
                >
                    {isCollapsed ? <ChevronRightIcon className="w-3 h-3" /> : <ChevronLeftIcon className="w-3 h-3" />}
                </button>
            </motion.aside>

            {/* Mobile & Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Header */}
                <header className="sm:hidden flex items-center justify-between px-6 pt-6 pb-2 z-30">
                    <div className="flex items-center gap-3">
                        <ApplicationLogo className="h-8 w-auto text-teal-500 fill-current" />
                        <span className="font-black text-lg tracking-tight">SarangTumbuh</span>
                    </div>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm ios-btn">
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto scrollbar-hide p-0 sm:p-4">
                    <div className="w-full max-w-[1600px] mx-auto relative">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:hidden"
                    >
                        <motion.div
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="absolute left-0 top-0 bottom-0 w-[80%] max-w-[300px] bg-[#F5F5F7] dark:bg-[#1c1c1e] h-full shadow-2xl p-6 flex flex-col overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black tracking-tight">Menu</h2>
                                <div className="flex gap-2">
                                    <button onClick={toggleLanguage} className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase">
                                        {language}
                                    </button>
                                    <button onClick={() => setSidebarOpen(false)}><XMarkIcon className="w-8 h-8" /></button>
                                </div>
                            </div>
                            <nav className="space-y-4 flex-1">
                                {/* Workspace Switcher Mobile */}
                                <div className="px-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                                    <Menu as="div" className="relative">
                                        <Menu.Button className="w-full bg-white dark:bg-slate-800 rounded-xl p-3 flex items-center gap-3 shadow-sm border border-slate-100 dark:border-slate-700">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-xs font-bold text-white shadow-sm">
                                                {workspaceMode === 'personal' ? user.name.charAt(0) : (currentGuild?.name || 'G').charAt(0)}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                                    {workspaceMode === 'personal' ? 'Personal' : (currentGuild?.name || 'Select Guild')}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Workspace</p>
                                            </div>
                                            <ChevronDownIcon className="h-5 w-5 text-slate-400" />
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
                                            <Menu.Items className="absolute left-0 right-0 top-full mt-2 z-50 origin-top bg-white dark:bg-[#1C1C1E] rounded-xl shadow-2xl ring-1 ring-black/5 focus:outline-none divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => { setWorkspaceMode('personal'); setSidebarOpen(false); router.visit(route('dashboard')); }}
                                                            className={`${active ? 'bg-slate-50 dark:bg-white/5' : ''} w-full flex items-center px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200`}
                                                        >
                                                            <UserIcon className="mr-3 h-5 w-5 text-slate-400" />
                                                            Personal
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                                {userGuilds.map((guild) => (
                                                    <Menu.Item key={guild.id}>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => {
                                                                    setWorkspaceMode('guild');
                                                                    setCurrentGuild(guild);
                                                                    setSidebarOpen(false);
                                                                    router.visit(route('guilds.show', guild.id));
                                                                }}
                                                                className={`${active ? 'bg-slate-50 dark:bg-white/5' : ''} w-full flex items-center px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200`}
                                                            >
                                                                <div className="mr-3 flex h-5 w-5 items-center justify-center rounded bg-emerald-500 text-[9px] text-white font-bold">
                                                                    {guild.name.charAt(0)}
                                                                </div>
                                                                {guild.name}
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                ))}
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href={route('guilds.index')}
                                                            onClick={() => setSidebarOpen(false)}
                                                            className={`${active ? 'bg-slate-50 dark:bg-white/5' : ''
                                                                } group flex w-full items-center px-4 py-3 text-sm font-bold text-slate-500`}
                                                        >
                                                            <PlusCircleIcon className="mr-3 h-5 w-5 text-slate-400" />
                                                            Join or Create Guild
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>

                                {/* Navigation Items Mobile */}
                                <div className="space-y-1 px-2">
                                    <Link href={route('dashboard')} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold ${route().current('dashboard') ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400' : 'text-slate-500'}`}>
                                        <HomeIcon className="h-5 w-5" />
                                        Dashboard
                                    </Link>
                                    {user.active_plan?.has_ai_genius_access && (
                                        <Link href={route('ai-assistant.index')} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold ${route().current('ai-assistant.index') ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400' : 'text-slate-500'}`}>
                                            <SparklesIcon className="h-5 w-5 text-amber-500" />
                                            AI Genius
                                        </Link>
                                    )}

                                    {workspaceMode === 'personal' ? (
                                        <>
                                            <Link href={route('tasks.index')} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${route().current('tasks.index') ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                                                <DocumentTextIcon className="h-5 w-5" />
                                                My Tasks
                                            </Link>
                                            <Link href={route('journal.index')} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${route().current('journal.index') ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                                                <BookOpenIcon className="h-5 w-5" />
                                                Journal
                                            </Link>
                                            <Link href={route('transactions.history')} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${route().current('transactions.history') ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400' : 'text-slate-500'}`}>
                                                <CreditCardIcon className="h-5 w-5" />
                                                Wallet
                                            </Link>
                                            <Link href={route('reports.index')} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${route().current('reports.index') ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400' : 'text-slate-500'}`}>
                                                <ChartBarIcon className="h-5 w-5" />
                                                Report
                                            </Link>
                                            <Link href={route('upgrade.index')} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${route().current('upgrade.index') ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                                                <SparklesIcon className="h-5 w-5 text-amber-400" />
                                                Upgrade Plan
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link href={currentGuild ? route('guilds.show', currentGuild.id) : route('guilds.index')} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5">
                                                <BriefcaseIcon className="h-5 w-5" />
                                                Guild Overview
                                            </Link>
                                            <Link href={currentGuild ? route('guilds.challenges.index', currentGuild.id) : '#'} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5">
                                                <FireIcon className="h-5 w-5" />
                                                Missions
                                            </Link>
                                            <Link href={currentGuild ? route('guilds.tasks.index', currentGuild.id) : '#'} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5">
                                                <DocumentTextIcon className="h-5 w-5" />
                                                Tasks
                                            </Link>
                                            <Link href={currentGuild ? route('guilds.members.index', currentGuild.id) : '#'} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5">
                                                <UserGroupIcon className="h-5 w-5" />
                                                Members
                                            </Link>
                                            <button
                                                onClick={() => { setSidebarOpen(false); setShowInviteModal(true); }}
                                                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
                                            >
                                                <PlusIcon className="h-5 w-5" />
                                                Invite Member
                                            </button>
                                        </>
                                    )}

                                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                                        <p className="px-4 mb-2 text-xs font-black text-slate-400 uppercase tracking-widest">Library</p>
                                        <Link href={route('docs.index')} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5">
                                            <BookOpenIcon className="h-5 w-5" />
                                            Templates
                                        </Link>
                                        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5">
                                            <TrashIcon className="h-5 w-5" />
                                            Trash
                                        </button>
                                    </div>
                                </div>

                                <Link href={route('logout')} method="post" as="button" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-bold text-red-500 mt-8">
                                    <ArrowRightOnRectangleIcon className="w-6 h-6" /> {t('logout')}
                                </Link>
                            </nav>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}