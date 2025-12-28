import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Head } from '@inertiajs/react';
import Lenis from '@studio-freight/lenis';
import {
  UsersIcon, EyeIcon, RocketLaunchIcon,
  LightBulbIcon, HeartIcon, ScaleIcon, SparklesIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';

// --- Social Media Icons ---
const FaTwitter = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const FaLinkedin = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;
const FaInstagram = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zm-1.04 2.74a6.732 6.732 0 01-2.248-.035c-.75.036-1.144.17-1.502.31a3.027 3.027 0 00-1.12 1.12c-.14.358-.274.752-.31 1.502a6.732 6.732 0 01-.035 2.248c.036.75.17 1.144.31 1.502a3.027 3.027 0 001.12 1.12c.358.14.752.274 1.502.31a6.732 6.732 0 012.248.035c.75-.036 1.144-.17 1.502-.31a3.027 3.027 0 001.12-1.12c.14-.358.274-.752.31-1.502a6.732 6.732 0 01.035-2.248c-.036-.75-.17-1.144-.31-1.502a3.027 3.027 0 00-1.12-1.12c-.358-.14-.752-.274-1.502-.31zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm0 1.5a2.25 2.25 0 110 4.5 2.25 2.25 0 010-4.5z" clipRule="evenodd" /></svg>;

// --- Helper Components ---
const AnimatedSection = ({ children, className = '', id = '' }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.section
      id={id} ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] } }
};

const TeamMemberCard = ({ member }) => (
  <motion.div variants={fadeInUp} className="group relative text-center">
    <div className="relative overflow-hidden rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
      <img src={member.avatar} alt={member.name} className="w-full aspect-square object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8">
        <div className="flex gap-4">
          <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-emerald-400 hover:text-white transition-all"><FaTwitter /></a>
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-emerald-400 hover:text-white transition-all"><FaLinkedin /></a>
        </div>
      </div>
    </div>
    <h3 className="mt-6 text-xl font-bold text-slate-900">{member.name}</h3>
    <p className="text-emerald-600 font-medium">{member.role}</p>
  </motion.div>
);

