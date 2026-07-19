<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PrescriptionController extends Controller
{
    public function downloadPdf(Appointment $appointment)
    {
        $user = Auth::user();
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

        $appointment->load(['patient.user', 'schedule.doctor.user', 'schedule.doctor.specialty']);

        $pdf = Pdf::loadView('pdf.prescription', [
            'appointment' => $appointment
        ]);

        return $pdf->download('Prescription_' . $appointment->appointment_number . '.pdf');
    }
}
