<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- Dark Mode Setup -->
        <script nonce="{{ $cspNonce ?? '' }}">
            if (localStorage.getItem('darkMode') === 'true' || (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        </script>

        <title inertia>{{ config('app.name', 'JanjiCare') }}</title>
        <meta name="description" content="A comprehensive clinic management and telehealth appointment system connecting doctors and patients securely.">

        <!-- Favicon and PWA Manifest -->
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#14b8a6">
        <link rel="apple-touch-icon" href="/logo192.png">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes(nonce: $cspNonce ?? '')
        @viteReactRefresh
        @vite([
            'resources/js/app.tsx',
            file_exists(resource_path("js/Pages/{$page['component']}.tsx"))
                ? "resources/js/Pages/{$page['component']}.tsx"
                : "resources/js/Pages/{$page['component']}.jsx"
        ])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        @inertia
        <script nonce="{{ $cspNonce ?? '' }}">
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js').then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    }, err => {
                        console.log('ServiceWorker registration failed: ', err);
                    });
                });
            }
        </script>
    </body>
</html>
