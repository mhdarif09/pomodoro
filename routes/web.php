<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Auth\GoogleLoginController;
use App\Http\Controllers\VoiceController;
use App\Http\Controllers\Admin\PromoController;
use App\Http\Controllers\AffiliateController;
use App\Http\Controllers\OnboardingController;

use App\Http\Controllers\ReflectionController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\MiniModulCategoryController;
use App\Http\Controllers\Admin\MiniModulController as AdminMiniModulController;
use App\Http\Controllers\Admin\MiniModulChapterController;
use App\Http\Controllers\MiniModulController;
use App\Http\Controllers\Api\MiniModulAiController;
use App\Http\Controllers\DocumentPageController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\GamificationController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// --- PUBLIC ROUTES ---
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        // Inject plans for pricing section
        'plans' => \App\Models\Plan::where('is_active', true)->orderBy('price')->get(),
    ]);
});

Route::get('/reviews', function () {
    return Inertia::render('Reviews');
})->name('reviews');

Route::get('/collaborate', [\App\Http\Controllers\CollaborationController::class, 'create'])->name('collaborate.create');
Route::post('/collaborate', [\App\Http\Controllers\CollaborationController::class, 'store'])->name('collaborate.store');

Route::get('/learn', function () {
    return Inertia::render('Learn');
})->name('learn');

