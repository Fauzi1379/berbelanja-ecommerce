"use client";

import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import api from "@/services/api";
import { CalendarDays, MapPin, Phone, User, PackageCheck } from "lucide-react";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /**
   * LOAD PARAMS
   */
  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
    }
    loadParams();
  }, [params]);

  /**
   * FETCH ORDER
   */
  async function fetchOrder(id: string) {
    try {
      const token = Cookies.get("token");
      const response = await api.get(`/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrder(response.data);
    } catch (error) {
      console.error(error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  /**
   * FETCH WHEN ORDER ID READY
   */
  useEffect(() => {
    if (!orderId) return;
    fetchOrder(orderId);
  }, [orderId]);

  /**
   * TOTAL
   */
  const total = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0
    );
  }, [order]);

  // Helper untuk warna status dinamis
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

  /**
   * LOADING STATE
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F9FF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#007FFF] border-t-transparent"></div>
          <p className="text-zinc-500 font-medium">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  /**
   * ORDER NOT FOUND
   */
  if (!order) {
    return (
      <div className="min-h-screen bg-[#F5F9FF] flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl border border-zinc-100 shadow-sm text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-zinc-900">
            Order tidak ditemukan
          </h2>
          <p className="mt-2 text-zinc-500 text-sm">
            Order mungkin sudah dihapus atau tidak tersedia lagi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        
        {/* HEADER */}
        <div className="mb-8">
          <p className="uppercase tracking-wider text-[#007FFF] text-xs font-bold">
            Order Detail
          </p>
          <h1 className="mt-2 text-4xl font-black text-zinc-900 tracking-tight">
            Order #{order.id}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CUSTOMER INFORMATION */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">
                Informasi Customer
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-50 rounded-xl text-[#007FFF]">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs font-medium">Nama</p>
                    <h3 className="font-semibold text-zinc-800 text-base mt-0.5">
                      {order.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-50 rounded-xl text-[#007FFF]">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs font-medium">No. Telepon</p>
                    <h3 className="font-semibold text-zinc-800 text-base mt-0.5">
                      {order.phone}
                    </h3>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-50 rounded-xl text-[#007FFF]">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs font-medium">Alamat Pengiriman</p>
                    <h3 className="font-semibold text-zinc-800 text-base leading-relaxed mt-0.5">
                      {order.address}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUCTS LIST */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">
                Produk Order
              </h2>

              <div className="divide-y divide-zinc-100 space-y-6">
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-5 pt-6 first:pt-0"
                  >
                    <img
                      src={`http://127.0.0.1:8000/storage/${item.product.thumbnail}`}
                      alt={item.product.name}
                      className="w-full sm:w-28 h-28 rounded-2xl object-cover bg-zinc-50 border border-zinc-100 flex-shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900 line-clamp-2">
                          {item.product.name}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          Jumlah: {item.quantity}x
                        </p>
                      </div>
                      <p className="mt-2 text-lg font-black text-[#007FFF]">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="sm:text-right flex sm:flex-col justify-between sm:justify-start pt-4 sm:pt-0 border-t sm:border-0 border-zinc-100">
                      <p className="text-zinc-400 text-xs font-medium">Subtotal</p>
                      <h3 className="text-lg font-bold text-zinc-900 mt-1">
                        Rp {Number(item.price * item.quantity).toLocaleString("id-ID")}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (SUMMARY) */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">
                Ringkasan
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-600 bg-zinc-50 p-3 rounded-xl">
                  <CalendarDays size={16} className="text-zinc-400" />
                  <span className="font-medium">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm bg-zinc-50 p-3 rounded-xl">
                  <div className="flex items-center gap-3 text-zinc-600">
                    <PackageCheck size={16} className="text-[#007FFF]" />
                    <span className="font-medium">Status</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize tracking-wide ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="border-t border-zinc-100 pt-5 mt-2 flex justify-between items-center">
                  <span className="text-base font-bold text-zinc-800">Total Belanja</span>
                  <span className="text-2xl font-black text-[#007FFF]">
                    Rp {Number(total).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}