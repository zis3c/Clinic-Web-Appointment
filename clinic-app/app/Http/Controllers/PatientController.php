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
    private function mapAppointment($apt)
    {
        $queueInfo = null;

        if ($apt->checked_in && $apt->status === 'confirmed') {
            $position = Appointment::where('schedule_id', $apt->schedule_id)
                ->where('checked_in', true)
                ->where('status', 'confirmed')
                ->where('checked_in_at', '<=', $apt->checked_in_at)
                ->count();

            $queueInfo = [
                'position' => $position,
                'patients_ahead' => max(0, $position - 1),
                'estimated_wait_minutes' => max(0, ($position - 1) * 15),
            ];
        }

        return array_merge($apt->toArray(), [
            'schedule' => $apt->schedule ? array_merge($apt->schedule->toArray(), [
                'doctor' => $apt->schedule->doctor ? $apt->schedule->doctor->load('user', 'specialty')->toArray() : null,
            ]) : null,
            'queue_info' => $queueInfo,
            'diagnosis' => $apt->diagnosis,
            'prescriptions' => $apt->prescriptions,
            'notes' => $apt->notes,
        ]);
    }

    public function profile()
    {
        $patient = Auth::user()->patient;
        return Inertia::render('Patient/Profile', [
            'patientData' => $patient,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'gender' => 'nullable|string|max:20',
            'blood_group' => 'nullable|string|max:5',
            'allergies' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
        ]);

        $patient = Auth::user()->patient;
        
        if ($patient) {
            $patient->update([
                'gender' => $request->gender,
                'blood_group' => $request->blood_group,
                'allergies' => $request->allergies,
                'medical_conditions' => $request->medical_conditions,
            ]);
        }

        return redirect()->back()->with('success', 'Medical profile updated successfully.');
    }

    public function dashboard()
    {
        $patient = Auth::user()->patient;
        $appointments = $patient ? $patient->appointments()->with(['schedule.doctor.user', 'schedule.doctor.specialty'])->orderBy('date', 'desc')->get() : [];

        $mappedAppointments = collect($appointments)->map(fn($apt) => $this->mapAppointment($apt))->all();

        return Inertia::render('Patient/Dashboard', [
            'appointments' => $mappedAppointments,
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

        $mappedAppointments = collect($appointments)->map(fn($apt) => $this->mapAppointment($apt))->all();

        return Inertia::render('Patient/Appointments', [
            'appointments' => $mappedAppointments,
        ]);
    }

    public function history()
    {
        $patient = Auth::user()->patient;
        
        // Fetch only completed appointments
        $appointments = $patient ? $patient->appointments()
            ->where('status', 'completed')
            ->with(['schedule.doctor.user', 'schedule.doctor.specialty'])
            ->orderBy('date', 'desc')
            ->orderBy('time_slot', 'desc')
            ->get() : [];

        $mappedAppointments = collect($appointments)->map(fn($apt) => $this->mapAppointment($apt))->all();

        return Inertia::render('Patient/History', [
            'appointments' => $mappedAppointments,
        ]);
    }

    public function storeAppointment(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'time_slot' => 'required|string',
        ]);

        $schedule = Schedule::with(['appointments', 'doctor.user'])->findOrFail($request->schedule_id);
        
        // Check if schedule is full
        if ($schedule->appointments->count() >= $schedule->number_of_patients) {
            return redirect()->back()->withErrors(['schedule_id' => 'This session is already fully booked.']);
        }

        // Check if time slot is already taken on this schedule
        $slotTaken = Appointment::where('schedule_id', $request->schedule_id)
            ->where('time_slot', $request->time_slot)
            ->whereNotIn('status', ['rejected'])
            ->exists();

        if ($slotTaken) {
            return redirect()->back()->withErrors(['schedule_id' => 'This specific time slot has already been booked. Please choose another one.']);
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
            'time_slot' => $request->time_slot,
        ]);

        // Notify Doctor in-app
        try {
            if ($schedule->doctor && $schedule->doctor->user) {
                $patientName = Auth::user()->name;
                $schedule->doctor->user->notify(new \App\Notifications\ClinicNotification(
                    'New Appointment Booked',
                    "Patient {$patientName} has booked an appointment for {$schedule->title} at {$request->time_slot}.",
                    'info'
                ));
            }
        } catch (\Exception $e) {
            \Log::error('Failed to notify doctor of new booking: ' . $e->getMessage());
        }

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

        // Notify doctor in-app if cancelled
        try {
            $appointment->load('schedule.doctor.user');
            if ($appointment->schedule && $appointment->schedule->doctor && $appointment->schedule->doctor->user) {
                $patientName = Auth::user()->name;
                $appointment->schedule->doctor->user->notify(new \App\Notifications\ClinicNotification(
                    'Appointment Cancelled',
                    "Patient {$patientName} has cancelled their appointment for {$appointment->schedule->title} at {$appointment->time_slot}.",
                    'warning'
                ));
            }
        } catch (\Exception $e) {
            \Log::error('Failed to notify doctor of booking cancellation: ' . $e->getMessage());
        }

        $appointment->delete();
        return redirect()->back()->with('success', 'Appointment cancelled successfully.');
    }

    public function cancelFromEmail(Appointment $appointment)
    {
        $appointment->delete();
        return redirect()->route('login')->with('success', 'Your appointment has been cancelled successfully.');
    }
}
