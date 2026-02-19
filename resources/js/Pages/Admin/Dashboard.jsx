import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Switch } from '@headlessui/react';

import StatCard from '@/Components/StatCard';
import UserGrowthChart from '@/Components/UserGrowthChart';
import SubscriptionPlanChart from '@/Components/SubscriptionPlanChart';

import { UsersIcon, ShoppingCartIcon, BanknotesIcon, Cog6ToothIcon, GlobeAltIcon } from '@heroicons/react/24/outline';


// Helper function untuk format mata uang Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number);
};

export default function Dashboard({ auth, totalUsers, payingCustomers, totalRevenue, userGrowthData, subscriptionPlanData, settings }) {

    const isGoogleCalendarEnabled = settings.google_calendar_enabled === 'true';

    const toggleGoogleCalendar = (enabled) => {
        router.post(route('admin.settings.update'), {
            key: 'google_calendar_enabled',
            value: enabled ? 'true' : 'false',
            type: 'boolean'
        }, {
            preserveScroll: true
        });
    };


    const statCards = [
        {
            title: "Total Pengguna",
            value: totalUsers.toLocaleString('id-ID'),
            icon: UsersIcon,
            color: "bg-blue-500",
        },
        {
            title: "Pelanggan Berbayar",
            value: payingCustomers.toLocaleString('id-ID'),
            icon: ShoppingCartIcon,
            color: "bg-green-500",
        },
        {
            title: "Total Pendapatan",
            value: formatRupiah(totalRevenue), // Gunakan helper untuk format Rupiah
            icon: BanknotesIcon,
            color: "bg-amber-500",
        },
    ];

    return (
        <AdminLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>}>
            <Head title="Admin Dashboard" />

            <div>
                {/* Header halaman */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Analisis Bisnis</h2>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Selamat datang kembali, {auth.user.name}!</p>
                </div>

                {/* Grid untuk Stat Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                    {statCards.map((card, index) => (
                        <StatCard
                            key={index}
                            title={card.title}
                            value={card.value}
                            icon={card.icon}
                            color={card.color}
                        />
                    ))}
                </div>

                {/* Grid untuk Grafik */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Grafik Pertumbuhan User mengambil porsi lebih besar */}
                    <div className="lg:col-span-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-[2.5rem] border border-white/20 dark:border-white/5">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Pertumbuhan Pengguna</h3>
                        <UserGrowthChart data={userGrowthData} />
                    </div>

                    {/* Grafik Distribusi Paket mengambil porsi lebih kecil */}
                    <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-[2.5rem] border border-white/20 dark:border-white/5">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Distribusi Paket</h3>
                        <SubscriptionPlanChart data={subscriptionPlanData} />
                    </div>
                </div>

                {/* --- NEW: SYSTEM CONTROL SECTION --- */}
                <div className="mt-8">
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-[2.5rem] border border-white/20 dark:border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500 rounded-xl text-white">
                                <Cog6ToothIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">System Control</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Google Calendar Toggle */}
                            <div className="flex items-center justify-between p-6 rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-white dark:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
                                        <GlobeAltIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Google Calendar Integration</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Aktifkan sinkronisasi tugas ke Google Calendar.</p>
                                    </div>
                                </div>

                                <Switch
                                    checked={isGoogleCalendarEnabled}
                                    onChange={toggleGoogleCalendar}
                                    className={`${isGoogleCalendarEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
                                >
                                    <span className="sr-only">Toggle Google Calendar</span>
                                    <span
                                        className={`${isGoogleCalendarEnabled ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>
                            </div>

                            {/* Additional settings can be added here */}
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}