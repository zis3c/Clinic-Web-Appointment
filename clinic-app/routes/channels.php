<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('queue', function ($user = null) {
    // Allow all connections to the queue channel.
    // The AppointmentUpdated event only broadcasts a refresh signal,
    // not patient details. Full data is loaded via server request.
    return true;
});
