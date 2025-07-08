<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;

class PurchaseOrderController extends Controller
{

public function index()
{
    return response()->json(PurchaseOrder::with('items')->get());
}

public function store(Request $request)
{
    $request->validate([
        'po_number' => 'required|unique:purchase_orders',
        'supplier_name' => 'required',
        'order_date' => 'required|date',
        'expected_date' => 'required|date',
        'status' => 'required',
        'amount' => 'required|numeric'
    ]);

    $order = PurchaseOrder::create($request->all());

    return response()->json($order, 201);
}

// app/Http/Controllers/Api/PurchaseOrderController.php
public function destroy($id)
{
    $order = PurchaseOrder::findOrFail($id);
    $order->items()->delete(); // delete related items first if needed
    $order->delete();

    return response()->json(['message' => 'Deleted successfully']);
}

}

