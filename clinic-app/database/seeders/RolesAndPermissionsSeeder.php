<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $doctorRole = Role::firstOrCreate(['name' => 'doctor']);
        $patientRole = Role::firstOrCreate(['name' => 'patient']);

        // Assign existing users to these roles based on their 'role' column.
        $users = User::all();
        foreach ($users as $user) {
            // Check if user has the legacy 'role' attribute and assign Spatie role
            $legacyRole = $user->getRawOriginal('role');
            if ($legacyRole && in_array($legacyRole, ['admin', 'doctor', 'patient'])) {
                $user->assignRole($legacyRole);
            }
        }
    }
}
