import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Head, Link } from '@inertiajs/react';
import Lenis from '@studio-freight/lenis';
import {
  CheckIcon, ArrowRightIcon, StarIcon, UserGroupIcon, SparklesIcon,
  ClockIcon, ChevronDownIcon, GlobeAltIcon, BoltIcon, ShieldCheckIcon,
  HeartIcon, FireIcon, AcademicCapIcon, TrophyIcon, ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { useLanguage, LanguageProvider } from '@/Contexts/LanguageContext';

const FaTwitter = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const FaInstagram = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2z" clipRule="evenodd" /></svg>;

// ── Animated Section ──
const AnimatedSection = ({ children, className = '', id = '' }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 });
  return (
    <motion.section id={id} ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className={className}>
      {children}
    </motion.section>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

// ── Animated Counter ──
const Counter = ({ target, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(target);
    if (isNaN(end)) return;
    const step = Math.max(1, Math.floor(end / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{prefix}{count.toLocaleString('id')}{suffix}</span>;
};

// ── FAQ ──
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div variants={fadeUp} className="border-b border-slate-100 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-5 text-left focus:outline-none group">
        <span className="text-[15px] font-semibold text-slate-800 pr-8 group-hover:text-emerald-600 transition-colors">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="flex-shrink-0">
          <ChevronDownIcon className="w-5 h-5 text-slate-300" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <p className="pb-5 text-slate-500 text-sm leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Marquee ──
const Marquee = ({ children, direction = 'left', speed = 35, className = '' }) => (
  <div className={`relative flex w-full overflow-hidden ${className}`}>
    <motion.div className="flex min-w-full shrink-0 items-center justify-around gap-6"
      animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
      transition={{ ease: 'linear', duration: speed, repeat: Infinity }}>{children}</motion.div>
    <motion.div className="flex min-w-full shrink-0 items-center justify-around gap-6"
      animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
      transition={{ ease: 'linear', duration: speed, repeat: Infinity }}>{children}</motion.div>
    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FAFBFC] to-transparent z-10"></div>
    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FAFBFC] to-transparent z-10"></div>
  </div>
);

// ── Floating Orb ──
const Orb = ({ className, delay = 0 }) => (
  <motion.div className={`absolute rounded-full blur-3xl ${className}`}
    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: 'easeInOut' }} />
);