Route::get('/products/{slug}', function ($slug) {
    // Rich Data for Modern Product Pages
    $products = [
        'focus-timer' => [
            'title' => 'Focus Timer',
            'subtitle' => 'Kuasai waktumu, bukan sebaliknya.',
            'description' => 'Teknik Pomodoro yang disempurnakan dengan ambient sound, task blocking, dan analitik mendalam untuk membawamu ke state "Flow" dalam hitungan menit.',
            'deep_dive' => [
                [
                    'title' => 'Lebih Dari Sekadar Timer',
                    'content' => 'Timer biasa hanya menghitung mundur. Focus Timer kami dirancang untuk memicu *Flow State*. Dengan durasi yang bisa dikustomisasi, Anda bisa menyesuaikan ritme kerja dengan energi tubuh Anda. Apakah itu 25 menit klasik atau 90 menit *deep work*, kami mendukung semuanya.',
                    'visual' => 'timer-loop',
                    'orientation' => 'right'
                ],
                [
                    'title' => 'Distraction Blocker',
                    'content' => 'Musuh terbesar produktivitas adalah gangguan. Saat sesi fokus dimulai, sistem kami secara otomatis memblokir notifikasi non-esensial dan mengaktifkan mode "Do Not Disturb" visual pada dashboard Anda. Teman di Guild juga akan melihat status Anda sebagai "Focusing", sehingga mereka tahu untuk tidak mengganggu.',
                    'visual' => 'notification-shield',
                    'orientation' => 'left'
                ],
                [
                    'title' => 'Soundscapes yang Menenangkan',
                    'content' => 'Bekerja dalam keheningan total kadang justru membuat pikiran melayang. Pilih dari berbagai *ambient sounds* berkualitas tinggi: rintik hujan, suasana kafe, *white noise*, atau *binaural beats* yang terbukti secara ilmiah meningkatkan konsentrasi.',
                    'visual' => 'sound-wave',
                    'orientation' => 'right'
                ]
            ],
            'benefits' => [
                'Meningkatkan durasi fokus rata-rata 40%',
                'Mengurangi kelelahan mental dengan istirahat teratur',
                'Visualisasi progres harian yang memuaskan',
                'Integrasi langsung dengan Task Manager'
            ],
            'features' => [
                ['title' => 'Custom Intervals', 'desc' => 'Sesuaikan durasi fokus dan istirahat sesuai ritme tubuhmu.', 'icon' => 'clock', 'span' => 'col-span-1 md:col-span-2'],
                ['title' => 'Analitik Harian', 'desc' => 'Lihat jam produktifmu dan pola kerjamu dalam grafik.', 'icon' => 'chart', 'span' => 'col-span-1'],
                ['title' => 'Task Sync', 'desc' => 'Timer terhubung langsung dengan to-do list aktifmu.', 'icon' => 'sync', 'span' => 'col-span-1'],
                ['title' => 'Ambient Modes', 'desc' => 'Hujan, Kafe, Hutan. Pilih suaramu.', 'icon' => 'sound', 'span' => 'col-span-1'],
                ['title' => 'Distraction Free', 'desc' => 'Mode layar penuh yang memblokir gangguan.', 'icon' => 'shield', 'span' => 'col-span-1 md:col-span-2'],
            ]
        ],
        'guild-system' => [
            'title' => 'Guild System',
            'subtitle' => 'Produktif bareng squad, bukan sendirian.',
            'description' => 'Ubah "kerja sendirian" menjadi petualangan multiplayer. Bergabunglah dengan Guild, selesaikan misi bersama, dan saling menyemangati untuk mencapai target.',
            'deep_dive' => [
                [
                    'title' => 'Temukan Tribe Kamu',
                    'content' => 'Entah kamu developer, penulis, desainer, atau mahasiswa, ada Guild untukmu. Bergabung dengan orang-orang yang memiliki *goals* serupa membuat perjalanan produktivitas terasa lebih ringan dan menyenangkan.',
                    'visual' => 'guild-network',
                    'orientation' => 'right'
                ],
                [
                    'title' => 'Accountability Partner Otomatis',
                    'content' => 'Susah konsisten kalau nggak ada yang lihat? Di Guild, setiap sesi fokus yang kamu selesaikan menyumbang poin untuk tim. Rasa tanggung jawab bersama ini adalah motivator terkuat untuk tidak menunda-nunda.',
                    'visual' => 'accountability-chart',
                    'orientation' => 'left'
                ],
                [
                    'title' => 'Leaderboard & Kompetisi Sehat',
                    'content' => 'Pacu semangatmu dengan melihat progres teman-temanmu secara *real-time*. Bukan untuk saling menjatuhkan, tapi untuk saling menginspirasi "Kalau dia bisa fokus 4 jam hari ini, aku juga bisa!"',
                    'visual' => 'leaderboard-medal',
                    'orientation' => 'right'
                ]
            ],
            'benefits' => [
                'Tidak pernah merasa kesepian saat bekerja remote',
                'Motivasi eksternal yang kuat dari rekan satu tim',
                'Gamifikasi yang membuat kerja terasa seperti main RPG',
                'Belajar tips produktivitas dari member lain'
            ],
            'features' => [
                ['title' => 'Squad Goals', 'desc' => 'Set target mingguan bersama tim.', 'icon' => 'target', 'span' => 'col-span-1 md:col-span-2'],
                ['title' => 'Live Status', 'desc' => 'Lihat siapa yang sedang online dan fokus.', 'icon' => 'live', 'span' => 'col-span-1'],
                ['title' => 'Guild Chat', 'desc' => 'Diskusi santai saat istirahat.', 'icon' => 'chat', 'span' => 'col-span-1'],
                ['title' => 'Weekly Boss', 'desc' => 'Tantangan besar di akhir pekan.', 'icon' => 'fire', 'span' => 'col-span-1 md:col-span-2'],
                ['title' => 'Badges', 'desc' => 'Koleksi prestasi unik.', 'icon' => 'badge', 'span' => 'col-span-1'],
            ]
        ],
        'smart-companion' => [
            'title' => 'Smart Companion',
            'subtitle' => 'Asisten pribadi 24/7 yang mengerti kamu.',
            'description' => 'Kiko bukan sekadar maskot pixel art. Dia adalah teman cerdas yang mengerti kebiasaanmu, mengingatkan saat lupa, dan menyemangati saat lelah.',
            'deep_dive' => [
                [
                    'title' => 'Peka Konteks (Context Aware)',
                    'content' => 'Kiko tahu kapan kamu baru mulai hari, kapan kamu sedang *deep work*, dan kapan kamu sudah bekerja terlalu lama dan butuh istirahat. Dia tidak akan mengganggumu dengan notifikasi tidak penting saat kamu sedang fokus.',
                    'visual' => 'text-bubble-smart',
                    'orientation' => 'right'
                ],
                [
                    'title' => 'Personalized Encouragement',
                    'content' => 'Setiap orang butuh motivasi berbeda. Kiko belajar dari pola kerjamu. Apakah kamu butuh disemangati dengan lembut, atau butuh "teguran" tegas untuk mulai bekerja? Kiko akan menyesuaikan gaya komunikasinya.',
                    'visual' => 'mood-grid',
                    'orientation' => 'left'
                ],
                [
                    'title' => 'Morning Briefing & Night Review',
                    'content' => 'Mulai harimu dengan ringkasan target dari Kiko, dan akhiri dengan *review* pencapaian. Kiko membantu kamu menutup hari dengan perasaan puas dan *clutter-free brain*.',
                    'visual' => 'stats-card',
                    'orientation' => 'right'
                ]
            ],
            'benefits' => [
                'Merasa ditemani saat bekerja sendirian',
                'Pengingat istirahat untuk mencegah burnout',
                'Interaksi yang menyenangkan dan tidak kaku',
                'Meningkatkan awareness terhadap kebiasaan kerja'
            ],
            'features' => [
                ['title' => 'Dynamic Mood', 'desc' => 'Ekspresi Kiko berubah sesuai status kerjamu.', 'icon' => 'emoji', 'span' => 'col-span-1 md:col-span-2'],
                ['title' => 'Interactive', 'desc' => 'Klik Kiko untuk mendapatkan tips instan.', 'icon' => 'touch', 'span' => 'col-span-1'],
                ['title' => 'Habit Tracker', 'desc' => 'Mencatat streak produktivitas otomatis.', 'icon' => 'chart', 'span' => 'col-span-1'],
                ['title' => 'Sleep Mode', 'desc' => 'Kiko ikut tidur saat kamu istirahat.', 'icon' => 'moon', 'span' => 'col-span-1'],
                ['title' => 'Level Up', 'desc' => 'Kiko berevolusi seiring progresmu.', 'icon' => 'star', 'span' => 'col-span-1 md:col-span-2'],
            ]
        ],
        'learning-hub' => [
            'title' => 'Learning Hub',
            'subtitle' => 'Perpustakaan ilmu produktivitas.',
            'description' => 'Akses eksklusif ke ratusan artikel, video, dan panduan praktis tentang manajemen waktu, psikologi fokus, dan *habit building* yang dikurasi oleh para ahli.',
            'deep_dive' => [
                ['title' => 'Kurikulum Terstruktur', 'content' => 'Belajar produktivitas bukan sekadar baca tips random. Kami menyusun jalur belajar dari pemula hingga master *deep work*.', 'visual' => 'course-structure', 'orientation' => 'right'],
                ['title' => 'Studi Kasus Nyata', 'content' => 'Pelajari bagaimana orang-orang sukses mengatur waktu mereka. Bukan teori, tapi taktik yang bisa langsung kamu tiru.', 'visual' => 'case-study', 'orientation' => 'left'],
            ],
            'benefits' => ['Hemat waktu riset metode produktivitas', 'Materi yang valid dan teruji', 'Akses offline di aplikasi mobile', 'Update konten setiap minggu'],
            'features' => [
                ['title' => 'Video Courses', 'desc' => 'Tutorial langkah demi langkah.', 'icon' => 'video', 'span' => 'col-span-2'],
                ['title' => 'Cheat Sheets', 'desc' => 'Rangkuman visual metode populer.', 'icon' => 'badge', 'span' => 'col-span-1'],
                ['title' => 'Expert Q&A', 'desc' => 'Tanya langsung ke mentor.', 'icon' => 'question', 'span' => 'col-span-1'],
                ['title' => 'Progress Tracking', 'desc' => 'Pantau apa yang sudah kamu pelajari.', 'icon' => 'chart', 'span' => 'col-span-2'],
                ['title' => 'Bookmark', 'desc' => 'Simpan materi favoritmu.', 'icon' => 'bookmark', 'span' => 'col-span-1'],
            ]
        ],
        'todo-list' => [
            'title' => 'To-Do List',
            'subtitle' => 'Manajemen tugas tanpa stres.',
            'description' => 'Sistem to-do list minimalis yang memaksamu memprioritaskan yang penting. Dengan batas harian (Daily Limit), kamu tidak akan lagi merasa overwhelm dengan daftar tugas yang tak berujung.',
            'deep_dive' => [
                ['title' => 'The Power of 3', 'content' => 'Filosofi kami sederhana: Pilih 3 tugas terpenting hari ini. Selesaikan. Istirahat. Ini mencegah *decision fatigue* dan memastikan progres nyata.', 'visual' => 'daily-limit', 'orientation' => 'right'],
                ['title' => 'Drag & Drop Kanban', 'content' => 'Organisir tugasmu dengan visual yang intuitif. Pindahkan dari "To Do" ke "Doing" ke "Done" dengan kepuasan maksimal.', 'visual' => 'kanban-board', 'orientation' => 'left'],
            ],
            'benefits' => ['Mencegah burnout karena overplanning', 'Fokus pada "High Impact Tasks"', 'Perasaan puas yang nyata setiap hari', 'Sinkronisasi antar perangkat'],
            'features' => [
                ['title' => 'Limit Harian', 'desc' => 'Maksimal 3-5 tugas utama per hari.', 'icon' => 'shield', 'span' => 'col-span-2'],
                ['title' => 'Sub-tasks', 'desc' => 'Pecah tugas besar jadi kecil.', 'icon' => 'list', 'span' => 'col-span-1'],
                ['title' => 'Recurring', 'desc' => 'Jadwal tugas berulang otomatis.', 'icon' => 'calendar', 'span' => 'col-span-1'],
                ['title' => 'Tags & Labels', 'desc' => 'Kategori warna-warni.', 'icon' => 'tag', 'span' => 'col-span-2'],
                ['title' => 'Quick Add', 'desc' => 'Tambah tugas dalam hitungan detik.', 'icon' => 'bolt', 'span' => 'col-span-1'],
            ]
        ],
        'affiliate' => [
            'title' => 'Affiliate Program',
            'subtitle' => 'Tumbuh dan untung bersama.',
            'description' => 'Ajak temanmu menjadi produktif dan dapatkan komisi menarik. Program afiliasi kami transparan, mudah dilacak, dan memberikan benefit nyata bagi kamu dan teman yang kamu ajak.',
            'deep_dive' => [
                ['title' => 'Komisi Seumur Hidup', 'content' => 'Dapatkan persentase dari setiap pembayaran langganan teman yang kamu ajak, selamanya selama mereka berlangganan. Passive income yang nyata.', 'visual' => 'commission-chart', 'orientation' => 'right'],
                ['title' => 'Dashboard Real-time', 'content' => 'Pantau klik, pendaftaran, dan konversi secara langsung. Kami menyediakan materi promosi yang siap pakai.', 'visual' => 'realtime-dashboard', 'orientation' => 'left'],
            ],
            'benefits' => ['Komisi kompetitif dan berulang', 'Payout mudah ke rekening bank/e-wallet', 'Materi marketing siap pakai', 'Support khusus untuk partner'],
            'features' => [
                ['title' => 'Unique Link', 'desc' => 'Link referral khusus untukmu.', 'icon' => 'link', 'span' => 'col-span-2'],
                ['title' => 'Analytics', 'desc' => 'Data performa lengkap.', 'icon' => 'presentation', 'span' => 'col-span-1'],
                ['title' => 'Monthly Payout', 'desc' => 'Pencairan dana otomatis.', 'icon' => 'dollar', 'span' => 'col-span-1'],
                ['title' => 'Promo Assets', 'desc' => 'Banner dan copy writing gratis.', 'icon' => 'photo', 'span' => 'col-span-2'],
                ['title' => 'Tier System', 'desc' => 'Bonus makin besar makin banyak.', 'icon' => 'trophy', 'span' => 'col-span-1'],
            ]
        ],
        'document-hub' => [
            'title' => 'Document Hub',
            'subtitle' => 'Otak kedua untuk ide-idemu.',
            'description' => 'Tempat sentral untuk menyimpan catatan, ide, SOP, dan dokumen proyek. Terintegrasi dengan Guild sehingga tim kamu bisa mengakses informasi yang sama tanpa miskomunikasi.',
            'deep_dive' => [
                ['title' => 'Wiki Pribadi & Tim', 'content' => 'Buat struktur pengetahuan yang rapi. Mulai dari catatan harian hingga dokumentasi proyek kompleks, semua tersusun dalam hierarki yang mudah dinavigasi.', 'visual' => 'wiki-structure', 'orientation' => 'right'],
                ['title' => 'Kolaborasi Real-time', 'content' => 'Edit dokumen bersama teman Guild-mu secara langsung. Beri komentar, mention, dan revisi tanpa perlu kirim-kiriman file.', 'visual' => 'realtime-collab', 'orientation' => 'left'],
            ],
            'benefits' => ['Satu tempat untuk semua informasi', 'Pencarian super cepat', 'Tidak ada lagi file yang hilang', 'Format teks yang kaya dan fleksibel'],
            'features' => [
                ['title' => 'Rich Text', 'desc' => 'Format teks lengkap & embed.', 'icon' => 'edit', 'span' => 'col-span-2'],
                ['title' => 'Templates', 'desc' => 'Mulai cepat dengan template.', 'icon' => 'doc', 'span' => 'col-span-1'],
                ['title' => 'Sharing', 'desc' => 'Kontrol akses granular.', 'icon' => 'share', 'span' => 'col-span-1'],
                ['title' => 'Version History', 'desc' => 'Kembalikan revisi sebelumnya.', 'icon' => 'history', 'span' => 'col-span-2'],
                ['title' => 'Export', 'desc' => 'Download ke PDF/Markdown.', 'icon' => 'download', 'span' => 'col-span-1'],
            ]
        ],
    ];

    if (!array_key_exists($slug, $products)) {
        abort(404);
    }

    return Inertia::render('Products/Show', [
        'product' => $products[$slug],
        'slug' => $slug
    ]);
})->name('products.show');

