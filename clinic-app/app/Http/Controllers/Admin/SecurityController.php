<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SecurityLog;
use App\Models\AuditLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class SecurityController extends Controller
{
    public function index()
    {
        // Calculate basic stats
        $today = Carbon::today();
        
        $totalFailedLogins = SecurityLog::where('event_type', 'failed_login')->count();
        $totalWafBlocks = SecurityLog::where('event_type', 'waf_block')->count();
        
        $todayFailedLogins = SecurityLog::where('event_type', 'failed_login')
            ->whereDate('created_at', $today)
            ->count();
            
        $todayWafBlocks = SecurityLog::where('event_type', 'waf_block')
            ->whereDate('created_at', $today)
            ->count();

        // Get recent logs (last 50)
        $logs = SecurityLog::orderBy('created_at', 'desc')->take(50)->get();

        // Top 5 Attacking IPs
        $topIps = SecurityLog::select('ip_address', \DB::raw('count(*) as total'))
            ->groupBy('ip_address')
            ->orderByDesc('total')
            ->take(5)
            ->get();
            
        // Get HIPAA Audit Logs
        $auditLogs = AuditLog::with('user:id,name,email,role')->latest()->take(50)->get();
        
        // Get Locked Users
        $lockedUsers = User::whereNotNull('locked_until')->where('locked_until', '>', now())->get();

        // Get Backups
        $backups = [];
        if (Storage::exists('backups')) {
            $files = Storage::files('backups');
            foreach ($files as $file) {
                $backups[] = [
                    'name' => basename($file),
                    'size' => round(Storage::size($file) / 1024 / 1024, 2) . ' MB',
                    'date' => Carbon::createFromTimestamp(Storage::lastModified($file))->toDateTimeString(),
                ];
            }
            // Sort by date descending
            usort($backups, function ($a, $b) {
                return $b['date'] <=> $a['date'];
            });
        }

        return Inertia::render('Admin/Security', [
            'stats' => [
                'totalFailedLogins' => $totalFailedLogins,
                'totalWafBlocks' => $totalWafBlocks,
                'todayFailedLogins' => $todayFailedLogins,
                'todayWafBlocks' => $todayWafBlocks,
            ],
            'logs' => $logs,
            'topIps' => $topIps,
            'auditLogs' => $auditLogs,
            'lockedUsers' => $lockedUsers,
            'backups' => $backups,
        ]);
    }

    public function unlockUser($id)
    {
        $user = User::findOrFail($id);
        $user->forceFill(['locked_until' => null])->save();
        
        return back()->with('success', 'User account unlocked successfully.');
    }
}
