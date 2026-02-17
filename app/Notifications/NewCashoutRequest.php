<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewCashoutRequest extends Notification
{
    use Queueable;

    public $payout;

    /**
     * Create a new notification instance.
     */
    public function __construct(\App\Models\XpPayout $payout)
    {
        $this->payout = $payout;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Cashout Request 💸',
            'message' => "{$this->payout->user->name} requesting Rp " . number_format($this->payout->net_amount_idr, 0, ',', '.'),
            'payout_id' => $this->payout->id,
            'amount_xp' => $this->payout->amount_xp,
            'net_amount' => $this->payout->net_amount_idr,
            'action_url' => route('admin.dashboard'), // Adjust as needed
        ];
    }
}
