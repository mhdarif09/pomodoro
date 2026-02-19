// File: resources/js/Layouts/AuthenticatedLayout.jsx (Admin Sidebar Version)

import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
// Impor ikon-ikon baru yang keren
import {
    Bars3Icon, XMarkIcon, HomeIcon, UserGroupIcon, DocumentTextIcon, CreditCardIcon, ChartBarIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, TicketIcon, BanknotesIcon
} from '@heroicons/react/24/outline';

const UserAvatar = ({ user }) => {
    const initials = user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {initials}
        </div>
    );
};

// --- Komponen Baru untuk Sidebar ---
const SidebarNavLink = ({ href, active, children, icon: Icon }) => (
    <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-150 ${active
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
    >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="font-medium">{children}</span>
    </Link>
);


export default function Authenticated({ children, header }) {
    // State untuk mengontrol sidebar di tampilan mobile
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { auth } = usePage().props;
    const user = auth.user;

    // Definisikan semua kemungkinan link di sini dengan ikonnya
    const navLinks = [
        { routeName: 'dashboard', label: 'Dashboard', icon: HomeIcon, for: 'user' },
        // Anda bisa menambahkan link user lainnya di sini
    ];

    const adminLinks = [
        { routeName: 'admin.dashboard', label: 'Dashboard Admin', icon: ChartBarIcon, for: 'admin' },
        { routeName: 'admin.users.index', label: 'Manajemen User', icon: UserGroupIcon, for: 'admin' },
        { routeName: 'admin.cashouts.index', label: 'Cashouts', icon: BanknotesIcon, for: 'admin' },
        { routeName: 'admin.mini-moduls.index', label: 'Manajemen Modul', icon: DocumentTextIcon, for: 'admin' },
        { routeName: 'admin.plans.index', label: 'Manajemen Plan', icon: CreditCardIcon, for: 'admin' },
        { routeName: 'admin.promos.index', label: 'Manajemen Promo', icon: TicketIcon, for: 'admin' }
    ];

    // Cek apakah user adalah admin
    const isAdmin = user.role === 'admin';

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/20 via-slate-100 to-slate-100 dark:from-indigo-900/20 dark:via-slate-900 dark:to-slate-900">
            {/* ----- SIDEBAR ----- */}
            <AnimatePresence>
                {isAdmin && (
                    <>
                        {/* Sidebar Desktop (fixed) */}
                        <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl lg:flex supports-[backdrop-filter]:bg-white/50">
                            <nav className="flex flex-col gap-y-5 p-4">
                                <Link href="/" className="flex items-center gap-x-3.5 py-4 px-2.5">
                                    <ApplicationLogo className="block h-9 w-auto shrink-0 fill-current text-slate-800 dark:text-slate-200" />
                                    <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Admin Panel</span>
                                </Link>

                                <div className="flex flex-1 flex-col gap-y-7">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-2">
                                        {adminLinks.map(link => (
                                            <li key={link.routeName}>
                                                <SidebarNavLink href={route(link.routeName)} active={route().current(link.routeName)} icon={link.icon}>
                                                    {link.label}
                                                </SidebarNavLink>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <hr className="border-slate-200 dark:border-slate-700" />
                                <SidebarNavLink href={route('dashboard')} icon={ArrowRightOnRectangleIcon}>Kembali ke App</SidebarNavLink>
                            </nav>
                        </aside>

                        {/* Overlay untuk Sidebar Mobile */}
                        {sidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setSidebarOpen(false)}
                                className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
                            />
                        )}

                        {/* Sidebar Mobile (slide-in) */}
                        {sidebarOpen && (
                            <motion.aside
                                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-xl lg:hidden"
                            >
                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-4">
                                    <Link href="/">
                                        <ApplicationLogo className="block h-8 w-auto shrink-0 fill-current" />
                                    </Link>
                                    <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                                        <XMarkIcon className="h-6 w-6 text-slate-500" />
                                    </button>
                                </div>
                                <nav className="flex flex-col gap-y-5 p-4">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-1">
                                        {adminLinks.map(link => (
                                            <li key={link.routeName}>
                                                <SidebarNavLink href={route(link.routeName)} active={route().current(link.routeName)} icon={link.icon}>
                                                    {link.label}
                                                </SidebarNavLink>
                                            </li>
                                        ))}
                                    </ul>
                                    <hr className="border-slate-200 dark:border-slate-700" />
                                    <SidebarNavLink href={route('dashboard')} icon={ArrowRightOnRectangleIcon}>Kembali ke App</SidebarNavLink>
                                </nav>
                            </motion.aside>
                        )}
                    </>
                )}
            </AnimatePresence>

            {/* ----- KONTEN UTAMA ----- */}
            <div className={isAdmin ? 'lg:pl-64' : ''}>
                {/* --- Header Atas --- */}
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200/50 bg-white/70 px-4 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/70 sm:gap-x-6 sm:px-6 lg:px-8">
                    {isAdmin && (
                        <button onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-slate-700 dark:text-slate-300 lg:hidden">
                            <span className="sr-only">Buka sidebar</span>
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                    )}

                    {/* Render Judul Halaman */}
                    <div className="flex-1 text-sm font-semibold leading-6 text-slate-900 dark:text-white">
                        {header}
                    </div>

                    {/* Jika BUKAN ADMIN, tampilkan link navigasi user biasa di header */}
                    {!isAdmin && (
                        <div className="hidden lg:flex lg:gap-x-4">
                            {navLinks.map(link => (
                                <NavLink key={link.routeName} href={route(link.routeName)} active={route().current(link.routeName)}>
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-x-4 lg:gap-x-6">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button type="button" className="-m-1.5 flex items-center p-1.5 rounded-full transition focus:outline-none focus:ring-2 focus:ring-purple-500">
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
                                <Dropdown.Link href={route('profile.edit')}><Cog6ToothIcon className="h-4 w-4 mr-2 inline-block" /> Profil</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button"><ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 inline-block" /> Keluar</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                <main className="py-10">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Flash Messages */}
                        {usePage().props.flash?.success && (
                            <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">{usePage().props.flash.success}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {usePage().props.flash?.error && (
                            <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">{usePage().props.flash.error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}