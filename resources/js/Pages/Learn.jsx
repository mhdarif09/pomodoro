import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    SparklesIcon, ClockIcon, UserGroupIcon, TrophyIcon, BookOpenIcon,
    ChevronRightIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon,
    ArrowRightIcon, ChatBubbleLeftEllipsisIcon, BoltIcon,
    CreditCardIcon, ShareIcon, GlobeAltIcon, ShieldCheckIcon,
    CurrencyDollarIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';

const sections = [
    {
        id: 'getting-started', icon: SparklesIcon, title: 'Memulai', color: 'emerald',
        items: [
            {
                id: 'register', title: 'Daftar Akun',
                content: [
                    { type: 'text', value: 'Buat akun gratis untuk mulai menggunakan Sarang Tumbuh. Ada dua cara untuk mendaftar:' },
                    {
                        type: 'features', value: [
                            { name: '📧 Via Email', desc: 'Isi nama, email, dan password di halaman Register' },
                            { name: '🔵 Via Google', desc: 'Klik "Login with Google" — langsung masuk tanpa perlu isi form' },
                        ]
                    },
                    {
                        type: 'steps', value: [
                            'Buka sarangtumbuh.com dan klik "Coba Gratis" atau "Mulai Gratis"',
                            'Pilih metode: isi form email/password ATAU klik "Login with Google"',
                            'Jika via Google, pilih akun Google-mu, sistem otomatis membuat akun',
                            'Kamu langsung masuk ke Dashboard dan bisa mulai produktif!',
                        ]
                    },
                    { type: 'tip', value: 'Paket Starter sudah termasuk semua fitur inti. Tidak perlu kartu kredit! Login via Google paling cepat — cuma 2 klik.' },
                ],
            },
            {
                id: 'dashboard', title: 'Memahami Dashboard',
                content: [
                    { type: 'text', value: 'Dashboard adalah pusat kendali produktivitasmu. Di sini kamu melihat semua yang penting dalam satu layar.' },
                    {
                        type: 'features', value: [
                            { name: 'Smart Focus 3', desc: 'Menampilkan 3 tugas prioritas harian yang dipilih oleh AI' },
                            { name: 'Streak Counter', desc: 'Menghitung hari berturut-turut kamu menyelesaikan minimal 1 tugas' },
                            { name: 'Level & XP Bar', desc: 'Progress gamification — naik level setiap kumpulkan cukup XP' },
                            { name: 'Quick Stats', desc: 'Ringkasan tugas selesai, waktu fokus, dan produktivitas harian' },
                            { name: 'AI Insight', desc: 'Saran cerdas dari AI berdasarkan pola kerjamu' },
                            { name: 'Stagnant Task Alert', desc: 'Peringatan untuk tugas yang tidak dikerjakan >3 hari' },
                        ]
                    },
                ],
            },
            {
                id: 'onboarding', title: 'Tutorial & Onboarding',
                content: [
                    { type: 'text', value: 'Saat pertama kali masuk, kamu akan disambut tutorial interaktif yang memandu cara menggunakan fitur-fitur utama step by step.' },
                    {
                        type: 'steps', value: [
                            'Companion (Kiko) akan menyapamu dan memperkenalkan diri',
                            'Kamu akan dipandu membuat tugas pertamamu',
                            'Tutorial menjelaskan Smart Focus, Timer, dan fitur lainnya',
                            'Setelah selesai, kamu siap produktif!',
                        ]
                    },
                    { type: 'tip', value: 'Tutorial bisa diakses ulang kapan saja dari menu Settings.' },
                ],
            },
        ],
    },
    {
        id: 'smart-focus', icon: BoltIcon, title: 'Smart Focus & Tugas', color: 'indigo',
        items: [
            {
                id: 'how-it-works', title: 'Cara Kerja Smart Focus',
                content: [
                    { type: 'text', value: 'Smart Focus membatasi tugas harianmu menjadi hanya 3 tugas terpenting. Berdasarkan riset produktivitas, fokus pada sedikit hal menghasilkan output lebih besar.' },
                    {
                        type: 'steps', value: [
                            'Setiap pagi, buka Dashboard',
                            'AI merekomendasikan 3 tugas berdasarkan deadline, prioritas, dan energi optimal',
                            'Kamu bisa menerima saran AI atau pilih manual',
                            'Fokus selesaikan satu per satu sepanjang hari',
                        ]
                    },
                    { type: 'warning', value: 'Kamu tidak bisa menambah lebih dari 3 tugas fokus dalam sehari. Ini by design supaya kamu tetap fokus dan tidak overwhelm!' },
                ],
            },
            {
                id: 'create-task', title: 'Membuat & Mengelola Tugas',
                content: [
                    { type: 'text', value: 'Buat tugas baru dengan detail yang membantu AI memahami konteks dan memprioritaskan tugasmu.' },
                    {
                        type: 'code', label: 'Field yang tersedia', value: `Judul          → Nama tugas (wajib)
Deskripsi      → Detail tambahan
Prioritas      → Low / Medium / High / Urgent
Deadline       → Tanggal batas waktu
Estimasi       → Perkiraan durasi (menit)
Tag            → Label kategori (bisa banyak)
Subtask        → Pecahan tugas yang lebih kecil` },
                    { type: 'text', value: 'AI akan otomatis menentukan prioritas berdasarkan deadline, kompleksitas, dan pola kerjamu. Kamu juga bisa meminta AI untuk memecah tugas besar menjadi subtask secara otomatis.' },
                    { type: 'tip', value: 'Gunakan fitur "AI Generate Subtasks" untuk memecah tugas kompleks. AI akan menganalisis judulmu dan membuat breakdown yang actionable!' },
                ],
            },
            {
                id: 'kanban', title: 'Kanban Board',
                content: [
                    { type: 'text', value: 'Kelola tugas secara visual dengan Kanban board. Drag and drop tugas antar kolom untuk mengubah statusnya.' },
                    {
                        type: 'features', value: [
                            { name: 'To Do', desc: 'Tugas yang belum dimulai' },
                            { name: 'In Progress', desc: 'Sedang dikerjakan' },
                            { name: 'Done', desc: 'Tugas yang sudah selesai — otomatis terhitung di XP' },
                        ]
                    },
                    { type: 'text', value: 'Cukup drag kartu tugas dari satu kolom ke kolom lain. Status otomatis ter-update dan XP dihitung saat tugas masuk ke "Done".' },
                ],
            },
        ],
    },
    {
        id: 'pomodoro', icon: ClockIcon, title: 'Pomodoro Timer', color: 'rose',
        items: [
            {
                id: 'timer-basics', title: 'Dasar Timer',
                content: [
                    { type: 'text', value: 'Teknik Pomodoro membantu kamu fokus dalam interval waktu tertentu, diselingi istirahat pendek untuk mencegah burnout.' },
                    {
                        type: 'code', label: 'Default Timer Settings', value: `Fokus         → 25 menit (bisa dikustomisasi)
Istirahat     → 5 menit
Long Break    → 15 menit (setiap 4 sesi)` },
                    {
                        type: 'steps', value: [
                            'Pilih tugas yang ingin dikerjakan dari Smart Focus',
                            'Klik tombol Play — timer mulai countdown',
                            'Fokus selama 25 menit tanpa gangguan',
                            'Istirahat 5 menit saat timer selesai',
                            'Ulangi — setiap 4 sesi, istirahat 15 menit (Long Break)',
                        ]
                    },
                    { type: 'text', value: 'Timer terintegrasi langsung dengan task management: saat timer selesai, progress otomatis dicatat.' },
                ],
            },
            {
                id: 'music', title: 'Music Player & Ambient Sound',
                content: [
                    { type: 'text', value: 'Sarang Tumbuh menyediakan musik ambient/lo-fi yang terintegrasi langsung. Musik mendukung fokus tanpa distraksi.' },
                    {
                        type: 'features', value: [
                            { name: 'Lo-Fi Playlist', desc: 'Musik rileks untuk fokus kerja/belajar' },
                            { name: 'Auto Play', desc: 'Musik otomatis saat timer mulai' },
                            { name: 'Volume Control', desc: 'Atur volume sesuai preferensi' },
                            { name: 'Background Play', desc: 'Musik tetap jalan meski minimize player' },
                        ]
                    },
                    { type: 'tip', value: 'Kamu bisa minimize music player ke pojok layar — musik tetap jalan di background saat kamu fokus.' },
                ],
            },
        ],
    },
    {
        id: 'guild', icon: UserGroupIcon, title: 'Guild System', color: 'teal',
        items: [
            {
                id: 'guild-overview', title: 'Apa itu Guild?',
                content: [
                    { type: 'text', value: 'Guild adalah tim produktivitas di Sarang Tumbuh. Mirip konsep \"party\" di game RPG — kalian bisa mengerjakan misi bersama, saling support, dan mendapatkan reward XP nyata yang bisa dicairkan.' },
                    {
                        type: 'features', value: [
                            { name: '👑 Role System', desc: 'Leader (pemilik guild) dan Member (anggota)' },
                            { name: '📋 Task Board', desc: 'Kanban board khusus guild untuk mengelola tugas bersama' },
                            { name: '🏆 Misi & Reward', desc: 'Leader membuat misi dengan XP reward yang bisa dicairkan jadi uang' },
                            { name: '💬 Guild Chat', desc: 'Komunikasi real-time antar anggota guild' },
                            { name: '📊 Report', desc: 'Analitik produktivitas guild secara keseluruhan' },
                            { name: '🏢 Divisi', desc: 'Bagi anggota ke divisi untuk organisasi yang lebih rapi' },
                        ]
                    },
                ],
            },
            {
                id: 'create-guild', title: 'Membuat & Bergabung Guild',
                content: [
                    { type: 'text', value: 'Kamu bisa membuat guild sendiri atau bergabung ke guild yang sudah ada.' },
                    {
                        type: 'code', label: 'Membuat Guild Baru', value: `1. Buka menu Guild dari sidebar
2. Klik "Buat Guild Baru"
3. Isi:
   - Nama Guild (wajib)
   - Deskripsi Guild
   - Emblem/Logo
4. Kamu otomatis jadi Leader` },
                    {
                        type: 'code', label: 'Bergabung Guild', value: `Cara 1: Undangan Langsung
→ Leader mengundang via email/username

Cara 2: Kode Guild  
→ Masukkan kode unik guild di halaman "Join Guild"
→ Kode dibagikan oleh Leader guild` },
                    { type: 'warning', value: 'Satu user hanya bisa bergabung di satu guild pada satu waktu. Untuk pindah guild, kamu harus leave guild saat ini dulu.' },
                ],
            },
            {
                id: 'guild-tasks', title: 'Sistem Tugas Guild',
                content: [
                    { type: 'text', value: 'Guild memiliki task board sendiri (Kanban). Semua anggota bisa melihat dan berkontribusi.' },
                    {
                        type: 'steps', value: [
                            'Member membuat tugas baru di board guild (status: "Proposal")',
                            'Leader me-review dan Approve / Reject proposal tugas',
                            'Tugas yang di-approve masuk ke board dan bisa dikerjakan',
                            'Member mengerjakan tugas dan update status (To Do → In Progress → Done)',
                            'Setiap tugas bisa punya komentar untuk diskusi',
                        ]
                    },
                    {
                        type: 'code', label: 'Status Approval', value: `pending    → Baru diajukan, belum di-review
approved   → Diterima oleh Leader, masuk board
rejected   → Ditolak oleh Leader` },
                    { type: 'tip', value: 'Leader bisa menambahkan catatan saat approve/reject proposal untuk memberi feedback ke member.' },
                ],
            },
            {
                id: 'guild-missions', title: 'Misi & XP Reward',
                content: [
                    { type: 'text', value: 'Misi adalah tugas spesial yang memiliki XP Reward. XP ini bisa dicairkan jadi uang nyata! Ada dua jenis misi:' },
                    {
                        type: 'code', label: 'Jenis Misi', value: `1. Misi Biasa (Challenge)
   → Leader buat langsung, set XP reward manual
   → XP diberikan saat misi selesai

2. Misi Funded (Mission dari Guild Economy)
   → Leader menggunakan saldo XP Guild
   → XP reward dipotong dari saldo guild
   → Memerlukan saldo guild yang cukup` },
                    { type: 'text', value: 'Saat misi 100% selesai (semua subtask approved & done), XP reward dibagi rata ke semua kontributor yang benar-benar menyelesaikan subtask.' },
                    {
                        type: 'code', label: 'Cara Kerja XP Split', value: `Total XP Reward    : 1000 XP
Kontributor        : 3 orang (A, B, C menyelesaikan subtask)
Member D           : tidak ada subtask selesai

Hasil:
├── User A  → 333 XP
├── User B  → 333 XP  
└── User C  → 334 XP (sisa 1 XP masuk ke kontributor terakhir)
    User D  → 0 XP (tidak kontribusi)` },
                    { type: 'warning', value: 'Hanya member yang menyelesaikan subtask (completed_by) yang mendapat bagian XP. Yang tidak berkontribusi tidak mendapatkan apa-apa.' },
                ],
            },
            {
                id: 'guild-divisions', title: 'Divisi Guild',
                content: [
                    { type: 'text', value: 'Untuk guild yang lebih besar, Leader bisa membuat divisi untuk mengorganisir anggota.' },
                    {
                        type: 'steps', value: [
                            'Leader buka halaman "Divisi" dari menu guild',
                            'Buat divisi baru (contoh: "Frontend", "Backend", "Design")',
                            'Assign member ke divisi yang sesuai',
                            'Member bisa melihat divisi mereka di profil guild',
                        ]
                    },
                    { type: 'tip', value: 'Divisi membantu organisasi terutama untuk tim proyek yang besar. Leader bisa assign member kapan saja.' },
                ],
            },
            {
                id: 'guild-chat', title: 'Guild Chat',
                content: [
                    { type: 'text', value: 'Setiap guild punya chat room untuk komunikasi antar anggota. Notifikasi sistem juga otomatis muncul di sini.' },
                    {
                        type: 'features', value: [
                            { name: 'Real-time Chat', desc: 'Kirim pesan instan ke anggota guild' },
                            { name: 'Auto Notification', desc: 'Sistem otomatis umumkan: tugas selesai, misi tuntas, member baru' },
                            { name: 'XP Announcement', desc: 'Detail distribusi XP otomatis di-post saat misi selesai' },
                        ]
                    },
                ],
            },
            {
                id: 'focus-nexus', title: 'Focus Nexus (Co-working)',
                content: [
                    { type: 'text', value: 'Focus Nexus adalah ruang co-working virtual di dalam guild. Kamu bisa melihat siapa yang sedang fokus bersama secara real-time.' },
                    { type: 'text', value: 'Fitur ini memberikan efek "body doubling" — kamu lebih termotivasi saat tahu ada teman yang juga sedang kerja di waktu yang sama.' },
                ],
            },
            {
                id: 'guild-report', title: 'Guild Report & Analytics',
                content: [
                    { type: 'text', value: 'Leader dan member bisa melihat report analitik guild: total tugas selesai, kontributor terbanyak, dan progress mingguan.' },
                    {
                        type: 'features', value: [
                            { name: 'Task Distribution', desc: 'Siapa yang paling banyak menyelesaikan tugas' },
                            { name: 'Weekly Progress', desc: 'Grafik produktivitas mingguan guild' },
                            { name: 'XP Earned', desc: 'Total XP yang sudah diraih anggota' },
                        ]
                    },
                ],
            },
        ],
    },
    {
        id: 'economy', icon: CurrencyDollarIcon, title: 'Ekonomi & Cashout', color: 'amber',
        items: [
            {
                id: 'guild-economy', title: 'Saldo XP Guild',
                content: [
                    { type: 'text', value: 'Setiap Guild memiliki saldo XP yang bisa digunakan untuk membuat misi berbayar (funded mission). Leader bisa top up saldo guild.' },
                    {
                        type: 'code', label: 'Rate Top Up', value: `100 XP = Rp 1.000
500 XP = Rp 5.000
1000 XP = Rp 10.000
(dan seterusnya, kelipatan 100 XP)` },
                    {
                        type: 'steps', value: [
                            'Leader buka halaman Wallet/Economy guild',
                            'Masukkan jumlah XP yang ingin dibeli (minimum 100 XP)',
                            'Sistem menghitung harga otomatis',
                            'Bayar via Midtrans (GoPay, OVO, Bank Transfer, dll)',
                            'Setelah pembayaran sukses, saldo guild bertambah',
                        ]
                    },
                    { type: 'warning', value: 'Hanya Leader yang bisa melakukan top up saldo guild.' },
                ],
            },
            {
                id: 'cashout', title: 'Cashout XP ke Uang',
                content: [
                    { type: 'text', value: 'XP yang kamu dapatkan dari menyelesaikan misi guild (redeemable XP) bisa dicairkan menjadi uang nyata!' },
                    {
                        type: 'code', label: 'Ketentuan Cashout', value: `Rate XP        → 100 XP = Rp 1.000
Admin Fee      → 3% dari total IDR
Min. Cashout   → 100 XP (Rp 1.000)
Proses         → 2x24 jam kerja
Status         → pending → processed/rejected` },
                    {
                        type: 'steps', value: [
                            'Buka Wallet di halaman Guild',
                            'Masukkan jumlah XP yang ingin dicairkan',
                            'Pilih metode pembayaran: Bank Transfer, GoPay, OVO, ShopeePay, DANA, dll',
                            'Isi nomor rekening/akun dan nama pemilik (harus benar!)',
                            'Klik "Ajukan Pencairan" — request masuk ke admin',
                            'Admin memverifikasi dan memproses dalam 2x24 jam',
                            'Uang masuk ke rekening/e-wallet kamu',
                        ]
                    },
                    {
                        type: 'code', label: 'Contoh Perhitungan', value: `Cashout     : 1000 XP
Nilai       : Rp 10.000
Fee 3%      : Rp 300
Yang Diterima: Rp 9.700` },
                    { type: 'warning', value: 'Pastikan nomor rekening dan nama pemilik benar. Jika ditolak admin, XP akan dikembalikan ke saldo redeemable-mu.' },
                ],
            },
            {
                id: 'funded-mission', title: 'Membuat Misi Funded',
                content: [
                    { type: 'text', value: 'Leader bisa membuat misi yang "dibiayai" dari saldo XP guild. Ini membuat reward misi bersifat nyata.' },
                    {
                        type: 'steps', value: [
                            'Pastikan saldo XP guild cukup (top up jika perlu)',
                            'Buka task board guild dan pilih "Buat Misi Funded"',
                            'Isi judul, deskripsi, dan XP reward yang ingin diberikan',
                            'Set deadline dan assign ke member tertentu (opsional)',
                            'XP reward langsung dipotong dari saldo guild',
                            'Member mengerjakan misi → selesai → XP diberikan ke kontributor',
                        ]
                    },
                    { type: 'tip', value: 'Misi funded cocok untuk proyek nyata: freelance, tugas organisasi, atau challenge antar teman dengan insentif uang.' },
                ],
            },
        ],
    },
    {
        id: 'gamification', icon: TrophyIcon, title: 'Gamification', color: 'violet',
        items: [
            {
                id: 'xp-system', title: 'Sistem XP & Level',
                content: [
                    { type: 'text', value: 'XP (Experience Points) adalah mata uang produktivitas. Ada dua jenis XP di Sarang Tumbuh:' },
                    {
                        type: 'code', label: 'Jenis XP', value: `1. XP Personal
   → Dari menyelesaikan tugas pribadi
   → Menaikkan level & unlock achievements
   → TIDAK bisa dicairkan

2. Redeemable XP  
   → Dari menyelesaikan misi guild
   → BISA dicairkan jadi uang nyata
   → Tetap menaikkan level juga` },
                    {
                        type: 'code', label: 'Sumber XP', value: `Selesaikan Tugas       → +10-50 XP
Misi Guild Selesai     → Dibagi rata ke kontributor
Challenge Harian       → Bervariasi
Streak Bonus           → Bonus kumulatif sesuai hari` },
                ],
            },
            {
                id: 'streak', title: 'Streak & Konsistensi',
                content: [
                    { type: 'text', value: 'Streak menghitung hari berturut-turut kamu menyelesaikan minimal 1 tugas. Streak yang panjang = bonus XP lebih besar.' },
                    {
                        type: 'features', value: [
                            { name: '🔥 Daily Streak', desc: 'Hari berturut-turut produktif' },
                            { name: '📈 Streak Bonus', desc: 'Makin panjang streak, makin besar bonus XP harian' },
                            { name: '💔 Streak Break', desc: 'Miss 1 hari saja, streak reset ke 0' },
                        ]
                    },
                    { type: 'tip', value: 'Cukup selesaikan 1 tugas kecil per hari untuk mempertahankan streak!' },
                ],
            },
            {
                id: 'challenges', title: 'Challenge & Achievements',
                content: [
                    { type: 'text', value: 'Selain tugas harian, ada tantangan (challenges) dan pencapaian (achievements) untuk menambah motivasi.' },
                    {
                        type: 'features', value: [
                            { name: 'Daily Challenges', desc: 'Tantangan harian yang di-refresh otomatis' },
                            { name: 'Achievements', desc: 'Badge permanen saat kamu mencapai milestone tertentu' },
                            { name: 'Leaderboard', desc: 'Peringkat global — kompetisi dengan pengguna lain' },
                        ]
                    },
                    { type: 'text', value: 'Buka halaman Gamification Dashboard untuk melihat semua challenge aktif, progress achievement, dan posisimu di leaderboard.' },
                ],
            },
            {
                id: 'rescue', title: 'AI Rescue',
                content: [
                    { type: 'text', value: 'Saat kamu kewalahan, fitur AI Rescue bisa membantu otomatis. Ada dua mode rescue:' },
                    {
                        type: 'features', value: [
                            { name: '🔨 Breakdown', desc: 'AI memecah tugas besar yang menakutkan menjadi subtask-subtask kecil yang actionable' },
                            { name: '📅 Reschedule', desc: 'AI menggeser tugas-tugas yang tidak sempat dikerjakan ke hari berikutnya secara cerdas' },
                        ]
                    },
                    { type: 'text', value: 'AI Rescue dipicu oleh Companion (Kiko) saat mendeteksi kamu membutuhkan bantuan.' },
                ],
            },
        ],
    },
    {
        id: 'companion', icon: ChatBubbleLeftEllipsisIcon, title: 'Smart Companion', color: 'sky',
        items: [
            {
                id: 'kiko', title: 'Tentang Kiko',
                content: [
                    { type: 'text', value: 'Kiko adalah asisten virtual pixel art yang menemani sesi kerjamu. Dia cerdas, peka konteks, dan bisa membantu kamu tetap produktif.' },
                    {
                        type: 'features', value: [
                            { name: '🎯 Task Reminder', desc: 'Mengingatkan tugas yang belum dikerjakan' },
                            { name: '🛡️ Focus Guard', desc: 'Peringatan saat kamu kehilangan fokus' },
                            { name: '🎉 Celebration', desc: 'Merayakan setiap pencapaianmu' },
                            { name: '💡 Smart Suggestion', desc: 'Saran berdasarkan pola kerja — tugas mana yang cocok dimulai' },
                            { name: '🆘 Rescue Mode', desc: 'Menawarkan AI Rescue saat kamu kewalahan' },
                            { name: '📊 Daily Briefing', desc: 'Ringkasan produktivitas harianmu' },
                        ]
                    },
                    { type: 'tip', value: 'Kiko berevolusi seiring levelmu naik — desain pixel art-nya berubah semakin keren!' },
                ],
            },
            {
                id: 'ai-assistant', title: 'AI Chat Assistant',
                content: [
                    { type: 'text', value: 'Selain Kiko, ada AI Chat Assistant yang bisa menjawab pertanyaan, membantu brainstorming, dan menyelesaikan soal matematika langkah demi langkah.' },
                    {
                        type: 'features', value: [
                            { name: 'Chat AI', desc: 'Tanya apa saja — seperti ChatGPT tapi di dalam app' },
                            { name: 'Math Solver', desc: 'Upload soal matematika, AI jawab step by step dengan LaTeX rendering' },
                            { name: 'Context Aware', desc: 'AI tahu tugas-tugasmu dan bisa memberi saran yang relevan' },
                        ]
                    },
                ],
            },
        ],
    },
    {
        id: 'affiliate', icon: ShareIcon, title: 'Program Affiliate', color: 'orange',
        items: [
            {
                id: 'affiliate-overview', title: 'Cara Kerja Affiliate',
                content: [
                    { type: 'text', value: 'Sarang Tumbuh memiliki program affiliate yang memungkinkanmu mendapatkan komisi dari setiap referral yang berlangganan plan premium.' },
                    {
                        type: 'steps', value: [
                            'Buka menu Affiliate dari sidebar',
                            'Klik "Generate Kode Affiliate" (satu akun = satu kode)',
                            'Sistem otomatis membuat kode unik berdasarkan namamu',
                            'Bagikan kode atau link affiliate ke orang lain',
                            'Saat mereka daftar menggunakan kode dan subscribe premium → kamu dapat komisi!',
                        ]
                    },
                ],
            },
            {
                id: 'affiliate-dashboard', title: 'Dashboard Affiliate',
                content: [
                    { type: 'text', value: 'Pantau performa affiliate-mu di dashboard khusus.' },
                    {
                        type: 'features', value: [
                            { name: 'Total Referrals', desc: 'Jumlah orang yang pakai kode-mu' },
                            { name: 'Completed Referrals', desc: 'Referral yang sudah subscribe premium' },
                            { name: 'Total Komisi', desc: 'Saldo affiliate balance yang bisa kamu cairkan' },
                            { name: 'Referral List', desc: 'Daftar lengkap siapa saja yang menggunakan kode-mu' },
                        ]
                    },
                    { type: 'tip', value: 'Kode affiliate hanya bisa di-generate sekali. Simpan baik-baik dan bagikan secara aktif untuk mendapat passive income!' },
                ],
            },
        ],
    },
    {
        id: 'subscription', icon: CreditCardIcon, title: 'Plan & Langganan', color: 'purple',
        items: [
            {
                id: 'plans', title: 'Pilihan Plan',
                content: [
                    { type: 'text', value: 'Sarang Tumbuh menyediakan beberapa plan dengan fitur yang berbeda. Semua pengguna baru otomatis mendapatkan paket Starter.' },
                    {
                        type: 'features', value: [
                            { name: '🆓 Starter (Gratis)', desc: 'Fitur dasar: Smart Focus, Pomodoro Timer, Kanban' },
                            { name: '⭐ Pro', desc: 'Fitur lengkap: Guild, Gamification, AI Assistant, Music' },
                            { name: '💎 Premium', desc: 'Semua fitur Pro + prioritas support + fitur eksklusif' },
                        ]
                    },
                    { type: 'text', value: 'Detail harga dan fitur selengkapnya bisa dilihat di halaman Pricing pada landing page.' },
                ],
            },
            {
                id: 'payment', title: 'Pembayaran',
                content: [
                    { type: 'text', value: 'Pembayaran diproses secara aman melalui Midtrans. Berbagai metode pembayaran tersedia:' },
                    {
                        type: 'features', value: [
                            { name: '💳 Bank Transfer', desc: 'BCA, BNI, BRI, Mandiri, dll' },
                            { name: '📱 E-Wallet', desc: 'GoPay, OVO, ShopeePay, DANA' },
                            { name: '🏪 Retail', desc: 'Alfamart, Indomaret' },
                            { name: '💲 Kartu Kredit', desc: 'Visa, Mastercard' },
                        ]
                    },
                    {
                        type: 'steps', value: [
                            'Pilih plan yang diinginkan',
                            'Masukkan kode promo jika ada (untuk diskon)',
                            'Pilih metode pembayaran',
                            'Selesaikan pembayaran di halaman Midtrans',
                            'Plan aktif otomatis setelah pembayaran berhasil',
                        ]
                    },
                ],
            },
            {
                id: 'promo', title: 'Kode Promo',
                content: [
                    { type: 'text', value: 'Kamu bisa menggunakan kode promo untuk mendapatkan diskon saat checkout plan premium.' },
                    {
                        type: 'steps', value: [
                            'Saat memilih plan, klik "Punya Kode Promo?"',
                            'Masukkan kode promo dan klik "Apply"',
                            'Sistem memvalidasi kode dan menampilkan diskon',
                            'Harga otomatis berkurang sesuai promo',
                        ]
                    },
                    { type: 'warning', value: 'Setiap kode promo memiliki batas penggunaan dan tanggal kedaluwarsa. Jika kode sudah habis atau expired, sistem akan memberitahu.' },
                ],
            },
            {
                id: 'upgrade', title: 'Upgrade Plan',
                content: [
                    { type: 'text', value: 'Sudah punya plan aktif tapi ingin fitur lebih? Kamu bisa upgrade kapan saja.' },
                    { type: 'text', value: 'Saat upgrade, sisa hari dari plan lama akan diperhitungkan secara proporsional. Kamu hanya membayar selisihnya.' },
                    { type: 'tip', value: 'Upgrade bisa dilakukan langsung dari Dashboard → klik banner upgrade atau dari halaman Settings.' },
                ],
            },
        ],
    },
    {
        id: 'whatsapp', icon: ChatBubbleLeftEllipsisIcon, title: 'WhatsApp Reminder', color: 'green',
        items: [
            {
                id: 'wa-setup', title: 'Setup & Jenis Reminder',
                content: [
                    { type: 'text', value: 'Sarang Tumbuh bisa mengirim pengingat langsung ke WhatsApp-mu via Fonnte. Pesan bersifat personal dan kontekstual.' },
                    {
                        type: 'steps', value: [
                            'Buka Settings / Profil',
                            'Masukkan nomor WhatsApp aktif (format 628xxx)',
                            'Aktifkan toggle "WhatsApp Reminder"',
                            'Pilih jenis reminder yang kamu inginkan',
                        ]
                    },
                    {
                        type: 'features', value: [
                            { name: '📚 Study Reminder', desc: 'Pengingat untuk belajar sesuai jadwal' },
                            { name: '⏰ Deadline Alert', desc: 'H-1 dan H-3jam sebelum deadline tugas' },
                            { name: '🔄 Habit Reminder', desc: 'Pengingat kebiasaan rutin' },
                            { name: '👋 Comeback', desc: 'Pesan ramah saat lama tidak login' },
                            { name: '🔥 Motivation', desc: 'Pesan semangat harian untuk menjaga ritme' },
                        ]
                    },
                    { type: 'tip', value: 'Semua pesan di-generate AI agar terasa personal dan tidak seperti spam. Setiap pesan unik dan sesuai konteks tugasmu.' },
                ],
            },
        ],
    },
    {
        id: 'learning-hub', icon: BookOpenIcon, title: 'Learning Hub', color: 'cyan',
        items: [
            {
                id: 'mini-modul', title: 'Mini Modul',
                content: [
                    { type: 'text', value: 'Learning Hub berisi perpustakaan materi produktivitas, manajemen waktu, dan skill development. Konten dikurasi dan di-update berkala.' },
                    {
                        type: 'features', value: [
                            { name: '📖 Modul Terstruktur', desc: 'Materi dipecah jadi chapter-chapter yang mudah dicerna' },
                            { name: '🧠 AI Explanation', desc: 'Butuh penjelasan lebih? AI bisa menjelaskan materi dengan bahasa yang lebih simpel' },
                            { name: '📂 Kategori', desc: 'Modul dikelompokkan berdasarkan topik: Produktivitas, Study Tips, dll' },
                            { name: '📝 Quiz', desc: 'Uji pemahaman setelah membaca modul' },
                        ]
                    },
                ],
            },
        ],
    },
];

