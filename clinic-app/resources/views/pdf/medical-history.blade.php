<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Medical History - {{ $user->name }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 14px; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #005A9C; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #005A9C; font-size: 28px; }
        .header p { margin: 5px 0; color: #666; font-size: 14px; }
        
        .patient-box { border: 1px solid #ddd; background-color: #f9f9f9; padding: 15px; margin-bottom: 30px; }
        .patient-box h3 { margin-top: 0; margin-bottom: 15px; color: #005A9C; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        
        .details-table { width: 100%; border-collapse: collapse; }
        .details-table td { padding: 4px 0; }
        .details-table td:first-child { font-weight: bold; width: 120px; color: #555; }
        .details-table td:nth-child(3) { font-weight: bold; width: 120px; color: #555; padding-left: 20px; }

        .timeline-header { margin-top: 20px; margin-bottom: 15px; color: #005A9C; font-size: 20px; border-bottom: 2px solid #005A9C; padding-bottom: 5px; }

        .appointment-card { border: 1px solid #e0e0e0; margin-bottom: 20px; border-radius: 4px; page-break-inside: avoid; }
        .appointment-header { background-color: #f0f7fb; padding: 10px 15px; border-bottom: 1px solid #e0e0e0; }
        .appointment-header h4 { margin: 0; color: #005A9C; font-size: 16px; }
        .appointment-header .date-time { color: #666; font-size: 13px; float: right; margin-top: 2px; }
        
        .appointment-body { padding: 15px; }
        .section-title { font-weight: bold; color: #444; margin-bottom: 5px; font-size: 13px; text-transform: uppercase; }
        .section-content { margin-bottom: 15px; padding: 10px; background-color: #fafafa; border-left: 3px solid #005A9C; }
        .section-content:last-child { margin-bottom: 0; }
        
        .vitals-grid { display: table; width: 100%; }
        .vitals-item { display: table-cell; width: 25%; text-align: center; }
        .vitals-label { font-size: 11px; color: #888; text-transform: uppercase; }
        .vitals-value { font-weight: bold; font-size: 14px; color: #333; }
        
        .footer { text-align: center; margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; color: #888; font-size: 12px; }
        .clear { clear: both; }
    </style>
</head>
<body>

    <div class="header">
        <h1>JanjiCare Clinic</h1>
        <p>123 Health Avenue, Medical District, Cityville</p>
        <p>Comprehensive Medical History Report</p>
    </div>

    <div class="patient-box">
        <h3>Patient Information</h3>
        <table class="details-table">
            <tr>
                <td>Name:</td><td>{{ $user->name }}</td>
                <td>NIC/ID:</td><td>{{ $patient->nic }}</td>
            </tr>
            <tr>
                <td>Contact:</td><td>{{ $patient->tel }}</td>
                <td>DOB:</td><td>{{ $patient->dob }}</td>
            </tr>
            <tr>
                <td>Gender:</td><td>{{ ucfirst($patient->gender) ?? 'N/A' }}</td>
                <td>Blood Group:</td><td>{{ $patient->blood_group ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Allergies:</td><td colspan="3">{{ $patient->allergies ?? 'None reported' }}</td>
            </tr>
            <tr>
                <td>Conditions:</td><td colspan="3">{{ $patient->medical_conditions ?? 'None reported' }}</td>
            </tr>
        </table>
    </div>

    <div class="timeline-header">Consultation History</div>

    @if($appointments->count() > 0)
        @foreach($appointments as $apt)
            <div class="appointment-card">
                <div class="appointment-header">
                    <div class="date-time">
                        {{ \Carbon\Carbon::parse($apt->date)->format('M d, Y') }} at {{ $apt->time_slot }}
                    </div>
                    <h4>Dr. {{ $apt->schedule->doctor->user->name ?? 'Unknown' }} ({{ $apt->schedule->doctor->specialty->name ?? 'General Practice' }})</h4>
                    <div class="clear"></div>
                </div>
                
                <div class="appointment-body">
                    
                    @if($apt->vital)
                    <div class="section-title">Vitals</div>
                    <div class="section-content" style="border-left-color: #10B981;">
                        <div class="vitals-grid">
                            <div class="vitals-item">
                                <div class="vitals-label">Temperature</div>
                                <div class="vitals-value">{{ $apt->vital->temperature ? $apt->vital->temperature . ' °C' : '-' }}</div>
                            </div>
                            <div class="vitals-item">
                                <div class="vitals-label">Blood Pressure</div>
                                <div class="vitals-value">{{ $apt->vital->blood_pressure_systolic && $apt->vital->blood_pressure_diastolic ? $apt->vital->blood_pressure_systolic . '/' . $apt->vital->blood_pressure_diastolic : '-' }}</div>
                            </div>
                            <div class="vitals-item">
                                <div class="vitals-label">Heart Rate</div>
                                <div class="vitals-value">{{ $apt->vital->heart_rate ? $apt->vital->heart_rate . ' bpm' : '-' }}</div>
                            </div>
                            <div class="vitals-item">
                                <div class="vitals-label">Weight</div>
                                <div class="vitals-value">{{ $apt->vital->weight ? $apt->vital->weight . ' kg' : '-' }}</div>
                            </div>
                        </div>
                    </div>
                    @endif

                    @if($apt->diagnosis)
                    <div class="section-title">Diagnosis & Notes</div>
                    <div class="section-content" style="border-left-color: #F43F5E;">
                        {{ $apt->diagnosis }}
                        @if($apt->notes)
                        <div style="margin-top: 10px; font-size: 13px; color: #555;"><strong>Notes:</strong> {{ $apt->notes }}</div>
                        @endif
                    </div>
                    @endif

                    @if($apt->prescriptions || ($apt->pharmacyPrescriptions && $apt->pharmacyPrescriptions->count() > 0))
                    <div class="section-title">Prescriptions</div>
                    <div class="section-content" style="border-left-color: #F59E0B;">
                        @if($apt->prescriptions)
                            <div>{{ $apt->prescriptions }}</div>
                        @endif
                        
                        @if($apt->pharmacyPrescriptions && $apt->pharmacyPrescriptions->count() > 0)
                            <ul style="margin-top: 5px; margin-bottom: 0; padding-left: 20px; font-size: 13px;">
                            @foreach($apt->pharmacyPrescriptions as $rx)
                                <li><strong>{{ $rx->medication->name }}</strong> - {{ $rx->dosage }}, {{ $rx->frequency }} for {{ $rx->duration }}</li>
                            @endforeach
                            </ul>
                        @endif
                    </div>
                    @endif
                </div>
            </div>
        @endforeach
    @else
        <p style="text-align: center; color: #777; margin-top: 30px;">No completed appointments found in history.</p>
    @endif

    <div class="footer">
        <p>This is a computer-generated medical history report. Confidential and intended solely for the patient.</p>
        <p>Generated on {{ now()->format('M d, Y h:i A') }}</p>
    </div>

</body>
</html>
