<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Menampilkan halaman dashboard admin dengan data statistik bisnis.
     */
    public function __invoke(Request $request)
    {
        // 1. Data untuk Stat Cards (SUDAH DISESUAIKAN)
        
        // Menghitung total semua pengguna yang terdaftar.
        $totalUsers = User::count();

        // Menghitung jumlah user UNIK yang memiliki setidaknya satu subscription berstatus 'paid'.
        // Ini adalah jumlah 'pelanggan berbayar' Anda yang sebenarnya.
        $payingCustomers = Subscription::where('status', 'paid')
                                       ->distinct('user_id')
                                       ->count('user_id');

        // Menghitung total pendapatan dari semua subscription yang statusnya 'paid'.
        // Kita harus JOIN tabel 'subscriptions' dengan 'plans' untuk mendapatkan harga.
        $totalRevenue = Subscription::where('subscriptions.status', 'paid')
                                    ->join('plans', 'subscriptions.plan', '=', 'plans.name')
                                    ->sum('plans.price');

        // 2. Data untuk Grafik Pertumbuhan Pengguna (6 bulan terakhir) - TIDAK BERUBAH
        $userGrowth = User::select(
            DB::raw('COUNT(id) as count'),
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month_key"),
            DB::raw("DATE_FORMAT(created_at, '%b %Y') as month")
        )
            ->where('created_at', '>', Carbon::now()->subMonths(6))
            ->groupBy('month_key', 'month')
            ->orderBy('month_key', 'asc')
            ->get();
            
        // 3. Data untuk Grafik Distribusi Paket Langganan - Menggunakan status 'paid'
        $subscriptionPlansDistribution = Subscription::select('plan', DB::raw('count(*) as count'))
            ->where('status', 'paid')
            ->groupBy('plan')
            ->get();

        // Render komponen Inertia di folder Admin/
        return Inertia::render('Admin/Dashboard', [
            // Kirim data yang sudah diperbarui dan data baru
            'totalUsers' => $totalUsers,
            'payingCustomers' => $payingCustomers,
            'totalRevenue' => (float) $totalRevenue, // Casting ke float untuk konsistensi

            // Kirim data grafik
            'userGrowthData' => $userGrowth,
            'subscriptionPlanData' => $subscriptionPlansDistribution,
        ]);
    }
}