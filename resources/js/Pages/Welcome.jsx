import { Link, Head } from '@inertiajs/react';
import { RocketLaunchIcon, ClockIcon, ListBulletIcon, SparklesIcon } from '@heroicons/react/24/outline';

// Komponen Tombol Aksi (Call-to-Action)
// Desainnya (gradient) sudah bagus untuk kedua mode, jadi tidak perlu banyak perubahan.
const ActionButton = ({ href, children, className = '' }) => (
    <Link
        href={href}
        className={`inline-block rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 text-base font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 ${className}`}
    >
        {children}
    </Link>
);

// Komponen Kartu Fitur, sekarang dengan style untuk dark/light mode
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
export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Selamat Datang di NamaAplikasiAnda" />

            {/* Container utama dengan background yang bisa berubah */}
            <div className="w-full bg-gray-50 text-gray-800 selection:bg-purple-500 selection:text-white dark:bg-gray-900 dark:text-white">
                <div className="relative min-h-screen overflow-hidden">
                
                    {/* Efek Glow: Dibuat HANYA untuk dark mode agar tidak mengganggu di light mode */}
                    <div className="absolute top-1/4 left-1/4 hidden h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/30 opacity-50 blur-[120px] dark:block" />
                    <div className="absolute bottom-0 right-0 hidden h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-blue-500/30 opacity-50 blur-[120px] dark:block" />

                    {/* Konten akan berada di atas glow */}
                    <div className="relative z-10 flex h-full min-h-screen flex-col">

                        {/* 1. Header & Navigasi */}
                        <header className="container mx-auto flex items-center justify-between p-6">
                            <Link href="/" className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">
                                NamaAplikasiAnda.
                            </Link>
                            <nav className="flex items-center gap-2 sm:gap-4 text-sm font-semibold">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                                        >
                                            Log In
                                        </Link>
                                        <ActionButton href={route('register')} className="hidden sm:inline-block">
                                            Daftar Gratis
                                        </ActionButton>
                                    </>
                                )}
                            </nav>
                        </header>
                        
                        {/* 2. Hero Section */}
                        <main className="container mx-auto flex flex-1 flex-col items-center justify-center p-6 text-center">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-gray-900/5 px-4 py-1 text-xs font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                                <SparklesIcon className="h-4 w-4 text-purple-500" />
                                <span>Produktivitas level baru telah tiba!</span>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tighter text-transparent sm:text-6xl lg:text-7xl">
                                <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text">
                                    Fokus Tanpa Batas,
                                </span>
                                <br />
                                Tugas Apapun Beres.
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
            <div id="fitur" className="bg-white py-20 sm:py-32 dark:bg-gray-900/70 dark:backdrop-blur-sm">
                 <div className="container mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">Semua yang Kamu Butuh, <br/> dalam Satu Aplikasi</h2>
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

            {/* 4. Footer */}
            <footer className="bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-white/10">
                <div className="container mx-auto flex flex-col items-center justify-between gap-4 p-6 text-sm text-gray-500 sm:flex-row dark:text-gray-400">
                    <p>© {new Date().getFullYear()} Koderia. All rights reserved.</p>
                    <p className="text-right">Community Sarang Tumbuh</p>
                </div>
            </footer>
        </>
    );
}