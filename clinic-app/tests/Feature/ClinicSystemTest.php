<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Schedule;
use App\Models\Appointment;
use App\Notifications\ClinicNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class ClinicSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_clinic_features_e2e_flow(): void
    {
        \Illuminate\Support\Facades\Mail::fake();
        // 1. Create a Doctor and Patient user
        $doctorRole = \Spatie\Permission\Models\Role::create(['name' => 'doctor']);
        $patientRole = \Spatie\Permission\Models\Role::create(['name' => 'patient']);

        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole($doctorRole);
        
        $specialty = \App\Models\Specialty::factory()->create();
        $doctor = Doctor::factory()->create([
            'user_id' => $doctorUser->id,
            'specialty_id' => $specialty->id
        ]);

        $patientUser = User::factory()->create(['role' => 'patient']);
        $patientUser->assignRole($patientRole);
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
        $otherPatientUser->assignRole($patientRole);
        $otherPatient = Patient::factory()->create(['user_id' => $otherPatientUser->id]);

        $this->actingAs($otherPatientUser);
        $responseConflict = $this->post(route('patient.appointments.store'), [
            'schedule_id' => $schedule->id,
            'time_slot' => '09:20:00',
        ]);
        $responseConflict->assertSessionHasErrors('schedule_id');

        // 5. Admin confirms and checks in the appointment
        $adminRole = \Spatie\Permission\Models\Role::create(['name' => 'admin']);
        $adminUser = User::factory()->create(['role' => 'admin']);
        $adminUser->assignRole($adminRole);
        $this->actingAs($adminUser);

        $responseCheckin = $this->post(route('admin.appointments.check-in'), [
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
        $notification = $patientUser->unreadNotifications()->where('data->title', 'Consultation Completed')->first();
        $this->assertNotNull($notification, "Consultation Completed notification was not found.");
        $this->assertEquals('Consultation Completed', $notification->data['title']);
    }

    public function test_patient_booking_rejects_slots_outside_schedule(): void
    {
        $patientRole = \Spatie\Permission\Models\Role::create(['name' => 'patient']);
        $doctorRole = \Spatie\Permission\Models\Role::create(['name' => 'doctor']);

        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole($doctorRole);
        $specialty = \App\Models\Specialty::factory()->create();
        $doctor = Doctor::factory()->create([
            'user_id' => $doctorUser->id,
            'specialty_id' => $specialty->id,
        ]);

        $patientUser = User::factory()->create(['role' => 'patient']);
        $patientUser->assignRole($patientRole);
        Patient::factory()->create(['user_id' => $patientUser->id]);

        $schedule = Schedule::create([
            'title' => 'Afternoon Slot Session',
            'doctor_id' => $doctor->id,
            'date' => now()->addDay()->toDateString(),
            'time' => '09:00:00',
            'number_of_patients' => 2,
            'slot_duration' => 30,
        ]);

        $this->actingAs($patientUser);

        $response = $this->post(route('patient.appointments.store'), [
            'schedule_id' => $schedule->id,
            'time_slot' => '10:30:00',
        ]);

        $response->assertSessionHasErrors('time_slot');
        $this->assertSame(0, Appointment::count());
    }

    public function test_email_cancel_page_does_not_delete_on_get(): void
    {
        $patientRole = \Spatie\Permission\Models\Role::create(['name' => 'patient']);
        $doctorRole = \Spatie\Permission\Models\Role::create(['name' => 'doctor']);

        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole($doctorRole);
        $specialty = \App\Models\Specialty::factory()->create();
        $doctor = Doctor::factory()->create([
            'user_id' => $doctorUser->id,
            'specialty_id' => $specialty->id,
        ]);

        $patientUser = User::factory()->create(['role' => 'patient']);
        $patientUser->assignRole($patientRole);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $schedule = Schedule::create([
            'title' => 'Email Cancel Session',
            'doctor_id' => $doctor->id,
            'date' => now()->addDay()->toDateString(),
            'time' => '09:00:00',
            'number_of_patients' => 2,
            'slot_duration' => 30,
        ]);

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'appointment_number' => 4321,
            'date' => now()->addDay()->toDateString(),
            'time_slot' => '09:00:00',
            'status' => 'pending',
        ]);

        $url = URL::temporarySignedRoute(
            'appointments.cancel-from-email',
            now()->addDay(),
            ['appointment' => $appointment->id]
        );

        $response = $this->get($url);

        $response->assertStatus(200);
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'pending',
        ]);
    }

    public function test_patient_cancellation_marks_record_cancelled(): void
    {
        $patientRole = \Spatie\Permission\Models\Role::create(['name' => 'patient']);
        $doctorRole = \Spatie\Permission\Models\Role::create(['name' => 'doctor']);

        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole($doctorRole);
        $specialty = \App\Models\Specialty::factory()->create();
        $doctor = Doctor::factory()->create([
            'user_id' => $doctorUser->id,
            'specialty_id' => $specialty->id,
        ]);

        $patientUser = User::factory()->create(['role' => 'patient']);
        $patientUser->assignRole($patientRole);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $schedule = Schedule::create([
            'title' => 'Patient Cancel Session',
            'doctor_id' => $doctor->id,
            'date' => now()->addDay()->toDateString(),
            'time' => '09:00:00',
            'number_of_patients' => 2,
            'slot_duration' => 30,
        ]);

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'appointment_number' => 5678,
            'date' => now()->addDay()->toDateString(),
            'time_slot' => '09:00:00',
            'status' => 'pending',
        ]);

        $this->actingAs($patientUser);
        $response = $this->delete(route('patient.appointments.destroy', $appointment->id));

        $response->assertRedirect(route('patient.appointments.index'));
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'cancelled',
        ]);
    }
}
