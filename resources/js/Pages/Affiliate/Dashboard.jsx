import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    UserPlusIcon,
    LinkIcon,
    BanknotesIcon,
    UsersIcon,
    ArrowUpRightIcon,
    ClipboardIcon,
    QrCodeIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const AffiliateDashboard = ({ user, referrals, stats }) => {
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Disalin ke clipboard!');
    };

    const affiliateLink = `${window.location.origin}/register?ref=${user.affiliate_code}`;

    const handleGenerateCode = () => {
        router.post(route('affiliate.generate-code'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-neutral-200 leading-tight">Program Affiliate</h2>}
        >
            <Head title="Affiliate Dashboard" />

            <div className="py-6 space-y-8">
                {/* Hero / CTA */}
                <div className="bg-emerald-600 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-black mb-4">Ajak Teman, <br />Tumbuh Bersama! 🌿</h1>
                        <p className="text-emerald-100 text-lg mb-8">
                            Dapatkan komisi untuk setiap teman yang berlangganan Premium melalui link unikmu. Bantu mereka lebih produktif dan dapatkan rewardnya!
                        </p>

                        {!user.affiliate_code ? (
                            <button
                                onClick={handleGenerateCode}
                                className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-xl active:scale-95"
                            >
                                Mulai Program Affiliate
                            </button>
                        ) : (
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[300px] bg-emerald-700/50 backdrop-blur-md rounded-2xl p-2 flex items-center gap-2 border border-emerald-500/30">
                                    <span className="flex-1 truncate px-4 font-mono text-emerald-200">{affiliateLink}</span>
                                    <button
                                        onClick={() => copyToClipboard(affiliateLink)}
                                        className="p-3 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all"
                                    >
                                        <ClipboardIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Total Referal', value: stats.total_referrals, icon: UsersIcon, color: 'blue' },
                        { label: 'Referal Sukses', value: stats.completed_referrals, icon: UserPlusIcon, color: 'emerald' },
                        { label: 'Total Komisi', value: `Rp ${stats.total_commission.toLocaleString()}`, icon: BanknotesIcon, color: 'orange' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className={clsx(
                                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                                stat.color === 'blue' && "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                                stat.color === 'emerald' && "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
                                stat.color === 'orange' && "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                            )}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Referrals Table / List */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Riwayat Referal</h3>
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold">
                            {referrals.length} Total
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Tanggal Gabung</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Komisi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {referrals.map((ref) => (
                                    <tr key={ref.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                                                    {ref.referred_user.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-slate-900 dark:text-white">{ref.referred_user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(ref.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                ref.status === 'completed' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                                                ref.status === 'pending' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                                ref.status === 'cancelled' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            )}>
                                                {ref.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                                            Rp {parseInt(ref.commission_amount).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {referrals.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center text-slate-500">
                                            <UserPlusIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                            Belum ada teman yang bergabung. Bagikan link kamu!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AffiliateDashboard;
