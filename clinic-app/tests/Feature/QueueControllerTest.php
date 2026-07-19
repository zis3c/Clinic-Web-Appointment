<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class QueueControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'doctor']);
        Role::firstOrCreate(['name' => 'patient']);
    }

    public function test_tv_queue_is_accessible_to_admins()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get(route('queue.tv'));
        $response->assertStatus(200);
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page->component('Queue/TV'));
    }

    public function test_tv_queue_is_accessible_to_doctors()
    {
        $doctor = User::factory()->create(['role' => 'doctor']);
        $doctor->assignRole('doctor');

        $response = $this->actingAs($doctor)->get(route('queue.tv'));
        $response->assertStatus(200);
    }

    public function test_tv_queue_is_forbidden_to_patients()
    {
        $patient = User::factory()->create(['role' => 'patient']);
        $patient->assignRole('patient');

        $response = $this->actingAs($patient)->get(route('queue.tv'));
        $response->assertStatus(403);
    }
}
