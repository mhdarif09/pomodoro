import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function Subscribe({ auth, plans }) {
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [loadingPlanId, setLoadingPlanId] = useState(null);

    const pay = async (plan) => {
        try {
            setLoadingPlanId(plan.id);

            const response = await axios.post('/subscribe', { plan: plan.name }, {
                headers: {
                    'X-Inertia': false // <- FIX agar tidak dianggap Inertia request
                }
            });

            const snapToken = response.data.snap_token;

            window.snap.pay(snapToken, {
                onSuccess: function (result) {
                    console.log('Success', result);
                    setIsRedirecting(true);
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 3000);
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
                    setLoadingPlanId(null);
                },
            });
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Gagal memproses pembayaran.');
            setLoadingPlanId(null);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Langganan Premium" />

            <div className="p-6 text-white">
                <h1 className="text-2xl font-bold mb-6">Pilih Paket Premium</h1>

                {isRedirecting ? (
                    <div className="text-center mt-10">
                        <p className="text-lg">✅ Pembayaran berhasil! Mengarahkan ke dashboard...</p>
                        <div className="mt-4">
                            <svg className="animate-spin h-8 w-8 mx-auto text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <div key={plan.id} className="bg-gray-800 p-6 rounded-xl shadow-md">
                                <h2 className="text-xl font-semibold capitalize mb-2">{plan.name}</h2>
                                <p className="text-2xl font-bold mb-4">Rp {plan.price.toLocaleString()}</p>

                                <button
                                    onClick={() => pay(plan)}
                                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition ${
                                        loadingPlanId === plan.id ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    disabled={loadingPlanId === plan.id}
                                >
                                    {loadingPlanId === plan.id ? 'Memproses...' : 'Bayar Sekarang'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
