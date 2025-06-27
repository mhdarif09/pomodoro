import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect } from 'react';

export default function Dashboard({ auth, plans, subscription }) {
    const pay = async (plan) => {
        const response = await axios.post('/subscribe', { plan: plan.name });
        window.snap.pay(response.data.snap_token);
    };

    // inject midtrans snap.js (jika belum)
    useEffect(() => {
        if (!window.snap) {
            const script = document.createElement('script');
            script.src = 'https://app.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Welcome Message */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            Selamat datang, {auth.user.name}!
                            {subscription && (
                                <p className="text-sm text-green-400 mt-2">
                                    Premium aktif hingga: {subscription.expired_at}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Plan List */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Langganan Premium</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {plans.map((plan) => (
                                <div key={plan.id} className="bg-gray-700 text-white p-4 rounded-xl">
                                    <h4 className="font-bold text-lg capitalize">{plan.name}</h4>
                                    <p className="text-sm text-gray-300 mb-1">
                                        Durasi: {plan.duration === 'monthly' ? 'Bulanan' : 'Tahunan'}
                                    </p>
                                    <p className="text-xl mb-3">Rp {plan.price.toLocaleString()}</p>
                                    <button
                                        onClick={() => pay(plan)}
                                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded w-full"
                                    >
                                        Bayar Sekarang
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
