<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Http;

class PayPalService
{
    public function createOrder(Subscription $subscription, User $user): array
    {
        $accessToken = $this->getAccessToken();
        $baseUrl = rtrim(config('services.paypal.base_url'), '/');

        $response = Http::withToken($accessToken)
            ->post("{$baseUrl}/v2/checkout/orders", [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'reference_id' => 'SUB-' . $subscription->id,
                        'description' => 'Subscription ' . $subscription->plan,
                        'amount' => [
                            'currency_code' => strtoupper(config('services.paypal.currency', 'USD')),
                            'value' => number_format((float) $subscription->final_price, 2, '.', ''),
                        ],
                    ],
                ],
                'application_context' => [
                    'brand_name' => config('app.name'),
                    'landing_page' => 'BILLING',
                    'user_action' => 'PAY_NOW',
                    'return_url' => route('subscription.paypal.success'),
                    'cancel_url' => route('subscription.paypal.cancel'),
                ],
                'payer' => [
                    'email_address' => $user->email,
                    'name' => [
                        'given_name' => $user->name,
                    ],
                ],
            ])
            ->throw()
            ->json();

        $approveUrl = collect($response['links'] ?? [])
            ->firstWhere('rel', 'approve')['href'] ?? null;

        if (!$approveUrl) {
            throw new \RuntimeException('PayPal approval URL not found.');
        }

        return [
            'order_id' => $response['id'],
            'approve_url' => $approveUrl,
        ];
    }

    public function captureOrder(string $orderId): array
    {
        $accessToken = $this->getAccessToken();
        $baseUrl = rtrim(config('services.paypal.base_url'), '/');

        return Http::withToken($accessToken)
            ->post("{$baseUrl}/v2/checkout/orders/{$orderId}/capture")
            ->throw()
            ->json();
    }

    private function getAccessToken(): string
    {
        $clientId = config('services.paypal.client_id');
        $clientSecret = config('services.paypal.client_secret');
        $baseUrl = rtrim(config('services.paypal.base_url'), '/');

        $response = Http::asForm()
            ->withBasicAuth($clientId, $clientSecret)
            ->post("{$baseUrl}/v1/oauth2/token", [
                'grant_type' => 'client_credentials',
            ])
            ->throw()
            ->json();

        return $response['access_token'];
    }
}
