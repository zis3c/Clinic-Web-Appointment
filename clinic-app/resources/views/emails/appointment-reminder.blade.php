<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f8fafc; margin: 0; padding: 0; -webkit-text-size-adjust: none; box-sizing: border-box; }
        .wrapper { background-color: #f8fafc; margin: 0; padding: 0; width: 100%; }
        .content { margin: 0 auto; padding: 32px 0; width: 100%; max-width: 600px; }
        .inner-body { background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin: 0 auto; padding: 32px; width: 100%; max-width: 570px; }
        .header { text-align: center; margin-bottom: 24px; }
        .header-logo { font-size: 24px; font-weight: 800; color: #0f172a; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .logo-icon { background: linear-gradient(to top right, #2dd4bf, #2563eb); color: white; border-radius: 8px; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; }
        .title { color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; text-align: left; }
        .greeting { color: #334155; font-size: 16px; font-weight: 600; margin-bottom: 16px; }
        .message { color: #475569; font-size: 16px; line-height: 1.5; margin-top: 0; margin-bottom: 24px; }
        .card { background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #3b82f6; }
        .detail-row { margin-bottom: 12px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
        .detail-value { color: #0f172a; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .action { text-align: center; margin-bottom: 24px; }
        .button { background: linear-gradient(to right, #2dd4bf, #3b82f6); border-radius: 8px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 24px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3); border: none; }
        .footer { text-align: center; margin-top: 32px; color: #94a3b8; font-size: 14px; }
        .alert { background-color: #fffbeb; color: #b45309; padding: 12px; border-radius: 8px; font-size: 14px; display: flex; align-items: flex-start; gap: 8px; margin-bottom: 24px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="content">
            <div class="header">
                <a href="{{ config('app.url') }}" class="header-logo">
                    <span class="logo-icon">+</span>
                    JanjiCare
                </a>
            </div>
            
            <div class="inner-body">
                <h1 class="title">Appointment Reminder</h1>
                <p class="greeting">Hi {{ $notifiable->name }},</p>
                <p class="message">
                    This is a friendly reminder for your upcoming consultation <strong>{{ $timeStr }}</strong>. We are looking forward to seeing you!
                </p>

                <div class="card">
                    <div class="detail-row">
                        <span class="detail-label">Doctor</span>
                        <span class="detail-value">🩺 Dr. {{ $doctorName }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">📅 {{ $date }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Time</span>
                        <span class="detail-value">⏰ {{ $time }}</span>
                    </div>
                </div>

                <div class="alert">
                    ⚠️ <strong>Please Note:</strong> Arrive 15 minutes early to complete any necessary check-in procedures. If you need to cancel or reschedule, please do so via the portal as soon as possible.
                </div>

                <div class="action">
                    <a href="{{ $url }}" class="button" target="_blank" rel="noopener">Manage Appointment</a>
                </div>

                <p class="message" style="margin-bottom: 0;">
                    Thank you for trusting us with your health.<br>
                    <strong>The JanjiCare Team</strong>
                </p>
            </div>

            <div class="footer">
                &copy; {{ date('Y') }} JanjiCare. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
