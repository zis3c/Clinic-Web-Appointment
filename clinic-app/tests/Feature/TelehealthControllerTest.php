<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Schedule;
use App\Models\Specialty;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class TelehealthControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        config()->set('services.livekit.key', 'test_key');
        config()->set('services.livekit.secret', 'test_secret_that_needs_to_be_long_enough_for_jwt');
        config()->set('services.livekit.url', 'ws://localhost:7880');
    }

    public function test_telehealth_room_requires_virtual_appointment()
    {
        $patientUser = User::factory()->create();
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);
        
        $doctorUser = User::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => Specialty::factory()->create()->id]);

        $schedule = Schedule::factory()->create([
            'doctor_id' => $doctor->id,
            'type' => 'in_person' // physical type
        ]);

        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'status' => 'scheduled'
        ]);

        $response = $this->actingAs($patientUser)->get('/telehealth/room/' . $appointment->id);
        
        $response->assertStatus(403);
    }

    public function test_telehealth_room_blocks_unauthorized_users()
    {
        $patientUser = User::factory()->create();
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);
        
        $doctorUser = User::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => Specialty::factory()->create()->id]);

        $schedule = Schedule::factory()->create([
            'doctor_id' => $doctor->id,
            'type' => 'virtual'
        ]);

        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'status' => 'scheduled'
        ]);

        $randomUser = User::factory()->create();

        // Random user tries to join
        $response = $this->actingAs($randomUser)->get('/telehealth/room/' . $appointment->id);
        $response->assertStatus(403);
    }

    public function test_telehealth_room_generates_jwt_and_renders_inertia_for_patient()
    {
        $patientUser = User::factory()->create();
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);
        
        $doctorUser = User::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => Specialty::factory()->create()->id]);

        $schedule = Schedule::factory()->create([
            'doctor_id' => $doctor->id,
            'type' => 'virtual'
        ]);

        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'status' => 'scheduled'
        ]);

        $response = $this->actingAs($patientUser)->get('/telehealth/room/' . $appointment->id);
        
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Telehealth/Room')
            ->has('livekitToken')
            ->where('isDoctor', false)
            ->where('roomName', fn ($roomName) => str_starts_with($roomName, 'janji-care-room-'))
        );
    }

    public function test_telehealth_room_generates_jwt_and_renders_inertia_for_doctor()
    {
        $patientUser = User::factory()->create();
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);
        
        $doctorUser = User::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => Specialty::factory()->create()->id]);

        $schedule = Schedule::factory()->create([
            'doctor_id' => $doctor->id,
            'type' => 'virtual'
        ]);

        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'status' => 'scheduled'
        ]);

        $response = $this->actingAs($doctorUser)->get('/telehealth/room/' . $appointment->id);
        
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Telehealth/Room')
            ->has('livekitToken')
            ->where('isDoctor', true)
            ->where('roomName', fn ($roomName) => str_starts_with($roomName, 'janji-care-room-'))
        );
    }
}
