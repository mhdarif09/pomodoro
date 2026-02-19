import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    StarIcon,
    ArrowRightIcon,
    SparklesIcon,
    ChevronDownIcon,
    HeartIcon,
    ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/solid';
import {
    ShieldCheckIcon,
    UserGroupIcon,
    ClockIcon,
    FireIcon,
} from '@heroicons/react/24/outline';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
};

const reviews = [
    {
        name: "Jessie",
        quote: "Sarang Tumbuh bikin rutinitas belajar jadi teratur banget. Companion-nya lucu, bikin semangat terus! Setiap hari jadi lebih produktif.",
        rating: 5,
        date: "Februari 2026",
        highlight: "Rutinitas Teratur",
        gradient: "from-emerald-400 to-teal-500",
    },
    {
        name: "Demian",
        quote: "Guild system-nya keren! Bisa ngerjain tugas bareng temen, jadi ada accountability partner. Nggak pernah se-produktif ini sebelumnya.",
        rating: 5,
        date: "Februari 2026",
        highlight: "Guild System",
        gradient: "from-indigo-400 to-violet-500",
    },
    {
        name: "Muhammad Salman Al Fikri",
        quote: "Fitur fokus 3 tugas harian itu game changer sih. Nggak lagi overwhelm lihat to-do list panjang. Sekarang kerja jadi terarah dan efisien banget.",
        rating: 5,
        date: "Februari 2026",
        highlight: "Smart Focus",
        gradient: "from-blue-400 to-cyan-500",
    },
    {
        name: "Putri Qomara",
        quote: "Suka banget sama Pomodoro timer-nya! Kerja jadi lebih produktif dan terukur. Ditambah musik lo-fi nya bikin fokus makin deep.",
        rating: 5,
        date: "Februari 2026",
        highlight: "Pomodoro Timer",
        gradient: "from-rose-400 to-pink-500",
    },
    {
        name: "Rommy Sulistiori N.S.",
        quote: "Akhirnya nemu app produktivitas yang simpel tapi powerful. Kanban board-nya juga bagus! Interface-nya clean, nggak bikin pusing.",
        rating: 5,
        date: "Februari 2026",
        highlight: "Kanban Board",
        gradient: "from-amber-400 to-orange-500",
    },
    {
        name: "Eclairs R",
        quote: "Interface-nya clean dan enak dipake. Nggak ribet, langsung bisa fokus kerja. Companion pixel art-nya juga lucu banget!",
        rating: 5,
        date: "Februari 2026",
        highlight: "Clean Interface",
        gradient: "from-purple-400 to-fuchsia-500",
    },
    {
        name: "Indahome",
        quote: "XP system-nya bikin nagih buat terus produktif. Berasa main game tapi beneran ngerjain tugas! Level up setiap hari itu satisfying banget.",
        rating: 5,
        date: "Februari 2026",
        highlight: "Gamification",
        gradient: "from-yellow-400 to-amber-500",
    },
    {
        name: "Nebukadnezar Ahmad",
        quote: "Smart Focus-nya paham banget tugas mana yang harus dikerjain duluan. AI recommendation-nya akurat dan bikin workflow lebih efisien.",
        rating: 5,
        date: "Februari 2026",
        highlight: "AI Powered",
        gradient: "from-teal-400 to-emerald-500",
    },
    {
        name: "Fachmy Casofa",
        quote: "Pake ini buat ngatur kerjaan sehari-hari. Simpel, efektif, dan bikin konsisten! Streak system-nya bikin nggak mau skip sehari pun.",
        rating: 5,
        date: "Februari 2026",
        highlight: "Streak System",
        gradient: "from-sky-400 to-blue-500",
    },
];

