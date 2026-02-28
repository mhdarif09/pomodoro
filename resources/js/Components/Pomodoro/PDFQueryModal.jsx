// File: resources/js/Pages/Pomodoro/components/PDFQueryModal.jsx
// --- VERSI LENGKAP DENGAN PERBAIKAN ---

import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';

export default function PDFQueryModal({ isOpen, onClose }) {
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfQuery, setPdfQuery] = useState('');
    const [pdfAnswer, setPdfAnswer] = useState('');
    const [loadingPdfAI, setLoadingPdfAI] = useState(false);

    const handlePdfFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setPdfAnswer(''); // Reset answer on new file
        } else {
            alert('Harap pilih file PDF yang valid.');
            e.target.value = null; // Reset file input
        }
    };
    
    const handlePdfSubmit = async () => {
        if (!pdfFile || !pdfQuery.trim() || loadingPdfAI) return;
        
        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append('query', pdfQuery);

        setLoadingPdfAI(true);
        setPdfAnswer('');

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const res = await axios.post('ask-from-pdf', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
            });
            setPdfAnswer(res.data.response || "Tidak ditemukan jawaban yang relevan dari dokumen.");
        } catch (err) {
            console.error("PDF Query Error:", err.response?.data || err.message);
            
            // --- PERBAIKAN: Memberikan pesan error yang lebih spesifik berdasarkan respons backend ---
            let errorText = 'Gagal memproses permintaan Anda.'; // Pesan default

            if (err.response?.status === 503) {
                // Kasus spesifik: Server AI sibuk. Pesan diambil langsung dari backend.
                errorText = err.response.data.error;
            } else if (err.response?.data?.error) {
                // Untuk error custom lain yang kita definisikan di backend (cth: 'Gagal parsing PDF').
                errorText = err.response.data.error;
            } else if (err.response?.data?.message) {
                // Menangani error validasi dari Laravel.
                errorText = err.response.data.message;
            } else {
                // Fallback untuk error jaringan atau kesalahan tak terduga lainnya.
                errorText = 'Gagal terhubung ke server atau terjadi kesalahan tak dikenal.';
            }

            setPdfAnswer(`Error: ${errorText}`);
        } finally {
            setLoadingPdfAI(false);
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
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4"
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Tanya Jawab PDF</h3>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><XMarkIcon className="h-6 w-6"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Upload PDF</label>
                                <input type="file" accept="application/pdf" onChange={handlePdfFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                                {pdfFile && <p className="text-xs mt-2 text-slate-500 bg-slate-100 dark:bg-slate-700 p-2 rounded-md">File terpilih: {pdfFile.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="pdf-query" className="block text-sm font-medium mb-1">Pertanyaan Anda</label>
                                <textarea id="pdf-query" value={pdfQuery} onChange={(e) => setPdfQuery(e.target.value)} rows="3" className="w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-emerald-500 focus:ring-emerald-500"></textarea>
                            </div>
                            <button onClick={handlePdfSubmit} disabled={loadingPdfAI || !pdfFile || !pdfQuery.trim()} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-500 transition-colors flex items-center justify-center gap-2">
                                {loadingPdfAI && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                                {loadingPdfAI ? 'Menganalisis...' : 'Tanya'}
                            </button>
                            {pdfAnswer && <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg max-h-40 overflow-y-auto"><h4 className="font-semibold mb-2">Jawaban:</h4><p className="text-sm whitespace-pre-wrap">{pdfAnswer}</p></div>}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}