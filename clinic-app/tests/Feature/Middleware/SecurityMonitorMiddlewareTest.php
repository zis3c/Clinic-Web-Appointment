<?php

namespace Tests\Feature\Middleware;

use App\Http\Middleware\SecurityMonitorMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SecurityMonitorMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup a dummy route that uses our middleware
        Route::middleware(SecurityMonitorMiddleware::class)->any('/test-waf', function () {
            return response()->json(['status' => 'success']);
        });
    }

    public function test_allows_normal_requests()
    {
        $response = $this->postJson('/test-waf', [
            'name' => 'John Doe',
            'message' => 'Hello world'
        ]);

        $response->assertStatus(200);
        $response->assertJson(['status' => 'success']);
    }

    public function test_blocks_xss_payload()
    {
        $response = $this->postJson('/test-waf', [
            'name' => 'Hacker',
            'message' => '<script>alert(1)</script>'
        ]);

        $response->assertStatus(403);
        $response->assertJson(['error' => 'Forbidden - Malicious Activity Detected']);

        $this->assertDatabaseHas('security_logs', [
            'event_type' => 'waf_block',
        ]);
        
        $log = \App\Models\SecurityLog::first();
        $this->assertStringContainsString('xss_script_tag', $log->description);
    }

    public function test_blocks_sqli_payload()
    {
        $response = $this->postJson('/test-waf', [
            'search' => '1 UNION SELECT password FROM users'
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('security_logs', [
            'event_type' => 'waf_block',
        ]);
        
        $log = \App\Models\SecurityLog::first();
        $this->assertStringContainsString('sqli_union_select', $log->description);
    }

    public function test_redacts_passwords_in_security_logs()
    {
        $response = $this->postJson('/test-waf', [
            'email' => 'hacker@example.com',
            'password' => 'supersecret',
            'search' => '<script>'
        ]);

        $response->assertStatus(403);
        
        $log = \App\Models\SecurityLog::first();
        $this->assertEquals('[REDACTED]', $log->payload['password']);
        $this->assertEquals('hacker@example.com', $log->payload['email']);
    }

    public function test_blocks_huge_payloads()
    {
        $massivePayload = str_repeat('A', 100001);
        
        $response = $this->postJson('/test-waf', [
            'data' => $massivePayload
        ]);

        $response->assertStatus(413);
        
        $log = \App\Models\SecurityLog::first();
        $this->assertEquals('Request payload too large for security monitor.', $log->description);
    }
}
