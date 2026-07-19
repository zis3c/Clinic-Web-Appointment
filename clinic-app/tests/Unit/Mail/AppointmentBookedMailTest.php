<?php

namespace Tests\Unit\Mail;

use App\Mail\AppointmentBookedMail;
use App\Models\Appointment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentBookedMailTest extends TestCase
{
    use RefreshDatabase;

    public function test_appointment_booked_mail_envelope_and_content()
    {
        $appointment = Appointment::factory()->create([
            'appointment_number' => 'APT-00123'
        ]);
        $cancelUrl = 'http://localhost/cancel/APT-00123';

        $mail = new AppointmentBookedMail($appointment, $cancelUrl);

        // Test Envelope
        $this->assertEquals('JanjiCare - Appointment Booking Confirmation #APT-00123', $mail->envelope()->subject);

        // Test Content View
        $this->assertEquals('emails.appointment-booked', $mail->content()->view);

        // Test the mail can be rendered (tests that bindings work)
        $rendered = $mail->render();
        
        $this->assertStringContainsString('APT-00123', $rendered);
        $this->assertStringContainsString($cancelUrl, $rendered);
    }
}
