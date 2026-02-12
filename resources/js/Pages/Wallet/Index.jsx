
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { WalletIcon, CreditCardIcon, QrCodeIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export default function WalletIndex({ auth }) {
    return (
        <AuthenticatedLayout header={<h2 className="font-extrabold text-2xl text-slate-900 dark:text-white">Dompet Saya</h2>}>
            <Head title="Wallet" />
            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <WalletIcon className="w-64 h-64 rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-emerald-100 font-bold mb-2 uppercase tracking-widest">Saldo Saat Ini</p>
                        <h3 className="text-4xl sm:text-6xl font-[900] mb-8">Rp 0</h3>
                        <div className="flex gap-4">
                            <button className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-lg">
                                <BanknotesIcon className="w-5 h-5" />
                                Top Up
                            </button>
                            <button className="bg-emerald-600/30 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600/40 transition-colors flex items-center gap-2">
                                <QrCodeIcon className="w-5 h-5" />
                                Tarik Tunai
                            </button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700">
                        <h4 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Riwayat Transaksi</h4>
                        <div className="text-slate-400 text-center py-12">Belum ada transaksi.</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700">
                        <h4 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Metode Pembayaran</h4>
                        <div className="text-slate-400 text-center py-12">Belum ada metode tersimpan.</div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
