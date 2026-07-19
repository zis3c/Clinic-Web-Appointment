<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;

class SecurityControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'doctor']);
        Role::firstOrCreate(['name' => 'patient']);
    }

    public function test_admin_can_view_security_dashboard()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get(route('admin.security.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page->component('Admin/Security'));
    }

    public function test_admin_can_unlock_user()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');

        $lockedUser = User::factory()->create([
            'role' => 'patient',
            'locked_until' => Carbon::now()->addHours(24)
        ]);

        $this->assertNotNull($lockedUser->locked_until);

        $response = $this->actingAs($admin)->post(route('admin.security.unlock', $lockedUser->id));
        
        $response->assertRedirect();
        
        $lockedUser->refresh();
        $this->assertNull($lockedUser->locked_until);
    }
}
