<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\InventoryRawMat;

class InventoryRawMatsController extends Controller
{
    public function index()
    {
        return response()->json(InventoryRawMat::all());
    }

    public function update(Request $request, $id)
    {
        $item = InventoryRawMat::find($id);

        if (!$item) {
            return response()->json(['error' => 'Item not found'], 404);
        }

        $item->update($request->all());
        return response()->json(['message' => 'Raw material updated successfully']);
    }
}
