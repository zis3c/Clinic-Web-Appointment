<?php

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory()->create(['role' => 'patient'])->id,
            'address' => fake()->address(),
            'nic' => fake()->unique()->numerify('#########V'),
            'dob' => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'tel' => fake()->phoneNumber(),
            'gender' => fake()->randomElement(['Male', 'Female']),
            'blood_group' => fake()->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-']),
            'allergies' => fake()->randomElement([null, 'Peanuts', 'Penicillin', 'Dust']),
            'medical_conditions' => fake()->randomElement([null, 'Asthma', 'Diabetes', 'Hypertension']),
        ];
    }
}
