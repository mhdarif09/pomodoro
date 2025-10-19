import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Lenis from '@studio-freight/lenis';
import clsx from 'clsx';
import { 
  RocketLaunchIcon, CheckIcon, ArrowRightIcon, StarIcon,
  ChatBubbleLeftRightIcon, UserGroupIcon, DocumentTextIcon, SparklesIcon,
  ClockIcon, PresentationChartLineIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';

// --- Komponen Ikon Media Sosial (didefinisikan di luar agar bersih) ---
const FaTwitter = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const FaLinkedin = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
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

const fadeInUp = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const FeatureCard = ({ feature }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const handleMouseMove = (event) => {
        const card = event.currentTarget;
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = (event.clientX - left) / width - 0.5;
        const y = (event.clientY - top) / height - 0.5;
        setRotateX(-y * 25); setRotateY(x * 25);
    };
    const handleMouseLeave = () => { setRotateX(0); setRotateY(0); };

    return (
        <motion.div ref={ref} variants={fadeInUp} className="group relative p-8 rounded-3xl border border-white/10 bg-gray-900/40 backdrop-blur-xl overflow-hidden" style={{ perspective: '1000px' }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -inset-px rounded-3xl border border-transparent group-hover:border-emerald-500/50 transition-colors duration-500"></div>
            <motion.div className="transition-transform duration-300 ease-out" style={{ y, rotateX, rotateY, transformStyle: 'preserve-3d' }}>
                <div style={{ transform: 'translateZ(50px)' }}>
                    <div className="text-emerald-400 mb-4">{feature.icon && <div className="w-12 h-12 p-3 bg-white/5 rounded-lg border border-white/10 shadow-lg shadow-emerald-500/10">{feature.icon}</div>}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm flex-grow">{feature.description}</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <motion.div variants={fadeInUp} className="border-b border-white/10">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-6 text-left">
                <span className="text-lg font-medium text-white">{question}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDownIcon className="w-6 h-6 text-emerald-400"/>
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                        <p className="pb-6 text-gray-400">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

const Marquee = ({ children, direction = 'left' }) => (
    <div className="relative flex w-full overflow-hidden">
        <motion.div className="flex min-w-full shrink-0 items-center justify-around gap-8" variants={{ animate: { translateX: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'], transition: { ease: 'linear', duration: 50, repeat: Infinity }}}} animate="animate">{children}</motion.div>
        <motion.div className="flex min-w-full shrink-0 items-center justify-around gap-8" variants={{ animate: { translateX: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'], transition: { ease: 'linear', duration: 50, repeat: Infinity }}}} animate="animate">{children}</motion.div>
    </div>
);


export default function OdysseyLandingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '200%']);
  const heroFragmentsY = useTransform(scrollYProgress, [0, 1], ['0%', '500%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  const features = [
    { icon: <ClockIcon className="w-full h-full" />, title: 'Timer Pomodoro', description: 'Kuasai fokus Anda dengan timer cerdas yang dirancang untuk sesi kerja mendalam dan istirahat yang efektif.'},
    { icon: <SparklesIcon className="w-full h-full" />, title: 'Wawasan Pertumbuhan AI', description: 'Terima wawasan dan saran yang dipersonalisasi berdasarkan kemajuan Anda untuk mempercepat pertumbuhan.'},
    { icon: <PresentationChartLineIcon className="w-full h-full" />, title: 'Analitik Belajar', description: 'Visualisasikan pola kerja Anda, lacak produktivitas, dan identifikasi area untuk perbaikan.'},
    { icon: <UserGroupIcon className="w-full h-full" />, title: 'Komunitas', description: 'Bergabung dengan para pencapai ambisius lainnya. Berbagi strategi, merayakan kemenangan, dan tumbuh bersama.'},
    { icon: <ChatBubbleLeftRightIcon className="w-full h-full" />, title: 'Asisten Chat AI', description: 'Rekan AI pribadi Anda untuk bertukar pikiran, mengatasi kebuntuan, dan tetap termotivasi.'},
    { icon: <DocumentTextIcon className="w-full h-full" />, title: 'Chat dengan PDF', description: 'Ajukan pertanyaan pada dokumen Anda. Dapatkan ringkasan dan jawaban instan dari PDF apa pun.'}
  ];

  const topics = [
    { name: 'Kiat Produktivitas' }, { name: 'Pengembangan Diri' }, { name: 'AI & Masa Depan' },
    { name: 'Pengembangan Karir' }, { name: 'Kesehatan Mental' }, { name: 'Filsafat Stoik' }
  ];

  const testimonials = [
    { quote: "Platform ini benar-benar mengubah cara saya meraih tujuan. Fitur AI-nya seperti memiliki pelatih pribadi 24/7.", name: "Sarah Chen", role: "Product Designer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"},
    { quote: "Timer Pomodoro cerdasnya membantu saya menyelesaikan tesis 2 minggu lebih cepat. Saya jadi lebih fokus dari sebelumnya!", name: "Marcus Johnson", role: "Kandidat PhD", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"},
    { quote: "Akhirnya, sebuah aplikasi produktivitas yang benar-benar mengerti saya. Dukungan komunitasnya luar biasa.", name: "Priya Sharma", role: "Wirausahawan", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80"},
    { quote: "Analitik dari Sarang Tumbuh mengubah segalanya. Saya menemukan jam produktif puncak saya dan berhasil melipatgandakan hasil kerja.", name: "David Lee", role: "Software Engineer", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80"},
    { quote: "Bisa 'chatting' dengan PDF itu luar biasa. Riset yang biasanya butuh berhari-hari kini selesai dalam hitungan menit. Sangat direkomendasikan!", name: "Dr. Emily Carter", role: "Peneliti", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80"},
    { quote: "Wawasan pertumbuhan dari AI-nya sangat akurat. Seolah-olah aplikasi ini tahu apa yang perlu saya perbaiki sebelum saya sadar.", name: "Alex Rivera", role: "Pendiri Startup", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80"},
  ];
  
  const faqData = [
      { question: "Siapa yang cocok menggunakan Sarang Tumbuh?", answer: "Sarang Tumbuh dirancang untuk pelajar, profesional, peneliti, dan siapa saja yang ambisius dan ingin memaksimalkan potensi diri. Jika Anda ingin lebih teratur, fokus, dan produktif, Sarang Tumbuh adalah untuk Anda." },
      { question: "Apakah data saya aman?", answer: "Tentu saja. Keamanan dan privasi data adalah prioritas utama kami. Semua data Anda dienkripsi baik saat transit maupun saat disimpan. Kami tidak akan pernah membagikan data Anda dengan pihak ketiga." },
      { question: "Bagaimana cara kerja fitur AI?", answer: "Kami menggunakan model bahasa canggih (Large Language Models) yang telah dilatih khusus untuk tugas-tugas produktivitas dan sintesis pengetahuan. AI ini beroperasi di dalam lingkungan aman kami untuk menganalisis data Anda dan memberikan wawasan yang relevan." },
      { question: "Bisakah saya membatalkan langganan kapan saja?", answer: "Ya. Anda bisa membatalkan langganan paket berbayar Anda kapan saja tanpa denda. Anda akan tetap memiliki akses ke fitur premium hingga akhir siklus penagihan Anda." }
  ];


  const pricingPlans = [
    { plan: 'Penjelajah', price: { monthly: 'Gratis', yearly: 'Gratis' }, features: ['Jurnal AI (10/bulan)', 'Timer Pomodoro Dasar', 'Peta Tujuan (3 tujuan)', 'Akses Komunitas'] },
    { plan: 'Navigator', price: { monthly: 20000, yearly: 16000 }, features: ['Jurnal AI Tanpa Batas', 'Pomodoro Cerdas', 'Tujuan Tanpa Batas', 'Kecerdasan PDF (50/bulan)', 'Dukungan Prioritas'], highlighted: true },
    { plan: 'Kapten', price: { monthly: 29000, yearly: 23200 }, features: ['Semua di Navigator', 'Kolaborasi Tim (5 anggota)', 'Proses PDF Tanpa Batas', 'API Wawasan AI Lanjutan'], comingSoon: true }
  ];
  
  return (
    <div className="min-h-screen bg-[#000011] text-gray-200 font-sans antialiased overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/stars.png')] opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#000011] via-transparent to-transparent"></div>
        <div className="absolute top-1/4 left-1/2 w-[1000px] h-[1000px] -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-emerald-500/20 to-transparent rounded-full blur-3xl filter animate-pulse-slow"></div>
      </div>

      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#000011]/30 border-b border-white/10">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tighter">Sarang Tumbuh</div>
          
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Fitur</a>
            <a href="#topics" className="hover:text-white transition-colors">Topik</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimoni</a>
            <a href="#pricing" className="hover:text-white transition-colors">Harga</a>
            <a href="/about" className="hover:text-white transition-colors">Tentang Kami</a>
          </div>
          
          <div className="hidden md:block">
            <motion.a href="/login" whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)' }} whileTap={{ scale: 0.95 }} className="px-5 py-2 rounded-full font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white transition-shadow">
              Mulai Petualangan
            </motion.a>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="z-50 relative w-8 h-8 text-white">
              <motion.span animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 0 : -6 }} style={{ transformOrigin: 'center' }} className="absolute block h-0.5 w-full bg-current transform transition duration-300 ease-in-out"></motion.span>
              <motion.span animate={{ opacity: isMenuOpen ? 0 : 1 }} className="absolute block h-0.5 w-full bg-current transform transition duration-300 ease-in-out" style={{top: '50%', transform: 'translateY(-50%)'}}></motion.span>
              <motion.span animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? 0 : 6 }} style={{ transformOrigin: 'center' }} className="absolute block h-0.5 w-full bg-current transform transition duration-300 ease-in-out"></motion.span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 bg-[#000011]/80 backdrop-blur-xl md:hidden"
          >
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="container mx-auto h-full flex flex-col items-center justify-center gap-8 text-center"
            >
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold text-gray-300 hover:text-emerald-400">Fitur</a>
              <a href="#topics" onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold text-gray-300 hover:text-emerald-400">Topik</a>
              <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold text-gray-300 hover:text-emerald-400">Testimoni</a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold text-gray-300 hover:text-emerald-400">Harga</a>
              <motion.a href="/login" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-4 px-8 py-3 rounded-full font-semibold text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                Mulai Gratis
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="relative z-10">
        <section ref={heroRef} className="h-[200vh] relative">
          <div className="sticky top-0 h-screen flex flex-col items-center justify-center text-center px-6">
            <motion.div style={{ y: heroTextY, opacity: heroOpacity }} className="relative z-10">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                Rancang Sarang Anda.
                <br/>
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Kuasai Potensi Diri.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12">
                Ekosistem cerdas untuk menata pikiran, mempertajam fokus, dan mencapai hal yang dulu tampak mustahil.
              </p>
              <motion.a href="/login" whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)' }} whileTap={{ scale: 0.95 }} className="group inline-block relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full font-bold text-lg text-white transition-shadow duration-300">
                <span className="flex items-center gap-2">Mulai Gratis <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
              </motion.a>
            </motion.div>
            <motion.div style={{ y: heroFragmentsY, opacity: heroOpacity }} className="absolute inset-0 w-full h-full z-0">
                <div className="absolute top-[10%] left-[15%] w-48 h-32 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"></div>
                <div className="absolute bottom-[15%] right-[20%] w-64 h-40 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"></div>
            </motion.div>
          </div>
        </section>

        {/* Sections Features, Topics, Testimonials remain unchanged */}
        <AnimatedSection id="features" className="py-20 sm:py-32 px-6 bg-[#000011]/80 backdrop-blur-xl">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-black tracking-tight mb-4">Perangkat Lengkap untuk <span className="text-emerald-400">Performa Puncak</span></motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-400 max-w-3xl mx-auto">Dari ide acak menjadi kesuksesan terstruktur. Kami siapkan alatnya, Anda ciptakan masa depan.</motion.p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => <FeatureCard key={i} feature={feature} />)}
            </div>
          </div>
        </AnimatedSection>
        
        <AnimatedSection id="topics" className="py-20 sm:py-32">
            <div className="container mx-auto">
              <motion.div variants={fadeInUp} className="text-center mb-12 px-6">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                    Jelajahi <span className="text-emerald-400">Konstelasi Ide</span>
                  </h2>
                  <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    Terhubung dengan para pembelajar dan pencapai yang penuh semangat.
                  </p>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Marquee>
                    {topics.map((topic) => (
                      <div key={topic.name} className="px-6 py-3 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm text-lg font-semibold whitespace-nowrap">
                        {topic.name}
                      </div>
                    ))}
                </Marquee>
              </motion.div>
            </div>
        </AnimatedSection>
        
        <AnimatedSection id="testimonials" className="py-20 sm:py-32">
          <div className="container mx-auto">
            <motion.div variants={fadeInUp} className="text-center mb-16 px-6">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Dicintai Para Pencapai</h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-400">Dengarkan apa kata mereka yang telah bertransformasi.</motion.p>
            </motion.div>
            <motion.div variants={fadeInUp} className="space-y-8">
              <Marquee>
                {testimonials.slice(0, 3).map((t) => (
                  <div key={t.name} className="relative w-96 flex-shrink-0 p-px rounded-3xl bg-gradient-to-b from-white/10 to-transparent">
                    <div className="bg-gray-900/80 backdrop-blur-xl rounded-[23px] h-full p-8 flex flex-col">
                      <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <StarIcon key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}</div>
                      <p className="text-gray-300 mb-6 italic flex-grow">"{t.quote}"</p>
                      <div className="flex items-center gap-4 border-t border-white/10 pt-6 mt-auto">
                        <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/50" />
                        <div><div className="font-bold text-white">{t.name}</div><div className="text-sm text-gray-500">{t.role}</div></div>
                      </div>
                    </div>
                  </div>
                ))}
              </Marquee>
              <Marquee direction="right">
                {testimonials.slice(3, 6).map((t) => (
                  <div key={t.name} className="relative w-96 flex-shrink-0 p-px rounded-3xl bg-gradient-to-b from-white/10 to-transparent">
                    <div className="bg-gray-900/80 backdrop-blur-xl rounded-[23px] h-full p-8 flex flex-col">
                      <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <StarIcon key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}</div>
                      <p className="text-gray-300 mb-6 italic flex-grow">"{t.quote}"</p>
                      <div className="flex items-center gap-4 border-t border-white/10 pt-6 mt-auto">
                        <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/50" />
                        <div><div className="font-bold text-white">{t.name}</div><div className="text-sm text-gray-500">{t.role}</div></div>
                      </div>
                    </div>
                  </div>
                ))}
              </Marquee>
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection id="pricing" className="py-20 sm:py-32 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-black tracking-tight mb-4">Temukan Paket Sempurna Anda</motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-400">Mulai gratis, tingkatkan saat ambisi Anda melampaui batas.</motion.p>
            </div>
            <motion.div variants={fadeInUp} className="flex justify-center items-center gap-4 mb-12">
                <span className={clsx("font-semibold", billingCycle === 'monthly' ? 'text-white' : 'text-gray-500')}>Bulanan</span>
                <div onClick={() => setBillingCycle(c => c === 'monthly' ? 'yearly' : 'monthly')} className="w-14 h-8 flex items-center bg-white/5 rounded-full p-1 cursor-pointer">
                    <motion.div layout transition={{ type: 'spring', stiffness: 700, damping: 30 }} className="w-6 h-6 bg-emerald-500 rounded-full" style={{ marginLeft: billingCycle === 'yearly' ? 'auto' : '0' }}/>
                </div>
                <span className={clsx("font-semibold", billingCycle === 'yearly' ? 'text-white' : 'text-gray-500')}>Tahunan</span>
                <span className="bg-emerald-400/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">Hemat 20%</span>
            </motion.div>
            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
              {pricingPlans.map((plan) => (
                <motion.div key={plan.plan} variants={fadeInUp} className={clsx('relative p-8 rounded-3xl flex flex-col border', plan.highlighted ? 'border-emerald-500 bg-gray-900/50' : 'border-white/10 bg-gray-900/50')}>
                  {plan.highlighted && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold">Paling Populer</div>}
                  <h3 className="text-2xl font-bold text-white">{plan.plan}</h3>
                  <div className="mt-4 flex items-baseline min-h-[64px] text-white">
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={billingCycle} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.2 }} 
                        className="text-5xl font-extrabold tracking-tight"
                      >
                        {/* --- PERUBAHAN HARGA 2: Memformat angka ke format Rupiah --- */}
                        {typeof plan.price[billingCycle] === 'number' 
                          ? `Rp${plan.price[billingCycle].toLocaleString('id-ID')}` 
                          : plan.price[billingCycle]}
                      </motion.span>
                    </AnimatePresence>
                    {plan.price.monthly !== 'Gratis' && <span className="ml-2 text-white/50">/bulan</span>}
                  </div>
                  <ul className="mt-8 space-y-4 flex-grow text-gray-300">{plan.features.map((f, i) => (<li key={i} className="flex items-start gap-3"><CheckIcon className="h-6 w-6 flex-shrink-0 text-emerald-400" /><span>{f}</span></li>))}</ul>
                  
                  {plan.comingSoon ? (
                    <button disabled className="mt-10 w-full rounded-xl py-4 font-bold text-lg transition-all duration-300 bg-gray-600 cursor-not-allowed text-center">
                        Segera Hadir
                    </button>
                  ) : (
                    <motion.a 
                        href={`/login?plan=${plan.plan.toLowerCase()}`}
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }} 
                        className={clsx('block text-center mt-10 w-full rounded-xl py-4 font-bold text-lg transition-all duration-300', plan.highlighted ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-white/10 hover:bg-white/20 text-white')}>
                        Pilih Paket
                    </motion.a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>
        
        <AnimatedSection id="faq" className="py-20 sm:py-32 px-6">
            <div className="container mx-auto max-w-4xl">
                <motion.div variants={fadeInUp} className="text-center mb-12">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                    Pertanyaan Umum
                  </h2>
                  <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    Punya pertanyaan? Kami punya jawabannya.
                  </p>
                </motion.div>
                <div className="max-w-3xl mx-auto">
                    {faqData.map((faq, i) => (
                        <FAQItem key={i} question={faq.question} answer={faq.answer}/>
                    ))}
                </div>
            </div>
        </AnimatedSection>
        
        <AnimatedSection className="py-20 sm:py-32 px-6">
            <div className="container mx-auto max-w-4xl text-center">
              <motion.div variants={fadeInUp} className="relative p-px rounded-3xl bg-gradient-to-b from-white/10 to-transparent">
                  <div className="p-8 md:p-12 border border-white/10 rounded-[23px] bg-gray-950 bg-gradient-to-br from-emerald-950/20 to-transparent">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight">Siap Memulai Sarang Anda?</h2>
                    <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">Perjalanan Anda menuju performa puncak dimulai sekarang. Tidak perlu kartu kredit.</p>
                    <motion.a href="/login" whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(16,185,129,0.6)' }} whileTap={{ scale: 0.95 }} className="group inline-block px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-bold text-xl text-white transition-shadow">
                      <span className="flex items-center gap-3">Klaim Akun Gratis Anda <RocketLaunchIcon className="h-6 w-6 group-hover:rotate-12 transition-transform" /></span>
                    </motion.a>
                  </div>
              </motion.div>
            </div>
        </AnimatedSection>
      </main>

      <footer className="border-t border-white/10 mt-20 bg-[#000011]/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tighter mb-4">Sarang Tumbuh</h3>
              <p className="text-gray-400 max-w-sm mx-auto md:mx-0 mb-6">
                Ekosistem cerdas untuk menata pikiran, mempertajam fokus, dan mencapai hal yang dulu tampak mustahil.
              </p>
              <div className="flex justify-center md:justify-start gap-6">
                <a href="#" className="text-gray-400 hover:text-emerald-400 transition"><FaTwitter /></a>
                <a href="#" className="text-gray-400 hover:text-emerald-400 transition"><FaLinkedin /></a>
                <a href="#" className="text-gray-400 hover:text-emerald-400 transition"><FaInstagram /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Produk</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-emerald-400 transition">Fitur</a></li>
                <li><a href="#pricing" className="hover:text-emerald-400 transition">Harga</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Integrasi</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Keamanan</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Perusahaan</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/about" className="hover:text-emerald-400 transition">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Karir</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Hubungi Kami</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Sarang Tumbuh. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
      <style jsx global>{`
        .animate-pulse-slow { animation: pulse-slow 20s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.2; }
          50% { transform: scale(1.2) rotate(45deg); opacity: 0.3; }
        }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #000011; }
        ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #059669; }
      `}</style>
    </div>
  );
}