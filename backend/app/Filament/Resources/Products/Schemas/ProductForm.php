<?php

namespace App\Filament\Resources\Products\Schemas;

use App\Models\Category;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;

use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([

                Select::make('category_id')
                    ->label('Category')
                    ->options(Category::pluck('name', 'id'))
                    ->searchable()
                    ->required(),

                TextInput::make('name')
                    ->required()
                    ->maxLength(255),

                TextInput::make('slug')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),

                Textarea::make('description')
                    ->rows(5),

                TextInput::make('price')
                    ->numeric()
                    ->required(),

                TextInput::make('stock')
                    ->numeric()
                    ->required(),

                FileUpload::make('thumbnail')
                    ->image()
                    ->disk('public')
                    ->directory('products'),

                Toggle::make('is_active')
                    ->default(true),

            ]);
    }
}