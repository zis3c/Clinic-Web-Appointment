<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    public static function bootAuditable()
    {
        static::created(function ($model) {
            $model->logAudit('created', null, $model->getFilteredAttributes());
        });

        static::updated(function ($model) {
            $model->logAudit('updated', $model->getFilteredOriginal(), $model->getFilteredChanges());
        });

        static::deleted(function ($model) {
            $model->logAudit('deleted', $model->getFilteredOriginal(), null);
        });
    }

    protected function getFilteredAttributes(): array
    {
        return $this->filterSensitiveFields($this->getAttributes());
    }

    protected function getFilteredOriginal(): array
    {
        return $this->filterSensitiveFields($this->getOriginal());
    }

    protected function getFilteredChanges(): array
    {
        return $this->filterSensitiveFields($this->getChanges());
    }

    protected function filterSensitiveFields(array $data): array
    {
        $sensitiveFields = [
            'password',
            'remember_token',
            'otp_code',
            'otp_expires_at',
            'two_factor_code',
            'two_factor_expires_at',
            'locked_until',
        ];

        foreach ($sensitiveFields as $field) {
            if (array_key_exists($field, $data)) {
                $data[$field] = '[REDACTED]';
            }
        }

        return $data;
    }

    protected function logAudit($action, $oldValues, $newValues)
    {
        // Don't log if running in console (e.g. migrations/seeders), unless running tests
        if (app()->runningInConsole() && !app()->runningUnitTests()) {
            return;
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'model_type' => get_class($this),
            'model_id' => $this->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
