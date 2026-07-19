<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Schedule;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    public function definition()
    {
        return [
            'patient_id' => Patient::factory(),
            'schedule_id' => Schedule::factory(),
            'appointment_number' => $this->faker->unique()->numberBetween(1000, 9999),
            'date' => $this->faker->date(),
            'status' => 'pending',
            'checked_in' => false,
            'time_slot' => $this->faker->time('H:i'),
        ];
    }
}
