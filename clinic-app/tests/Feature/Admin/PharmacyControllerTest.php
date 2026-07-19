<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Medication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class PharmacyControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'doctor']);
        Role::firstOrCreate(['name' => 'patient']);
    }

    public function test_admin_can_access_pharmacy_inventory()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get(route('admin.pharmacy.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page->component('Admin/Pharmacy'));
    }

    public function test_admin_can_store_medication()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->post(route('admin.pharmacy.store'), [
            'name' => 'Paracetamol',
            'description' => 'Pain relief',
            'stock_quantity' => 100,
            'low_stock_threshold' => 20,
            'unit' => 'tablets',
            'price' => 10.0,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('medications', [
            'name' => 'Paracetamol',
            'stock_quantity' => 100,
        ]);
    }

    public function test_non_admin_cannot_access_pharmacy()
    {
        $patient = User::factory()->create(['role' => 'patient']);
        $patient->assignRole('patient');

        $response = $this->actingAs($patient)->get(route('admin.pharmacy.index'));
        $response->assertStatus(403);
    }
}
