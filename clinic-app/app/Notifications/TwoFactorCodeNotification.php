<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TwoFactorCodeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $code;

    /**
     * Create a new notification instance.
     */
    public function __construct($code)
    {
        $this->code = $code;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Your Two-Factor Authentication Code')
                    ->line('Your two-factor authentication code is:')
                    ->line(new \Illuminate\Support\HtmlString('<div style="font-size: 24px; font-weight: bold; padding: 10px; background: #f3f4f6; text-align: center; border-radius: 8px; letter-spacing: 5px;">' . $this->code . '</div>'))
                    ->line('This code will expire in 10 minutes.')
                    ->line('If you did not request this code, please ignore this email or secure your account.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
