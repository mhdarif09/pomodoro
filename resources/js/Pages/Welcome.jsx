import { useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import {
    RocketLaunchIcon,
    ClockIcon,
    ListBulletIcon,
    SparklesIcon,
    UserGroupIcon,
    HeartIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';

// Komponen Tombol Aksi (Call-to-Action)
const ActionButton = ({ href, children, className = '' }) => (
    <Link
        href={href}
        className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 text-base font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 ${className}`}
    >
        {children}
    </Link>
);

// Komponen Kartu Fitur
const FeatureCard = ({ icon, title, children }) => (
    <div className="transform rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5 transition-all duration-300 dark:bg-white/5 dark:ring-white/10 dark:hover:bg-white/10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{children}</p>
    </div>
);

// Halaman utama
export default function Welcome({ auth }) {
    // Logic for mouse-tracking parallax effect
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event) => {
            setMousePos({ x: event.clientX, y: event.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Helper function to safely access window dimensions for SSR compatibility
    const getWindowDimensions = () => {
        if (typeof window !== 'undefined') {
            return { width: window.innerWidth, height: window.innerHeight };
        }
        return { width: 0, height: 0 };
    };

    const { width, height } = getWindowDimensions();

    return (
        <>
            <Head title="Selamat Datang di Koderia" />

            <div className="w-full bg-gray-50 text-gray-800 selection:bg-purple-500 selection:text-white dark:bg-gray-900 dark:text-white">
                <div className="relative min-h-screen overflow-hidden">
                    {/* Efek Glow */}
                    <div className="absolute top-1/4 left-1/4 hidden h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/30 opacity-50 blur-[120px] dark:block" />
                    <div className="absolute bottom-0 right-0 hidden h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-blue-500/30 opacity-50 blur-[120px] dark:block" />

                    <div className="relative z-10 flex h-full min-h-screen flex-col">
                        {/* 1. Header & Navigasi */}
                        <header className="container mx-auto flex items-center justify-between p-6">
                            <Link href="/" className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">
                                Koderia.
                            </Link>
                            <nav className="flex items-center gap-2 text-sm font-semibold sm:gap-4">
                                <Link
                                    href="#komunitas"
                                    className="hidden rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white sm:block"
                                >
                                    Komunitas
                                </Link>
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white">
                                            Log In
                                        </Link>
                                        <ActionButton href={route('register')} className="hidden sm:inline-flex">
                                            Daftar Gratis
                                        </ActionButton>
                                    </>
                                )}
                            </nav>
                        </header>
                        
                        {/* 2. Hero Section */}
                        <main className="container relative mx-auto flex flex-1 flex-col items-center justify-center p-6 text-center">
                            {/* Animated Floating & Parallax Icons */}
                            <div aria-hidden="true" className="absolute inset-0 z-[-1] hidden md:block">
                                <div className="absolute top-[10%] left-[15%] animate-float transition-transform duration-300 ease-out [animation-duration:8s]" style={{ transform: `translate(${(mousePos.x - width / 2) / -25}px, ${(mousePos.y - height / 2) / -25}px)` }}>
                                    <RocketLaunchIcon className="h-24 w-24 text-gray-900/5 dark:text-white/5" />
                                </div>
                                <div className="absolute bottom-[15%] right-[10%] animate-float transition-transform duration-300 ease-out [animation-delay:-2s]" style={{ transform: `translate(${(mousePos.x - width / 2) / 35}px, ${(mousePos.y - height / 2) / 35}px)` }}>
                                    <ClockIcon className="h-28 w-28 text-gray-900/5 dark:text-white/5" />
                                </div>
                                <div className="absolute bottom-[40%] left-[20%] animate-float transition-transform duration-300 ease-out [animation-delay:-4s] [animation-duration:10s]" style={{ transform: `translate(${(mousePos.x - width / 2) / -50}px, ${(mousePos.y - height / 2) / -50}px)` }}>
                                    <ListBulletIcon className="h-16 w-16 text-gray-900/5 dark:text-white/5" />
                                </div>
                            </div>

                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-gray-900/5 px-4 py-1 text-xs font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                                <SparklesIcon className="h-4 w-4 text-purple-500" />
                                <span>Produktivitas level baru telah tiba!</span>
                            </div>

                            <h1 className="text-4xl font-extrabold tracking-tighter text-transparent sm:text-6xl lg:text-7xl">
                                <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text">
                                    Fokus Tanpa Batas,
                                    <br />
                                    Tugas Apapun Beres.
                                </span>
                            </h1>

                            <p className="mx-auto mt-6 max-w-xl text-lg text-gray-600 dark:text-gray-400">
                                Gabungkan teknik Pomodoro yang terbukti ampuh dengan to-do list canggih. Raih semua targetmu tanpa stres. ✨
                            </p>
                            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
                                <ActionButton href={auth.user ? route('dashboard') : route('register')}>
                                    <RocketLaunchIcon className="mr-2 h-5 w-5" />
                                    Mulai Sekarang, Gratis!
                                </ActionButton>
                                <Link href="#fitur" className="rounded-lg px-6 py-3 font-semibold text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                                    Lihat Fitur
                                </Link>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
            
            {/* 3. Section Fitur Unggulan */}
            <div id="fitur" className="bg-white py-20 dark:bg-gray-900/70 dark:backdrop-blur-sm sm:py-32">
                <div className="container mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Semua yang Kamu Butuh, <br/> dalam Satu Aplikasi</h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
                           Dirancang minimalis tapi super powerfull untuk menjaga fokusmu.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        <FeatureCard icon={<ClockIcon className="h-6 w-6" />} title="Timer Cerdas">
                            Timer Pomodoro yang bisa di-custom, lengkap dengan notifikasi pengingat untuk istirahat. Jaga energimu tetap optimal.
                        </FeatureCard>
                        <FeatureCard icon={<ListBulletIcon className="h-6 w-6" />} title="To-Do List Terintegrasi">
                            Atur semua tugasmu di satu tempat. Hubungkan langsung tugas ke sesi Pomodoro untuk pelacakan yang akurat.
                        </FeatureCard>
                        <FeatureCard icon={<SparklesIcon className="h-6 w-6" />} title="Laporan Produktivitas">
                            Lihat progresmu dengan laporan harian & mingguan. Cari tahu kapan waktu paling produktifmu dan tingkatkan terus.
                        </FeatureCard>
                    </div>
                </div>
            </div>

            {/* 4. About Section */}
            <div id="tentang" className="bg-gray-50 py-20 dark:bg-gray-900 sm:py-32">
                <div className="container mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-y-16 gap-x-8 lg:grid-cols-2">
                        <div className="text-left">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                Dibuat dari Kebutuhan,
                                <span className="block bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                                     Tumbuh Bersama Kalian.
                                </span>
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                                Koderia lahir dari keresahan pribadi: terlalu banyak distraksi, terlalu sedikit waktu. Kami bukan korporasi besar, kami adalah kreator dan pengguna seperti kamu yang percaya bahwa teknologi seharusnya membantu kita fokus, bukan sebaliknya.
                            </p>
                            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
                                Misi kami simpel: memberikan alat yang minimalis dan efektif agar kamu bisa menyelesaikan apa yang penting.
                            </p>
                        </div>
                        <div className="flex h-80 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-100 to-blue-200 p-8 dark:from-purple-900/50 dark:to-blue-900/50">
                            <HeartIcon className="h-32 w-32 text-white opacity-80 shadow-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Community Section */}
            <div id="komunitas" className="bg-white py-20 dark:bg-gray-900/70 dark:backdrop-blur-sm sm:py-32">
                <div className="container mx-auto max-w-4xl px-6 text-center lg:px-8">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                            <UserGroupIcon className="h-9 w-9" />
                        </div>
                    </div>
                    <p className="font-semibold text-purple-600 dark:text-purple-400">Sarang Tumbuh</p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Kamu Gak Sendirian.
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
                        Ini bukan sekadar aplikasi, ini adalah gerakan. 'Sarang Tumbuh' adalah tempat kita saling support, berbagi tips produktif, dan tumbuh bareng. No gatekeeping, just good vibes.
                    </p>
                    <div className="mt-8">
                        <ActionButton href="#"> {/* TODO: Add Discord/Community Link */}
                            Join the Community
                            <ArrowRightIcon className="ml-2 h-5 w-5" />
                        </ActionButton>
                    </div>
                </div>
            </div>

            {/* 6. Footer */}
            <footer className="border-t border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
                <div className="container mx-auto flex flex-col items-center justify-between gap-4 p-6 text-sm text-gray-500 sm:flex-row dark:text-gray-400">
                    <p>© {new Date().getFullYear()} Koderia. All rights reserved.</p>
                    <p className="text-right">A Community by Sarang Tumbuh</p>
                </div>
            </footer>
        </>
    );
}