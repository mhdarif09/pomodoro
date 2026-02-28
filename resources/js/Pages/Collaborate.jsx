import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    EnvelopeIcon,
    BuildingOfficeIcon,
    UserIcon,
    ChatBubbleBottomCenterTextIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export default function Collaborate() {
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        name: '',
        email: '',
        company: '',
        type: 'demo',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('collaborate.store'), {
            onSuccess: () => reset(),
            preserveScroll: true
        });
    };

    return (
        <div className="min-h-screen bg-[#FAFBFC] text-slate-900 antialiased overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <Head title="Berpartner dengan Kami — Sarang Tumbuh" />

            {/* ═════════ NAV ═════════ */}
            <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 left-0 right-0 z-50">
                <div className="mx-4 mt-3">
                    <nav className="container mx-auto px-6 py-3 flex items-center justify-between rounded-2xl bg-white/80 backdrop-blur-2xl border border-slate-200/50 shadow-sm shadow-slate-200/50">
                        <Link href="/" className="text-lg font-[800] text-slate-900 tracking-tight flex items-center gap-2">
                            <span className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/25">S</span>
                            Sarang Tumbuh
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/" className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">Beranda</Link>
                            <Link href="/register"
                                className="px-5 py-2 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md">
                                Coba Gratis
                            </Link>
                        </div>
                    </nav>
                </div>
            </motion.header>

            <main className="relative z-10 pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-start">

                        {/* LEFT COLUMN: Content */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                        >
                            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Open for Partnership
                            </motion.div>

                            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-[900] tracking-[-0.04em] mb-6 leading-[1.1] text-slate-900">
                                Mari Bertumbuh <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-500">Bersama-sama.</span>
                            </motion.h1>

                            <motion.p variants={fadeUp} className="text-lg text-slate-500 mb-8 leading-relaxed">
                                Apakah Anda tertarik untuk demo produk kami untuk tim Anda, atau ingin menjajaki peluang kolaborasi strategis? Kami siap mendengar ide-ide hebat Anda.
                            </motion.p>

                            <motion.div variants={fadeUp} className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-emerald-500">
                                        <BuildingOfficeIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Company Demo</h3>
                                        <p className="text-sm text-slate-500">Lihat bagaimana Sarang Tumbuh dapat meningkatkan produktivitas tim Anda secara drastis.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-500">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Collaboration</h3>
                                        <p className="text-sm text-slate-500">Media partner, integrasi API, atau kampanye bersama. Langit adalah batasnya.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* RIGHT COLUMN: Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
                        >
                            {/* Decorative gradient */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50/50 to-emerald-50/50 rounded-full -mr-16 -mt-16 pointer-events-none" />

                            {wasSuccessful && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-8 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                        <PaperAirplaneIcon className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">Pesan Terkirim!</div>
                                        <div className="text-xs">Tim kami akan segera menghubungi Anda.</div>
                                    </div>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                        placeholder="John Doe"
                                    />
                                    {errors.name && <div className="text-xs text-red-500 mt-1 font-medium">{errors.name}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Bisnis</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                        placeholder="john@company.com"
                                    />
                                    {errors.email && <div className="text-xs text-red-500 mt-1 font-medium">{errors.email}</div>}
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Perusahaan/Org</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={data.company}
                                                onChange={e => setData('company', e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none pl-10"
                                                placeholder="Sarang Tumbuh"
                                            />
                                            <BuildingOfficeIcon className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                                        </div>
                                        {errors.company && <div className="text-xs text-red-500 mt-1 font-medium">{errors.company}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Permintaan</label>
                                        <select
                                            value={data.type}
                                            onChange={e => setData('type', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none appearance-none"
                                        >
                                            <option value="demo">Request Demo</option>
                                            <option value="collaboration">Kolaborasi</option>
                                            <option value="other">Lainnya</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Pesan Anda</label>
                                    <textarea
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none resize-none"
                                        placeholder="Ceritakan sedikit tentang kebutuhan Anda..."
                                    ></textarea>
                                    {errors.message && <div className="text-xs text-red-500 mt-1 font-medium">{errors.message}</div>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processing ? 'Mengirim...' : (
                                        <>
                                            Kirim Permintaan <PaperAirplaneIcon className="w-4 h-4 -rotate-45 mb-1" />
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-slate-400 text-center px-4">
                                    Dengan mengirimkan formulir ini, Anda menyetujui Kebijakan Privasi kami. Kami tidak akan membagikan data Anda.
                                </p>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* ═════════ FOOTER ═════════ */}
            <footer className="py-8 border-t border-slate-100 bg-white/50">
                <div className="container mx-auto px-6 text-center text-slate-300 text-[11px]">
                    &copy; {new Date().getFullYear()} Sarang Tumbuh. Hak cipta dilindungi.
                </div>
            </footer>
        </div>
    );
}