// Reviews Page
Route::get('/reviews', function () {
    return Inertia::render('Reviews/Index');
})->name('reviews.index');


Route::get('/terms-of-service', fn() => Inertia::render('TermsOfService'))->name('terms.show');
Route::get('/privacy-policy', fn() => Inertia::render('PrivacyPolicy'))->name('policy.show');
Route::get("/about", fn() => Inertia::render('About'))->name('about');

Route::get('/login/google/redirect', [GoogleLoginController::class, 'redirectToGoogle'])->name('login.google.redirect');
Route::get('/login/google/callback', [GoogleLoginController::class, 'handleGoogleCallback'])->name('login.google.callback');

Route::get('/pricing', [SubscriptionController::class, 'index'])->name('subscribe.index');
Route::post('/webhook/midtrans', [SubscriptionController::class, 'webhookHandler'])->name('midtrans.webhook');
Route::post('/webhook/whatsapp', [\App\Http\Controllers\WhatsAppBotController::class, 'handle'])->name('whatsapp.webhook');

// --- PUBLIC API ROUTES ---
Route::prefix('dashboard/api')->name('api.')->group(function() {
    Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login'])->name('login');
});

// --- AUTHENTICATED ROUTES ---
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Core Dashboard & Profile
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/dismiss-upgrade-modal', [DashboardController::class, 'dismissUpgradeModal'])->name('dashboard.dismiss-upgrade-modal');
    Route::get('/my-tasks', [\App\Http\Controllers\TaskPageController::class, 'index'])->name('tasks.index');
    Route::get('/upgrade', [\App\Http\Controllers\UpgradePageController::class, 'index'])->name('upgrade.index');
    Route::post('/upgrade/redeem-xp', [\App\Http\Controllers\UpgradePageController::class, 'redeemXP'])->name('upgrade.redeem-xp');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/tutorial-seen', [ProfileController::class, 'markTutorialSeen'])->name('profile.tutorial-seen');

    // General Features
    // General Features
    // Task routes moved to API
    Route::get('/voice', fn() => inertia('Voice/Index'))->name('voice.index');

    // Subscription Routes with Rate Limiting
    Route::post('/subscribe/checkout', [SubscriptionController::class, 'checkout'])
        ->middleware('throttle:5,1') // Max 5 requests per minute
        ->name('subscribe.checkout');
    Route::post('/subscribe/direct-checkout', [SubscriptionController::class, 'directCheckout'])
        ->middleware('throttle:5,1')
        ->name('subscribe.direct-checkout');
    Route::get('/subscription/payment-success', [SubscriptionController::class, 'paymentSuccessRedirect'])->name('subscription.payment.success');
    Route::get('/subscription/payment-cancel', [SubscriptionController::class, 'paymentCancel'])->name('subscription.payment.cancel');
    Route::post('/subscription/dismiss-modal', [SubscriptionController::class, 'dismissModal'])->name('subscription.dismiss-modal');


    // =========================================================================
    // === INTERNAL API ROUTES (JSON DATA) ===
    // =========================================================================
    // =========================================================================
    // === INTERNAL API ROUTES (JSON DATA) ===
    // =========================================================================
    Route::prefix('dashboard/api')->name('api.')->group(function() {
        // Auth
        // Login route moved to public section
        Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout'])->name('logout');
        
        // Tasks & Kanban
        Route::get('/kanban', [\App\Http\Controllers\Api\KanbanController::class, 'index'])->name('kanban.index');
        Route::post('/tasks', [\App\Http\Controllers\Api\KanbanController::class, 'store'])->name('tasks.store');
        Route::patch('/tasks/{task}', [\App\Http\Controllers\Api\KanbanController::class, 'update'])->name('tasks.update');
        Route::delete('/tasks/{task}', [\App\Http\Controllers\Api\KanbanController::class, 'destroy'])->name('tasks.destroy');
        Route::patch('/tasks/{task}/toggle-complete', [\App\Http\Controllers\Api\KanbanController::class, 'toggleComplete'])->name('tasks.toggle-complete');
        Route::patch('/tasks/{task}/toggle-focus', [\App\Http\Controllers\Api\KanbanController::class, 'toggleFocus'])->name('tasks.toggle-focus');
        Route::post('/tasks/{task}/dismiss-suggestion', [\App\Http\Controllers\Api\KanbanController::class, 'dismissSuggestion'])->name('tasks.dismiss-suggestion');
        Route::post('/tasks/focus-round-complete', [\App\Http\Controllers\Api\KanbanController::class, 'completeFocusRound'])->name('tasks.focus-round-complete');
        
        // AI Task Features
        Route::post('/tasks/{task}/suggest-breakdown', [\App\Http\Controllers\Api\KanbanController::class, 'suggestBreakdown'])->name('tasks.suggest-breakdown');
        Route::post('/tasks/reschedule-failed', [\App\Http\Controllers\Api\KanbanController::class, 'rescheduleFailedTasks'])->name('tasks.reschedule-failed');
        
        // Subtasks
        Route::post('/tasks/{task}/subtasks', [\App\Http\Controllers\Api\SubtaskController::class, 'store'])->name('subtasks.store');
        Route::patch('/subtasks/{subtask}', [\App\Http\Controllers\Api\SubtaskController::class, 'update'])->name('subtasks.update');
        Route::delete('/subtasks/{subtask}', [\App\Http\Controllers\Api\SubtaskController::class, 'destroy'])->name('subtasks.destroy');

        // Tags
        Route::get('/tags', [\App\Http\Controllers\Api\TagController::class, 'index'])->name('tags.index');
        Route::post('/tags', [\App\Http\Controllers\Api\TagController::class, 'store'])->name('tags.store');
        Route::delete('/tags/{tag}', [\App\Http\Controllers\Api\TagController::class, 'destroy'])->name('tags.destroy');

        // Documents
        Route::get('/documents/search', [\App\Http\Controllers\Api\DocumentController::class, 'search'])->name('documents.search');
        Route::get('/documents', [\App\Http\Controllers\Api\DocumentController::class, 'index'])->name('documents.index');
        Route::post('/documents', [\App\Http\Controllers\Api\DocumentController::class, 'store'])->name('documents.store');
        Route::get('/documents/{document}', [\App\Http\Controllers\Api\DocumentController::class, 'show'])->name('documents.show');
        Route::patch('/documents/{document}', [\App\Http\Controllers\Api\DocumentController::class, 'update'])->name('documents.update');
        Route::delete('/documents/{document}', [\App\Http\Controllers\Api\DocumentController::class, 'destroy'])->name('documents.destroy');
        Route::post('/documents/{document}/toggle-sharing', [\App\Http\Controllers\Api\DocumentController::class, 'toggleSharing'])->name('documents.toggle-sharing');
        Route::post('/documents/{document}/invite', [\App\Http\Controllers\Api\DocumentController::class, 'invite'])->name('documents.invite');
        
        // Pomodoro
        Route::post('/pomodoro', [\App\Http\Controllers\Api\PomodoroController::class, 'store'])->name('pomodoro.store');
        Route::post('/pomodoro/start', [\App\Http\Controllers\Api\PomodoroController::class, 'startSession'])->name('pomodoro.start');
        Route::get('/pomodoro/active', [\App\Http\Controllers\Api\PomodoroController::class, 'getActiveSession'])->name('pomodoro.active');
        Route::post('/pomodoro/stop', [\App\Http\Controllers\Api\PomodoroController::class, 'stopActiveSession'])->name('pomodoro.stop');
        Route::get('/focus/analytics', [\App\Http\Controllers\Api\PomodoroController::class, 'getFocusAnalytics'])->name('focus.analytics');

        // User Activity Tracking
        Route::post('/heartbeat', [\App\Http\Controllers\Api\UserActivityController::class, 'heartbeat'])->name('heartbeat');

        // Gamification & Cashback API
        Route::get('/challenges/active', [\App\Http\Controllers\Api\ChallengeController::class, 'getActive'])->name('challenges.active');
        Route::get('/challenges/history', [\App\Http\Controllers\Api\ChallengeController::class, 'getHistory'])->name('challenges.history');
        
        // Streak API
        Route::get('/gamification/streak', [\App\Http\Controllers\Api\GamificationController::class, 'getStreak'])->name('gamification.streak');
        Route::get('/gamification/weekly-journey', [\App\Http\Controllers\Api\GamificationController::class, 'getWeeklyJourney'])->name('gamification.weekly-journey');
        
        Route::get('/points/balance', [\App\Http\Controllers\Api\PointsController::class, 'getBalance'])->name('points.balance');
        
        Route::post('/cashback/redeem', [\App\Http\Controllers\Api\CashbackController::class, 'redeemToPromoCode'])->name('cashback.redeem');
        Route::get('/cashback/history', [\App\Http\Controllers\Api\CashbackController::class, 'getRedemptionHistory'])->name('cashback.history');
        
        // Productivity Features
        Route::get('/productivity/priority-tasks', [\App\Http\Controllers\ProductivityController::class, 'priorityRecommendations'])->name('productivity.priority-tasks');
        Route::get('/productivity/continue-work', [\App\Http\Controllers\ProductivityController::class, 'continueWork'])->name('productivity.continue-work');
        Route::get('/productivity/recovery-plan', [\App\Http\Controllers\ProductivityController::class, 'recoveryPlan'])->name('productivity.recovery-plan');
        Route::post('/productivity/recovery-apply', [\App\Http\Controllers\ProductivityController::class, 'applyRecovery'])->name('productivity.apply-recovery');
        Route::get('/productivity/daily-focus-stats', [\App\Http\Controllers\ProductivityController::class, 'dailyFocusStats'])->name('productivity.daily-focus-stats');
        Route::post('/tasks/{task}/set-daily-focus', [\App\Http\Controllers\ProductivityController::class, 'setDailyFocus'])->name('tasks.set-daily-focus');
        Route::post('/tasks/{task}/move-tomorrow', [\App\Http\Controllers\ProductivityController::class, 'moveToTomorrow'])->name('tasks.move-tomorrow');
        
        // Guild Voice Signaling
        Route::post('/voice/join', [\App\Http\Controllers\Api\VoiceSessionController::class, 'join'])->name('voice.join');
        Route::post('/voice/leave', [\App\Http\Controllers\Api\VoiceSessionController::class, 'leave'])->name('voice.leave');
        Route::get('/voice/peers', [\App\Http\Controllers\Api\VoiceSessionController::class, 'peers'])->name('voice.peers');

        // 📊 Productivity Stats (Session Context)
        Route::get('/productivity/summary', [App\Http\Controllers\Api\ProductivityController::class, 'summary'])->name('productivity.summary');
        Route::get('/productivity/trends', [App\Http\Controllers\Api\ProductivityController::class, 'trends'])->name('productivity.trends');
        Route::get('/productivity/insights', [App\Http\Controllers\Api\ProductivityController::class, 'insights'])->name('productivity.insights');
        Route::get('/productivity/report', [App\Http\Controllers\Api\ReportController::class, 'downloadWeeklyReport'])->name('productivity.report');
        
        // --- COGNITIVE ARENA API ---
        Route::get('/cognitive-arena', [\App\Http\Controllers\Api\CognitiveArenaController::class, 'index'])->name('cognitive-arena.index');
        Route::post('/cognitive-arena/generate', [\App\Http\Controllers\Api\CognitiveArenaController::class, 'generate'])->name('cognitive-arena.generate');
        Route::post('/cognitive-arena/matches/{match}/submit', [\App\Http\Controllers\Api\CognitiveArenaController::class, 'submit'])->name('cognitive-arena.submit');
        Route::post('/cognitive-arena/matches/{match}/submit', [\App\Http\Controllers\Api\CognitiveArenaController::class, 'submit'])->name('cognitive-arena.submit');
    });

    // =========================================================================
    // === VIEW ROUTES (MAIN) ===
    // =========================================================================
    Route::prefix('dashboard')->group(function() {

        // --- Learning Hub (Now powered by Cognitive Arena) ---
        Route::get('/learning', [\App\Http\Controllers\CognitiveArenaPageController::class, 'index'])->name('learning.index');
        
        // --- History / Transactions ---
        Route::get('/transactions', [SubscriptionController::class, 'history'])->name('transactions.history');

        // --- Docs View ---
        Route::get('/docs', [DocumentPageController::class, 'index'])->name('docs.index');
        Route::get('/reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
        Route::get('/docs/{document}', [DocumentPageController::class, 'show'])->name('docs.show'); // Still needed for the main view wrapper
        Route::get('/docs/{document}/export', [DocumentPageController::class, 'exportDocx'])->name('docs.export');
    });

    // --- GAMIFICATION ROUTES ---
    Route::prefix('gamification')->name('gamification.')->group(function () {
        Route::get('/dashboard', [GamificationController::class, 'dashboard'])->name('dashboard');
        Route::get('/challenges', [GamificationController::class, 'challenges'])->name('challenges');
        Route::get('/achievements', [GamificationController::class, 'achievements'])->name('achievements');
        Route::get('/leaderboard', [GamificationController::class, 'leaderboard'])->name('leaderboard');
        Route::post('/rescue', [GamificationController::class, 'rescue'])->name('rescue');
    });

    // --- AFFILIATE DASHBOARD ---
    Route::get('/affiliate', [AffiliateController::class, 'dashboard'])->name('affiliate.dashboard');
    Route::post('/affiliate/generate-code', [AffiliateController::class, 'generateCode'])->name('affiliate.generate-code');

    // --- WALLET ---
    Route::get('/wallet', [\App\Http\Controllers\WalletController::class, 'index'])->name('wallet.index');
    Route::post('/wallet/redeem', [\App\Http\Controllers\WalletController::class, 'redeem'])->name('wallet.redeem');

    // --- JOURNAL ---
    Route::resource('journal', \App\Http\Controllers\ReflectionController::class)->only(['index', 'store', 'show']);

    // --- MEDIA API ---
    Route::get('/api/media/search', [\App\Http\Controllers\Api\MediaController::class, 'search'])->name('api.media.search');

    // --- SPOTIFY AUTH ---
    Route::get('/auth/spotify/redirect', [\App\Http\Controllers\Auth\SpotifyAuthController::class, 'redirect'])->name('spotify.redirect');
    Route::get('/auth/spotify/callback', [\App\Http\Controllers\Auth\SpotifyAuthController::class, 'callback'])->name('spotify.callback');

    Route::middleware(['premium'])->group(function () {
        // Handled via API or integrated in Dashboard
    });
});

