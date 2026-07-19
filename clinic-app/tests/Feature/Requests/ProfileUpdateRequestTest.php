<?php

namespace Tests\Feature\Requests;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileUpdateRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_validates_required_fields()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patch('/profile', []);

        $response->assertSessionHasErrors(['name', 'email']);
    }

    public function test_allows_updating_profile_with_own_email()
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'name' => 'Old Name'
        ]);

        $response = $this->actingAs($user)->patch('/profile', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals('John Doe', $user->fresh()->name);
    }

    public function test_prevents_updating_profile_with_existing_email()
    {
        $user1 = User::factory()->create(['email' => 'taken@example.com']);
        $user2 = User::factory()->create(['email' => 'free@example.com']);

        $response = $this->actingAs($user2)->patch('/profile', [
            'name' => 'Jane Doe',
            'email' => 'taken@example.com',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    public function test_forces_lowercase_email()
    {
        $user = User::factory()->create(['email' => 'john@example.com']);

        // Let's test the actual endpoint which applies the Request validation
        $response = $this->actingAs($user)->patch('/profile', [
            'name' => 'John Doe',
            'email' => 'JOHN.NEW@EXAMPLE.COM',
        ]);

        // Validation fails if not lowercase (because 'lowercase' rule requires the input to be lowercase already)
        $response->assertSessionHasErrors(['email']);
    }
}
