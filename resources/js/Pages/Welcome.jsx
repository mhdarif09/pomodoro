import { useState, useEffect, useCallback } from 'react';
import { Link, Head } from '@inertiajs/react';
import { useInView } from 'react-intersection-observer';
import { FaInstagram, FaSpotify, FaYoutube, FaTiktok, FaLinkedin, FaTwitter } from 'react-icons/fa';
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
} from '@heroicons/react/24/outline';

// =======================================================================
//  1. KOMPONEN-KOMPONEN REUSABLE
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
            {isComingSoon && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">Segera</span>}
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
            className={`group relative aspect-square overflow-hidden rounded-2xl shadow-lg transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            <img className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" src={member.avatar} alt={member.name} />
            <div className="absolute inset-x-0 bottom-0 translate-y-full transform bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 transition-all duration-500 ease-in-out group-hover:translate-y-0 group-hover:opacity-100">
                <h3 className="text-xl font-bold text-white">{member.name}</h3>
                <p className="text-sm text-emerald-300">{member.role}</p>
                <div className="mt-4 flex space-x-4">
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
            events: { onHover: { enable: true, mode: 'grab' } },
            modes: { grab: { distance: 140, links: { opacity: 0.5 } } },
        },
        particles: {
            color: { value: '#10b981' }, // emerald-500
            links: { color: '#34d399', distance: 150, enable: true, opacity: 0.1, width: 1 }, // emerald-400
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
//  2. DATA UNTUK SETIAP SECTION
// =======================================================================

const features = [
    { icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />, title: 'Refleksi Terpandu AI', description: 'Chat refleksi yang dipersonalisasi untuk membantumu memahami diri dan progresmu setiap hari.' },
    { icon: <ClockIcon className="h-6 w-6" />, title: 'Pomodoro & Site Blocker', description: 'Tingkatkan fokus dengan sesi Pomodoro yang terintegrasi dengan pemblokir situs pengganggu.' },
    { icon: <DocumentTextIcon className="h-6 w-6" />, title: 'ChatAI & ChatPDF', description: 'Tanyakan apa saja ke AI atau dapatkan ringkasan dari dokumen PDF-mu dalam sekejap.' },
    { icon: <ChartBarIcon className="h-6 w-6" />, title: 'Goal & Progress Tracker', description: 'Atur tujuan harian dan lacak kemajuan belajarmu secara visual dan terukur.' },
    { icon: <AcademicCapIcon className="h-6 w-6" />, title: 'Modul & Misi Belajar', description: 'Tingkatkan skill dengan mini modul (teks, webinar, podcast) dan selesaikan misi belajar yang seru.', isComingSoon: true },
    { icon: <UserGroupIcon className="h-6 w-6" />, title: 'Komunitas Suportif', description: 'Bergabung dengan sesama pembelajar, berbagi insight, dan tumbuh bersama di dalam sarang yang positif.' },
];

const timelineData = [
    { date: "Q1 2023", title: "Lahirnya Ide", description: "Lahir dari keresahan pribadi: terlalu banyak distraksi, terlalu sedikit waktu untuk refleksi. Ide 'Sarang Tumbuh' mulai terbentuk.", icon: <SparklesIcon className="h-4 w-4" /> },
    { date: "Q3 2023", title: "Prototipe & Validasi", description: "Membangun prototipe pertama, fokus pada fitur inti: refleksi AI dan Pomodoro. Mendapat feedback positif dari pengguna awal.", icon: <CubeTransparentIcon className="h-4 w-4" /> },
    { date: "Q1 2024", title: "Peluncuran Publik!", description: "Sarang Tumbuh resmi diluncurkan! Membuka pintu bagi semua orang yang ingin fokus, berefleksi, dan bertumbuh setiap hari.", icon: <RocketLaunchIcon className="h-4 w-4" /> },
];

const testimonials = [
  { quote: "Sarang Tumbuh benar-benar mengubah cara saya belajar. Refleksi harian dengan AI membuat saya tetap di jalur. Game changer!", name: 'Andi Pratama', title: 'Mahasiswa Teknik Informatika', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&q=80' },
  { quote: "Sebagai pekerja remote, Pomodoro dengan site blocker sangat membantu saya menjaga fokus dan tetap termotivasi. Highly recommended!", name: 'Citra Lestari', title: 'Software Engineer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80' },
  { quote: "Awalnya saya ragu, tapi setelah seminggu pakai, saya bisa melihat progres belajar saya dengan sangat jelas. Akhirnya ada platform yang mengerti saya.", name: 'Budi Santoso', title: 'Freelance Designer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80' },
];

const teamMembers = [
  { name: 'Muhammad Arif Rahmad Syahputra', role: 'Chief Executive Officer', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80', linkedin: '#', twitter: '#' },
  { name: 'Muhammad Rizky Fatahilla', role: 'Chief Finance Officer', avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=500&q=80', linkedin: '#', twitter: '#' },
  { name: 'Wahyu Rohmatul Abidin', role: 'Chief Technology Officer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286de2?w=500&q=80', linkedin: '#', twitter: '#' },
];

// =======================================================================
//  3. HALAMAN UTAMA (KOMPONEN EKSPOR)
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
            <Head title="Sarang Tumbuh - Fokus, Refleksi, Bertumbuh" />
            <div className="w-full bg-gray-50 text-gray-800 selection:bg-emerald-500 selection:text-white dark:bg-gray-900 dark:text-white">

                {/* --- HERO SECTION --- */}
                <div className="relative min-h-screen overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 hidden h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/30 opacity-50 blur-[120px] dark:block" />
                    <div className="absolute bottom-0 right-0 hidden h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-teal-500/30 opacity-50 blur-[120px] dark:block" />
                    <div className="relative z-10 flex h-full min-h-screen flex-col">
                        <header className="container mx-auto flex items-center justify-between p-6">
                            <Link href="/" className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">Sarang<span className="text-emerald-500">Tumbuh</span>.</Link>
                            <nav className="flex items-center gap-2 text-sm font-semibold sm:gap-4">
                                <Link href="#fitur" className="hidden rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white sm:block">Fitur</Link>
                                <Link href="#perjalanan" className="hidden rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white sm:block">Perjalanan</Link>
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white">Dashboard</Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white">Log In</Link>
                                        <ActionButton href={route('register')} className="hidden sm:inline-flex">Daftar Gratis</ActionButton>
                                    </>
                                )}
                            </nav>
                        </header>
                        <main className="container relative mx-auto flex flex-1 flex-col items-center justify-center p-6 text-center">
                            <div aria-hidden="true" className="absolute inset-0 z-[-1] hidden md:block">
                                <div className="absolute top-[10%] left-[15%] animate-float [animation-duration:8s]" style={{ transform: `translate(${(mousePos.x - width / 2) / -25}px, ${(mousePos.y - height / 2) / -25}px)` }}><ChatBubbleLeftRightIcon className="h-24 w-24 text-gray-900/5 dark:text-white/5" /></div>
                                <div className="absolute bottom-[15%] right-[10%] animate-float [animation-delay:-2s]" style={{ transform: `translate(${(mousePos.x - width / 2) / 35}px, ${(mousePos.y - height / 2) / 35}px)` }}><ChartBarIcon className="h-28 w-28 text-gray-900/5 dark:text-white/5" /></div>
                            </div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-gray-900/5 px-4 py-1 text-xs font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                                <SparklesIcon className="h-4 w-4 text-emerald-500" /><span>Platform All-in-One untuk Pertumbuhan Diri</span>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl lg:text-7xl">
                                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Fokus. Refleksi.<br />Bertumbuh Setiap Hari.</span>
                            </h1>
                            <p className="mx-auto mt-6 max-w-xl text-lg text-gray-600 dark:text-gray-400">Sarang Tumbuh adalah ruang digital Anda untuk meningkatkan produktivitas dan kesadaran diri. Semua tools yang Anda butuhkan, dalam satu platform.</p>
                            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row"><ActionButton href={auth.user ? route('dashboard') : route('register')}><RocketLaunchIcon className="mr-2 h-5 w-5" />Mulai Perjalananmu</ActionButton></div>
                        </main>
                    </div>
                </div>

                {/* --- FEATURES SECTION --- */}
                <div id="fitur" className="bg-white py-20 dark:bg-gray-900/70 dark:backdrop-blur-sm sm:py-32">
                    <div className="container mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Satu Sarang, Beragam Alat Pertumbuhan</h2>
                            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">Dirancang minimalis tapi super powerfull untuk mendukung perjalananmu.</p>
                        </div>
                        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                            {features.map((feature) => (<FeatureCard key={feature.title} icon={feature.icon} title={feature.title} isComingSoon={feature.isComingSoon}>{feature.description}</FeatureCard>))}
                        </div>
                    </div>
                </div>

                {/* --- TIMELINE (ABOUT) SECTION --- */}
                <div id="perjalanan" className="bg-gray-50 py-20 dark:bg-gray-900 sm:py-32">
                    <div className="container mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Perjalanan Kami<span className="block bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Membangun Sarang Tumbuh</span></h2>
                            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">Sebuah cerita singkat tentang bagaimana sebuah ide menjadi sebuah gerakan.</p>
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
                             <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Apa Kata Mereka?</h2>
                             <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">Kisah nyata dari para pengguna yang sedang bertumbuh bersama kami.</p>
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
                <div id="tim" className="bg-gray-50 py-20 dark:bg-gray-900 sm:py-32">
                    <div className="container mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Tim di Balik Layar</h2>
                            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">Orang-orang yang bersemangat membantu Anda berkembang.</p>
                        </div>
                        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 sm:grid-cols-3 lg:mx-0 lg:max-w-none">
                            {teamMembers.map((member, index) => (<FounderCard key={member.name} member={member} index={index} />))}
                        </div>
                    </div>
                </div>

                {/* --- COMMUNITY CTA SECTION --- */}
                <div id="komunitas" className="relative overflow-hidden bg-gray-900 py-24 sm:py-32">
                    <div className="absolute inset-0 z-0"><ParticlesBackground /></div>
                    <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-400">
                            <UserGroupIcon className="h-5 w-5" /><span>Telah bergabung 1,000+ member</span>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Kamu Nggak Sendirian.</h2>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">Bergabunglah dengan komunitas 'Sarang Tumbuh'. Ini bukan sekadar aplikasi, ini adalah gerakan untuk tumbuh bareng. No gatekeeping, just good vibes.</p>
                        <div className="mt-10"><ActionButton href="#">{/* TODO: Ganti dengan link Discord/komunitas Anda */}Join Komunitas Sarang Tumbuh<ArrowRightIcon className="ml-2 h-5 w-5" /></ActionButton></div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <footer className="border-t border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
                    <div className="container mx-auto flex flex-col items-center justify-between gap-6 p-8 sm:flex-row">
                        <p className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Sarang Tumbuh. All rights reserved.</p>
                        <div className="flex items-center gap-x-6">
                            <a href="#" className="text-gray-400 transition hover:text-emerald-500" aria-label="Instagram"><FaInstagram size={20} /></a>
                            <a href="#" className="text-gray-400 transition hover:text-emerald-500" aria-label="Spotify"><FaSpotify size={20} /></a>
                            <a href="#" className="text-gray-400 transition hover:text-emerald-500" aria-label="YouTube"><FaYoutube size={20} /></a>
                            <a href="#" className="text-gray-400 transition hover:text-emerald-500" aria-label="TikTok"><FaTiktok size={20} /></a>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}