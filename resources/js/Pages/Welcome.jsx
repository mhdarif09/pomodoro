import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Head, Link } from '@inertiajs/react';
import Lenis from '@studio-freight/lenis';
import {
    CheckIcon, ArrowRightIcon, StarIcon, UserGroupIcon, SparklesIcon,
    ClockIcon, ChevronDownIcon, BoltIcon, ShieldCheckIcon,
    HeartIcon, FireIcon, TrophyIcon, ChatBubbleLeftEllipsisIcon,
    BookOpenIcon, ClipboardDocumentCheckIcon, BanknotesIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';

const FaTwitter = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const FaInstagram = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2z" clipRule="evenodd" /></svg>;
import { useLanguage, LanguageProvider } from '@/Contexts/LanguageContext';

// ─── Color Tokens ───────────────────────────────────────────────────
// Forest Green:  #2D6A4F   Light Green: #74C69D   Pale Mint: #D8F3DC
// Off-White:     #F7F9F7   Ink:         #1A1F1C   Muted:     #6B7C74
// Amber Accent:  #F4A261   Border:      #D4E4D8

// ─── Framer Variants ───────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};
const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
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

// ─── Animated Counter ──────────────────────────────────────────────
const Counter = ({ target, suffix = '', prefix = '' }) => {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView({ triggerOnce: true });
    useEffect(() => {
        if (!inView) return;
        const end = parseInt(target);
        if (isNaN(end)) return;
        let start = 0;
        const step = Math.max(1, Math.floor(end / 45));
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(start);
        }, 28);
        return () => clearInterval(timer);
    }, [inView, target]);
    return <span ref={ref}>{prefix}{count.toLocaleString('id')}{suffix}</span>;
};

