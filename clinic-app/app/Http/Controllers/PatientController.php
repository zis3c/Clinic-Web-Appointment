<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Doctor;
use App\Models\Schedule;
use App\Models\Appointment;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

class PatientController extends Controller
{
    public function dashboard()
    {
        $patient = Auth::user()->patient;
        $appointments = $patient ? $patient->appointments()->with(['schedule.doctor.user', 'schedule.doctor.specialty'])->orderBy('date', 'desc')->get() : [];

        return Inertia::render('Patient/Dashboard', [
            'appointments' => $appointments,
        ]);
    }

    public function doctors()
    {
        $doctors = Doctor::with(['user', 'specialty'])->get();
        return Inertia::render('Patient/Doctors', [
            'doctors' => $doctors,
        ]);
    }

    // --- SCHEDULES & BOOKING ---
    public function schedules()
    {
        // Get all upcoming schedules
        $schedules = Schedule::with(['doctor.user', 'doctor.specialty', 'appointments'])
            ->where('date', '>=', date('Y-m-d'))
            ->orderBy('date', 'asc')
            ->get();

        return Inertia::render('Patient/Schedules', [
            'schedules' => $schedules,
        ]);
    }

    public function appointments()
    {
        $patient = Auth::user()->patient;
        $appointments = $patient ? $patient->appointments()->with(['schedule.doctor.user', 'schedule.doctor.specialty'])->orderBy('date', 'desc')->get() : [];

        return Inertia::render('Patient/Appointments', [
            'appointments' => $appointments,
        ]);
    }

    public function storeAppointment(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
        ]);

        $schedule = Schedule::with('appointments')->findOrFail($request->schedule_id);
        
        // Check if schedule is full
        if ($schedule->appointments->count() >= $schedule->number_of_patients) {
            return redirect()->back()->withErrors(['schedule_id' => 'This session is already fully booked.']);
        }

        $patient = Auth::user()->patient;

        // One Active Booking Rule: Check if patient already has an upcoming appointment
        $hasUpcoming = Appointment::where('patient_id', $patient->id)
            ->where('date', '>=', date('Y-m-d'))
            ->whereNotIn('status', ['rejected', 'completed'])
            ->exists();

        if ($hasUpcoming) {
            return redirect()->back()->withErrors(['schedule_id' => 'You already have an upcoming appointment. Patients are limited to one active appointment at a time to prevent hoarding.']);
        }

        // Check if patient already booked this schedule
        $existing = Appointment::where('patient_id', $patient->id)
            ->where('schedule_id', $schedule->id)
            ->whereNotIn('status', ['rejected'])
            ->first();

        if ($existing) {
            return redirect()->back()->withErrors(['schedule_id' => 'You have already booked an appointment for this session.']);
        }

        // Generate appointment number
        $appointmentCount = Appointment::where('schedule_id', $schedule->id)->count();
        $appNo = $appointmentCount + 1;

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'schedule_id' => $schedule->id,
            'appointment_number' => $appNo,
            'date' => $schedule->date,
        ]);

        // Generate temporary signed cancel link
        $cancelUrl = URL::temporarySignedRoute(
            'appointments.cancel-from-email',
            now()->addDays(7),
            ['appointment' => $appointment->id]
        );

        // Send email
        try {
            Mail::to(Auth::user()->email)->send(new \App\Mail\AppointmentBookedMail($appointment, $cancelUrl));
        } catch (\Exception $e) {
            \Log::error('Failed to send appointment confirmation email: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Appointment booked successfully! Your appointment number is #' . $appNo);
    }

    public function destroyAppointment(Appointment $appointment)
    {
        Gate::authorize('delete', $appointment);

        $appointment->delete();
        return redirect()->back()->with('success', 'Appointment cancelled successfully.');
    }

    public function cancelFromEmail(Appointment $appointment)
    {
        $appointment->delete();
        return redirect()->route('login')->with('success', 'Your appointment has been cancelled successfully.');
    }
}
