<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;

class SyncRolesToSpatie extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'roles:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronizes string-based role column to Spatie roles';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting role sync...');
        
        $roles = ['admin', 'doctor', 'patient'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        $users = User::all();
        $count = 0;
        foreach ($users as $user) {
            $role = $user->getAttributes()['role'] ?? 'patient';
            if (!$user->hasRole($role)) {
                $user->assignRole($role);
                $count++;
            }
        }
        
        $this->info("Successfully synced {$count} users to Spatie roles.");
    }
}
