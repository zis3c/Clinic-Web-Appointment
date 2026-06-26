<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = ['patient_id', 'schedule_id', 'appointment_number', 'date', 'status', 'checked_in', 'checked_in_at', 'time_slot', 'diagnosis', 'prescriptions', 'notes'];

    protected $casts = [
        'date' => 'date',
        'checked_in_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }
}
