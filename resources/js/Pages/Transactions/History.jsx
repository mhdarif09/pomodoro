import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
// Impor ikon dari Heroicons
import { ClockIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

// Komponen untuk Badge Status yang lebih modern dan mendukung Dark/Light mode
const StatusBadge = ({ status }) => {
    // Konfigurasi style untuk setiap status (Light & Dark mode)
    const statusConfig = {
        paid: {
            label: 'Paid',
            className: 'bg-green-100 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20',
        },
        pending: {
            label: 'Pending',
            className: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20',
        },
        failed: {
            label: 'Failed',
            className: 'bg-red-100 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
        },
        cancel: {
            label: 'Cancelled',
            className: 'bg-red-100 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
        },
        default: {
            label: status,
            className: 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-400/10 dark:text-gray-300 dark:ring-gray-400/20',
        },
    };

    const config = statusConfig[status] || statusConfig.default;

    return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium capitalize ${config.className}`}>
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
        <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Belum Ada Transaksi</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Riwayat langganan Anda akan muncul di sini.</p>
        </div>
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Riwayat Transaksi" />

            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8">
                        <div className="flex items-center gap-x-3">
                            <ClockIcon className="h-8 w-8 text-blue-500" aria-hidden="true" />
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Riwayat Transaksi</h1>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Lihat semua histori langganan Anda di satu tempat.</p>
                    </header>

                    {subscriptions.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div>
                            {/* Tampilan Kartu untuk Mobile */}
                            <div className="md:hidden space-y-4">
                                {subscriptions.map((sub) => (
                                    <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-lg capitalize text-gray-900 dark:text-white">{sub.plan}</span>
                                            <StatusBadge status={sub.status} />
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <div className="text-gray-500 dark:text-gray-400">Expired</div>
                                            <div className="text-right text-gray-700 dark:text-gray-200 font-medium">{formatDate(sub.expired_at)}</div>
                                            <div className="text-gray-500 dark:text-gray-400">Paid at</div>
                                            <div className="text-right text-gray-700 dark:text-gray-200 font-medium">{formatDate(sub.paid_at)}</div>
                                            <div className="text-gray-500 dark:text-gray-400">Payment</div>
                                            <div className="text-right text-gray-700 dark:text-gray-200 font-medium">{sub.payment_type ?? '-'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tampilan Tabel untuk Desktop */}
                            <div className="hidden md:block overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expired</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paid At</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {subscriptions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">{sub.plan}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={sub.status} /></td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{formatDate(sub.expired_at)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{formatDate(sub.paid_at)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{sub.payment_type ?? '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}