<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class OnboardingController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = \App\Models\User::find(Auth::id());

        // Validasi data yang dikirim dari frontend
        $validated = $request->validate([
            'growth_goals' => 'required|array',
            'growth_goals.*' => 'string|in:Fokus dan konsentrasi,Disiplin diri,Mengurangi overthinking,Ketenangan emosi,Percaya diri dan komunikasi,Konsistensi belajar,Mindset bertumbuh,Produktivitas yang sehat',
            'learning_style' => 'required|string|in:📖 Baca teks singkat & artikel,🎧 Mendengarkan audio (podcast, voice),💬 Tanya jawab (interaktif),🎨 Visual (grafik & ilustrasi)',
            'focus_time' => 'required|string|in:Pagi (07.00 – 10.00),Siang (10.00 – 14.00),Sore (14.00 – 18.00),Malam (18.00 – 22.00)',
            'personal_motivation' => 'required|string|max:500', // max:500 agar lebih leluasa
        ]);

        // Simpan data ke user yang sedang login
        $user->update([
            'growth_goals' => $validated['growth_goals'],
            'learning_style' => $validated['learning_style'],
            'focus_time' => $validated['focus_time'],
            'personal_motivation' => $validated['personal_motivation'],
            'onboarding_complete' => true, // <-- PENTING: Tandai onboarding sudah selesai
        ]);

        // Inertia akan handle refresh halaman, dan DashboardController akan
        // menyajikan dashboard penuh karena onboarding_complete sudah true.
        return Redirect::route('dashboard');
    }
}