// File: resources/js/Layouts/AuthenticatedLayout.jsx (Sidebar with Icons)
import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon, HomeIcon, BookOpenIcon, ClockIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import ApplicationLogo from '@/Components/ApplicationLogo';

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
        { routeName: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="h-5 w-5 mr-2" /> },
        { routeName: 'mini-moduls.index', label: 'Mini Modul', icon: <BookOpenIcon className="h-5 w-5 mr-2" /> },
        { routeName: 'pomodoro.index', label: 'Pomodoro', icon: <ClockIcon className="h-5 w-5 mr-2" /> },
        { routeName: 'transactions.history', label: 'History', icon: <CreditCardIcon className="h-5 w-5 mr-2" /> },
    ];

    const sidebarVariants = {
        hidden: { x: '-100%' },
        visible: { x: 0, transition: { duration: 0.2 } },
        exit: { x: '-100%', transition: { duration: 0.15 } },
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Sidebar Desktop */}
            <aside className="hidden sm:flex sm:flex-col sm:w-64 sm:border-r sm:border-slate-200 dark:sm:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex h-16 items-center justify-center border-b border-slate-200 dark:border-slate-700">
                    <ApplicationLogo className="h-9 w-auto fill-current text-purple-600 dark:text-purple-400" />
                </div>
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.routeName}
                            href={route(link.routeName)}
                            className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors
                                ${
                                    route().current(link.routeName)
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200'
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                                }`}
                        >
                            {link.icon}
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
                    <UserAvatar user={user} />
                    <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{user.email}</div>
                        <Link href={route('logout')} method="post" as="button" className="text-xs text-red-600 dark:text-red-400 hover:underline">
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
                            className="w-64 bg-white dark:bg-slate-900 h-full p-4"
                            variants={sidebarVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="flex items-center justify-between h-16 mb-4">
                                <ApplicationLogo className="h-9 w-auto fill-current text-purple-600 dark:text-purple-400" />
                                <button onClick={() => setSidebarOpen(false)} className="text-slate-600 dark:text-slate-300">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <nav className="space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.routeName}
                                        href={route(link.routeName)}
                                        className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors
                                        ${
                                            route().current(link.routeName)
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200'
                                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                                        }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        {link.icon}
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4 flex items-center gap-3">
                                <UserAvatar user={user} />
                                <div>
                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</div>
                                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{user.email}</div>
                                    <Link href={route('logout')} method="post" as="button" className="text-xs text-red-600 dark:text-red-400 hover:underline">
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
                    <button onClick={() => setSidebarOpen(true)} className="text-slate-600 dark:text-slate-300">
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <ApplicationLogo className="h-9 w-auto fill-current text-purple-600 dark:text-purple-400" />
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
