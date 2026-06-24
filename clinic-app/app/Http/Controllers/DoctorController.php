<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Schedule;
use App\Models\Appointment;

class DoctorController extends Controller
{
    public function dashboard()
    {
        $doctor = Auth::user()->doctor;
        if (!$doctor) {
            return Inertia::render('Doctor/Dashboard', [
                'schedules' => [],
                'stats' => [
                    'total_appointments' => 0,
                    'total_schedules' => 0,
                    'total_patients' => 0,
                ],
                'recent_appointments' => [],
            ]);
        }

        $schedules = $doctor->schedules()->with('appointments.patient.user')->orderBy('date', 'asc')->get();

        // Calculate doctor stats
        $total_appointments = Appointment::whereHas('schedule', function ($q) use ($doctor) {
            $q->where('doctor_id', $doctor->id);
        })->count();

        $total_schedules = $doctor->schedules()->count();

        $total_patients = Appointment::whereHas('schedule', function ($q) use ($doctor) {
            $q->where('doctor_id', $doctor->id);
        })->distinct('patient_id')->count('patient_id');

        // Recent appointments
        $recent_appointments = Appointment::whereHas('schedule', function ($q) use ($doctor) {
            $q->where('doctor_id', $doctor->id);
        })->with(['patient.user', 'schedule'])
          ->latest()
          ->take(5)
          ->get();

        return Inertia::render('Doctor/Dashboard', [
            'schedules' => $schedules,
            'stats' => [
                'total_appointments' => $total_appointments,
                'total_schedules' => $total_schedules,
                'total_patients' => $total_patients,
            ],
            'recent_appointments' => $recent_appointments,
        ]);
    }

    // --- SCHEDULES ---
    public function schedules()
    {
        $doctor = Auth::user()->doctor;
        $schedules = $doctor ? $doctor->schedules()->with('appointments.patient.user')->orderBy('date', 'desc')->get() : [];

        return Inertia::render('Doctor/Schedules', [
            'schedules' => $schedules,
        ]);
    }

    public function storeSchedule(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'time' => 'required',
            'number_of_patients' => 'required|integer|min:1',
        ]);

        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            abort(403, 'User is not a doctor.');
        }

        Schedule::create([
            'doctor_id' => $doctor->id,
            'title' => $request->title,
            'date' => $request->date,
            'time' => $request->time,
            'number_of_patients' => $request->number_of_patients,
        ]);

        return redirect()->back()->with('success', 'Schedule session created successfully.');
    }

    public function destroySchedule(Schedule $schedule)
    {
        // Ensure the doctor owns this schedule
        if ($schedule->doctor_id !== Auth::user()->doctor->id) {
            abort(403);
        }

        $schedule->delete();
        return redirect()->back()->with('success', 'Schedule deleted successfully.');
    }

    // --- APPOINTMENTS ---
    public function appointments()
    {
        $doctor = Auth::user()->doctor;
        
        // Get all appointments belonging to schedules owned by this doctor
        $appointments = $doctor ? Appointment::whereHas('schedule', function ($query) use ($doctor) {
            $query->where('doctor_id', $doctor->id);
        })->with(['patient.user', 'schedule'])->orderBy('date', 'desc')->get() : [];

        return Inertia::render('Doctor/Appointments', [
            'appointments' => $appointments,
        ]);
    }

    public function destroyAppointment(Appointment $appointment)
    {
        // Ensure the doctor owns the schedule this appointment is for
        if ($appointment->schedule->doctor_id !== Auth::user()->doctor->id) {
            abort(403);
        }

        $appointment->delete();
        return redirect()->back()->with('success', 'Appointment cancelled successfully.');
    }

    public function bulkDestroyAppointments(Request $request)
    {
        $request->validate([
            'appointment_ids' => 'required|array',
            'appointment_ids.*' => 'exists:appointments,id'
        ]);

        $doctor = Auth::user()->doctor;

        // Fetch appointments that actually belong to this doctor to prevent unauthorized deletion
        $appointments = Appointment::whereIn('id', $request->appointment_ids)
            ->whereHas('schedule', function ($query) use ($doctor) {
                $query->where('doctor_id', $doctor->id);
            })->get();

        foreach ($appointments as $appointment) {
            $appointment->delete();
        }

        return redirect()->back()->with('success', count($appointments) . ' selected appointments cancelled successfully.');
    }

    // --- PATIENTS ---
    public function patients()
    {
        $doctor = Auth::user()->doctor;
        
        // Get unique patients who have booked appointments with this doctor
        $patients = [];
        if ($doctor) {
            $appointments = Appointment::whereHas('schedule', function ($query) use ($doctor) {
                $query->where('doctor_id', $doctor->id);
            })->with('patient.user')->get();

            $patients = $appointments->pluck('patient')->unique('id')->values();
        }

        return Inertia::render('Doctor/Patients', [
            'patients' => $patients,
        ]);
    }
}
