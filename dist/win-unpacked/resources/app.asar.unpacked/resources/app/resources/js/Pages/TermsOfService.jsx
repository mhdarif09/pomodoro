// File: resources/js/Pages/TermsOfService.jsx (Responsive Typography Version)

import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function TermsOfService() {
    return (
        <GuestLayout>
            <Head title="Terms of Service" />
            
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
                            <h1>Ketentuan Layanan (Terms of Service)</h1>
                            <p className="lead !text-slate-500 !-mt-2">Efektif per: 19 Oktober 2025</p>

                            <p>
                                Selamat datang di <strong>Sarang Tumbuh</strong> ("Aplikasi", "Layanan", "kami"). Ketentuan Layanan ini ("Ketentuan") mengatur akses dan penggunaan Anda terhadap aplikasi dan layanan kami. Dengan mengakses atau menggunakan Layanan, Anda setuju untuk terikat oleh Ketentuan ini.
                            </p>

                            <h2>1. Akun Pengguna</h2>
                            <p>
                                Untuk menggunakan layanan kami, Anda harus mendaftar menggunakan akun Google Anda. Anda bertanggung jawab untuk menjaga keamanan informasi akun Anda dan untuk semua aktivitas yang terjadi di bawah akun Anda.
                            </p>

                            <h2>2. Fitur "Productivity-to-Earn" (Misi & Wallet)</h2>
                            <ul>
                                <li>Aplikasi kami menyediakan fitur misi harian dimana pengguna dapat memperoleh koin virtual ("Koin") setelah menyelesaikan tugas-tugas produktif tertentu.</li>
                                <li>Definisi "tugas selesai" ditentukan secara otomatis oleh sistem kami (misalnya, menyelesaikan sesi Pomodoro, membuat tugas detail). Kami berhak untuk mengubah kriteria ini kapan saja.</li>
                                <li><strong>Penting:</strong> Koin yang terkumpul di dompet (Wallet) Anda dapat ditukarkan menjadi uang nyata sesuai dengan syarat dan ketentuan penarikan yang berlaku.</li>
                                <li>Kami berhak menyelidiki dan membatalkan Koin yang diperoleh melalui cara-cara curang, eksploitasi, spam, atau aktivitas lain yang melanggar ketentuan ini. Keputusan kami bersifat final.</li>
                            </ul>

                            <h2>3. Penarikan Dana (Withdrawal)</h2>
                            <ul>
                                <li>Pengguna dapat mengajukan permintaan penarikan dana jika saldo Koin mereka telah mencapai batas minimum yang ditentukan.</li>
                                <li>Semua permintaan penarikan akan diproses secara manual oleh tim admin kami dan tunduk pada verifikasi.</li>
                                <li>Kami berhak menolak permintaan penarikan jika terdeteksi aktivitas mencurigakan atau pelanggaran ketentuan.</li>
                                <li>Waktu proses penarikan dapat bervariasi. Kami tidak menjamin waktu pemrosesan yang instan.</li>
                            </ul>

                            <h2>4. Penggunaan yang Dilarang</h2>
                            <p>
                                Anda setuju untuk tidak menggunakan Layanan untuk:
                            </p>
                            <ul>
                                <li>Aktivitas ilegal atau melanggar hukum.</li>
                                <li>Mencoba mengeksploitasi sistem Misi atau Wallet.</li>
                                <li>Mengganggu atau merusak integritas server atau jaringan kami.</li>
                            </ul>
                            
                            <h2>5. Penghentian Akun</h2>
                            <p>
                                Kami berhak untuk menangguhkan atau menghentikan akun Anda kapan saja, tanpa pemberitahuan sebelumnya, jika Anda melanggar Ketentuan ini.
                            </p>

                            <h2>6. Perubahan pada Ketentuan</h2>
                            <p>
                                Kami dapat mengubah Ketentuan ini dari waktu ke waktu. Jika kami melakukan perubahan, kami akan memberitahu Anda dengan merevisi tanggal di bagian atas kebijakan ini dan, dalam beberapa kasus, kami dapat memberikan pemberitahuan tambahan.
                            </p>
                            
                            <h2>7. Kontak</h2>
                            <p>
                                Jika Anda memiliki pertanyaan tentang Ketentuan Layanan ini, silakan hubungi kami di <a href="mailto:sarangtumbuhofficial@gmail.com">sarangtumbuhofficial@gmail.com</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}