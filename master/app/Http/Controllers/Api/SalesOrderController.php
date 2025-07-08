<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesOrder;
use Illuminate\Http\Request;

class SalesOrderController extends Controller
{

    public function getPendingCount()
{
    $count = SalesOrder::where('status', 'Pending')->count();

    return response()->json(['count' => $count]);
}

public function getProcessingCount() {
    $count = SalesOrder::where('status', 'Processing')->count();
    return response()->json(['count' => $count]);
}

public function getCompletedCount() {
    $count = SalesOrder::where('status', 'Completed')->count();
    return response()->json(['count' => $count]);
}

    public function index()
    {
        return SalesOrder::all();
    }

public function update(Request $request, $id)
{
    $order = SalesOrder::findOrFail($id);

    $request->validate([
        'status' => 'required|string|in:Pending,Processing,Completed',
    ]);

    $order->status = $request->status;
    $order->save();

    return response()->json(['message' => 'Updated successfully', 'order' => $order]);
}

public function store(Request $request)
{
    $validated = $request->validate([
        'customer_name' => 'required|string',
        'location' => 'required|string',
        'products' => 'required|string',
        'amount' => 'required|numeric',
        'date' => 'required|date',
        'delivery_date' => 'required|date',
        'status' => 'required|string|in:Pending,Processing,Completed',
        'qty_350ml' => 'nullable|integer',
        'qty_500ml' => 'nullable|integer',
        'qty_1L'     => 'nullable|integer',
        'qty_6L'     => 'nullable|integer',
        'quantities' => 'required|array',
    ]);

    $order = SalesOrder::create($validated);

    return response()->json($order, 201);
}

    public function destroy(Request $request)
    {
        SalesOrder::destroy($request->ids); // expects array of IDs
        return response()->json(['message' => 'Deleted']);
    }
}

