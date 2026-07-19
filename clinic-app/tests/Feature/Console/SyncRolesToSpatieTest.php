<?php

namespace Tests\Feature\Console;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class SyncRolesToSpatieTest extends TestCase
{
    use RefreshDatabase;

    public function test_syncs_roles_correctly()
    {
        // Delete all spatie roles to simulate fresh env
        Role::truncate();

        // Create users without spatie roles using forceCreate to bypass $guarded on 'role'
        $admin = User::forceCreate([
            'name' => 'Admin User',
            'email' => 'admin_test_sync@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);

        $doctor = User::forceCreate([
            'name' => 'Doctor User',
            'email' => 'doctor_test_sync@example.com',
            'password' => bcrypt('password'),
            'role' => 'doctor'
        ]);

        $this->assertFalse($admin->hasRole('admin'));
        $this->assertFalse($doctor->hasRole('doctor'));

        $this->artisan('roles:sync')
            ->expectsOutputToContain('Successfully synced')
            ->assertExitCode(0);

        $this->assertTrue($admin->fresh()->hasRole('admin'));
        $this->assertTrue($doctor->fresh()->hasRole('doctor'));
    }
}
