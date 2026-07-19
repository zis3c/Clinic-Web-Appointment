<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\SecurityLog;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class SecurityMonitorMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $payload = json_encode($request->all());
        $redactedPayload = $this->redactSensitiveData($request->all());
        $signals = [
            $request->fullUrl(),
            $request->path(),
            (string) $payload,
        ];

        foreach ($signals as $signal) {
            $rule = $this->findSuspiciousPattern($signal);
            if ($rule !== null) {
                SecurityLog::create([
                    'ip_address' => $request->ip(),
                    'event_type' => 'waf_block',
                    'description' => 'Suspicious payload or URL detected matching pattern: ' . $rule,
                    'payload' => $redactedPayload,
                    'user_id' => auth()->id() ?? null,
                ]);

                return response()->json(['error' => 'Forbidden - Malicious Activity Detected'], 403);
            }
        }

        if (strlen((string) $payload) > 100000) {
            SecurityLog::create([
                'ip_address' => $request->ip(),
                'event_type' => 'waf_block',
                'description' => 'Request payload too large for security monitor.',
                'payload' => ['size' => strlen((string) $payload)],
                'user_id' => auth()->id() ?? null,
            ]);

            return response()->json(['error' => 'Forbidden - Malicious Activity Detected'], 413);
        }

        return $next($request);
    }

    private function findSuspiciousPattern(string $value): ?string
    {
        $patterns = [
            '<script' => 'xss_script_tag',
            'javascript:' => 'xss_javascript_uri',
            'onerror=' => 'xss_event_handler',
            'onload=' => 'xss_event_handler',
            'union select' => 'sqli_union_select',
            'information_schema' => 'sqli_information_schema',
            'sleep(' => 'sqli_time_delay',
            'benchmark(' => 'sqli_time_delay',
            '../../' => 'path_traversal',
            '..\\' => 'path_traversal',
            'php://' => 'php_stream_wrapper',
            'data:text/html' => 'xss_data_uri',
        ];

        $normalized = Str::lower(rawurldecode($value));
        foreach ($patterns as $needle => $label) {
            if (str_contains($normalized, $needle)) {
                return $label;
            }
        }

        return null;
    }

    private function redactSensitiveData(array $data): array
    {
        $redacted = [];

        foreach ($data as $key => $value) {
            $normalizedKey = strtolower((string) $key);
            $isSensitive = str_contains($normalizedKey, 'password')
                || str_contains($normalizedKey, 'token')
                || str_contains($normalizedKey, 'secret')
                || str_contains($normalizedKey, 'code')
                || str_contains($normalizedKey, 'otp')
                || str_contains($normalizedKey, 'api_key')
                || str_contains($normalizedKey, 'app_key')
                || str_contains($normalizedKey, 'authorization')
                || in_array($normalizedKey, ['password', 'current_password', 'password_confirmation', 'remember_token', 'two_factor_code', 'two_factor_token'], true);

            if ($isSensitive) {
                $redacted[$key] = '[REDACTED]';
                continue;
            }

            if (is_array($value)) {
                $redacted[$key] = $this->redactSensitiveData($value);
                continue;
            }

            $redacted[$key] = $value;
        }

        return $redacted;
    }
}
