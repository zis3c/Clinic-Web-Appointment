<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Prescription - #{{ $appointment->appointment_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        .clinic-details {
            font-size: 12px;
            color: #666;
        }
        .row {
            width: 100%;
            display: table;
            margin-bottom: 20px;
        }
        .col-half {
            display: table-cell;
            width: 50%;
        }
        .patient-box, .doctor-box {
            border: 1px solid #e5e7eb;
            padding: 15px;
            border-radius: 8px;
            background-color: #f9fafb;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            color: #2563eb;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        .details p {
            margin: 5px 0;
            font-size: 13px;
        }
        .details strong {
            color: #111827;
        }
        .rx-symbol {
            font-size: 48px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 15px;
            font-family: serif;
        }
        .content-box {
            margin-top: 30px;
            min-height: 200px;
        }
        .text-content {
            font-size: 14px;
            white-space: pre-wrap;
        }
        .footer {
            margin-top: 50px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            display: table;
            width: 100%;
        }
        .signature-box {
            display: table-cell;
            width: 40%;
            text-align: center;
            float: right;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            height: 40px;
            margin-bottom: 5px;
        }
        .signature-name {
            font-weight: bold;
            font-size: 14px;
        }
        .signature-title {
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="logo">+ JanjiCare Clinic</div>
        <div class="clinic-details">
            123 Medical Boulevard, Health City, HC 12345<br>
            Phone: (555) 123-4567 | Email: contact@janjicare.com
        </div>
    </div>

    <div class="row">
        <div class="col-half" style="padding-right: 10px;">
            <div class="patient-box details">
                <div class="section-title">Patient Details</div>
                <p><strong>Name:</strong> {{ $appointment->patient->user->name }}</p>
                <p><strong>Contact:</strong> {{ $appointment->patient->tel ?? 'N/A' }}</p>
                <p><strong>Date of Birth:</strong> {{ $appointment->patient->dob ?? 'N/A' }}</p>
            </div>
        </div>
        <div class="col-half" style="padding-left: 10px;">
            <div class="doctor-box details">
                <div class="section-title">Consultation Details</div>
                <p><strong>Doctor:</strong> Dr. {{ $appointment->schedule->doctor->user->name }}</p>
                <p><strong>Specialty:</strong> {{ $appointment->schedule->doctor->specialty->name }}</p>
                <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($appointment->date)->format('F d, Y') }}</p>
                <p><strong>Appt #:</strong> {{ $appointment->appointment_number }}</p>
            </div>
        </div>
    </div>

    <div class="content-box">
        @if($appointment->diagnosis)
            <div class="section-title">Diagnosis</div>
            <div class="text-content mb-4" style="margin-bottom: 20px;">{{ $appointment->diagnosis }}</div>
        @endif

        <div class="rx-symbol">Rx</div>
        
        <div class="text-content">
            @if($appointment->prescriptions)
                {{ $appointment->prescriptions }}
            @else
                <i>No prescriptions issued.</i>
            @endif
        </div>
        
        @if($appointment->notes)
            <div class="section-title" style="margin-top: 30px;">Additional Notes</div>
            <div class="text-content">{{ $appointment->notes }}</div>
        @endif
    </div>

    <div class="footer">
        <div class="col-half details" style="color: #666; font-size: 11px;">
            <p>This is a computer-generated document. No physical signature is required for digital verification.</p>
            <p>Generated on: {{ \Carbon\Carbon::now()->format('F d, Y h:i A') }}</p>
        </div>
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-name">Dr. {{ $appointment->schedule->doctor->user->name }}</div>
            <div class="signature-title">Authorized Signature</div>
        </div>
    </div>

</body>
</html>
