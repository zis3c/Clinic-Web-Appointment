<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\TelehealthController;
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

// Secure Guest AI Route: Limit to 20 requests per day (1440 minutes) per IP address
Route::post('/ai/guest-triage', [\App\Http\Controllers\AIController::class, 'guestTriage'])
    ->middleware('throttle:5,1')
    ->name('ai.guest-triage');

Route::match(['get', 'delete'], '/appointments/{appointment}/cancel-from-email', [PatientController::class, 'cancelFromEmail'])
    ->name('appointments.cancel-from-email')
    ->middleware('signed');

Route::get('/queue/tv', [QueueController::class, 'tv'])
    ->middleware(['auth', 'role:admin|doctor', 'throttle:30,1'])
    ->name('queue.tv');

Route::middleware(['auth', 'throttle:60,1'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::delete('/profile/sessions', [ProfileController::class, 'destroyOtherBrowserSessions'])->name('profile.sessions.destroy');
    Route::delete('/profile/sessions/{id}', [ProfileController::class, 'destroySpecificBrowserSession'])->name('profile.sessions.destroySpecific');

    // Telehealth Route (accessible by both Doctor and Patient)
    Route::get('/telehealth/room/{appointment}', [TelehealthController::class, 'room'])->name('telehealth.room');

    // Notification Routes
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Prescription PDF Download
    Route::get('/prescriptions/{appointment}/pdf', [PrescriptionController::class, 'downloadPdf'])->name('prescriptions.pdf');

    // Calendar Download
    Route::get('/appointments/{appointment}/calendar', [\App\Http\Controllers\CalendarController::class, 'downloadIcs'])->name('appointments.calendar');

    // AI Triage (accessible by all roles)
    Route::post('/ai/triage', [\App\Http\Controllers\AIController::class, 'triage'])
        ->middleware('throttle:30,1')
        ->name('ai.triage');
    Route::get('/ai/session', [\App\Http\Controllers\AIController::class, 'getSession'])->name('ai.session.get');
    Route::post('/ai/session/clear', [\App\Http\Controllers\AIController::class, 'clearSession'])->name('ai.session.clear');

    // Admin Routes
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/ai', [AdminController::class, 'settings'])->name('ai');
        Route::post('/ai', [AdminController::class, 'updateSettings'])->name('ai.update');
        Route::post('/ai/test', [AdminController::class, 'testAiConnection'])->name('ai.test');
        Route::get('/security', [\App\Http\Controllers\Admin\SecurityController::class, 'index'])->name('security.index');
        Route::post('/security/unlock/{id}', [\App\Http\Controllers\Admin\SecurityController::class, 'unlockUser'])->name('security.unlock');
        Route::post('/security/backup', [\App\Http\Controllers\Admin\BackupController::class, 'create'])->name('backups.create');
        Route::get('/security/backup/{filename}', [\App\Http\Controllers\Admin\BackupController::class, 'download'])->name('backups.download');
        Route::get('/analytics', [AnalyticsController::class, 'adminAnalytics'])->name('analytics');
        
        Route::get('/doctors', [AdminController::class, 'doctors'])->name('doctors.index');
        Route::post('/doctors', [AdminController::class, 'storeDoctor'])->name('doctors.store');
        Route::put('/doctors/{doctor}', [AdminController::class, 'updateDoctor'])->name('doctors.update');
        Route::delete('/doctors/bulk', [AdminController::class, 'bulkDestroyDoctors'])->name('doctors.bulk-destroy');
        Route::delete('/doctors/{doctor}', [AdminController::class, 'destroyDoctor'])->name('doctors.destroy');


        // Admin Pharmacy Inventory
        Route::get('/pharmacy', [\App\Http\Controllers\Admin\PharmacyController::class, 'index'])->name('pharmacy.index');
        Route::post('/pharmacy', [\App\Http\Controllers\Admin\PharmacyController::class, 'store'])->name('pharmacy.store');
        Route::put('/pharmacy/{medication}', [\App\Http\Controllers\Admin\PharmacyController::class, 'update'])->name('pharmacy.update');
        Route::delete('/pharmacy/{medication}', [\App\Http\Controllers\Admin\PharmacyController::class, 'destroy'])->name('pharmacy.destroy');
        
        Route::get('/patients', [AdminController::class, 'patients'])->name('patients.index');
        Route::delete('/patients/bulk', [AdminController::class, 'bulkDestroyPatients'])->name('patients.bulk-destroy');
        Route::delete('/patients/{patient}', [AdminController::class, 'destroyPatient'])->name('patients.destroy');

        Route::get('/schedules', [AdminController::class, 'schedules'])->name('schedules.index');
        Route::post('/schedules', [AdminController::class, 'storeSchedule'])->name('schedules.store');
        Route::delete('/schedules/bulk', [AdminController::class, 'bulkDestroySchedules'])->name('schedules.bulk-destroy');
        Route::delete('/schedules/{schedule}', [AdminController::class, 'destroySchedule'])->name('schedules.destroy');

        Route::get('/appointments', [AdminController::class, 'appointments'])->name('appointments.index');
        Route::get('/appointments/search', [AdminController::class, 'searchAppointmentsForCheckIn'])->name('appointments.search');
        Route::patch('/appointments/{appointment}/status', [AdminController::class, 'updateAppointmentStatus'])->name('appointments.status.update');
        Route::post('/appointments/check-in', [AdminController::class, 'checkInAppointmentByCode'])->name('appointments.check-in');
        Route::delete('/appointments/bulk', [AdminController::class, 'bulkDestroyAppointments'])->name('appointments.bulk-destroy');
        Route::delete('/appointments/{appointment}', [AdminController::class, 'destroyAppointment'])->name('appointments.destroy');

        Route::get('/reports', [AdminController::class, 'reports'])->name('reports.index');
    });

    // Doctor Routes
    Route::middleware('role:doctor')->prefix('doctor')->name('doctor.')->group(function () {
        Route::get('/dashboard', [DoctorController::class, 'dashboard'])->name('dashboard');
        Route::get('/analytics', [AnalyticsController::class, 'doctorAnalytics'])->name('analytics');
        
        Route::get('/schedules', [DoctorController::class, 'schedules'])->name('schedules.index');
        Route::post('/schedules', [DoctorController::class, 'storeSchedule'])->name('schedules.store');
        Route::delete('/schedules/{schedule}', [DoctorController::class, 'destroySchedule'])->name('schedules.destroy');

        Route::get('/appointments', [DoctorController::class, 'appointments'])->name('appointments.index');
        Route::get('/history', [DoctorController::class, 'history'])->name('history.index');
        Route::patch('/appointments/{appointment}/call', [DoctorController::class, 'callPatient'])->name('appointments.call');
        Route::patch('/appointments/{appointment}/complete', [DoctorController::class, 'completeAppointment'])->name('appointments.complete');
        Route::delete('/appointments/bulk', [DoctorController::class, 'bulkDestroyAppointments'])->name('appointments.bulk-destroy');
        Route::delete('/appointments/{appointment}', [DoctorController::class, 'destroyAppointment'])->name('appointments.destroy');

        Route::get('/patients', [DoctorController::class, 'patients'])->name('patients.index');
        
        // EMR and Vitals
        Route::get('/patients/{patient}/emr', [DoctorController::class, 'patientEmr'])->name('patients.emr');
        Route::post('/appointments/{appointment}/vitals', [DoctorController::class, 'storeVitals'])->name('appointments.vitals.store');
    });

    // Patient Routes
    Route::middleware(['role:patient', 'verified'])->prefix('patient')->name('patient.')->group(function () {
        Route::get('/dashboard', [PatientController::class, 'dashboard'])->name('dashboard');
        
        Route::patch('/profile', [PatientController::class, 'updateProfile'])->name('profile.update');
        
        Route::get('/doctors', [PatientController::class, 'doctors'])->name('doctors.index');
        
        Route::get('/schedules', [PatientController::class, 'schedules'])->name('schedules.index');
        Route::get('/appointments', [PatientController::class, 'appointments'])->name('appointments.index');
        Route::get('/history', [PatientController::class, 'history'])->name('history.index');
        Route::get('/history/export', [PatientController::class, 'exportHistoryPdf'])->name('history.export');
        
        Route::post('/appointments', [PatientController::class, 'storeAppointment'])
            ->name('appointments.store');
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
