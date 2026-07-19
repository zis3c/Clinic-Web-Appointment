<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Schedule extends Model
{
    use HasFactory, Auditable;

    protected $fillable = ['doctor_id', 'title', 'date', 'time', 'type', 'number_of_patients', 'slot_duration'];

    protected $casts = [
        'date' => 'date',
    ];

    public function doctor(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function appointments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
