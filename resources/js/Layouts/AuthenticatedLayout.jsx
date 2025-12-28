import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bars3Icon, XMarkIcon, HomeIcon, BookOpenIcon, CreditCardIcon,
    DocumentTextIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon,
    SparklesIcon, LockClosedIcon, ChartBarIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import ApplicationLogo from '@/Components/ApplicationLogo';
import WhatsAppWarningModal from '@/Components/WhatsAppWarningModal';
import TutorialGuide from '@/Components/TutorialGuide';

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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
    const { auth } = usePage().props;
    const user = auth.user;

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar_collapsed', newState);
    };

    useEffect(() => {
        if (!user) return;
        const sendHeartbeat = () => {
            if (document.visibilityState === 'visible') axios.post(route('api.heartbeat')).catch(console.error);
        };
        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const navLinks = [
        { routeName: 'dashboard', label: 'Markas', icon: <HomeIcon className="h-5 w-5" /> },
        { routeName: 'ai-assistant.index', label: 'AI Genius', icon: <SparklesIcon className="h-5 w-5" /> },
        { routeName: 'learning.index', label: 'Belajar', icon: <BookOpenIcon className="h-5 w-5" /> },
        { routeName: 'reports.index', label: 'Statistik', icon: <ChartBarIcon className="h-5 w-5" /> },
        { routeName: 'transactions.history', label: 'Dompet', icon: <CreditCardIcon className="h-5 w-5" /> },
        { routeName: 'docs.index', label: 'Arsip', icon: <DocumentTextIcon className="h-5 w-5" /> },
    ];

    return (
        // Background iOS Style (Light Mesh / Dark Deep)
        <div className="flex h-screen bg-[#F5F5F7] dark:bg-[#000000] overflow-hidden text-slate-900 dark:text-white font-sans selection:bg-teal-500 selection:text-white">
            <WhatsAppWarningModal />
            <TutorialGuide setSidebarOpen={setSidebarOpen} />

            {/* Desktop Sidebar (Floating Glass) */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? '88px' : '280px' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="hidden sm:flex flex-col m-4 mr-0 apple-glass rounded-[2.5rem] relative z-20"
            >
                {/* Header Logo */}
                <div className={`flex h-24 items-center ${isCollapsed ? 'justify-center' : 'px-8'} transition-all`}>
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3">
                            <ApplicationLogo className="h-9 w-auto text-teal-500 fill-current" />
                            <div>
                                <h1 className="text-lg font-black tracking-tighter leading-none">Sarang<span className="text-teal-500">Tumbuh</span></h1>
                                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Workspace</p>
                            </div>
                        </div>
                    ) : (
                        <ApplicationLogo className="h-8 w-auto text-teal-500 fill-current" />
                    )}
                </div>

                {/* Navigation Pills */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide py-2">
                    {navLinks.map((link) => {
                        const isActive = route().current(link.routeName);
                        return (
                            <Link
                                key={link.routeName}
                                href={route(link.routeName)}
                                title={isCollapsed ? link.label : ''}
                                className={`ios-btn flex items-center rounded-[1.2rem] transition-all duration-300 relative group overflow-hidden
                                    ${isCollapsed ? 'justify-center h-12 w-12 mx-auto' : 'px-5 py-3.5 h-12'}
                                    ${isActive 
                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-lg shadow-slate-900/10' 
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <div className={`relative z-10 ${isActive ? 'text-inherit' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                                    {link.icon}
                                </div>
                                
                                {!isCollapsed && (
                                    <span className="ml-4 text-[15px] font-bold tracking-tight z-10">{link.label}</span>
                                )}

                                {link.routeName === 'ai-assistant.index' && !user.is_premium && !isCollapsed && (
                                    <LockClosedIcon className="w-4 h-4 text-amber-500 ml-auto" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer User Profile */}
                <div className="p-4 mx-2 mb-2">
                    <div className={`apple-glass !border-0 !bg-white/50 dark:!bg-white/5 rounded-[1.8rem] p-1.5 flex items-center ${isCollapsed ? 'justify-center flex-col gap-3 py-4' : 'gap-3 pr-4'}`}>
                        <UserAvatar user={user} />
                        
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{user.name.split(' ')[0]}</p>
                                <p className="text-[10px] font-semibold text-teal-500 uppercase tracking-wider">{user.role || 'PRO MEMBER'}</p>
                            </div>
                        )}

                        <Link href={route('logout')} method="post" as="button" className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors ios-btn">
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Collapse Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-teal-500 transition-colors z-30"
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
                    {/* Main Content Container */}
                    <div className="h-full w-full max-w-[1600px] mx-auto sm:rounded-[2.5rem] sm:overflow-hidden relative">
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
                            className="absolute left-0 top-0 bottom-0 w-[80%] max-w-[300px] bg-[#F5F5F7] dark:bg-[#1c1c1e] h-full shadow-2xl p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black tracking-tight">Menu</h2>
                                <button onClick={() => setSidebarOpen(false)}><XMarkIcon className="w-8 h-8" /></button>
                            </div>
                            <nav className="space-y-2">
                                {navLinks.map(link => (
                                    <Link key={link.routeName} href={route(link.routeName)} onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-bold ${route().current(link.routeName) ? 'bg-white shadow-sm text-black' : 'text-slate-500'}`}
                                    >
                                        {link.icon} {link.label}
                                    </Link>
                                ))}
                                <Link href={route('logout')} method="post" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-bold text-red-500 mt-8">
                                    <ArrowRightOnRectangleIcon className="w-6 h-6" /> Keluar
                                </Link>
                            </nav>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper Icon needed
const ArrowRightOnRectangleIcon = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
);