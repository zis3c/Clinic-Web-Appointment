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
use Illuminate\Validation\Rules;

class AdminController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Admin/Dashboard', [
            'doctorCount' => Doctor::count(),
            'patientCount' => Patient::count(),
            'appointmentCount' => Appointment::count(),
            'scheduleCount' => Schedule::count(),
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
