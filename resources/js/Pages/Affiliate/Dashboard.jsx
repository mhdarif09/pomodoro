
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { UserGroupIcon, CurrencyDollarIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function AffiliateDashboard({ auth, code, stats }) {
    const { post, processing } = useForm();
    const [copied, setCopied] = useState(false);

    const generateCode = () => {
        post(route('affiliate.generate-code'));
    };

    const copyCode = () => {
        if (code) {
            navigator.clipboard.writeText(`https://pomodoro.app?ref=${code}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-extrabold text-2xl text-slate-900 dark:text-white">Affiliate Program</h2>}>
            <Head title="Affiliate" />
            <div className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-5">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <CurrencyDollarIcon className="w-64 h-64 -rotate-12" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h3 className="text-3xl sm:text-4xl font-[900] mb-4">Ajak Teman, Dapat Cuan! 💸</h3>
                        <p className="text-blue-100 text-lg mb-8">Dapatkan komisi setiap kali temanmu berlangganan Premium menggunakan kode unikmu.</p>

                        {code ? (
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md">
                                <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-2">Kode Referral Kamu</p>
                                <div className="flex items-center gap-3">
                                    <code className="text-2xl font-black bg-white/20 px-4 py-2 rounded-lg tracking-widest">{code}</code>
                                    <button onClick={copyCode} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Copy Link">
                                        {copied ? <span className="font-bold text-green-400">Copied!</span> : <ClipboardDocumentIcon className="w-6 h-6" />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={generateCode}
                                disabled={processing}
                                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-black text-lg shadow-xl hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {processing ? 'Membuat...' : 'Buat Kode Referral Sekarang'}
                            </button>
                        )}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <UserGroupIcon className="w-8 h-8 text-blue-500 mb-4" />
                        <h4 className="font-bold text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">Total Referral</h4>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats?.referrals || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <CurrencyDollarIcon className="w-8 h-8 text-green-500 mb-4" />
                        <h4 className="font-bold text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">Pendapatan</h4>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">Rp {stats?.earnings || 0}</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
