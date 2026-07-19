<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medication extends Model
{
    protected $fillable = [
        'name',
        'description',
        'category',
        'supplier',
        'expiry_date',
        'stock_quantity',
        'unit',
        'price',
        'low_stock_threshold',
    ];

    public function stockAdjustments()
    {
        return $this->hasMany(StockAdjustment::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }
}
