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

class PrescriptionControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthorized_user_cannot_download_prescription()
    {
        $patient = Patient::factory()->create(['user_id' => User::factory()->create()->id]);
        $doctor = Doctor::factory()->create(['user_id' => User::factory()->create()->id, 'specialty_id' => Specialty::factory()->create()->id]);

        $schedule = Schedule::factory()->create(['doctor_id' => $doctor->id]);

        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'appointment_number' => 'APT-12345'
        ]);

        $randomUser = User::factory()->create(['role' => 'patient']);

        $response = $this->actingAs($randomUser)->get('/prescriptions/' . $appointment->id . '/pdf');

        $response->assertStatus(403);
    }

    public function test_patient_can_download_their_own_prescription()
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);
        $doctor = Doctor::factory()->create(['user_id' => User::factory()->create()->id, 'specialty_id' => Specialty::factory()->create()->id]);

        $schedule = Schedule::factory()->create(['doctor_id' => $doctor->id]);

        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'appointment_number' => 'APT-12345'
        ]);

        $response = $this->actingAs($patientUser)->get('/prescriptions/' . $appointment->id . '/pdf');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        // Ensure the response is actually PDF content
        $content = $response->getContent();
        $this->assertStringStartsWith('%PDF', $content);
    }

    public function test_doctor_can_download_their_own_prescription()
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);
        
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => Specialty::factory()->create()->id]);

        $schedule = Schedule::factory()->create(['doctor_id' => $doctor->id]);

        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'appointment_number' => 'APT-67890'
        ]);

        $response = $this->actingAs($doctorUser)->get('/prescriptions/' . $appointment->id . '/pdf');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_admin_can_download_any_prescription()
    {
        $patient = Patient::factory()->create(['user_id' => User::factory()->create()->id]);
        $doctor = Doctor::factory()->create(['user_id' => User::factory()->create()->id, 'specialty_id' => Specialty::factory()->create()->id]);

        $schedule = Schedule::factory()->create(['doctor_id' => $doctor->id]);

        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'appointment_number' => 'APT-11111'
        ]);

        $adminUser = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($adminUser)->get('/prescriptions/' . $appointment->id . '/pdf');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }
}
