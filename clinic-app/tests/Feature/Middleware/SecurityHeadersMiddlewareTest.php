<?php

namespace Tests\Feature\Middleware;

use App\Http\Middleware\SecurityHeadersMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class SecurityHeadersMiddlewareTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        Route::middleware(SecurityHeadersMiddleware::class)->get('/test-headers', function () {
            return response('Hello World')->withHeaders([
                'X-Powered-By' => 'PHP/8.1.0',
                'Server' => 'Apache'
            ]);
        });
    }

    public function test_adds_security_headers()
    {
        $response = $this->get('/test-headers');

        $response->assertStatus(200);
        
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    public function test_adds_csp_header_in_non_local_environment()
    {
        // Tests run in 'testing' environment, which is != 'local'
        $this->assertEquals('testing', app()->environment());
        
        $response = $this->get('/test-headers');

        $response->assertStatus(200);
        $this->assertTrue($response->headers->has('Content-Security-Policy'));
        $csp = $response->headers->get('Content-Security-Policy');
        
        $this->assertStringContainsString("default-src 'self'", $csp);
        $this->assertStringContainsString("script-src 'self' 'unsafe-eval' 'nonce-", $csp);
    }

    public function test_removes_server_and_powered_by_headers()
    {
        $response = $this->get('/test-headers');

        $response->assertStatus(200);
        
        $this->assertFalse($response->headers->has('X-Powered-By'));
        $this->assertFalse($response->headers->has('Server'));
    }
}
