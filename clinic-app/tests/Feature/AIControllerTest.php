<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\ChatSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class AIControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'doctor']);
        Role::firstOrCreate(['name' => 'patient']);
    }

    public function test_guest_triage_returns_emergency_response_for_chest_pain()
    {
        $response = $this->postJson(route('ai.guest-triage'), [
            'message' => 'I have severe chest pain and trouble breathing',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['success', 'message']);
        
        $this->assertStringContainsString('emergency', strtolower($response->json('message')));
    }

    public function test_authenticated_user_can_clear_chat_session()
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        $patientUser->assignRole('patient');

        $session = ChatSession::create(['user_id' => $patientUser->id]);
        $session->messages()->create([
            'role' => 'user',
            'content' => 'Hello AI'
        ]);

        $this->assertDatabaseHas('chat_sessions', ['user_id' => $patientUser->id]);

        $response = $this->actingAs($patientUser)->postJson(route('ai.session.clear'));
        
        $response->assertStatus(200);
        $this->assertDatabaseMissing('chat_sessions', ['user_id' => $patientUser->id]);
    }
}
