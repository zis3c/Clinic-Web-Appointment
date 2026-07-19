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
    private const CANCELLABLE_STATUSES = ['pending', 'confirmed'];

    private function getQueuePositionsForAppointments($appointments)
    {
        $scheduleIds = collect($appointments)->where('checked_in', true)->where('status', 'confirmed')->pluck('schedule_id')->unique();
        
        $queuePositions = [];
        if ($scheduleIds->isNotEmpty()) {
            $allCheckedIn = Appointment::whereIn('schedule_id', $scheduleIds)
                ->where('checked_in', true)
                ->where('status', 'confirmed')
                ->orderBy('checked_in_at', 'asc')
                ->get();
            
            $scheduleQueues = $allCheckedIn->groupBy('schedule_id');
            foreach ($scheduleQueues as $schId => $apts) {
                $pos = 1;
                foreach ($apts as $a) {
                    $queuePositions[$a->id] = $pos++;
                }
            }
        }
        
        return $queuePositions;
    }

    private function mapAppointment($apt, $queuePositions = [])
    {
        $queueInfo = null;

        if ($apt->checked_in && $apt->status === 'confirmed' && isset($queuePositions[$apt->id])) {
            $position = $queuePositions[$apt->id];

            $queueInfo = [
                'position' => $position,
                'patients_ahead' => max(0, $position - 1),
                'estimated_wait_minutes' => max(0, ($position - 1) * 15),
            ];
        }

        return array_merge($apt->toArray(), [
            'schedule' => $apt->schedule ? array_merge($apt->schedule->toArray(), [
                'doctor' => $apt->schedule->doctor ? $apt->schedule->doctor->toArray() : null,
            ]) : null,
            'queue_info' => $queueInfo,
            'diagnosis' => $apt->diagnosis,
            'prescriptions' => $apt->prescriptions,
            'notes' => $apt->notes,
        ]);
    }

    private function generateAllowedTimeSlots(Schedule $schedule): array
    {
        $slots = [];
        $slotCount = max(1, (int) $schedule->number_of_patients);
        $slotDuration = max(1, (int) ($schedule->slot_duration ?? 30));
        $start = now()->setTimeFromTimeString((string) $schedule->time);

        for ($index = 0; $index < $slotCount; $index++) {
            $slot = $start->copy()->addMinutes($index * $slotDuration);
            $slots[] = $slot->format('H:i:s');
        }

        return $slots;
    }

    private function canCancelAppointment(Appointment $appointment): bool
    {
        if (! in_array($appointment->status, self::CANCELLABLE_STATUSES, true)) {
            return false;
        }

        if ($appointment->checked_in) {
            return false;
        }

        return $appointment->date->greaterThanOrEqualTo(today());
    }

    private function cancelAppointmentRecord(Appointment $appointment): void
    {
        $appointment->forceFill([
            'status' => 'cancelled',
            'checked_in' => false,
            'checked_in_at' => null,
        ])->save();
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

        $queuePositions = $this->getQueuePositionsForAppointments($appointments);
        $mappedAppointments = collect($appointments)->map(fn($apt) => $this->mapAppointment($apt, $queuePositions))->all();

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
        // Get all upcoming schedules (including yesterday to handle midnight active sessions)
        $schedules = Schedule::with(['doctor.user', 'doctor.specialty', 'appointments:id,schedule_id,patient_id,time_slot,status'])
            ->where('date', '>=', now()->subDays(1)->format('Y-m-d'))
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

        $queuePositions = $this->getQueuePositionsForAppointments($appointments);
        $mappedAppointments = collect($appointments)->map(fn($apt) => $this->mapAppointment($apt, $queuePositions))->all();

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

        $queuePositions = $this->getQueuePositionsForAppointments($appointments);
        $mappedAppointments = collect($appointments)->map(fn($apt) => $this->mapAppointment($apt, $queuePositions))->all();

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

        return \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            $schedule = Schedule::with(['doctor.user'])->lockForUpdate()->findOrFail($request->schedule_id);
            $allowedSlots = $this->generateAllowedTimeSlots($schedule);
            
            // Check if schedule is in the past
            if ($schedule->date->lessThan(today())) {
                abort(403, 'Cannot book appointments for past schedules.');
            }

            if (! in_array($request->time_slot, $allowedSlots, true)) {
                return redirect()->back()->withErrors([
                    'time_slot' => 'Please choose a valid time slot within this schedule.',
                ]);
            }
            
            // Check if schedule is full
            $activeAppointments = Appointment::where('schedule_id', $schedule->id)
                ->whereNotIn('status', ['rejected', 'cancelled'])
                ->count();

            if ($activeAppointments >= $schedule->number_of_patients) {
                return redirect()->back()->withErrors(['schedule_id' => 'This session is already fully booked.']);
            }

            // Check if time slot is already taken on this schedule
            $slotTaken = Appointment::where('schedule_id', $request->schedule_id)
                ->where('time_slot', $request->time_slot)
                ->whereNotIn('status', ['rejected', 'cancelled'])
                ->exists();

            if ($slotTaken) {
                return redirect()->back()->withErrors(['schedule_id' => 'This specific time slot has already been booked. Please choose another one.']);
            }

            $patient = Auth::user()->patient;

            // One Active Booking Rule: Check if patient already has an upcoming appointment
            $hasUpcoming = Appointment::where('patient_id', $patient->id)
                ->where('date', '>=', date('Y-m-d'))
                ->whereNotIn('status', ['rejected', 'completed', 'cancelled'])
                ->exists();

            if ($hasUpcoming) {
                return redirect()->back()->withErrors(['schedule_id' => 'You already have an upcoming appointment. Patients are limited to one active appointment at a time to prevent hoarding.']);
            }

            // Check if patient already booked this schedule
            $existing = Appointment::where('patient_id', $patient->id)
                ->where('schedule_id', $schedule->id)
                ->whereNotIn('status', ['rejected', 'cancelled'])
                ->first();

            if ($existing) {
                return redirect()->back()->withErrors(['schedule_id' => 'You have already booked an appointment for this session.']);
            }

            // Generate unpredictable 4-digit appointment number (e.g. 8492)
            do {
                $appNo = random_int(1000, 9999);
            } while (Appointment::where('appointment_number', $appNo)->exists());

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

                // Notify Admins in-app
                $admins = \App\Models\User::role('admin')->get();
                foreach ($admins as $admin) {
                    $admin->notify(new \App\Notifications\ClinicNotification(
                        'New Appointment Booked',
                        "Patient {$patientName} has booked an appointment for {$schedule->title} at {$request->time_slot}.",
                        'info'
                    ));
                }
            } catch (\Exception $e) {
                \Log::error('Failed to notify doctor of new booking: ' . $e->getMessage());
            }

            // Broadcast the update so other patients see updated availability
            broadcast(new \App\Events\AppointmentUpdated('Schedule availability updated'));

            // Generate temporary signed cancel link
            $cancelUrl = URL::temporarySignedRoute(
                'appointments.cancel-from-email',
                now()->addDays(7),
                ['appointment' => $appointment->id]
            );

            // Send email
            try {
                Mail::to(Auth::user()->email)->queue(new \App\Mail\AppointmentBookedMail($appointment, $cancelUrl));
            } catch (\Exception $e) {
                \Log::error('Failed to send appointment confirmation email: ' . $e->getMessage());
            }

            return redirect()->back()->with('success', 'Appointment booked successfully! Your appointment number is #' . $appNo);
        });
    }

    public function destroyAppointment(Appointment $appointment)
    {
        Gate::authorize('delete', $appointment);

        if (! $this->canCancelAppointment($appointment)) {
            return redirect()->back()->withErrors(['appointment' => 'This appointment can no longer be cancelled.']);
        }

        // Notify doctor in-app if cancelled
        try {
            $appointment->load('schedule.doctor.user');
            $patientName = Auth::user()->name;
            if ($appointment->schedule && $appointment->schedule->doctor && $appointment->schedule->doctor->user) {
                $appointment->schedule->doctor->user->notify(new \App\Notifications\ClinicNotification(
                    'Appointment Cancelled',
                    "Patient {$patientName} has cancelled their appointment for {$appointment->schedule->title} at {$appointment->time_slot}.",
                    'warning'
                ));
            }

            // Notify Admins
            $admins = \App\Models\User::role('admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\ClinicNotification(
                    'Appointment Cancelled',
                    "Patient {$patientName} has cancelled their appointment for {$appointment->schedule->title} at {$appointment->time_slot}.",
                    'warning'
                ));
            }
        } catch (\Exception $e) {
            \Log::error('Failed to notify doctor of cancellation: ' . $e->getMessage());
        }

        $this->cancelAppointmentRecord($appointment);

        // Broadcast the update so other patients see updated availability
        broadcast(new \App\Events\AppointmentUpdated('Schedule availability updated'));

        return redirect()->route('patient.appointments.index')->with('success', 'Appointment cancelled successfully.');
    }

    public function cancelFromEmail(Request $request, Appointment $appointment)
    {
        if ($request->isMethod('delete')) {
            if (! $this->canCancelAppointment($appointment)) {
                abort(403, 'This appointment can no longer be cancelled.');
            }

            $this->cancelAppointmentRecord($appointment);
            broadcast(new \App\Events\AppointmentUpdated('Schedule availability updated'));

            return redirect()->route('login')->with('success', 'Your appointment has been cancelled successfully.');
        }

        if (! $this->canCancelAppointment($appointment)) {
            abort(403, 'This appointment can no longer be cancelled.');
        }

        return view('appointments.cancel-confirm', [
            'appointment' => $appointment->load(['patient.user', 'schedule.doctor.user', 'schedule.doctor.specialty']),
            'cancelUrl' => request()->fullUrl(),
        ]);
    }

    public function exportHistoryPdf()
    {
        $patient = Auth::user()->patient;
        
        if (!$patient) {
            abort(404, 'Patient record not found.');
        }

        $appointments = $patient->appointments()
            ->where('status', 'completed')
            ->with(['schedule.doctor.user', 'schedule.doctor.specialty', 'vital', 'pharmacyPrescriptions.medication'])
            ->orderBy('date', 'desc')
            ->orderBy('time_slot', 'desc')
            ->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.medical-history', [
            'patient' => $patient,
            'user' => Auth::user(),
            'appointments' => $appointments
        ]);

        return $pdf->download('Medical_History_' . Auth::user()->name . '.pdf');
    }
}
