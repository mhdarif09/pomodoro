import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Head } from '@inertiajs/react';
import Lenis from '@studio-freight/lenis';
import clsx from 'clsx';
import {
  CheckIcon, ArrowRightIcon, StarIcon,
  UserGroupIcon, SparklesIcon,
  ClockIcon, ChevronDownIcon, GlobeAltIcon,
  BoltIcon, ShieldCheckIcon, HeartIcon,
  FireIcon, AcademicCapIcon, TrophyIcon
} from '@heroicons/react/24/outline';
import { useLanguage, LanguageProvider } from '@/Contexts/LanguageContext';

// --- Social Icons ---
const FaTwitter = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const FaInstagram = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2z" clipRule="evenodd" /></svg>;

// --- Animated Section Wrapper ---
const AnimatedSection = ({ children, className = '', id = '' }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.section
      id={id} ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] } }
};

// --- FAQ Item ---
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div variants={fadeUp} className="border-b border-slate-200/60 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-6 text-left focus:outline-none group">
        <span className="text-lg font-bold text-slate-800 pr-8 group-hover:text-emerald-600 transition-colors">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="flex-shrink-0">
          <ChevronDownIcon className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <p className="pb-6 text-slate-500 leading-relaxed max-w-2xl">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Marquee ---
const Marquee = ({ children, direction = 'left' }) => (
  <div className="relative flex w-full overflow-hidden py-4">
    <motion.div className="flex min-w-full shrink-0 items-center justify-around gap-8" variants={{ animate: { translateX: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'], transition: { ease: 'linear', duration: 40, repeat: Infinity } } }} animate="animate">{children}</motion.div>
    <motion.div className="flex min-w-full shrink-0 items-center justify-around gap-8" variants={{ animate: { translateX: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'], transition: { ease: 'linear', duration: 40, repeat: Infinity } } }} animate="animate">{children}</motion.div>
    <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10"></div>
    <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10"></div>
  </div>
);


function LandingPageContent({ plans = [] }) {
  const { t, language, toggleLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
  }, [isMenuOpen]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const pricingPlans = useMemo(() => {
    if (!plans || plans.length === 0) {
      return [
        { plan: 'Starter', price: { monthly: 'Gratis' }, features: ['3 tugas fokus harian', 'Timer Pomodoro', 'Kanban pribadi', 'Bergabung 1 Guild'], highlighted: false },
        { plan: 'Pro', price: { monthly: 20000 }, features: ['Tugas tanpa batas', 'AI Smart Focus', 'Guild tanpa batas', 'WhatsApp reminder', 'Laporan mingguan'], highlighted: true },
      ];
    }
    return plans.map(p => ({
      plan: p.name,
      price: { monthly: p.price },
      features: p.features || [],
      highlighted: p.name.toLowerCase().includes('navigator') || p.name.toLowerCase().includes('premium') || p.name.toLowerCase().includes('pro'),
      id: p.id
    }));
  }, [plans]);

  const testimonials = [
    { quote: "Akhirnya nemu app yang ngerti kalau produktif itu bukan soal banyak kerja, tapi kerja yang bener.", name: "Rina M.", role: "Freelance Designer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&q=80&fit=crop" },
    { quote: "Guild nya bikin semangat sih. Berasa ngerjain tugas bareng temen, padahal remote semua.", name: "Fikri A.", role: "CS Student", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&q=80&fit=crop" },
    { quote: "Smart Focus-nya paham banget tugas mana yang harus dikerjain duluan. Game changer.", name: "Sari K.", role: "Product Manager", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&q=80&fit=crop" },
    { quote: "Dulu sering overwhelm lihat to-do list panjang. Sekarang cuma fokus 3 tugas. Simpel tapi powerful.", name: "Bayu W.", role: "Startup Founder", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&q=80&fit=crop" },
    { quote: "Companion-nya lucu dan bikin kerja nggak kerasa sendirian. Love it.", name: "Amel D.", role: "Content Creator", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&q=80&fit=crop" },
    { quote: "Pake ini buat ngatur skripsi. Guild sama temen-temen bimbingan, jadi saling support.", name: "Dimas R.", role: "Mahasiswa S1", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&q=80&fit=crop" },
  ];

  const faqData = [
    { question: "Apa bedanya Sarang Tumbuh dengan to-do list biasa?", answer: "Sarang Tumbuh bukan sekadar daftar tugas. Kami hanya menampilkan 3 tugas fokus harian supaya kamu tidak overwhelm, ditambah companion virtual yang menemani sesi kerjamu dan sistem guild untuk berkolaborasi." },
    { question: "Apa itu Guild?", answer: "Guild adalah tim kecil tempat kamu dan teman-teman saling support. Kalian bisa berbagi tugas, melihat progress satu sama lain, dan berlomba di leaderboard bersama." },
    { question: "Apakah gratis?", answer: "Ya! Paket Starter sepenuhnya gratis dengan fitur inti lengkap. Paket Pro membuka fitur AI, guild tanpa batas, dan WhatsApp reminder." },
    { question: "Bisa dipakai untuk kerja tim?", answer: "Tentu. Gunakan fitur Guild untuk kolaborasi. Setiap guild punya Kanban board, dokumen bersama, dan challenge harian." },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <Head title="Sarang Tumbuh — Teman Produktifmu" />

      {/* Subtle Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/60 via-[#FAFAFA] to-[#FAFAFA]"></div>
      </div>

      {/* ═══════════════ HEADER ═══════════════ */}
      <motion.header
        initial={{ y: -100 }} animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-white/70 border-b border-slate-100"
      >
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-[800] text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-sm font-black shadow-lg shadow-emerald-500/30">S</span>
            Sarang Tumbuh
          </div>

          <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
            <a href="#cara-kerja" className="hover:text-emerald-600 transition-colors">Cara Kerja</a>
            <a href="#fitur" className="hover:text-emerald-600 transition-colors">Fitur</a>
            <a href="#guild" className="hover:text-emerald-600 transition-colors">Guild</a>
            <a href="#harga" className="hover:text-emerald-600 transition-colors">Harga</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleLanguage} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-colors">
              <GlobeAltIcon className="w-4 h-4 inline mr-1" />{language === 'id' ? 'ID' : 'EN'}
            </button>
            <a href="/login" className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors">Masuk</a>
            <motion.a href="/register" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
              Coba Gratis
            </motion.a>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={toggleLanguage} className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold uppercase">{language === 'id' ? 'ID' : 'EN'}</button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="z-50 relative p-2">
              <div className="flex flex-col gap-1.5">
                <motion.span animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 6 : 0 }} className="w-6 h-0.5 bg-slate-900 block rounded-full"></motion.span>
                <motion.span animate={{ opacity: isMenuOpen ? 0 : 1 }} className="w-6 h-0.5 bg-slate-900 block rounded-full"></motion.span>
                <motion.span animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -6 : 0 }} className="w-6 h-0.5 bg-slate-900 block rounded-full"></motion.span>
              </div>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-white/98 backdrop-blur-3xl md:hidden flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center">
              <a href="#cara-kerja" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-slate-900">Cara Kerja</a>
              <a href="#fitur" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-slate-900">Fitur</a>
              <a href="#guild" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-slate-900">Guild</a>
              <a href="#harga" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-slate-900">Harga</a>
              <div className="flex flex-col gap-3 mt-4">
                <a href="/login" className="px-8 py-3 text-lg font-bold text-slate-600">Masuk</a>
                <a href="/register" className="px-8 py-4 rounded-2xl font-bold text-lg bg-slate-900 text-white shadow-xl">Coba Gratis</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        {/* ═══════════════ HERO ═══════════════ */}
        <section ref={heroRef} className="min-h-[100vh] flex items-center justify-center relative pt-28 pb-20">
          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.div style={{ y: heroTextY, opacity: heroOpacity }}>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold">
                <SparklesIcon className="w-4 h-4" />
                <span>Productivity Companion</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
                className="text-[clamp(2.5rem,7vw,5.5rem)] font-[900] tracking-tighter mb-6 text-slate-900 leading-[1.05] max-w-4xl mx-auto">
                Fokus tanpa drama.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Sendiri atau bareng.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
                Tiga tugas fokus setiap hari, companion yang menemani, dan guild untuk saling support. Produktif tanpa overwhelm.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a href="/register" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold text-lg text-white transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2">
                  Mulai Sekarang <ArrowRightIcon className="w-5 h-5" />
                </motion.a>
                <Link href={route('download.windows')}
                  className="px-8 py-4 bg-white hover:bg-slate-50 rounded-2xl font-bold text-slate-700 transition-all shadow-lg border border-slate-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1V11.55H0V3.449zm0 8.851h9.75v9.45L0 20.401V12.3zm10.75-10.45l13.25-1.85V11.55h-13.25V1.85zM24 12.3v10.15l-13.25-1.85V12.3H24z" /></svg>
                  Windows App
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-400 font-medium">
                <span className="flex items-center gap-1.5"><ShieldCheckIcon className="w-4 h-4" /> Gratis Selamanya</span>
                <span className="hidden sm:flex items-center gap-1.5"><BoltIcon className="w-4 h-4" /> Setup 30 Detik</span>
                <span className="flex items-center gap-1.5"><HeartIcon className="w-4 h-4" /> Tanpa Iklan</span>
              </motion.div>
            </motion.div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-200/20 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
        </section>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <AnimatedSection id="cara-kerja" className="py-28 px-6 relative">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-20">
              <motion.p variants={fadeUp} className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Sesimpel itu</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-[900] tracking-tighter mb-5 text-slate-900">Tiga langkah. Nol ribet.</motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-xl mx-auto">Tidak perlu setup rumit. Langsung produktif dari menit pertama.</motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', icon: <BoltIcon className="w-7 h-7" />, title: 'Pilih 3 Tugas', desc: 'Setiap hari, pilih maksimal 3 tugas yang paling penting. AI kami bisa bantu rekomendasikan.' },
                { step: '02', icon: <ClockIcon className="w-7 h-7" />, title: 'Fokus & Kerjakan', desc: 'Mulai timer Pomodoro, companion menemanimu. Tidak ada distraksi, hanya kamu dan tugasmu.' },
                { step: '03', icon: <TrophyIcon className="w-7 h-7" />, title: 'Rayakan & Ulang', desc: 'Selesaikan satu tugas, raih XP, lanjut ke tugas berikutnya. Repeat besok.' },
              ].map((item) => (
                <motion.div key={item.step} variants={fadeUp} className="relative p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-500 group">
                  <div className="text-[80px] font-[900] text-slate-100 absolute top-4 right-6 leading-none select-none group-hover:text-emerald-50 transition-colors">{item.step}</div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">{item.icon}</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-[15px] leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════ FEATURES ═══════════════ */}
        <AnimatedSection id="fitur" className="py-28 px-6 bg-white/50 border-y border-slate-100">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-20">
              <motion.p variants={fadeUp} className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Fitur Inti</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-[900] tracking-tighter mb-5 text-slate-900">
                Semua yang kamu butuhkan,<br className="hidden md:block" /> tidak lebih.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-xl mx-auto">Dirancang supaya kamu fokus ke yang penting, bukan terjebak di fitur yang nggak perlu.</motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <SparklesIcon className="w-6 h-6" />, title: 'Smart Focus 3', desc: 'AI memilihkan 3 tugas terbaik setiap hari berdasarkan deadline, prioritas, dan kebiasaanmu.', color: 'from-indigo-500 to-violet-500' },
                { icon: <ClockIcon className="w-6 h-6" />, title: 'Pomodoro Timer', desc: 'Timer fokus terintegrasi langsung ke setiap tugas. Cukup klik, langsung mulai.', color: 'from-blue-500 to-cyan-500' },
                { icon: <UserGroupIcon className="w-6 h-6" />, title: 'Guild System', desc: 'Bentuk guild, undang teman, selesaikan misi bersama. Akuntabilitas tanpa tekanan.', color: 'from-emerald-500 to-teal-500' },
                { icon: <FireIcon className="w-6 h-6" />, title: 'Streak & XP', desc: 'Kumpulkan XP dari setiap tugas yang selesai. Pertahankan streak harianmu.', color: 'from-amber-500 to-orange-500' },
                { icon: <AcademicCapIcon className="w-6 h-6" />, title: 'Kanban Board', desc: 'Atur tugas dalam kolom visual. Drag, drop, selesai. Sesimpel itu.', color: 'from-pink-500 to-rose-500' },
                { icon: <ShieldCheckIcon className="w-6 h-6" />, title: 'WhatsApp Reminder', desc: 'Pengingat otomatis langsung ke WhatsApp-mu. Tidak pernah lupa deadline lagi.', color: 'from-green-500 to-emerald-500' },
              ].map((feat, i) => (
                <motion.div key={i} variants={fadeUp} className="p-7 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                  <div className={`w-12 h-12 mb-5 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feat.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════ GUILD SECTION ═══════════════ */}
        <AnimatedSection id="guild" className="py-28 px-6 relative overflow-hidden">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: Visual */}
              <motion.div variants={fadeUp} className="order-last lg:order-first">
                <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 overflow-hidden shadow-2xl shadow-emerald-500/30">
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px]"></div>
                  <div className="relative z-10 text-white">
                    {/* Guild Mock UI */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/30">🛡️</div>
                      <div>
                        <div className="text-sm font-semibold uppercase tracking-wider text-emerald-100">Guild</div>
                        <div className="text-2xl font-[900]">Squad Produktif</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {["Rina — 3/3 tugas selesai ✅", "Fikri — sedang fokus 🔥", "Sari — 1/3 tugas"].map((member, i) => (
                        <div key={i} className="px-4 py-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-sm font-medium">{member}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-white/10 text-center"><div className="text-xl font-black">12</div><div className="text-[11px] text-emerald-100">Anggota</div></div>
                      <div className="p-3 rounded-xl bg-white/10 text-center"><div className="text-xl font-black">🔥 8</div><div className="text-[11px] text-emerald-100">Streak</div></div>
                      <div className="p-3 rounded-xl bg-white/10 text-center"><div className="text-xl font-black">#3</div><div className="text-[11px] text-emerald-100">Ranking</div></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Copy */}
              <motion.div variants={fadeUp}>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Lebih Kuat Bersama</p>
                <h2 className="text-4xl md:text-5xl font-[900] tracking-tighter mb-6 text-slate-900 leading-tight">
                  Produktif itu <br />nggak harus sendirian.
                </h2>
                <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                  Buat guild, ajak teman atau rekan kerja. Lihat progress satu sama lain, selesaikan challenge bareng, dan tunjukkan siapa yang paling konsisten.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: '🎯', title: 'Challenge Harian', desc: 'Misi bersama yang mendorong semua anggota tetap produktif.' },
                    { icon: '📊', title: 'Leaderboard Guild', desc: 'Kompetisi sehat. Siapa paling rajin minggu ini?' },
                    { icon: '📝', title: 'Dokumen Bersama', desc: 'Kanban board dan catatan yang bisa diakses semua anggota.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-xl flex-shrink-0">{item.icon}</div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-0.5">{item.title}</h3>
                        <p className="text-slate-500 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-200/15 rounded-full blur-[100px] -z-10"></div>
        </AnimatedSection>

        {/* ═══════════════ TESTIMONIALS ═══════════════ */}
        <AnimatedSection id="cerita" className="py-28 bg-white/40 border-y border-slate-100">
          <div className="container mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-16 px-6">
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Kata Mereka</p>
              <h2 className="text-4xl md:text-5xl font-[900] tracking-tighter mb-5 text-slate-900">
                Bukan cuma kami yang bilang.
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} className="space-y-8">
              <Marquee>
                {testimonials.slice(0, 3).map((t, i) => (
                  <div key={i} className="w-[380px] flex-shrink-0 p-7 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col h-full mx-4 hover:shadow-lg transition-shadow">
                    <div className="flex gap-1 mb-5">{[...Array(5)].map((_, i) => <StarIcon key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                    <p className="text-slate-700 mb-6 flex-grow leading-relaxed">"{t.quote}"</p>
                    <div className="flex items-center gap-3 border-t border-slate-50 pt-5 mt-auto">
                      <img src={t.avatar} alt={t.name} width="40" height="40" loading="lazy" className="w-10 h-10 rounded-full object-cover" />
                      <div><div className="font-bold text-slate-900 text-sm">{t.name}</div><div className="text-xs text-slate-500">{t.role}</div></div>
                    </div>
                  </div>
                ))}
              </Marquee>
              <Marquee direction="right">
                {testimonials.slice(3, 6).map((t, i) => (
                  <div key={i} className="w-[380px] flex-shrink-0 p-7 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col h-full mx-4 hover:shadow-lg transition-shadow">
                    <div className="flex gap-1 mb-5">{[...Array(5)].map((_, i) => <StarIcon key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                    <p className="text-slate-700 mb-6 flex-grow leading-relaxed">"{t.quote}"</p>
                    <div className="flex items-center gap-3 border-t border-slate-50 pt-5 mt-auto">
                      <img src={t.avatar} alt={t.name} width="40" height="40" loading="lazy" className="w-10 h-10 rounded-full object-cover" />
                      <div><div className="font-bold text-slate-900 text-sm">{t.name}</div><div className="text-xs text-slate-500">{t.role}</div></div>
                    </div>
                  </div>
                ))}
              </Marquee>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ═══════════════ PRICING ═══════════════ */}
        <AnimatedSection id="harga" className="py-28 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <motion.p variants={fadeUp} className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Harga</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-[900] tracking-tighter mb-5 text-slate-900">Mulai gratis, upgrade kapan saja.</motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500">Tidak ada biaya tersembunyi. Tidak ada trial yang expire.</motion.p>
            </div>

            <div className={`grid ${pricingPlans.length <= 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'lg:grid-cols-3'} gap-8`}>
              {pricingPlans.map((plan) => (
                <motion.div key={plan.plan} variants={fadeUp}
                  className={`relative p-8 rounded-3xl bg-white border ${plan.highlighted ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500' : 'border-slate-200 shadow-sm'} transition-all hover:shadow-lg`}>
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">Populer</div>
                  )}
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.plan}</h3>
                  <div className="text-4xl font-[900] text-slate-900 mb-6 mt-3">
                    {typeof plan.price.monthly === 'number' ? (<>Rp{(plan.price.monthly / 1000).toLocaleString('id')}k<span className="text-base font-medium text-slate-400">/bulan</span></>) : plan.price.monthly}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map(f => <li key={f} className="flex gap-2.5 text-slate-600 text-sm"><CheckIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" /> {f}</li>)}
                  </ul>
                  <a href="/register" className={`block py-3.5 px-6 rounded-xl text-center font-bold transition-all ${plan.highlighted ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                    {plan.highlighted ? 'Upgrade Sekarang' : 'Mulai Gratis'}
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════ FAQ ═══════════════ */}
        <AnimatedSection id="faq" className="py-28 px-6 bg-white/40 border-t border-slate-100">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-16">
              <motion.h2 variants={fadeUp} className="text-4xl font-[900] tracking-tighter mb-4 text-slate-900">Ada pertanyaan?</motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500">Jawaban untuk hal-hal yang sering ditanyakan.</motion.p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              {faqData.map((faq, i) => <FAQItem key={i} question={faq.question} answer={faq.answer} />)}
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════ FINAL CTA ═══════════════ */}
        <section className="py-28 px-6">
          <div className="container mx-auto max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="p-12 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[120px]"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-[900] tracking-tighter mb-4 leading-tight">
                  Siap fokus tanpa drama?
                </h2>
                <p className="text-lg text-slate-400 mb-8 max-w-md mx-auto">
                  Ribuan orang sudah menemukan ritme produktif mereka. Giliranmu.
                </p>
                <motion.a href="/register" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-emerald-500/30">
                  Mulai Gratis Sekarang <ArrowRightIcon className="w-5 h-5" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer className="py-12 border-t border-slate-100 bg-white/50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-10">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-black">S</span>
                  <span className="text-lg font-[800] text-slate-900">Sarang Tumbuh</span>
                </div>
                <p className="text-slate-500 text-sm mb-4 max-w-xs">Teman produktifmu. Fokus sendiri atau bareng guild, tanpa overwhelm.</p>
                <div className="flex gap-3 text-slate-400">
                  <FaTwitter /><FaInstagram />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3 uppercase tracking-wider">Produk</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#fitur" className="hover:text-emerald-600 transition-colors">Fitur</a></li>
                  <li><a href="#guild" className="hover:text-emerald-600 transition-colors">Guild</a></li>
                  <li><a href="#harga" className="hover:text-emerald-600 transition-colors">Harga</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3 uppercase tracking-wider">Lainnya</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a></li>
                  <li><a href="/login" className="hover:text-emerald-600 transition-colors">Masuk</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center text-slate-400 text-xs pt-8 border-t border-slate-100">
              &copy; {new Date().getFullYear()} Sarang Tumbuh. Hak cipta dilindungi.
            </div>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        .animate-pulse-slow { animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
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