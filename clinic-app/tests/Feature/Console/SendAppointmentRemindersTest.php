<?php

namespace Tests\Feature\Console;

use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Schedule;
use App\Models\Specialty;
use App\Models\Appointment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;
use Carbon\Carbon;
use App\Notifications\AppointmentReminder;

class SendAppointmentRemindersTest extends TestCase
{
    use RefreshDatabase;

    public function test_sends_24h_reminder()
    {
        Notification::fake();

        $patientUser = User::factory()->create(['role' => 'patient']);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $specialty = Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $schedule = Schedule::factory()->create(['doctor_id' => $doctor->id]);
        
        // Appointment in exactly 23.5 hours
        $date = Carbon::now()->addHours(23)->addMinutes(30);
        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'date' => $date->format('Y-m-d'),
            'time_slot' => $date->format('H:i:s'),
            'status' => 'pending',
            'reminded_24h' => false,
            'reminded_1h' => false
        ]);

        $this->artisan('app:send-appointment-reminders')->assertExitCode(0);

        Notification::assertSentTo(
            [$patientUser],
            AppointmentReminder::class,
            function ($notification, $channels) use ($appointment) {
                return $notification->appointment->id === $appointment->id && $notification->type === '24h';
            }
        );

        $this->assertTrue($appointment->fresh()->reminded_24h);
        $this->assertFalse($appointment->fresh()->reminded_1h);
    }

    public function test_sends_1h_reminder()
    {
        Notification::fake();

        $patientUser = User::factory()->create(['role' => 'patient']);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $specialty = Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $schedule = Schedule::factory()->create(['doctor_id' => $doctor->id]);
        
        // Appointment in exactly 50 minutes
        $date = Carbon::now()->addMinutes(50);
        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'date' => $date->format('Y-m-d'),
            'time_slot' => $date->format('H:i:s'),
            'status' => 'confirmed',
            'reminded_24h' => true,
            'reminded_1h' => false
        ]);

        $this->artisan('app:send-appointment-reminders')->assertExitCode(0);

        Notification::assertSentTo(
            [$patientUser],
            AppointmentReminder::class,
            function ($notification, $channels) use ($appointment) {
                return $notification->appointment->id === $appointment->id && $notification->type === '1h';
            }
        );

        $this->assertTrue($appointment->fresh()->reminded_1h);
    }

    public function test_does_not_send_duplicate_reminders()
    {
        Notification::fake();

        $patientUser = User::factory()->create(['role' => 'patient']);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $specialty = Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $schedule = Schedule::factory()->create(['doctor_id' => $doctor->id]);
        
        // Appointment in exactly 23.5 hours, but ALREADY reminded
        $date = Carbon::now()->addHours(23)->addMinutes(30);
        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'date' => $date->format('Y-m-d'),
            'time_slot' => $date->format('H:i:s'),
            'status' => 'pending',
            'reminded_24h' => true,
            'reminded_1h' => false
        ]);

        $this->artisan('app:send-appointment-reminders')->assertExitCode(0);

        Notification::assertNothingSent();
    }
}
