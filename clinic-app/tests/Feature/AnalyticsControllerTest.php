<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class AnalyticsControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'doctor']);
        Role::firstOrCreate(['name' => 'patient']);
    }

    public function test_admin_can_access_admin_analytics()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get(route('admin.analytics'));
        $response->assertStatus(200);
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page->component('Admin/Analytics'));
    }

    public function test_doctor_can_access_doctor_analytics()
    {
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole('doctor');
        $specialty = \App\Models\Specialty::factory()->create();
        \App\Models\Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $response = $this->actingAs($doctorUser)->get(route('doctor.analytics'));
        $response->assertStatus(200);
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page->component('Doctor/Analytics'));
    }

    public function test_patients_cannot_access_analytics()
    {
        $patient = User::factory()->create(['role' => 'patient']);
        $patient->assignRole('patient');

        $responseAdmin = $this->actingAs($patient)->get(route('admin.analytics'));
        $responseAdmin->assertStatus(403);

        $responseDoctor = $this->actingAs($patient)->get(route('doctor.analytics'));
        $responseDoctor->assertStatus(403);
    }
}
