<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\Product;
use App\Models\ProductImage;
use App\Services\ImageService;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;

use Illuminate\Support\Str;

class ProductController extends Controller
{
    protected ImageService $imageService;

    public function __construct(
        ImageService $imageService
    ) {
        $this->imageService = $imageService;
    }

    public function index()
    {
        $products = Product::with([
            'category',
            'images' => function ($query) {
                $query->orderBy('sort_order');
            },
        ])
            ->where('is_active', true)
            ->latest()
            ->get();

        return response()->json(
            $products
        );
    }

    public function show($slug)
    {
        $product = Product::with([
            'category',
            'images' => function ($query) {
                $query->orderBy('sort_order');
            },
        ])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json(
            $product
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN PRODUCTS
    |--------------------------------------------------------------------------
    */

    public function adminIndex()
    {
        $products = Product::with([
            'category',
            'images' => function ($query) {
                $query->orderBy('sort_order');
            },
        ])
            ->latest()
            ->paginate(10);

        return response()->json(
            $products
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => [
                'required',
                'exists:categories,id'
            ],

            'name' => [
                'required',
                'string',
                'max:255'
            ],

            'description' => [
                'nullable'
            ],

            'price' => [
                'required',
                'numeric'
            ],

            'stock' => [
                'required',
                'integer'
            ],

            'thumbnail' => [
                'nullable',
                'image'
            ],

            'images' => [
                'nullable',
                'array'
            ],

            'images.*' => [
                'image'
            ],

            'is_active' => [
                'required',
                'boolean'
            ],
        ]);

        $thumbnail = null;

        if ($request->hasFile('thumbnail')) {

            $thumbnail =
                $this->imageService
                ->saveThumbnail(
                    $request->file('thumbnail')
                );
        }

        $product = Product::create([

            'category_id' =>
                $validated['category_id'],

            'name' =>
                $validated['name'],

            'slug' =>
                Str::slug(
                    $validated['name']
                ) . '-' . time(),

            'description' =>
                $validated['description'],

            'price' =>
                $validated['price'],

            'stock' =>
                $validated['stock'],

            'thumbnail' =>
                $thumbnail,

            'is_active' =>
                $validated['is_active'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | SAVE MULTI IMAGES
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('images')) {

            foreach (
                $request->file('images')
                as $index => $image
            ) {

            $path =
                $this->imageService
                ->saveProductImage(
                    $image
                );

                ProductImage::create([

                    'product_id' =>
                        $product->id,

                    'image' =>
                        $path,

                    'sort_order' =>
                        $index,

                    'is_primary' =>
                        $index === 0,

                ]);
            }
        }

        return response()->json([

            'message' =>
                'Product created',

            'product' =>
                $product->load([
                    'category',
                    'images',
                ]),

        ]);
    }

    public function update(
        Request $request,
        Product $product
    ) {

        $validated = $request->validate([

            'category_id' => [
                'required',
                'exists:categories,id'
            ],

            'name' => [
                'required'
            ],

            'description' => [
                'nullable'
            ],

            'price' => [
                'required'
            ],

            'stock' => [
                'required'
            ],

            'is_active' => [
                'required'
            ],

            'thumbnail' => [
                'nullable',
                'image'
            ],

            'images' => [
                'nullable',
                'array'
            ],

            'images.*' => [
                'image'
            ],

            'replace_gallery' => [
                'nullable',
                'array'
            ],

            'replace_gallery.*' => [
                'image'
            ],

            'gallery_order' => [
                'nullable',
                'array'
            ],

        ]);

        /*
        |--------------------------------------------------------------------------
        | UPDATE THUMBNAIL
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('thumbnail')) {

            if (
                $product->thumbnail &&
                Storage::disk('public')->exists($product->thumbnail)
            ) {

                Storage::disk('public')->delete(
                    $product->thumbnail
                );
            }

            $validated['thumbnail'] =
                $this->imageService
                    ->saveThumbnail(
                        $request->file('thumbnail')
                    );
        }

        $validated['slug'] =
            Str::slug(
                $validated['name']
            );

        //dd($request->all());

        $product->update(
            $validated
        );

        /*
        |--------------------------------------------------------------------------
        | DELETE SELECTED GALLERY
        |--------------------------------------------------------------------------
        */

        if ($request->has('deleted_gallery')) {

            $galleryIds = $request->deleted_gallery;

            $images = ProductImage::whereIn('id', $galleryIds)
                ->where('product_id', $product->id)
                ->get();

            foreach ($images as $image) {

                if (
                    $image->image &&
                    Storage::disk('public')->exists($image->image)
                ) {

                    Storage::disk('public')->delete(
                        $image->image
                    );
                }

                $image->delete();
            }
        }

        /*
        |--------------------------------------------------------------------------
        | REPLACE GALLERY IMAGES
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('replace_gallery')) {

            foreach (
                $request->file('replace_gallery')
                as $imageId => $newImage
            ) {

                $gallery = ProductImage::where(
                    'id',
                    $imageId
                )
                ->where(
                    'product_id',
                    $product->id
                )
                ->first();

                if (!$gallery) {
                    continue;
                }

                if (
                    $gallery->image &&
                    Storage::disk('public')
                        ->exists($gallery->image)
                ) {

                    Storage::disk('public')
                        ->delete($gallery->image);
                }

                $path =
                    $this->imageService
                    ->saveProductImage(
                        $newImage
                    );

                $gallery->update([

                    'image' => $path

                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | ADD NEW GALLERY IMAGES
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('images')) {

            $lastSort = ProductImage::where(
                'product_id',
                $product->id
            )->max('sort_order') ?? 0;

            foreach (
                $request->file('images')
                as $index => $image
            ) {

            $path =
                $this->imageService
                ->saveProductImage(
                    $image
                );

                ProductImage::create([

                    'product_id' =>
                        $product->id,

                    'image' =>
                        $path,

                    'sort_order' =>
                        $lastSort + $index + 1,

                    'is_primary' => false,

                ]);
            }
        }

        /*
        |--------------------------------------------------------------
        | SAVE GALLERY ORDER
        |--------------------------------------------------------------
        */

        if ($request->has('gallery_order')) {

            foreach ($request->gallery_order as $imageId => $sortOrder) {

                ProductImage::where(
                    'id',
                    $imageId
                )
                ->where(
                    'product_id',
                    $product->id
                )
                ->update([

                    'sort_order' => $sortOrder

                ]);
            }
        }

        return response()->json([

            'message' =>
                'Product updated',

            'product' =>
                $product->load([
                    'category',
                    'images' => function ($query) {
                        $query->orderBy('sort_order');
                    },
                ]),

        ]);
    }

    public function destroy(
        Product $product
    ) {

        /*
        |--------------------------------------------------------------------------
        | DELETE THUMBNAIL
        |--------------------------------------------------------------------------
        */

        if (
            $product->thumbnail &&
            Storage::disk('public')
                ->exists(
                    $product->thumbnail
                )
        ) {

            Storage::disk('public')
                ->delete(
                    $product->thumbnail
                );
        }

        /*
        |--------------------------------------------------------------------------
        | DELETE GALLERY IMAGES
        |--------------------------------------------------------------------------
        */

        foreach ($product->images as $image) {

            if (
                $image->image &&
                Storage::disk('public')->exists($image->image)
            ) {

                Storage::disk('public')->delete($image->image);
            }

            $image->delete();
        }

        $product->delete();

        return response()->json([

            'message' =>
                'Product deleted',

        ]);
    }

    public function setPrimaryImage(
        Product $product,
        ProductImage $image
    ) {

        if ($image->product_id !== $product->id) {

            return response()->json([
                'message' => 'Image not found'
            ], 404);
        }

        ProductImage::where(
            'product_id',
            $product->id
        )->update([

            'is_primary' => false

        ]);

        $image->update([

            'is_primary' => true

        ]);

        $product->update([

            'thumbnail' => $image->image

        ]);

        return response()->json([

            'message' => 'Primary image updated'

        ]);
    }

    public function reorderGallery(Request $request, Product $product)
    {
        $galleryOrder = $request->gallery_order;

        if (!$galleryOrder || !is_array($galleryOrder)) {
            return response()->json([
                'message' => 'Gallery order invalid'
            ], 422);
        }

        foreach ($galleryOrder as $imageId => $sortOrder) {

            ProductImage::where('id', $imageId)
                ->where('product_id', $product->id)
                ->update([
                    'sort_order' => $sortOrder
                ]);
        }

        return response()->json([
            'message' => 'Gallery reordered successfully'
        ]);
    }
}