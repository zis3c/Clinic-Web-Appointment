<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Confirm Cancellation</title>
</head>
<body class="min-h-screen bg-slate-100 text-slate-900 antialiased">
    <main class="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12">
        <section class="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">Cancel appointment</p>
            <h1 class="mt-3 text-3xl font-bold text-slate-950">Review before cancelling</h1>
            <p class="mt-4 text-sm leading-6 text-slate-600">
                This link only opens a confirmation page. The appointment will stay intact until you explicitly confirm.
            </p>

            <dl class="mt-8 grid gap-4 rounded-2xl bg-slate-50 p-5 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                    <dt class="font-semibold text-slate-500">Patient</dt>
                    <dd class="mt-1 text-slate-900">{{ $appointment->patient->user->name ?? 'Unknown' }}</dd>
                </div>
                <div>
                    <dt class="font-semibold text-slate-500">Doctor</dt>
                    <dd class="mt-1 text-slate-900">Dr. {{ $appointment->schedule->doctor->user->name ?? 'Unknown' }}</dd>
                </div>
                <div>
                    <dt class="font-semibold text-slate-500">Date</dt>
                    <dd class="mt-1 text-slate-900">{{ optional($appointment->date)->format('F j, Y') }}</dd>
                </div>
                <div>
                    <dt class="font-semibold text-slate-500">Time</dt>
                    <dd class="mt-1 text-slate-900">{{ $appointment->time_slot }}</dd>
                </div>
                <div>
                    <dt class="font-semibold text-slate-500">Status</dt>
                    <dd class="mt-1 text-slate-900">{{ ucfirst((string) $appointment->status) }}</dd>
                </div>
                <div>
                    <dt class="font-semibold text-slate-500">Appointment #</dt>
                    <dd class="mt-1 text-slate-900">#{{ $appointment->appointment_number }}</dd>
                </div>
            </dl>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <a href="{{ route('login') }}" class="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    Keep appointment
                </a>

                <form method="POST" action="{{ $cancelUrl }}" class="inline">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
                        Confirm cancellation
                    </button>
                </form>
            </div>
        </section>
    </main>
</body>
</html>
