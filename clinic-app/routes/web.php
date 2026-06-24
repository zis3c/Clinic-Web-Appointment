<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\PatientController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::delete('/profile/sessions', [ProfileController::class, 'destroyOtherBrowserSessions'])->name('profile.sessions.destroy');

    // Admin Routes
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        
        Route::get('/doctors', [AdminController::class, 'doctors'])->name('doctors.index');
        Route::post('/doctors', [AdminController::class, 'storeDoctor'])->name('doctors.store');
        Route::put('/doctors/{doctor}', [AdminController::class, 'updateDoctor'])->name('doctors.update');
        Route::delete('/doctors/bulk', [AdminController::class, 'bulkDestroyDoctors'])->name('doctors.bulk-destroy');
        Route::delete('/doctors/{doctor}', [AdminController::class, 'destroyDoctor'])->name('doctors.destroy');

        Route::get('/patients', [AdminController::class, 'patients'])->name('patients.index');
        Route::delete('/patients/bulk', [AdminController::class, 'bulkDestroyPatients'])->name('patients.bulk-destroy');
        Route::delete('/patients/{patient}', [AdminController::class, 'destroyPatient'])->name('patients.destroy');

        Route::get('/schedules', [AdminController::class, 'schedules'])->name('schedules.index');
        Route::post('/schedules', [AdminController::class, 'storeSchedule'])->name('schedules.store');
        Route::delete('/schedules/bulk', [AdminController::class, 'bulkDestroySchedules'])->name('schedules.bulk-destroy');
        Route::delete('/schedules/{schedule}', [AdminController::class, 'destroySchedule'])->name('schedules.destroy');

        Route::get('/appointments', [AdminController::class, 'appointments'])->name('appointments.index');
        Route::delete('/appointments/bulk', [AdminController::class, 'bulkDestroyAppointments'])->name('appointments.bulk-destroy');
        Route::delete('/appointments/{appointment}', [AdminController::class, 'destroyAppointment'])->name('appointments.destroy');

        Route::get('/reports', [AdminController::class, 'reports'])->name('reports.index');
    });

    // Doctor Routes
    Route::middleware('role:doctor')->prefix('doctor')->name('doctor.')->group(function () {
        Route::get('/dashboard', [DoctorController::class, 'dashboard'])->name('dashboard');
        
        Route::get('/schedules', [DoctorController::class, 'schedules'])->name('schedules.index');
        Route::post('/schedules', [DoctorController::class, 'storeSchedule'])->name('schedules.store');
        Route::delete('/schedules/{schedule}', [DoctorController::class, 'destroySchedule'])->name('schedules.destroy');

        Route::get('/appointments', [DoctorController::class, 'appointments'])->name('appointments.index');
        Route::delete('/appointments/bulk', [DoctorController::class, 'bulkDestroyAppointments'])->name('appointments.bulk-destroy');
        Route::delete('/appointments/{appointment}', [DoctorController::class, 'destroyAppointment'])->name('appointments.destroy');

        Route::get('/patients', [DoctorController::class, 'patients'])->name('patients.index');
    });

    // Patient Routes
    Route::middleware('role:patient')->prefix('patient')->name('patient.')->group(function () {
        Route::get('/dashboard', [PatientController::class, 'dashboard'])->name('dashboard');
        
        Route::get('/doctors', [PatientController::class, 'doctors'])->name('doctors.index');
        
        Route::get('/schedules', [PatientController::class, 'schedules'])->name('schedules.index');
        Route::get('/appointments', [PatientController::class, 'appointments'])->name('appointments.index');
        Route::post('/appointments', [PatientController::class, 'storeAppointment'])->name('appointments.store');
        Route::delete('/appointments/{appointment}', [PatientController::class, 'destroyAppointment'])->name('appointments.destroy');
    });
});

Route::get('/dashboard', function () {
    // Redirect based on role
    $user = auth()->user();
    if ($user->role === 'admin') {
        return redirect()->route('admin.dashboard');
    } elseif ($user->role === 'doctor') {
        return redirect()->route('doctor.dashboard');
    } else {
        return redirect()->route('patient.dashboard');
    }
})->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__.'/auth.php';
