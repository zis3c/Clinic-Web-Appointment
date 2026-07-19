<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $sessions = DB::table('sessions')
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) use ($request) {
                // Determine agent
                $agent = $this->createAgent($session->user_agent);

                return (object) [
                    'id' => $session->id,
                    'agent' => $agent,
                    'ip_address' => $session->ip_address,
                    'is_current_device' => $session->id === $request->session()->getId(),
                    'last_active' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                ];
            });

        $patientData = null;
        if ($request->user()->role === 'patient') {
            $patientData = $request->user()->patient;
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'sessions' => $sessions,
            'patientData' => $patientData,
        ]);
    }

    /**
     * Create a basic agent parsing array.
     */
    protected function createAgent($userAgent)
    {
        // Simple manual parsing since jenssegers/agent might not be installed
        $browser = 'Unknown';
        $platform = 'Unknown';

        if (preg_match('/windows/i', $userAgent)) {
            $platform = 'Windows';
        } elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
            $platform = 'macOS';
        } elseif (preg_match('/linux/i', $userAgent)) {
            $platform = 'Linux';
        } elseif (preg_match('/iphone|ipad|ipod/i', $userAgent)) {
            $platform = 'iOS';
        } elseif (preg_match('/android/i', $userAgent)) {
            $platform = 'Android';
        }

        if (preg_match('/edg/i', $userAgent)) {
            $browser = 'Edge';
        } elseif (preg_match('/chrome|crios/i', $userAgent)) {
            $browser = 'Chrome';
        } elseif (preg_match('/safari/i', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/firefox|fxios/i', $userAgent)) {
            $browser = 'Firefox';
        } elseif (preg_match('/opera|opr/i', $userAgent)) {
            $browser = 'Opera';
        }

        return [
            'is_desktop' => in_array($platform, ['Windows', 'macOS', 'Linux']),
            'platform' => $platform,
            'browser' => $browser,
        ];
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit')->with('success', 'Profile information updated successfully.');
    }

    /**
     * Update the user's avatar.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ]);

        if ($request->hasFile('avatar')) {
            $user = $request->user();

            // Delete old avatar if it exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
            $user->save();
        }

        return Redirect::route('profile.edit')->with('success', 'Profile picture updated successfully.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Log out from other browser sessions.
     */
    public function destroyOtherBrowserSessions(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        Auth::logoutOtherDevices($request->password);

        $request->session()->put([
            'password_hash_'.Auth::getDefaultDriver() => Auth::user()->getAuthPassword(),
        ]);

        // Delete from DB manually just to clean up immediately
        DB::table('sessions')
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        return Redirect::route('profile.edit')->with('success', 'Other browser sessions logged out successfully.');
    }

    /**
     * Log out from a specific browser session.
     */
    public function destroySpecificBrowserSession(Request $request, $sessionId): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        // Delete from DB manually just to clean up immediately
        DB::table('sessions')
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->where('id', $sessionId)
            ->delete();

        return Redirect::route('profile.edit')->with('success', 'Browser session logged out successfully.');
    }
}
