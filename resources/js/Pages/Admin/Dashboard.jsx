import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// Import komponen yang baru dibuat
import StatCard from '@/Components/StatCard';
import UserGrowthChart from '@/Components/UserGrowthChart';
import SubscriptionPlanChart from '@/Components/SubscriptionPlanChart';

// Import icons untuk StatCard (contoh menggunakan SVG sederhana)
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" />
    </svg>
);
const SubscriptionIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);
const RevenueIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
    </svg>
);


// Terima props baru dari controller
export default function Dashboard({ auth, totalUsers, activeSubscriptions, userGrowthData, subscriptionPlanData }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="px-4 sm:px-0 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
                        <p className="mt-2 text-gray-600">Selamat datang kembali, Admin {auth.user.name}!</p>
                    </div>

                    {/* Stat Cards Grid - Responsive */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                        <StatCard title="Total Pengguna" value={totalUsers} icon={<UserIcon />} />
                        <StatCard title="Pelanggan Aktif" value={activeSubscriptions} icon={<SubscriptionIcon />} />
                        {/* Contoh kartu statis */}
                        <StatCard title="Total Pendapatan (Contoh)" value="Rp 12.5M" icon={<RevenueIcon />} />
                    </div>
                    
                    {/* Charts Grid - Responsive */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                           <UserGrowthChart data={userGrowthData} />
                        </div>
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                           <SubscriptionPlanChart data={subscriptionPlanData} />
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}