// ─── FAQ Item ──────────────────────────────────────────────────────
const FAQItem = ({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-[#D4E4D8] last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center py-5 text-left group focus:outline-none"
            >
                <span className="text-[14px] font-semibold text-[#1A1F1C] pr-8 group-hover:text-[#2D6A4F] transition-colors">
                    {question}
                </span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDownIcon className="w-4 h-4 text-[#A8C5B0] flex-shrink-0" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-5 text-[#6B7C74] text-[13px] leading-relaxed">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Marquee ───────────────────────────────────────────────────────
const Marquee = ({ children, direction = 'left', speed = 38 }) => (
    <div className="relative flex w-full overflow-hidden">
        {[0, 1].map(i => (
            <motion.div
                key={i}
                className="flex min-w-full shrink-0 items-stretch gap-4"
                animate={{ x: direction === 'left' ? ['0%', '-100%'] : ['-100%', '0%'] }}
                transition={{ ease: 'linear', duration: speed, repeat: Infinity }}
            >
                {children}
            </motion.div>
        ))}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#F7F9F7] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#F7F9F7] to-transparent z-10" />
    </div>
);

// ─── Nav Flyout Link ───────────────────────────────────────────────
const FlyoutLink = ({ children, href = '#', FlyoutContent }) => {
    const [open, setOpen] = useState(false);
    const showFlyout = FlyoutContent && open;
    return (
        <div
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className="relative h-fit w-fit"
        >
            <a
                href={href}
                className="relative text-[#6B7C74] hover:text-[#2D6A4F] font-semibold uppercase tracking-widest text-[13px] py-3 transition-colors"
            >
                {children}
                <span
                    style={{ transform: showFlyout ? 'scaleX(1)' : 'scaleX(0)' }}
                    className="absolute -bottom-2 -left-2 -right-2 h-[3px] origin-left scale-x-0 rounded-full bg-[#2D6A4F] transition-transform duration-300 ease-out"
                />
            </a>
            <AnimatePresence>
                {showFlyout && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="absolute left-1/2 top-12 -translate-x-1/2 bg-white rounded-2xl p-6 shadow-xl shadow-[#1A1F1C]/10 border border-[#D4E4D8] min-w-[300px] z-50 overflow-hidden"
                    >
                        <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
                        <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white border-l border-t border-[#D4E4D8]" />
                        <FlyoutContent />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Product Flyout ────────────────────────────────────────────────
const ProductContent = () => (
    <div className="grid grid-cols-2 gap-3 w-[460px]">
        {[
            { title: 'To-Do List', desc: 'Manajemen tugas tanpa stres.', href: '/products/todo-list', icon: <ClipboardDocumentCheckIcon className="w-4 h-4 text-[#2D6A4F]" /> },
            { title: 'Pomodoro Timer', desc: 'Fokus penuh tanpa gangguan.', href: '/products/focus-timer', icon: <ClockIcon className="w-4 h-4 text-rose-500" /> },
            { title: 'Guild System', desc: 'Kolaborasi & akuntabilitas tim.', href: '/products/guild-system', icon: <UserGroupIcon className="w-4 h-4 text-blue-500" /> },
            { title: 'Smart Companion', desc: 'Asisten pribadi 24/7.', href: '/products/smart-companion', icon: <SparklesIcon className="w-4 h-4 text-amber-500" /> },
            { title: 'Learning Hub', desc: 'Materi produktivitas premium.', href: '/products/learning-hub', icon: <BookOpenIcon className="w-4 h-4 text-emerald-500" /> },
            { title: 'Document Hub', desc: 'Otak kedua untuk ide-idemu.', href: '/products/document-hub', icon: <DocumentTextIcon className="w-4 h-4 text-violet-500" /> },
        ].map((item, i) => (
            <a key={i} href={item.href} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F7F9F7] transition-colors group">
                <div className="mt-0.5 p-2 bg-[#F7F9F7] rounded-lg group-hover:bg-white group-hover:shadow-sm group-hover:border group-hover:border-[#D4E4D8] transition-all">
                    {item.icon}
                </div>
                <div>
                    <div className="font-semibold text-[#1A1F1C] text-[13px] group-hover:text-[#2D6A4F] transition-colors">{item.title}</div>
                    <div className="text-[11px] text-[#6B7C74]">{item.desc}</div>
                </div>
            </a>
        ))}
    </div>
);

// ─── Resources Flyout ─────────────────────────────────────────────
const ResourceContent = () => (
    <div className="grid grid-cols-1 gap-1 w-[220px]">
        {[
            { label: '📚 Cara Kerja', href: '#cara-kerja' },
            { label: '⭐ Testimoni', href: '#testimoni' },
            { label: '🗺️ Roadmap', href: '/roadmap' },
            { label: '🤝 Kolaborasi & Demo', href: '/collaborate' },
        ].map((item, i) => (
            <a key={i} href={item.href} className="block p-3 rounded-xl hover:bg-[#F7F9F7] transition-colors text-[13px] font-semibold text-[#1A1F1C] hover:text-[#2D6A4F]">
                {item.label}
            </a>
        ))}
        {[
            { label: '🎉 Event', soon: true },
            { label: '📰 Blog', soon: true },
        ].map((item, i) => (
            <div key={i} className="flex justify-between items-center p-3 rounded-xl text-[13px] font-semibold text-[#A8C5B0] cursor-not-allowed opacity-60">
                <span>{item.label}</span>
                <span className="text-[10px] bg-[#F0F7F1] px-2 py-0.5 rounded-full border border-[#D4E4D8] text-[#6B7C74]">Soon</span>
            </div>
        ))}
    </div>
);

// ══════════════════════════════════════════════════════════════════
// MAIN LANDING PAGE CONTENT
// ══════════════════════════════════════════════════════════════════
function LandingPageContent({ plans = [] }) {
    const { language, toggleLanguage } = useLanguage();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Lenis smooth scroll
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.2 });
        function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }, []);

    // Nav scroll state
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
    }, [menuOpen]);

    // Hero parallax
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

    // Pricing plans
    const pricingPlans = useMemo(() => {
        if (!plans || plans.length === 0) {
            return [
                {
                    plan: 'Starter', price: 'Gratis', desc: 'Untuk memulai kebiasaan baru',
                    features: ['3 tugas fokus harian', 'Pomodoro Timer', 'Kanban pribadi', 'Bergabung 1 Guild', 'XP & Streak'],
                    highlighted: false,
                },
                {
                    plan: 'Pro Monthly', price: 'Rp20k', priceSub: '/bln', desc: 'Untuk produktivitas serius',
                    features: ['Semua fitur Starter', 'AI Smart Focus', 'Guild tanpa batas', 'WhatsApp Reminder', 'Laporan mingguan', 'Badge eksklusif'],
                    highlighted: true,
                },
                {
                    plan: 'Pro Yearly', price: 'Rp200k', priceSub: '/thn', desc: 'Hemat 20% untuk komitmen jangka panjang',
                    features: ['Semua fitur Starter', 'AI Smart Focus', 'Guild tanpa batas', 'WhatsApp Reminder', 'Laporan mingguan', 'Badge eksklusif'],
                    highlighted: false, badge: 'Hemat 20%',
                },
            ];
        }
        return plans.map(p => {
            const isMonthlyPro = p.price > 0 && p.duration === 'monthly';
            const isYearly = p.duration === 'yearly';
            let priceLabel, priceSub;
            if (p.price === 0) {
                priceLabel = 'Gratis';
                priceSub = '';
            } else if (p.price >= 100000) {
                priceLabel = `Rp${(p.price / 1000).toFixed(0)}k`;
                priceSub = isYearly ? '/thn' : '/bln';
            } else {
                priceLabel = `Rp${(p.price / 1000).toFixed(0)}k`;
                priceSub = isYearly ? '/thn' : '/bln';
            }
            return {
                plan: p.name,
                price: priceLabel,
                priceSub,
                desc: p.description || '',
                features: p.features || [],
                highlighted: isMonthlyPro,
                badge: isYearly ? 'Hemat 20%' : null,
                id: p.id,
            };
        });
    }, [plans]);

    const testimonials = [
        { quote: "Sarang Tumbuh bikin rutinitas belajar jadi teratur banget. Companion-nya bikin semangat terus!", name: "Jessie", role: "Mahasiswa" },
        { quote: "Guild system-nya keren! Bisa ngerjain tugas bareng, ada accountability partner.", name: "Demian", role: "Freelancer" },
        { quote: "Fitur fokus 3 tugas harian itu game changer. Nggak lagi overwhelm lihat to-do list panjang.", name: "Muhammad Salman", role: "Developer" },
        { quote: "Suka banget sama Pomodoro timer-nya! Kerja jadi lebih produktif dan terukur.", name: "Putri Qomara", role: "Designer" },
        { quote: "Akhirnya nemu app produktivitas yang simpel tapi powerful. Kanban board-nya bagus!", name: "Rommy S.", role: "Project Manager" },
        { quote: "Interface-nya clean dan enak dipake. Nggak ribet, langsung fokus kerja.", name: "Eclairs R", role: "Content Creator" },
        { quote: "XP system-nya bikin nagih buat terus produktif. Berasa main game!", name: "Indahome", role: "Entrepreneur" },
        { quote: "Smart Focus-nya paham banget tugas mana yang dikerjain duluan. Recommended!", name: "Nebukadnezar A", role: "Konsultan" },
    ];

    const faqData = [
        { question: 'Apa bedanya dengan to-do list biasa?', answer: 'Sarang Tumbuh hanya menampilkan 3 tugas fokus harian supaya kamu tidak overwhelm, ditambah companion virtual dan sistem guild untuk berkolaborasi.' },
        { question: 'Apa itu Guild?', answer: 'Guild adalah tim kecil tempat kamu dan teman-teman saling support. Kalian bisa berbagi tugas, melihat progress, dan berlomba di leaderboard bersama.' },
        { question: 'Apakah benar-benar gratis?', answer: 'Ya! Paket Starter sepenuhnya gratis dengan fitur inti lengkap. Paket Pro membuka AI Focus, guild tanpa batas, dan WhatsApp reminder.' },
        { question: 'Apa hubungannya dengan SDGs?', answer: 'Sarang Tumbuh dirancang untuk mendukung SDGs Goal 3 — kesehatan dan well-being. Produktivitas yang baik adalah yang berkelanjutan, bukan yang menguras.' },
        { question: 'Bisa dipakai untuk kerja tim?', answer: 'Tentu. Gunakan fitur Guild untuk kolaborasi. Setiap guild punya Kanban board, dokumen bersama, dan daily challenge.' },
    ];

    return (
        <div
            className="min-h-screen bg-[#F7F9F7] text-[#1A1F1C] antialiased overflow-x-hidden selection:bg-[#D8F3DC] selection:text-[#1B4332]"
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
            <Head>
                <title>Sarang Tumbuh — Kerja Lebih Sedikit, Selesaikan Lebih Banyak</title>
                <meta name="description" content="Sarang Tumbuh adalah productivity companion berbasis komunitas. Fokus 3 tugas harian, Pomodoro timer, guild system, dan AI companion. Gratis selamanya." />
                <meta name="keywords" content="produktivitas, to-do list, pomodoro, gamifikasi, guild, focus, sarang tumbuh, task manager" />
                <meta name="robots" content="index, follow" />
                <meta name="theme-color" content="#2D6A4F" />
                <meta property="og:title" content="Sarang Tumbuh — Kerja Lebih Sedikit, Selesaikan Lebih Banyak" />
                <meta property="og:description" content="Pilih 3 tugas terpenting. Fokus dengan Pomodoro. Tumbuh bersama Guild." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
                <link rel="canonical" href={window.location.origin} />
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
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-7 h-7 bg-[#2D6A4F] rounded-lg flex items-center justify-center shadow-sm group-hover:bg-[#1B4332] transition-colors">
                                <div className="w-3 h-3 bg-[#74C69D] rounded-[3px]" />
                            </div>
                            <span className="text-[14px] font-semibold text-[#1A1F1C] tracking-tight">Sarang Tumbuh</span>
                        </Link>

                        {/* Desktop links */}
                        <div className="hidden md:flex items-center gap-8">
                            <FlyoutLink href="#fitur" FlyoutContent={ProductContent}>Product</FlyoutLink>
                            <FlyoutLink href="#cara-kerja" FlyoutContent={ResourceContent}>Resources</FlyoutLink>
                            <a href="#harga" className="text-[#6B7C74] hover:text-[#2D6A4F] font-semibold uppercase tracking-widest text-[13px] transition-colors">Pricing</a>
                        </div>

                        <div className="hidden md:flex items-center gap-2">
                            <button onClick={toggleLanguage} className="w-8 h-8 rounded-lg hover:bg-[#D8F3DC] transition-colors flex items-center justify-center text-sm">
                                {language === 'id' ? '🇮🇩' : '🇬🇧'}
                            </button>
                            <a href="/login" className="px-4 py-2 text-[13px] font-medium text-[#6B7C74] hover:text-[#2D6A4F] transition-colors">Masuk</a>
                            <motion.a
                                href="/register"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#2D6A4F] text-white hover:bg-[#1B4332] transition-colors shadow-sm"
                            >
                                Mulai Gratis
                            </motion.a>
                        </div>

                        {/* Mobile hamburger */}
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
                        {['Cara Kerja', 'Fitur', 'Komunitas', 'Harga'].map(item => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(' ', '-')}`}
                                onClick={() => setMenuOpen(false)}
                                className="text-2xl font-semibold text-[#1A1F1C] hover:text-[#2D6A4F] transition-colors"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                {item}
                            </a>
                        ))}
                        <a
                            href="/register"
                            onClick={() => setMenuOpen(false)}
                            className="mt-4 px-8 py-3.5 rounded-2xl font-semibold bg-[#2D6A4F] text-white text-base"
                        >
                            Mulai Gratis
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>

            <main>
                {/* ═══════ HERO ═══════ */}
                <section ref={heroRef} className="min-h-screen flex items-center justify-center pt-28 pb-20 relative overflow-hidden">
                    {/* Subtle radial bg */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute inset-x-0 top-0 h-[60%] bg-gradient-radial from-[#D8F3DC]/50 via-transparent to-transparent"
                            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, #D8F3DC80 0%, transparent 70%)' }} />
                        {/* Dot grid */}
                        <svg className="absolute inset-0 w-full h-full opacity-[0.25]" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                                    <circle cx="1" cy="1" r="1" fill="#A8C5B0" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#dots)" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-6 text-center relative z-10">
                        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="inline-flex items-center gap-1.5 mb-8 px-3.5 py-1.5 rounded-full bg-[#D8F3DC] border border-[#A8C5B0]/40 text-[#1B4332] text-[11px] font-semibold uppercase tracking-widest"
                            >
                                <motion.span
                                    animate={{ scale: [1, 1.4, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="inline-block w-1.5 h-1.5 rounded-full bg-[#2D6A4F]"
                                />
                                Productivity Companion · Gratis Selamanya
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                initial={{ opacity: 0, y: 28 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.28, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                                className="text-[clamp(2.8rem,7.5vw,5.8rem)] leading-[1.06] tracking-[-0.03em] mb-5 max-w-3xl mx-auto"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                <span className="text-[#1A1F1C]">To-do list kamu</span>
                                <br />
                                <em className="text-[#2D6A4F]">tidak pernah habis.</em>
                            </motion.h1>

                            {/* Problem statement — Notion-style direct */}
                            <motion.p
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.44 }}
                                className="text-[16px] md:text-[18px] text-[#6B7C74] max-w-xl mx-auto mb-3 leading-[1.7]"
                            >
                                Kamu bukan kurang disiplin. Kamu cuma <strong className="text-[#1A1F1C] font-semibold">kelelahan memilih</strong> dari daftar yang tidak ada ujungnya.
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.52 }}
                                className="text-[15px] text-[#A8C5B0] max-w-md mx-auto mb-10 leading-[1.7]"
                            >
                                Sarang Tumbuh paksa kamu pilih <strong className="text-[#2D6A4F]">3 tugas saja</strong> setiap hari — lalu bantu kamu selesaikan semuanya.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.58 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
                            >
                                <motion.a
                                    href="/register"
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="group flex items-center gap-2 px-7 py-3.5 bg-[#2D6A4F] hover:bg-[#1B4332] rounded-xl font-semibold text-[14px] text-white transition-all shadow-lg shadow-[#2D6A4F]/25"
                                >
                                    Mulai Gratis
                                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </motion.a>
                                <a
                                    href="#cara-kerja"
                                    className="flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-[#F0F7F1] rounded-xl font-medium text-[14px] text-[#2D6A4F] border border-[#D4E4D8] transition-all"
                                >
                                    Lihat Cara Kerja
                                </a>
                            </motion.div>

                            {/* Trust strip */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[12px] text-[#A8C5B0] font-medium"
                            >
                                <span className="flex items-center gap-1.5"><ShieldCheckIcon className="w-3.5 h-3.5 text-[#74C69D]" />Gratis selamanya</span>
                                <span className="w-1 h-1 rounded-full bg-[#D4E4D8]" />
                                <span className="flex items-center gap-1.5"><BoltIcon className="w-3.5 h-3.5 text-[#74C69D]" />Setup 30 detik</span>
                                <span className="w-1 h-1 rounded-full bg-[#D4E4D8]" />
                                <span className="flex items-center gap-1.5"><HeartIcon className="w-3.5 h-3.5 text-[#74C69D]" />Tanpa iklan</span>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* ═══════ STATS ═══════ */}
                <AnimatedSection id="stats" className="border-y border-[#D4E4D8] bg-white">
                    <motion.div variants={fadeIn} className="container mx-auto px-6 py-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#D4E4D8]">
                            {[
                                { val: 10, suffix: 'K+', label: 'Pengguna Aktif' },
                                { val: 500, suffix: 'K+', label: 'Tugas Diselesaikan' },
                                { val: 50, suffix: '+', label: 'Achievements' },
                                { val: 49, suffix: '/5 ★', label: 'Rating Pengguna' },
                            ].map((s, i) => (
                                <div key={i} className="text-center py-4 px-2">
                                    <div className="text-[26px] md:text-[30px] font-bold text-[#1A1F1C] tracking-tight leading-none mb-1">
                                        <Counter target={s.val} suffix={s.suffix} />
                                    </div>
                                    <div className="text-[11px] text-[#6B7C74] font-medium uppercase tracking-wider">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatedSection>

                {/* ═══════ PROBLEM STATEMENT (dark) ═══════ */}
                <AnimatedSection id="problem" className="py-24 px-6 bg-[#1A1F1C]">
                    <div className="container mx-auto max-w-4xl">
                        <div className="text-center mb-14">
                            <motion.span
                                variants={fadeUp}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D3A31] text-[#74C69D] text-[11px] font-semibold uppercase tracking-widest mb-5"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#74C69D]" />
                                Ini masalahnya
                            </motion.span>
                            <motion.h2
                                variants={fadeUp}
                                className="text-[clamp(1.8rem,4vw,3rem)] text-white leading-[1.2] tracking-tight max-w-2xl mx-auto"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                App produktivitas lain <em className="text-[#74C69D]">menambah masalah,</em><br />bukan menyelesaikannya.
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-[14px] text-[#6B7C74] mt-4 max-w-lg mx-auto leading-relaxed">
                                Notion terlalu bebas. Jira terlalu complex. ClickUp terlalu banyak fitur. Kamu habiskan 30 menit setup, bukan kerja.
                            </motion.p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                                { icon: '📋', title: 'Terlalu banyak pilihan', desc: 'Infinite canvas = infinite procrastination. Kamu setup template, bukan selesaikan tugas.' },
                                { icon: '🤯', title: 'Semua terasa urgent', desc: 'Tanpa batas jumlah task, otak kamu overwhelm. Akhirnya yang dikerjain malah yang paling gampang.' },
                                { icon: '🔋', title: 'Produktif tapi burnout', desc: 'Kerja keras, tapi nggak ada yang terasa selesai. Karena list-nya nggak pernah habis.' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    variants={scaleIn}
                                    className="p-6 rounded-2xl bg-[#252C28] border border-[#2D3A31] hover:border-[#2D6A4F]/40 transition-colors group"
                                >
                                    <div className="text-2xl mb-4">{item.icon}</div>
                                    <h3 className="text-[14px] font-semibold text-[#D8F3DC] mb-2 group-hover:text-white transition-colors">{item.title}</h3>
                                    <p className="text-[12px] text-[#6B7C74] leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* ═══════ HOW IT WORKS ═══════ */}
                <AnimatedSection id="cara-kerja" className="py-24 px-6 bg-[#F0F7F1]">
                    <div className="container mx-auto max-w-5xl">
                        <div className="text-center mb-16">
                            <motion.p variants={fadeUp} className="text-[11px] font-semibold text-[#2D6A4F] uppercase tracking-[0.2em] mb-3">Solusinya</motion.p>
                            <motion.h2
                                variants={fadeUp}
                                className="text-[clamp(1.8rem,4vw,3rem)] text-[#1A1F1C] tracking-tight"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                Tiga langkah. Bukan tiga puluh.
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-[14px] text-[#6B7C74] mt-3 max-w-sm mx-auto leading-relaxed">
                                Sistem sederhana yang benar-benar bisa dijalankan setiap hari — tanpa setup ulang, tanpa overthinking.
                            </motion.p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-5">
                            {[
                                {
                                    step: '01', icon: <SparklesIcon className="w-5 h-5" />,
                                    title: 'Pilih 3 Tugas', desc: 'Setiap hari, pilih 3 tugas terpenting. AI kami bantu merekomendasikan berdasarkan deadline & prioritas.',
                                    bg: 'bg-white', border: 'border-[#D4E4D8]', iconBg: 'bg-[#D8F3DC]', iconColor: 'text-[#2D6A4F]', numColor: 'text-[#E8F4EC]',
                                },
                                {
                                    step: '02', icon: <ClockIcon className="w-5 h-5" />,
                                    title: 'Fokus & Kerjakan', desc: 'Mulai Pomodoro Timer. Cuma kamu dan tugasmu. Notifikasi? Diblokir dulu.',
                                    bg: 'bg-[#2D6A4F]', border: 'border-transparent', iconBg: 'bg-white/15', iconColor: 'text-white', numColor: 'text-[#255A40]', dark: true,
                                },
                                {
                                    step: '03', icon: <TrophyIcon className="w-5 h-5" />,
                                    title: 'Rayakan & Ulang', desc: 'Selesaikan tugas, raih XP, naik level bersama guild. Besok ulangi lagi.',
                                    bg: 'bg-white', border: 'border-[#D4E4D8]', iconBg: 'bg-[#FFF3DC]', iconColor: 'text-[#92590A]', numColor: 'text-[#E8F4EC]',
                                },
                            ].map(item => (
                                <motion.div
                                    key={item.step}
                                    variants={scaleIn}
                                    className={`relative p-8 rounded-2xl border overflow-hidden ${item.bg} ${item.border}`}
                                >
                                    <div
                                        className={`absolute right-5 top-3 text-[72px] font-bold leading-none select-none ${item.numColor}`}
                                        style={{ fontFamily: "'Instrument Serif', serif" }}
                                    >
                                        {item.step}
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center mb-5 relative z-10`}>
                                        {item.icon}
                                    </div>
                                    <h3 className={`text-[15px] font-semibold mb-2 relative z-10 ${item.dark ? 'text-white' : 'text-[#1A1F1C]'}`}>{item.title}</h3>
                                    <p className={`text-[13px] leading-relaxed relative z-10 ${item.dark ? 'text-[#74C69D]' : 'text-[#6B7C74]'}`}>{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* ═══════ FEATURES BENTO ═══════ */}
                <AnimatedSection id="fitur" className="py-24 px-6 bg-white border-y border-[#D4E4D8]">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-14">
                            <motion.p variants={fadeUp} className="text-[11px] font-semibold text-[#2D6A4F] uppercase tracking-[0.2em] mb-3">Fitur Inti</motion.p>
                            <motion.h2
                                variants={fadeUp}
                                className="text-[clamp(1.8rem,4vw,3rem)] text-[#1A1F1C] tracking-tight"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                Semua yang perlu. Tidak lebih.
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-[14px] text-[#6B7C74] mt-3 max-w-sm mx-auto leading-relaxed">
                                Dirancang supaya kamu fokus ke yang penting, bukan terjebak di fitur yang nggak perlu.
                            </motion.p>
                        </div>

                        {/* Bento Row 1 */}
                        <div className="grid md:grid-cols-5 gap-4 mb-4">
                            {/* Smart Focus — wide dark */}
                            <motion.div
                                variants={scaleIn}
                                className="md:col-span-3 p-8 rounded-2xl bg-[#1A1F1C] overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 rounded-full"
                                    style={{ background: 'radial-gradient(circle, #2D6A4F40 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
                                <div className="relative z-10">
                                    <span className="text-[10px] font-semibold text-[#74C69D] uppercase tracking-widest mb-3 block">Smart Focus</span>
                                    <h3 className="text-[20px] font-semibold text-white mb-3 leading-snug" style={{ fontFamily: "'Instrument Serif', serif" }}>
                                        AI pilihkan 3 tugas<br />terbaik untukmu setiap pagi
                                    </h3>
                                    <p className="text-[13px] text-[#6B7C74] leading-relaxed mb-6 max-w-xs">
                                        Berdasarkan deadline, prioritas, dan kebiasaan kerjamu. Nggak ada lagi yang terlewat.
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        {['Desain UI ✓', 'Laporan KPI', 'Review PR'].map((t, i) => (
                                            <div
                                                key={i}
                                                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium ${i === 0 ? 'bg-[#2D6A4F] text-[#D8F3DC]' : 'bg-[#252C28] text-[#6B7C74]'}`}
                                            >
                                                {t}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Pomodoro */}
                            <motion.div
                                variants={scaleIn}
                                className="md:col-span-2 p-7 rounded-2xl bg-[#F7F9F7] border border-[#D4E4D8] flex flex-col"
                            >
                                <div className="w-9 h-9 rounded-xl bg-[#D8F3DC] flex items-center justify-center text-[#2D6A4F] mb-4">
                                    <ClockIcon className="w-4 h-4" />
                                </div>
                                <h3 className="text-[15px] font-semibold text-[#1A1F1C] mb-1">Pomodoro Timer</h3>
                                <p className="text-[12px] text-[#6B7C74] mb-5 leading-relaxed">Klik dan langsung mulai fokus. Istirahat otomatis setelah 25 menit.</p>
                                <div className="font-mono text-[40px] font-bold text-[#1A1F1C] tracking-tight leading-none mb-3">25:00</div>
                                <div className="w-full h-[3px] bg-[#D4E4D8] rounded-full overflow-hidden mt-auto">
                                    <div className="w-0 h-full bg-[#2D6A4F] rounded-full" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Bento Row 2 */}
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            {/* Guild */}
                            <motion.div
                                variants={scaleIn}
                                className="p-7 rounded-2xl bg-[#D8F3DC] border border-[#A8C5B0]/30"
                            >
                                <div className="w-9 h-9 rounded-xl bg-[#2D6A4F]/15 flex items-center justify-center mb-4">
                                    <UserGroupIcon className="w-4 h-4 text-[#2D6A4F]" />
                                </div>
                                <h3 className="text-[15px] font-semibold text-[#1B4332] mb-2">Guild System</h3>
                                <p className="text-[12px] text-[#2D6A4F] leading-relaxed">Bentuk tim kecil, selesaikan challenge harian bersama. Akuntabilitas tanpa tekanan.</p>
                            </motion.div>

                            {/* XP Streak */}
                            <motion.div
                                variants={scaleIn}
                                className="p-7 rounded-2xl bg-[#FFF8EE] border border-[#F4D9A0]/40"
                            >
                                <div className="w-9 h-9 rounded-xl bg-[#FFF3DC] flex items-center justify-center mb-4">
                                    <FireIcon className="w-4 h-4 text-[#92590A]" />
                                </div>
                                <h3 className="text-[15px] font-semibold text-[#1A1F1C] mb-1">XP & Streak</h3>
                                <div className="text-[28px] font-bold text-[#1A1F1C] my-2">🔥 14 hari</div>
                                <p className="text-[12px] text-[#92590A] leading-relaxed">Pertahankan streak harian, kumpulkan XP, naik level tiap minggu.</p>
                            </motion.div>

                            {/* WA Reminder */}
                            <motion.div
                                variants={scaleIn}
                                className="p-7 rounded-2xl bg-[#F7F9F7] border border-[#D4E4D8]"
                            >
                                <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] flex items-center justify-center mb-4">
                                    <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-[#16A34A]" />
                                </div>
                                <h3 className="text-[15px] font-semibold text-[#1A1F1C] mb-3">WhatsApp Reminder</h3>
                                <div className="p-3 bg-white rounded-xl border border-[#D4E4D8] text-[11px] text-[#1A1F1C] leading-relaxed">
                                    📱 <strong>Hei!</strong> Tugas "Desain UI" belum dikerjakan 2 hari.{' '}
                                    <span className="text-[#2D6A4F] font-medium">Yuk lanjut →</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Kanban full-width */}
                        <motion.div
                            variants={scaleIn}
                            className="p-7 rounded-2xl bg-[#1A1F1C] border border-[#2D3A31] flex flex-col md:flex-row md:items-center gap-6"
                        >
                            <div className="flex-1">
                                <span className="text-[10px] font-semibold text-[#74C69D] uppercase tracking-widest mb-2 block">Kanban Board</span>
                                <h3 className="text-[18px] font-semibold text-white mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>Atur tugas secara visual</h3>
                                <p className="text-[12px] text-[#6B7C74]">Drag, drop, selesai. Personal & guild board dalam satu tempat.</p>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                {[
                                    { label: 'To Do', count: 4, color: 'bg-[#252C28] text-[#6B7C74]' },
                                    { label: 'In Progress', count: 2, color: 'bg-[#2D6A4F]/20 text-[#74C69D]' },
                                    { label: 'Done', count: 7, color: 'bg-[#1B4332] text-[#D8F3DC]' },
                                ].map(col => (
                                    <div key={col.label} className={`px-4 py-2.5 rounded-xl text-center ${col.color}`}>
                                        <div className="text-[18px] font-bold leading-none">{col.count}</div>
                                        <div className="text-[10px] mt-0.5 font-medium">{col.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </AnimatedSection>

                {/* ═══════ SDGs SECTION ═══════ */}
                <section className="py-20 px-6 bg-[#2D6A4F] relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0"
                        style={{ background: 'radial-gradient(ellipse 60% 80% at 80% 50%, #1B4332 0%, transparent 70%)' }} />
                    <div className="container mx-auto max-w-4xl relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#D8F3DC] text-[11px] font-semibold uppercase tracking-widest mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#74C69D]" />
                                SDGs Goal 3 · Well-being
                            </span>
                            <h2
                                className="text-[clamp(1.8rem,4vw,3rem)] text-white leading-[1.2] tracking-tight mb-4"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                Produktivitas yang menjaga,<br />
                                <em>bukan menguras.</em>
                            </h2>
                            <p className="text-[14px] text-[#74C69D] max-w-md mx-auto leading-relaxed mb-10">
                                Sarang Tumbuh dirancang untuk mendukung kesehatan mental — bukan memaksimalkan output. Karena burnout bukan prestasi.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                {[
                                    { icon: '🧠', label: 'Mental Health', desc: 'Sistem 3 tugas mencegah cognitive overload' },
                                    { icon: '⚖️', label: 'Work-Life Balance', desc: 'Timer otomatis paksa kamu istirahat' },
                                    { icon: '🤝', label: 'Social Support', desc: 'Guild sebagai sistem dukungan sosial' },
                                ].map((item, i) => (
                                    <div key={i} className="p-5 rounded-2xl bg-white/8 border border-white/10 text-center">
                                        <div className="text-2xl mb-2">{item.icon}</div>
                                        <div className="text-[13px] font-semibold text-white mb-1">{item.label}</div>
                                        <div className="text-[11px] text-[#74C69D] leading-relaxed">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ═══════ GUILD ═══════ */}
                <AnimatedSection id="guild" className="py-24 px-6 bg-[#F7F9F7]">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Visual */}
                            <motion.div variants={scaleIn} className="order-last lg:order-first">
                                <div className="p-8 rounded-3xl bg-[#2D6A4F] relative overflow-hidden shadow-2xl shadow-[#2D6A4F]/20">
                                    <div className="pointer-events-none absolute inset-0"
                                        style={{ background: 'radial-gradient(ellipse 60% 60% at 90% 10%, #1B4332 0%, transparent 70%)' }} />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-xl">🛡️</div>
                                            <div>
                                                <div className="text-[10px] font-semibold text-[#74C69D] uppercase tracking-widest">Guild</div>
                                                <div className="text-[16px] font-semibold text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Squad Produktif</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-6">
                                            {[
                                                { name: 'Rina', status: '3/3 selesai ✅', active: true },
                                                { name: 'Fikri', status: 'sedang fokus 🔥', active: false },
                                                { name: 'Sari', status: '1/3 tugas', active: false },
                                            ].map((m, i) => (
                                                <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] border ${m.active ? 'bg-white/15 border-white/20' : 'bg-white/8 border-white/8'}`}>
                                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">{m.name[0]}</div>
                                                    <span className={m.active ? 'text-white font-medium' : 'text-[#74C69D]'}>{m.name} — {m.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[{ v: '12', l: 'Anggota' }, { v: '🔥 8', l: 'Streak' }, { v: '#3', l: 'Ranking' }].map((s, i) => (
                                                <div key={i} className="p-3 rounded-xl bg-white/10 text-center">
                                                    <div className="text-[16px] font-bold text-white">{s.v}</div>
                                                    <div className="text-[10px] text-[#74C69D] uppercase tracking-wider mt-0.5">{s.l}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Copy */}
                            <motion.div variants={fadeUp}>
                                <p className="text-[11px] font-semibold text-[#2D6A4F] uppercase tracking-[0.2em] mb-3">Lebih kuat bersama</p>
                                <h2
                                    className="text-[clamp(1.8rem,4vw,3rem)] text-[#1A1F1C] leading-tight tracking-tight mb-5"
                                    style={{ fontFamily: "'Instrument Serif', serif" }}
                                >
                                    Produktif itu nggak<br />
                                    <em className="text-[#2D6A4F]">harus sendirian.</em>
                                </h2>
                                <p className="text-[14px] text-[#6B7C74] mb-8 leading-relaxed max-w-sm">
                                    Buat guild, ajak teman atau rekan kerja. Lihat progress satu sama lain dan selesaikan challenge bareng setiap hari.
                                </p>
                                <div className="space-y-3">
                                    {[
                                        { icon: '🎯', title: 'Challenge Harian', desc: 'Misi bersama yang mendorong semua anggota tetap on track.' },
                                        { icon: '📊', title: 'Leaderboard Guild', desc: 'Kompetisi sehat — siapa paling rajin minggu ini?' },
                                        { icon: '📝', title: 'Dokumen Bersama', desc: 'Kanban & catatan yang bisa diakses semua anggota guild.' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-3 items-start p-4 rounded-xl bg-white border border-[#D4E4D8] hover:border-[#A8C5B0] hover:shadow-sm transition-all">
                                            <div className="w-9 h-9 rounded-xl bg-[#D8F3DC] flex items-center justify-center text-[16px] flex-shrink-0">{item.icon}</div>
                                            <div>
                                                <h3 className="font-semibold text-[#1A1F1C] text-[13px] mb-0.5">{item.title}</h3>
                                                <p className="text-[12px] text-[#6B7C74]">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* ═══════ COMPARISON ═══════ */}
                <AnimatedSection id="perbandingan" className="py-24 px-6 bg-white border-t border-[#D4E4D8]">
                    <div className="container mx-auto max-w-5xl">
                        <div className="text-center mb-16">
                            <motion.p variants={fadeUp} className="text-[11px] font-semibold text-[#2D6A4F] uppercase tracking-[0.2em] mb-3">Kenapa Sarang Tumbuh?</motion.p>
                            <motion.h2
                                variants={fadeUp}
                                className="text-[clamp(1.8rem,4vw,3.2rem)] text-[#1A1F1C] leading-tight tracking-tight mb-5"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                Kita bukan sekadar<br />aplikasi <em className="text-[#2D6A4F]">to-do list biasa.</em>
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-[14px] text-[#6B7C74] max-w-md mx-auto">
                                Fokus pada yang penting, kurangi overwhelmed. Lihat bedanya dengan yang lain.
                            </motion.p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 relative">
                            {/* VS Badge */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-[#D4E4D8] text-[12px] font-black text-[#1A1F1C] flex items-center justify-center z-10 shadow-sm hidden md:flex">
                                VS
                            </div>

                            {/* Tools Lain */}
                            <motion.div variants={fadeUp} className="p-8 lg:p-10 rounded-[2rem] bg-[#F7F9F7] border border-[#D4E4D8]">
                                <div className="text-[#6B7C74] font-semibold text-[15px] mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-[#D4E4D8] flex items-center justify-center shadow-sm">❌</div>
                                    Aplikasi Produktivitas Lain
                                </div>
                                <ul className="space-y-5">
                                    {[
                                        'Fitur terlalu banyak, bikin bingung mau mulai dari mana.',
                                        'To-do list menumpuk ratusan tugas tanpa prioritas.',
                                        'Hanya mencatat tugas, tidak bantu cara mengerjakannya.',
                                        'Sendirian, terasa sepi dan kurang motivasi eksternal.',
                                        'Kaku, tidak bisa menyesuaikan dengan kebiasaanmu.'
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-4 text-[13.5px] text-[#6B7C74] items-start leading-relaxed">
                                            <span className="text-[#A8C5B0] mt-0.5 mt-1 border border-[#D4E4D8] rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 text-[10px]">−</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Sarang Tumbuh */}
                            <motion.div variants={fadeUp} className="p-8 lg:p-10 rounded-[2rem] bg-[#2D6A4F] relative overflow-hidden shadow-2xl shadow-[#2D6A4F]/20 md:scale-[1.03] origin-left">
                                <div className="pointer-events-none absolute inset-0"
                                    style={{ background: 'radial-gradient(ellipse 60% 60% at 90% 10%, #1B4332 0%, transparent 70%)' }} />
                                <div className="relative z-10">
                                    <div className="text-white font-semibold text-[15px] mb-8 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center shadow-sm backdrop-blur-sm">✅</div>
                                        Ekosistem Sarang Tumbuh
                                    </div>
                                    <ul className="space-y-5">
                                        {[
                                            'Simpel dan langsung ke inti. Fokus, bukan setup rumit.',
                                            'Paksaan positif: cuma boleh fokus 3 tugas per hari.',
                                            'Dilengkapi Timer, AI dan Quick Notes untuk temani fokus.',
                                            'Ada Guild dan Leaderboard biar makin semangat bareng teman.',
                                            'Gamifikasi yang rewarding: leveling, XP, dan karakter visual.'
                                        ].map((item, i) => (
                                            <li key={i} className="flex gap-4 text-[13.5px] text-white/90 items-start leading-relaxed">
                                                <span className="text-[#74C69D] mt-0.5 mt-1 border border-[#74C69D]/30 bg-[#74C69D]/20 rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* ═══════ TESTIMONIALS ═══════ */}
                <AnimatedSection id="testimoni" className="py-24 bg-[#F7F9F7] border-t border-[#D4E4D8] overflow-hidden">
                    <div className="container mx-auto mb-12 px-6">
                        <motion.div variants={fadeUp} className="text-center">
                            <p className="text-[11px] font-semibold text-[#2D6A4F] uppercase tracking-[0.2em] mb-3">Kata mereka</p>
                            <h2
                                className="text-[clamp(1.8rem,4vw,3rem)] text-[#1A1F1C] tracking-tight"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                Bukan cuma kami yang bilang.
                            </h2>
                        </motion.div>
                    </div>
                    <motion.div variants={fadeIn} className="space-y-4">
                        <Marquee direction="left" speed={40}>
                            {testimonials.slice(0, 4).map((t, i) => (
                                <div key={i} className="w-[320px] flex-shrink-0 p-5 rounded-2xl bg-white border border-[#D4E4D8] mx-2">
                                    <div className="flex gap-0.5 mb-3">
                                        {[...Array(5)].map((_, si) => (
                                            <StarIcon key={si} className="h-3.5 w-3.5 fill-[#F4A261] text-[#F4A261]" />
                                        ))}
                                    </div>
                                    <p className="text-[13px] text-[#6B7C74] leading-relaxed mb-4">"{t.quote}"</p>
                                    <div className="flex items-center gap-2.5 pt-3 border-t border-[#D4E4D8]">
                                        <div className="w-7 h-7 rounded-full bg-[#D8F3DC] flex items-center justify-center text-[11px] font-semibold text-[#1B4332]">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[#1A1F1C] text-[12px]">{t.name}</div>
                                            <div className="text-[10px] text-[#A8C5B0]">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Marquee>
                        <Marquee direction="right" speed={50}>
                            {testimonials.slice(4).map((t, i) => (
                                <div key={i} className="w-[320px] flex-shrink-0 p-5 rounded-2xl bg-white border border-[#D4E4D8] mx-2">
                                    <div className="flex gap-0.5 mb-3">
                                        {[...Array(5)].map((_, si) => (
                                            <StarIcon key={si} className="h-3.5 w-3.5 fill-[#F4A261] text-[#F4A261]" />
                                        ))}
                                    </div>
                                    <p className="text-[13px] text-[#6B7C74] leading-relaxed mb-4">"{t.quote}"</p>
                                    <div className="flex items-center gap-2.5 pt-3 border-t border-[#D4E4D8]">
                                        <div className="w-7 h-7 rounded-full bg-[#D8F3DC] flex items-center justify-center text-[11px] font-semibold text-[#1B4332]">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[#1A1F1C] text-[12px]">{t.name}</div>
                                            <div className="text-[10px] text-[#A8C5B0]">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Marquee>
                    </motion.div>
                </AnimatedSection>

                {/* ═══════ PRICING ═══════ */}
                <AnimatedSection id="harga" className="py-24 px-6 bg-[#F7F9F7]">
                    <div className="container mx-auto max-w-3xl">
                        <div className="text-center mb-14">
                            <motion.p variants={fadeUp} className="text-[11px] font-semibold text-[#2D6A4F] uppercase tracking-[0.2em] mb-3">Harga</motion.p>
                            <motion.h2
                                variants={fadeUp}
                                className="text-[clamp(1.8rem,4vw,3rem)] text-[#1A1F1C] tracking-tight"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                Mulai gratis, upgrade kapan saja.
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-[14px] text-[#6B7C74] mt-3">
                                Tidak ada biaya tersembunyi. Tidak ada trial yang expire.
                            </motion.p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-5">
                            {pricingPlans.map((plan) => (
                                <motion.div
                                    key={plan.plan}
                                    variants={scaleIn}
                                    className={`relative p-7 rounded-2xl transition-all ${plan.highlighted
                                        ? 'bg-[#1A1F1C] text-white shadow-2xl shadow-[#1A1F1C]/15 md:scale-[1.04] z-10'
                                        : 'bg-white border border-[#D4E4D8] hover:shadow-md'
                                        }`}
                                >
                                    {plan.highlighted && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#F4A261] text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow">
                                            Populer
                                        </div>
                                    )}
                                    {plan.badge && !plan.highlighted && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#2D6A4F] text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow">
                                            {plan.badge}
                                        </div>
                                    )}
                                    <h3 className={`text-[15px] font-semibold mb-1 ${plan.highlighted ? 'text-white' : 'text-[#1A1F1C]'}`}>{plan.plan}</h3>
                                    {plan.desc && <p className={`text-[12px] mb-5 ${plan.highlighted ? 'text-[#6B7C74]' : 'text-[#A8C5B0]'}`}>{plan.desc}</p>}
                                    <div className={`text-[32px] font-bold mb-6 tracking-tight leading-none ${plan.highlighted ? 'text-white' : 'text-[#1A1F1C]'}`}>
                                        {plan.price}
                                        {plan.priceSub && (
                                            <span className={`text-[14px] font-normal ${plan.highlighted ? 'text-[#6B7C74]' : 'text-[#A8C5B0]'}`}>{plan.priceSub}</span>
                                        )}
                                    </div>
                                    <ul className="space-y-2 mb-7">
                                        {plan.features.map(f => (
                                            <li key={f} className={`flex gap-2 text-[12px] items-center ${plan.highlighted ? 'text-[#A8C5B0]' : 'text-[#6B7C74]'}`}>
                                                <CheckIcon className={`w-3.5 h-3.5 flex-shrink-0 ${plan.highlighted ? 'text-[#74C69D]' : 'text-[#2D6A4F]'}`} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <a
                                        href="/register"
                                        className={`block py-3 px-6 rounded-xl text-center font-semibold text-[13px] transition-all ${plan.highlighted
                                            ? 'bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-lg shadow-[#2D6A4F]/25'
                                            : 'bg-[#F0F7F1] hover:bg-[#D8F3DC] text-[#2D6A4F]'
                                            }`}
                                    >
                                        {plan.price === 'Gratis' ? 'Mulai Gratis' : plan.highlighted ? 'Upgrade Sekarang' : 'Pilih Paket'}
                                    </a>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* ═══════ FAQ ═══════ */}
                <AnimatedSection id="faq" className="py-24 px-6 bg-white border-t border-[#D4E4D8]">
                    <div className="container mx-auto max-w-xl">
                        <div className="text-center mb-12">
                            <motion.h2
                                variants={fadeUp}
                                className="text-[clamp(1.8rem,4vw,3rem)] text-[#1A1F1C] tracking-tight mb-2"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                Ada pertanyaan?
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-[14px] text-[#6B7C74]">
                                Hal-hal yang sering ditanyakan.
                            </motion.p>
                        </div>
                        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-[#D4E4D8] px-7">
                            {faqData.map((faq, i) => <FAQItem key={i} question={faq.question} answer={faq.answer} />)}
                        </motion.div>
                    </div>
                </AnimatedSection>

                {/* ═══════ ROADMAP (Horizontal Timeline) ═══════ */}
                <AnimatedSection id="roadmap" className="py-24 bg-[#F7F9F7] border-t border-[#D4E4D8]">
                    <div className="container mx-auto max-w-6xl px-6">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
                            <div>
                                <motion.p variants={fadeUp} className="text-[11px] font-semibold text-[#2D6A4F] uppercase tracking-[0.2em] mb-3">Roadmap</motion.p>
                                <motion.h2
                                    variants={fadeUp}
                                    className="text-[clamp(1.8rem,4vw,3rem)] text-[#1A1F1C] tracking-tight"
                                    style={{ fontFamily: "'Instrument Serif', serif" }}
                                >
                                    Ini yang sedang & akan kami bangun.
                                </motion.h2>
                                <motion.p variants={fadeUp} className="text-[14px] text-[#6B7C74] mt-3 max-w-sm leading-relaxed">
                                    Transparan, terbuka, dan dibangun bersama komunitas.
                                </motion.p>
                            </div>
                            <motion.a
                                variants={fadeUp}
                                href="/roadmap"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D4E4D8] bg-white text-[#2D6A4F] text-[13px] font-semibold hover:bg-[#F0F7F1] hover:border-[#A8C5B0] transition-all flex-shrink-0 self-start md:self-auto"
                            >
                                Lihat Roadmap Lengkap
                                <ArrowRightIcon className="w-3.5 h-3.5" />
                            </motion.a>
                        </div>
                    </div>

                    {/* Horizontal scroll container */}
                    <div className="relative">
                        {/* Gradient edges */}
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#F7F9F7] to-transparent z-10" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#F7F9F7] to-transparent z-10" />

                        <motion.div
                            variants={fadeIn}
                            className="flex gap-5 overflow-x-auto pb-6 pt-2 px-6 snap-x snap-mandatory scrollbar-hide"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                        >
                            {/* Left spacer for centering */}
                            <div className="flex-shrink-0 w-[max(0px,calc((100vw-72rem)/2))]" />

                            {[
                                {
                                    status: 'shipped', label: 'Sudah Rilis',
                                    quarter: 'Q1 2025',
                                    items: ['Smart 3 Tasks harian', 'Pomodoro Timer terintegrasi', 'Guild System & leaderboard', 'XP, streak & level system', 'Kanban Board personal'],
                                },
                                {
                                    status: 'shipped', label: 'Sudah Rilis',
                                    quarter: 'Q2 2025',
                                    items: ['WhatsApp Reminder otomatis', 'AI Smart Focus (rekomendasi tugas)', 'Guild challenge harian', 'Dokumen & catatan bersama guild'],
                                },
                                {
                                    status: 'inprogress', label: 'Sedang Dibangun',
                                    quarter: 'Q3 2025',
                                    items: ['Windows Desktop App', 'Pixel Companion (karakter 16-bit)', 'Learning Hub — materi premium', 'Badge & achievement system v2'],
                                },
                                {
                                    status: 'planned', label: 'Direncanakan',
                                    quarter: 'Q4 2025',
                                    items: ['Mobile App (iOS & Android)', 'API publik untuk integrasi', 'Affiliate program', 'Document Hub — simpan & share'],
                                },
                                {
                                    status: 'idea', label: 'Ide & Eksplorasi',
                                    quarter: '2026+',
                                    items: ['AI journaling & refleksi harian', 'Integrasi kalender (Google, Outlook)', 'Marketplace template guild', 'Mode offline penuh'],
                                },
                            ].map((phase, i, arr) => {
                                const statusConfig = {
                                    shipped: { dot: 'bg-[#2D6A4F]', badge: 'bg-[#D8F3DC] text-[#1B4332]', border: 'border-[#A8C5B0]', line: 'bg-[#2D6A4F]' },
                                    inprogress: { dot: 'bg-[#F4A261]', badge: 'bg-[#FFF3DC] text-[#92590A]', border: 'border-[#F4D9A0]', line: 'bg-[#F4A261]' },
                                    planned: { dot: 'bg-[#A8C5B0]', badge: 'bg-[#F0F7F1] text-[#2D6A4F]', border: 'border-[#D4E4D8]', line: 'bg-[#D4E4D8]' },
                                    idea: { dot: 'bg-[#D4E4D8]', badge: 'bg-[#F7F9F7] text-[#6B7C74]', border: 'border-[#E8EFEB]', line: 'bg-[#E8EFEB]' },
                                }[phase.status];

                                return (
                                    <div key={i} className="flex-shrink-0 snap-start flex flex-col items-center" style={{ width: '280px' }}>
                                        {/* Dot + connector line */}
                                        <div className="flex items-center w-full mb-5">
                                            {/* Left line */}
                                            <div className={`flex-1 h-[2px] ${i === 0 ? 'bg-transparent' : statusConfig.line}`} />
                                            {/* Dot */}
                                            <div className={`w-10 h-10 rounded-full border-[3px] border-[#F7F9F7] shadow-sm flex items-center justify-center flex-shrink-0 ${statusConfig.dot}`}>
                                                {phase.status === 'shipped' && <CheckIcon className="w-4 h-4 text-white" />}
                                                {phase.status === 'inprogress' && <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />}
                                                {phase.status === 'planned' && <span className="w-2 h-2 rounded-full bg-white/60" />}
                                                {phase.status === 'idea' && <span className="w-2 h-2 rounded-full bg-white/40" />}
                                            </div>
                                            {/* Right line */}
                                            <div className={`flex-1 h-[2px] ${i === arr.length - 1 ? 'bg-transparent' : 'bg-[#D4E4D8]'}`} />
                                        </div>

                                        {/* Card */}
                                        <motion.div
                                            whileHover={{ y: -4 }}
                                            className={`w-full p-5 rounded-2xl bg-white border ${statusConfig.border} hover:shadow-lg transition-all cursor-default`}
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusConfig.badge}`}>
                                                    {phase.label}
                                                </span>
                                                <span className="text-[11px] text-[#A8C5B0] font-medium">{phase.quarter}</span>
                                            </div>
                                            <ul className="space-y-1.5">
                                                {phase.items.map((item, j) => (
                                                    <li key={j} className={`flex items-center gap-2 text-[12px] ${phase.status === 'shipped' ? 'text-[#1A1F1C]' : 'text-[#6B7C74]'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusConfig.dot}`} />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    </div>
                                );
                            })}

                            {/* Right spacer */}
                            <div className="flex-shrink-0 w-[max(0px,calc((100vw-72rem)/2))]" />
                        </motion.div>

                        {/* Scroll hint */}
                        <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mt-4 text-[12px] text-[#A8C5B0] font-medium">
                            <span>← Swipe untuk melihat timeline →</span>
                        </motion.div>
                    </div>
                </AnimatedSection>

                {/* ═══════ FINAL CTA ═══════ */}
                <section className="py-20 px-6">
                    <div className="container mx-auto max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative p-12 md:p-16 rounded-3xl bg-[#1A1F1C] text-white text-center overflow-hidden"
                        >
                            <div className="pointer-events-none absolute inset-0"
                                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #2D6A4F50 0%, transparent 70%)' }} />
                            <div className="relative z-10">
                                <h2
                                    className="text-[clamp(1.8rem,4vw,3rem)] tracking-tight leading-tight mb-4"
                                    style={{ fontFamily: "'Instrument Serif', serif" }}
                                >
                                    Mulai hari ini.<br />
                                    <em>Selesaikan 3 tugas pertamamu.</em>
                                </h2>
                                <p className="text-[14px] text-[#6B7C74] mb-8 max-w-xs mx-auto leading-relaxed">
                                    Gratis selamanya. Setup 30 detik. Tanpa kartu kredit.
                                </p>
                                <motion.a
                                    href="/register"
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="group inline-flex items-center gap-2 px-8 py-3.5 bg-[#2D6A4F] hover:bg-[#74C69D] hover:text-[#1B4332] rounded-xl font-semibold text-[14px] text-white transition-all shadow-xl shadow-[#2D6A4F]/30"
                                >
                                    Mulai Gratis Sekarang
                                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </motion.a>
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
                                        <li key={l}><a href={`#${l.toLowerCase()}`} className="hover:text-[#2D6A4F] transition-colors">{l}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-[11px] text-[#1A1F1C] mb-3 uppercase tracking-widest">Lainnya</h4>
                                <ul className="space-y-2 text-[12px] text-[#6B7C74]">
                                    <li><a href="#faq" className="hover:text-[#2D6A4F] transition-colors">FAQ</a></li>
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

export default function OdysseyLandingPage(props) {
    return (
        <LanguageProvider>
            <LandingPageContent {...props} />
        </LanguageProvider>
    );
}