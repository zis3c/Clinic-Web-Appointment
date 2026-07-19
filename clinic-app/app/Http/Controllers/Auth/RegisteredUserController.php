<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'tel' => 'nullable|string|max:15',
            'nic' => 'nullable|string|max:15',
            'dob' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'gender' => 'nullable|string|in:Male,Female,Other',
            'blood_group' => 'nullable|string|max:5',
            'allergies' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'patient', // Explicitly set role just in case
        ]);
        
        $user->assignRole('patient');

        // Create the associated patient profile
        Patient::create([
            'user_id' => $user->id,
            'tel' => $request->tel,
            'nic' => $request->nic,
            'dob' => $request->dob,
            'address' => $request->address,
            'gender' => $request->gender,
            'blood_group' => $request->blood_group,
            'allergies' => $request->allergies,
            'medical_conditions' => $request->medical_conditions,
        ]);

        // Notify Admins
        try {
            $admins = User::role('admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\ClinicNotification(
                    'New Patient Registration',
                    "A new patient ({$user->name}) has just registered.",
                    'success'
                ));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to notify admins of new registration: ' . $e->getMessage());
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
