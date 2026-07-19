<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Schedule;
use App\Models\Appointment;
use Carbon\Carbon;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class RealtimeDataSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Cleanup previously generated test users from this seeder
        $testUsers = \App\Models\User::where('email', 'like', 'doctor_%@example.com')
                                     ->orWhere('email', 'like', 'patient_%@example.com')
                                     ->get();
        foreach ($testUsers as $u) {
            $u->delete(); // This should cascade to doctors, patients, schedules, and appointments if FKs are set up, but let's be safe.
        }

        // Malaysian Name Arrays
        $firstNames = [
            'Ahmad', 'Mohammad', 'Siti', 'Nur', 'Amir', 'Farah', 'Syed', 'Zainab', 'Aziz', 'Fatimah',
            'Wei', 'Jian', 'Mei', 'Hui', 'Xin', 'Zhi', 'Ying', 'Kai', 'Li', 'Ting',
            'Muthu', 'Ravi', 'Saraswathy', 'Priya', 'Karthik', 'Lakshmi', 'Arun', 'Kavitha', 'Suresh', 'Deepa'
        ];
        $lastNames = [
            'Abdullah', 'Ismail', 'Ibrahim', 'Othman', 'Ahmad', 'Ali', 'Hassan', 'Bakar', 'Rahman', 'Salleh',
            'Tan', 'Lim', 'Lee', 'Ng', 'Ong', 'Wong', 'Goh', 'Chua', 'Chan', 'Teo',
            'Subramaniam', 'Krishnan', 'Ramasamy', 'Nair', 'Pillai', 'Rao', 'Kumar', 'Singh', 'Kaur', 'Sharma'
        ];
        $cities = ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Shah Alam', 'Petaling Jaya', 'Melaka', 'Ipoh', 'Seremban', 'Kuantan', 'Kota Kinabalu'];

        // 1. Create 30 Doctors and 100 Patients manually without Faker
        $password = Hash::make('password');

        
        $doctors = collect();
        for ($i = 1; $i <= 30; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $name = $firstName . ' ' . $lastName;
            
            $user = \App\Models\User::create([
                'name' => $name,
                'email' => 'doctor_' . $i . '_' . Str::random(3) . '@example.com',
                'password' => $password,
                'role' => 'doctor',
                'email_verified_at' => now(),
            ]);
            $user->assignRole('doctor');

            $doctors->push(Doctor::create([
                'user_id' => $user->id,
                'nic' => 'DOC' . rand(100000, 999999),
                'tel' => '07' . rand(10000000, 99999999),
                'specialty_id' => rand(1, 20),
            ]));
        }

        $patients = collect();
        for ($i = 1; $i <= 100; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $name = $firstName . ' ' . $lastName;
            
            $user = \App\Models\User::create([
                'name' => $name,
                'email' => 'patient_' . $i . '_' . Str::random(3) . '@example.com',
                'password' => $password,
                'role' => 'patient',
                'email_verified_at' => now(),
            ]);
            $user->assignRole('patient');

            $patients->push(Patient::create([
                'user_id' => $user->id,
                'address' => $cities[array_rand($cities)],
                'nic' => rand(60, 99) . rand(10, 12) . rand(10, 30) . '-' . rand(10, 14) . '-' . rand(1000, 9999), // rough Malaysian IC format
                'dob' => Carbon::now()->subYears(rand(10, 80))->format('Y-m-d'),
                'tel' => '01' . rand(1, 9) . '-' . rand(1000000, 9999999), // Malaysian mobile number format
            ]));
        }

        // 2. Add some realistic schedules and appointments
        // Let's create schedules for the past week and next 2 weeks
        $startDate = Carbon::now()->subDays(7);
        $endDate = Carbon::now()->addDays(14);
        
        $currentDate = $startDate->copy();
        
        while ($currentDate->lte($endDate)) {
            // Only weekdays (skip Sunday for realism)
            if ($currentDate->isSunday()) {
                $currentDate->addDay();
                continue;
            }

            // Pick 5-10 random doctors per day to have schedules
            $dailyDoctors = $doctors->random(rand(5, 10));

            foreach ($dailyDoctors as $doctor) {
                // Determine if it's physical or virtual
                $type = rand(0, 3) === 0 ? 'virtual' : 'in_person'; // 25% virtual

                $schedule = Schedule::create([
                    'doctor_id' => $doctor->id,
                    'title' => ($type === 'virtual' ? 'Virtual' : 'General') . ' Consultation Block',
                    'date' => $currentDate->format('Y-m-d'),
                    'time' => rand(8, 16) . ':00:00', // between 8 AM and 4 PM
                    'number_of_patients' => rand(10, 20),
                    'type' => $type
                ]);

                // Create some appointments for this schedule
                $numAppts = rand(3, $schedule->number_of_patients);
                $apptPatients = $patients->random($numAppts);
                
                $apptNum = 1;
                foreach ($apptPatients as $patient) {
                    $status = 'pending';
                    $checkedIn = false;
                    $checkedInAt = null;
                    
                    if ($currentDate->isPast()) {
                        $status = rand(0, 1) ? 'completed' : 'cancelled';
                        if ($status === 'completed') {
                            $checkedIn = true;
                            $checkedInAt = $currentDate->copy()->setTimeFromTimeString($schedule->time)->addMinutes(rand(0, 60));
                        }
                    } elseif ($currentDate->isToday()) {
                        $status = rand(0, 2) === 0 ? 'pending' : (rand(0, 1) ? 'confirmed' : 'in_progress');
                        if ($status === 'in_progress' || $status === 'confirmed') {
                            $checkedIn = rand(0, 1) === 1;
                            if ($checkedIn) {
                                $checkedInAt = Carbon::now()->subMinutes(rand(5, 45));
                            }
                        }
                    } else {
                        // Future appointments
                        $status = rand(0, 1) ? 'confirmed' : 'pending';
                    }

                    Appointment::create([
                        'patient_id' => $patient->id,
                        'schedule_id' => $schedule->id,
                        'appointment_number' => $apptNum++,
                        'date' => $schedule->date,
                        'status' => $status,
                        'checked_in' => $checkedIn,
                        'checked_in_at' => $checkedInAt,
                    ]);
                }
            }
            $currentDate->addDay();
        }
        
        $this->command->info('RealtimeDataSeeder completed successfully: Added 30 doctors, 100 patients, and populated schedules/appointments.');
    }
}
