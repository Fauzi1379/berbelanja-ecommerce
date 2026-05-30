<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * GET USER CART
     */
    public function index(Request $request)
    {
        $carts = Cart::with('product')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($carts);
    }

    /**
     * ADD PRODUCT TO CART
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => [
                'required',
                'exists:products,id',
            ],

            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $product = Product::findOrFail(
            $validated['product_id']
        );

        $cart = Cart::where(
                'user_id',
                $request->user()->id
            )
            ->where(
                'product_id',
                $product->id
            )
            ->first();

        if ($cart) {

            $cart->increment(
                'quantity',
                $validated['quantity']
            );

            $cart->refresh();

        } else {

            $cart = Cart::create([
                'user_id' =>
                    $request->user()->id,

                'product_id' =>
                    $product->id,

                'quantity' =>
                    $validated['quantity'],
            ]);

        }

        return response()->json([
            'message' =>
                'Product added to cart',

            'cart' =>
                $cart->load('product'),
        ]);
    }

    /**
     * UPDATE CART QUANTITY
     */
    public function update(
        Request $request,
        Cart $cart
    ) {

        if (
            $cart->user_id !==
            $request->user()->id
        ) {
            abort(403);
        }

        $validated = $request->validate([
            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $cart->update([
            'quantity' =>
                $validated['quantity'],
        ]);

        return response()->json([
            'message' => 'Cart updated',

            'cart' =>
                $cart->load('product'),
        ]);
    }

    /**
     * DELETE CART
     */
    public function destroy(
        Request $request,
        Cart $cart
    ) {

        if (
            $cart->user_id !==
            $request->user()->id
        ) {
            abort(403);
        }

        $cart->delete();

        return response()->json([
            'message' => 'Cart deleted',
        ]);
    }
}