<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class TwoFactorController extends Controller
{
    private const ATTEMPT_SESSION_KEY = '2fa_attempts';

    public function index(Request $request)
    {
        if (!$request->session()->has('2fa_user_id')) {
            return redirect()->route('login');
        }

        $user = User::find($request->session()->get('2fa_user_id'));

        return Inertia::render('Auth/Verify2FA', [
            'devVerificationCode' => config('security.show_verification_codes_in_ui')
                ? $user?->two_factor_code
                : null,
            'devVerificationExpiresAt' => config('security.show_verification_codes_in_ui')
                ? $user?->two_factor_expires_at?->toDayDateTimeString()
                : null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $userId = $request->session()->get('2fa_user_id');
        if (!$userId) {
            return redirect()->route('login');
        }

        $maxAttempts = (int) config('security.staff_two_factor_max_attempts', 5);
        $attempts = (int) $request->session()->get(self::ATTEMPT_SESSION_KEY, 0);
        if ($attempts >= $maxAttempts) {
            $request->session()->forget(['2fa_user_id', '2fa_remember', self::ATTEMPT_SESSION_KEY]);
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'code' => 'Too many 2FA failures. Please sign in again.',
            ]);
        }

        $user = User::find($userId);

        if (!$user || $user->two_factor_code !== $request->code || now()->greaterThan($user->two_factor_expires_at)) {
            $attempts++;
            $request->session()->put(self::ATTEMPT_SESSION_KEY, $attempts);

            if ($attempts >= $maxAttempts) {
                $request->session()->forget(['2fa_user_id', '2fa_remember', self::ATTEMPT_SESSION_KEY]);
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors([
                    'code' => 'Too many 2FA failures. Please sign in again.',
                ]);
            }

            return back()->withErrors(['code' => 'The provided two-factor authentication code was invalid or has expired.']);
        }

        // Clear 2FA code
        $user->forceFill([
            'two_factor_code' => null,
            'two_factor_expires_at' => null,
        ])->save();

        Auth::login($user, $request->session()->get('2fa_remember', false));

        $request->session()->forget(['2fa_user_id', '2fa_remember', self::ATTEMPT_SESSION_KEY]);
        $request->session()->regenerate();

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($user->role === 'doctor') {
            return redirect()->route('doctor.dashboard');
        }

        return redirect()->intended(route('patient.dashboard', absolute: false));
    }
}
