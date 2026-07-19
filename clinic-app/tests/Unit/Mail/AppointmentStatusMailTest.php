<?php

namespace Tests\Unit\Mail;

use App\Mail\AppointmentStatusMail;
use App\Models\Appointment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentStatusMailTest extends TestCase
{
    use RefreshDatabase;

    public function test_appointment_status_mail_confirmed()
    {
        $appointment = Appointment::factory()->create([
            'appointment_number' => 'APT-00222'
        ]);

        $mail = new AppointmentStatusMail($appointment, 'confirmed');

        $this->assertEquals('JanjiCare - Appointment Confirmed #APT-00222', $mail->envelope()->subject);
        $this->assertEquals('emails.appointment-status', $mail->content()->view);
        
        $rendered = $mail->render();
        $this->assertStringContainsString('APT-00222', $rendered);
    }

    public function test_appointment_status_mail_rejected()
    {
        $appointment = Appointment::factory()->create([
            'appointment_number' => 'APT-00333'
        ]);

        $mail = new AppointmentStatusMail($appointment, 'rejected');

        $this->assertEquals('JanjiCare - Appointment Rejected #APT-00333', $mail->envelope()->subject);
    }

    public function test_appointment_status_mail_completed()
    {
        $appointment = Appointment::factory()->create([
            'appointment_number' => 'APT-00444'
        ]);

        $mail = new AppointmentStatusMail($appointment, 'completed');

        $this->assertEquals('JanjiCare - Consultation Completed #APT-00444', $mail->envelope()->subject);
    }
    
    public function test_appointment_status_mail_other_status()
    {
        $appointment = Appointment::factory()->create([
            'appointment_number' => 'APT-00555'
        ]);

        $mail = new AppointmentStatusMail($appointment, 'rescheduled');

        $this->assertEquals('JanjiCare - Appointment Update #APT-00555', $mail->envelope()->subject);
    }
}
