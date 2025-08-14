import { useState, useEffect, useCallback } from 'react';
import { Link, Head } from '@inertiajs/react';
import { useInView } from 'react-intersection-observer';
import { FaInstagram, FaCompass, FaYoutube, FaTiktok, FaLinkedin, FaTwitter } from 'react-icons/fa';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import {
    RocketLaunchIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon,
    SparklesIcon,
    UserGroupIcon,
    ArrowRightIcon,
    ChartBarIcon,
    AcademicCapIcon,
    DocumentTextIcon,
    CubeTransparentIcon,
    MapIcon,
    FlagIcon,
    KeyIcon
} from '@heroicons/react/24/outline';

// =======================================================================
//  1. KOMPONEN-KOMPONEN REUSABLE (Struktur tidak berubah)
// =======================================================================

const ActionButton = ({ href, children, className = '' }) => (
    <Link
        href={href}
        className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-base font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 ${className}`}
    >
        {children}
    </Link>
);

const FeatureCard = ({ icon, title, children, isComingSoon = false }) => (
    <div className="flex h-full transform flex-col rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5 transition-all duration-300 dark:bg-white/5 dark:ring-white/10 dark:hover:bg-white/10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            {icon}
        </div>
        <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            {isComingSoon && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">Segera Berlayar</span>}
        </div>
        <p className="mt-2 flex-grow text-gray-600 dark:text-gray-400">{children}</p>
    </div>
);

const TimelineItem = ({ data, position }) => {
    const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });
    const isLeft = position === 'left';
    const baseAnimation = 'transition-all duration-700 ease-in-out';
    const visibleState = 'opacity-100 translate-y-0';
    const hiddenState = 'opacity-0 translate-y-10';

    return (
        <div ref={ref} className={`relative mb-8 flex w-full items-center justify-between ${isLeft ? 'md:flex-row-reverse' : ''}`}>
            <div className="hidden w-5/12 md:block"></div>
            <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                {data.icon}
            </div>
            <div className={`w-full rounded-lg bg-white p-6 shadow-lg ring-1 ring-gray-900/5 dark:bg-white/5 dark:ring-white/10 md:w-5/12 ${baseAnimation} ${inView ? visibleState : hiddenState}`}>
                <p className="mb-1 text-sm font-semibold text-emerald-500 dark:text-emerald-400">{data.date}</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{data.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{data.description}</p>
            </div>
        </div>
    );
};

const FounderCard = ({ member, index }) => {
    const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

    return (
        <div
            ref={ref}
            className={`group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lg transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            <img className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" src={member.avatar} alt={member.name} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-xl font-bold text-white">{member.name}</h3>
                <p className="text-sm text-emerald-300">{member.role}</p>
                <div className="mt-4 flex space-x-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/80 transition-colors hover:text-white">
                        <FaLinkedin size={20} />
                    </a>
                    <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-white/80 transition-colors hover:text-white">
                        <FaTwitter size={20} />
                    </a>
                </div>
            </div>
        </div>
    );
};

