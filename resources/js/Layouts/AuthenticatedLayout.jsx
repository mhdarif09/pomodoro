import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    BookOpenIcon,
    ClockIcon,
    CreditCardIcon,
    DocumentTextIcon,
    UserIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

import ApplicationLogo from '@/Components/ApplicationLogo';
import WhatsAppWarningModal from '@/Components/WhatsAppWarningModal';
import TutorialGuide from '@/Components/TutorialGuide';

const UserAvatar = ({ user }) => {
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {initials}
        </div>
    );
};

export default function Authenticated({ children, header }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebar_collapsed') === 'true';
    });

    const { auth } = usePage().props;
    const user = auth.user;

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar_collapsed', newState);
    };

    // --- HEARTBEAT TRACKING ---
    useEffect(() => {
        if (!user) return;

        const sendHeartbeat = () => {
            // Only send if the page is visible to avoid counting time when tab is backgrounded
            if (document.visibilityState === 'visible') {
                axios.post(route('api.heartbeat')).catch(err => console.error('Heartbeat failed', err));
            }
        };

        // Send immediately on mount
        sendHeartbeat();

        // Then every 60 seconds
        const interval = setInterval(sendHeartbeat, 60000);

        return () => clearInterval(interval);
    }, [user]);

    const navLinks = [
        { routeName: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="h-5 w-5" />, id: 'dashboard-nav' },
        { routeName: 'ai-assistant.index', label: 'AI Assistant', icon: <SparklesIcon className="h-5 w-5" />, id: 'ai-nav' },
        { routeName: 'learning.index', label: 'Learning', icon: <BookOpenIcon className="h-5 w-5" />, id: 'learning-nav' },
        { routeName: 'transactions.history', label: 'History', icon: <CreditCardIcon className="h-5 w-5" />, id: 'history-nav' },
        { routeName: 'docs.index', label: 'Documents', icon: <DocumentTextIcon className="h-5 w-5" />, id: 'documents-nav' },
    ];

    const sidebarVariants = {
        hidden: { x: '-100%' },
        visible: { x: 0, transition: { duration: 0.2 } },
        exit: { x: '-100%', transition: { duration: 0.15 } },
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <WhatsAppWarningModal />
            <TutorialGuide setSidebarOpen={setSidebarOpen} />

            {/* Sidebar Desktop */}
            <motion.aside
                initial={false}
                animate={{
                    width: isCollapsed ? '68px' : '240px',
                    transition: { type: 'spring', stiffness: 350, damping: 35 }
                }}
                className="hidden sm:flex sm:flex-col sm:border-r sm:border-slate-200 dark:sm:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden relative"
            >
                <div className={`flex h-16 items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} border-b border-slate-100 dark:border-slate-800`}>
                    {!isCollapsed && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                            <ApplicationLogo className="h-7 w-auto fill-current text-teal-600 dark:text-teal-400" />
                            <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">Sarang<span className="text-teal-500">Tumbuh</span></span>
                        </motion.div>
                    )}
                    {isCollapsed && (
                        <ApplicationLogo className="h-6 w-auto fill-current text-teal-600 dark:text-teal-400" />
                    )}

                    <button
                        onClick={toggleSidebar}
                        className="p-1 rounded-full text-slate-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all absolute -right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 z-10 hidden lg:flex items-center justify-center shadow-sm"
                    >
                        {isCollapsed ? <ChevronRightIcon className="h-3 w-3" /> : <ChevronLeftIcon className="h-3 w-3" />}
                    </button>
                </div>


                <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
                    {navLinks.map((link) => {
                        // Skip AI Assistant for non-premium users
                        if (link.routeName === 'ai-assistant.index' && !user.is_premium) {
                            return null;
                        }

                        return (
                            <Link
                                key={link.routeName}
                                id={link.id}
                                href={route(link.routeName)}
                                title={isCollapsed ? link.label : ''}
                                className={`flex items-center rounded-xl transition-all duration-300 group
                                    ${isCollapsed ? 'justify-center p-2' : 'px-3 py-2'}
                                    ${route().current(link.routeName)
                                        ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'
                                    }`}
                            >
                                <div className={`${!isCollapsed ? 'mr-3' : ''} transition-all duration-300 group-hover:scale-110`}>
                                    {link.icon}
                                </div>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-[13px] font-bold truncate tracking-tight"
                                    >
                                        {link.label}
                                    </motion.span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-100 dark:border-slate-800 p-3.5 bg-slate-50/30 dark:bg-slate-800/10">
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} mb-3.5`}>
                        <div className="relative group/avatar">
                            <UserAvatar user={user} className="w-8 h-8" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                        </div>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 min-w-0"
                            >
                                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
                                <div className="text-[9px] font-black text-teal-600 dark:text-teal-400 truncate uppercase tracking-widest leading-none mt-0.5">{user.role || 'Member'}</div>
                            </motion.div>
                        )}
                    </div>

                    <div className={`flex ${isCollapsed ? 'flex-col items-center gap-2' : 'gap-1.5'}`}>
                        <Link
                            href={route('profile.edit')}
                            title="Edit Profile"
                            className={`flex items-center justify-center rounded-xl transition-all font-bold tracking-tight
                                ${isCollapsed
                                    ? 'h-9 w-9 bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600 dark:bg-slate-800 dark:text-slate-400'
                                    : 'flex-1 py-1.5 text-[10px] bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600 dark:bg-slate-800 dark:text-slate-400'}`}
                        >
                            {isCollapsed ? <UserIcon className="h-4 w-4" /> : 'Profil'}
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            title="Keluar"
                            className={`flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white transition-all font-bold tracking-tight
                                ${isCollapsed ? 'h-9 w-9' : 'flex-1 py-1.5 text-[10px]'}`}
                        >
                            {isCollapsed ? <XMarkIcon className="h-4 w-4" /> : 'Keluar'}
                        </Link>
                    </div>
                </div>
            </motion.aside>


            {/* Sidebar Mobile */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        className="fixed inset-0 z-50 flex sm:hidden bg-black/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-64 bg-white dark:bg-slate-900 h-full flex flex-col"
                            variants={sidebarVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                                <ApplicationLogo className="h-8 w-auto fill-current text-teal-600 dark:text-teal-400" />
                                <button onClick={() => setSidebarOpen(false)} className="text-slate-600 dark:text-slate-300 p-1">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
                                {navLinks.map((link) => {
                                    if (link.routeName === 'ai-assistant.index' && !user.is_premium) {
                                        return null;
                                    }
                                    return (
                                        <Link
                                            key={link.routeName}
                                            id={`mobile-${link.id}`}
                                            href={route(link.routeName)}
                                            className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                                            ${route().current(link.routeName)
                                                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-200'
                                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                                                }`}
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            {link.icon}
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex-shrink-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <UserAvatar user={user} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex-1 text-center px-2 py-1.5 text-xs font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        Edit Profile
                                    </Link>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex-1 text-center px-2 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors"
                                    >
                                        Keluar
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Konten Utama */}
            <div className="flex-1 flex flex-col">
                {/* Header Mobile */}
                <header className="sm:hidden flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <button id="mobile-menu-button" onClick={() => setSidebarOpen(true)} className="text-slate-600 dark:text-slate-300">
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <ApplicationLogo className="h-9 w-auto fill-current text-teal-600 dark:text-teal-400" />
                    <div className="w-6" />
                </header>

                {header && (
                    <div className="bg-white dark:bg-slate-800 shadow-sm">
                        <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8">{header}</div>
                    </div>
                )}

                <main className="flex-1 p-4">{children}</main>
            </div>
        </div>
    );
}
