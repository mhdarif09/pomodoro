// File: resources/js/Layouts/AuthenticatedLayout.jsx (Final Polished Version)

import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';

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
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { auth } = usePage().props;
    const user = auth.user;

    const navLinks = [
        { routeName: 'dashboard', label: 'Dashboard' },
        { routeName: 'mini-moduls.index', label: 'Mini Modul' },
        { routeName: 'pomodoro.index', label: 'Pomodoro' },
        { routeName: 'transactions.history', label: 'History' },
    ];
    
    // Menggabungkan semua link navigasi yang akan ditampilkan di navbar desktop
    const allNavLinks = [...navLinks];

    // ----- PENTING: useEffect untuk Midtrans DIHAPUS DARI SINI -----
    // Layout tidak seharusnya bertanggung jawab memuat script spesifik.
    // Pindahkan logika ini ke komponen yang membutuhkan pembayaran, misal: UpgradeModal.jsx

    const mobileMenuVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.15, ease: 'easeIn' } },
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <nav className="sticky top-0 z-40 w-full border-b border-slate-900/10 bg-white/70 backdrop-blur-lg dark:border-slate-300/10 dark:bg-slate-900/70">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Kiri: Logo & Navigasi Desktop */}
                        <div className="flex items-center gap-2 sm:gap-6">
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto shrink-0 fill-current text-slate-800 dark:text-slate-200" />
                            </Link>
                            <div className="hidden items-center gap-1 sm:gap-2 lg:gap-4 sm:flex">
                                {allNavLinks.map((link) => (
                                    <NavLink key={link.routeName} href={route(link.routeName)} active={route().current(link.routeName)}>
                                        {link.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        {/* Kanan: Dropdown User (Desktop) & Tombol Hamburger (Mobile) */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button type="button" className="flex rounded-full transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800">
                                            <span className="sr-only">Buka menu pengguna</span>
                                            <UserAvatar user={user} />
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <div className="px-4 py-3">
                                            <div className="font-semibold text-base text-slate-800 dark:text-slate-200">{user.name}</div>
                                            <div className="font-medium text-sm text-slate-500">{user.email}</div>
                                        </div>
                                        <div className="border-t border-slate-200 dark:border-slate-700" />
                                        <Dropdown.Link href={route('profile.edit')}>Profil</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Keluar
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            <div className="-mr-2 flex items-center sm:hidden">
                                <button
                                    onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                    className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-100 focus:outline-none dark:hover:bg-slate-800 transition"
                                >
                                    <span className="sr-only">Buka menu utama</span>
                                    {showingNavigationDropdown ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Menu Dropdown Mobile yang Ditingkatkan --- */}
                <AnimatePresence>
                    {showingNavigationDropdown && (
                        <motion.div
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="sm:hidden"
                        >
                            <div className="space-y-1 pt-2 pb-3 px-2">
                                {allNavLinks.map((link) => (
                                    <ResponsiveNavLink key={link.routeName} href={route(link.routeName)} active={route().current(link.routeName)}>
                                        {link.label}
                                    </ResponsiveNavLink>
                                ))}
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 pb-3 px-2">
                                <div className="flex items-center px-4 mb-3">
                                    <div className="mr-3 shrink-0">
                                        <UserAvatar user={user} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-base text-slate-800 dark:text-slate-200">{user.name}</div>
                                        <div className="font-medium text-sm text-slate-500">{user.email}</div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <ResponsiveNavLink href={route('profile.edit')}>Profil</ResponsiveNavLink>
                                    <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                        Keluar
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {header && (
                <header className="bg-white dark:bg-slate-800 shadow-sm">
                    <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>
                {children}
            </main>
        </div>
    );
}