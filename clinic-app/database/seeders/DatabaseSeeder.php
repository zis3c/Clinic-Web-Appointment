<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Specialty;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $demoPassword = env('SEED_DEMO_PASSWORD', 'p@5wo0rd');

        // 1. Seed Specialties
        $specialties = [
            'Accident and emergency medicine', 'Allergology', 'Anaesthetics', 'Biological hematology', 'Cardiology',
            'Child psychiatry', 'Clinical biology', 'Clinical chemistry', 'Clinical neurophysiology', 'Clinical radiology',
            'Dental, oral and maxillo-facial surgery', 'Dermato-venerology', 'Dermatology', 'Endocrinology', 'Gastro-enterologic surgery',
            'Gastroenterology', 'General hematology', 'General Practice', 'General surgery', 'Geriatrics',
            'Immunology', 'Infectious diseases', 'Internal medicine', 'Laboratory medicine', 'Maxillo-facial surgery',
            'Microbiology', 'Nephrology', 'Neuro-psychiatry', 'Neurology', 'Neurosurgery',
            'Nuclear medicine', 'Obstetrics and gynecology', 'Occupational medicine', 'Ophthalmology', 'Orthopaedics',
            'Otorhinolaryngology', 'Paediatric surgery', 'Paediatrics', 'Pathology', 'Pharmacology',
            'Physical medicine and rehabilitation', 'Plastic surgery', 'Podiatric Medicine', 'Podiatric Surgery', 'Psychiatry',
            'Public health and Preventive Medicine', 'Radiology', 'Radiotherapy', 'Respiratory medicine', 'Rheumatology',
            'Stomatology', 'Thoracic surgery', 'Tropical medicine', 'Urology', 'Vascular surgery', 'Venereology'
        ];

        foreach ($specialties as $sname) {
            Specialty::create(['name' => $sname]);
        }

        // 2. Seed Admin
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@janjicare.com',
            'password' => Hash::make($demoPassword),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // 3. Seed Doctor
        $doctorUser = User::create([
            'name' => 'Test Doctor',
            'email' => 'doctor@janjicare.com',
            'password' => Hash::make($demoPassword),
            'role' => 'doctor',
            'email_verified_at' => now(),
        ]);

        Doctor::create([
            'user_id' => $doctorUser->id,
            'nic' => '000000000',
            'tel' => '0110000000',
            'specialty_id' => 1, // Accident and emergency medicine
        ]);

        // 4. Seed Patients
        $patient1 = User::create([
            'name' => 'Test Patient',
            'email' => 'patient@janjicare.com',
            'password' => Hash::make($demoPassword),
            'role' => 'patient',
            'email_verified_at' => now(),
        ]);

        Patient::create([
            'user_id' => $patient1->id,
            'address' => 'Sri Lanka',
            'nic' => '0000000000',
            'dob' => '2000-01-01',
            'tel' => '0120000000',
        ]);

        $patient2 = User::create([
            'name' => 'Demo Patient 2',
            'email' => 'patient2@janjicare.com',
            'password' => Hash::make($demoPassword),
            'role' => 'patient',
            'email_verified_at' => now(),
        ]);

        Patient::create([
            'user_id' => $patient2->id,
            'address' => 'Sri Lanka',
            'nic' => '0110000000',
            'dob' => '2022-06-03',
            'tel' => '0700000000',
        ]);

        // 5. Bulk Seed Doctors and Patients for UI/UX testing
        if (function_exists('fake')) {
            Doctor::factory()->count(15)->create();
            Patient::factory()->count(30)->create();
        }

        // Now assign spatie roles
        $this->call(RolesAndPermissionsSeeder::class);

        // 6. Make all patients have an appointment with doctor@janjicare.com
        $targetDoctor = Doctor::whereHas('user', function($q) {
            $q->where('email', 'doctor@janjicare.com');
        })->first();

        if ($targetDoctor) {
            $patients = Patient::all();
            
            $schedule = \App\Models\Schedule::create([
                'doctor_id' => $targetDoctor->id,
                'title' => 'General Consultation Block',
                'date' => date('Y-m-d', strtotime('+1 day')),
                'time' => '09:00:00',
                'number_of_patients' => $patients->count() + 10,
            ]);

            $apptNum = 1;
            $statuses = ['pending', 'confirmed', 'completed'];
            foreach ($patients as $patient) {
                $status = $statuses[$apptNum % count($statuses)];
                $checkedIn = ($status === 'completed');
                
                // Set at least one confirmed appointment to checked_in so the doctor dashboard shows checked-in patients
                if ($apptNum === 3) {
                    $status = 'confirmed';
                    $checkedIn = true;
                }

                \App\Models\Appointment::create([
                    'patient_id' => $patient->id,
                    'schedule_id' => $schedule->id,
                    'appointment_number' => $apptNum++,
                    'date' => $schedule->date,
                    'status' => $status,
                    'checked_in' => $checkedIn,
                    'checked_in_at' => $checkedIn ? now()->subMinutes(rand(10, 60)) : null,
                ]);
            }

            // Always create a ready Virtual Consultation for today so the Test Doctor and Test Patient can immediately test Telehealth
            $telehealthSchedule = \App\Models\Schedule::create([
                'doctor_id' => $targetDoctor->id,
                'title' => 'Virtual Consultation Block',
                'type' => 'virtual',
                'date' => date('Y-m-d'),
                'time' => date('H:i:s', strtotime('-15 minutes')),
                'number_of_patients' => 5,
            ]);

            \App\Models\Appointment::create([
                'patient_id' => $patient1->patient->id ?? Patient::where('user_id', $patient1->id)->first()->id,
                'schedule_id' => $telehealthSchedule->id,
                'appointment_number' => 1,
                'date' => $telehealthSchedule->date,
                'status' => 'in_progress',
                'checked_in' => true,
                'checked_in_at' => now()->subMinutes(5),
            ]);
        }
    }
}
