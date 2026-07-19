<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $nonce = rtrim(strtr(base64_encode(random_bytes(16)), '+/', '-_'), '=');
        View::share('cspNonce', $nonce);
        Vite::useCspNonce($nonce);

        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        if (!app()->environment('local')) {
            $livekitUrl = config('services.livekit.url', 'ws://localhost:7880');
            $livekitHost = parse_url($livekitUrl, PHP_URL_HOST) ?? 'localhost';
            $livekitPort = parse_url($livekitUrl, PHP_URL_PORT);
            $scheme = parse_url($livekitUrl, PHP_URL_SCHEME);
            
            $connectSrcUrl = $livekitPort 
                ? "ws://{$livekitHost}:{$livekitPort} wss://{$livekitHost}:{$livekitPort}"
                : (($scheme === 'wss' || $scheme === 'https') ? "wss://{$livekitHost}" : "ws://{$livekitHost}");
            
            $csp = "default-src 'self'; " .
                   "script-src 'self' 'unsafe-eval' 'nonce-{$nonce}'; " .
                   "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " .
                   "font-src 'self' fonts.gstatic.com; " .
                   "img-src 'self' data: w3.org; " .
                   "frame-src 'self'; " .
                   "connect-src 'self' {$connectSrcUrl}";
            $response->headers->set('Content-Security-Policy', $csp);
        }

        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}