// ══════════════════════════════════════════════════
// MAIN LANDING PAGE
// ══════════════════════════════════════════════════
function LandingPageContent({ plans = [] }) {
  const { t, language, toggleLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2 });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }, []);

  useEffect(() => { document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto'; }, [isMenuOpen]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const pricingPlans = useMemo(() => {
    if (!plans || plans.length === 0) {
      return [
        { plan: 'Starter', price: { monthly: 'Gratis' }, desc: 'Untuk memulai kebiasaan baru', features: ['3 tugas fokus harian', 'Timer Pomodoro', 'Kanban pribadi', 'Bergabung 1 Guild', 'Companion pixel art'] },
        { plan: 'Pro', price: { monthly: 20000 }, desc: 'Untuk produktivitas serius', features: ['Semua fitur Starter', 'AI Smart Focus', 'Guild tanpa batas', 'WhatsApp reminder', 'Laporan mingguan', 'Badge eksklusif'], highlighted: true },
      ];
    }
    return plans.map(p => ({
      plan: p.name, price: { monthly: p.price }, features: p.features || [],
      highlighted: p.name.toLowerCase().includes('navigator') || p.name.toLowerCase().includes('pro') || p.name.toLowerCase().includes('premium'),
      id: p.id
    }));
  }, [plans]);

  const testimonials = [
    { quote: "Akhirnya nemu app yang ngerti kalau produktif itu bukan soal banyak kerja, tapi kerja yang bener.", name: "Rina M.", role: "Freelance Designer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&q=80&fit=crop" },
    { quote: "Guild nya bikin semangat sih. Berasa ngerjain tugas bareng temen, padahal remote semua.", name: "Fikri A.", role: "CS Student", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&q=80&fit=crop" },
    { quote: "Smart Focus-nya paham banget tugas mana yang harus dikerjain duluan.", name: "Sari K.", role: "Product Manager", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&q=80&fit=crop" },
    { quote: "Dulu sering overwhelm lihat to-do list panjang. Sekarang cuma fokus 3 tugas. Simpel.", name: "Bayu W.", role: "Startup Founder", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&q=80&fit=crop" },
    { quote: "Companion-nya lucu dan bikin kerja nggak kerasa sendirian.", name: "Amel D.", role: "Content Creator", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&q=80&fit=crop" },
    { quote: "Pake ini buat ngatur skripsi. Guild sama temen bimbingan, jadi saling support.", name: "Dimas R.", role: "Mahasiswa S1", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&q=80&fit=crop" },
  ];

  const faqData = [
    { question: "Apa bedanya dengan to-do list biasa?", answer: "Sarang Tumbuh hanya menampilkan 3 tugas fokus harian supaya kamu tidak overwhelm, ditambah companion virtual yang menemani sesi kerjamu dan sistem guild untuk berkolaborasi." },
    { question: "Apa itu Guild?", answer: "Guild adalah tim kecil tempat kamu dan teman-teman saling support. Kalian bisa berbagi tugas, melihat progress satu sama lain, dan berlomba di leaderboard bersama." },
    { question: "Apakah gratis?", answer: "Ya! Paket Starter sepenuhnya gratis dengan fitur inti lengkap. Paket Pro membuka fitur AI, guild tanpa batas, dan WhatsApp reminder." },
    { question: "Bisa dipakai untuk kerja tim?", answer: "Tentu. Gunakan fitur Guild untuk kolaborasi. Setiap guild punya Kanban board, dokumen bersama, dan challenge harian." },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 antialiased overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Head title="Sarang Tumbuh — Teman Produktifmu" />

      {/* ═════════ NAV ═════════ */}
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-3">
          <nav className="container mx-auto px-6 py-3 flex items-center justify-between rounded-2xl bg-white/80 backdrop-blur-2xl border border-slate-200/50 shadow-sm shadow-slate-200/50">
            <div className="text-lg font-[800] text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/25">S</span>
              Sarang Tumbuh
            </div>
            <div className="hidden md:flex items-center gap-7 text-[13px] font-semibold text-slate-400 uppercase tracking-widest">
              <a href="#cara-kerja" className="hover:text-emerald-600 transition-colors">Cara Kerja</a>
              <a href="#fitur" className="hover:text-emerald-600 transition-colors">Fitur</a>
              <a href="#guild" className="hover:text-emerald-600 transition-colors">Guild</a>
              <a href="#harga" className="hover:text-emerald-600 transition-colors">Harga</a>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={toggleLanguage} className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 text-xs font-bold uppercase transition-colors">
                {language === 'id' ? '🇮🇩' : '🇬🇧'}
              </button>
              <a href="/login" className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">Masuk</a>
              <motion.a href="/register" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md">
                Coba Gratis
              </motion.a>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <button onClick={toggleLanguage} className="px-2 py-1 text-xs font-bold">{language === 'id' ? '🇮🇩' : '🇬🇧'}</button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                <div className="flex flex-col gap-1.5">
                  <motion.span animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 6 : 0 }} className="w-5 h-0.5 bg-slate-900 block rounded-full" />
                  <motion.span animate={{ opacity: isMenuOpen ? 0 : 1 }} className="w-5 h-0.5 bg-slate-900 block rounded-full" />
                  <motion.span animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -6 : 0 }} className="w-5 h-0.5 bg-slate-900 block rounded-full" />
                </div>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-white/98 backdrop-blur-3xl md:hidden flex items-center justify-center">
            <div className="flex flex-col items-center gap-5">
              {['Cara Kerja', 'Fitur', 'Guild', 'Harga'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-slate-900">{item}</a>
              ))}
              <a href="/register" className="mt-4 px-8 py-4 rounded-2xl font-bold text-lg bg-slate-900 text-white">Coba Gratis</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        {/* ═════════ HERO ═════════ */}
        <section ref={heroRef} className="min-h-[100vh] flex items-center justify-center relative pt-32 pb-24 overflow-hidden">
          <Orb className="w-[600px] h-[600px] bg-emerald-300/30 top-1/4 -right-40" />
          <Orb className="w-[400px] h-[400px] bg-teal-300/20 bottom-20 -left-20" delay={2} />
          <Orb className="w-[300px] h-[300px] bg-sky-200/20 top-40 left-1/3" delay={4} />

          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.div style={{ y: heroTextY, opacity: heroOpacity }}>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                  <SparklesIcon className="w-3.5 h-3.5" />
                </motion.div>
                Productivity Companion
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(2.8rem,8vw,6rem)] font-[900] tracking-[-0.04em] mb-6 leading-[1.05] max-w-4xl mx-auto">
                <span className="text-slate-900">Fokus tanpa drama.</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">Sendiri atau bareng.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="text-base md:text-lg text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">
                Cuma 3 tugas setiap hari. Companion yang menemani. Guild untuk saling support. Produktif tanpa overwhelm.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <motion.a href="/register" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                  className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-2xl font-bold text-white transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2">
                  Mulai Gratis <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.a>
                <Link href={route('download.windows')}
                  className="px-7 py-4 bg-white hover:bg-slate-50 rounded-2xl font-semibold text-slate-600 border border-slate-200 flex items-center gap-2 shadow-sm transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1V11.55H0V3.449zm0 8.851h9.75v9.45L0 20.401V12.3zm10.75-10.45l13.25-1.85V11.55h-13.25V1.85zM24 12.3v10.15l-13.25-1.85V12.3H24z" /></svg>
                  Windows App
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5"><ShieldCheckIcon className="w-4 h-4 text-emerald-400" /> Gratis Selamanya</span>
                <span className="flex items-center gap-1.5"><BoltIcon className="w-4 h-4 text-amber-400" /> Setup 30 Detik</span>
                <span className="flex items-center gap-1.5"><HeartIcon className="w-4 h-4 text-rose-400" /> Tanpa Iklan</span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═════════ SOCIAL PROOF STRIP ═════════ */}
        <AnimatedSection className="py-12 border-y border-slate-100 bg-white/60" id="stats">
          <motion.div variants={fadeUp} className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { val: 10, suffix: 'K+', label: 'Pengguna Aktif', color: 'from-emerald-500 to-teal-500' },
                { val: 500, suffix: 'K+', label: 'Tugas Diselesaikan', color: 'from-blue-500 to-cyan-500' },
                { val: 50, suffix: '+', label: 'Achievements', color: 'from-amber-500 to-orange-500' },
                { val: 24, suffix: '/7', label: 'Kompetisi Guild', color: 'from-violet-500 to-purple-500' },
              ].map((s, i) => (
                <div key={i}>
                  <div className={`text-3xl md:text-4xl font-[900] text-transparent bg-clip-text bg-gradient-to-r ${s.color} mb-1`}>
                    <Counter target={s.val} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatedSection>

        {/* ═════════ HOW IT WORKS ═════════ */}
        <AnimatedSection id="cara-kerja" className="py-28 px-6 relative">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-20">
              <motion.p variants={fadeUp} className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3">Sesimpel itu</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-[900] tracking-tight mb-4">Tiga langkah. Nol ribet.</motion.h2>
              <motion.p variants={fadeUp} className="text-slate-400 max-w-md mx-auto">Tidak perlu setup rumit. Langsung produktif dari menit pertama.</motion.p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '01', icon: <SparklesIcon className="w-6 h-6" />, title: 'Pilih 3 Tugas', desc: 'Setiap hari, pilih 3 tugas terpenting. AI kami bisa bantu merekomendasikan.', gradient: 'from-indigo-500 to-violet-500' },
                { step: '02', icon: <ClockIcon className="w-6 h-6" />, title: 'Fokus & Kerjakan', desc: 'Mulai timer Pomodoro, companion menemanimu. Cuma kamu dan tugasmu.', gradient: 'from-emerald-500 to-teal-500' },
                { step: '03', icon: <TrophyIcon className="w-6 h-6" />, title: 'Rayakan & Ulang', desc: 'Selesaikan tugas, raih XP, naik level. Besok ulangi lagi.', gradient: 'from-amber-500 to-orange-500' },
              ].map((item) => (
                <motion.div key={item.step} variants={scaleIn}
                  className="relative p-8 rounded-3xl bg-white border border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden">
                  <div className="absolute top-4 right-5 text-[72px] font-[900] text-slate-50 leading-none select-none group-hover:text-emerald-50 transition-colors duration-500">{item.step}</div>
                  <div className="relative z-10">
                    <div className={`w-12 h-12 mb-5 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>{item.icon}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ═════════ FEATURES — BENTO GRID ═════════ */}
        <AnimatedSection id="fitur" className="py-28 px-6 bg-white/40 border-y border-slate-100 relative overflow-hidden">
          <Orb className="w-[500px] h-[500px] bg-indigo-200/15 -top-40 -right-40" delay={1} />
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-20">
              <motion.p variants={fadeUp} className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3">Fitur Inti</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-[900] tracking-tight mb-4">Semua yang kamu butuhkan,<br className="hidden md:block" /> tidak lebih.</motion.h2>
              <motion.p variants={fadeUp} className="text-slate-400 max-w-lg mx-auto">Dirancang supaya kamu fokus ke yang penting, bukan terjebak di fitur yang nggak perlu.</motion.p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Large: Smart Focus */}
              <motion.div variants={scaleIn} className="md:col-span-4 p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white relative overflow-hidden group shadow-xl shadow-indigo-500/15">
                <Orb className="w-[200px] h-[200px] bg-white/10 -top-10 -right-10" />
                <div className="relative z-10">
                  <SparklesIcon className="w-8 h-8 mb-4 opacity-80" />
                  <h3 className="text-2xl font-[800] mb-2">Smart Focus 3</h3>
                  <p className="text-indigo-100 max-w-sm text-sm leading-relaxed">AI memilihkan 3 tugas terbaik setiap hari berdasarkan deadline, prioritas, dan kebiasaanmu. Cukup pilih, mulai, selesai.</p>
                  <div className="mt-6 flex gap-3">
                    {['Tugas A', 'Tugas B', 'Tugas C'].map((t, i) => (
                      <div key={i} className="px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-bold">{t}</div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Small: Pomodoro */}
              <motion.div variants={scaleIn} className="md:col-span-2 p-7 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                <div className="w-11 h-11 mb-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg">
                  <ClockIcon className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Pomodoro Timer</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Timer terintegrasi. Klik dan langsung mulai fokus.</p>
                <div className="mt-4 text-3xl font-mono font-[900] text-slate-200">25:00</div>
              </motion.div>

              {/* Small: Guild */}
              <motion.div variants={scaleIn} className="md:col-span-2 p-7 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                <div className="w-11 h-11 mb-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                  <UserGroupIcon className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Guild System</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Bentuk tim, selesaikan misi bersama. Akuntabilitas tanpa tekanan.</p>
              </motion.div>

              {/* Medium: Streak & XP */}
              <motion.div variants={scaleIn} className="md:col-span-2 p-7 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/15 relative overflow-hidden">
                <Orb className="w-[150px] h-[150px] bg-white/10 -bottom-10 -right-10" />
                <div className="relative z-10">
                  <FireIcon className="w-7 h-7 mb-3 opacity-80" />
                  <h3 className="text-lg font-[800] mb-1">Streak & XP</h3>
                  <p className="text-amber-100 text-sm">Kumpulkan XP, pertahankan streak harian, naik level!</p>
                  <div className="mt-4 text-3xl font-[900]">🔥 14 hari</div>
                </div>
              </motion.div>

              {/* Small: Kanban */}
              <motion.div variants={scaleIn} className="md:col-span-2 p-7 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                <div className="w-11 h-11 mb-4 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg">
                  <AcademicCapIcon className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Kanban Board</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Atur tugas visual. Drag, drop, selesai.</p>
              </motion.div>

              {/* Wide: WhatsApp */}
              <motion.div variants={scaleIn} className="md:col-span-4 p-8 rounded-3xl bg-gradient-to-br from-green-600 to-emerald-600 text-white relative overflow-hidden shadow-xl shadow-green-500/15">
                <Orb className="w-[200px] h-[200px] bg-white/10 top-0 -right-20" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <ChatBubbleLeftEllipsisIcon className="w-8 h-8 mb-3 opacity-80" />
                    <h3 className="text-xl font-[800] mb-2">WhatsApp Reminder</h3>
                    <p className="text-green-100 text-sm leading-relaxed max-w-sm">Pengingat otomatis ke WhatsApp-mu. Tugas yang terlupakan akan mengirim notifikasi supaya kamu tetap on track.</p>
                  </div>
                  <div className="flex-shrink-0 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="text-xs font-mono text-green-100 space-y-1">
                      <div>📱 Hai! Tugas "Design UI" belum</div>
                      <div>dikerjakan 3 hari. Yuk lanjut!</div>
                      <div className="text-green-300 mt-2">→ Lanjut Kerjakan</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Small: Companion */}
              <motion.div variants={scaleIn} className="md:col-span-2 p-7 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
                <Orb className="w-[120px] h-[120px] bg-indigo-500/20 -bottom-10 -right-10" />
                <div className="relative z-10">
                  <div className="text-3xl mb-3">🎮</div>
                  <h3 className="text-lg font-[800] mb-1">Pixel Companion</h3>
                  <p className="text-slate-400 text-sm">Karakter retro 16-bit yang menemani fokusmu.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* ═════════ GUILD SECTION ═════════ */}
        <AnimatedSection id="guild" className="py-28 px-6 relative overflow-hidden">
          <Orb className="w-[500px] h-[500px] bg-teal-200/15 bottom-0 -left-40" delay={3} />
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div variants={scaleIn} className="order-last lg:order-first">
                <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 overflow-hidden shadow-2xl shadow-emerald-500/25">
                  <Orb className="w-[250px] h-[250px] bg-white/10 -top-20 -right-20" />
                  <div className="relative z-10 text-white">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl border border-white/30">🛡️</div>
                      <div><div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Guild</div><div className="text-xl font-[900]">Squad Produktif</div></div>
                    </div>
                    <div className="space-y-2 mb-5">
                      {[{ n: "Rina", s: "3/3 selesai ✅" }, { n: "Fikri", s: "sedang fokus 🔥" }, { n: "Sari", s: "1/3 tugas" }].map((m, i) => (
                        <motion.div key={i} variants={fadeUp} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-sm">
                          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{m.n[0]}</div>
                          <span className="font-medium">{m.n} — {m.s}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ v: "12", l: "Anggota" }, { v: "🔥 8", l: "Streak" }, { v: "#3", l: "Ranking" }].map((s, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/10 text-center"><div className="text-lg font-black">{s.v}</div><div className="text-[10px] text-emerald-200 uppercase tracking-wider">{s.l}</div></div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3">Lebih Kuat Bersama</p>
                <h2 className="text-3xl md:text-5xl font-[900] tracking-tight mb-5 leading-tight">Produktif itu<br />nggak harus sendirian.</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">Buat guild, ajak teman atau rekan kerja. Lihat progress satu sama lain, selesaikan challenge bareng.</p>
                <div className="space-y-3">
                  {[
                    { icon: '🎯', title: 'Challenge Harian', desc: 'Misi bersama yang mendorong semua anggota tetap produktif.' },
                    { icon: '📊', title: 'Leaderboard Guild', desc: 'Kompetisi sehat. Siapa paling rajin minggu ini?' },
                    { icon: '📝', title: 'Dokumen Bersama', desc: 'Kanban board dan catatan yang bisa diakses semua anggota.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg flex-shrink-0">{item.icon}</div>
                      <div><h3 className="font-bold text-slate-900 text-sm mb-0.5">{item.title}</h3><p className="text-slate-400 text-xs">{item.desc}</p></div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* ═════════ TESTIMONIALS ═════════ */}
        <AnimatedSection id="cerita" className="py-28 bg-white/40 border-y border-slate-100">
          <div className="container mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-14 px-6">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3">Kata Mereka</p>
              <h2 className="text-3xl md:text-5xl font-[900] tracking-tight">Bukan cuma kami yang bilang.</h2>
            </motion.div>
            <motion.div variants={fadeUp} className="space-y-6">
              <Marquee speed={45}>
                {testimonials.slice(0, 3).map((t, i) => (
                  <div key={i} className="w-[360px] flex-shrink-0 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col h-full mx-3">
                    <div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, i) => <StarIcon key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                    <p className="text-slate-600 mb-5 flex-grow text-sm leading-relaxed">"{t.quote}"</p>
                    <div className="flex items-center gap-3 border-t border-slate-50 pt-4 mt-auto">
                      <img src={t.avatar} alt={t.name} width="36" height="36" loading="lazy" className="w-9 h-9 rounded-full object-cover" />
                      <div><div className="font-bold text-slate-900 text-sm">{t.name}</div><div className="text-xs text-slate-400">{t.role}</div></div>
                    </div>
                  </div>
                ))}
              </Marquee>
              <Marquee direction="right" speed={50}>
                {testimonials.slice(3, 6).map((t, i) => (
                  <div key={i} className="w-[360px] flex-shrink-0 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col h-full mx-3">
                    <div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, i) => <StarIcon key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                    <p className="text-slate-600 mb-5 flex-grow text-sm leading-relaxed">"{t.quote}"</p>
                    <div className="flex items-center gap-3 border-t border-slate-50 pt-4 mt-auto">
                      <img src={t.avatar} alt={t.name} width="36" height="36" loading="lazy" className="w-9 h-9 rounded-full object-cover" />
                      <div><div className="font-bold text-slate-900 text-sm">{t.name}</div><div className="text-xs text-slate-400">{t.role}</div></div>
                    </div>
                  </div>
                ))}
              </Marquee>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ═════════ PRICING ═════════ */}
        <AnimatedSection id="harga" className="py-28 px-6 relative">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <motion.p variants={fadeUp} className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3">Harga</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-[900] tracking-tight mb-4">Mulai gratis, upgrade kapan saja.</motion.h2>
              <motion.p variants={fadeUp} className="text-slate-400">Tidak ada biaya tersembunyi. Tidak ada trial yang expire.</motion.p>
            </div>
            <div className={`grid ${pricingPlans.length <= 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'lg:grid-cols-3'} gap-6`}>
              {pricingPlans.map((plan) => (
                <motion.div key={plan.plan} variants={scaleIn}
                  className={`relative p-8 rounded-3xl ${plan.highlighted ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-700' : 'bg-white border border-slate-200 shadow-sm'} transition-all hover:shadow-xl`}>
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">Populer</div>
                  )}
                  <h3 className={`text-lg font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'} mb-0.5`}>{plan.plan}</h3>
                  {plan.desc && <p className={`text-xs ${plan.highlighted ? 'text-slate-400' : 'text-slate-400'} mb-4`}>{plan.desc}</p>}
                  <div className={`text-4xl font-[900] mb-6 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                    {typeof plan.price.monthly === 'number' ? (<>Rp{(plan.price.monthly / 1000).toLocaleString('id')}k<span className={`text-base font-medium ${plan.highlighted ? 'text-slate-500' : 'text-slate-400'}`}>/bln</span></>) : plan.price.monthly}
                  </div>
                  <ul className="space-y-2.5 mb-8">
                    {plan.features.map(f => <li key={f} className={`flex gap-2 text-sm ${plan.highlighted ? 'text-slate-300' : 'text-slate-500'}`}><CheckIcon className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-emerald-400' : 'text-emerald-500'}`} /> {f}</li>)}
                  </ul>
                  <a href="/register" className={`block py-3 px-6 rounded-xl text-center font-bold text-sm transition-all ${plan.highlighted ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:opacity-90' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                    {plan.highlighted ? 'Upgrade Sekarang' : 'Mulai Gratis'}
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ═════════ FAQ ═════════ */}
        <AnimatedSection id="faq" className="py-28 px-6 bg-white/40 border-t border-slate-100">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center mb-14">
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-[900] tracking-tight mb-3">Ada pertanyaan?</motion.h2>
              <motion.p variants={fadeUp} className="text-slate-400">Jawaban untuk hal-hal yang sering ditanyakan.</motion.p>
            </div>
            <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8">
              {faqData.map((faq, i) => <FAQItem key={i} question={faq.question} answer={faq.answer} />)}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ═════════ FINAL CTA ═════════ */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative p-12 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden shadow-2xl">
              <Orb className="w-[400px] h-[400px] bg-emerald-500/15 -top-20 -right-20" />
              <Orb className="w-[300px] h-[300px] bg-teal-500/10 -bottom-20 -left-20" delay={2} />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-[900] tracking-tight mb-4 leading-tight">Siap fokus tanpa drama?</h2>
                <p className="text-slate-400 mb-8 max-w-sm mx-auto text-sm">Ribuan orang sudah menemukan ritme produktif mereka. Giliranmu sekarang.</p>
                <motion.a href="/register" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-emerald-500/25">
                  Mulai Gratis Sekarang <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═════════ FOOTER ═════════ */}
        <footer className="py-10 border-t border-slate-100 bg-white/50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-md flex items-center justify-center text-white text-[10px] font-black">S</span>
                  <span className="text-sm font-[800] text-slate-900">Sarang Tumbuh</span>
                </div>
                <p className="text-slate-400 text-xs mb-3 max-w-xs leading-relaxed">Teman produktifmu. Fokus sendiri atau bareng guild, tanpa overwhelm.</p>
                <div className="flex gap-3 text-slate-300 hover:text-slate-500"><FaTwitter /><FaInstagram /></div>
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-2 uppercase tracking-widest">Produk</h4>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li><a href="#fitur" className="hover:text-emerald-600 transition-colors">Fitur</a></li>
                  <li><a href="#guild" className="hover:text-emerald-600 transition-colors">Guild</a></li>
                  <li><a href="#harga" className="hover:text-emerald-600 transition-colors">Harga</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-2 uppercase tracking-widest">Lainnya</h4>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li><a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a></li>
                  <li><a href="/login" className="hover:text-emerald-600 transition-colors">Masuk</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center text-slate-300 text-[11px] pt-6 border-t border-slate-100">
              &copy; {new Date().getFullYear()} Sarang Tumbuh. Hak cipta dilindungi.
            </div>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>
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