<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\Order;
use App\Models\OrderItem;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with([
                'items.product',
            ])
            ->latest()
            ->get();

        return response()->json(
            $orders
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([

            'name' => ['required'],

            'phone' => ['required'],

            'address' => ['required'],

            'notes' => ['nullable'],

        ]);

        $user = $request->user();

        $carts = $user->carts()
            ->with('product')
            ->get();

        if ($carts->isEmpty()) {

            return response()->json([
                'message' => 'Cart kosong'
            ], 422);
        }

        DB::beginTransaction();

        try {

            $total = $carts->sum(function ($item) {

                return
                    $item->product->price *
                    $item->quantity;
            });

            $order = Order::create([

                'user_id' => $user->id,

                'name' => $validated['name'],

                'phone' => $validated['phone'],

                'address' => $validated['address'],

                'notes' => $validated['notes'] ?? null,

                'total_price' => $total,

                'status' => 'pending',
            ]);

            foreach ($carts as $cart) {

                OrderItem::create([

                    'order_id' => $order->id,

                    'product_id' => $cart->product_id,

                    'quantity' => $cart->quantity,

                    'price' => $cart->product->price,
                ]);
            }

            $user->carts()->delete();

            DB::commit();

            return response()->json([

                'message' => 'Checkout berhasil',

                'order' => $order->load([
                    'items.product',
                    'user',
                ]),
            ]);

        } catch (\Throwable $th) {

            DB::rollBack();

            return response()->json([

                'message' => 'Checkout gagal',

                'error' => $th->getMessage(),

            ], 500);
        }
    }

    public function show(
        Request $request,
        Order $order
    )
    {

        if (
            $order->user_id !==
            $request->user()->id
        ) {

            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        return response()->json(

            $order->load([
                'items.product',
                'user',
            ])

        );
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN ORDERS
    |--------------------------------------------------------------------------
    */

    public function adminOrders(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | FIX 403 ADMIN
        |--------------------------------------------------------------------------
        | Cek user login + role admin
        */

        $user = $request->user();

        if (!$user) {

            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Support beberapa format role
        |--------------------------------------------------------------------------
        */

        $isAdmin =
            ($user->role ?? null) === 'admin' ||
            ($user->is_admin ?? null) == 1;

        if (!$isAdmin) {

            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        $orders = Order::with([

            'items.product',

            'user',

        ])
        ->latest()
        ->get();

        return response()->json(
            $orders
        );
    }

    public function updateStatus(
        Request $request,
        Order $order
    )
    {
        /*
        |--------------------------------------------------------------------------
        | FIX 403 ADMIN
        |--------------------------------------------------------------------------
        */

        $user = $request->user();

        if (!$user) {

            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        $isAdmin =
            ($user->role ?? null) === 'admin' ||
            ($user->is_admin ?? null) == 1;

        if (!$isAdmin) {

            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        $validated = $request->validate([

            'status' => [
                'required',
                'in:pending,success'
            ],

        ]);

        $order->update([

            'status' =>
                $validated['status'],

        ]);

        /*
        |--------------------------------------------------------------------------
        | RETURN FULL ORDER
        |--------------------------------------------------------------------------
        */

        $updatedOrder = $order->fresh([
            'items.product',
            'user',
        ]);

        /*
        |--------------------------------------------------------------------------
        | OPTIONAL BROADCAST
        |--------------------------------------------------------------------------
        | Kalau event belum ada, tidak error
        */

        try {

            broadcast(
                new \App\Events\OrderUpdated(
                    $updatedOrder
                )
            )->toOthers();

        } catch (\Throwable $e) {
            // ignore
        }

        return response()->json([

            'message' =>
                'Status updated',

            'order' =>
                $updatedOrder,

        ]);
    }
}