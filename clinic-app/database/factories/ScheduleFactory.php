<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\Schedule;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScheduleFactory extends Factory
{
    protected $model = Schedule::class;

    public function definition()
    {
        return [
            'doctor_id' => Doctor::factory(),
            'title' => $this->faker->sentence(3),
            'date' => $this->faker->date(),
            'time' => $this->faker->time('H:i'),
            'type' => $this->faker->randomElement(['in_person', 'virtual']),
            'number_of_patients' => $this->faker->numberBetween(5, 20),
            'slot_duration' => 15,
        ];
    }
}
