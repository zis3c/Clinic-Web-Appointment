<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Notifications\TwoFactorCodeNotification;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // 2FA Flow for Admin and Doctor
        if (in_array($user->role, ['admin', 'doctor']) && config('security.staff_two_factor_enabled', true)) {
            $code = $user->generateTwoFactorCode();
            $user->notify(new TwoFactorCodeNotification($code));

            Auth::logout();
            
            $request->session()->put('2fa_user_id', $user->id);
            $request->session()->put('2fa_remember', $request->boolean('remember'));

            return redirect()->route('verify-2fa.index');
        }

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($user->role === 'doctor') {
            return redirect()->route('doctor.dashboard');
        }

        return redirect()->intended(route('patient.dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