// --- GUILD ROUTES ---
Route::middleware(['auth'])->group(function () {
    Route::resource('guilds', \App\Http\Controllers\GuildController::class);
    Route::resource('guilds.tasks', \App\Http\Controllers\GuildTaskController::class)->shallow();
    Route::resource('guilds.members', \App\Http\Controllers\GuildMemberController::class)->shallow()->only(['index', 'update', 'destroy']);
    Route::post('guilds/{guild}/challenges/{challenge}/complete', [\App\Http\Controllers\GuildChallengeController::class, 'complete'])->name('guilds.challenges.complete');
    Route::resource('guilds.challenges', \App\Http\Controllers\GuildChallengeController::class)->shallow();
    
    // Join/Leave/Invite
    Route::post('guilds/join-by-code', [\App\Http\Controllers\GuildController::class, 'joinByCode'])->name('guilds.join-code');
    Route::post('guilds/{guild}/join', [\App\Http\Controllers\GuildController::class, 'join'])->name('guilds.join');
    Route::post('guilds/{guild}/leave', [\App\Http\Controllers\GuildController::class, 'leave'])->name('guilds.leave');
    Route::post('guilds/{guild}/invite', [\App\Http\Controllers\GuildController::class, 'invite'])->name('guilds.invite');

    Route::get('guilds/{guild}/tasks', [\App\Http\Controllers\GuildTaskController::class, 'index'])->name('guilds.tasks.index');
    Route::post('guilds/{guild}/tasks', [\App\Http\Controllers\GuildTaskController::class, 'store'])->name('guilds.tasks.store');
    Route::put('guilds/{guild}/tasks/{task}', [\App\Http\Controllers\GuildTaskController::class, 'update'])->name('guilds.tasks.update');
    Route::delete('guilds/{guild}/tasks/{task}', [\App\Http\Controllers\GuildTaskController::class, 'destroy'])->name('guilds.tasks.destroy');
    Route::post('guilds/{guild}/tasks/{task}/approve', [\App\Http\Controllers\GuildTaskController::class, 'approve'])->name('guilds.tasks.approve');
    Route::post('guilds/{guild}/tasks/{task}/comment', [\App\Http\Controllers\GuildTaskController::class, 'addComment'])->name('guilds.tasks.comment');
    
    // Guild Chat
    Route::get('guilds/{guild}/messages', [\App\Http\Controllers\GuildChatController::class, 'index'])->name('api.guilds.chat.index');
    Route::post('guilds/{guild}/messages', [\App\Http\Controllers\GuildChatController::class, 'store'])->name('api.guilds.chat.send');

    // New Features
    Route::get('guilds/{guild}/nexus', [\App\Http\Controllers\GuildController::class, 'focusNexus'])->name('guilds.nexus');
    Route::get('guilds/{guild}/report', [\App\Http\Controllers\GuildController::class, 'report'])->name('guilds.report');

    // Guild Divisions
    Route::resource('guilds.divisions', \App\Http\Controllers\GuildDivisionController::class)->except(['create', 'edit', 'show']);
    Route::post('guilds/{guild}/assign-member', [\App\Http\Controllers\GuildDivisionController::class, 'assignMember'])->name('guilds.divisions.assign-member');

    // Guild Documents
    Route::resource('guilds.documents', \App\Http\Controllers\GuildDocumentController::class)->except(['create', 'edit']);

    // Guild Economy
    Route::post('guilds/{guild}/buy-xp', [\App\Http\Controllers\GuildEconomyController::class, 'buyXp'])->name('guilds.buy-xp');
    Route::post('guilds/{guild}/missions', [\App\Http\Controllers\GuildEconomyController::class, 'createMission'])->name('guilds.missions.store');
    Route::post('xp/cashout', [\App\Http\Controllers\GuildEconomyController::class, 'cashout'])->name('xp.cashout');
});

