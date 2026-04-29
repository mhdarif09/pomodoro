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
    PlusIcon, CheckIcon, PlusCircleIcon, MagnifyingGlassIcon, TrashIcon, Cog6ToothIcon, FireIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import ApplicationLogo from '@/Components/ApplicationLogo';
import WhatsAppWarningModal from '@/Components/WhatsAppWarningModal';
import TutorialGuide from '@/Components/TutorialGuide';
import ShortcutsHelpModal from '@/Components/ShortcutsHelpModal';
import UpgradeModal from '@/Components/UpgradeModal';
import InviteMemberModal from '@/Components/InviteMemberModal';
import InAppNotificationPopup from '@/Components/InAppNotificationPopup';
import PomodoroIsland from '@/Components/Pomodoro/PomodoroIsland';
import GamificationPopup from '@/Components/GamificationPopup';
import StreakShareModal from '@/Components/Gamification/StreakShareModal';
import { usePomodoroTimer } from '@/Contexts/PomodoroContext';
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
    const [showStreakModal, setShowStreakModal] = useState(false);
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

    const isLeader = activeGuild?.is_leader || currentGuild?.pivot?.role === 'leader';

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
                { routeName: 'paper-explorer', label: 'Paper Explorer', icon: <MagnifyingGlassIcon className="h-4 w-4" /> },
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
        <AuthenticatedLayoutInner auth={auth} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} showShortcuts={showShortcuts} setShowShortcuts={setShowShortcuts} showUpgradeModal={showUpgradeModal} setShowUpgradeModal={setShowUpgradeModal} plans={plans} navStructure={navStructure} isRouteActive={isRouteActive} workspaceMode={workspaceMode} setWorkspaceMode={setWorkspaceMode} currentGuild={currentGuild} setCurrentGuild={setCurrentGuild} isLeader={isLeader} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} showInviteModal={showInviteModal} setShowInviteModal={setShowInviteModal} user={user} userGuilds={userGuilds} showStreakModal={showStreakModal} setShowStreakModal={setShowStreakModal}>
            {children}
        </AuthenticatedLayoutInner>
    );
}

