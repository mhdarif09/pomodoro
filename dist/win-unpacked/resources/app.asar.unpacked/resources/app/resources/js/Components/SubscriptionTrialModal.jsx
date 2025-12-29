// File: resources/js/Components/SubscriptionTrialModal.jsx (Full Code - FINAL & DINAMIS)

import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, CalendarDaysIcon, CreditCardIcon } from '@heroicons/react/24/solid';

/**
 * Komponen Modal yang ditampilkan setelah onboarding selesai.
 * Tujuannya adalah untuk mengundang pengguna mendaftarkan Kartu Kredit/Debit
 * dan memulai masa Free Trial 7 hari.
 * Menerima data plan secara dinamis melalui props.
 */
export default function SubscriptionTrialModal({ user, plan }) {
    const [isLoading, setIsLoading] = useState(false);
    
    // Fallback default jika prop `plan` karena suatu alasan tidak terkirim.
    // Ini membuat komponen lebih tangguh.
    const displayPlan = plan || { name: 'Premium Monthly', price: 99000 };
    
    /**
     * Menangani klik pada tombol "Mulai Coba Gratis".
     * Mengirim request ke backend untuk mendapatkan Snap Token,
     * lalu membuka pop-up pembayaran Midtrans.
     */
    const startTrial = async () => {
        setIsLoading(true);
        try {
            // Memanggil route yang sudah kita siapkan di backend.
            const response = await axios.post(route('subscription.start-trial'));
            
            // Menggunakan snap_token dari backend untuk membuka Midtrans Snap.
            // Pop-up pembayaran akan muncul di sini.
            window.snap.pay(response.data.snap_token, {
                onSuccess: function(result){
                    // Pengalihan ke dashboard akan di-handle oleh 'finish' URL yang kita set di MidtransService.
                    // Frontend tidak perlu melakukan redirect manual. Cukup hentikan loading.
                    console.log('Card enrollment success:', result);
                    // Biarkan loading sampai halaman di-reload oleh redirect
                },
                onPending: function(result){
                    // Biasanya tidak terjadi untuk otorisasi kartu, tapi bagus untuk ada.
                    console.log('Payment Pending:', result);
                    setIsLoading(false);
                    alert("Pendaftaran kartu Anda sedang diproses.");
                },
                onError: function(result){
                    // Dipanggil jika ada kesalahan di sisi Midtrans atau input pengguna.
                    console.error('Payment Error:', result);
                    setIsLoading(false);
                    alert("Terjadi kesalahan saat mendaftarkan kartu. Silakan periksa detail Anda dan coba lagi.");
                },
                onClose: function(){
                    // Dipanggil jika pengguna menutup pop-up Midtrans secara manual.
                    console.log('Customer closed the popup without finishing the payment');
                    setIsLoading(false);
                }
            });
        } catch (error) {
            console.error("Gagal memulai proses trial:", error.response?.data?.message || error.message);
            alert(error.response?.data?.message || "Gagal memulai masa trial. Silakan coba lagi.");
            setIsLoading(false);
        }
    };

    return (
        // Latar belakang semi-transparan yang memblur konten di belakangnya.
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-lg text-center"
            >
                <ShieldCheckIcon className="h-16 w-16 text-teal-500 mx-auto" />

                <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Satu Langkah Terakhir, {user.name}!
                </h1>
                
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Buka semua fitur premium dengan memulai masa coba gratis.
                </p>
                
                {/* Bagian yang menjelaskan detail penawaran trial */}
                <div className="mt-8 bg-slate-100 dark:bg-slate-700/50 p-6 rounded-xl text-left space-y-4 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-4">
                        <CalendarDaysIcon className="w-8 h-8 text-teal-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Coba Gratis 7 Hari</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Akses penuh ke paket <span className="font-bold">{displayPlan.name}</span>.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <CreditCardIcon className="w-8 h-8 text-teal-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                                {/* Menampilkan harga dinamis dari prop 'plan' */}
                                Selanjutnya Rp{Number(displayPlan.price).toLocaleString('id-ID')}/bulan
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Setelah 7 hari. Batalkan kapan saja tanpa repot.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                    Anda tidak akan ditagih sekarang. Pendaftaran kartu hanya untuk verifikasi dan penagihan otomatis setelah masa trial berakhir.
                </p>

                {/* Tombol Aksi Utama */}
                <button
                    onClick={startTrial}
                    disabled={isLoading}
                    className="mt-6 w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 rounded-lg text-lg shadow-lg shadow-teal-500/30 transition-all transform hover:scale-105"
                >
                    {isLoading ? 'Memproses...' : 'Mulai Coba Gratis 7 Hari'}
                </button>
            </motion.div>
        </div>
    );
}