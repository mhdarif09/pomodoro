import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Head } from '@inertiajs/react';
import Lenis from '@studio-freight/lenis';
import clsx from 'clsx';
import {
  RocketLaunchIcon, CheckIcon, ArrowRightIcon, StarIcon,
  ChatBubbleLeftRightIcon, UserGroupIcon, DocumentTextIcon, SparklesIcon,
  ClockIcon, PresentationChartLineIcon, ChevronDownIcon, HeartIcon, GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useLanguage, LanguageProvider } from '@/Contexts/LanguageContext';

// --- Komponen Ikon Media Sosial ---
const FaTwitter = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const FaLinkedin = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;
const FaInstagram = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zm-1.04 2.74a6.732 6.732 0 01-2.248-.035c-.75.036-1.144.17-1.502.31a3.027 3.027 0 00-1.12 1.12c-.14.358-.274.752-.31 1.502a6.732 6.732 0 01-.035 2.248c.036.75.17 1.144.31 1.502a3.027 3.027 0 001.12 1.12c.358.14.752.274 1.502.31a6.732 6.732 0 012.248.035c.75-.036 1.144-.17 1.502-.31a3.027 3.027 0 001.12-1.12c.14-.358.274-.752.31-1.502a6.732 6.732 0 01.035-2.248c-.036-.75-.17-1.144-.31-1.502a3.027 3.027 0 00-1.12-1.12c-.358-.14-.752-.274-1.502-.31zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm0 1.5a2.25 2.25 0 110 4.5 2.25 2.25 0 010-4.5z" clipRule="evenodd" /></svg>;


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

const featureFadeInUp = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] } }
};

