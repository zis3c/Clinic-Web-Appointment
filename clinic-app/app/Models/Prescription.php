<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    protected $fillable = [
        'appointment_id',
        'medication_id',
        'dosage',
        'frequency',
        'duration_days',
        'quantity_dispensed',
        'instructions',
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function medication()
    {
        return $this->belongsTo(Medication::class);
    }
}
