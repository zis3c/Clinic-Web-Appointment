<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentReminder extends Notification
{
    use Queueable;

    public $appointment;
    public $type; // '24h' or '1h'

    /**
     * Create a new notification instance.
     */
    public function __construct(\App\Models\Appointment $appointment, string $type)
    {
        $this->appointment = $appointment;
        $this->type = $type;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // For local development, we'll log the SMS instead of using Vonage/Twilio directly
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $timeStr = $this->type === '24h' ? 'tomorrow' : 'in 1 hour';
        $doctorName = $this->appointment->schedule->doctor->user->name;

        // Friendly, clean SMS message
        $smsText = "JanjiCare Reminder: Your consultation with Dr. {$doctorName} is {$timeStr} at {$this->appointment->time_slot}. Please arrive 15 mins early. See you soon!";
        \Log::info("SMS Mock sent to Patient ID {$notifiable->id}: {$smsText}");

        return (new MailMessage)
            ->subject('Your Appointment Reminder - JanjiCare')
            ->view('emails.appointment-reminder', [
                'notifiable' => $notifiable,
                'timeStr' => $timeStr,
                'doctorName' => $doctorName,
                'date' => $this->appointment->date->format('F j, Y'),
                'time' => $this->appointment->time_slot,
                'url' => url('/patient/appointments')
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'appointment_id' => $this->appointment->id,
            'type' => $this->type,
        ];
    }
}
