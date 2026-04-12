import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Lenis from '@studio-freight/lenis';
import {
    CheckIcon, ArrowRightIcon, ArrowLeftIcon, ChevronDownIcon,
    SparklesIcon, ClockIcon, UserGroupIcon, BookOpenIcon,
    ClipboardDocumentCheckIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';

// ─── Framer Variants ───────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};
const scaleIn = {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Animated Section ──────────────────────────────────────────────
const AnimatedSection = ({ children, className = '', id = '' }) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.06 });
    return (
        <motion.section
            id={id} ref={ref}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className={className}
        >
            {children}
        </motion.section>
    );
};

// ─── Roadmap Data ──────────────────────────────────────────────────
const roadmapPhases = [
    {
        status: 'shipped', label: 'Sudah Rilis', quarter: 'Q1 2025',
        title: 'Fondasi Produktivitas',
        desc: 'Fondasi awal ekosistem Sarang Tumbuh — tools esensial untuk memulai kebiasaan produktif.',
        items: [
            { text: 'Smart 3 Tasks harian', desc: 'AI pilihkan 3 tugas terpenting.' },
            { text: 'Pomodoro Timer terintegrasi', desc: 'Timer fokus dengan ambient sound.' },
            { text: 'Guild System & leaderboard', desc: 'Kolaborasi & kompetisi sehat.' },
            { text: 'XP, streak & level system', desc: 'Gamifikasi produktivitas.' },
            { text: 'Kanban Board personal', desc: 'Organisir tugas secara visual.' },
        ],
    },
    {
        status: 'shipped', label: 'Sudah Rilis', quarter: 'Q2 2025',
        title: 'Konektivitas & AI',
        desc: 'Koneksi lebih dalam — notifikasi pintar dan tantangan bersama guild.',
        items: [
            { text: 'WhatsApp Reminder otomatis', desc: 'Pengingat langsung ke WA.' },
            { text: 'AI Smart Focus', desc: 'Rekomendasi tugas berbasis kebiasaan.' },
            { text: 'Guild challenge harian', desc: 'Misi bersama setiap hari.' },
            { text: 'Dokumen & catatan bersama guild', desc: 'Knowledge base tim.' },
        ],
    },
    {
        status: 'inprogress', label: 'Sedang Dibangun', quarter: 'Q3 2025',
        title: 'Pengalaman Baru',
        desc: 'Pengalaman yang lebih kaya — companion virtual dan akses multi-platform.',
        items: [
            { text: 'Windows Desktop App', desc: 'Native app untuk Windows.' },
            { text: 'Pixel Companion (karakter 16-bit)', desc: 'Teman virtual yang menemani.' },
            { text: 'Learning Hub — materi premium', desc: 'Kursus produktivitas terstruktur.' },
            { text: 'Badge & achievement system v2', desc: 'Koleksi pencapaian baru.' },
        ],
    },
    {
        status: 'planned', label: 'Direncanakan', quarter: 'Q4 2025',
        title: 'Ekspansi & Integrasi',
        desc: 'Menjangkau lebih luas — mobile, API, dan program afiliasi.',
        items: [
            { text: 'Mobile App (iOS & Android)', desc: 'Produktif dari mana saja.' },
            { text: 'API publik untuk integrasi', desc: 'Connect your tools.' },
            { text: 'Affiliate program', desc: 'Dapatkan komisi referral.' },
            { text: 'Document Hub — simpan & share', desc: 'Otak kedua untuk ide-idemu.' },
        ],
    },
    {
        status: 'idea', label: 'Ide & Eksplorasi', quarter: '2026+',
        title: 'Masa Depan',
        desc: 'Fitur eksperimental yang sedang kami eksplorasi bersama komunitas.',
        items: [
            { text: 'AI journaling & refleksi harian', desc: 'Introspeksi terbimbing AI.' },
            { text: 'Integrasi kalender (Google, Outlook)', desc: 'Sinkronisasi jadwal.' },
            { text: 'Marketplace template guild', desc: 'Template siap pakai.' },
            { text: 'Mode offline penuh', desc: 'Bekerja tanpa internet.' },
            { text: 'SmartWatch App', desc: 'Deteksi Mental Healt dah Mendapatkan Rekomendasi Via App' }
        ],
    },
];

