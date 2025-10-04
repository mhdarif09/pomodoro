import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Lenis from '@studio-freight/lenis';
import { 
  UsersIcon, EyeIcon, RocketLaunchIcon, 
  LightBulbIcon, HeartIcon, ScaleIcon, SparklesIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';

// --- Komponen Ikon Media Sosial (untuk Footer & Team Card) ---
const FaTwitter = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const FaLinkedin = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const FaInstagram = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zm-1.04 2.74a6.732 6.732 0 01-2.248-.035c-.75.036-1.144.17-1.502.31a3.027 3.027 0 00-1.12 1.12c-.14.358-.274.752-.31 1.502a6.732 6.732 0 01-.035 2.248c.036.75.17 1.144.31 1.502a3.027 3.027 0 001.12 1.12c.358.14.752.274 1.502.31a6.732 6.732 0 012.248.035c.75-.036 1.144-.17 1.502-.31a3.027 3.027 0 001.12-1.12c.14-.358.274-.752-.31-1.502a6.732 6.732 0 01.035-2.248c-.036-.75-.17-1.144-.31-1.502a3.027 3.027 0 00-1.12-1.12c-.358-.14-.752-.274-1.502-.31zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm0 1.5a2.25 2.25 0 110 4.5 2.25 2.25 0 010-4.5z" clipRule="evenodd" /></svg>;

// --- Helper Components ---
const AnimatedSection = ({ children, className = '', id = '' }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.section
      id={id} ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const TeamMemberCard = ({ member }) => (
    <motion.div variants={fadeInUp} className="group relative text-center">
        <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
            <img src={member.avatar} alt={member.name} className="relative w-full aspect-square object-cover rounded-3xl" />
            <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <div className="flex gap-4">
                    <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover:text-emerald-400 transition-colors"><FaTwitter /></a>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-emerald-400 transition-colors"><FaLinkedin /></a>
                </div>
            </div>
        </div>
        <h3 className="mt-6 text-xl font-bold text-white">{member.name}</h3>
        <p className="text-emerald-400">{member.role}</p>
    </motion.div>
);

const ValueCard = ({ value }) => (
    <motion.div variants={fadeInUp} className="p-8 border border-white/10 bg-gray-900/40 backdrop-blur-xl rounded-3xl text-center">
        <div className="w-16 h-16 mx-auto mb-6 p-4 bg-white/5 rounded-xl border border-white/10 text-emerald-400">
            {value.icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{value.title}</h3>
        <p className="text-gray-400">{value.description}</p>
    </motion.div>
);

// --- Halaman Utama "Tentang Kami" ---

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
  const founderImageY = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);

  // --- PERUBAHAN 1: Data tim disesuaikan menjadi 3 orang ---
  const teamMembers = [
    { name: 'Muhammad Arif', role: 'Pendiri & CEO', avatar: '/storage/images/arif.jpeg', linkedin: '#', twitter: '#' },
    { name: 'Riski Fatahila', role: 'Kepala Produk', avatar: '/storage/images/riski.jpeg', linkedin: '#', twitter: '#' },
    { name: 'Wahyu Rohmatul', role: 'Insinyur Utama AI', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=80', linkedin: '#', twitter: '#' },
  ];
  
  const coreValues = [
    { icon: <LightBulbIcon />, title: 'Inovasi Tanpa Henti', description: 'Kami terus mencari cara baru untuk mendobrak batasan dan menciptakan masa depan produktivitas.' },
    { icon: <HeartIcon />, title: 'Berpusat pada Manusia', description: 'Teknologi kami dirancang untuk memberdayakan, bukan menggantikan. Pertumbuhan Anda adalah prioritas kami.' },
    { icon: <ScaleIcon />, title: 'Integritas Radikal', description: 'Kami berkomitmen pada transparansi dan kejujuran dalam setiap tindakan yang kami ambil.' },
    { icon: <SparklesIcon />, title: 'Keunggulan dalam Detail', description: 'Dari piksel hingga algoritma, kami terobsesi dengan kualitas untuk memberikan pengalaman terbaik.' },
  ];

  return (
    <div className="min-h-screen bg-[#000011] text-gray-200 font-sans antialiased overflow-x-hidden">
      
      {/* Latar Belakang */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/stars.png')] opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#000011] via-transparent to-transparent"></div>
        <div className="absolute top-0 left-0 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-emerald-500/20 to-transparent rounded-full blur-3xl filter"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] translate-x-1/2 translate-y-1/2 bg-gradient-radial from-teal-500/20 to-transparent rounded-full blur-3xl filter"></div>
      </div>
      
      {/* Navbar */}
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#000011]/30 border-b border-white/10">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tighter">Sarang Tumbuh</a>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="/#features" className="hover:text-white transition-colors">Fitur</a>
            <a href="/#pricing" className="hover:text-white transition-colors">Harga</a>
            <a href="/tentang-kami" className="text-white font-semibold">Tentang Kami</a>
          </div>
          <div className="hidden md:block">
            <motion.a href="/register" whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)' }} whileTap={{ scale: 0.95 }} className="px-5 py-2 rounded-full font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white transition-shadow">
              Mulai Petualangan
            </motion.a>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="z-50 relative w-8 h-8 text-white"><motion.span animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 0 : -6 }} style={{ transformOrigin: 'center' }} className="absolute block h-0.5 w-full bg-current transform transition duration-300 ease-in-out"></motion.span><motion.span animate={{ opacity: isMenuOpen ? 0 : 1 }} className="absolute block h-0.5 w-full bg-current transform transition duration-300 ease-in-out" style={{top: '50%', transform: 'translateY(-50%)'}}></motion.span><motion.span animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? 0 : 6 }} style={{ transformOrigin: 'center' }} className="absolute block h-0.5 w-full bg-current transform transition duration-300 ease-in-out"></motion.span></button>
          </div>
        </nav>
      </motion.header>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="fixed inset-0 z-40 bg-[#000011]/80 backdrop-blur-xl md:hidden">
            <motion.div initial={{ y: "-100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="container mx-auto h-full flex flex-col items-center justify-center gap-8 text-center">
              <a href="/#features" onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold text-gray-300 hover:text-emerald-400">Fitur</a>
              <a href="/#pricing" onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold text-gray-300 hover:text-emerald-400">Harga</a>
              <a href="/tentang-kami" onClick={() => setIsMenuOpen(false)} className="text-3xl font-bold text-emerald-400">Tentang Kami</a>
              <motion.a href="/register" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-4 px-8 py-3 rounded-full font-semibold text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white">Mulai Gratis</motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        {/* Hero Section */}
        <AnimatedSection className="pt-40 pb-20 text-center container mx-auto px-6">
          <motion.h1 variants={fadeInUp} className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Kisah di Balik <br/><span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Sarang Tumbuh</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Kami adalah sekelompok pemimpi, pembuat, dan pembelajar seumur hidup yang percaya bahwa setiap individu memiliki potensi luar biasa yang menunggu untuk dibuka.
          </motion.p>
        </AnimatedSection>
        
        {/* Mission & Vision Section */}
        <AnimatedSection className="py-20 sm:py-24 container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div variants={fadeInUp}><div className="flex items-center gap-4 mb-4"><UsersIcon className="w-8 h-8 text-emerald-400"/><h2 className="text-3xl font-bold">Misi Kami</h2></div><p className="text-gray-400 text-lg">Membangun ekosistem paling cerdas dan intuitif yang memberdayakan individu ambisius untuk menata pikiran, mempertajam fokus, dan mewujudkan potensi penuh mereka.</p></motion.div>
            <motion.div variants={fadeInUp}><div className="flex items-center gap-4 mb-4"><EyeIcon className="w-8 h-8 text-emerald-400"/><h2 className="text-3xl font-bold">Visi Kami</h2></div><p className="text-gray-400 text-lg">Menjadi katalisator bagi generasi baru para pencipta, pemikir, dan pemimpin yang membentuk masa depan yang lebih baik melalui pertumbuhan diri yang berkelanjutan.</p></motion.div>
          </div>
        </AnimatedSection>

        {/* Founder Section */}
        <section ref={founderSectionRef} className="py-20 sm:py-32 overflow-hidden">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInUp} className="relative h-[500px] lg:h-[600px] order-last lg:order-first"><div className="absolute inset-0 overflow-hidden rounded-3xl"><motion.img src='/storage/images/arif.jpeg' alt="Muhammad Arif, Pendiri Sarang Tumbuh" className="absolute inset-0 w-full h-full object-cover" style={{ y: founderImageY }}/></div ></motion.div>
            <motion.div variants={fadeInUp}><p className="text-emerald-400 font-semibold mb-2">Sepatah Kata dari Pendiri</p><h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">"Setiap Ide Besar Dimulai dari Satu Sarang yang Teratur."</h2><p className="text-gray-400 mb-4">"Saya mendirikan Sarang Tumbuh dari perjuangan pribadi saya melawan kekacauan informasi dan kurangnya fokus. Saya membayangkan sebuah ruang digital di mana ide bisa berkembang, tujuan bisa tercapai, dan potensi tidak lagi menjadi konsep abstrak, tetapi kenyataan sehari-hari. Ini lebih dari sekadar aplikasi; ini adalah filosofi."</p><p className="text-white font-semibold">Muhammad Arif</p><p className="text-gray-500">Pendiri & CEO, Sarang Tumbuh</p></motion.div>
          </div>
        </section>

        {/* Team Section */}
        <AnimatedSection className="py-20 sm:py-32 bg-[#000011]/80 backdrop-blur-xl">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-black tracking-tight mb-4">Temui Para Arsitek Pertumbuhan</motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-gray-400">Tim di balik layar yang bersemangat membantu Anda mencapai versi terbaik dari diri Anda.</motion.p>
            </div>
            {/* --- PERUBAHAN 2: Layout grid dioptimalkan untuk 3 item --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {teamMembers.map((member) => <TeamMemberCard key={member.name} member={member} />)}
            </div>
          </div>
        </AnimatedSection>

        {/* "Our Values" Section */}
        <AnimatedSection className="py-20 sm:py-32">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto"><motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-black tracking-tight mb-4">Nilai-Nilai Kami</motion.h2><motion.p variants={fadeInUp} className="text-lg text-gray-400">Prinsip yang memandu setiap keputusan, fitur, dan interaksi di Sarang Tumbuh.</motion.p></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">{coreValues.map(value => <ValueCard key={value.title} value={value} />)}</div>
          </div>
        </AnimatedSection>

        {/* --- PERUBAHAN 3: Bagian Karir Baru Ditambahkan --- */}
        <AnimatedSection id="karir" className="py-20 sm:py-24 px-6">
            <div className="container mx-auto max-w-4xl text-center">
              <motion.div variants={fadeInUp} className="relative p-px rounded-3xl bg-gradient-to-b from-white/10 to-transparent">
                  <div className="p-8 md:p-12 border border-white/10 rounded-[23px] bg-gray-950 bg-gradient-to-br from-teal-950/20 to-transparent">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tight">Bangun Masa Depan Bersama Kami</h2>
                    <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">Kami selalu mencari individu berbakat yang bersemangat tentang produktivitas, AI, dan pertumbuhan pribadi. Jika Anda ingin membuat dampak, kami ingin mendengar dari Anda.</p>
                    <motion.a href="mailto:karir@sarangtumbuh.com" whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(16,185,129,0.6)' }} whileTap={{ scale: 0.95 }} className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-full font-bold text-lg text-white transition-all">
                      Lihat Posisi Terbuka <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  </div>
              </motion.div>
            </div>
        </AnimatedSection>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#000011]/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
            <div className="md:col-span-2"><a href="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tighter mb-4 inline-block">Sarang Tumbuh</a><p className="text-gray-400 max-w-sm mx-auto md:mx-0 mb-6">Ekosistem cerdas untuk menata pikiran, mempertajam fokus, dan mencapai hal yang dulu tampak mustahil.</p><div className="flex justify-center md:justify-start gap-6"><a href="#" className="text-gray-400 hover:text-emerald-400 transition"><FaTwitter /></a><a href="#" className="text-gray-400 hover:text-emerald-400 transition"><FaLinkedin /></a><a href="#" className="text-gray-400 hover:text-emerald-400 transition"><FaInstagram /></a></div></div>
            <div><h4 className="font-bold text-white mb-4">Produk</h4><ul className="space-y-3 text-gray-400"><li><a href="/#features" className="hover:text-emerald-400 transition">Fitur</a></li><li><a href="/#pricing" className="hover:text-emerald-400 transition">Harga</a></li><li><a href="#" className="hover:text-emerald-400 transition">Keamanan</a></li></ul></div>
            <div>
              <h4 className="font-bold text-white mb-4">Perusahaan</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/tentang-kami" className="hover:text-emerald-400 transition">Tentang Kami</a></li>
                {/* --- PERUBAHAN 4: Link Karir ditambahkan ke Footer --- */}
                <li><a href="#karir" className="hover:text-emerald-400 transition">Karir</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Hubungi Kami</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t border-white/10 pt-8 text-center text-gray-500 text-sm"><p>&copy; {new Date().getFullYear()} Sarang Tumbuh. Hak Cipta Dilindungi.</p></div>
        </div>
      </footer>
      
      <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #000011; }
        ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #059669; }
      `}</style>
    </div>
  );
}