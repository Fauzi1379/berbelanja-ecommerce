"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "@/services/api";
import { ShoppingBag, CalendarDays } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    try {
      const token = Cookies.get("token");
      const response = await api.get("/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fungsi helper untuk menentukan style status secara dinamis
  const getStatusStyle = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    
    switch (normalizedStatus) {
      case "success":
      case "completed":
      case "paid":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "failed":
      case "canceled":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border border-amber-200";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F9FF]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#007FFF] border-t-transparent"></div>
          <p className="text-zinc-500 font-medium">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">
            My Orders
          </h1>
          <p className="mt-2 text-zinc-500 text-base">
            Riwayat pesanan kamu
          </p>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-zinc-100 shadow-sm text-center">
            <div className="mx-auto w-20 h-20 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6">
              <ShoppingBag size={40} className="text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-800">
              Belum ada order
            </h2>
            <p className="mt-2 text-zinc-500 max-w-sm mx-auto">
              Yuk mulai checkout produk pertama kamu dan temukan penawaran menarik!
            </p>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  
                  {/* Left Side: Order Info */}
                  <div className="space-y-3">
                    <span className="inline-block text-xs uppercase tracking-wider text-[#007FFF] font-bold">
                      Order #{order.id}
                    </span>
                    
                    <h2 className="text-2xl font-black text-zinc-900">
                      Rp {Number(order.total_price).toLocaleString("id-ID")}
                    </h2>
                    
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <CalendarDays size={16} className="text-zinc-400" />
                      <span>
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Status & Action Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize tracking-wide ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <a
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center justify-center bg-[#007FFF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0066CC] active:scale-[0.98] transition-all duration-150"
                    >
                      Detail Order
                    </a>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}