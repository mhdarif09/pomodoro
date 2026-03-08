<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\XpPayout;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminCashoutController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $payouts = XpPayout::with('user')
            ->orderByRaw("FIELD(status, 'pending', 'processed', 'rejected')")
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Cashouts/Index', [
            'payouts' => $payouts,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, XpPayout $cashout)
    {
        $validated = $request->validate([
            'status' => 'required|in:processed,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        if ($cashout->status !== 'pending') {
            return back()->withErrors(['status' => 'This request has already been processed.']);
        }

        DB::transaction(function () use ($cashout, $validated) {
            $cashout->update([
                'status' => $validated['status'],
                'admin_notes' => $validated['admin_notes'] ?? null,
                'processed_at' => now(),
            ]);

            if ($validated['status'] === 'rejected') {
                // Refund XP to User
                $cashout->user->increment('redeemable_xp', $cashout->amount_xp);
            }
        });

        return back()->with('success', 'Cashout request updated successfully.');
    }
}