const ValueCard = ({ value }) => (
  <motion.div variants={fadeInUp} className="p-8 rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/40 text-center hover:scale-[1.02] transition-all duration-300">
    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center text-emerald-600 shadow-inner border border-white/60">
      {value.icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
    <p className="text-slate-600 leading-relaxed">{value.description}</p>
  </motion.div>
);

export default function AboutUsPage() {
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

  const founderSectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: founderSectionRef, offset: ["start end", "end start"] });
  const founderImageY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  const teamMembers = [
    { name: 'Muhammad Arif', role: 'Pendiri & CEO', avatar: '/storage/images/arif.jpeg', linkedin: '#', twitter: '#' },
    { name: 'Riski Fatahila', role: 'Kepala Produk', avatar: '/storage/images/riski.jpeg', linkedin: '#', twitter: '#' },
    { name: 'Wahyu Rohmatul', role: 'Insinyur Utama AI', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=80', linkedin: '#', twitter: '#' },
  ];

  const coreValues = [
    { icon: <LightBulbIcon className="w-8 h-8" />, title: 'Inovasi Tanpa Henti', description: 'Kami terus mencari cara baru untuk menciptakan masa depan produktivitas.' },
    { icon: <HeartIcon className="w-8 h-8" />, title: 'Berpusat pada Manusia', description: 'Teknologi kami dirancang untuk memberdayakan pertumbuhan Anda.' },
    { icon: <ScaleIcon className="w-8 h-8" />, title: 'Integritas Radikal', description: 'Transparansi dan kejujuran dalam setiap tindakan kami.' },
    { icon: <SparklesIcon className="w-8 h-8" />, title: 'Keunggulan Detail', description: 'Terobsesi dengan kualistas untuk pengalaman terbaik.' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <Head>
        <title>Tentang Kami - Sarang Tumbuh</title>
        <meta name="description" content="Kisah di balik Sarang Tumbuh - platform produktivitas yang memberdayakan individu ambisius untuk mencapai potensi penuh mereka." />
      </Head>

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-[#F5F5F7] to-[#F5F5F7]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-200/20 rounded-full blur-[120px] -z-10"></div>
      </div>

      {/* Navbar */}
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/20">
        <nav className="container mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-lg">S</span>
            Sarang Tumbuh
          </a>
          <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-500">
            <a href="/#features" className="hover:text-slate-900 transition-colors">Fitur</a>
            <a href="/#pricing" className="hover:text-slate-900 transition-colors">Harga</a>
            <a href="/about" className="text-emerald-600 font-bold">Tentang Kami</a>
          </div>
          <div className="hidden md:block">
            <motion.a href="/login" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 py-2.5 rounded-full font-semibold text-[15px] bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
              Masuk
            </motion.a>
          </div>
          <div className="md:hidden">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-white/95 backdrop-blur-2xl md:hidden flex items-center justify-center">
            <div className="flex flex-col items-center gap-8 text-center p-6">
              <a href="/#features" onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold text-slate-900">Fitur</a>
              <a href="/#pricing" onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold text-slate-900">Harga</a>
              <a href="/about" onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold text-emerald-600">Tentang Kami</a>
              <motion.a href="/login" className="mt-4 px-8 py-4 rounded-full font-bold text-xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">Mulai Sekarang</motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        {/* Hero Section */}
        <AnimatedSection className="pt-40 pb-20 text-center container mx-auto px-6">
          <motion.h1 variants={fadeInUp} className="text-5xl sm:text-7xl lg:text-8xl font-[900] tracking-tighter mb-8 text-slate-900 leading-[1.05]">
            Kisah di Balik <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500">Sarang Tumbuh</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
            Kami adalah sekelompok pemimpi, pembuat, dan pembelajar seumur hidup yang percaya bahwa setiap individu memiliki potensi luar biasa yang menunggu untuk dibuka.
          </motion.p>
        </AnimatedSection>

        {/* Mission & Vision Section */}
        <AnimatedSection className="py-24 container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
            <motion.div variants={fadeInUp} className="p-10 rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/40">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center text-emerald-600 shadow-inner border border-white/60">
                  <UsersIcon className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-[800] text-slate-900">Misi Kami</h2>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">Membangun ekosistem paling cerdas dan intuitif yang memberdayakan individu ambisius untuk menata pikiran, mempertajam fokus, dan mewujudkan potensi penuh mereka.</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="p-10 rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/40">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center text-emerald-600 shadow-inner border border-white/60">
                  <EyeIcon className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-[800] text-slate-900">Visi Kami</h2>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">Menjadi katalisator bagi generasi baru para pencipta, pemikir, dan pemimpin yang membentuk masa depan yang lebih baik melalui pertumbuhan diri yang berkelanjutan.</p>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Founder Section */}
        <section ref={founderSectionRef} className="py-32 overflow-hidden">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInUp} className="relative h-[500px] lg:h-[600px] order-last lg:order-first">
              <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl shadow-slate-200/50">
                <motion.img src='/storage/images/arif.jpeg' alt="Muhammad Arif, Pendiri Sarang Tumbuh" className="absolute inset-0 w-full h-full object-cover" style={{ y: founderImageY }} />
              </div >
            </motion.div>
            <motion.div variants={fadeInUp}>
              <p className="text-emerald-600 font-bold mb-4 text-sm uppercase tracking-wider">Sepatah Kata dari Pendiri</p>
              <h2 className="text-4xl md:text-5xl font-[900] tracking-tighter text-slate-900 mb-6">"Setiap Ide Besar Dimulai dari Satu Sarang yang Teratur."</h2>
              <p className="text-slate-600 mb-6 leading-relaxed text-lg">"Saya mendirikan Sarang Tumbuh dari perjuangan pribadi saya melawan kekacauan informasi dan kurangnya fokus. Saya membayangkan sebuah ruang digital di mana ide bisa berkembang, tujuan bisa tercapai, dan potensi tidak lagi menjadi konsep abstrak, tetapi kenyataan sehari-hari. Ini lebih dari sekadar aplikasi; ini adalah filosofi."</p>
              <p className="text-slate-900 font-bold text-lg">Muhammad Arif</p>
              <p className="text-slate-500">Pendiri & CEO, Sarang Tumbuh</p>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <AnimatedSection className="py-32">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-[900] tracking-tighter mb-6 text-slate-900">Temui Para Arsitek Pertumbuhan</motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-slate-500 font-medium">Tim di balik layar yang bersemangat membantu Anda mencapai versi terbaik dari diri Anda.</motion.p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {teamMembers.map((member) => <TeamMemberCard key={member.name} member={member} />)}
            </div>
          </div>
        </AnimatedSection>

        {/* Values Section */}
        <AnimatedSection className="py-32">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-[900] tracking-tighter mb-6 text-slate-900">Nilai-Nilai Kami</motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-slate-500 font-medium">Prinsip yang memandu setiap keputusan, fitur, dan interaksi di Sarang Tumbuh.</motion.p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {coreValues.map(value => <ValueCard key={value.title} value={value} />)}
            </div>
          </div>
        </AnimatedSection>

        {/* Career CTA */}
        <AnimatedSection id="karir" className="py-32 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div variants={fadeInUp} className="relative p-12 md:p-16 rounded-[3rem] bg-emerald-900 overflow-hidden text-white shadow-2xl shadow-emerald-900/30">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-400/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-400/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-[900] mb-6 tracking-tighter">Bangun Masa Depan Bersama Kami</h2>
                <p className="text-xl text-emerald-50 mb-10 max-w-2xl mx-auto font-medium">Kami selalu mencari individu berbakat yang bersemangat about produktivitas, AI, dan pertumbuhan pribadi. Jika Anda ingin membuat dampak, kami ingin mendengar dari Anda.</p>
                <motion.a href="mailto:karir@sarangtumbuh.com" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-emerald-900 rounded-full font-bold text-lg transition-all shadow-2xl">
                  Lihat Posisi Terbuka <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/30 backdrop-blur-xl pt-24 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-transparent to-slate-50/80 -z-10"></div>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left mb-16">
            <div className="md:col-span-2">
              <a href="/" className="text-2xl font-bold text-slate-900 tracking-tight mb-6 inline-flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-lg">S</span>
                Sarang Tumbuh
              </a>
              <p className="text-slate-500 max-w-sm mx-auto md:mx-0 mb-8 leading-relaxed font-medium mt-4">Suaka digital untuk menata pikiran, mempertajam fokus, dan mencapai potensi tertinggi Anda.</p>
              <div className="flex justify-center md:justify-start gap-6">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm"><FaTwitter /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm"><FaLinkedin /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm"><FaInstagram /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-lg">Produk</h4>
              <ul className="space-y-4 text-slate-500 font-medium">
                <li><a href="/#features" className="hover:text-emerald-600 transition-colors">Fitur</a></li>
                <li><a href="/#pricing" className="hover:text-emerald-600 transition-colors">Harga</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Keamanan</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-lg">Perusahaan</h4>
              <ul className="space-y-4 text-slate-500 font-medium">
                <li><a href="/about" className="hover:text-emerald-600 transition-colors">Tentang Kami</a></li>
                <li><a href="#karir" className="hover:text-emerald-600 transition-colors">Karir</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Jurnal</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Kontak</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200/60 pt-8 text-center text-slate-400 text-sm font-medium"><p>&copy; {new Date().getFullYear()} Sarang Tumbuh. Dibuat dengan 💚 untuk para pemimpi.</p></div>
        </div>
      </footer>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #059669; }
      `}</style>
    </div>
  );
}