// --- AI ASSISTANT ROUTES (PREMIUM) ---
Route::middleware(['auth', 'premium'])->prefix('api/ai')->name('api.ai.')->group(function () {
    Route::get('/sessions', [\App\Http\Controllers\ChatAssistantController::class, 'index'])->name('sessions');
    Route::post('/sessions', [\App\Http\Controllers\ChatAssistantController::class, 'store'])->name('store-session');
    Route::delete('/sessions/{session}', [\App\Http\Controllers\ChatAssistantController::class, 'destroy'])->name('destroy-session');
    Route::get('/sessions/{session}/messages', [\App\Http\Controllers\ChatAssistantController::class, 'messages'])->name('messages');
    Route::post('/sessions/{session}/send', [\App\Http\Controllers\ChatAssistantController::class, 'sendMessage'])->name('send-message');
    
    // Text Editor Actions
    Route::post('/text-action', [\App\Http\Controllers\Api\OpenAIController::class, 'processTextAction'])->name('text-action');
});
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', AdminDashboardController::class)->name('dashboard');
    Route::get('/feature-access', [\App\Http\Controllers\Admin\FeatureAccessController::class, 'index'])->name('settings.index');
    Route::post('/settings/update', [AdminDashboardController::class, 'updateSetting'])->name('settings.update');

    // Admin Users Management
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/promote', [AdminUserController::class, 'promote'])->name('users.promote');
    Route::post('/users/{user}/demote', [AdminUserController::class, 'demote'])->name('users.demote');
    Route::post('/users/{user}/ban', [AdminUserController::class, 'ban'])->name('users.ban');
    Route::post('/users/{user}/unban', [AdminUserController::class, 'unban'])->name('users.unban');
    Route::post('/users/{user}/make-admin', [AdminUserController::class, 'makeAdmin'])->name('users.make-admin');
    Route::post('/users/{user}/revoke-admin', [AdminUserController::class, 'revokeAdmin'])->name('users.revoke-admin');

    Route::resource('plans', PlanController::class)->except(['create', 'edit', 'show']);
    Route::post('/plans/bulk-update', [PlanController::class, 'bulkUpdate'])->name('plans.bulk-update');
    Route::patch('/plans/{plan}/toggle-status', [PlanController::class, 'toggleStatus'])->name('plans.toggle-status');
    
    // Admin Promos Management
    Route::resource('promos', PromoController::class)->except(['create', 'edit', 'show']);
    Route::patch('/promos/{promo}/toggle-status', [PromoController::class, 'toggleStatus'])->name('promos.toggle-status');
    
    // Admin Mini Moduls Management
    Route::resource('mini-modul-categories', MiniModulCategoryController::class);
    Route::resource('mini-moduls', AdminMiniModulController::class);
    
    Route::prefix('mini-moduls/{miniModul}')->name('mini-moduls.')->group(function () {
        Route::resource('chapters', MiniModulChapterController::class);
        Route::post('chapters/reorder', [MiniModulChapterController::class, 'reorder'])->name('chapters.reorder');
    });

    // Admin Cashouts Management
    Route::resource('cashouts', \App\Http\Controllers\Admin\AdminCashoutController::class)->only(['index', 'update']);
    Route::resource('collaborations', \App\Http\Controllers\Admin\CollaborationController::class)->only(['index', 'update']);
});

