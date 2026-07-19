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

class PatientControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'doctor']);
        Role::firstOrCreate(['name' => 'patient']);
    }

    public function test_patient_can_update_profile()
    {
        $user = User::factory()->create(['role' => 'patient']);
        $user->assignRole('patient');
        $patient = Patient::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->patch(route('patient.profile.update'), [
            'blood_group' => 'O+',
            'allergies' => 'Peanuts',
        ]);

        $response->assertRedirect();
        
        $patient->refresh();
        $this->assertEquals('O+', $patient->blood_group);
        $this->assertEquals('Peanuts', $patient->allergies);
    }

    public function test_patient_can_book_appointment()
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        $patientUser->assignRole('patient');
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole('doctor');
        $specialty = Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $schedule = Schedule::factory()->create([
            'doctor_id' => $doctor->id,
            'date' => now()->addDays(2)->format('Y-m-d'),
            'time' => '10:00:00',
            'number_of_patients' => 5,
            'slot_duration' => 15,
        ]);

        $response = $this->actingAs($patientUser)->post(route('patient.appointments.store'), [
            'schedule_id' => $schedule->id,
            'time_slot' => '10:00:00',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('appointments', [
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'time_slot' => '10:00:00',
        ]);
    }

    public function test_patient_cannot_hoard_multiple_appointments()
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        $patientUser->assignRole('patient');
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole('doctor');
        $specialty = Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $schedule1 = Schedule::factory()->create([
            'doctor_id' => $doctor->id,
            'date' => now()->addDays(2)->format('Y-m-d'),
            'time' => '10:00:00',
            'number_of_patients' => 5,
            'slot_duration' => 15,
        ]);

        $schedule2 = Schedule::factory()->create([
            'doctor_id' => $doctor->id,
            'date' => now()->addDays(3)->format('Y-m-d'),
            'time' => '11:00:00',
            'number_of_patients' => 5,
            'slot_duration' => 15,
        ]);

        // Create first active appointment
        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule1->id,
            'date' => $schedule1->date,
            'status' => 'pending'
        ]);

        // Attempt to book a second one
        $response = $this->actingAs($patientUser)->post(route('patient.appointments.store'), [
            'schedule_id' => $schedule2->id,
            'time_slot' => '11:00:00',
        ]);

        $response->assertSessionHasErrors('schedule_id');
        $this->assertDatabaseMissing('appointments', [
            'patient_id' => $patient->id,
            'schedule_id' => $schedule2->id,
        ]);
    }
}
