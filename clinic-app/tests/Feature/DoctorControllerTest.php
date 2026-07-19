<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Specialty;
use App\Models\Schedule;
use App\Models\Patient;
use App\Models\Appointment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class DoctorControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'doctor']);
        Role::firstOrCreate(['name' => 'patient']);
    }

    public function test_doctor_can_create_schedule()
    {
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole('doctor');
        $specialty = Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $response = $this->actingAs($doctorUser)->post(route('doctor.schedules.store'), [
            'title' => 'Morning Checkups',
            'date' => now()->addDay()->toDateString(),
            'time' => '10:00:00',
            'type' => 'in_person',
            'number_of_patients' => 5,
            'slot_duration' => 15,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('schedules', [
            'doctor_id' => $doctor->id,
            'title' => 'Morning Checkups',
            'type' => 'in_person'
        ]);
    }

    public function test_doctor_can_view_patient_emr()
    {
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole('doctor');
        $specialty = Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $patientUser = User::factory()->create(['role' => 'patient']);
        $patientUser->assignRole('patient');
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $schedule = Schedule::factory()->create(['doctor_id' => $doctor->id]);
        Appointment::factory()->create(['patient_id' => $patient->id, 'schedule_id' => $schedule->id]);

        $response = $this->actingAs($doctorUser)->get(route('doctor.patients.emr', $patient->id));
        
        $response->assertStatus(200);
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page->component('Doctor/PatientEMR'));
    }
}
