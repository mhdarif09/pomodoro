// File: resources/js/Pages/PrivacyPolicy.jsx (Responsive Typography Version)

import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function PrivacyPolicy() {
    return (
        <GuestLayout>
            <Head title="Privacy Policy" />
            
            <div className="py-12 sm:py-24 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                    <div className="mb-8">
                        <Link 
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Kembali ke Halaman Utama
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-6 sm:p-10 lg:p-12">
                        {/* ----- PERUBAHAN UTAMA ADA DI BAGIAN className INI ----- */}
                        <div 
                            className="
                                prose sm:prose-lg dark:prose-invert 
                                prose-slate
                                prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-2 prose-h1:text-slate-900 dark:prose-h1:text-white
                                prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4
                                prose-p:leading-relaxed prose-p:my-5 
                                prose-ul:my-5 prose-li:my-2
                                prose-a:text-green-600 prose-a:font-semibold dark:prose-a:text-green-400 hover:prose-a:underline
                                max-w-none 
                                text-slate-700 dark:text-slate-300
                            "
                        >
                            <h1>Kebijakan Privasi (Privacy Policy)</h1>
                            <p className="lead !text-slate-500 !-mt-2">Efektif per: 19 Oktober 2025</p>
                            
                            <p>
                               Kebijakan Privasi ini menjelaskan bagaimana <strong>Sarang Tumbuh</strong> ("Aplikasi", "Layanan", "kami") mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda. Dengan menggunakan Layanan kami, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini.
                            </p>
                            
                            <h2>1. Informasi yang Kami Kumpulkan</h2>
                            <p>Kami mengumpulkan informasi berikut untuk menyediakan dan meningkatkan Layanan kami:</p>
                            <ul>
                                <li><strong>Informasi Akun:</strong> Saat Anda mendaftar menggunakan Google, kami mengumpulkan nama, alamat email, dan ID akun Google Anda.</li>
                                <li><strong>Data Penggunaan:</strong> Kami mengumpulkan data yang Anda buat di dalam aplikasi, seperti tugas (to-do list), misi yang diselesaikan, dan goal harian.</li>
                                <li><strong>Informasi Transaksi:</strong> Kami menyimpan riwayat transaksi Koin di dalam aplikasi untuk fitur Wallet. Kami tidak menyimpan informasi rekening bank Anda.</li>
                            </ul>
                            
                            <h2>2. Bagaimana Kami Menggunakan Informasi Anda</h2>
                            <p>Informasi Anda digunakan untuk tujuan berikut:</p>
                            <ul>
                                <li>Untuk menyediakan, mengoperasikan, dan memelihara Layanan kami.</li>
                                <li>Untuk mempersonalisasi pengalaman Anda.</li>
                                <li>Untuk memproses transaksi Misi dan Wallet Anda.</li>
                                <li>Untuk berkomunikasi dengan Anda.</li>
                                <li>Untuk memantau dan menganalisis penggunaan untuk meningkatkan Layanan.</li>
                            </ul>
                            
                            <h2>3. Berbagi Informasi</h2>
                            <p>Kami <strong>tidak menjual atau menyewakan</strong> informasi pribadi Anda kepada pihak ketiga.</p>
                            
                            <h2>4. Keamanan Data</h2>
                            <p>Keamanan data Anda adalah prioritas kami. Kami menggunakan langkah-langkah keamanan yang wajar untuk melindungi informasi Anda.</p>
                            
                            <h2>5. Hak Anda</h2>
                            <p>Anda memiliki hak untuk mengakses atau meminta penghapusan data pribadi Anda. Silakan hubungi kami jika Anda ingin mengajukan permintaan ini.</p>

                            <h2>6. Kontak</h2>
                            <p>
                                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di <a href="mailto:sarangtumbuhofficial@gmail.com">sarangtumbuhofficial@gmail.com</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}