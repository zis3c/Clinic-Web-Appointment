<?php

namespace Tests\Feature;

use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Specialty;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_ai_returns_local_reply_without_external_api(): void
    {
        $response = $this->postJson(route('ai.guest-triage'), [
            'message' => 'I have chest pain and shortness of breath',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonPath('message', 'Chest pain or breathing trouble needs urgent medical care. Please go to the nearest emergency department now.');
    }

    public function test_queue_tv_requires_authenticated_staff(): void
    {
        $response = $this->get(route('queue.tv'));

        $response->assertRedirect(route('login'));

        Role::create(['name' => 'admin']);
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');

        $doctorRole = Role::create(['name' => 'doctor']);
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole($doctorRole);
        $specialty = Specialty::factory()->create();
        $doctor = Doctor::factory()->create([
            'user_id' => $doctorUser->id,
            'specialty_id' => $specialty->id,
        ]);

        $patientRole = Role::create(['name' => 'patient']);
        $patientUser = User::factory()->create(['role' => 'patient']);
        $patientUser->assignRole($patientRole);
        Patient::factory()->create(['user_id' => $patientUser->id]);

        $this->actingAs($admin);
        $response = $this->get(route('queue.tv'));
        $response->assertOk();
    }

    public function test_security_monitor_blocks_obvious_xss_payloads(): void
    {
        $response = $this->get('/?q=' . urlencode('<script>alert(1)</script>'));

        $response->assertStatus(403);
    }
}
