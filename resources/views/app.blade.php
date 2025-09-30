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
  
        <!-- Preload Midtrans for better performance -->
        <link rel="preconnect" href="https://app.midtrans.com">
        <link rel="preconnect" href="https://app.sandbox.midtrans.com">
        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia

             <!-- Midtrans Script -->
        @env('production')
            <script type="text/javascript" 
                    src="https://app.midtrans.com/snap/snap.js" 
                    data-client-key="{{ config('services.midtrans.client_key') }}"
                    async>
            </script>
        @else
            <script type="text/javascript" 
                    src="https://app.sandbox.midtrans.com/snap/snap.js" 
                    data-client-key="{{ config('services.midtrans.client_key') }}"
                    async>
            </script>
        @endenv

        <!-- Fallback: Load snap.js manually if needed -->
        <script>
           (function() {
                const isProduction = {{ config('services.midtrans.is_production') ? 'true' : 'false' }};
                const clientKey = '{{ config('services.midtrans.client_key') }}';
                const snapSrc = isProduction 
                    ? 'https://app.midtrans.com/snap/snap.js' 
                    : 'https://app.sandbox.midtrans.com/snap/snap.js';
                
                console.log('Loading Midtrans Snap.js...');
                
                const script = document.createElement('script');
                script.src = snapSrc;
                script.setAttribute('data-client-key', clientKey);
                script.async = true;
                
                script.onload = function() {
                    console.log('Midtrans Snap.js loaded successfully');
                    window.dispatchEvent(new Event('snapLoaded'));
                };
                
                script.onerror = function() {
                    console.error('Failed to load Midtrans Snap.js');
                    window.dispatchEvent(new Event('snapLoadError'));
                };
                
                document.body.appendChild(script);
            })();
        </script>
    </body>
</html>
