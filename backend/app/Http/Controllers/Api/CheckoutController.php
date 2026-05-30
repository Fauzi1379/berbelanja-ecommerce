<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'shipping_address' => ['required'],
        ]);

        $carts = Cart::with('product')
            ->where('user_id', $request->user()->id)
            ->get();

        if ($carts->count() === 0) {
            return response()->json([
                'message' => 'Cart kosong',
            ], 422);
        }

        $totalPrice = 0;

        foreach ($carts as $cart) {

            $totalPrice +=
                $cart->product->price * $cart->quantity;
        }

        $order = Order::create([
            'user_id' => $request->user()->id,
            'invoice' => 'INV-' . strtoupper(Str::random(10)),
            'total_price' => $totalPrice,
            'status' => 'pending',
            'shipping_address' => $validated['shipping_address'],
        ]);

        foreach ($carts as $cart) {

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $cart->product_id,
                'quantity' => $cart->quantity,
                'price' => $cart->product->price,
            ]);

        }

        Cart::where('user_id', $request->user()->id)
            ->delete();

        return response()->json([
            'message' => 'Checkout berhasil',
            'order' => $order,
        ]);
    }

    public function orders(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->latest()
            ->get();

        return response()->json($orders);
    }
}