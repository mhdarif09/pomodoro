import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

import StatCard from '@/Components/StatCard';
import UserGrowthChart from '@/Components/UserGrowthChart';
import SubscriptionPlanChart from '@/Components/SubscriptionPlanChart';

import { UsersIcon, ShoppingCartIcon, BanknotesIcon } from '@heroicons/react/24/outline';


// Helper function untuk format mata uang Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number);
};

export default function Dashboard({ auth, totalUsers, payingCustomers, totalRevenue, userGrowthData, subscriptionPlanData }) {


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

            </div>
        </AdminLayout>
    );
}