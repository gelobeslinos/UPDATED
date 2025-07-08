<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesOrder extends Model
{
    use HasFactory;

protected $table = 'sales_orders';
protected $fillable = [
    'date',
    'customer_name',
    'location',
    'products',
    'delivery_date',
    'status',
    'amount',
    'qty_350ml',
    'qty_500ml',
    'qty_1L',
    'qty_6L',
    'quantities',
];

protected $casts = [
    'quantities' => 'array',
];

}
