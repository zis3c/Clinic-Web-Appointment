<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Failed;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;

class LogFailedLogin
{
    public function __construct()
    {
    }

    public function handle(Failed $event): void
    {
        $ip = Request::ip();
        $email = $event->credentials['email'] ?? 'unknown';
        Log::warning("Failed login attempt from IP {$ip} for email: {$email}");

        // Strip password from payload before logging
        $safePayload = $event->credentials;
        unset($safePayload['password']);

        \App\Models\SecurityLog::create([
            'ip_address' => $ip,
            'event_type' => 'failed_login',
            'description' => "Failed login attempt for email: {$email}",
            'payload' => $safePayload,
            'user_id' => null,
        ]);
    }
}
