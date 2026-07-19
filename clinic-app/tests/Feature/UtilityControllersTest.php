<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Schedule;
use App\Models\Specialty;
use App\Models\Appointment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class UtilityControllersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'doctor']);
        Role::firstOrCreate(['name' => 'patient']);
    }

    public function test_can_download_calendar_ics_for_appointment()
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        $patientUser->assignRole('patient');
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole('doctor');
        $specialty = Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $schedule = Schedule::factory()->create(['doctor_id' => $doctor->id]);
        $appointment = Appointment::factory()->create(['patient_id' => $patient->id, 'schedule_id' => $schedule->id]);

        $response = $this->actingAs($patientUser)->get(route('appointments.calendar', $appointment->id));
        
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/calendar; charset=UTF-8');
    }

    public function test_can_download_prescription_pdf_for_appointment()
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        $patientUser->assignRole('patient');
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole('doctor');
        $specialty = Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $schedule = Schedule::factory()->create(['doctor_id' => $doctor->id]);
        $appointment = Appointment::factory()->create(['patient_id' => $patient->id, 'schedule_id' => $schedule->id, 'status' => 'completed']);

        // Since generating a PDF in testing requires full view rendering, 
        // we can just assert that it routes correctly and doesn't crash (500)
        $response = $this->actingAs($patientUser)->get(route('prescriptions.pdf', $appointment->id));
        
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }
}
