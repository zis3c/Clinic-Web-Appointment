<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Specialty;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class AdminControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'doctor']);
        Role::firstOrCreate(['name' => 'patient']);
    }

    public function test_admin_can_access_dashboard()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));
        $response->assertStatus(200);
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page->component('Admin/Dashboard'));
    }

    public function test_non_admin_cannot_access_dashboard()
    {
        $patient = User::factory()->create(['role' => 'patient']);
        $patient->assignRole('patient');

        $response = $this->actingAs($patient)->get(route('admin.dashboard'));
        $response->assertStatus(403);
    }

    public function test_admin_can_create_doctor()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');
        
        $specialty = Specialty::factory()->create();

        $response = $this->actingAs($admin)->post(route('admin.doctors.store'), [
            'name' => 'Dr. Smith',
            'email' => 'drsmith@example.com',
            'password' => 'ValidPassword123!',
            'password_confirmation' => 'ValidPassword123!',
            'specialty_id' => $specialty->id,
            'nic' => '123456789012',
            'tel' => '1234567890',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'drsmith@example.com', 'role' => 'doctor']);
        
        $doctorUser = User::where('email', 'drsmith@example.com')->first();
        $this->assertDatabaseHas('doctors', ['user_id' => $doctorUser->id]);
    }
}
