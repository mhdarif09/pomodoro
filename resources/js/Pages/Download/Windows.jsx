import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowDownTrayIcon,
    ComputerDesktopIcon,
    ShieldCheckIcon,
    BoltIcon,
    CheckBadgeIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { useLanguage, LanguageProvider } from '@/Contexts/LanguageContext';
import Lenis from '@studio-freight/lenis';

function DownloadWindowsContent() {
    const { t } = useLanguage();

    useEffect(() => {
        const lenis = new Lenis();
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
            <Head title={t('download_title')} />

            {/* Grid Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-[#F5F5F7] to-[#F5F5F7]"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02]"></div>
            </div>

            <nav className="container mx-auto px-6 py-8">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-semibold group">
                    <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </nav>

            <main className="container mx-auto px-6 pt-12 pb-24">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Left: Content */}
                        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-widest shadow-sm">
                                <ComputerDesktopIcon className="w-4 h-4" />
                                <span>Windows App</span>
                            </motion.div>

                            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-[900] tracking-tighter mb-6 text-slate-900 leading-[1.1]">
                                {t('download_title')}
                            </motion.h1>

                            <motion.p variants={fadeInUp} className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
                                {t('download_subtitle')}
                            </motion.p>

                            <motion.div variants={fadeInUp} className="space-y-4 mb-12">
                                {[t('download_feature_1'), t('download_feature_2'), t('download_feature_3')].map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 text-slate-700 font-semibold text-lg">
                                        <CheckBadgeIcon className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </motion.div>

                            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-start gap-4">
                                <a
                                    href="/download/sarang-tumbuh-windows.exe" // Real path would be managed via backend, for now placeholder
                                    className="group relative px-10 py-5 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold text-lg text-white transition-all shadow-xl shadow-emerald-500/30 flex items-center gap-3 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <ArrowDownTrayIcon className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
                                    {t('download_btn')}
                                </a>
                                <div className="py-2">
                                    <p className="text-sm font-bold text-slate-400 tracking-wide">{t('download_req')}</p>
                                    <p className="text-[10px] text-slate-300 font-bold uppercase mt-1">Version 1.0.0 • Size: ~80MB</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right: Visual Section */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="relative"
                        >
                            <div className="relative aspect-[4/3] rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl p-1 overflow-hidden shadow-emerald-500/20">
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                                <div className="relative h-full w-full bg-[#1C1C1E] rounded-[2.3rem] overflow-hidden border border-white/10 flex flex-col">
                                    {/* Fake Window Controls */}
                                    <div className="h-8 bg-[#2C2C2E] flex items-center px-4 gap-1.5 border-b border-white/5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FEB129]"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
                                        <div className="flex-grow text-center text-[10px] text-slate-500 font-medium">Sarang Tumbuh</div>
                                    </div>
                                    {/* App Content Placeholder */}
                                    <div className="flex-grow p-6 flex flex-col justify-center items-center text-center">
                                        <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg shadow-emerald-500/40">S</div>
                                        <div className="h-4 w-32 bg-slate-800 rounded-full mb-2"></div>
                                        <div className="h-3 w-48 bg-slate-800/50 rounded-full mb-8"></div>
                                        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                                            <div className="h-20 bg-slate-800/40 rounded-xl"></div>
                                            <div className="h-20 bg-slate-800/40 rounded-xl"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Accents */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-8 -right-8 w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center p-4 border border-slate-100"
                            >
                                <ShieldCheckIcon className="w-full h-full text-emerald-500" />
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-6 -left-6 w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center p-5 border border-slate-100"
                            >
                                <BoltIcon className="w-full h-full text-amber-400" />
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Steps Section */}
                    <div className="mt-32 grid md:grid-cols-3 gap-8">
                        {[
                            { icon: ArrowDownTrayIcon, title: t('download_step_1'), desc: t('download_step_1_desc') },
                            { icon: ComputerDesktopIcon, title: t('download_step_2'), desc: t('download_step_2_desc') },
                            { icon: CheckBadgeIcon, title: t('download_step_3'), desc: t('download_step_3_desc') }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 font-black text-xl">
                                    {i + 1}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="py-12 border-t border-slate-200/60 bg-white/30 backdrop-blur-xl text-center">
                <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} Sarang Tumbuh. Suaka Ambisi & Fokus.</p>
            </footer>
        </div>
    );
}

export default function DownloadWindows(props) {
    return (
        <LanguageProvider>
            <DownloadWindowsContent {...props} />
        </LanguageProvider>
    );
}
