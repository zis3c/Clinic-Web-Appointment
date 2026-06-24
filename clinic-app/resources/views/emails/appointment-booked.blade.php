<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Appointment Confirmed</title>
</head>
<body style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0; color: #1e293b;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02); overflow: hidden; border: 1px solid #f1f5f9;">
        <!-- Header -->
        <tr>
            <td align="center" style="background: linear-gradient(135deg, #2dd4bf 0%, #2563eb 100%); padding: 40px 20px;">
                <div style="background-color: rgba(255, 255, 255, 0.2); width: 48px; height: 48px; border-radius: 12px; display: inline-block; text-align: center; line-height: 48px; color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 16px;">
                    +
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">JanjiCare</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Your appointment is confirmed</p>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #475569;">
                    Hello <strong>{{ $appointment->patient->user->name }}</strong>,
                </p>
                <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.5; color: #475569;">
                    Your medical appointment has been successfully scheduled. Here are the details of your session:
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
                        <td style="padding-top: 12px; border-t: 1px solid #e2e8f0;">
                            <span style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</span><br>
                            <span style="font-size: 15px; color: #0f172a; font-weight: 600;">
                                {{ $appointment->date->format('l, F j, Y') }} at {{ \Carbon\Carbon::parse($appointment->schedule->time)->format('h:i A') }}
                            </span>
                        </td>
                        <td style="padding-top: 12px; border-t: 1px solid #e2e8f0;">
                            <span style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Queue Number</span><br>
                            <span style="font-size: 16px; color: #0f172a; font-weight: 800;">#{{ $appointment->appointment_number }}</span>
                        </td>
                    </tr>
                </table>

                <!-- Action notice / accidental booking prevention -->
                <div style="border-top: 1px solid #e2e8f0; padding-top: 30px; text-align: center;">
                    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #64748b;">
                        Did you book this by mistake or need to cancel? Click the secure button below to cancel your booking instantly.
                    </p>
                    <a href="{{ $cancelUrl }}" style="background-color: #ef4444; color: #ffffff; padding: 12px 30px; border-radius: 9999px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2); transition: background-color 0.2s;">
                        Cancel Appointment
                    </a>
                </div>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td align="center" style="background-color: #f1f5f9; padding: 24px 20px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 8px 0;">&copy; {{ date('Y') }} JanjiCare Systems. All rights reserved.</p>
                <p style="margin: 0;">This is an automated security notification regarding your account.</p>
            </td>
        </tr>
    </table>
</body>
</html>
