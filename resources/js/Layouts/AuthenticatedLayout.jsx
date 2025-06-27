import { useState, useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link } from '@inertiajs/react';

// A simple, modern avatar component to display user initials
const UserAvatar = ({ user }) => {
    // Generates the first two initials from the user's name
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2);

    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {initials}
        </div>
    );
};

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    
    // An array to hold our navigation links for easier management
    const navLinks = [
        { routeName: 'dashboard', label: 'Dashboard' },
        { routeName: 'pomodoro.index', label: 'Pomodoro' },
        { routeName: 'transactions.history', label: 'History' },
    ];
    
    const adminLinks = [
        { routeName: 'admin.plans.index', label: 'Premium Plans' }
    ];

    // Midtrans script logic - remains unchanged as it's a background task
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://app.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY); // Use standard VITE client key
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900">
            {/* --- MODERN STICKY NAVBAR --- */}
            <nav className="sticky top-0 z-40 w-full border-b border-slate-900/10 bg-white/80 backdrop-blur-sm dark:border-slate-300/10 dark:bg-slate-900/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo and Main Navigation Links */}
                        <div className="flex items-center gap-6">
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-slate-800 dark:text-slate-200" />
                            </Link>
                            <div className="hidden items-center gap-4 sm:flex">
                                {navLinks.map((link) => (
                                    <NavLink key={link.routeName} href={route(link.routeName)} active={route().current(link.routeName)}>
                                        {link.label}
                                    </NavLink>
                                ))}
                                {user.role === 'admin' && adminLinks.map((link) => (
                                    <NavLink key={link.routeName} href={route(link.routeName)} active={route().current(link.routeName)}>
                                        {link.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        {/* User Dropdown and Mobile Menu Button */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex sm:items-center">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button type="button" className="flex rounded-full transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800">
                                            <UserAvatar user={user} />
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="right" width="48">
                                        <div className="px-4 py-2">
                                            <div className="text-base font-semibold text-slate-800 dark:text-slate-200">{user.name}</div>
                                            <div className="text-sm font-medium text-slate-500">{user.email}</div>
                                        </div>
                                        <div className="border-t border-slate-200 dark:border-slate-700" />
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            {/* Hamburger Menu Button */}
                            <div className="-me-2 flex items-center sm:hidden">
                                <button
                                    onClick={() => setShowingNavigationDropdown((prevState) => !prevState)}
                                    className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-400 dark:focus:bg-slate-800"
                                >
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MODERN RESPONSIVE NAVIGATION PANEL --- */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden absolute inset-x-0 top-16 z-30 origin-top-right transform p-2 transition'}>
                    <div className="divide-y-2 divide-slate-100/10 rounded-lg bg-white/95 shadow-lg ring-1 ring-black/5 backdrop-blur-sm dark:bg-slate-900/95">
                        <div className="space-y-1 p-5">
                            {navLinks.map((link) => (
                                <ResponsiveNavLink key={link.routeName} href={route(link.routeName)} active={route().current(link.routeName)}>
                                    {link.label}
                                </ResponsiveNavLink>
                            ))}
                            {user.role === 'admin' && adminLinks.map((link) => (
                               <ResponsiveNavLink key={link.routeName} href={route(link.routeName)} active={route().current(link.routeName)}>
                                    {link.label}
                                </ResponsiveNavLink>
                            ))}
                        </div>
                        <div className="p-5">
                            <div className="mb-3">
                                <div className="text-base font-medium text-slate-800 dark:text-slate-200">{user.name}</div>
                                <div className="text-sm font-medium text-slate-500">{user.email}</div>
                            </div>
                            <div className="space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                                <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                    Log Out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="border-b border-slate-200 dark:border-slate-700">
                    <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}