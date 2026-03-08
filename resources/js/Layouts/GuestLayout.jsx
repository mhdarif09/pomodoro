import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-[#0A0A0A] dark:via-[#0D1117] dark:to-[#0A0A0A] relative overflow-hidden">
            {/* Floating emerald orbs for depth */}
            <div className="absolute top-20 -left-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 -right-20 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-300/10 rounded-full blur-3xl" />

            <div className="relative z-10">
                <Link href="/" className="flex items-center justify-center gap-2.5 group">
                    <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">S</span>
                    <span className="text-xl font-[800] text-slate-900 dark:text-white tracking-tight">Sarang Tumbuh</span>
                </Link>
            </div>

            <div className="relative z-10 w-full sm:max-w-md mt-8 px-6 py-8 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl shadow-2xl shadow-emerald-900/5 dark:shadow-black/30 overflow-hidden sm:rounded-3xl border border-emerald-100/50 dark:border-emerald-900/20">
                {children}
            </div>

            {/* Bottom branding */}
            <p className="relative z-10 mt-6 text-xs text-slate-400 dark:text-slate-600 font-medium">
                &copy; {new Date().getFullYear()} Sarang Tumbuh
            </p>
        </div>
    );
}
