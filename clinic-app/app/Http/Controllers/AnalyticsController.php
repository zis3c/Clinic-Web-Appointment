<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function adminAnalytics()
    {
        // Total stats
        $totalPatients = Patient::count();
        $totalDoctors = Doctor::count();
        $totalAppointments = Appointment::count();
        
        // Appointments by status
        $statusCounts = Appointment::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Last 7 days appointments trend
        $dates = collect();
        $trendCounts = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dates->push($date->format('M d'));
            $trendCounts->push(Appointment::whereDate('date', $date)->count());
        }

        // Top Doctors by appointments
        $topDoctors = Doctor::with('user', 'specialty')
            ->withCount('schedules as total_schedules')
            ->get()
            ->map(function ($doctor) {
                $doctor->total_appointments = DB::table('appointments')
                    ->join('schedules', 'appointments.schedule_id', '=', 'schedules.id')
                    ->where('schedules.doctor_id', $doctor->id)
                    ->count();
                return $doctor;
            })
            ->sortByDesc('total_appointments')
            ->take(5)
            ->values();

        return Inertia::render('Admin/Analytics', [
            'stats' => [
                'totalPatients' => $totalPatients,
                'totalDoctors' => $totalDoctors,
                'totalAppointments' => $totalAppointments,
            ],
            'charts' => [
                'status' => [
                    'labels' => $statusCounts->keys(),
                    'data' => $statusCounts->values(),
                ],
                'trend' => [
                    'labels' => $dates,
                    'data' => $trendCounts,
                ],
                'topDoctors' => $topDoctors
            ]
        ]);
    }

    public function doctorAnalytics()
    {
        $doctor = Auth::user()->doctor;

        $totalAppointments = Appointment::whereHas('schedule', function($q) use ($doctor) {
            $q->where('doctor_id', $doctor->id);
        })->count();

        $completedAppointments = Appointment::whereHas('schedule', function($q) use ($doctor) {
            $q->where('doctor_id', $doctor->id);
        })->where('status', 'completed')->count();

        $statusCounts = Appointment::whereHas('schedule', function($q) use ($doctor) {
            $q->where('doctor_id', $doctor->id);
        })->selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status');

        // Last 7 days trend
        $dates = collect();
        $trendCounts = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dates->push($date->format('M d'));
            $count = Appointment::whereHas('schedule', function($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id);
            })->whereDate('date', $date)->count();
            $trendCounts->push($count);
        }

        return Inertia::render('Doctor/Analytics', [
            'stats' => [
                'totalAppointments' => $totalAppointments,
                'completedAppointments' => $completedAppointments,
            ],
            'charts' => [
                'status' => [
                    'labels' => $statusCounts->keys(),
                    'data' => $statusCounts->values(),
                ],
                'trend' => [
                    'labels' => $dates,
                    'data' => $trendCounts,
                ]
            ]
        ]);
    }
}
