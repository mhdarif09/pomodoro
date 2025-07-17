// File: resources/js/Pages/Pomodoro/components/UpgradeModal.jsx

import React from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function UpgradeModal({ isOpen, onClose, plans }) {
    
    const handleUpgrade = async (plan) => {
        try {
            // Note: Ensure your `auth.user` has access to `window.snap`
            // You might need to load the Midtrans Snap.js script in your main layout
            const response = await axios.post('/subscribe/checkout', { plan: plan.name });
            if (window.snap) {
                window.snap.pay(response.data.snap_token, {
                    onSuccess: function(result){
                      alert("payment success!"); console.log(result);
                      onClose(); // Close modal on success
                    },
                    onPending: function(result){
                      alert("waiting for your payment!"); console.log(result);
                    },
                    onError: function(result){
                      alert("payment failed!"); console.log(result);
                    },
                    onClose: function(){
                      alert('you closed the popup without finishing the payment');
                    }
                  });
            } else {
                alert('Gagal memuat gateway pembayaran. Harap segarkan halaman.');
            }
        } catch (err) {
            alert('Gagal memulai pembayaran. Silakan coba lagi.');
            console.error(err);
        }
    };
    
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 text-center"
                    >
                        <h2 className="text-2xl font-bold mb-2">✨ Upgrade ke Premium</h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">Buka semua fitur canggih untuk produktivitas maksimal.</p>
                        <div className="space-y-4">
                            {plans && plans.length > 0 ? (
                                plans.map((plan) => (
                                    <div key={plan.id} className="p-4 border dark:border-slate-700 rounded-lg flex justify-between items-center text-left">
                                        <div>
                                            <h3 className="font-semibold">{plan.name}</h3>
                                            <p className="text-sm text-slate-500">Rp {Number(plan.price).toLocaleString('id-ID')}</p>
                                        </div>
                                        <button onClick={() => handleUpgrade(plan)} className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition-colors">
                                            Pilih Paket
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500">Paket premium tidak tersedia saat ini.</p>
                            )}
                        </div>
                        <button onClick={onClose} className="mt-6 text-sm text-slate-500 hover:underline">
                            Lain kali
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}