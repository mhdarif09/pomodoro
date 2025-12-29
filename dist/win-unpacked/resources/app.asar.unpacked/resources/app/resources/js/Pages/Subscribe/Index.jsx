// File: resources/js/Pages/Subscribe/Index.jsx
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// Ini adalah komponen Halaman Penuh, bukan Modal
export default function SubscribeIndex() {
    const { message, plans, auth } = usePage().props;
    const [isLoading, setIsLoading] = useState(false);
    
    // Memuat skrip Midtrans saat halaman dimuat
    useEffect(() => {
        if (!window.snap) {
            const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
            const snapUrl = isProduction ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
            const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
            const script = document.createElement('script');
            script.src = snapUrl;
            script.setAttribute('data-client-key', clientKey);
            document.body.appendChild(script);
        }
    }, []);

    const handleSubscribe = async (planId) => {
        setIsLoading(true);
        try {
            const response = await axios.post(route('subscription.checkout'), { plan_id: planId });
            window.snap.pay(response.data.snap_token, {
                onSuccess: () => window.location.href = route('subscription.payment.success'),
                onPending: () => { setIsLoading(false); alert("Menunggu pembayaran..."); },
                onError: () => { setIsLoading(false); alert("Pembayaran gagal!"); },
                onClose: () => setIsLoading(false)
            });
        } catch (error) {
            console.error('Checkout error:', error);
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <Head title="Berlangganan" />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center p-4">
                 <div className="w-full max-w-4xl mx-auto">
                    <div className="text-center">
                         <h1 className="text-4xl font-bold text-teal-500">Akses Anda Telah Berakhir</h1>
                         <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{message || 'Pilih paket di bawah ini untuk melanjutkan perjalanan pertumbuhan Anda.'}</p>
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                         {(plans || []).map((plan) => (
                              <div key={plan.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col shadow-lg">
                                   <h3 className="text-xl font-semibold text-teal-500 dark:text-teal-400">{plan.name}</h3>
                                   <p className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-white">Rp{Number(plan.price).toLocaleString('id-ID')}</p>
                                   <p className="text-sm text-slate-500 dark:text-slate-400">per {plan.duration === 'monthly' ? 'bulan' : 'tahun'}</p>
                                   <ul className="mt-8 space-y-3 text-slate-600 dark:text-slate-300 flex-grow">
                                        {(plan.features || []).map((feature, idx) => (
                                             <li key={idx} className="flex items-center gap-3"><CheckCircleIcon className="h-5 w-5 text-teal-500" /><span>{feature}</span></li>
                                        ))}
                                   </ul>
                                   <button onClick={() => handleSubscribe(plan.id)} disabled={isLoading} className="mt-10 w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-lg shadow-lg transition transform hover:scale-105 disabled:bg-slate-400">{isLoading ? 'Memproses...' : 'Pilih Paket'}</button>
                              </div>
                         ))}
                    </div>
                </div>
            </div>
        </>
    );
}