const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', gradient: 'from-emerald-500 to-teal-500' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', gradient: 'from-indigo-500 to-violet-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', gradient: 'from-rose-500 to-pink-500' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', gradient: 'from-teal-500 to-cyan-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', gradient: 'from-amber-500 to-orange-500' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', gradient: 'from-violet-500 to-purple-500' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', gradient: 'from-green-500 to-emerald-500' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200', gradient: 'from-sky-500 to-blue-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', gradient: 'from-orange-500 to-red-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-500 to-fuchsia-500' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', gradient: 'from-cyan-500 to-blue-500' },
};

const ContentBlock = ({ block, color }) => {
    const c = colorMap[color];
    switch (block.type) {
        case 'text':
            return <p className="text-slate-600 text-[15px] leading-relaxed">{block.value}</p>;
        case 'steps':
            return (
                <div className="space-y-2.5 my-1">
                    {block.value.map((step, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${c.gradient} text-white text-xs font-bold flex items-center justify-center mt-0.5 shadow-sm`}>{i + 1}</span>
                            <span className="text-slate-600 text-sm leading-relaxed pt-0.5">{step}</span>
                        </div>
                    ))}
                </div>
            );
        case 'code':
            return (
                <div className="my-1">
                    {block.label && <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{block.label}</div>}
                    <pre className="bg-slate-900 text-slate-300 text-[13px] p-5 rounded-2xl overflow-x-auto font-mono leading-relaxed border border-slate-800 shadow-inner">
                        <code>{block.value}</code>
                    </pre>
                </div>
            );
        case 'features':
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
                    {block.value.map((f, i) => (
                        <div key={i} className={`p-4 rounded-xl ${c.bg} border ${c.border} transition-all hover:shadow-md`}>
                            <div className={`font-bold text-sm ${c.text}`}>{f.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{f.desc}</div>
                        </div>
                    ))}
                </div>
            );
        case 'tip':
            return (
                <div className="flex gap-3 items-start p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <SparklesIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-emerald-700 font-medium">{block.value}</span>
                </div>
            );
        case 'warning':
            return (
                <div className="flex gap-3 items-start p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <BoltIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-amber-700 font-medium">{block.value}</span>
                </div>
            );
        default:
            return null;
    }
};

export default function Learn() {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [activeItem, setActiveItem] = useState('register');
    const [search, setSearch] = useState('');
    const [mobileNav, setMobileNav] = useState(false);

    const currentSection = sections.find(s => s.id === activeSection);
    const currentItem = currentSection?.items.find(it => it.id === activeItem);

    const allItems = sections.flatMap(s => s.items.map(it => ({ ...it, sectionId: s.id, sectionTitle: s.title, color: s.color })));
    const filteredItems = search
        ? allItems.filter(it => it.title.toLowerCase().includes(search.toLowerCase()) || it.content.some(c => c.value && JSON.stringify(c.value).toLowerCase().includes(search.toLowerCase())))
        : [];

    const handleNav = (sectionId, itemId) => {
        setActiveSection(sectionId);
        setActiveItem(itemId);
        setSearch('');
        setMobileNav(false);
    };

    useEffect(() => {
        const sec = sections.find(s => s.id === activeSection);
        if (sec && !sec.items.find(it => it.id === activeItem)) {
            setActiveItem(sec.items[0]?.id);
        }
    }, [activeSection]);

    return (
        <div className="min-h-screen bg-[#FAFBFC] text-slate-900 antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <Head title="Docs — Panduan Lengkap Sarang Tumbuh" />

            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-100">
                <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-lg font-[800] text-slate-900 tracking-tight flex items-center gap-2">
                            <span className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/25">S</span>
                            <span className="hidden md:inline">Sarang Tumbuh</span>
                        </Link>
                        <span className="text-slate-300 hidden sm:inline">|</span>
                        <span className="text-sm font-bold text-slate-500 hidden sm:flex items-center gap-1.5">
                            <BookOpenIcon className="w-4 h-4" /> Dokumentasi Lengkap
                        </span>
                    </div>
                    <div className="relative flex-1 max-w-sm mx-4">
                        <MagnifyingGlassIcon className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari panduan..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all" />
                        {search && filteredItems.length > 0 && (
                            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-64 overflow-y-auto">
                                {filteredItems.map((item) => (
                                    <button key={item.id} onClick={() => handleNav(item.sectionId, item.id)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                        <div className="text-sm font-bold text-slate-900">{item.title}</div>
                                        <div className="text-xs text-slate-400">{item.sectionTitle}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/" className="hidden md:block px-4 py-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">Beranda</Link>
                        <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-2">
                            {mobileNav ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex pt-14">
                <aside className={`fixed md:sticky top-14 left-0 z-40 w-72 h-[calc(100vh-3.5rem)] bg-white border-r border-slate-100 overflow-y-auto py-6 px-4 transition-transform duration-300 ${mobileNav ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4 px-3">Panduan</div>
                    <nav className="space-y-0.5">
                        {sections.map((section) => {
                            const c = colorMap[section.color];
                            const isActive = activeSection === section.id;
                            return (
                                <div key={section.id}>
                                    <button onClick={() => { setActiveSection(section.id); setActiveItem(section.items[0]?.id); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-bold ${isActive ? `${c.bg} ${c.text}` : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                                        <section.icon className="w-4 h-4 flex-shrink-0" />
                                        {section.title}
                                    </button>
                                    {isActive && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                            className="ml-7 mt-1 space-y-0.5 border-l-2 border-slate-100 pl-3 overflow-hidden">
                                            {section.items.map((item) => (
                                                <button key={item.id} onClick={() => { setActiveItem(item.id); setMobileNav(false); }}
                                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeItem === item.id ? `${c.text} ${c.bg} font-bold` : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                                                    {item.title}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </aside>

                <main className="flex-1 min-h-[calc(100vh-3.5rem)] px-6 md:px-12 py-10 max-w-4xl">
                    {currentItem && (
                        <AnimatePresence mode="wait">
                            <motion.div key={activeItem} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
                                    <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
                                    <ChevronRightIcon className="w-3 h-3" />
                                    <span>Docs</span>
                                    <ChevronRightIcon className="w-3 h-3" />
                                    <span className={colorMap[currentSection.color].text}>{currentSection.title}</span>
                                    <ChevronRightIcon className="w-3 h-3" />
                                    <span className="text-slate-600">{currentItem.title}</span>
                                </div>
                                <div className="mb-8">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${colorMap[currentSection.color].bg} ${colorMap[currentSection.color].text} text-[10px] font-bold uppercase tracking-widest mb-3`}>
                                        <currentSection.icon className="w-3 h-3" />
                                        {currentSection.title}
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-[900] tracking-tight text-slate-900">{currentItem.title}</h1>
                                </div>
                                <div className="space-y-5">
                                    {currentItem.content.map((block, i) => <ContentBlock key={i} block={block} color={currentSection.color} />)}
                                </div>
                                <div className="mt-12 pt-8 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        {(() => {
                                            const allFlat = sections.flatMap(s => s.items.map(it => ({ ...it, sectionId: s.id })));
                                            const idx = allFlat.findIndex(it => it.id === activeItem);
                                            const prev = idx > 0 ? allFlat[idx - 1] : null;
                                            const next = idx < allFlat.length - 1 ? allFlat[idx + 1] : null;
                                            return (
                                                <>
                                                    {prev ? (
                                                        <button onClick={() => handleNav(prev.sectionId, prev.id)} className="text-left group">
                                                            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Sebelumnya</div>
                                                            <div className="text-sm font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">← {prev.title}</div>
                                                        </button>
                                                    ) : <div />}
                                                    {next ? (
                                                        <button onClick={() => handleNav(next.sectionId, next.id)} className="text-right group">
                                                            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Selanjutnya</div>
                                                            <div className="text-sm font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">{next.title} →</div>
                                                        </button>
                                                    ) : <div />}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </main>
            </div>


        </div>
    );
}
