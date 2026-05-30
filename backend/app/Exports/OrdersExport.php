<?php

namespace App\Exports;

use App\Models\Order;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class OrdersExport implements
    FromCollection,
    WithHeadings
{
    public function collection()
    {
        return Order::select(
            "id",
            "name",
            "phone",
            "address",
            "total_price",
            "status",
            "created_at"
        )->get();
    }

    public function headings(): array
    {
        return [
            "Order ID",
            "Customer",
            "Phone",
            "Address",
            "Total",
            "Status",
            "Created At",
        ];
    }
}