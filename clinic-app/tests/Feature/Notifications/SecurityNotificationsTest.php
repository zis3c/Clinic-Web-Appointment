<?php

namespace Tests\Feature\Notifications;

use App\Models\User;
use App\Notifications\TwoFactorCodeNotification;
use App\Notifications\VerifyEmailOtpNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityNotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_two_factor_code_notification_builds_correct_mail()
    {
        $user = User::factory()->create();
        $code = '123456';

        $notification = new TwoFactorCodeNotification($code);
        $mail = $notification->toMail($user);

        $this->assertEquals('Your Two-Factor Authentication Code', $mail->subject);
        $this->assertContains('Your two-factor authentication code is:', $mail->introLines);
        
        // Ensure the HTML string contains the code
        $htmlFound = false;
        foreach ($mail->introLines as $line) {
            if ($line instanceof \Illuminate\Support\HtmlString) {
                if (strpos($line->toHtml(), '123456') !== false) {
                    $htmlFound = true;
                }
            }
        }
        $this->assertTrue($htmlFound, 'The 2FA code was not found in the HTML string.');
        
        $this->assertContains('This code will expire in 10 minutes.', $mail->introLines);
    }

    public function test_verify_email_otp_notification_builds_correct_mail()
    {
        $user = User::factory()->create();
        $code = '654321';

        $notification = new VerifyEmailOtpNotification($code);
        $mail = $notification->toMail($user);

        $this->assertEquals('JanjiCare - Email Verification Code', $mail->subject);
        $this->assertContains('Thank you for signing up for JanjiCare. To complete your registration and verify your email address, please use the 6-digit verification code below:', $mail->introLines);
        $this->assertContains('**654321**', $mail->introLines);
        $this->assertContains('This code will expire in 15 minutes. If you did not request this verification code, please ignore this email.', $mail->introLines);
    }
}
