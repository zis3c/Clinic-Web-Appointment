<?php

namespace Tests\Feature\Exceptions;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class ExceptionHandlerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure exception handling is enabled (TestCase sometimes disables it for debugging)
        $this->withExceptionHandling();
        
        Route::get('/trigger-404', function () {
            abort(404);
        });

        Route::get('/trigger-403', function () {
            abort(403);
        });
        
        Route::get('/trigger-500', function () {
            abort(500);
        });
    }

    public function test_renders_inertia_error_component_on_404()
    {
        $response = $this->get('/trigger-404');

        $response->assertStatus(404);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 404)
        );
    }

    public function test_renders_inertia_error_component_on_403()
    {
        $response = $this->get('/trigger-403');

        $response->assertStatus(403);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 403)
        );
    }

    public function test_renders_standard_view_on_500_if_local()
    {
        // Change environment to local to test the debug fallback
        app()->detectEnvironment(fn() => 'local');
        
        $response = $this->get('/trigger-500');

        $response->assertStatus(500);
        // It shouldn't be an Inertia response in local for 500
        $this->assertFalse($response->headers->has('X-Inertia'));
    }
}
