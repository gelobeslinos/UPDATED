<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SalesOrderController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\InventoryRawMatsController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\PurchaseOrderItemController;
use App\Http\Controllers\Api\ForecastController;

Route::get('/orders/pending-count', [SalesOrderController::class, 'getPendingCount']);
Route::get('/orders/processing-count', [SalesOrderController::class, 'getProcessingCount']);
Route::get('/orders/completed-count', [SalesOrderController::class, 'getCompletedCount']);

Route::get('/sales-orders', [SalesOrderController::class, 'index']);
Route::put('/sales-orders/{id}', [SalesOrderController::class, 'update']);
Route::delete('/sales-orders', [SalesOrderController::class, 'destroy']);
Route::post('/sales-orders', [SalesOrderController::class, 'store']);

Route::get('/inventory', [InventoryController::class, 'index']);
Route::get('/inventory_rawmats', [InventoryRawMatsController::class, 'index']);
Route::put('/inventory/{id}', [InventoryController::class, 'update']);
Route::put('/inventory_rawmats/{id}', [InventoryRawMatsController::class, 'update']);

Route::apiResource('items', ItemController::class);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Route::middleware('guest')->post('/register', [AuthController::class, 'register']);
// Route::middleware('guest')->post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
Route::delete('/purchase-orders/{id}', [PurchaseOrderController::class, 'destroy']);


Route::post('/purchase-order-items', [PurchaseOrderItemController::class, 'store']);
Route::get('/purchase-order-items/{purchaseOrderId}', [PurchaseOrderItemController::class, 'getByPurchaseOrder']);

Route::get('/historical-sales', [ForecastController::class, 'historicalSales']);