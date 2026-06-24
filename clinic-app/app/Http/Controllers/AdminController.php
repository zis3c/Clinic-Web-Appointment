<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Schedule;
use App\Models\Appointment;
use App\Models\Specialty;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rules;

class AdminController extends Controller
{
    public function dashboard()
    {
        $appointments = Appointment::with(['patient.user', 'schedule.doctor.user'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'doctorCount' => Doctor::count(),
            'patientCount' => Patient::count(),
            'appointmentCount' => Appointment::count(),
            'scheduleCount' => Schedule::count(),
            'appointments' => $appointments,
        ]);
    }

    // --- DOCTORS ---
    public function doctors()
    {
        return Inertia::render('Admin/Doctors', [
            'doctors' => Doctor::with(['user', 'specialty'])->get(),
            'specialties' => Specialty::all(),
        ]);
    }

    public function storeDoctor(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'nic' => 'required|string|max:20',
            'tel' => 'required|string|max:20',
            'specialty_id' => 'required|exists:specialties,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'doctor',
        ]);

        Doctor::create([
            'user_id' => $user->id,
            'nic' => $request->nic,
            'tel' => $request->tel,
            'specialty_id' => $request->specialty_id,
        ]);

        return redirect()->back()->with('success', 'Doctor added successfully.');
    }

    public function updateDoctor(Request $request, Doctor $doctor)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$doctor->user_id,
            'nic' => 'required|string|max:20',
            'tel' => 'required|string|max:20',
            'specialty_id' => 'required|exists:specialties,id',
        ]);

        $doctor->user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->filled('password')) {
            $doctor->user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        $doctor->update([
            'nic' => $request->nic,
            'tel' => $request->tel,
            'specialty_id' => $request->specialty_id,
        ]);

        return redirect()->back()->with('success', 'Doctor updated successfully.');
    }

    public function destroyDoctor(Doctor $doctor)
    {
        // Deleting the user will cascade and delete the doctor record.
        $doctor->user->delete();
        return redirect()->back()->with('success', 'Doctor deleted successfully.');
    }

    public function bulkDestroyDoctors(Request $request)
    {
        $request->validate([
            'doctor_ids' => 'required|array',
            'doctor_ids.*' => 'exists:doctors,id',
        ]);
        
        $userIds = Doctor::whereIn('id', $request->doctor_ids)->pluck('user_id');
        User::whereIn('id', $userIds)->delete();
        
        return redirect()->back()->with('success', 'Selected doctors deleted successfully.');
    }

    // --- PATIENTS ---
    public function patients()
    {
        return Inertia::render('Admin/Patients', [
            'patients' => Patient::with('user')->get(),
        ]);
    }

    public function destroyPatient(Patient $patient)
    {
        $patient->user->delete();
        return redirect()->back()->with('success', 'Patient deleted successfully.');
    }

    public function bulkDestroyPatients(Request $request)
    {
        $request->validate([
            'patient_ids' => 'required|array',
            'patient_ids.*' => 'exists:patients,id',
        ]);
        
        $userIds = Patient::whereIn('id', $request->patient_ids)->pluck('user_id');
        User::whereIn('id', $userIds)->delete();
        
        return redirect()->back()->with('success', 'Selected patients deleted successfully.');
    }

    // --- SCHEDULES ---
    public function schedules()
    {
        return Inertia::render('Admin/Schedules', [
            'schedules' => Schedule::with(['doctor.user', 'appointments'])->get(),
            'doctors' => Doctor::with('user')->get(),
        ]);
    }

    public function storeSchedule(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'doctor_ids' => 'required|array|min:1',
            'doctor_ids.*' => 'exists:doctors,id',
            'date' => 'required|date',
            'time' => 'required',
            'number_of_patients' => 'required|integer|min:1',
        ]);

        foreach ($request->doctor_ids as $doctorId) {
            Schedule::create([
                'title' => $request->title,
                'doctor_id' => $doctorId,
                'date' => $request->date,
                'time' => $request->time,
                'number_of_patients' => $request->number_of_patients,
            ]);
        }

        return redirect()->back()->with('success', 'Schedule added successfully.');
    }

    public function destroySchedule(Schedule $schedule)
    {
        $schedule->delete();
        return redirect()->back()->with('success', 'Schedule deleted successfully.');
    }

    public function bulkDestroySchedules(Request $request)
    {
        $request->validate([
            'schedule_ids' => 'required|array',
            'schedule_ids.*' => 'exists:schedules,id',
        ]);
        
        Schedule::whereIn('id', $request->schedule_ids)->delete();
        
        return redirect()->back()->with('success', 'Selected schedules deleted successfully.');
    }

    // --- APPOINTMENTS ---
    public function appointments()
    {
        return Inertia::render('Admin/Appointments', [
            'appointments' => Appointment::with(['patient.user', 'schedule.doctor.user'])->get(),
        ]);
    }

    public function destroyAppointment(Appointment $appointment)
    {
        Gate::authorize('delete', $appointment);

        $appointment->delete();
        return redirect()->back()->with('success', 'Appointment deleted successfully.');
    }

    public function bulkDestroyAppointments(Request $request)
    {
        $request->validate([
            'appointment_ids' => 'required|array',
            'appointment_ids.*' => 'exists:appointments,id',
        ]);
        
        Appointment::whereIn('id', $request->appointment_ids)->delete();
        
        return redirect()->back()->with('success', 'Selected appointments deleted successfully.');
    }

    public function updateAppointmentStatus(Request $request, Appointment $appointment)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,rejected,completed',
        ]);

        $oldStatus = $appointment->status;

        $appointment->update([
            'status' => $request->status,
        ]);

        // Send status update email if the status changed and is confirmed, rejected, or completed
        if ($oldStatus !== $request->status && in_array($request->status, ['confirmed', 'rejected', 'completed'])) {
            try {
                $appointment->load(['patient.user', 'schedule.doctor.user']);
                \Illuminate\Support\Facades\Mail::to($appointment->patient->user->email)->send(
                    new \App\Mail\AppointmentStatusMail($appointment, $request->status)
                );
            } catch (\Exception $e) {
                \Log::error('Failed to send status update email: ' . $e->getMessage());
            }
        }

        return redirect()->back()->with('success', 'Appointment status updated to ' . ucfirst($request->status) . ' successfully.');
    }

    public function checkInAppointmentByCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $input = trim($request->code);
        $appointmentId = str_replace('APT-', '', $input);
        
        $appointment = null;

        // 1. Try finding by direct Appointment Code / ID
        if (is_numeric($appointmentId)) {
            $appointment = Appointment::with(['patient.user', 'schedule.doctor.user'])->find($appointmentId);
        }

        // 2. Try finding by patient's National Identity Card (NIC) number
        if (!$appointment) {
            $appointment = Appointment::with(['patient.user', 'schedule.doctor.user'])
                ->whereHas('patient', function ($query) use ($input) {
                    $query->where('nic', $input);
                })
                ->whereNotIn('status', ['rejected', 'completed'])
                ->latest()
                ->first();
        }

        // 3. Try finding by patient's name
        if (!$appointment) {
            $appointment = Appointment::with(['patient.user', 'schedule.doctor.user'])
                ->whereHas('patient.user', function ($query) use ($input) {
                    $query->where('name', 'like', '%' . $input . '%');
                })
                ->whereNotIn('status', ['rejected', 'completed'])
                ->latest()
                ->first();
        }

        if (!$appointment) {
            return redirect()->back()->withErrors(['code' => 'No active appointment found for this Name, IC/NIC, or Code.']);
        }

        if ($appointment->status === 'rejected') {
            return redirect()->back()->withErrors(['code' => 'This appointment has been rejected. Check-in is not allowed.']);
        }

        $appointment->update([
            'checked_in' => true,
            'checked_in_at' => now(),
            'status' => 'confirmed', // Ensure it is confirmed if they are checking in
        ]);

        return redirect()->back()->with('success', 'Patient ' . $appointment->patient->user->name . ' checked in successfully for Doctor ' . $appointment->schedule->doctor->user->name . '!');
    }

    public function searchAppointmentsForCheckIn(Request $request)
    {
        $query = trim($request->query('q'));

        if (empty($query)) {
            return response()->json([]);
        }

        $appointmentId = str_replace('APT-', '', $query);

        $appointments = Appointment::with(['patient.user', 'schedule.doctor.user'])
            ->whereNotIn('status', ['rejected', 'completed'])
            ->where('checked_in', false)
            ->where(function ($q) use ($query, $appointmentId) {
                if (is_numeric($appointmentId)) {
                    $q->where('id', $appointmentId);
                }
                $q->orWhereHas('patient', function ($p) use ($query) {
                    $p->where('nic', 'like', '%' . $query . '%');
                })
                ->orWhereHas('patient.user', function ($u) use ($query) {
                    $u->where('name', 'like', '%' . $query . '%');
                });
            })
            ->latest()
            ->take(10)
            ->get();

        $results = $appointments->map(function ($apt) {
            $time = \Carbon\Carbon::parse($apt->schedule->time);
            $formattedTime = $time->minute === 0 ? $time->format('g a') : $time->format('g:i a');

            return [
                'id' => $apt->id,
                'code' => 'APT-' . $apt->id,
                'patient_name' => $apt->patient->user->name,
                'patient_nic' => $apt->patient->nic,
                'doctor_name' => $apt->schedule->doctor->user->name,
                'time' => $formattedTime,
                'date' => $apt->schedule->date,
                'status' => $apt->status,
            ];
        });

        return response()->json($results);
    }

    // --- REPORTS ---
    public function reports()
    {
        $metrics = [
            'total_doctors' => Doctor::count(),
            'total_patients' => Patient::count(),
            'total_appointments' => Appointment::count(),
            'total_schedules' => Schedule::count(),
        ];

        // Appointments over time (last 30 days)
        $appointments_last_30_days = Appointment::where('created_at', '>=', now()->subDays(30))->count();

        // Most active doctors (by number of schedules)
        $top_doctors = Doctor::withCount('schedules')
                             ->with(['user', 'specialty'])
                             ->orderByDesc('schedules_count')
                             ->take(5)
                             ->get();

        // Recent bookings
        $recent_appointments = Appointment::with(['patient.user', 'schedule.doctor.user', 'schedule.doctor.specialty'])
                                          ->latest()
                                          ->take(10)
                                          ->get();

        return Inertia::render('Admin/Reports', [
            'metrics' => $metrics,
            'appointments_last_30_days' => $appointments_last_30_days,
            'top_doctors' => $top_doctors,
            'recent_appointments' => $recent_appointments,
        ]);
    }
}
