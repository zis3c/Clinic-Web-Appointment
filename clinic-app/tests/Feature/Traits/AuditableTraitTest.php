<?php

namespace Tests\Feature\Traits;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditableTraitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'doctor']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'patient']);
    }

    public function test_creating_auditable_model_creates_audit_log()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);
        
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole('doctor');
        $specialty = \App\Models\Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $schedule = Schedule::create([
            'doctor_id' => $doctor->id,
            'title' => 'Test Schedule',
            'date' => '2025-10-10',
            'time' => '10:00:00',
            'number_of_patients' => 10,
            'slot_duration' => 30,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'created',
            'model_type' => Schedule::class,
            'model_id' => $schedule->id,
        ]);

        $log = \App\Models\AuditLog::where('model_type', Schedule::class)->where('action', 'created')->first();
        $this->assertNull($log->old_values);
        $this->assertNotNull($log->new_values);
        $this->assertEquals('Test Schedule', $log->new_values['title']);
    }

    public function test_updating_auditable_model_creates_audit_log()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);
        
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole('doctor');
        $specialty = \App\Models\Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $schedule = Schedule::create([
            'doctor_id' => $doctor->id,
            'title' => 'Test Schedule',
            'date' => '2025-10-10',
            'time' => '10:00:00',
            'number_of_patients' => 10,
            'slot_duration' => 30,
        ]);

        $schedule->update(['number_of_patients' => 5]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'updated',
            'model_type' => Schedule::class,
            'model_id' => $schedule->id,
        ]);

        $log = \App\Models\AuditLog::where('model_type', Schedule::class)->where('action', 'updated')->first();
        
        $this->assertNotNull($log->old_values);
        $this->assertNotNull($log->new_values);
        $this->assertEquals(10, $log->old_values['number_of_patients']);
        $this->assertEquals(5, $log->new_values['number_of_patients']);
    }

    public function test_deleting_auditable_model_creates_audit_log()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);
        
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctorUser->assignRole('doctor');
        $specialty = \App\Models\Specialty::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id, 'specialty_id' => $specialty->id]);

        $schedule = Schedule::create([
            'doctor_id' => $doctor->id,
            'title' => 'Test Schedule',
            'date' => '2025-10-10',
            'time' => '10:00:00',
            'number_of_patients' => 10,
            'slot_duration' => 30,
        ]);

        $schedule->delete();

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'deleted',
            'model_type' => Schedule::class,
            'model_id' => $schedule->id,
        ]);

        $log = \App\Models\AuditLog::where('model_type', Schedule::class)->where('action', 'deleted')->first();
        
        $this->assertNotNull($log->old_values);
        $this->assertNull($log->new_values);
        $this->assertEquals('Test Schedule', $log->old_values['title']);
    }
}
