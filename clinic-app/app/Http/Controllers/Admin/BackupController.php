<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;
use Symfony\Component\Process\Process;

class BackupController extends Controller
{
    public function create()
    {
        $dbPath = database_path('database.sqlite');
        
        if (config('database.default') !== 'pgsql' && !File::exists($dbPath)) {
            return back()->withErrors(['backup' => 'Database file not found.']);
        }

        $backupDir = storage_path('app/backups');
        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        $filename = 'backup_janjicare_' . Carbon::now()->format('Ymd_His') . (config('database.default') === 'pgsql' ? '.sql' : '.sqlite');
        $backupPath = storage_path('app/backups/' . $filename);

        if (config('database.default') === 'pgsql') {
            $host = config('database.connections.pgsql.host');
            $user = config('database.connections.pgsql.username');
            $pass = config('database.connections.pgsql.password');
            $db = config('database.connections.pgsql.database');
            $process = new Process(['pg_dump', '-h', $host, '-U', $user, $db], null, [
                'PGPASSWORD' => (string) $pass,
            ]);
            $process->setTimeout(120);

            $handle = fopen($backupPath, 'wb');
            if ($handle === false) {
                return back()->withErrors(['backup' => 'Unable to create backup file.']);
            }

            $process->run(function (string $type, string $buffer) use ($handle): void {
                fwrite($handle, $buffer);
            });

            fclose($handle);

            if (! $process->isSuccessful()) {
                File::delete($backupPath);
                return back()->withErrors(['backup' => 'Database backup failed.']);
            }
        } else {
            File::copy($dbPath, $backupPath);
        }

        // Optional: log to SecurityLog for auditing
        \App\Models\SecurityLog::create([
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'payload' => 'Triggered Manual Database Backup',
            'event_type' => 'backup_created'
        ]);

        return back()->with('success', 'Database backup created successfully: ' . $filename);
    }

    public function download($filename)
    {
        // Sanitize: strip any directory traversal and resolve to basename only
        $filename = basename($filename);
        
        $path = storage_path('app/backups/' . $filename);
        
        // Additional safeguard: verify the resolved real path is within the backups directory
        $realPath = realpath($path);
        $backupsDir = realpath(storage_path('app/backups'));
        
        if (!$realPath || !$backupsDir || !str_starts_with($realPath, $backupsDir . DIRECTORY_SEPARATOR)) {
            \App\Models\SecurityLog::create([
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'url' => request()->fullUrl(),
                'method' => request()->method(),
                'payload' => 'Path Traversal Attempt: ' . $filename,
                'event_type' => 'waf_block'
            ]);
            abort(403, 'Access denied.');
        }
        
        if (!File::exists($realPath)) {
            return back()->withErrors(['backup' => 'Backup file not found.']);
        }
        
        // Log the download action
        \App\Models\SecurityLog::create([
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'payload' => 'Downloaded Backup: ' . $filename,
            'event_type' => 'backup_downloaded'
        ]);

        return response()->download($realPath);
    }
}
