<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use App\Traits\Auditable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles, Auditable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $guarded = [
        'role',
        'otp_code',
        'otp_expires_at',
        'two_factor_code',
        'two_factor_expires_at',
        'locked_until',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
        'otp_expires_at',
        'two_factor_code',
        'two_factor_expires_at',
        'locked_until',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'otp_expires_at' => 'datetime',
            'two_factor_expires_at' => 'datetime',
            'locked_until' => 'datetime',
        ];
    }

    public function generateTwoFactorCode()
    {
        $code = sprintf('%06d', random_int(0, 999999));
        $this->forceFill([
            'two_factor_code' => $code,
            'two_factor_expires_at' => now()->addMinutes(10),
        ])->save();
        return $code;
    }

    public function generateOtpCode()
    {
        $otp = sprintf('%06d', random_int(0, 999999));
        $this->forceFill([
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(15),
        ])->save();
        return $otp;
    }

    public function sendEmailVerificationNotification()
    {
        $otp = $this->generateOtpCode();
        $this->notify(new \App\Notifications\VerifyEmailOtpNotification($otp));
    }

    public function doctor(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Doctor::class);
    }

    public function patient(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Patient::class);
    }

    public function getRoleAttribute()
    {
        return $this->roles->first()->name ?? $this->attributes['role'] ?? 'patient';
    }
}
