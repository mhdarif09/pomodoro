// File: resources/js/Layouts/AuthenticatedLayout.jsx (Sidebar with Icons)
import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon, HomeIcon, BookOpenIcon, ClockIcon, CreditCardIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';

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
    const { auth } = usePage().props;
    const user = auth.user;

    const navLinks = [
        { routeName: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="h-5 w-5 mr-2" />, id: 'dashboard-nav' },
        { routeName: 'learning.index', label: 'Learning', icon: <BookOpenIcon className="h-5 w-5 mr-2" />, id: 'learning-nav' },
        { routeName: 'transactions.history', label: 'History', icon: <CreditCardIcon className="h-5 w-5 mr-2" />, id: 'history-nav' },
        { routeName: 'docs.index', label: 'Documents', icon: <DocumentTextIcon className="h-5 w-5 mr-2" />, id: 'documents-nav' },
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
            <aside className="hidden sm:flex sm:flex-col sm:w-64 sm:border-r sm:border-slate-200 dark:sm:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex h-14 items-center justify-center border-b border-slate-200 dark:border-slate-700 px-4">
                    <ApplicationLogo className="h-8 w-auto fill-current text-teal-600 dark:text-teal-400" />
                </div>
                <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
                    {navLinks.map((link) => (
                        <Link
                            key={link.routeName}
                            id={link.id}
                            href={route(link.routeName)}
                            className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                                ${route().current(link.routeName)
                                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-200'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                                }`}
                        >
                            {link.icon}
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="border-t border-slate-200 dark:border-slate-700 p-3">
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
            </aside>


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
                                {navLinks.map((link) => (
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
                                ))}
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
