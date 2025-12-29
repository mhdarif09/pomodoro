<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
  
        <!-- Preconnect (Meningkatkan performa load Midtrans) -->
        <link rel="preconnect" href="https://app.midtrans.com">
        <link rel="preconnect" href="https://app.sandbox.midtrans.com">

        <!-- PWA & SEO -->
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#000011">
        <meta name="description" content="Sarang Tumbuh - Ekosistem cerdas untuk menata pikiran, mempertajam fokus, dan mencapai hal yang dulu tampak mustahil.">
        
        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                        .then(registration => {
                            console.log('ServiceWorker registration successful with scope: ', registration.scope);
                        })
                        .catch(err => {
                            console.log('ServiceWorker registration failed: ', err);
                        });
                });
            }
        </script>
    </head>
    <body class="font-sans antialiased bg-[#000011]">
        @inertia
    </body>
</html>