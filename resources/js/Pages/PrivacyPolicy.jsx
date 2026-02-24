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
                            <h1>Privacy Policy – SarangTumbuh</h1>
                            <p className="lead !text-slate-500 !-mt-2">Efektif per: 19 Februari 2026</p>

                            <p>
                                SarangTumbuh ("Aplikasi", "Layanan", "kami") menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda saat menggunakan layanan kami.
                            </p>

                            <p>
                                Dengan menggunakan SarangTumbuh, Anda menyetujui praktik yang dijelaskan dalam Kebijakan Privasi ini.
                            </p>

                            <h2>1. Informasi yang Kami Kumpulkan</h2>
                            <p>Kami mengumpulkan informasi berikut untuk menyediakan dan meningkatkan layanan:</p>

                            <h3>a. Informasi Akun Google</h3>
                            <p>Saat Anda masuk menggunakan akun Google, kami mengakses:</p>
                            <ul>
                                <li>Nama</li>
                                <li>Alamat email</li>
                                <li>ID akun Google</li>
                                <li>Foto profil (jika tersedia)</li>
                            </ul>
                            <p>Informasi ini digunakan untuk autentikasi dan identifikasi akun Anda.</p>


                            <h3>b. Data Penggunaan Aplikasi</h3>
                            <p>Kami menyimpan:</p>
                            <ul>
                                <li>To-do list</li>
                                <li>Misi dan goal harian</li>
                                <li>Riwayat aktivitas</li>
                                <li>Riwayat transaksi Koin dalam fitur Wallet</li>
                            </ul>
                            <p>Kami tidak menyimpan informasi rekening bank atau data pembayaran sensitif.</p>

                            <h2>2. Bagaimana Kami Menggunakan Informasi</h2>
                            <p>Informasi Anda digunakan untuk:</p>
                            <ul>
                                <li>Mengoperasikan dan memelihara layanan SarangTumbuh</li>
                                <li>Menyediakan pengingat dan sistem manajemen produktivitas</li>
                                <li>Meningkatkan fitur dan pengalaman pengguna</li>
                                <li>Memberikan dukungan pengguna</li>
                            </ul>
                            <p>Kami tidak menggunakan data Anda untuk iklan pihak ketiga.</p>

                            <h2>3. Berbagi Informasi</h2>
                            <p>Kami tidak menjual, menyewakan, atau memperdagangkan informasi pribadi Anda kepada pihak ketiga.</p>
                            <p>Kami hanya dapat membagikan data jika diwajibkan oleh hukum atau permintaan resmi pemerintah.</p>

                            <h2>4. Penyimpanan dan Keamanan Data</h2>
                            <p>Kami menggunakan langkah-langkah teknis dan administratif yang wajar untuk melindungi data Anda dari akses tidak sah, perubahan, atau kebocoran.</p>
                            <p>Namun, tidak ada sistem yang 100% aman, dan kami tidak dapat menjamin keamanan absolut.</p>

                            <h2>5. Penyimpanan Data</h2>
                            <p>Data Anda disimpan selama akun Anda aktif atau selama diperlukan untuk menyediakan layanan.</p>
                            <p>Anda dapat meminta penghapusan akun dan data kapan saja dengan menghubungi kami.</p>

                            <h2>6. Hak Anda</h2>
                            <p>Anda memiliki hak untuk:</p>
                            <ul>
                                <li>Mengakses data pribadi Anda</li>
                                <li>Memperbarui data</li>
                                <li>Meminta penghapusan akun</li>
                            </ul>

                            <h2>7. Layanan Pihak Ketiga</h2>
                            <p>
                                Layanan ini menggunakan sistem autentikasi dari Google melalui protokol OAuth 2.0 dan layanan resmi Google.
                                Informasi penggunaan Google juga tunduk pada kebijakan privasi Google yang tersedia di: <br />
                                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>
                            </p>

                            <h2>8. Perubahan Kebijakan</h2>
                            <p>Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan dipublikasikan di halaman ini dengan tanggal efektif terbaru.</p>

                            <h2>9. Kontak</h2>
                            <p>Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi:</p>
                            <p>
                                📧 <a href="mailto:sarangtumbuhofficial@gmail.com">sarangtumbuhofficial@gmail.com</a> <br />
                                🌐 <a href="https://sarangtumbuh.site" target="_blank" rel="noopener noreferrer">https://sarangtumbuh.site</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}