<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vital extends Model
{
    protected $fillable = [
        'patient_id',
        'appointment_id',
        'blood_pressure',
        'heart_rate',
        'temperature',
        'weight',
        'height',
        'respiratory_rate',
        'notes',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
