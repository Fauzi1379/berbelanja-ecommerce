<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Events\OrderUpdated;
use Illuminate\Http\Request;
use App\Exports\OrdersExport;
use Maatwebsite\Excel\Facades\Excel;

class AdminOrderController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL ORDERS
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        return Order::latest()->get();
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE STATUS
    |--------------------------------------------------------------------------
    */

    public function updateStatus(
        Request $request,
        Order $order
    ) {

        $request->validate([
            "status" =>
                "required|in:pending,success",
        ]);

        /*
        |--------------------------------------------------------------------------
        | UPDATE ORDER STATUS
        |--------------------------------------------------------------------------
        */

        $order->update([
            "status" =>
                $request->status,
        ]);

        /*
        |--------------------------------------------------------------------------
        | REFRESH ORDER DATA
        |--------------------------------------------------------------------------
        */

        $order->refresh();

        /*
        |--------------------------------------------------------------------------
        | BROADCAST REALTIME EVENT
        |--------------------------------------------------------------------------
        */

        broadcast(
            new OrderUpdated($order)
        )->toOthers();

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            "message" =>
                "Status updated successfully",

            "data" =>
                $order,
        ]);

    }

    /*
    |--------------------------------------------------------------------------
    | EXPORT EXCEL
    |--------------------------------------------------------------------------
    */

    public function export()
    {
        return Excel::download(
            new OrdersExport,
            "orders.xlsx"
        );
    }
}