const stats = [
    { value: "4.9", label: "Rating Rata-rata", icon: StarIcon, color: "text-amber-500" },
    { value: "9", label: "Ulasan Pengguna", icon: ChatBubbleLeftEllipsisIcon, color: "text-emerald-500" },
    { value: "100%", label: "Rekomendasi", icon: HeartIcon, color: "text-rose-500" },
    { value: "5★", label: "Semua Rating", icon: SparklesIcon, color: "text-violet-500" },
];

export default function Reviews() {
    const [selectedFilter, setSelectedFilter] = useState('all');

    return (
        <div className="min-h-screen bg-[#FAFBFC] text-slate-900 antialiased overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <Head title="Customer Reviews — Sarang Tumbuh" />

            {/* ═════════ NAV ═════════ */}
            <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 left-0 right-0 z-50">
                <div className="mx-4 mt-3">
                    <nav className="container mx-auto px-6 py-3 flex items-center justify-between rounded-2xl bg-white/80 backdrop-blur-2xl border border-slate-200/50 shadow-sm shadow-slate-200/50">
                        <Link href="/" className="text-lg font-[800] text-slate-900 tracking-tight flex items-center gap-2">
                            <span className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/25">S</span>
                            Sarang Tumbuh
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/" className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">Beranda</Link>
                            <motion.a href="/register" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                className="px-5 py-2 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md">
                                Coba Gratis
                            </motion.a>
                        </div>
                    </nav>
                </div>
            </motion.header>

            <main className="relative z-10 pt-28">
                {/* ═════════ HERO ═════════ */}
                <section className="py-20 px-6 relative overflow-hidden">
                    {/* Background orbs */}
                    <motion.div className="absolute rounded-full blur-3xl w-[500px] h-[500px] bg-emerald-300/20 -top-40 -right-40"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.div className="absolute rounded-full blur-3xl w-[400px] h-[400px] bg-violet-300/15 bottom-0 -left-40"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
                        transition={{ duration: 10, delay: 2, repeat: Infinity, ease: 'easeInOut' }} />

                    <div className="container mx-auto max-w-4xl text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 text-amber-700 text-xs font-bold uppercase tracking-widest"
                        >
                            <StarIcon className="w-3.5 h-3.5 fill-amber-500" />
                            Customer Reviews
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            className="text-4xl md:text-6xl font-[900] tracking-[-0.04em] mb-6 leading-[1.1]"
                        >
                            <span className="text-slate-900">Apa kata mereka tentang</span><br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">Sarang Tumbuh?</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-base md:text-lg text-slate-400 max-w-lg mx-auto mb-12 leading-relaxed"
                        >
                            Review asli dari pengguna nyata yang sudah merasakan produktivitas tanpa overwhelm.
                        </motion.p>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
                        >
                            {stats.map((stat, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                                    <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                                    <div className="text-2xl font-[900] text-slate-900">{stat.value}</div>
                                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* ═════════ OVERALL RATING BAR ═════════ */}
                <section className="py-12 px-6 border-y border-slate-100 bg-white/60">
                    <div className="container mx-auto max-w-3xl">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="text-center">
                                <div className="text-6xl font-[900] text-slate-900 leading-none">4.9</div>
                                <div className="flex gap-0.5 justify-center my-2">
                                    {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
                                </div>
                                <div className="text-xs text-slate-400 font-medium">dari 9 ulasan</div>
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                {[
                                    { stars: 5, count: 9, pct: 100 },
                                    { stars: 4, count: 0, pct: 0 },
                                    { stars: 3, count: 0, pct: 0 },
                                    { stars: 2, count: 0, pct: 0 },
                                    { stars: 1, count: 0, pct: 0 },
                                ].map((row) => (
                                    <div key={row.stars} className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-500 w-6 text-right">{row.stars}★</span>
                                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${row.pct}%` }}
                                                transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-slate-400 w-6">{row.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═════════ REVIEWS GRID ═════════ */}
                <section className="py-20 px-6 relative">
                    <motion.div className="absolute rounded-full blur-3xl w-[300px] h-[300px] bg-amber-200/10 top-20 right-20"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 6, repeat: Infinity }} />

                    <div className="container mx-auto max-w-6xl">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {reviews.map((review, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeUp}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    className="relative p-7 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col"
                                >
                                    {/* Background decoration */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${review.gradient} opacity-[0.03] rounded-full -mr-10 -mt-10 group-hover:opacity-[0.08] transition-opacity duration-500`} />

                                    {/* Highlight badge */}
                                    <div className="mb-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${review.gradient} text-white shadow-sm`}>
                                            <SparklesIcon className="w-3 h-3" />
                                            {review.highlight}
                                        </span>
                                    </div>

                                    {/* Stars */}
                                    <div className="flex gap-0.5 mb-4">
                                        {[...Array(review.rating)].map((_, si) => (
                                            <StarIcon key={si} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>

                                    {/* Quote */}
                                    <p className="text-slate-600 text-sm leading-relaxed flex-grow mb-6 relative z-10">
                                        "{review.quote}"
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-3 border-t border-slate-50 pt-4 mt-auto relative z-10">
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.gradient} flex items-center justify-center text-white font-bold shadow-lg shadow-${review.gradient.split(' ')[0].replace('from-', '')}/20`}>
                                            {review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">{review.name}</div>
                                            <div className="text-[11px] text-slate-400">{review.date}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* ═════════ SOCIAL PROOF FEATURES ═════════ */}
                <section className="py-20 px-6 bg-white/40 border-y border-slate-100">
                    <div className="container mx-auto max-w-4xl text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3">Kenapa Mereka Suka</p>
                            <h2 className="text-3xl md:text-4xl font-[900] tracking-tight mb-12">Fitur yang paling disukai pengguna</h2>
                        </motion.div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: "🎯", title: "Smart Focus 3", desc: "Cuma 3 tugas/hari", pct: "100%" },
                                { icon: "⏱️", title: "Pomodoro Timer", desc: "Fokus yang terukur", pct: "89%" },
                                { icon: "🛡️", title: "Guild System", desc: "Bareng lebih kuat", pct: "78%" },
                                { icon: "🎮", title: "Gamification", desc: "XP & Level Up", pct: "89%" },
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all group"
                                >
                                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{feature.icon}</div>
                                    <div className="text-sm font-bold text-slate-900 mb-1">{feature.title}</div>
                                    <div className="text-xs text-slate-400 mb-3">{feature.desc}</div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: feature.pct }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                                        />
                                    </div>
                                    <div className="text-xs font-bold text-emerald-600 mt-1">{feature.pct} suka</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═════════ CTA ═════════ */}
                <section className="py-24 px-6">
                    <div className="container mx-auto max-w-3xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative p-12 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden shadow-2xl"
                        >
                            <motion.div className="absolute rounded-full blur-3xl w-[400px] h-[400px] bg-emerald-500/15 -top-20 -right-20"
                                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
                            <div className="relative z-10">
                                <div className="flex gap-0.5 justify-center mb-4">
                                    {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />)}
                                </div>
                                <h2 className="text-3xl md:text-5xl font-[900] tracking-tight mb-4 leading-tight">Gabung dengan mereka.</h2>
                                <p className="text-slate-400 mb-8 max-w-sm mx-auto text-sm">
                                    Ribuan orang sudah menemukan ritme produktif mereka. Giliranmu sekarang.
                                </p>
                                <motion.a href="/register" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-emerald-500/25">
                                    Mulai Gratis Sekarang <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.a>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ═════════ FOOTER ═════════ */}
                <footer className="py-8 border-t border-slate-100 bg-white/50">
                    <div className="container mx-auto px-6 text-center text-slate-300 text-[11px]">
                        &copy; {new Date().getFullYear()} Sarang Tumbuh. Hak cipta dilindungi.
                    </div>
                </footer>
            </main>


        </div>
    );
}
