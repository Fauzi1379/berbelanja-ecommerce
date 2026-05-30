<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageService
{
    protected ImageManager $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(
            new Driver()
        );
    }

    public function saveProductImage(
        UploadedFile $file,
        string $folder = 'products'
    ): string {

        $filename =
            uniqid() .
            '_' .
            time() .
            '.webp';

        $path = $folder . '/' . $filename;

        $image = $this->manager
            ->decode($file)
            ->scaleDown(
                width: 1600
            );

        $encoded = $image->encode(
            new WebpEncoder(
                quality: 85
            )
        );

        Storage::disk('public')->put(
            $path,
            $encoded
        );

        return $path;
    }

    public function saveThumbnail(
        UploadedFile $file,
        string $folder = 'products/thumbnails'
    ): string {

        $filename =
            uniqid() .
            '_' .
            time() .
            '.webp';

        $path = $folder . '/' . $filename;

        $image = $this->manager
            ->decode($file)
            ->cover(
                400,
                400
            );

        $encoded = $image->encode(
            new WebpEncoder(
                quality: 80
            )
        );

        Storage::disk('public')->put(
            $path,
            $encoded
        );

        return $path;
    }

    public function saveSmallThumbnail(
        UploadedFile $file,
        string $folder = 'products/small'
    ): string {

        $filename =
            uniqid()
            .'_'
            .time()
            .'.webp';

        $path = $folder.'/'.$filename;

        $image = $this->manager
            ->decode($file)
            ->cover(
                200,
                200
            );

        $encoded = $image->encode(
            new WebpEncoder(
                quality: 75
            )
        );

        Storage::disk('public')->put(
            $path,
            $encoded
        );

        return $path;
    }

    public function deleteImage(
        ?string $path
    ): void {

        if (
            $path &&
            Storage::disk('public')->exists($path)
        ) {

            Storage::disk('public')->delete(
                $path
            );
        }
    }
}