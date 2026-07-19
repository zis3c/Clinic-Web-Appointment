<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Appointment Update</title>
</head>
<body style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0; color: #1e293b;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02); overflow: hidden; border: 1px solid #f1f5f9;">
        <!-- Header -->
        <tr>
            <td align="center" style="background: @if($status === 'confirmed') linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) @elseif($status === 'rejected') linear-gradient(135deg, #ef4444 0%, #b91c1c 100%) @else linear-gradient(135deg, #10b981 0%, #047857 100%) @endif; padding: 40px 20px;">
                <div style="background-color: rgba(255, 255, 255, 0.2); width: 48px; height: 48px; border-radius: 12px; display: inline-block; text-align: center; line-height: 48px; color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 16px;">
                    @if($status === 'confirmed') ✓ @elseif($status === 'rejected') ✕ @else 🥼 @endif
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">JanjiCare</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">
                    @if($status === 'confirmed')
                        Your appointment has been confirmed
                    @elseif($status === 'rejected')
                        Your appointment has been rejected
                    @else
                        Your consultation is completed
                    @endif
                </p>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #475569;">
                    Hello <strong>{{ $appointment->patient->user->name }}</strong>,
                </p>
                <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.5; color: #475569;">
                    @if($status === 'confirmed')
                        Your medical appointment request has been approved. Please notify reception upon arrival at the clinic.
                    @elseif($status === 'rejected')
                        We regret to inform you that your medical appointment request has been rejected. Please log in to your dashboard to reschedule.
                    @else
                        Your medical consultation with the doctor is completed. Thank you for choosing JanjiCare.
                    @endif
                </p>

                <!-- Appointment Details Card -->
                <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; padding: 20px; margin-bottom: 30px;">
                    <tr>
                        <td style="padding-bottom: 12px;">
                            <span style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Doctor</span><br>
                            <span style="font-size: 16px; color: #0f172a; font-weight: 700;">Dr. {{ $appointment->schedule->doctor->user->name }}</span>
                        </td>
                        <td style="padding-bottom: 12px;">
                            <span style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Specialty</span><br>
                            <span style="font-size: 15px; color: #2563eb; font-weight: 600;">{{ $appointment->schedule->doctor->specialty->name }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-top: 12px; border-top: 1px solid #e2e8f0;">
                            <span style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</span><br>
                            <span style="font-size: 15px; color: #0f172a; font-weight: 600;">
                                {{ $appointment->date->format('l, F j, Y') }} at {{ \Carbon\Carbon::parse($appointment->schedule->time)->format('h:i A') }}
                            </span>
                        </td>
                        <td style="padding-top: 12px; border-top: 1px solid #e2e8f0;">
                            <span style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Queue Number</span><br>
                            <span style="font-size: 16px; color: #0f172a; font-weight: 800;">#{{ $appointment->appointment_number }}</span>
                        </td>
                    </tr>
                </table>

                <div style="border-top: 1px solid #e2e8f0; padding-top: 30px; text-align: center;">
                    <a href="{{ url('/dashboard') }}" style="background-color: #2563eb; color: #ffffff; padding: 12px 30px; border-radius: 9999px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: background-color 0.2s;">
                        Go to Dashboard
                    </a>
                </div>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td align="center" style="background-color: #f1f5f9; padding: 24px 20px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 8px 0;">&copy; {{ date('Y') }} JanjiCare Systems. All rights reserved.</p>
                <p style="margin: 0;">This is an automated clinical notification regarding your appointment.</p>
            </td>
        </tr>
    </table>
</body>
</html>
