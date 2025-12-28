import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
// Impor ikon dari Heroicons
import { ClockIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

// Komponen untuk Badge Status yang lebih modern dan mendukung Dark/Light mode
const StatusBadge = ({ status }) => {
    // Konfigurasi style untuk setiap status (Apple Style)
    const statusConfig = {
        paid: {
            label: 'Berhasil',
            className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        pending: {
            label: 'Menunggu',
            className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        failed: {
            label: 'Gagal',
            className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        },
        cancel: {
            label: 'Dibatalkan',
            className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
        }
    };

    const config = statusConfig[status] || { label: status, className: 'bg-slate-500/10 text-slate-600' };

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-tight ${config.className}`}>
            {config.label}
        </span>
    );
};

// Komponen utama
export default function History({ auth, subscriptions }) {
    const formatDate = (dateString) => {
        if (!dateString) return <span className="text-gray-500">-</span>;
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Tampilan jika tidak ada data, kini dengan ikon
    const EmptyState = () => (
        <div className="text-center py-24 apple-glass rounded-[3rem] border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center w-24 h-24 mx-auto mb-8 rounded-[2rem] apple-glass border-none shadow-2xl"
            >
                <ClipboardDocumentListIcon className="w-12 h-12 text-blue-500" />
            </motion.div>
            <h3 className="text-3xl font-[900] text-slate-900 dark:text-white mb-4 tracking-tight">Belum Ada Transaksi</h3>
            <p className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-0 max-w-md mx-auto leading-relaxed tracking-tight">
                Riwayat langganan Anda akan muncul di sini segera setelah Anda melakukan transaksi.
            </p>
        </div>
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Riwayat Transaksi" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-[900] text-slate-900 dark:text-white tracking-tight leading-none">Riwayat Transaksi</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-3 font-semibold text-lg tracking-tight">Daftar histori aktivasi fitur dan langganan paket.</p>
                    </div>
                    <div className="flex items-center gap-3 apple-glass px-5 py-3 rounded-2xl border-white/10 shadow-lg">
                        <ClockIcon className="w-6 h-6 text-blue-500 stroke-2" />
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Last Update 24h</span>
                    </div>
                </header>

                {subscriptions.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div>
                        {/* Tampilan Kartu untuk Mobile */}
                        <div className="md:hidden space-y-6">
                            {subscriptions.map((sub, idx) => (
                                <motion.div
                                    key={sub.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="apple-glass rounded-3xl p-6 shadow-xl border-white/10"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="font-extrabold text-xl capitalize text-slate-900 dark:text-white tracking-tight">{sub.plan}</span>
                                        <StatusBadge status={sub.status} />
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Kedaluwarsa', value: formatDate(sub.expired_at) },
                                            { label: 'Dibayar Pada', value: formatDate(sub.paid_at) },
                                            { label: 'Metode', value: sub.payment_type ?? '-' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm font-bold tracking-tight">
                                                <span className="text-slate-400 uppercase text-[10px] tracking-widest">{item.label}</span>
                                                <span className="text-slate-700 dark:text-slate-300">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Tampilan Tabel untuk Desktop */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hidden md:block overflow-hidden apple-glass rounded-[3rem] shadow-2xl border-white/5"
                        >
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-slate-200/30 dark:border-slate-800/50">
                                        <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Paket</th>
                                        <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Kedaluwarsa</th>
                                        <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Dibayar Pada</th>
                                        <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Pembayaran</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/50">
                                    {subscriptions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors duration-300">
                                            <td className="px-10 py-6 text-[15px] font-extrabold text-slate-900 dark:text-white capitalize tracking-tight">{sub.plan}</td>
                                            <td className="px-10 py-6"><StatusBadge status={sub.status} /></td>
                                            <td className="px-10 py-6 text-[14px] font-bold text-slate-500 dark:text-slate-400 tracking-tight">{formatDate(sub.expired_at)}</td>
                                            <td className="px-10 py-6 text-[14px] font-bold text-slate-500 dark:text-slate-400 tracking-tight">{formatDate(sub.paid_at)}</td>
                                            <td className="px-10 py-6 text-[14px] font-bold text-slate-500 dark:text-slate-400 tracking-tight">{sub.payment_type ?? '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
        </AuthenticatedLayout >
    );
}