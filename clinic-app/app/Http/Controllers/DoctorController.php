<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use App\Models\Schedule;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Vital;
use App\Models\Medication;
use App\Models\Prescription;

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
        })->with(['patient.user', 'schedule.doctor.user'])
          ->latest()
          ->take(5)
          ->get();

        // Waiting room: checked in patients ready for consultation or in progress
        $waiting_room = Appointment::whereHas('schedule', function ($q) use ($doctor) {
            $q->where('doctor_id', $doctor->id);
        })->where('checked_in', true)
          ->whereIn('status', ['confirmed', 'in_progress'])
          ->whereNotNull('checked_in_at')
          ->orderBy('checked_in_at', 'asc')
          ->with(['patient.user', 'schedule.doctor.user'])
          ->get();

        $medications = \App\Models\Medication::orderBy('name')->get();

        return Inertia::render('Doctor/Dashboard', [
            'schedules' => $schedules,
            'stats' => [
                'total_appointments' => $total_appointments,
                'total_schedules' => $total_schedules,
                'total_patients' => $total_patients,
            ],
            'recent_appointments' => $recent_appointments,
            'waiting_room' => $waiting_room,
            'medications' => $medications,
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
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required',
            'type' => 'required|in:in_person,virtual',
            'number_of_patients' => 'required|integer|min:1',
            'slot_duration' => 'nullable|integer|min:5|max:180',
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
            'type' => $request->type,
            'number_of_patients' => $request->number_of_patients,
            'slot_duration' => $request->slot_duration ?? 30,
        ]);

        event(new \App\Events\AppointmentUpdated('Schedules updated'));
        return redirect()->back()->with('success', 'Schedule session created successfully.');
    }

    public function destroySchedule(Schedule $schedule)
    {
        // Ensure the doctor owns this schedule
        if ($schedule->doctor_id !== Auth::user()->doctor->id) {
            abort(403);
        }

        $schedule->delete();
        event(new \App\Events\AppointmentUpdated('Schedules updated'));
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

        $medications = Medication::orderBy('name')->get();

        return Inertia::render('Doctor/Appointments', [
            'appointments' => $appointments,
            'medications' => $medications,
        ]);
    }

    public function history()
    {
        $doctor = Auth::user()->doctor;
        
        // Get all completed appointments belonging to schedules owned by this doctor
        $appointments = $doctor ? Appointment::whereHas('schedule', function ($query) use ($doctor) {
            $query->where('doctor_id', $doctor->id);
        })->where('status', 'completed')
          ->with(['patient.user', 'schedule'])
          ->orderBy('date', 'desc')
          ->orderBy('time_slot', 'desc')
          ->get() : [];

        return Inertia::render('Doctor/History', [
            'appointments' => $appointments,
        ]);
    }

    public function destroyAppointment(Appointment $appointment)
    {
        Gate::authorize('delete', $appointment);

        $appointment->delete();
        event(new \App\Events\AppointmentUpdated('Appointments updated'));
        return redirect()->back()->with('success', 'Appointment cancelled successfully.');
    }

    public function callPatient(Appointment $appointment)
    {
        // Ensure the doctor owns this schedule/appointment
        if ($appointment->schedule->doctor_id !== Auth::user()->doctor->id) {
            abort(403);
        }

        $type = $appointment->schedule->type;
        $appointment->update([
            'status' => 'in_progress',
        ]);

        try {
            if ($type === 'virtual') {
                $appointment->patient->user->notify(new \App\Notifications\ClinicNotification(
                    'Telehealth Meeting Ready',
                    "Your doctor is ready. Please join the telehealth meeting now.",
                    'info'
                ));
            } else {
                $appointment->patient->user->notify(new \App\Notifications\ClinicNotification(
                    'Consultation Ready',
                    "Your doctor is ready. Please proceed to the consultation room.",
                    'info'
                ));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to notify patient: ' . $e->getMessage());
        }

        event(new \App\Events\AppointmentUpdated('Patient called'));

        return redirect()->back()->with('success', 'Patient called to consultation room.');
    }

    public function completeAppointment(Request $request, Appointment $appointment)
    {
        // Ensure the doctor owns this schedule/appointment
        if ($appointment->schedule->doctor_id !== Auth::user()->doctor->id) {
            abort(403);
        }

        $request->validate([
            'diagnosis' => 'nullable|string',
            'prescriptions' => 'nullable|string',
            'notes' => 'nullable|string',
            'pharmacy_prescriptions' => 'nullable|array',
            'pharmacy_prescriptions.*.medication_id' => 'required|exists:medications,id',
            'pharmacy_prescriptions.*.dosage' => 'required|string',
            'pharmacy_prescriptions.*.frequency' => 'required|string',
            'pharmacy_prescriptions.*.duration_days' => 'required|integer|min:1',
            'pharmacy_prescriptions.*.quantity_dispensed' => 'required|integer|min:1',
            'pharmacy_prescriptions.*.instructions' => 'nullable|string',
        ]);

        $appointment->update([
            'status' => 'completed',
            'diagnosis' => $request->diagnosis,
            'prescriptions' => $request->prescriptions,
            'notes' => $request->notes,
        ]);

        if ($request->has('pharmacy_prescriptions') && is_array($request->pharmacy_prescriptions)) {
            $hasLowStock = false;
            $lowStockMedications = [];

            foreach ($request->pharmacy_prescriptions as $p) {
                Prescription::create([
                    'appointment_id' => $appointment->id,
                    'medication_id' => $p['medication_id'],
                    'dosage' => $p['dosage'],
                    'frequency' => $p['frequency'],
                    'duration_days' => $p['duration_days'],
                    'quantity_dispensed' => $p['quantity_dispensed'],
                    'instructions' => $p['instructions'] ?? null,
                ]);

                // Deduct inventory
                $med = Medication::find($p['medication_id']);
                if ($med) {
                    $med->stock_quantity -= $p['quantity_dispensed'];
                    $med->save();

                    // Check low stock
                    if ($med->stock_quantity <= $med->low_stock_threshold) {
                        $hasLowStock = true;
                        $lowStockMedications[] = $med->name;
                    }
                }
            }

            // Notify admins of low stock
            if ($hasLowStock) {
                try {
                    $admins = \App\Models\User::role('admin')->get();
                    $medsString = implode(', ', array_unique($lowStockMedications));
                    foreach ($admins as $admin) {
                        $admin->notify(new \App\Notifications\ClinicNotification(
                            'Low Stock Warning',
                            "The following medications are running critically low after recent dispensing: {$medsString}.",
                            'warning'
                        ));
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to notify admins of low stock: ' . $e->getMessage());
                }
            }
        }

        // Send completed status update email and DB notification
        try {
            $appointment->load(['patient.user', 'schedule.doctor.user']);
            
            // Database Notification
            $doctorName = Auth::user()->name;
            $hasPrescription = ($request->has('pharmacy_prescriptions') && count($request->pharmacy_prescriptions) > 0) || !empty($request->prescriptions);
            
            if ($hasPrescription) {
                $appointment->patient->user->notify(new \App\Notifications\ClinicNotification(
                    'New Prescription Added',
                    "Dr. {$doctorName} has added a new prescription to your medical record.",
                    'info'
                ));
            }

            $appointment->patient->user->notify(new \App\Notifications\ClinicNotification(
                'Consultation Completed',
                "Your consultation with Dr. {$doctorName} has been completed. View details in your dashboard.",
                'success'
            ));

            \Illuminate\Support\Facades\Mail::to($appointment->patient->user->email)->send(
                new \App\Mail\AppointmentStatusMail($appointment, 'completed')
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send consultation completed communications: ' . $e->getMessage());
        }

        event(new \App\Events\AppointmentUpdated('Appointment completed'));

        return redirect()->back()->with('success', 'Consultation marked as completed successfully.');
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

        event(new \App\Events\AppointmentUpdated('Appointments updated'));
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

    public function patientEmr(Patient $patient)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            abort(403, 'Access denied.');
        }

        // Verify that this patient has at least one appointment with this doctor
        $hasRelationship = Appointment::where('patient_id', $patient->id)
            ->whereHas('schedule', function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id);
            })
            ->exists();

        if (!$hasRelationship) {
            abort(403, 'You do not have permission to view this patient\'s records.');
        }

        $patient->load(['user', 'vitals.appointment', 'appointments.schedule.doctor', 'appointments.pharmacyPrescriptions.medication']);
        
        return Inertia::render('Doctor/PatientEMR', [
            'patient' => $patient,
        ]);
    }

    public function storeVitals(Request $request, Appointment $appointment)
    {
        // Ensure the doctor owns this schedule/appointment
        if ($appointment->schedule->doctor_id !== Auth::user()->doctor->id) {
            abort(403);
        }

        $validated = $request->validate([
            'blood_pressure' => 'nullable|string|max:20',
            'heart_rate' => 'nullable|integer',
            'temperature' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'respiratory_rate' => 'nullable|integer',
            'notes' => 'nullable|string',
        ]);

        Vital::updateOrCreate(
            ['appointment_id' => $appointment->id],
            array_merge($validated, ['patient_id' => $appointment->patient_id])
        );

        return redirect()->back()->with('success', 'Patient vitals saved successfully.');
    }
}
