<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use App\Models\Subscription;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user()->load('todaysGoal');

        if (!$user->onboarding_complete) {
            return Inertia::render('Dashboard', [
                'auth' => ['user' => $user->only('id', 'name', 'email', 'onboarding_complete')],
                'showOnboarding' => true,
                'todaysGoal' => null,
                'hasTodaysGoal' => false,
            ]);
        }
        
        $props = [
            'auth' => ['user' => $user],
            'showOnboarding' => false,
            'todaysGoal' => $user->todaysGoal,
            'hasTodaysGoal' => (bool)$user->todaysGoal,
        ];
        
        $activeSubscription = Subscription::where('user_id', $user->id)
            ->where('status', 'paid')
            ->where('expired_at', '>=', now())
            ->latest('expired_at')
            ->first();

        $props['subscription'] = $activeSubscription;
        $props['showTutorial'] = $request->session()->pull('show_tutorial', false);
        
        if (!$activeSubscription && !$props['showTutorial']) {
             $props['plans'] = Plan::all();
        } else {
             $props['plans'] = [];
        }

        return Inertia::render('Dashboard', $props);
    }
}