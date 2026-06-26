<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Schedule;
use App\Models\Appointment;
use App\Notifications\ClinicNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_clinic_features_e2e_flow(): void
    {
        // 1. Create a Doctor and Patient user
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctor = Doctor::factory()->create([
            'user_id' => $doctorUser->id,
            'specialty_id' => 1
        ]);

        $patientUser = User::factory()->create(['role' => 'patient']);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        // 2. Create a Schedule with a slot duration of 20 minutes
        $schedule = Schedule::create([
            'title' => 'Morning Slot Session',
            'doctor_id' => $doctor->id,
            'date' => date('Y-m-d'),
            'time' => '09:00:00',
            'number_of_patients' => 5,
            'slot_duration' => 20,
        ]);

        $this->assertEquals(20, $schedule->slot_duration);

        // 3. Book an appointment with a specific time slot: "09:20:00"
        $this->actingAs($patientUser);

        $response = $this->post(route('patient.appointments.store'), [
            'schedule_id' => $schedule->id,
            'time_slot' => '09:20:00',
        ]);

        $response->assertRedirect();
        
        $appointment = Appointment::first();
        $this->assertNotNull($appointment);
        $this->assertEquals('09:20:00', $appointment->time_slot);
        $this->assertEquals('pending', $appointment->status);

        // 4. Try booking the same slot again with another patient and verify it fails validation
        $otherPatientUser = User::factory()->create(['role' => 'patient']);
        $otherPatient = Patient::factory()->create(['user_id' => $otherPatientUser->id]);

        $this->actingAs($otherPatientUser);
        $responseConflict = $this->post(route('patient.appointments.store'), [
            'schedule_id' => $schedule->id,
            'time_slot' => '09:20:00',
        ]);
        $responseConflict->assertSessionHasErrors('time_slot');

        // 5. Admin confirms and checks in the appointment
        $adminUser = User::factory()->create(['role' => 'admin']);
        $this->actingAs($adminUser);

        $responseCheckin = $this->post(route('admin.appointments.checkin'), [
            'code' => 'APT-' . $appointment->appointment_number,
        ]);

        $appointment->refresh();
        $this->assertTrue((bool)$appointment->checked_in);
        $this->assertEquals('confirmed', $appointment->status);

        // 6. Complete consultation by the doctor with diagnosis, prescriptions, and notes
        $this->actingAs($doctorUser);

        $responseComplete = $this->patch(route('doctor.appointments.complete', $appointment->id), [
            'diagnosis' => 'Influenza A',
            'prescriptions' => 'Tamiflu 75mg daily',
            'notes' => 'Drink fluids and rest for 5 days.',
        ]);

        $responseComplete->assertRedirect();

        $appointment->refresh();
        $this->assertEquals('completed', $appointment->status);
        $this->assertEquals('Influenza A', $appointment->diagnosis);
        $this->assertEquals('Tamiflu 75mg daily', $appointment->prescriptions);
        $this->assertEquals('Drink fluids and rest for 5 days.', $appointment->notes);

        // 7. Verify patient got database notifications for status changes
        $patientUser->refresh();
        $this->assertNotEmpty($patientUser->notifications);
        $notification = $patientUser->unreadNotifications->first();
        $this->assertNotNull($notification);
        $this->assertEquals('Appointment Completed', $notification->data['title']);
    }
}
