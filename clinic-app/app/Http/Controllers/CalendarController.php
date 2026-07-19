<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CalendarController extends Controller
{
    public function downloadIcs(Appointment $appointment)
    {
        $user = Auth::user();

        // Ensure user is authorized
        $isAuthorized = false;

        if ($user->role === 'admin') {
            $isAuthorized = true;
        } elseif ($user->role === 'patient' && $appointment->patient->user_id === $user->id) {
            $isAuthorized = true;
        } elseif ($user->role === 'doctor' && $appointment->schedule->doctor->user_id === $user->id) {
            $isAuthorized = true;
        }

        if (!$isAuthorized) {
            abort(403, 'Unauthorized action.');
        }

        $appointment->load(['patient.user', 'schedule.doctor.user']);

        $date = Carbon::parse($appointment->date);
        
        // Parse time_slot (e.g., "10:00 AM - 10:30 AM" or time string)
        $startTime = Carbon::parse($appointment->schedule->time);
        
        $startDateTime = $date->copy()->setTimeFrom($startTime);
        $endDateTime = $startDateTime->copy()->addMinutes($appointment->schedule->slot_duration ?? 30);

        // Format dates for ICS (UTC, YYYYMMDDTHHMMSSZ)
        $dtstart = $startDateTime->utc()->format('Ymd\THis\Z');
        $dtend = $endDateTime->utc()->format('Ymd\THis\Z');
        $dtstamp = now()->utc()->format('Ymd\THis\Z');

        $doctorName = $appointment->schedule->doctor->user->name;
        $patientName = $appointment->patient->user->name;
        
        $summary = "Medical Appointment with Dr. {$doctorName}";
        $description = "Appointment Reference: #{$appointment->appointment_number}\\nPatient: {$patientName}\\nClinic: JanjiCare Clinic";
        $uid = "appointment-{$appointment->id}@janjicare.com";

        $ics = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//JanjiCare Clinic//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "BEGIN:VEVENT",
            "SUMMARY:{$summary}",
            "UID:{$uid}",
            "SEQUENCE:0",
            "STATUS:CONFIRMED",
            "TRANSP:OPAQUE",
            "DTSTART:{$dtstart}",
            "DTEND:{$dtend}",
            "DTSTAMP:{$dtstamp}",
            "DESCRIPTION:{$description}",
            "LOCATION:JanjiCare Clinic, 123 Health Avenue",
            "END:VEVENT",
            "END:VCALENDAR"
        ];

        $content = implode("\r\n", $ics);

        return response($content)
            ->header('Content-Type', 'text/calendar; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="appointment-' . $appointment->appointment_number . '.ics"');
    }
}
