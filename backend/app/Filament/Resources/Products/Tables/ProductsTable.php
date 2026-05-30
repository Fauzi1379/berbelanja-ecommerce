<?php

namespace App\Filament\Resources\Products\Tables;

use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;

use Filament\Tables\Table;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\IconColumn;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([

                ImageColumn::make('thumbnail')
                    ->getStateUsing(fn ($record) =>
                        asset('storage/' . $record->thumbnail)
                    )
                    ->height(80)
                    ->width(80),

                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('category.name')
                    ->label('Category'),

                TextColumn::make('price')
                    ->money('IDR'),

                TextColumn::make('stock'),

                IconColumn::make('is_active')
                    ->boolean(),

            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }
}