<?php

namespace App\Http\Controllers;

use App\Models\Guild;
use App\Models\Task;
use App\Models\User;
use App\Models\XpPayout;
use App\Models\XpTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Jobs\DetermineTaskPriority;

class GuildEconomyController extends Controller
{
    /**
     * Top up Guild XP Balance (Mock Payment)
     * Rate: 100 XP = Rp 1.000
     */
    public function buyXp(Request $request, Guild $guild, \App\Services\MidtransService $midtransService)
    {
        // Authorization: Only Leader
        if (!$this->isLeader($guild)) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'amount_xp' => 'required|integer|min:100',
        ]);

        $amountXp = $validated['amount_xp'];
        $price = ($amountXp / 100) * 1000;

        // Create the Topup record first
        $topup = \App\Models\XpTopup::create([
            'guild_id' => $guild->id,
            'user_id' => auth()->id(),
            'amount_xp' => $amountXp,
            'amount_idr' => $price,
            'status' => 'pending',
        ]);

        try {
            $snap = $midtransService->createTopupTransaction($topup);
            
            return back()->with([
                'snap_token' => $snap->token,
                'topup_id' => $topup->id,
                'success' => "Transaksi berhasil dibuat. Silakan selesaikan pembayaran."
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menghubungi server pembayaran: ' . $e->getMessage()]);
        }
    }

    /**
     * Create a Mission (Funded Task)
     */
    public function createMission(Request $request, Guild $guild)
    {
        if (!$this->isLeader($guild)) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'xp_reward' => 'required|integer|min:10',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $xpReward = $validated['xp_reward'];

        // Check Balance
        if ($guild->xp_balance < $xpReward) {
            return back()->withErrors(['xp_reward' => 'Saldo XP Guild tidak mencukupi. Silakan top up dulu.']);
        }

        DB::transaction(function () use ($guild, $validated, $xpReward) {
            // Deduct Balance
            $guild->decrement('xp_balance', $xpReward);

            // Create Task
            $task = $guild->tasks()->create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'xp_reward' => $xpReward,
                'is_mission' => true,
                'funded_by_guild_id' => $guild->id,
                'user_id' => auth()->id(),
                'guild_id' => $guild->id,
                'assigned_to' => $validated['assigned_to'] ?? null,
                'status' => 'todo',
                'priority' => 'Tinggi', // Missions are high priority by default?
            ]);

            DetermineTaskPriority::dispatch($task);
        });

        return back()->with('success', 'Misi berhasil dibuat!');
    }

    /**
     * Request Cashout for User
     */
    public function cashout(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'amount_xp' => 'required|integer|min:100', // Min withdrawal
            'payment_method' => 'required|string',
            'account_number' => 'required|string',
            'account_name' => 'required|string',
        ]);

        $amountXp = $validated['amount_xp'];
        $amountIdr = ($amountXp / 100) * 1000; // Rate 1:1 (e.g. 100 XP = Rp 1000)
        
        // Fee 3%
        $fee = $amountIdr * 0.03;
        $netAmountIdr = $amountIdr - $fee;

        if ($user->redeemable_xp < $amountXp) {
            return back()->withErrors(['amount_xp' => 'Saldo Redeemable XP tidak cukup.']);
        }

        DB::transaction(function () use ($user, $amountXp, $amountIdr, $fee, $netAmountIdr, $validated) {
            // Deduct User Balance
            $user->decrement('redeemable_xp', $amountXp);

            // Create Payout Request
            $payout = XpPayout::create([
                'user_id' => $user->id,
                'amount_xp' => $amountXp,
                'amount_idr' => $amountIdr,
                'fee' => $fee,
                'net_amount_idr' => $netAmountIdr,
                'status' => 'pending',
                'payment_method' => $validated['payment_method'],
                'account_number' => $validated['account_number'],
                'account_name' => $validated['account_name'],
                'payment_details' => "{$validated['payment_method']} - {$validated['account_number']} a.n {$validated['account_name']}",
            ]);
            
            // Notify Admins
            \App\Models\User::where('role', 'admin')->each(function($admin) use ($payout) {
                $admin->notify(new \App\Notifications\NewCashoutRequest($payout));
            });
        });

        return back()->with('success', 'Permintaan pencairan dikirim! Mohon tunggu 2x24 jam kerja untuk proses verifikasi & transfer.');
    }

    /**
     * Helper to check leadership
     */
    private function isLeader(Guild $guild)
    {
        return $guild->members()
            ->where('user_id', auth()->id())
            ->wherePivot('role', 'leader')
            ->exists();
    }
}
