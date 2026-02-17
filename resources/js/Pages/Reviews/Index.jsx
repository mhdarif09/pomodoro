import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    StarIcon, HeartIcon, ChatBubbleLeftRightIcon,
    ArrowRightIcon, CheckIcon, BookOpenIcon,
    ClockIcon, UserGroupIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// ── Shared Navbar Components (Duplicated for standalone page context) ──
const FlyoutLink = ({ children, href, FlyoutContent }) => {
    const [open, setOpen] = useState(false);
    const showFlyout = FlyoutContent && open;

    return (
        <div
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className="relative h-fit w-fit"
        >
            <a href={href} className="relative text-slate-500 hover:text-emerald-600 font-semibold uppercase tracking-widest text-[13px] py-3 transition-colors">
                {children}
                <span
                    style={{ transform: showFlyout ? "scaleX(1)" : "scaleX(0)" }}
                    className="absolute -bottom-2 -left-2 -right-2 h-1 origin-left scale-x-0 rounded-full bg-emerald-500 transition-transform duration-300 ease-out"
                />
            </a>
            <AnimatePresence>
                {showFlyout && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute left-1/2 top-12 -translate-x-1/2 bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 min-w-[300px] z-50 overflow-hidden"
                    >
                        <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
                        <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white border-l border-t border-slate-100" />
                        <FlyoutContent />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ProductMenu = () => (
    <div className="grid grid-cols-1 gap-4">
        <a href="/products/focus-timer" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
            <div className="mt-0.5 p-2 bg-slate-50 rounded-lg group-hover:bg-white border text-cyan-500"><ClockIcon className="w-5 h-5" /></div>
            <div><h3 className="font-bold text-slate-900 text-sm">Focus Timer</h3><p className="text-xs text-slate-400">Flow state on demand.</p></div>
        </a>
        <a href="/products/guild-system" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
            <div className="mt-0.5 p-2 bg-slate-50 rounded-lg group-hover:bg-white border text-emerald-500"><UserGroupIcon className="w-5 h-5" /></div>
            <div><h3 className="font-bold text-slate-900 text-sm">Guild System</h3><p className="text-xs text-slate-400">Produktif bareng squad.</p></div>
        </a>
        <a href="/products/smart-companion" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
            <div className="mt-0.5 p-2 bg-slate-50 rounded-lg group-hover:bg-white border text-amber-500"><SparklesIcon className="w-5 h-5" /></div>
            <div><h3 className="font-bold text-slate-900 text-sm">Smart Companion</h3><p className="text-xs text-slate-400">Asisten pribadi 24/7.</p></div>
        </a>
    </div>
);

const ResourceMenu = () => (
    <div className="grid grid-cols-1 gap-2">
        <a href="/learn" className="block p-3 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700 hover:text-emerald-600">📚 Learn (Dokumentasi)</a>
        <a href="/reviews" className="block p-3 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700 hover:text-emerald-600">⭐ Customer Reviews</a>
    </div>
);

export default function ReviewsIndex() {
    const reviews = [
        { name: "Sarah M.", role: "Mahasiswa", text: "Jujur, awalnya skeptis sama 'Companion'. Tapi Kiko beneran ngebantu banget pas lagi suntuk revisian jam 2 pagi.", rating: 5, bg: "bg-emerald-50" },
        { name: "Budi Santoso", role: "Freelancer", text: "Fitur Guild mengubah cara kerja saya. Dulu kesepian kerja remote, sekarang punya temen 'ngantor' virtual yang asik.", rating: 5, bg: "bg-white" },
        { name: "Jessica L.", role: "Desainer", text: "UI nya gila sih, cantik banget. Nggak bikin sakit mata kayak dashboard productivity lain yang kaku.", rating: 5, bg: "bg-teal-50" },
        { name: "Dimas", role: "Developer", text: "Simple, to the point. Nggak kebanyakan fitur gimmick. Timer + Task list udah cukup buat saya.", rating: 4, bg: "bg-white" },
        { name: "Rina Kartika", role: "Writer", text: "Ambient sound 'Hujan' nya juara! Langsung fokus nulis berjam-jam tanpa sadar.", rating: 5, bg: "bg-slate-50" },
        { name: "Fauzan", role: "Entrepreneur", text: "Sistem leveling nya bikin ketagihan. Rasanya kayak main game RPG tapi yang naik level karir sendiri.", rating: 5, bg: "bg-white" },
    ];

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#FAFBFC] text-slate-900 font-sans">
            <Head title="Wall of Love — Sarang Tumbuh" />

            {/* NAV */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-[800] text-slate-900 tracking-tight">
                        <span className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-xs font-black">S</span>
                        Sarang Tumbuh
                    </Link>
                    <div className="hidden md:flex items-center gap-10">
                        <FlyoutLink href="#" FlyoutContent={ProductMenu}>Product</FlyoutLink>
                        <FlyoutLink href="#" FlyoutContent={ResourceMenu}>Resources</FlyoutLink>
                        <a href="/#harga" className="text-slate-500 hover:text-emerald-600 font-semibold uppercase tracking-widest text-[13px]">Pricing</a>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/register" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold">Coba Gratis</Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 font-bold uppercase tracking-widest text-xs mb-6 border border-red-100">
                            <HeartIcon className="w-4 h-4" /> Wall of Love
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-[900] text-slate-900 tracking-tight mb-6">
                            Dicintai oleh <span className="text-emerald-500">produktif people.</span>
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-slate-500">
                            Lihat apa kata mereka yang sudah berhasil menaklukkan rasa malas (dan deadline).
                        </motion.p>
                    </div>

                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {reviews.map((review, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className={`break-inside-avoid p-8 rounded-3xl border border-slate-100 shadow-sm ${review.bg}`}
                            >
                                <div className="flex gap-1 text-amber-400 mb-4">
                                    {[...Array(review.rating)].map((_, j) => <StarIconSolid key={j} className="w-4 h-4" />)}
                                </div>
                                <p className="text-lg text-slate-700 font-medium leading-relaxed mb-6">"{review.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{review.name}</div>
                                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{review.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-24 text-center">
                        <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl">
                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            Gabung & Tulis Ceritamu
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