function AuthenticatedLayoutInner({ children, auth, isCollapsed, toggleSidebar, showShortcuts, setShowShortcuts, showUpgradeModal, setShowUpgradeModal, plans, navStructure, isRouteActive, workspaceMode, setWorkspaceMode, currentGuild, setCurrentGuild, isLeader, sidebarOpen, setSidebarOpen, showInviteModal, setShowInviteModal, user, userGuilds, showStreakModal, setShowStreakModal }) {
    const pomodoro = usePomodoroTimer();

    return (
        <div className="flex h-screen bg-[#F5F5F7] dark:bg-[#000000] overflow-hidden text-slate-900 dark:text-white font-sans selection:bg-emerald-500 selection:text-white" style={{ ['--mobile-bottom-nav-height']: '72px' }}>
            <InAppNotificationPopup />
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
            <StreakShareModal
                isOpen={showStreakModal}
                onClose={() => setShowStreakModal(false)}
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
                            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-[10px] font-bold text-white shadow-sm ring-1 ring-black/5">
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
                                                {workspaceMode === 'personal' && <CheckIcon className="ml-auto h-4 w-4 text-emerald-500" />}
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                                <div className="p-1">
                                    <div className="px-2 py-1 text-[10px] flex justify-between items-center text-slate-400 uppercase tracking-wider">
                                        <span>Guilds</span>
                                        <Link href={route('guilds.index')} className="hover:text-emerald-500"><PlusIcon className="h-3 w-3" /></Link>
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

                {/* Quick Actions (Search, New Page, Upgrade) */}
                <div className="px-2 pb-2 space-y-0.5">
                    <button onClick={() => setShowShortcuts(true)} className="w-full flex items-center gap-2 px-2 py-1 text-sm text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors group">
                        <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                        {!isCollapsed && <span className="font-medium text-slate-600 dark:text-slate-400">Search</span>}
                        {!isCollapsed && <span className="ml-auto text-[10px] border border-slate-200 dark:border-slate-700 rounded px-1.5 text-slate-400 bg-slate-50 dark:bg-slate-800">Ctrl K</span>}
                    </button>
                    {!user.active_plan?.is_premium && (
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-md transition-colors group"
                        >
                            <StarIcon className="h-4 w-4 text-amber-500 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                            {!isCollapsed && <span className="font-semibold">Upgrade to Premium</span>}
                            {!isCollapsed && <span className="ml-auto text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-medium">NEW</span>}
                        </button>
                    )}
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
                            <Link id="dashboard-nav" href={route('dashboard')} className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('dashboard') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                <HomeIcon className="h-4 w-4" />
                                {!isCollapsed && <span>Dashboard</span>}
                            </Link>
                            <Link id="learning-nav" href={route('learning.index')} className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('learning.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                <SparklesIcon className="h-4 w-4 text-amber-500" />
                                {!isCollapsed && <span>Learning Hub</span>}
                            </Link>
                            <Link id="paper-explorer-nav" href={route('paper-explorer')} className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('paper-explorer') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                {!isCollapsed && <span>Paper</span>}
                            </Link>
                            {user.active_plan?.has_ai_genius_access && (
                                <Link id="ai-genius-nav" href={route('ai-assistant.index')} className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('ai-assistant.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                    <SparklesIcon className="h-4 w-4 text-amber-500" />
                                    {!isCollapsed && <span>AI Genius</span>}
                                </Link>
                            )}
                            <button onClick={() => setShowStreakModal(true)} className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 group">
                                <FireIcon className="h-4 w-4 text-orange-500 group-hover:animate-pulse" />
                                {!isCollapsed && <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">Share Streak</span>}
                            </button>
                        </div>
                    </div>

                    {/* Context Specific Navigation */}
                    {workspaceMode === 'personal' ? (
                        <div>
                            {!isCollapsed && <div className="px-2 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Private</div>}
                            <div className="space-y-0.5">
                                <Link
                                    href={route('dashboard')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors group ${route().current('dashboard') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <HomeIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>Home</span>}
                                </Link>
                                <Link
                                    href={route('tasks.index')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors group ${route().current('tasks.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <DocumentTextIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>Tasks</span>}
                                </Link>
                                <Link
                                    href={route('journal.index')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors group ${route().current('journal.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <BookOpenIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>Journal</span>}
                                </Link>
                                <Link
                                    href={route('guilds.index')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors group ${route().current('guilds.index') || route().current('guilds.*') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <ShieldCheckIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>Guilds</span>}
                                </Link>
                                <Link
                                    href={route('profile.show')}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors group ${route().current('profile.show') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <UserIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                    {!isCollapsed && <span>Profile</span>}
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
                                {isLeader && (
                                    <Link
                                        href={currentGuild ? route('guilds.challenges.index', currentGuild.id) : '#'}
                                        className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${route().current('guilds.challenges.index') ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                    >
                                        <FireIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                        {!isCollapsed && <span>Missions</span>}
                                    </Link>
                                )}
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
                                    id="guilds-nav"
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
                                id="documents-nav"
                                href={route('docs.index')}
                                className="flex items-center gap-2 px-2 py-1 rounded-md text-sm text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                            >
                                <DocumentTextIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                {!isCollapsed && <span>Docs & Templates</span>}
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Footer User Profile & Actions */}
                <div className="p-2 border-t border-slate-200/50 dark:border-slate-700/50 mt-auto space-y-1">
                    {/* Upgrade Button - Desktop */}
                    {!user.active_plan?.is_premium && (
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-amber-50 dark:hover:bg-amber-500/10 cursor-pointer transition-colors group text-amber-600 dark:text-amber-400"
                        >
                            <div className="h-5 w-5 flex items-center justify-center rounded bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                                <StarIcon className="h-3 w-3" />
                            </div>
                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold truncate">Upgrade to Premium</p>
                                    </div>
                                    <span className="text-[9px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-medium">NEW</span>
                                </>
                            )}
                        </button>
                    )}
                    
                    {/* User Profile */}
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

                    {/* Logout Button - Desktop */}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={`w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer transition-colors text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        {!isCollapsed && (
                            <p className="text-xs font-medium">Log Out</p>
                        )}
                    </Link>
                </div>

                {/* Collapse Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors z-30 opacity-0 group-hover:opacity-100 dark:hover:bg-slate-700"
                >
                    {isCollapsed ? <ChevronRightIcon className="w-3 h-3" /> : <ChevronLeftIcon className="w-3 h-3" />}
                </button>
            </motion.aside>

            {/* Mobile & Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden overflow-x-hidden relative min-w-0">


                <main className="flex-1 overflow-y-auto scrollbar-hide p-2 sm:p-4 lg:p-5" style={{ paddingTop: pomodoro.activeTask ? '5rem' : '0', paddingBottom: 'calc(var(--mobile-bottom-nav-height) + env(safe-area-inset-bottom))' }}>
                    <div className="w-full max-w-[1680px] mx-auto relative">
                        {children}
                    </div>
                </main>

                {/* Global Pomodoro Island — persists across all pages */}
                <AnimatePresence>
                    {pomodoro.activeTask && (
                        <PomodoroIsland
                            taskTitle={pomodoro.activeTask.title}
                            secondsLeft={pomodoro.secondsLeft}
                            isRunning={pomodoro.isRunning}
                            totalDuration={pomodoro.totalDuration}
                            onStart={() => pomodoro.setIsRunning(true)}
                            onStop={() => pomodoro.stopSession(true)}
                            onReset={pomodoro.resetTimer}
                            onClose={pomodoro.closeTimer}
                            currentStreak={pomodoro.currentStreak}
                        />
                    )}
                </AnimatePresence>

                {/* Gamification Popup for Pomodoro Completion */}
                <GamificationPopup
                    isOpen={pomodoro.showGamificationPopup}
                    onClose={() => pomodoro.setShowGamificationPopup(false)}
                    data={pomodoro.gamificationData}
                />

                {/* ═══════ MOBILE BOTTOM NAV BAR (iOS-style) ═══════ */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
                    <div className="mx-3 mb-3">
                        <div className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl rounded-[22px] border border-emerald-100/50 dark:border-emerald-900/30 shadow-xl shadow-emerald-900/5 dark:shadow-black/30 px-2 py-2">
                            {workspaceMode === 'personal' ? (
                                <div className="flex items-center justify-around gap-0.5">
                                    {[
                                        { href: route('dashboard'), icon: <HomeIcon className="h-[22px] w-[22px]" />, label: 'Home', active: route().current('dashboard'), id: 'mobile-dashboard-nav' },
                                        { href: route('tasks.index'), icon: <DocumentTextIcon className="h-[22px] w-[22px]" />, label: 'Tasks', active: route().current('tasks.index'), id: 'mobile-tasks-nav' },
                                        { href: route('journal.index'), icon: <BookOpenIcon className="h-[22px] w-[22px]" />, label: 'Journal', active: route().current('journal.index'), id: 'mobile-journal-nav' },
                                        { href: route('paper-explorer'), icon: <MagnifyingGlassIcon className="h-[22px] w-[22px]" />, label: 'Paper', active: route().current('paper-explorer'), id: 'mobile-paper-nav' },
                                        { href: route('guilds.index'), icon: <ShieldCheckIcon className="h-[22px] w-[22px]" />, label: 'Guild', active: route().current('guilds.index') || route().current('guilds.*'), id: 'mobile-guilds-nav' },
                                    ].map((item, i) => (
                                        <Link key={i} href={item.href} id={item.id}
                                            className={`relative flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 ${item.active
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-slate-400 dark:text-slate-500'
                                                } px-3 py-1.5 rounded-2xl`}>
                                            <div className={`relative transition-transform duration-300 ${item.active ? 'scale-110 -translate-y-0.5' : ''}`}>
                                                {item.icon}
                                                {item.active && (
                                                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                                                )}
                                            </div>
                                            <span className={`text-[10px] mt-0.5 font-semibold tracking-tight transition-colors ${item.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                                {/* Compact action row below main icons to avoid crowding */}
                                <div className="mt-2 flex items-center justify-center gap-3 px-2">
                                    {!user.active_plan?.is_premium && (
                                        <button
                                            onClick={() => setShowUpgradeModal(true)}
                                            className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 text-xs font-semibold shadow-sm"
                                        >
                                            <StarIcon className="h-4 w-4" />
                                            Upgrade
                                        </button>
                                    )}
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium shadow-sm"
                                    >
                                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                        Log out
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center justify-around gap-0.5">
                                    {[
                                        { href: currentGuild ? route('guilds.show', currentGuild.id) : route('guilds.index'), icon: <HomeIcon className="h-[22px] w-[22px]" />, label: 'Guild', active: route().current('guilds.show'), id: 'mobile-guild-home-nav' },
                                        { href: currentGuild ? route('guilds.tasks.index', currentGuild.id) : '#', icon: <DocumentTextIcon className="h-[22px] w-[22px]" />, label: 'Tasks', active: route().current('guilds.tasks.index'), id: 'mobile-guild-tasks-nav' },
                                        ...(isLeader ? [{ href: currentGuild ? route('guilds.challenges.index', currentGuild.id) : '#', icon: <FireIcon className="h-[22px] w-[22px]" />, label: 'Missions', active: route().current('guilds.challenges.index'), id: 'mobile-guild-missions-nav' }] : []),
                                        { href: currentGuild ? route('guilds.members.index', currentGuild.id) : '#', icon: <UserGroupIcon className="h-[22px] w-[22px]" />, label: 'Members', active: route().current('guilds.members.index'), id: 'mobile-guild-members-nav' },
                                        { href: route('profile.show'), icon: <UserIcon className="h-[22px] w-[22px]" />, label: 'Profile', active: route().current('profile.show'), id: 'mobile-profile-nav-guild' },
                                    ].map((item, i) => (
                                        <Link key={i} href={item.href}
                                            className={`relative flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 ${item.active
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-slate-400 dark:text-slate-500'
                                                } px-3 py-1.5 rounded-2xl`}>
                                            <div className={`relative transition-transform duration-300 ${item.active ? 'scale-110 -translate-y-0.5' : ''}`}>
                                                {item.icon}
                                                {item.active && (
                                                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                                                )}
                                            </div>
                                            <span className={`text-[10px] mt-0.5 font-semibold tracking-tight transition-colors ${item.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                                {/* Compact action row below main icons to avoid crowding (guild mode) */}
                                <div className="mt-2 flex items-center justify-center gap-3 px-2">
                                    {!user.active_plan?.is_premium && (
                                        <button
                                            onClick={() => setShowUpgradeModal(true)}
                                            className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 text-xs font-semibold shadow-sm"
                                        >
                                            <StarIcon className="h-4 w-4" />
                                            Upgrade
                                        </button>
                                    )}
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium shadow-sm"
                                    >
                                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                        Log out
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
}
