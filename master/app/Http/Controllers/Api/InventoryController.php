<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inventory;

class InventoryController extends Controller
{
    public function index()
    {
        return response()->json(Inventory::all());
    }

    public function update(Request $request, $id)
    {
        try {
            // Validate quantity
            $validated = $request->validate([
                'quantity' => 'required|integer|min:0',
            ]);

            // Find and update item
            $item = Inventory::findOrFail($id);
            $item->quantity = $validated['quantity'];
            $item->save();

            return response()->json(['message' => 'Inventory updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
