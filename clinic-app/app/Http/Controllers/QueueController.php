<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class QueueController extends Controller
{
    public function tv()
    {
        // Get all doctors who have active checked-in patients
        $doctors = Doctor::whereHas('schedules.appointments', function ($query) {
            $query->where('checked_in', true)->whereIn('status', ['confirmed', 'in_progress']);
        })->with(['user', 'specialty'])->get();

        $queueData = [];

        foreach ($doctors as $doctor) {
            // Find currently serving patient (the one explicitly marked as in_progress by doctor)
            $currentlyServing = Appointment::whereHas('schedule', function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id);
            })->where('status', 'in_progress')
              ->where('checked_in', true)
              ->orderBy('updated_at', 'desc') // in case there are multiple, get the most recently called
              ->with('patient.user')
              ->first();

            // Find next waiting patients (confirmed and checked in)
            $waiting = Appointment::whereHas('schedule', function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id);
            })->where('status', 'confirmed')
              ->where('checked_in', true)
              ->orderBy('checked_in_at', 'asc')
              ->with('patient.user')
              ->take(4) // show next 4
              ->get();
            
            // Only add doctors to the TV if they actually have someone serving or waiting
            if ($currentlyServing || $waiting->count() > 0) {
                $queueData[] = [
                    'doctor' => $doctor,
                    'currently_serving' => $currentlyServing,
                    'waiting' => $waiting
                ];
            }
        }

        return Inertia::render('Queue/TV', [
            'queueData' => $queueData,
        ]);
    }
}
