<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AdminOrderController;

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {

    return response()->json([
        'status' => 'ok',
        'app' => 'Berbelanja API',
    ]);

});

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

Route::post(
    '/register',
    [AuthController::class, 'register']
);

Route::post(
    '/login',
    [AuthController::class, 'login']
);

/*
|--------------------------------------------------------------------------
| PRODUCTS
|--------------------------------------------------------------------------
*/

Route::get(
    '/products',
    [ProductController::class, 'index']
);

Route::get(
    '/products/{slug}',
    [ProductController::class, 'show']
);

/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

Route::get(
    '/categories',
    [CategoryController::class, 'index']
);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/me',
        [AuthController::class, 'me']
    );

    Route::post(
        '/logout',
        [AuthController::class, 'logout']
    );

    /*
    |--------------------------------------------------------------------------
    | CART
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/carts',
        [CartController::class, 'index']
    );

    Route::post(
        '/carts',
        [CartController::class, 'store']
    );

    Route::put(
        '/carts/{cart}',
        [CartController::class, 'update']
    );

    Route::delete(
        '/carts/{cart}',
        [CartController::class, 'destroy']
    );

    /*
    |--------------------------------------------------------------------------
    | ORDERS USER
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/orders',
        [OrderController::class, 'store']
    );

    Route::get(
        '/orders',
        [OrderController::class, 'index']
    );

    Route::get(
        '/orders/{order}',
        [OrderController::class, 'show']
    );

});

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'admin',
])->prefix('admin')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | ADMIN DASHBOARD
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', function () {

        return response()->json([
            'message' => 'Welcome Admin',
        ]);

    });

    /*
    |--------------------------------------------------------------------------
    | ADMIN ORDERS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/orders',
        [OrderController::class, 'adminOrders']
    );

    Route::put(
        '/orders/{order}/status',
        [OrderController::class, 'updateStatus']
    );

    Route::get(
        '/orders/export',
        [AdminOrderController::class, 'export']
    );

    Route::get(
    '/products',
    [ProductController::class, 'adminIndex']
    );

    Route::post(
        '/products',
        [ProductController::class, 'store']
    );

    Route::put(
        '/products/{product}',
        [ProductController::class, 'update']
    );

    Route::delete(
        '/products/{product}',
        [ProductController::class, 'destroy']
    );

    Route::post(
        '/products/{product}/gallery/{image}/primary',
        [ProductController::class, 'setPrimaryImage']
    );

    Route::post(
        '/products/{product}/gallery/reorder',
        [ProductController::class, 'reorderGallery']
    );

});