import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    BookOpenIcon, ChevronRightIcon, MagnifyingGlassIcon,
    Bars3Icon, XMarkIcon, HomeIcon, ClockIcon, UserGroupIcon
} from '@heroicons/react/24/outline';

export default function LearnIndex({ docs }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeArticle, setActiveArticle] = useState('welcome');

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col md:flex-row">
            <Head title="Learn — Dokumentasi Sarang Tumbuh" />

            {/* MOBILE HEADER */}
            <div className="md:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50">
                <Link href="/" className="font-bold text-slate-900">Sarang Tumbuh Docs</Link>
                <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-500">
                    <Bars3Icon className="w-6 h-6" />
                </button>
            </div>

            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-[#FAFBFC] border-r border-slate-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 z-40 overflow-y-auto`}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
                            <div className="w-6 h-6 bg-emerald-500 rounded text-white flex items-center justify-center text-xs">S</div>
                            Docs
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Cari artikel..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                    </div>

                    <nav className="space-y-8">
                        {Object.entries(docs).map(([key, section]) => (
                            <div key={key}>
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 px-2">{section.title}</h3>
                                <ul className="space-y-1">
                                    {section.articles.map((article) => (
                                        <li key={article.slug}>
                                            <button
                                                onClick={() => { setActiveArticle(article.slug); setSidebarOpen(false); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeArticle === article.slug ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                                            >
                                                {article.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 md:ml-72 pt-20 md:pt-0 min-h-screen">
                <div className="max-w-3xl mx-auto px-8 py-12 md:py-20">
                    <article className="prose prose-slate prose-lg max-w-none">
                        <span className="text-emerald-600 font-bold text-sm uppercase tracking-widest">Guide</span>
                        {/* Dynamic Content Rendering Placeholder */}
                        {activeArticle === 'welcome' && (
                            <>
                                <h1>Selamat Datang di Sarang Tumbuh</h1>
                                <p className="lead">Platform produktivitas gamifikasi yang membantu Anda masuk ke dalam flow state, berkolaborasi dengan teman, dan membangun kebiasaan positif yang bertahan lama.</p>
                                <p>Sarang Tumbuh menggabungkan prinsip <strong>Deep Work</strong> dengan mekanik game yang menyenangkan. Kami percaya bahwa produktivitas seharusnya tidak menyiksa, melainkan sebuah petualangan.</p>
                                <h2>Apa yang bisa Anda lakukan di sini?</h2>
                                <ul>
                                    <li><strong>Focus Timer:</strong> Gunakan timer Pomodoro yang dapat disesuaikan untuk memecah pekerjaan besar menjadi sesi-sesi kecil yang dapat dikelola.</li>
                                    <li><strong>Guild System:</strong> Bergabung dengan Squad, selesaikan misi bersama, dan berkompetisi di leaderboard.</li>
                                    <li><strong>Smart Companion:</strong> Dapatkan dukungan moral dan pengingat cerdas dari Kiko, asisten virtual Anda.</li>
                                </ul>
                            </>
                        )}
                        {activeArticle === 'first-task' && (
                            <>
                                <h1>Membuat Tugas Pertama Anda</h1>
                                <p>Tugas di Sarang Tumbuh didesain simpel agar tidak membuat Anda kewalahan (overwhelmed).</p>
                                <ol>
                                    <li>Buka Dashboard.</li>
                                    <li>Klik tombol <strong>+ Tugas Baru</strong> di kolom "Hari Ini".</li>
                                    <li>Tulis nama tugas yang spesifik (Contoh: "Menulis Bab 1 Skripsi", bukan "Kerjain Skripsi").</li>
                                    <li>Pilih prioritas (Low, Medium, High).</li>
                                    <li>Klik Simpan.</li>
                                </ol>
                                <p>Ingat, kami membatasi Anda hanya melihat 3 tugas prioritas utama sekaligus untuk menjaga fokus.</p>
                            </>
                        )}
                        {activeArticle === 'pomodoro-technique' && (
                            <>
                                <h1>Menggunakan Teknik Pomodoro</h1>
                                <p>Teknik Pomodoro adalah metode manajemen waktu yang dikembangkan oleh Francesco Cirillo pada akhir 1980-an.</p>
                                <h2>Cara Kerja</h2>
                                <ol>
                                    <li>Pilih tugas yang ingin diselesaikan.</li>
                                    <li>Set timer selama 25 menit (Sarang Tumbuh default).</li>
                                    <li>Kerjakan tugas sampai timer berbunyi.</li>
                                    <li>Istirahat singkat (5 menit).</li>
                                    <li>Setiap 4 sesi pomodoro, ambil istirahat panjang (15-30 menit).</li>
                                </ol>
                            </>
                        )}
                        {/* Fallback for other articles */}
                        {(activeArticle !== 'welcome' && activeArticle !== 'first-task' && activeArticle !== 'pomodoro-technique') && (
                            <>
                                <h1>{activeArticle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
                                <p>Konten untuk artikel ini sedang ditulis dan akan segera tersedia. Stay tuned!</p>
                            </>
                        )}
                    </article>

                    <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between">
                        <button className="text-slate-400 hover:text-slate-900 font-bold text-sm flex items-center gap-2">
                            <span className="rotate-180"><ChevronRightIcon className="w-4 h-4" /></span>
                            Previous
                        </button>
                        <button className="text-slate-900 hover:text-emerald-600 font-bold text-sm flex items-center gap-2">
                            Next Article
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
