<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;
use App\Notifications\ClinicNotification;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'doctor']);
        Role::firstOrCreate(['name' => 'patient']);
    }

    public function test_user_can_mark_notification_as_read()
    {
        $patient = User::factory()->create(['role' => 'patient']);
        $patient->assignRole('patient');

        $patient->notify(new ClinicNotification('Test Title', 'Test Message', 'info'));
        $notification = $patient->unreadNotifications->first();

        $this->assertNotNull($notification);

        $response = $this->actingAs($patient)->patch(route('notifications.read', $notification->id));
        
        $response->assertRedirect();
        $this->assertCount(0, $patient->fresh()->unreadNotifications);
    }

    public function test_user_cannot_mark_other_users_notification_as_read()
    {
        $patient1 = User::factory()->create(['role' => 'patient']);
        $patient2 = User::factory()->create(['role' => 'patient']);

        $patient1->notify(new ClinicNotification('Title 1', 'Message 1', 'info'));
        $notification = $patient1->unreadNotifications->first();

        // Patient 2 attempts to mark Patient 1's notification as read
        $response = $this->actingAs($patient2)->patch(route('notifications.read', $notification->id));
        
        $response->assertStatus(404); // Or 403, depending on how it's handled. Since it's usually Auth::user()->notifications()->findOrFail, it returns 404.
        $this->assertCount(1, $patient1->fresh()->unreadNotifications);
    }

    public function test_user_can_mark_all_notifications_as_read()
    {
        $patient = User::factory()->create(['role' => 'patient']);
        $patient->assignRole('patient');

        $patient->notify(new ClinicNotification('Test 1', 'Message 1', 'info'));
        $patient->notify(new ClinicNotification('Test 2', 'Message 2', 'info'));
        
        $this->assertCount(2, $patient->unreadNotifications);

        $response = $this->actingAs($patient)->post(route('notifications.read-all'));
        
        $response->assertRedirect();
        $this->assertCount(0, $patient->fresh()->unreadNotifications);
    }
}
