<?php

// app/Models/Inventory.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = ['item', 'unit', 'quantity'];
}

