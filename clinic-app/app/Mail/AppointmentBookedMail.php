<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use App\Models\Appointment;

class AppointmentBookedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Appointment $appointment;
    public string $cancelUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(Appointment $appointment, string $cancelUrl)
    {
        $this->appointment = $appointment;
        $this->cancelUrl = $cancelUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'JanjiCare - Appointment Booking Confirmation #' . $this->appointment->appointment_number,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-booked',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
