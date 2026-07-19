<?php

namespace Database\Factories;

use App\Models\Doctor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Doctor>
 */
class DoctorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory()->create(['role' => 'doctor'])->id,
            'nic' => fake()->unique()->numerify('#########V'),
            'tel' => fake()->phoneNumber(),
            'specialty_id' => \App\Models\Specialty::factory(),
        ];
    }
}
