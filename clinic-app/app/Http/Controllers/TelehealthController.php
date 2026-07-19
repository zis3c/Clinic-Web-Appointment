<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TelehealthController extends Controller
{
    public function room(Appointment $appointment)
    {
        $user = Auth::user();
        
        // Ensure the appointment is for a virtual schedule
        if ($appointment->schedule->type !== 'virtual') {
            abort(403, 'This appointment is not a virtual consultation.');
        }

        // Prevent joining rooms for appointments that are no longer active
        if (in_array($appointment->status, ['cancelled', 'rejected', 'completed'])) {
            abort(403, 'This consultation session is no longer active.');
        }

        // Check permissions: Must be either the patient or the doctor
        $isPatient = $user->patient && $user->patient->id === $appointment->patient_id;
        $isDoctor = $user->doctor && $user->doctor->id === $appointment->schedule->doctor_id;

        if (!$isPatient && !$isDoctor) {
            abort(403, 'You do not have permission to join this room.');
        }

        // Generate a unique room name based on the appointment ID and patient ID
        // Hashing to make it hard to guess
        $roomName = 'janji-care-room-' . hash_hmac('sha256', $appointment->id . $appointment->patient_id . $appointment->schedule_id, config('app.key'));

        $apiKey = config('services.livekit.key');
        $apiSecret = config('services.livekit.secret');

        if (empty($apiKey) || empty($apiSecret) || $apiKey === 'dev_key' || $apiSecret === 'dev_secret') {
            \Illuminate\Support\Facades\Log::critical('LiveKit credentials are not configured or using insecure defaults.');
            abort(500, 'Telehealth service is not properly configured.');
        }
        
        $payload = [
            'iss' => $apiKey,
            'sub' => (string) $user->id . '_' . uniqid(),
            'nbf' => time(),
            'exp' => time() + 3600 * 2, // 2 hours
            'video' => [
                'room' => $roomName,
                'roomJoin' => true,
            ],
            'name' => $user->name,
            'metadata' => json_encode(['role' => $isDoctor ? 'doctor' : 'patient'])
        ];

        // Ensure you have imported use Firebase\JWT\JWT; at the top
        $token = \Firebase\JWT\JWT::encode($payload, $apiSecret, 'HS256');

        return Inertia::render('Telehealth/Room', [
            'appointment' => $appointment->load(['patient.user', 'schedule.doctor.user']),
            'roomName' => $roomName,
            'livekitUrl' => config('services.livekit.url', 'ws://localhost:7880'),
            'livekitToken' => $token,
            'isDoctor' => $isDoctor,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            ]
        ]);
    }
}
