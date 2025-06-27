import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function History({ auth, subscriptions }) {
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        const base = "px-2 py-1 rounded text-xs font-semibold";
        switch (status) {
            case 'paid':
                return `${base} bg-green-600 text-white`;
            case 'pending':
                return `${base} bg-yellow-500 text-white`;
            case 'failed':
            case 'cancel':
                return `${base} bg-red-600 text-white`;
            default:
                return `${base} bg-gray-500 text-white`;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Riwayat Transaksi" />
            <div className="p-6 sm:p-10 text-white min-h-screen bg-gray-900">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-white">Riwayat Transaksi</h1>
                <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-700">
                            <tr className="text-left text-sm sm:text-base text-gray-300">
                                <th className="px-4 py-3">Plan</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Expired</th>
                                <th className="px-4 py-3">Paid At</th>
                                <th className="px-4 py-3">Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                                        Belum ada riwayat transaksi.
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub.id} className="border-t border-gray-700 text-sm sm:text-base">
                                        <td className="px-4 py-3 capitalize">{sub.plan}</td>
                                        <td className="px-4 py-3">
                                            <span className={getStatusBadge(sub.status)}>{sub.status}</span>
                                        </td>
                                        <td className="px-4 py-3">{formatDate(sub.expired_at)}</td>
                                        <td className="px-4 py-3">{formatDate(sub.paid_at)}</td>
                                        <td className="px-4 py-3">{sub.payment_type ?? '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
