<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ForecastController extends Controller
{
    /**
     * Return historical sales data aggregated by date for ARIMA forecasting.
     */
    public function historicalSales()
    {
        try {
            $sales = DB::table('sales_orders')
                ->select(
                    'date',
                    DB::raw("
                        SUM(COALESCE((quantities::jsonb ->> '350ml')::int, 0)) +
                        SUM(COALESCE((quantities::jsonb ->> '500ml')::int, 0)) +
                        SUM(COALESCE((quantities::jsonb ->> '1L')::int, 0)) +
                        SUM(COALESCE((quantities::jsonb ->> '6L')::int, 0)) AS total_qty
                    ")
                )
                ->where('status', 'Completed')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            return response()->json($sales);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch historical sales data.',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
