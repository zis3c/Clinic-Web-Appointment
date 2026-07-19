<?php

namespace Tests\Unit\Policies;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Schedule;
use App\Models\User;
use App\Policies\AppointmentPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_delete_any_appointment()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $appointment = Appointment::factory()->create();

        $policy = new AppointmentPolicy();
        $this->assertTrue($policy->delete($admin, $appointment));
    }

    public function test_doctor_can_delete_their_own_appointment()
    {
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        
        $schedule = Schedule::factory()->create(['doctor_id' => $doctor->id]);
        $appointment = Appointment::factory()->create(['schedule_id' => $schedule->id]);

        $policy = new AppointmentPolicy();
        $this->assertTrue($policy->delete($doctorUser, $appointment));
    }

    public function test_doctor_cannot_delete_other_doctors_appointment()
    {
        $doctorUser1 = User::factory()->create(['role' => 'doctor']);
        Doctor::factory()->create(['user_id' => $doctorUser1->id]);

        $doctorUser2 = User::factory()->create(['role' => 'doctor']);
        $doctor2 = Doctor::factory()->create(['user_id' => $doctorUser2->id]);
        
        $schedule = Schedule::factory()->create(['doctor_id' => $doctor2->id]);
        $appointment = Appointment::factory()->create(['schedule_id' => $schedule->id]);

        $policy = new AppointmentPolicy();
        // Doctor 1 trying to delete Doctor 2's appointment
        $this->assertFalse($policy->delete($doctorUser1, $appointment));
    }

    public function test_patient_can_delete_their_own_appointment()
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);
        
        $appointment = Appointment::factory()->create(['patient_id' => $patient->id]);

        $policy = new AppointmentPolicy();
        $this->assertTrue($policy->delete($patientUser, $appointment));
    }

    public function test_patient_cannot_delete_other_patients_appointment()
    {
        $patientUser1 = User::factory()->create(['role' => 'patient']);
        Patient::factory()->create(['user_id' => $patientUser1->id]);

        $patientUser2 = User::factory()->create(['role' => 'patient']);
        $patient2 = Patient::factory()->create(['user_id' => $patientUser2->id]);
        
        $appointment = Appointment::factory()->create(['patient_id' => $patient2->id]);

        $policy = new AppointmentPolicy();
        // Patient 1 trying to delete Patient 2's appointment
        $this->assertFalse($policy->delete($patientUser1, $appointment));
    }

    public function test_all_other_actions_are_denied()
    {
        $user = User::factory()->create();
        $appointment = Appointment::factory()->create();

        $policy = new AppointmentPolicy();

        $this->assertFalse($policy->viewAny($user));
        $this->assertFalse($policy->view($user, $appointment));
        $this->assertFalse($policy->create($user));
        $this->assertFalse($policy->update($user, $appointment));
        $this->assertFalse($policy->restore($user, $appointment));
        $this->assertFalse($policy->forceDelete($user, $appointment));
    }
}
