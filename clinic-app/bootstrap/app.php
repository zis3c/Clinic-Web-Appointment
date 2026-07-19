<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust the loopback address + the entire Docker bridge subnet (172.16.0.0/12)
        // so that X-Forwarded-For from the Nginx reverse-proxy is honoured and the
        // real client IP is captured instead of the Docker gateway (172.18.0.1).
        $middleware->trustProxies(
            at: [
                '127.0.0.1',
                '::1',
                '172.16.0.0/12',   // Docker bridge network (covers 172.16–172.31)
                '10.0.0.0/8',       // Private range – covers Docker overlay / custom subnets
            ],
            headers: Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO,
        );

        $middleware->web(append: [
            \App\Http\Middleware\SecurityMonitorMiddleware::class,
            \App\Http\Middleware\SecurityHeadersMiddleware::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \Illuminate\Session\Middleware\AuthenticateSession::class,
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->respond(function (Response $response, \Throwable $exception, Request $request) {
            $status = $response->getStatusCode();

            if (in_array($status, [500, 503, 404, 403, 405, 419, 429])) {
                // For 500 errors, show default Laravel error page on local for debugging
                if ($status === 500 && app()->environment(['local', 'testing'])) {
                    return $response;
                }

                return Inertia::render('Error', ['status' => $status])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

            return $response;
        });
    })->create();