// --- PREMIUM ROUTES (AI Assistant) ---
Route::middleware(['auth', 'verified', 'premium'])->prefix('dashboard')->group(function () {
    // --- AI Assistant API ---
    Route::prefix('api/ai')->name('api.ai.')->group(function() {
        Route::get('/sessions', [\App\Http\Controllers\Api\ChatAssistantController::class, 'getSessions'])->name('sessions');
        Route::post('/sessions', [\App\Http\Controllers\Api\ChatAssistantController::class, 'storeSession'])->name('store-session');
        Route::get('/sessions/{session}', [\App\Http\Controllers\Api\ChatAssistantController::class, 'getMessages'])->name('messages');
        Route::post('/sessions/{session}/messages', [\App\Http\Controllers\Api\ChatAssistantController::class, 'sendMessage'])->name('send-message');
        Route::delete('/sessions/{session}', [\App\Http\Controllers\Api\ChatAssistantController::class, 'destroySession'])->name('destroy-session');
    });

    // --- AI Assistant View ---
    Route::get('/ai-assistant', [\App\Http\Controllers\AIAssistantPageController::class, 'index'])->name('ai-assistant.index');
});

// --- DESKTOP UTILITIES ---
Route::get('/desktop/open-external', [\App\Http\Controllers\DesktopController::class, 'openExternal'])->name('desktop.open-external');
Route::get('/download/windows', [\App\Http\Controllers\DesktopController::class, 'showDownloadPage'])->name('download.windows');
Route::get('/desktop/login-with-token', [\App\Http\Controllers\DesktopController::class, 'loginWithToken'])->name('desktop.login-with-token');

// --- SUBSCRIPTION UPGRADE & PROMO ---
Route::middleware(['auth'])->group(function() {
    Route::post('/subscription/apply-promo', [SubscriptionController::class, 'applyPromo'])->name('subscription.apply-promo');
    Route::post('/subscription/upgrade', [SubscriptionController::class, 'upgradePlan'])->name('subscription.upgrade');
});

require __DIR__.'/debug_sys.php';

require __DIR__.'/auth.php';