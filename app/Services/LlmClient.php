<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LlmClient
{
    public function chatCompletions(array $payload): array
    {
        return $this->requestWithFallback('/chat/completions', $payload);
    }

    public function models(?string $which = null): array
    {
        $which = $which ?: 'all';

        if ($which === 'primary' || $which === 'secondary') {
            $providerName = $this->providerName($which);
            return [
                'mode' => $which,
                'providers' => [
                    $providerName => $this->requestProvider($providerName, '/models'),
                ],
            ];
        }

        if ($which === 'all') {
            $result = [
                'mode' => 'all',
                'providers' => [],
            ];

            $primary = $this->providerName('primary');
            $result['providers'][$primary] = $this->requestProvider($primary, '/models');

            $secondary = $this->providerName('secondary');
            if ($secondary) {
                $result['providers'][$secondary] = $this->requestProvider($secondary, '/models');
            }

            return $result;
        }

        // Explicit provider name.
        return [
            'mode' => 'provider',
            'providers' => [
                $which => $this->requestProvider($which, '/models'),
            ],
        ];
    }

    private function requestWithFallback(string $path, array $payload): array
    {
        $primary = $this->providerName('primary');
        $secondary = $this->providerName('secondary');

        try {
            return $this->requestProvider($primary, $path, $payload);
        } catch (\Throwable $e) {
            if (!$secondary) {
                throw $e;
            }

            if (!$this->shouldFallback($e)) {
                throw $e;
            }

            Log::warning('LLM primary provider failed; falling back to secondary', [
                'primary' => $primary,
                'secondary' => $secondary,
                'error' => $e->getMessage(),
            ]);

            return $this->requestProvider($secondary, $path, $payload);
        }
    }

    private function requestProvider(string $providerName, string $path, ?array $payload = null): array
    {
        [$apiKey, $baseUrl] = $this->resolveProviderCredentials($providerName);

        if (empty($apiKey)) {
            throw new \RuntimeException("LLM API key untuk provider '{$providerName}' belum dikonfigurasi.");
        }

        $url = rtrim($baseUrl, '/') . $path;

        $request = Http::withToken($apiKey)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->timeout((int) config('llm.timeout', 30))
            ->retry(1, 250);

        /** @var Response $response */
        $response = $payload === null ? $request->get($url) : $request->post($url, $payload);

        if (!$response->successful()) {
            // Convert to exception so fallback logic can decide.
            $response->throw();
        }

        return [
            'provider' => $providerName,
            'base_url' => rtrim($baseUrl, '/'),
            'data' => $response->json(),
        ];
    }

    private function resolveProviderCredentials(string $providerName): array
    {
        $provider = config("llm.providers.{$providerName}");
        if (!$provider) {
            throw new \InvalidArgumentException("Provider '{$providerName}' tidak dikenal. Pakai: openai|groq.");
        }

        return [$provider['api_key'] ?? null, $provider['base_url'] ?? null];
    }

    private function providerName(string $which): ?string
    {
        if ($which === 'primary') {
            return (string) config('llm.primary_provider', 'openai');
        }
        if ($which === 'secondary') {
            $secondary = config('llm.secondary_provider');
            return $secondary ? (string) $secondary : null;
        }

        return $which;
    }

    private function shouldFallback(\Throwable $e): bool
    {
        if ($e instanceof ConnectionException) return true;

        if ($e instanceof RequestException) {
            $status = $e->response?->status();
            if (!$status) return true;

            // Fallback on temporary/rate-limit/server failures.
            if (in_array($status, [408, 409, 425, 429], true)) return true;
            if ($status >= 500) return true;

            // If primary key is invalid (401) you may want fallback; keep it on.
            if ($status === 401) return true;

            return false;
        }

        return true;
    }
}
