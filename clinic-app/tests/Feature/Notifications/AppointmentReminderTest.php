<?php

namespace Tests\Feature\Notifications;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Schedule;
use App\Models\User;
use App\Notifications\AppointmentReminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentReminderTest extends TestCase
{
    use RefreshDatabase;

    public function test_24h_reminder_builds_correct_mail()
    {
        $patientUser = User::factory()->create(['name' => 'Jane Patient']);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $doctorUser = User::factory()->create(['name' => 'Dr. Smith']);
        $specialty = \App\Models\Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $schedule = Schedule::factory()->create(['doctor_id' => $doctor->id]);

        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'date' => '2025-10-10',
            'time_slot' => '10:00:00'
        ]);

        $notification = new AppointmentReminder($appointment, '24h');
        $mail = $notification->toMail($patientUser);

        $this->assertEquals('Your Appointment Reminder - JanjiCare', $mail->subject);
        $this->assertEquals('emails.appointment-reminder', $mail->view);
        $this->assertEquals('tomorrow', $mail->viewData['timeStr']);
        $this->assertEquals('Dr. Smith', $mail->viewData['doctorName']);
    }

    public function test_1h_reminder_builds_correct_mail()
    {
        $patientUser = User::factory()->create(['name' => 'John Doe']);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $doctorUser = User::factory()->create(['name' => 'Dr. Brown']);
        $specialty = \App\Models\Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $schedule = Schedule::factory()->create(['doctor_id' => $doctor->id]);

        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'date' => '2025-10-11',
            'time_slot' => '14:30:00'
        ]);

        $notification = new AppointmentReminder($appointment, '1h');
        $mail = $notification->toMail($patientUser);

        $this->assertEquals('Your Appointment Reminder - JanjiCare', $mail->subject);
        $this->assertEquals('emails.appointment-reminder', $mail->view);
        $this->assertEquals('in 1 hour', $mail->viewData['timeStr']);
        $this->assertEquals('Dr. Brown', $mail->viewData['doctorName']);
    }
}
