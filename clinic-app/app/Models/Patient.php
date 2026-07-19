<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Patient extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'user_id', 'address', 'nic', 'dob', 'tel', 
        'gender', 'blood_group', 'allergies', 'medical_conditions'
    ];

    protected $casts = [
        'dob' => 'date',
        'allergies' => 'encrypted',
        'medical_conditions' => 'encrypted',
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appointments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function vitals(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Vital::class);
    }
}
