<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller; // <-- Jangan lupa tambahkan ini
use App\Models\User;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Menampilkan halaman dashboard admin dengan data statistik.
     */
    public function __invoke(Request $request)
    {
        // 1. Data untuk Stat Cards
        $totalUsers = User::count();
        $activeSubscriptions = Subscription::where('status', 'active')->count();

        // 2. Data untuk Grafik Pertumbuhan Pengguna (6 bulan terakhir)
        $userGrowth = User::select(
            DB::raw('COUNT(id) as count'),
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month_key"),
            DB::raw("DATE_FORMAT(created_at, '%b %Y') as month") // Format 'Jan 2023', 'Feb 2023', etc.
        )
            ->where('created_at', '>', Carbon::now()->subMonths(6))
            ->groupBy('month_key', 'month')
            ->orderBy('month_key', 'asc')
            ->get();
            
        // 3. Data untuk Grafik Distribusi Paket Langganan
        $subscriptionPlans = Subscription::select('plan', DB::raw('count(*) as count'))
            ->where('status', 'active')
            ->groupBy('plan')
            ->get();

        // Render komponen Inertia di folder Admin/
        return Inertia::render('Admin/Dashboard', [
            'totalUsers' => $totalUsers,
            'activeSubscriptions' => $activeSubscriptions,
            'userGrowthData' => $userGrowth,
            'subscriptionPlanData' => $subscriptionPlans,
        ]);
    }
}