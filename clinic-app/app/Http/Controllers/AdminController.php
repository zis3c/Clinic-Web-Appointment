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

    public function settings()
    {
        $setting = \App\Models\SystemSetting::where('key', 'ai_provider_api_key')->first();
        $hasKey = $setting && !empty($setting->value);

        // Show only a masked version: first 4 + last 4 characters
        $maskedKey = '';
        if ($hasKey) {
            $val = $setting->value;
            if (strlen($val) > 8) {
                $maskedKey = substr($val, 0, 4) . str_repeat('*', max(0, strlen($val) - 8)) . substr($val, -4);
            } else {
                $maskedKey = str_repeat('*', strlen($val));
            }
        }

        return inertia('Admin/AI', [
            'aiProviderConfigured' => $hasKey,
            'aiProviderMaskedKey' => $maskedKey,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'ai_provider_api_key' => 'nullable|string',
        ]);

        \App\Models\SystemSetting::updateOrCreate(
            ['key' => 'ai_provider_api_key'],
            ['value' => $request->ai_provider_api_key]
        );

        return back()->with('success', 'AI settings updated successfully.');
    }

    public function testAiConnection(Request $request)
    {
        $request->validate([
            'api_key' => 'required|string',
        ]);

        $apiKey = $request->api_key;
        $baseUrl = 'https://api.deepseek.com/v1';
        $model = 'deepseek-chat';
        
        try {
            // Ping OpenAI compatible endpoint
            $response = \Illuminate\Support\Facades\Http::withToken($apiKey)
                ->withOptions(['verify' => true])
                ->post("{$baseUrl}/chat/completions", [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'user', 'content' => 'ping']
                    ],
                    'max_tokens' => 1,
                ]);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Connection successful! The API key is valid.'
                ]);
            }

            $error = data_get($response->json(), 'error.message', 'Invalid API key or service unavailable.');
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: ' . $error
            ], 400);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('AI test connection error: ' . $e->getMessage());
            
            // Check for common cURL/SSL errors to provide a generic helpful message without leaking URLs
            $errorMessage = 'Could not reach the AI provider.';
            if (str_contains($e->getMessage(), 'SSL certificate problem') || str_contains($e->getMessage(), 'unable to get local issuer certificate')) {
                $errorMessage = 'SSL Certificate Error: Your local environment cannot verify the provider\'s secure connection. Please check your PHP cURL/SSL configuration.';
            }

            return response()->json([
                'success' => false,
                'message' => 'Connection failed: ' . $errorMessage
            ], 500);
        }
    }

    public function analytics()
    {
        // Chart Data 1: Appointments per day (last 7 days)
        $chartDates = [];
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $chartDates[] = now()->subDays($i)->format('M d');
            $chartData[] = Appointment::whereHas('schedule', function($q) use ($date) {
                $q->where('date', $date);
            })->count();
        }

        // Chart Data 2: Doctors by Specialty
        $specialties = Specialty::withCount('doctors')->get();
        $specialtyLabels = $specialties->pluck('name')->toArray();
        $specialtyData = $specialties->pluck('doctors_count')->toArray();

        return Inertia::render('Admin/Analytics', [
            'chartData' => [
                'appointmentsLine' => [
                    'labels' => $chartDates,
                    'data' => $chartData,
                ],
                'specialtyDoughnut' => [
                    'labels' => $specialtyLabels,
                    'data' => $specialtyData,
                ]
            ]
        ]);
    }

    // --- DOCTORS ---
    public function doctors()
    {
        return Inertia::render('Admin/Doctors', [
            'doctors' => Doctor::with(['user', 'specialty', 'schedules.appointments.patient.user'])->get(),
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

        $user = User::forceCreate([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'doctor',
        ]);
        
        $user->assignRole('doctor');

        Doctor::create([
            'user_id' => $user->id,
            'nic' => $request->nic,
            'tel' => $request->tel,
            'specialty_id' => $request->specialty_id,
        ]);

        event(new \App\Events\AppointmentUpdated('Doctors updated'));
        return redirect()->back()->with('success', 'Doctor added successfully.');
    }

    public function updateDoctor(Request $request, Doctor $doctor)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$doctor->user_id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
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

        event(new \App\Events\AppointmentUpdated('Doctors updated'));
        return redirect()->back()->with('success', 'Doctor updated successfully.');
    }

    public function destroyDoctor(Doctor $doctor)
    {
        // Deleting the user will cascade and delete the doctor record.
        $doctor->user->delete();
        event(new \App\Events\AppointmentUpdated('Doctors updated'));
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
        
        event(new \App\Events\AppointmentUpdated('Doctors updated'));
        return redirect()->back()->with('success', 'Selected doctors deleted successfully.');
    }

    // --- PATIENTS ---
    public function patients()
    {
        return Inertia::render('Admin/Patients', [
            'patients' => Patient::with(['user', 'appointments.schedule.doctor.user', 'appointments.schedule.doctor.specialty'])->get(),
        ]);
    }

    public function destroyPatient(Patient $patient)
    {
        $patient->user->delete();
        event(new \App\Events\AppointmentUpdated('Patients updated'));
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
        
        event(new \App\Events\AppointmentUpdated('Patients updated'));
        return redirect()->back()->with('success', 'Selected patients deleted successfully.');
    }

    // --- SCHEDULES ---
    public function schedules()
    {
        return Inertia::render('Admin/Schedules', [
            'schedules' => Schedule::with(['doctor.user', 'appointments.patient.user'])->get(),
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
            'slot_duration' => 'nullable|integer|min:5|max:180',
        ]);

        foreach ($request->doctor_ids as $doctorId) {
            $schedule = Schedule::create([
                'title' => $request->title,
                'doctor_id' => $doctorId,
                'date' => $request->date,
                'time' => $request->time,
                'number_of_patients' => $request->number_of_patients,
                'slot_duration' => $request->slot_duration ?? 30,
            ]);

            // Notify the Doctor
            try {
                $doctor = Doctor::with('user')->find($doctorId);
                if ($doctor && $doctor->user) {
                    $doctor->user->notify(new \App\Notifications\ClinicNotification(
                        'New Schedule Assigned',
                        "Admin has assigned you to a new schedule session: {$schedule->title} on {$schedule->date}.",
                        'info'
                    ));
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to notify doctor of new schedule: ' . $e->getMessage());
            }
        }

        event(new \App\Events\AppointmentUpdated('Schedules updated'));
        return redirect()->back()->with('success', 'Schedule added successfully.');
    }

    public function destroySchedule(Schedule $schedule)
    {
        $schedule->delete();
        event(new \App\Events\AppointmentUpdated('Schedules updated'));
        return redirect()->back()->with('success', 'Schedule deleted successfully.');
    }

    public function bulkDestroySchedules(Request $request)
    {
        $request->validate([
            'schedule_ids' => 'required|array',
            'schedule_ids.*' => 'exists:schedules,id',
        ]);
        
        Schedule::whereIn('id', $request->schedule_ids)->delete();
        
        event(new \App\Events\AppointmentUpdated('Schedules updated'));
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
        event(new \App\Events\AppointmentUpdated('Appointments updated'));
        return redirect()->back()->with('success', 'Appointment deleted successfully.');
    }

    public function bulkDestroyAppointments(Request $request)
    {
        $request->validate([
            'appointment_ids' => 'required|array',
            'appointment_ids.*' => 'exists:appointments,id',
        ]);
        
        Appointment::whereIn('id', $request->appointment_ids)->delete();
        
        event(new \App\Events\AppointmentUpdated('Appointments updated'));
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

        // Send status update email and DB notification if status changed
        if ($oldStatus !== $request->status) {
            try {
                $appointment->load(['patient.user', 'schedule.doctor.user']);
                
                // In-App Database Notification
                $statusUpper = ucfirst($request->status);
                $message = "Your appointment with Dr. {$appointment->schedule->doctor->user->name} has been marked as {$request->status}.";
                $type = $request->status === 'confirmed' ? 'success' : ($request->status === 'rejected' ? 'danger' : 'info');

                $appointment->patient->user->notify(new \App\Notifications\ClinicNotification(
                    "Appointment {$statusUpper}",
                    $message,
                    $type
                ));

                if (in_array($request->status, ['confirmed', 'rejected', 'completed'])) {
                    \Illuminate\Support\Facades\Mail::to($appointment->patient->user->email)->send(
                        new \App\Mail\AppointmentStatusMail($appointment, $request->status)
                    );
                }
            } catch (\Exception $e) {
                \Log::error('Failed to send status update communications: ' . $e->getMessage());
            }
        }

        event(new \App\Events\AppointmentUpdated('Appointment status updated'));

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

        // 1. Try finding by direct Appointment Code (appointment_number) or ID
        if (is_numeric($appointmentId)) {
            $appointment = Appointment::with(['patient.user', 'schedule.doctor.user'])
                ->where(function($q) use ($appointmentId) {
                    $q->where('id', $appointmentId)
                      ->orWhere('appointment_number', $appointmentId);
                })
                ->first();
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
                    $escapedInput = str_replace(['%', '_'], ['\%', '\_'], $input);
                    $query->where('name', 'like', '%' . $escapedInput . '%');
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

        // Notify patient and doctor users via DatabaseNotification
        try {
            $appointment->load(['patient.user', 'schedule.doctor.user']);
            
            // Notify patient
            $appointment->patient->user->notify(new \App\Notifications\ClinicNotification(
                'Checked In Successfully',
                "You have been checked in for your appointment with Dr. {$appointment->schedule->doctor->user->name}. Please proceed to the waiting room.",
                'success'
            ));

            // Notify doctor
            $appointment->schedule->doctor->user->notify(new \App\Notifications\ClinicNotification(
                'Patient Arrived',
                "Patient {$appointment->patient->user->name} has checked in and is waiting in the lobby.",
                'info'
            ));
        } catch (\Exception $e) {
            \Log::error('Failed to notify users of check-in: ' . $e->getMessage());
        }

        event(new \App\Events\AppointmentUpdated('Appointment checked in'));

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
                    $escapedQuery = str_replace(['%', '_'], ['\%', '\_'], $query);
                    $p->where('nic', 'like', '%' . $escapedQuery . '%');
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
