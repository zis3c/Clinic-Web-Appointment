<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Prescription - JanjiCare Clinic</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 14px; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #005A9C; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #005A9C; font-size: 28px; }
        .header p { margin: 5px 0; color: #666; font-size: 14px; }
        .rx-logo { font-size: 48px; font-weight: bold; color: #005A9C; margin-bottom: 20px; }
        .details-container { width: 100%; margin-bottom: 30px; display: table; }
        .details-column { display: table-cell; width: 50%; vertical-align: top; }
        .details-column h3 { margin-top: 0; color: #005A9C; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        .details-table { width: 100%; }
        .details-table td { padding: 4px 0; }
        .details-table td:first-child { font-weight: bold; width: 120px; color: #555; }
        .prescription-box { border: 1px solid #ddd; padding: 20px; background-color: #f9f9f9; min-height: 200px; margin-bottom: 40px; }
        .prescription-box h3 { margin-top: 0; color: #005A9C; }
        .prescription-text { font-family: monospace; font-size: 15px; white-space: pre-wrap; margin-top: 15px; }
        .footer { text-align: center; margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; color: #888; font-size: 12px; }
        .signature-box { float: right; width: 250px; text-align: center; margin-top: 20px; }
        .signature-line { border-bottom: 1px solid #333; margin-bottom: 5px; height: 40px; }
        .clear { clear: both; }
    </style>
</head>
<body>

    <div class="header">
        <h1>JanjiCare Clinic</h1>
        <p>123 Health Avenue, Medical District, Cityville</p>
        <p>Phone: (555) 123-4567 | Email: contact@janjicare.com</p>
    </div>

    <div class="rx-logo">Rx</div>

    <div class="details-container">
        <div class="details-column">
            <h3>Patient Details</h3>
            <table class="details-table">
                <tr><td>Name:</td><td>{{ $appointment->patient->user->name }}</td></tr>
                <tr><td>NIC/ID:</td><td>{{ $appointment->patient->nic }}</td></tr>
                <tr><td>Contact:</td><td>{{ $appointment->patient->tel }}</td></tr>
                <tr><td>DOB:</td><td>{{ $appointment->patient->dob }}</td></tr>
            </table>
        </div>
        <div class="details-column" style="padding-left: 20px;">
            <h3>Consultation Details</h3>
            <table class="details-table">
                <tr><td>Date:</td><td>{{ \Carbon\Carbon::parse($appointment->date)->format('M d, Y') }}</td></tr>
                <tr><td>Doctor:</td><td>Dr. {{ $appointment->schedule->doctor->user->name }}</td></tr>
                <tr><td>Specialty:</td><td>{{ $appointment->schedule->doctor->specialty->name ?? 'General Practice' }}</td></tr>
                <tr><td>Reference:</td><td>#{{ str_pad($appointment->id, 5, '0', STR_PAD_LEFT) }}</td></tr>
            </table>
        </div>
    </div>

    <div class="prescription-box">
        <h3>Prescribed Medication & Instructions</h3>
        <div class="prescription-text">{{ $appointment->prescriptions ?? 'No prescription details provided.' }}</div>
    </div>

    @if($appointment->diagnosis)
    <div style="margin-bottom: 20px;">
        <strong>Diagnosis Notes:</strong>
        <p style="margin-top: 5px;">{{ $appointment->diagnosis }}</p>
    </div>
    @endif

    <div class="signature-box">
        <div class="signature-line"></div>
        <strong>Dr. {{ $appointment->schedule->doctor->user->name }}</strong><br>
        <span style="color: #666; font-size: 12px;">Authorized Signature</span>
    </div>

    <div class="clear"></div>

    <div class="footer">
        <p>This is a computer-generated prescription document. It does not require a physical seal if digitally issued.</p>
        <p>Generated on {{ now()->format('M d, Y h:i A') }}</p>
    </div>

</body>
</html>
