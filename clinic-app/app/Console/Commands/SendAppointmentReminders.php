<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

use App\Models\Appointment;
use App\Notifications\AppointmentReminder;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

#[Signature('app:send-appointment-reminders')]
#[Description('Sends automated email and SMS reminders 24 hours and 1 hour before an appointment.')]
class SendAppointmentReminders extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $appointments = Appointment::whereIn('status', ['pending', 'confirmed'])
            ->whereNotNull('time_slot')
            ->where(function ($query) {
                $query->where('reminded_24h', false)
                      ->orWhere('reminded_1h', false);
            })
            ->with(['patient.user', 'schedule.doctor.user'])
            ->get();

        $now = Carbon::now();
        $processedCount = 0;

        foreach ($appointments as $appointment) {
            try {
                // Combine date and time_slot into a single Carbon instance
                $appointmentDatetime = Carbon::parse(Carbon::parse($appointment->date)->format('Y-m-d') . ' ' . $appointment->time_slot);
                
                // Calculate difference in minutes (positive means appointment is in the future)
                $diffInMinutes = $now->diffInMinutes($appointmentDatetime, false);
                
                if ($diffInMinutes < 0) {
                    continue; // Appointment has already passed
                }

                // 24 Hour Reminder (Between 23 hours and 24 hours)
                if (!$appointment->reminded_24h && $diffInMinutes <= (24 * 60) && $diffInMinutes > (23 * 60)) {
                    $appointment->patient->user->notify(new AppointmentReminder($appointment, '24h'));
                    $appointment->reminded_24h = true;
                    $appointment->save();
                    Log::info("Sent 24h reminder for Appointment ID: {$appointment->id}");
                    $processedCount++;
                }

                // 1 Hour Reminder (Between 45 minutes and 60 minutes)
                if (!$appointment->reminded_1h && $diffInMinutes <= 60 && $diffInMinutes > 45) {
                    $appointment->patient->user->notify(new AppointmentReminder($appointment, '1h'));
                    $appointment->reminded_1h = true;
                    $appointment->save();
                    Log::info("Sent 1h reminder for Appointment ID: {$appointment->id}");
                    $processedCount++;
                }

            } catch (\Exception $e) {
                Log::error("Failed to process reminder for Appointment ID {$appointment->id}: " . $e->getMessage());
            }
        }

        $this->info("Appointment reminders processed successfully. Reminders sent: {$processedCount}");
    }
}
