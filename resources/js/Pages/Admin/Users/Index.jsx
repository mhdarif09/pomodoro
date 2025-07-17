import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import { Dialog } from '@headlessui/react';
import { 
    CheckCircleIcon, 
    ExclamationTriangleIcon, 
    UserPlusIcon, 
    MagnifyingGlassIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    NoSymbolIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';

// --- Sub-Komponen untuk Tampilan yang Bersih ---

const UserAvatar = ({ name }) => (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
        {name ? name.charAt(0).toUpperCase() : '?'}
    </div>
);

const StatusBadge = ({ isPremium, isBanned }) => {
    if (isBanned) {
        return (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-200">
                <NoSymbolIcon className="h-3 w-3" />
                Banned
            </div>
        );
    }
    if (isPremium) {
        return (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-200">
                <ShieldCheckIcon className="h-3 w-3" />
                Premium
            </div>
        );
    }
    return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-600 dark:text-gray-300">
            <BanknotesIcon className="h-3 w-3" />
            Free
        </div>
    );
};

const ActionButton = ({ onClick, className, children, title }) => (
    <button 
        type="button" 
        onClick={onClick} 
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${className}`}
        title={title}
    >
        {children}
    </button>
);


// --- Komponen Utama Halaman ---

export default function UserIndex({ auth, users, plans, filters, flash }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToPromote, setUserToPromote] = useState(null);

    // Opsi standar untuk setiap request router untuk menjaga UI tetap sinkron
    const routerOptions = {
        preserveScroll: true,
        onSuccess: () => {
            // Ini adalah KUNCI untuk UI yang selalu akurat.
            // Setelah setiap aksi berhasil, minta data 'users' dan 'flash' yang baru dari server.
            router.reload({ only: ['users', 'flash'] });
        },
    };

    const openPromoteModal = (user) => {
        setUserToPromote(user);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handlePromote = (planId) => {
        if (!userToPromote) return;
        
        router.post(
            route('admin.users.promote', userToPromote.id),
            { plan_id: planId },
            {
                ...routerOptions, // Gabungkan opsi standar
                onSuccess: () => { // Ganti onSuccess spesifik untuk modal
                    closeModal(); // Tutup modal dulu
                    router.reload({ only: ['users', 'flash'] }); // Lalu refresh data
                }
            }
        );
    };

    const handleSimpleAction = (e, routeUrl, userName, actionText) => {
        e.preventDefault();
        if (confirm(`Apakah Anda yakin ingin ${actionText} untuk pengguna "${userName}"?`)) {
            // Gunakan routerOptions untuk semua aksi sederhana
            router.post(routeUrl, {}, routerOptions);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search: searchTerm }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Manajemen Pengguna</h2>}
        >
            <Head title="Manajemen Pengguna" />

            <div className="py-8 sm:py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {flash.success && (
                        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                            <div className="flex">
                                <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-400" aria-hidden="true" />
                                <div className="ml-3"><p className="text-sm font-medium text-green-800 dark:text-green-300">{flash.success}</p></div>
                            </div>
                        </div>
                    )}
                    {flash.error && (
                         <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                            <div className="flex">
                                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-400" aria-hidden="true" />
                                <div className="ml-3"><p className="text-sm font-medium text-red-800 dark:text-red-300">{flash.error}</p></div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800/50 dark:border dark:border-gray-700/50 shadow-sm sm:rounded-2xl">
                        
                        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700/50">
                            <form onSubmit={handleSearch} className="relative">
                                <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full max-w-xs rounded-lg border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                                    placeholder="Cari pengguna..."
                                />
                            </form>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="bg-gray-50 dark:bg-gray-900/20 text-xs text-gray-700 dark:text-gray-300 uppercase">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 sm:px-6">Pengguna</th>
                                        <th scope="col" className="px-4 py-3 sm:px-6">Status</th>
                                        <th scope="col" className="hidden sm:table-cell px-4 py-3 sm:px-6">Bergabung</th>
                                        <th scope="col" className="relative px-4 py-3 sm:px-6"><span className="sr-only">Aksi</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/20">
                                            <td className="px-4 py-4 sm:px-6 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar name={user.name} />
                                                    <div>
                                                        <div className="font-semibold">{user.name}</div>
                                                        <div className="text-xs text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 sm:px-6">
                                                <StatusBadge isPremium={!!user.subscription} isBanned={!!user.banned_at} />
                                            </td>
                                            <td className="hidden sm:table-cell px-4 py-4 sm:px-6">
                                                {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-4 sm:px-6">
                                                <div className="flex justify-end items-center gap-2">
                                                    {user.subscription ? (
                                                        <ActionButton title="Cabut Status Premium" onClick={(e) => handleSimpleAction(e, route('admin.users.demote', user.id), user.name, 'mencabut premium')} className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-200 dark:hover:bg-yellow-900/60">
                                                            <ArrowPathIcon className="h-4 w-4" />
                                                        </ActionButton>
                                                    ) : (
                                                        <ActionButton title="Promosikan ke Premium" onClick={() => openPromoteModal(user)} className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-900/60">
                                                           <UserPlusIcon className="h-4 w-4" />
                                                        </ActionButton>
                                                    )}
                                                    {user.banned_at ? (
                                                        <ActionButton title="Buka Ban Pengguna" onClick={(e) => handleSimpleAction(e, route('admin.users.unban', user.id), user.name, 'membuka ban')} className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-200 dark:hover:bg-green-900/60">
                                                            <CheckCircleIcon className="h-4 w-4" />
                                                        </ActionButton>
                                                    ) : (
                                                        <ActionButton title="Ban Pengguna" onClick={(e) => handleSimpleAction(e, route('admin.users.ban', user.id), user.name, 'mem-banned')} className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60">
                                                            <NoSymbolIcon className="h-4 w-4" />
                                                        </ActionButton>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.data.length === 0 && (
                                        <tr><td colSpan="4" className="text-center py-16 text-gray-500 dark:text-gray-400">Tidak ada pengguna yang ditemukan.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {users.data.length > 0 && users.links.length > 3 && (
                            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700/50">
                                <Pagination links={users.links} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-2 sm:p-0">
                    <div className="sm:flex sm:items-start sm:gap-4">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 sm:mx-0 sm:h-10 sm:w-10">
                            <ShieldCheckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:text-left flex-grow">
                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                                Promote Pengguna: {userToPromote?.name}
                            </Dialog.Title>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Pilih paket premium untuk diberikan kepada pengguna ini.
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-5 space-y-3">
                        {plans.map((plan) => (
                            <button
                                key={plan.id}
                                onClick={() => handlePromote(plan.id)}
                                className="group w-full text-left p-4 rounded-lg border border-gray-300 dark:border-gray-600/50 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all dark:hover:bg-gray-700/50"
                            >
                                <div className="font-semibold text-gray-800 dark:text-gray-200">{plan.name}</div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Rp{plan.price.toLocaleString('id-ID')} / {plan.duration}
                                </span>
                            </button>
                        ))}
                         {plans.length === 0 && (
                            <p className="text-center text-sm text-gray-500 py-4">Tidak ada plan premium yang tersedia untuk ditambahkan.</p>
                         )}
                    </div>
                    
                    <div className="mt-5 sm:mt-6 text-right">
                         <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                            onClick={closeModal}
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}