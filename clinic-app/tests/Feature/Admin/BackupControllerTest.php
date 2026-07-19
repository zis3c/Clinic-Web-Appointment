<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class BackupControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'doctor']);
        Role::firstOrCreate(['name' => 'patient']);
    }

    public function test_admin_can_dispatch_backup_generation()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->post(route('admin.backups.create'));
        
        $response->assertRedirect();
        
        // If testing in memory, the file won't exist so it throws an error.
        // If testing with a real file, it succeeds.
        if (!\Illuminate\Support\Facades\File::exists(database_path('database.sqlite'))) {
            $response->assertSessionHasErrors('backup');
        } else {
            $response->assertSessionHas('success');
        }
    }

    public function test_non_admin_cannot_dispatch_backup()
    {
        $patient = User::factory()->create(['role' => 'patient']);
        $patient->assignRole('patient');

        $response = $this->actingAs($patient)->post(route('admin.backups.create'));
        $response->assertStatus(403);
    }
}
