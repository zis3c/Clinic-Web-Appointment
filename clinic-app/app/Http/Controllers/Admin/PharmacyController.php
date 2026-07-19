<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Medication;
use App\Models\StockAdjustment;

class PharmacyController extends Controller
{
    public function index()
    {
        $medications = Medication::orderBy('name', 'asc')->get();
        
        // Calculate Stats
        $totalItems = $medications->count();
        $lowStockCount = $medications->filter(fn($m) => $m->stock_quantity <= $m->low_stock_threshold)->count();
        
        $expiringSoonCount = $medications->filter(function($m) {
            return $m->expiry_date && \Carbon\Carbon::parse($m->expiry_date)->isPast() === false && \Carbon\Carbon::parse($m->expiry_date)->diffInDays(now()) <= 30;
        })->count();
        
        $totalValue = $medications->sum(fn($m) => $m->stock_quantity * $m->price);

        return Inertia::render('Admin/Pharmacy', [
            'medications' => $medications,
            'stats' => [
                'totalItems' => $totalItems,
                'lowStockCount' => $lowStockCount,
                'expiringSoonCount' => $expiringSoonCount,
                'totalValue' => $totalValue,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'supplier' => 'nullable|string|max:255',
            'expiry_date' => 'nullable|date',
            'stock_quantity' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
        ]);

        $medication = Medication::create($validated);
        
        if ($medication->stock_quantity > 0) {
            StockAdjustment::create([
                'medication_id' => $medication->id,
                'user_id' => auth()->id(),
                'type' => 'set',
                'quantity' => $medication->stock_quantity,
                'reason' => 'Initial stock on creation',
            ]);
        }

        if ($medication->stock_quantity <= $medication->low_stock_threshold) {
            $admins = \App\Models\User::role('admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\ClinicNotification(
                    'Low Stock Warning',
                    "Warning: {$medication->name} stock is at {$medication->stock_quantity} (Threshold: {$medication->low_stock_threshold}).",
                    'warning'
                ));
            }
        }

        return redirect()->back()->with('success', 'Medication added successfully.');
    }

    public function update(Request $request, Medication $medication)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'supplier' => 'nullable|string|max:255',
            'expiry_date' => 'nullable|date',
            'stock_quantity' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
        ]);
        
        $oldStock = $medication->stock_quantity;
        $medication->update($validated);
        
        if ($oldStock != $medication->stock_quantity) {
            $difference = $medication->stock_quantity - $oldStock;
            StockAdjustment::create([
                'medication_id' => $medication->id,
                'user_id' => auth()->id(),
                'type' => $difference > 0 ? 'addition' : 'deduction',
                'quantity' => abs($difference),
                'reason' => 'Manual stock update',
            ]);
        }

        if ($medication->stock_quantity <= $medication->low_stock_threshold && $oldStock > $medication->low_stock_threshold) {
            $admins = \App\Models\User::role('admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\ClinicNotification(
                    'Low Stock Warning',
                    "Warning: {$medication->name} stock has dropped to {$medication->stock_quantity} (Threshold: {$medication->low_stock_threshold}).",
                    'warning'
                ));
            }
        }

        return redirect()->back()->with('success', 'Medication updated successfully.');
    }

    public function destroy(Medication $medication)
    {
        $medication->delete();
        return redirect()->back()->with('success', 'Medication deleted successfully.');
    }
}
