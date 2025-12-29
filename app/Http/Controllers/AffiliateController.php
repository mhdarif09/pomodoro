<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Referral;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AffiliateController extends Controller
{
    public function dashboard()
    {
        $user = auth()->user();
        
        $referrals = Referral::with('referredUser')
            ->where('affiliate_id', $user->id)
            ->orderByDesc('created_at')
            ->get();
            
        return Inertia::render('Affiliate/Dashboard', [
            'user' => $user,
            'referrals' => $referrals,
            'stats' => [
                'total_referrals' => $referrals->count(),
                'completed_referrals' => $referrals->where('status', 'completed')->count(),
                'total_commission' => $user->affiliate_balance,
            ]
        ]);
    }

    public function generateCode(Request $request)
    {
        $user = auth()->user();
        
        if ($user->affiliate_code) {
            return redirect()->back()->with('error', 'Anda sudah memiliki kode affiliate.');
        }
        
        $user->update([
            'affiliate_code' => User::generateAffiliateCode($user->name)
        ]);
        
        return redirect()->back()->with('success', 'Kode affiliate berhasil dibuat!');
    }
}
