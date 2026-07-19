<?php

namespace Tests\Feature\Listeners;

use Illuminate\Auth\Events\Failed;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;
use App\Listeners\LogFailedLogin;

class LogFailedLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_failed_login_creates_security_log_without_password()
    {
        $listener = new LogFailedLogin();
        
        $event = new Failed('web', null, [
            'email' => 'hacker@example.com',
            'password' => 'supersecretpassword123'
        ]);

        $listener->handle($event);

        // Assert database has the log but without the password
        $this->assertDatabaseHas('security_logs', [
            'event_type' => 'failed_login',
            'description' => 'Failed login attempt for email: hacker@example.com'
        ]);

        $log = \App\Models\SecurityLog::first();
        $this->assertArrayHasKey('email', $log->payload);
        $this->assertArrayNotHasKey('password', $log->payload);
        $this->assertEquals('hacker@example.com', $log->payload['email']);
    }
}