const statusConfig = {
    shipped: { dot: 'bg-[#2D6A4F]', badge: 'bg-[#D8F3DC] text-[#1B4332]', border: 'border-[#A8C5B0]', accent: '#2D6A4F' },
    inprogress: { dot: 'bg-[#F4A261]', badge: 'bg-[#FFF3DC] text-[#92590A]', border: 'border-[#F4D9A0]', accent: '#F4A261' },
    planned: { dot: 'bg-[#A8C5B0]', badge: 'bg-[#F0F7F1] text-[#2D6A4F]', border: 'border-[#D4E4D8]', accent: '#A8C5B0' },
    idea: { dot: 'bg-[#D4E4D8]', badge: 'bg-[#F7F9F7] text-[#6B7C74]', border: 'border-[#E8EFEB]', accent: '#D4E4D8' },
};

export default function Roadmap() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const lenis = new Lenis({ duration: 1.2 });
        function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
    }, [menuOpen]);

    return (
        <div
            className="min-h-screen bg-[#F7F9F7] text-[#1A1F1C] antialiased overflow-x-hidden selection:bg-[#D8F3DC] selection:text-[#1B4332]"
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
            <Head>
                <title>Roadmap — Sarang Tumbuh</title>
                <meta name="description" content="Lihat apa yang sedang kami bangun dan rencana masa depan Sarang Tumbuh. Transparan, terbuka, dan dibangun bersama komunitas." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
            </Head>

            {/* ═══════ NAV ═══════ */}
            <motion.header
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 left-0 right-0 z-50"
            >
                <div className="mx-4 mt-3">
                    <nav className={`container mx-auto px-5 py-3 flex items-center justify-between rounded-2xl border transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-[#D4E4D8] shadow-sm shadow-[#1A1F1C]/5' : 'bg-[#F7F9F7]/80 backdrop-blur-lg border-[#D4E4D8]/60'}`}>
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-7 h-7 bg-[#2D6A4F] rounded-lg flex items-center justify-center shadow-sm group-hover:bg-[#1B4332] transition-colors">
                                <div className="w-3 h-3 bg-[#74C69D] rounded-[3px]" />
                            </div>
                            <span className="text-[14px] font-semibold text-[#1A1F1C] tracking-tight">Sarang Tumbuh</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-4">
                            <Link href="/" className="text-[#6B7C74] hover:text-[#2D6A4F] font-semibold text-[13px] transition-colors">← Kembali ke Beranda</Link>
                            <motion.a
                                href="/register"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#2D6A4F] text-white hover:bg-[#1B4332] transition-colors shadow-sm"
                            >
                                Mulai Gratis
                            </motion.a>
                        </div>

                        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-[#D8F3DC] transition-colors">
                            <div className="flex flex-col gap-[5px] w-5">
                                <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} className="block h-[1.5px] bg-[#1A1F1C] rounded-full" />
                                <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} className="block h-[1.5px] bg-[#1A1F1C] rounded-full" />
                                <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} className="block h-[1.5px] bg-[#1A1F1C] rounded-full" />
                            </div>
                        </button>
                    </nav>
                </div>
            </motion.header>

            {/* Mobile menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-[#F7F9F7]/98 backdrop-blur-2xl md:hidden flex flex-col items-center justify-center gap-6"
                    >
                        <Link href="/" onClick={() => setMenuOpen(false)} className="text-2xl font-semibold text-[#1A1F1C] hover:text-[#2D6A4F] transition-colors" style={{ fontFamily: "'Instrument Serif', serif" }}>
                            Beranda
                        </Link>
                        <a href="/register" onClick={() => setMenuOpen(false)} className="mt-4 px-8 py-3.5 rounded-2xl font-semibold bg-[#2D6A4F] text-white text-base">
                            Mulai Gratis
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>

            <main>
                {/* ═══════ HERO ═══════ */}
                <section className="pt-32 pb-16 px-6">
                    <div className="container mx-auto max-w-4xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="inline-flex items-center gap-1.5 mb-6 px-3.5 py-1.5 rounded-full bg-[#D8F3DC] border border-[#A8C5B0]/40 text-[#1B4332] text-[11px] font-semibold uppercase tracking-widest">
                                <motion.span
                                    animate={{ scale: [1, 1.4, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="inline-block w-1.5 h-1.5 rounded-full bg-[#2D6A4F]"
                                />
                                Roadmap Publik
                            </div>
                            <h1
                                className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.1] tracking-[-0.02em] mb-5"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                <span className="text-[#1A1F1C]">Bangun masa depan</span>
                                <br />
                                <em className="text-[#2D6A4F]">bersama kami.</em>
                            </h1>
                            <p className="text-[16px] text-[#6B7C74] max-w-lg mx-auto leading-[1.7] mb-8">
                                Kami percaya transparansi. Di bawah ini adalah rencana pengembangan Sarang Tumbuh — apa yang sudah rilis, sedang dibangun, dan yang akan datang.
                            </p>

                            {/* Phase Legend */}
                            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                                {[
                                    { label: 'Sudah Rilis', dot: 'bg-[#2D6A4F]' },
                                    { label: 'Sedang Dibangun', dot: 'bg-[#F4A261]' },
                                    { label: 'Direncanakan', dot: 'bg-[#A8C5B0]' },
                                    { label: 'Ide & Eksplorasi', dot: 'bg-[#D4E4D8]' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-[12px] text-[#6B7C74] font-medium">
                                        <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ═══════ TIMELINE ═══════ */}
                <section className="pb-24 px-6">
                    <div className="container mx-auto max-w-4xl">
                        <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-[18px] md:left-1/2 top-0 bottom-0 w-[1.5px] bg-[#D4E4D8] -translate-x-1/2" />

                            <div className="space-y-10">
                                {roadmapPhases.map((phase, i) => {
                                    const sc = statusConfig[phase.status];
                                    const isLeft = i % 2 === 0;

                                    return (
                                        <AnimatedSection key={i} className={`relative flex items-start gap-6 md:gap-0 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                            {/* Content card */}
                                            <div className={`pl-10 md:pl-0 w-full md:w-[calc(50%-28px)] ${isLeft ? 'md:pr-10 md:text-right' : 'md:pl-10'}`}>
                                                <motion.div
                                                    variants={scaleIn}
                                                    whileHover={{ y: -3 }}
                                                    className={`p-6 rounded-2xl bg-white border ${sc.border} hover:shadow-lg transition-all`}
                                                >
                                                    <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'md:justify-end' : ''}`}>
                                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${sc.badge}`}>
                                                            {phase.label}
                                                        </span>
                                                        <span className="text-[11px] text-[#A8C5B0] font-medium">{phase.quarter}</span>
                                                    </div>
                                                    <h3 className={`text-[16px] font-semibold text-[#1A1F1C] mb-1 ${isLeft ? 'md:text-right' : ''}`}
                                                        style={{ fontFamily: "'Instrument Serif', serif" }}>
                                                        {phase.title}
                                                    </h3>
                                                    <p className={`text-[12px] text-[#A8C5B0] mb-4 leading-relaxed ${isLeft ? 'md:text-right' : ''}`}>{phase.desc}</p>
                                                    <ul className={`space-y-2.5 ${isLeft ? 'md:items-end md:flex md:flex-col' : ''}`}>
                                                        {phase.items.map((item, j) => (
                                                            <li key={j} className={`flex items-start gap-2 ${isLeft ? 'md:flex-row-reverse md:text-right' : ''}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${sc.dot}`} />
                                                                <div>
                                                                    <div className={`text-[13px] font-medium ${phase.status === 'shipped' ? 'text-[#1A1F1C]' : 'text-[#6B7C74]'}`}>
                                                                        {item.text}
                                                                    </div>
                                                                    <div className="text-[11px] text-[#A8C5B0] leading-relaxed">{item.desc}</div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            </div>

                                            {/* Center dot */}
                                            <div className="absolute left-0 md:left-1/2 top-6 md:-translate-x-1/2 flex items-center justify-center">
                                                <div className={`w-9 h-9 rounded-full border-[3px] border-[#F7F9F7] shadow-sm flex items-center justify-center ${sc.dot}`}>
                                                    {phase.status === 'shipped' && <CheckIcon className="w-4 h-4 text-white" />}
                                                    {phase.status === 'inprogress' && <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />}
                                                    {phase.status === 'planned' && <span className="w-2 h-2 rounded-full bg-white/60" />}
                                                    {phase.status === 'idea' && <span className="w-2 h-2 rounded-full bg-white/40" />}
                                                </div>
                                            </div>

                                            {/* Spacer */}
                                            <div className="hidden md:block w-[calc(50%-28px)]" />
                                        </AnimatedSection>
                                    );
                                })}
                            </div>
                        </div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mt-20"
                        >
                            <div className="relative p-10 md:p-14 rounded-3xl bg-[#1A1F1C] text-white overflow-hidden">
                                <div className="pointer-events-none absolute inset-0"
                                    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #2D6A4F50 0%, transparent 70%)' }} />
                                <div className="relative z-10">
                                    <h2
                                        className="text-[clamp(1.6rem,3vw,2.4rem)] tracking-tight leading-tight mb-4"
                                        style={{ fontFamily: "'Instrument Serif', serif" }}
                                    >
                                        Punya ide fitur baru?
                                    </h2>
                                    <p className="text-[14px] text-[#6B7C74] mb-6 max-w-sm mx-auto leading-relaxed">
                                        Kami membangun Sarang Tumbuh bersama komunitas. Suaramu penting.
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <a
                                            href="https://feedback.sarangtumbuh.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D6A4F] hover:bg-[#74C69D] hover:text-[#1B4332] rounded-xl font-semibold text-[14px] text-white transition-all shadow-lg shadow-[#2D6A4F]/30"
                                        >
                                            Request Fitur →
                                        </a>
                                        <Link
                                            href="/register"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium text-[14px] text-white border border-white/10 transition-all"
                                        >
                                            Mulai Gratis Sekarang
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ═══════ FOOTER ═══════ */}
                <footer className="border-t border-[#D4E4D8] bg-white">
                    <div className="container mx-auto px-6 py-10">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 bg-[#2D6A4F] rounded-md flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-[#74C69D] rounded-[2px]" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-[#1A1F1C]">Sarang Tumbuh</span>
                                </div>
                                <p className="text-[#6B7C74] text-[12px] mb-3 max-w-xs leading-relaxed">
                                    Teman produktifmu. Fokus sendiri atau bareng guild, tanpa overwhelm.
                                </p>
                                <p className="text-[11px] text-[#A8C5B0]">Mendukung SDGs Goal 3 · Good Health & Well-being</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-[11px] text-[#1A1F1C] mb-3 uppercase tracking-widest">Produk</h4>
                                <ul className="space-y-2 text-[12px] text-[#6B7C74]">
                                    {['Fitur', 'Guild', 'Harga', 'Changelog'].map(l => (
                                        <li key={l}><a href={`/#${l.toLowerCase()}`} className="hover:text-[#2D6A4F] transition-colors">{l}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-[11px] text-[#1A1F1C] mb-3 uppercase tracking-widest">Lainnya</h4>
                                <ul className="space-y-2 text-[12px] text-[#6B7C74]">
                                    <li><a href="/#faq" className="hover:text-[#2D6A4F] transition-colors">FAQ</a></li>
                                    <li><a href="/login" className="hover:text-[#2D6A4F] transition-colors">Masuk</a></li>
                                    <li><Link href="/privacy-policy" className="hover:text-[#2D6A4F] transition-colors">Privacy Policy</Link></li>
                                    <li><Link href="/terms-of-service" className="hover:text-[#2D6A4F] transition-colors">Terms of Service</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-[#D4E4D8] pt-6 text-center text-[11px] text-[#A8C5B0]">
                            &copy; {new Date().getFullYear()} Sarang Tumbuh. Hak cipta dilindungi.
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
