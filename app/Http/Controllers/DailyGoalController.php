<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\DailyGoal;

class DailyGoalController extends Controller
{
    public function storeOrUpdate(Request $request)
    {
        $user = \App\Models\User::find(Auth::id());
        
        $validated = $request->validate([
            'goal' => 'required|string|max:255',
            'onboarding_data' => 'sometimes|nullable|array', // Data dari onboarding, jika ada
        ]);
        
        // Simpan atau perbarui goal harian
        $user->dailyGoals()->updateOrCreate(
            ['goal_date' => today()],
            ['goal' => $validated['goal']]
        );

        // Jika ada data onboarding, berarti ini adalah langkah terakhir onboarding
        if ($request->filled('onboarding_data')) {
            $user->update([
                'growth_goals'        => $request->onboarding_data['growth_goals'],
                'learning_style'      => $request->onboarding_data['learning_style'],
                'focus_time'          => $request->onboarding_data['focus_time'],
                'personal_motivation' => $request->onboarding_data['personal_motivation'],
                'onboarding_complete' => true,
            ]);
        }
        
        return redirect()->route('dashboard');
    }
}