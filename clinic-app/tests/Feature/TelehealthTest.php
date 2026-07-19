<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelehealthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        config()->set('services.livekit.key', 'test_key');
        config()->set('services.livekit.secret', 'test_secret_that_needs_to_be_long_enough_for_jwt');
        config()->set('services.livekit.url', 'ws://localhost:7880');
    }

    public function test_telehealth_room_renders_and_generates_token()
    {
        // Setup a doctor and specialty
        $specialty = \App\Models\Specialty::factory()->create();
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctor = Doctor::factory()->create([
            'user_id' => $doctorUser->id,
            'specialty_id' => $specialty->id
        ]);

        // Setup a patient
        $patientUser = User::factory()->create(['role' => 'patient']);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        // Setup a virtual schedule
        $schedule = Schedule::factory()->create([
            'doctor_id' => $doctor->id,
            'type' => 'virtual',
        ]);

        // Setup an appointment
        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'status' => 'approved', // Active appointment
        ]);

        // Act: Patient accesses the room
        $response = $this->actingAs($patientUser)->get("/telehealth/room/{$appointment->id}");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('Telehealth/Room')
            ->has('livekitToken')
            ->has('livekitUrl')
        );

        // Act: Doctor accesses the room
        $response = $this->actingAs($doctorUser)->get("/telehealth/room/{$appointment->id}");

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('Telehealth/Room')
            ->has('livekitToken')
            ->has('livekitUrl')
            ->where('isDoctor', true)
        );
    }
}
