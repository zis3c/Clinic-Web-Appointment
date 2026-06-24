<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use App\Models\Appointment;

class AppointmentStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public Appointment $appointment;
    public string $status;

    /**
     * Create a new message instance.
     */
    public function __construct(Appointment $appointment, string $status)
    {
        $this->appointment = $appointment;
        $this->status = $status;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = 'JanjiCare - Appointment Update #' . $this->appointment->appointment_number;
        if ($this->status === 'confirmed') {
            $subject = 'JanjiCare - Appointment Confirmed #' . $this->appointment->appointment_number;
        } elseif ($this->status === 'rejected') {
            $subject = 'JanjiCare - Appointment Rejected #' . $this->appointment->appointment_number;
        } elseif ($this->status === 'completed') {
            $subject = 'JanjiCare - Consultation Completed #' . $this->appointment->appointment_number;
        }

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-status',
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