const FeatureCard = ({ feature }) => {
  return (
    <motion.div variants={featureFadeInUp} className="group relative p-8 rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-[2.5rem] pointer-events-none"></div>
      <div className="relative z-10">
        <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center text-emerald-600 shadow-inner border border-white/60 group-hover:scale-110 transition-transform duration-500">
          {feature.icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
        <p className="text-slate-500 text-[15px] leading-relaxed font-medium">{feature.description}</p>
      </div>
    </motion.div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div variants={featureFadeInUp} className="border-b border-slate-200/60 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-start py-6 text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-bold text-slate-800 pr-8">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="flex-shrink-0 mt-1">
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
}

const Marquee = ({ children, direction = 'left' }) => (
  <div className="relative flex w-full overflow-hidden py-4">
    <motion.div className="flex min-w-full shrink-0 items-center justify-around gap-8" variants={{ animate: { translateX: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'], transition: { ease: 'linear', duration: 50, repeat: Infinity } } }} animate="animate">{children}</motion.div>
    <motion.div className="flex min-w-full shrink-0 items-center justify-around gap-8" variants={{ animate: { translateX: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'], transition: { ease: 'linear', duration: 50, repeat: Infinity } } }} animate="animate">{children}</motion.div>
    <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
    <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10"></div>
  </div>
);


function OdysseyLandingPageContent({ plans = [] }) {
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
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // --- Dynamic Data using Translation Keys ---
  const features = [
    { icon: <ClockIcon className="w-8 h-8" />, title: t('feat_focus_title'), description: t('feat_focus_desc') },
    { icon: <SparklesIcon className="w-8 h-8" />, title: t('feat_ai_title'), description: t('feat_ai_desc') },
    { icon: <PresentationChartLineIcon className="w-8 h-8" />, title: t('feat_visual_title'), description: t('feat_visual_desc') },
    { icon: <UserGroupIcon className="w-8 h-8" />, title: t('feat_comm_title'), description: t('feat_comm_desc') },
    { icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />, title: t('feat_partner_title'), description: t('feat_partner_desc') },
    { icon: <DocumentTextIcon className="w-8 h-8" />, title: t('feat_doc_title'), description: t('feat_doc_desc') }
  ];

  const topics = [
    { name: 'Mindfulness' }, { name: 'Deep Work' }, { name: 'Stoisisme Modern' },
    { name: 'Sistem Mental' }, { name: 'Kesehatan Kognitif' }, { name: 'Fisika Kehidupan' }
  ];

  const testimonials = [
    { quote: "Ini bukan sekadar to-do list. Ini adalah ruang berpikir yang membuat saya merasa tenang namun sangat produktif.", name: "Sarah Chen", role: "Product Designer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&q=80&fit=crop" },
    { quote: "Saya menemukan kembali kemampuan saya untuk fokus selama berjam-jam. Rasanya seperti memiliki kekuatan super.", name: "Marcus Johnson", role: "PhD Researcher", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&q=80&fit=crop" },
    { quote: "Desainnya sangat indah. Menggunakannya setiap pagi memberikan saya kejelasan untuk sepanjang hari.", name: "Priya Sharma", role: "Founder", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&q=80&fit=crop" },
    { quote: "Fitur 'Mitra Berpikir' AI-nya menyelamatkan proyek saya berkali-kali. Seperti punya co-founder jenius.", name: "David Lee", role: "Architect", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&q=80&fit=crop" },
    { quote: "Akhirnya ada platform yang menghargai perhatian kita, bukan mencurinya. Sangat direkomendasikan.", name: "Dr. Emily Carter", role: "Neuroscientist", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&q=80&fit=crop" },
    { quote: "Investasi terbaik untuk pengembangan diri saya tahun ini.", name: "Alex Rivera", role: "Writer", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&q=80&fit=crop" },
  ];

  const faqData = [
    { question: t('faq_1_q'), answer: t('faq_1_a') },
    { question: t('faq_2_q'), answer: t('faq_2_a') },
    { question: t('faq_3_q'), answer: t('faq_3_a') },
    { question: t('faq_4_q'), answer: t('faq_4_a') }
  ];

  // Derive Pricing Plans from DB Props
  const pricingPlans = useMemo(() => {
    if (!plans || plans.length === 0) {
      return [
        { plan: 'Penjelajah', price: { monthly: 'Gratis' }, features: ['Jurnal AI (10/bulan)', 'Timer Pomodoro Dasar', 'Peta Tujuan (3 tujuan)', 'Akses Komunitas'] },
        { plan: 'Navigator', price: { monthly: 20000 }, features: ['Jurnal AI Tanpa Batas', 'Pomodoro Cerdas', 'Tujuan Tanpa Batas', 'Kecerdasan PDF (50/bulan)', 'Dukungan Prioritas'], highlighted: true }
      ];
    }
    return plans.map(p => ({
      plan: p.name,
      price: { monthly: p.price },
      features: p.features || [],
      highlighted: p.name.toLowerCase().includes('navigator') || p.name.toLowerCase().includes('premium'),
      comingSoon: false,
      id: p.id
    }));
  }, [plans]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <Head title="Sarang Tumbuh - Suaka Ambisi & Fokus" />

      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-[#F5F5F7] to-[#F5F5F7]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02]"></div>
      </div>

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/20"
      >
        <nav className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-lg">S</span>
            Sarang Tumbuh
          </div>

          <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">{t('features_title') || 'Fitur'}</a>
            <a href="#topics" className="hover:text-slate-900 transition-colors">Eksplorasi</a>
            <a href="#gamification" className="hover:text-slate-900 transition-colors">{t('nav_gamification') || 'Gamifikasi'}</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">{t('pricing_title') || 'Harga'}</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/50 text-slate-600 hover:bg-slate-100 transition-all text-xs font-bold uppercase tracking-wider"
            >
              <GlobeAltIcon className="w-4 h-4" />
              {language === 'id' ? 'ID' : 'EN'}
            </button>
            <motion.a
              href="/login"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-full font-semibold text-[15px] bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
            >
              {t('cta_login') || 'Masuk'}
            </motion.a>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 rounded-full border border-slate-200 bg-white/50 text-slate-600 hover:bg-slate-100 text-xs font-bold uppercase"
            >
              {language === 'id' ? 'ID' : 'EN'}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="z-50 relative p-2">
              <div className="flex flex-col gap-1.5">
                <motion.span animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 6 : 0 }} className="w-6 h-0.5 bg-slate-900 block rounded-full transition-all"></motion.span>
                <motion.span animate={{ opacity: isMenuOpen ? 0 : 1 }} className="w-6 h-0.5 bg-slate-900 block rounded-full transition-all"></motion.span>
                <motion.span animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -6 : 0 }} className="w-6 h-0.5 bg-slate-900 block rounded-full transition-all"></motion.span>
              </div>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-white/95 backdrop-blur-2xl md:hidden flex items-center justify-center">
            <div className="flex flex-col items-center gap-8 text-center p-6">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold text-slate-900">{t('features_title') || 'Fitur'}</a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold text-slate-900">{t('pricing_title') || 'Harga'}</a>
              <motion.a href="/login" className="mt-4 px-8 py-4 rounded-full font-bold text-xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                {t('cta_start') || 'Mulai Sekarang'}
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        <section ref={heroRef} className="min-h-screen flex items-center justify-center relative pt-32 pb-20 overflow-hidden">
          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.div style={{ y: heroTextY, opacity: heroOpacity }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-white/50 border border-white/60 backdrop-blur-md text-slate-500 text-sm font-semibold tracking-wide shadow-sm">
                <SparklesIcon className="w-4 h-4 text-amber-400" />
                <span>{t('welcome_subtitle') ? 'Productivity Ecosystem' : 'Ekosistem Produktivitas Generasi Baru'}</span>
              </motion.div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-[800] tracking-tighter mb-8 text-slate-900 leading-[1.05]">
                {t('welcome_title') || 'Fokus Lebih Baik.'}
              </h1>

              <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                {t('welcome_subtitle') || 'Sarang Tumbuh adalah ruang tenang di tengah bisingnya dunia.'}
              </p>

              <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a href="/login" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 rounded-full font-bold text-lg text-white transition-all shadow-xl shadow-emerald-500/30">
                  {t('cta_start') || 'Mulai Petualangan'}
                </motion.a>
                <motion.a href="#features" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-10 py-5 bg-white hover:bg-slate-50 rounded-full font-bold text-lg text-slate-900 transition-all shadow-lg shadow-slate-200/50">
                  Pelajari Lebih Lanjut
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-300/20 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
        </section>

        <AnimatedSection id="features" className="py-32 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-24">
              <motion.h2 variants={featureFadeInUp} className="text-4xl md:text-5xl font-[900] tracking-tighter mb-6 text-slate-900">
                {t('features_title') || 'Alat Pencapai Mimpi'}
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                {features.map((feature, i) => <FeatureCard key={i} feature={feature} />)}
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection id="topics" className="py-24 overflow-hidden bg-white/40 backdrop-blur-3xl border-y border-white/20">
          <div className="container mx-auto">
            <motion.div variants={featureFadeInUp} className="text-center mb-16 px-6">
              <h2 className="text-3xl md:text-4xl font-[900] tracking-tighter mb-4 text-slate-900">
                Eksplorasi Wawasan
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Selami topik-topik yang memperkaya jiwa dan mempertajam akal.
              </p>
            </motion.div>
            <motion.div variants={featureFadeInUp}>
              <Marquee>
                {topics.map((topic) => (
                  <div key={topic.name} className="px-8 py-3 rounded-full bg-white/80 border border-slate-200/60 shadow-sm text-lg font-bold text-slate-600 whitespace-nowrap backdrop-blur-md">
                    {topic.name}
                  </div>
                ))}
              </Marquee>
            </motion.div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-200/20 rounded-full blur-[100px] -z-10"></div>
        </AnimatedSection>

        <AnimatedSection id="testimonials" className="py-32">
          <div className="container mx-auto">
            <motion.div variants={featureFadeInUp} className="text-center mb-24 px-6">
              <h2 className="text-4xl md:text-5xl font-[900] tracking-tighter mb-6 text-slate-900">
                Cerita Pertumbuhan
              </h2>
              <motion.p variants={featureFadeInUp} className="text-xl text-slate-500">
                Mereka yang telah menemukan ritme terbaiknya.
              </motion.p>
            </motion.div>
            <motion.div variants={featureFadeInUp} className="space-y-12">
              <Marquee>
                {testimonials.slice(0, 3).map((t) => (
                  <div key={t.name} className="w-[400px] flex-shrink-0 p-8 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50 flex flex-col h-full mx-6 hover:scale-[1.02] transition-transform duration-300">
                    <div className="flex gap-1 mb-6">{[...Array(5)].map((_, i) => <StarIcon key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}</div>
                    <p className="text-slate-700 mb-8 italic flex-grow text-lg leading-relaxed font-serif">"{t.quote}"</p>
                    <div className="flex items-center gap-4 border-t border-slate-100 pt-6 mt-auto">
                      <img src={t.avatar} alt={t.name} width="48" height="48" loading="lazy" className="w-12 h-12 rounded-full object-cover ring-4 ring-white shadow-lg" />
                      <div><div className="font-bold text-slate-900">{t.name}</div><div className="text-sm text-slate-500 font-medium">{t.role}</div></div>
                    </div>
                  </div>
                ))}
              </Marquee>
              <Marquee direction="right">
                {testimonials.slice(3, 6).map((t) => (
                  <div key={t.name} className="w-[400px] flex-shrink-0 p-8 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50 flex flex-col h-full mx-6 hover:scale-[1.02] transition-transform duration-300">
                    <div className="flex gap-1 mb-6">{[...Array(5)].map((_, i) => <StarIcon key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}</div>
                    <p className="text-slate-700 mb-8 italic flex-grow text-lg leading-relaxed font-serif">"{t.quote}"</p>
                    <div className="flex items-center gap-4 border-t border-slate-100 pt-6 mt-auto">
                      <img src={t.avatar} alt={t.name} width="48" height="48" loading="lazy" className="w-12 h-12 rounded-full object-cover ring-4 ring-white shadow-lg" />
                      <div><div className="font-bold text-slate-900">{t.name}</div><div className="text-sm text-slate-500 font-medium">{t.role}</div></div>
                    </div>
                  </div>
                ))}
              </Marquee>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Gamification Section RESTORED and LOCALIZED */}
        <AnimatedSection id="gamification" className="py-32 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <motion.h2 variants={featureFadeInUp} className="text-4xl md:text-5xl font-[900] tracking-tighter mb-6 text-slate-900">
                {t('game_title') || 'Produktivitas Jadi Lebih Seru'}
              </motion.h2>
              <motion.p variants={featureFadeInUp} className="text-xl text-slate-500 font-medium">
                {t('game_subtitle') || 'Level up, unlock achievements, dan compete dengan ribuan pengguna lain.'}
              </motion.p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-20">
              <motion.div variants={featureFadeInUp} className="order-last lg:order-first">
                <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-500 overflow-hidden shadow-2xl shadow-emerald-500/30">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px]"></div>

                  <div className="relative z-10 text-white">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/30">
                        42
                      </div>
                      <div>
                        <div className="text-sm font-semibold uppercase tracking-wider text-emerald-100">{t('game_level_label') || 'Level'}</div>
                        <div className="text-2xl font-[900]">{t('game_level_val') || 'Focus Master'}</div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span>8,420 XP</span>
                        <span>12,000 XP</span>
                      </div>
                      <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "70%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-white rounded-full shadow-lg"
                        ></motion.div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                        <div className="text-2xl font-black">247</div>
                        <div className="text-xs text-emerald-100">{t('game_stat_tasks') || 'Tasks'}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                        <div className="text-2xl font-black">🔥 14</div>
                        <div className="text-xs text-emerald-100">{t('game_stat_streak') || 'Streak'}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                        <div className="text-2xl font-black">#328</div>
                        <div className="text-xs text-emerald-100">{t('game_stat_rank') || 'Rank'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={featureFadeInUp} className="space-y-6">
                <div className="flex gap-4 items-start p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-2xl flex-shrink-0">🏆</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{t('game_card_level_title')}</h3>
                    <p className="text-slate-600 text-sm">{t('game_card_level_desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl flex-shrink-0">🎯</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{t('game_card_daily_title')}</h3>
                    <p className="text-slate-600 text-sm">{t('game_card_daily_desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-2xl flex-shrink-0">👥</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{t('game_card_rank_title')}</h3>
                    <p className="text-slate-600 text-sm">{t('game_card_rank_desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-2xl flex-shrink-0">🏅</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{t('game_card_badge_title')}</h3>
                    <p className="text-slate-600 text-sm">{t('game_card_badge_desc')}</p>
                  </div>
                </div>
              </motion.div>
            </div>
            {/* Stats Showcase (Numbers remain same, text slightly hardcoded but clear) */}
            <motion.div variants={featureFadeInUp} className="max-w-4xl mx-auto">
              <div className="p-8 md:p-12 rounded-[2.5rem] bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-[900] text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 mb-2">10K+</div>
                    <div className="text-sm text-slate-600 font-semibold">{language === 'id' ? 'Pengguna Aktif' : 'Active Users'}</div>
                  </div>
                  <div>
                    <div className="text-4xl font-[900] text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 mb-2">50+</div>
                    <div className="text-sm text-slate-600 font-semibold">Achievements</div>
                  </div>
                  <div>
                    <div className="text-4xl font-[900] text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 mb-2">500K+</div>
                    <div className="text-sm text-slate-600 font-semibold">{language === 'id' ? 'Tugas Selesai' : 'Tasks Done'}</div>
                  </div>
                  <div>
                    <div className="text-4xl font-[900] text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 mb-2">24/7</div>
                    <div className="text-sm text-slate-600 font-semibold">{language === 'id' ? 'Kompetisi' : 'Competition'}</div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-200/20 rounded-full blur-[100px] -z-10"></div>
        </AnimatedSection>

        <AnimatedSection id="pricing" className="py-32 px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">{t('pricing_title') || 'Harga'}</h2>
            <p className="text-slate-500">{t('pricing_subtitle') || 'Pilih paket Anda.'}</p>
          </div>
          <div className="container mx-auto max-w-6xl grid lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div key={plan.plan} className={`p-8 rounded-[2.5rem] bg-white/60 border ${plan.highlighted ? 'border-emerald-500 shadow-xl' : 'border-white/60'}`}>
                <h3 className="text-2xl font-bold">{plan.plan}</h3>
                <div className="text-4xl font-black mt-4">{typeof plan.price.monthly === 'number' ? `Rp${(plan.price.monthly / 1000).toLocaleString('id')}k` : plan.price.monthly}</div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map(f => <li key={f} className="flex gap-2"><CheckIcon className="w-5 h-5 text-emerald-500" /> {f}</li>)}
                </ul>
                <a href="/login" className="block mt-8 py-3 px-6 bg-emerald-600 text-white rounded-xl text-center font-bold">{t('cta_start') || 'Pilih'}</a>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection id="faq" className="py-32 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-black mb-12">{t('faq_title') || 'FAQ'}</h2>
            <div className="text-left space-y-4">
              {faqData.map((faq, i) => <FAQItem key={i} question={faq.question} answer={faq.answer} />)}
            </div>
          </div>
        </AnimatedSection>

        {/* Footer */}
        <footer className="py-12 border-t border-slate-200/60 bg-white/30 backdrop-blur-xl">
          <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8 mb-8 text-left">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Sarang Tumbuh</h3>
              <p className="text-slate-500">{t('welcome_subtitle')}</p>
              <div className="flex gap-4 mt-4 text-slate-400">
                <FaTwitter /> <FaLinkedin /> <FaInstagram />
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('features_title')}</h4>
              <ul className="space-y-2 text-slate-500">
                <li>Timer</li>
                <li>Gamification</li>
                <li>AI Genius</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('pricing_title')}</h4>
              <ul className="space-y-2 text-slate-500">
                <li>Explorer</li>
                <li>Navigator</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Sarang Tumbuh. {t('footer_rights')}
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

// Wrap with LanguageProvider
export default function OdysseyLandingPage(props) {
  return (
    <LanguageProvider>
      <OdysseyLandingPageContent {...props} />
    </LanguageProvider>
  );
}