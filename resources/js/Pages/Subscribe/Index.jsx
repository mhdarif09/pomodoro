import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Spinner } from '@/Components/Spinner'; // optional: komponen spinner elegan

export default function Subscribe({ auth, plans }) {
    const [isRedirecting, setIsRedirecting] = useState(false);

    const pay = async (plan) => {
        try {
            const response = await axios.post('/subscribe', { plan: plan.name });
            const snapToken = response.data.snap_token;

            window.snap.pay(snapToken, {
                onSuccess: function (result) {
                    console.log('Success', result);

                    setIsRedirecting(true); // trigger loading state

                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 3000); // 3 detik delay
                },
                onPending: function (result) {
                    alert('Pembayaran sedang diproses...');
                    window.location.href = '/dashboard';
                },
                onError: function (result) {
                    alert('Terjadi kesalahan saat pembayaran.');
                    console.error(result);
                },
                onClose: function () {
                    console.log('Snap closed by user');
                },
            });
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Gagal memproses pembayaran.');
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Langganan Premium" />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 text-white">Pilih Paket Premium</h1>

                {isRedirecting && (
                    <div className="text-center text-white mt-4">
                        <p className="text-lg">✅ Pembayaran berhasil! Mengarahkan ke dashboard...</p>
                        <div className="mt-4">
                            {/* Bisa ganti dengan spinner animasi elegan */}
                            <svg className="animate-spin h-6 w-6 mx-auto text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </div>
                    </div>
                )}

                {!isRedirecting && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {plans.map(plan => (
                            <div key={plan.id} className="bg-gray-800 p-4 rounded-xl text-white">
                                <h2 className="text-lg font-bold capitalize">{plan.name}</h2>
                                <p className="text-xl mb-4">Rp {plan.price.toLocaleString()}</p>
                                <button
                                    onClick={() => pay(plan)}
                                    className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                                >
                                    Bayar Sekarang
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
