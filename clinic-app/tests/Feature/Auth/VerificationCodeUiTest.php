<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class VerificationCodeUiTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_verification_screen_shows_dev_code_when_enabled(): void
    {
        config()->set('security.show_verification_codes_in_ui', true);

        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);
        $user->forceFill([
            'otp_code' => '123456',
            'otp_expires_at' => now()->addMinutes(15),
        ])->save();

        $response = $this->actingAs($user)->get(route('verification.notice'));

        $response->assertStatus(200);
        $response->assertSee('123456', false);
    }

    public function test_email_verification_screen_hides_dev_code_when_disabled(): void
    {
        config()->set('security.show_verification_codes_in_ui', false);

        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);
        $user->forceFill([
            'otp_code' => '654321',
            'otp_expires_at' => now()->addMinutes(15),
        ])->save();

        $response = $this->actingAs($user)->get(route('verification.notice'));

        $response->assertStatus(200);
        $response->assertDontSee('654321', false);
    }

    public function test_two_factor_screen_shows_dev_code_when_enabled(): void
    {
        config()->set('security.show_verification_codes_in_ui', true);

        $user = User::factory()->create([
            'email_verified_at' => now(),
            'password' => Hash::make('SmokePass123'),
        ]);
        $user->forceFill([
            'two_factor_code' => '222333',
            'two_factor_expires_at' => now()->addMinutes(10),
        ])->save();

        $response = $this->withSession([
            '2fa_user_id' => $user->id,
        ])->get(route('verify-2fa.index'));

        $response->assertStatus(200);
        $response->assertSee('222333', false);
    }
}
