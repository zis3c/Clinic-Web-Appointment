<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Appointment extends Model
{
    use HasFactory, Auditable;

    protected $fillable = ['patient_id', 'schedule_id', 'appointment_number', 'date', 'status', 'checked_in', 'checked_in_at', 'time_slot', 'diagnosis', 'prescriptions', 'notes'];

    protected $casts = [
        'date' => 'date',
        'checked_in_at' => 'datetime',
        'reminded_24h' => 'boolean',
        'reminded_1h' => 'boolean',
    ];

    public function patient(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function schedule(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function vital(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Vital::class);
    }

    public function pharmacyPrescriptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Prescription::class);
    }
}