const ParticlesBackground = () => {
    const [init, setInit] = useState(false);
    useEffect(() => {
        initParticlesEngine(async (engine) => await loadSlim(engine)).then(() => setInit(true));
    }, []);

    const particlesLoaded = useCallback(async container => {}, []);

    const options = {
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        interactivity: {
            events: { onHover: { enable: true, mode: 'repulse' } },
            modes: { repulse: { distance: 100, duration: 0.4 } },
        },
        particles: {
            color: { value: '#10b981' },
            links: { color: '#34d399', distance: 150, enable: true, opacity: 0.1, width: 1 },
            move: { direction: 'none', enable: true, outModes: { default: 'bounce' }, random: false, speed: 0.5, straight: false },
            number: { density: { enable: true, area: 800 }, value: 40 },
            opacity: { value: 0.2 },
            shape: { type: 'circle' },
            size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
    };

    if (init) return <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={options} />;
    return <></>;
};


// =======================================================================
//  2. DATA DENGAN COPYWRITING PETUALANGAN YANG DIPERKUAT
// =======================================================================

const features = [
    { icon: <KeyIcon className="h-6 w-6" />, title: 'Logbook Sang Kapten', description: 'AI kami adalah Den Den Mushi pribadimu. Ia mendengarkan, membantumu merangkai kepingan perjalanan, dan mengungkap Poneglyph di dalam hatimu.' },
    { icon: <ClockIcon className="h-6 w-6" />, title: 'Kompas Abadi Pomodoro', description: 'Lawan Sirene media sosial dan monster laut penunda waktu. Arahkan kompasmu, taklukkan badai distraksi, dan capai pulaumu tepat waktu.' },
    { icon: <DocumentTextIcon className="h-6 w-6" />, title: 'Penerjemah Poneglyph', description: 'Menemukan gulungan kuno (PDF) yang penuh rahasia? Biarkan AI kami membongkar isinya dan menyajikan sari pati pengetahuannya untukmu.' },
    { icon: <MapIcon className="h-6 w-6" />, title: 'Peta Menuju One Piece Pribadi', description: 'Setiap One Piece dimulai dari satu pulau impian. Petakan tujuanmu, dan saksikan rasi bintang petualanganmu terbentuk di angkasa.' },
    { icon: <AcademicCapIcon className="h-6 w-6" />, title: 'Ekspedisi Pulau Pengetahuan', description: 'Berlabuh di pulau-pulau ilmu baru. Selesaikan misi belajar untuk mendapatkan skill berharga dan menaikkan Bounty pribadimu!', isComingSoon: true },
    { icon: <FlagIcon className="h-6 w-6" />, title: 'Benteng Aliansi Nakama', description: 'Satu kapal tak bisa menaklukkan Grand Line. Bangun atau gabung dengan aliansi, berbagi peta rahasia, dan rayakan setiap penaklukan bersama kru-mu.' },
];

const timelineData = [
    { date: "Bab 1: Bisikan Angin", title: "Mimpi di Tengah Badai", description: "Semua berawal dari sebuah bisikan di tengah badai informasi: 'Bagaimana jika ada bahtera yang bisa membawa para pemberani menemukan 'One Piece' mereka sendiri?'", icon: <SparklesIcon className="h-4 w-4" /> },
    { date: "Bab 2: Kayu dan Harapan", title: "Membangun Bahtera Pertama", description: "Dari secarik peta usang dan kayu harapan, prototipe pertama kami lahir. Para kru awal mencoba berlayar, dan mereka kembali dengan senyuman.", icon: <CubeTransparentIcon className="h-4 w-4" /> },
    { date: "Bab 3: Layar Terkembang", title: "Melepas Sauh ke Dunia!", description: "Bendera 'Sarang Tumbuh' resmi berkibar! Kami melepas sauh, mengundangmu, para Nakama sejati, untuk bergabung dalam pelayaran terbesar seumur hidup.", icon: <RocketLaunchIcon className="h-4 w-4" /> },
];

const testimonials = [
  { quote: "Jurnal AI-nya benar-benar seperti punya Chopper pribadi! Dia mendengarkan keluh kesahku, lalu membantuku memetakan kelemahan untuk jadi lebih kuat. Sugoi!", name: 'Andi "Topi Jerami"', title: 'Calon Raja Programmer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&q=80' },
  { quote: "Kompas Pomodoro-nya lebih bisa diandalkan dari Eternal Pose! Aku bisa menavigasi deadline tanpa karam di Segitiga Bermuda Medsos. Akhirnya bisa fokus!", name: 'Nami Lestari', title: 'Navigator Proyek Digital', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80' },
  { quote: "Ini adalah 'All Blue' bagi para pemburu ilmu. Semua 'bahan' untuk meracik resep kesuksesanku ada di satu tempat. Aku menemukan hartaku di sini!", name: 'Sanji Santoso', title: 'Koki Kode & Desain', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80' },
];

const teamMembers = [
  { name: 'Muhammad Arif Rahmad Syahputra', role: 'Kapten & Nakhoda Utama', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80', linkedin: '#', twitter: '#' },
  { name: 'Muhammad Rizky Fatahilla', role: 'Navigator & Ahli Strategi', avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=500&q=80', linkedin: '#', twitter: '#' },
  { name: 'Wahyu Rohmatul Abidin', role: 'Kepala Mekanik & Juru Mesin', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286de2?w=500&q=80', linkedin: '#', twitter: '#' },
];


// =======================================================================
//  3. HALAMAN UTAMA DENGAN COPYWRITING BARU
// =======================================================================

export default function Welcome({ auth }) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMouseMove = (event) => setMousePos({ x: event.clientX, y: event.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
    const getWindowDimensions = () => (typeof window !== 'undefined' ? { width: window.innerWidth, height: window.innerHeight } : { width: 0, height: 0 });
    const { width, height } = getWindowDimensions();

    return (
        <>
            <Head title="Sarang Tumbuh - Kibarkan Benderamu!" />
            <div className="w-full bg-gray-50 text-gray-800 selection:bg-emerald-500 selection:text-white dark:bg-gray-900 dark:text-white">

                {/* --- HERO SECTION --- */}
                <div className="relative min-h-screen overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 hidden h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 opacity-50 blur-[120px] dark:block" />
                    <div className="absolute bottom-0 right-0 hidden h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-teal-500/20 opacity-50 blur-[120px] dark:block" />
                    <div className="relative z-10 flex h-full min-h-screen flex-col">
                        <header className="container mx-auto flex items-center justify-between p-6">
                            <Link href="/" className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">Sarang<span className="text-emerald-500">Tumbuh</span>.</Link>
                            <nav className="flex items-center gap-2 text-sm font-semibold sm:gap-4">
                                <Link href="#perkakas" className="hidden rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white sm:block">Perkakas</Link>
                                <Link href="#log-perjalanan" className="hidden rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white sm:block">Log Perjalanan</Link>
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white">Masuk ke Bahtera</Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white">Sudah Punya Kru?</Link>
                                        <ActionButton href={route('register')} className="hidden sm:inline-flex">Jadi Nakama</ActionButton>
                                    </>
                                )}
                            </nav>
                        </header>
                        <main className="container relative mx-auto flex flex-1 flex-col items-center justify-center p-6 text-center">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-gray-900/5 px-4 py-1 text-xs font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                                <FaCompass className="h-4 w-4 text-emerald-500" /><span>Sebuah Era Baru Petualangan Telah Dimulai</span>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl lg:text-7xl">
                                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Di Samudra Hidup,<br />Jadilah Kapten Takdirmu.</span>
                            </h1>
                            <p className="mx-auto mt-6 max-w-xl text-lg text-gray-600 dark:text-gray-400">Di tengah lautan distraksi dan kabut keraguan, Sarang Tumbuh adalah bahteramu. Tempatmu mengasah pedang fokus, membaca peta bintang, dan merebut kemudi atas hidupmu sendiri.</p>
                            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
                                <ActionButton href={auth.user ? route('dashboard') : route('register')}>
                                    <RocketLaunchIcon className="mr-2 h-5 w-5" />
                                    Mulai Pelayaranmu!
                                </ActionButton>
                            </div>
                        </main>
                    </div>
                </div>

                {/* --- FEATURES SECTION --- */}
                <div id="perkakas" className="bg-white py-20 dark:bg-gray-900/70 dark:backdrop-blur-sm sm:py-32">
                    <div className="container mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Isi Penuh Peti Perkakasmu</h2>
                            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">Setiap perkakas di kapal ini dirancang untuk membawamu menaklukkan Grand Line produktivitas.</p>
                        </div>
                        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                            {features.map((feature) => (<FeatureCard key={feature.title} icon={feature.icon} title={feature.title} isComingSoon={feature.isComingSoon}>{feature.description}</FeatureCard>))}
                        </div>
                    </div>
                </div>

                {/* --- TIMELINE (ABOUT) SECTION --- */}
                <div id="log-perjalanan" className="bg-gray-50 py-20 dark:bg-gray-900 sm:py-32">
                    <div className="container mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Logbook Perjalanan Kami<span className="block bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Kisah Lahirnya Sebuah Bahtera</span></h2>
                            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">Setiap pelayaran legendaris punya babak pertama. Inilah logbook kami.</p>
                        </div>
                        <div className="relative mx-auto mt-16 max-w-3xl">
                            <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gray-200 dark:bg-gray-700"></div>
                            {timelineData.map((item, index) => (<TimelineItem key={item.title} data={item} position={index % 2 === 0 ? 'left' : 'right'} />))}
                        </div>
                    </div>
                </div>

                {/* --- TESTIMONIALS SECTION --- */}
                <div id="testimoni" className="bg-white py-20 dark:bg-gray-900/70 dark:backdrop-blur-sm sm:py-32">
                    <div className="container mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                             <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Pesan dari Armada Nakama</h2>
                             <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">Kisah dari para petualang pemberani yang telah mengibarkan benderanya bersama kami.</p>
                        </div>
                        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                             {testimonials.map((item) => (
                                 <div key={item.name} className="flex flex-col rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5 dark:bg-white/5 dark:ring-white/10">
                                     <p className="flex-grow text-gray-600 dark:text-gray-300">"{item.quote}"</p>
                                     <div className="mt-6 flex items-center gap-4">
                                         <img className="h-12 w-12 rounded-full bg-gray-50" src={item.avatar} alt={item.name} />
                                         <div>
                                             <div className="font-semibold text-gray-900 dark:text-white">{item.name}</div>
                                             <div className="text-gray-600 dark:text-gray-400">{item.title}</div>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>

                {/* --- FOUNDER TEAM SECTION --- */}
                <div id="kru-inti" className="bg-gray-50 py-20 dark:bg-gray-900 sm:py-32">
                    <div className="container mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Para Perintis Pelayaran</h2>
                            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">Tiga sekawan yang pertama kali memberanikan diri mengarungi lautan tak dikenal ini.</p>
                        </div>
                        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 sm:grid-cols-3 lg:mx-0 lg:max-w-none">
                            {teamMembers.map((member, index) => (<FounderCard key={member.name} member={member} index={index} />))}
                        </div>
                    </div>
                </div>

                {/* --- COMMUNITY CTA SECTION --- */}
                <div id="aliansi" className="relative overflow-hidden bg-gray-900 py-24 sm:py-32">
                    <div className="absolute inset-0 z-0"><ParticlesBackground /></div>
                    <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-400">
                            <UserGroupIcon className="h-5 w-5" /><span>Armada kita terus bertambah!</span>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Petualangan Tak Lengkap Tanpa Kru.</h2>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">Lautan terganas pun terasa sunyi jika diarungi sendirian. Di sini, kita bukan sekadar pengguna; kita adalah satu Armada. Kita berbagi peta, merayakan bounty, dan menjadi saksi perjalanan satu sama lain.</p>
                        <div className="mt-10">
                            <ActionButton href="#">{/* TODO: Ganti dengan link Discord/komunitas Anda */}
                                Gabung Armada Nakama
                                <ArrowRightIcon className="ml-2 h-5 w-5" />
                            </ActionButton>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <footer className="border-t border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
                    <div className="container mx-auto flex flex-col items-center justify-between gap-6 p-8 sm:flex-row">
                        <p className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Sarang Tumbuh. Layar Terkembang, Takdir Menanti.</p>
                        <div className="flex items-center gap-x-6">
                            <a href="#" className="text-gray-400 transition hover:text-emerald-500" aria-label="Instagram"><FaInstagram size={20} /></a>
                            <a href="#" className="text-gray-400 transition hover:text-emerald-500" aria-label="Twitter"><FaTwitter size={20} /></a>
                            <a href="#" className="text-gray-400 transition hover:text-emerald-500" aria-label="YouTube"><FaYoutube size={20} /></a>
                            <a href="#" className="text-gray-400 transition hover:text-emerald-500" aria-label="TikTok"><FaTiktok size={20} /></a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}