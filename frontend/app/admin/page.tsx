"use client";

import { useEffect, useMemo, useState } from "react";

import Cookies from "js-cookie";

import api from "@/services/api";
import echo from "@/lib/echo";

import {
  ShoppingBag,
  DollarSign,
  PackageCheck,
  Clock3,
  ChevronDown,
  X,
  Phone,
  MapPin,
  CalendarDays,
  Search,
  Download,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminPage() {

  const [orders, setOrders] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState<any>(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 8;

  async function fetchOrders() {

    try {

      const token =
        Cookies.get("token");

      if (!token) {

        alert("Token tidak ditemukan");

        return;
      }

      const response =
        await api.get(
          "/admin/orders",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setOrders(response.data);

    } catch (error: any) {

      console.error(error);

      if (
        error?.response?.status === 403
      ) {

        alert(
          "Akses ditolak, akun bukan admin"
        );

      } else {

        alert(
          "Gagal mengambil data order"
        );

      }

    } finally {

      setLoading(false);

    }

  }

  async function updateStatus(
    orderId: number,
    status: string
  ) {

    try {

      const token =
        Cookies.get("token");

      await api.put(
        `/admin/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
              }
            : order
        )
      );

      if (
        selectedOrder &&
        selectedOrder.id === orderId
      ) {

        setSelectedOrder({
          ...selectedOrder,
          status,
        });

      }

    } catch (error) {

      console.error(error);

      alert("Gagal update status");

    }

  }

  async function exportOrders() {

    try {

      const token =
        Cookies.get("token");

      const response =
        await api.get(
          "/admin/orders/export",
          {
            responseType: "blob",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const url =
        window.URL.createObjectURL(
          new Blob([response.data])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        "orders.xlsx"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

    } catch (error) {

      console.error(error);

      alert("Gagal export excel");

    }

  }

  useEffect(() => {

    fetchOrders();

  }, []);

  useEffect(() => {

    setCurrentPage(1);

  }, [
    search,
    statusFilter,
  ]);

  useEffect(() => {

    echo
      .channel("admin-orders")
      .listen(".order.updated", (event: any) => {

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === event.order.id
              ? event.order
              : order
          )
        );

        if (
          selectedOrder &&
          selectedOrder.id === event.order.id
        ) {

          setSelectedOrder(event.order);

        }

      });

    return () => {
      echo.leave("admin-orders");
    };

  }, [selectedOrder]);

  const totalRevenue =
    useMemo(() => {

      return orders.reduce(
        (total, order) =>
          total +
          Number(order.total_price),
        0
      );

    }, [orders]);

  const pendingOrders =
    useMemo(() => {

      return orders.filter(
        (order) =>
          order.status === "pending"
      ).length;

    }, [orders]);

  const successOrders =
    useMemo(() => {

      return orders.filter(
        (order) =>
          order.status === "success"
      ).length;

    }, [orders]);

  const filteredOrders =
    useMemo(() => {

      return orders.filter((order) => {

        const matchSearch =
          order.name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          String(order.id)
            .includes(search);

        const matchStatus =
          statusFilter === "all"
            ? true
            : order.status ===
              statusFilter;

        return (
          matchSearch &&
          matchStatus
        );

      });

    }, [
      orders,
      search,
      statusFilter,
    ]);

  const totalPages =
    Math.ceil(
      filteredOrders.length /
      itemsPerPage
    );

  const paginatedOrders =
    filteredOrders.slice(
      (currentPage - 1) *
        itemsPerPage,
      currentPage *
        itemsPerPage
    );

  const chartData =
    useMemo(() => {

      const monthlyData: any = {};

      orders.forEach((order) => {

        const date =
          new Date(
            order.created_at
          );

        const month =
          date.toLocaleString(
            "id-ID",
            {
              month: "short",
            }
          );

        if (!monthlyData[month]) {

          monthlyData[month] = {
            month,
            total: 0,
          };

        }

        monthlyData[month].total +=
          Number(
            order.total_price
          );

      });

      return Object.values(
        monthlyData
      );

    }, [orders]);

  if (loading) {

    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">

        <div className="text-sm font-medium text-zinc-500 animate-pulse">

          Loading dashboard...

        </div>

      </div>
    );

  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 antialiased">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>

            <p className="uppercase tracking-wider text-[#007FFF] text-xs font-bold">

              Admin Panel

            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">

              Order Management

            </h1>

          </div>

          <button
            onClick={exportOrders}
            className="flex items-center justify-center gap-2 px-5 h-11 rounded-2xl bg-[#007FFF] text-white text-sm font-semibold hover:scale-[1.02] hover:shadow-xl hover:shadow-[#007FFF]/20 active:scale-[0.98] transition-all duration-200 self-start sm:self-auto"
          >

            <Download size={18} />

            Export Excel

          </button>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

          <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-sm flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-zinc-500">

                Total Orders

              </p>

              <h2 className="mt-2 text-3xl font-bold text-zinc-900">

                {orders.length}

              </h2>

            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#007FFF]">

              <ShoppingBag size={22} />

            </div>

          </div>

          <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-sm flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-zinc-500">

                Pending

              </p>

              <h2 className="mt-2 text-3xl font-bold text-zinc-900">

                {pendingOrders}

              </h2>

            </div>

            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">

              <Clock3 size={22} />

            </div>

          </div>

          <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-sm flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-zinc-500">

                Success

              </p>

              <h2 className="mt-2 text-3xl font-bold text-zinc-900">

                {successOrders}

              </h2>

            </div>

            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">

              <PackageCheck size={22} />

            </div>

          </div>

          <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-sm flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-zinc-500">

                Revenue

              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#007FFF]">

                Rp {totalRevenue.toLocaleString("id-ID")}

              </h2>

            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#007FFF]">

              <DollarSign size={22} />

            </div>

          </div>

        </div>

        {/* ANALYTICS CHART */}

        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 mb-10">

          <div className="mb-6">

            <p className="text-sm font-semibold text-[#007FFF] uppercase tracking-wider">

              Analytics

            </p>

            <h2 className="text-2xl font-bold text-zinc-900 mt-1">

              Monthly Revenue

            </h2>

          </div>

          <div className="w-full min-h-[350px] h-[350px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip
                  formatter={(value: any) =>
                    `Rp ${Number(value)
                      .toLocaleString("id-ID")}`
                  }
                />

                <Bar
                  dataKey="total"
                  radius={[
                    10,
                    10,
                    0,
                    0,
                  ]}
                  fill="#007FFF"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* FILTER BAR */}

        <div className="mb-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-md">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="text"
              placeholder="Cari customer / order id..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full h-12 pl-11 pr-4 rounded-2xl border border-zinc-200 bg-white outline-none focus:ring-4 focus:ring-[#007FFF]/10 focus:border-[#007FFF] transition"
            />

          </div>

        </div>

        {/* ORDER LIST */}

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px] border-collapse">

              <thead>

                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs font-semibold uppercase tracking-wider">

                  <th className="px-6 py-4 text-left">

                    Order ID

                  </th>

                  <th className="px-6 py-4 text-left">

                    Customer

                  </th>

                  <th className="px-6 py-4 text-left">

                    Phone

                  </th>

                  <th className="px-6 py-4 text-left">

                    Total

                  </th>

                  <th className="px-6 py-4 text-left">

                    Status

                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-zinc-100 text-sm">

                {paginatedOrders.map(
                  (order) => (

                    <tr
                      key={order.id}
                      onClick={() =>
                        setSelectedOrder(
                          order
                        )
                      }
                      className="hover:bg-zinc-50/80 transition cursor-pointer"
                    >

                      <td className="px-6 py-4 font-semibold text-zinc-900">

                        #{order.id}

                      </td>

                      <td className="px-6 py-4 font-medium">

                        {order.name}

                      </td>

                      <td className="px-6 py-4 text-zinc-500">

                        {order.phone}

                      </td>

                      <td className="px-6 py-4 font-bold text-[#007FFF]">

                        Rp{" "}
                        {Number(
                          order.total_price
                        ).toLocaleString(
                          "id-ID"
                        )}

                      </td>

                      <td
                        className="px-6 py-4"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >

                        <div className="relative group w-[145px]">

                          <button
                            className={`flex items-center justify-between w-full px-3.5 py-2 rounded-2xl text-xs font-semibold uppercase tracking-wider border transition-all duration-300 ${
                              order.status === "success"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >

                            <span className="flex items-center gap-2">

                              <span
                                className={`w-2 h-2 rounded-full ${
                                  order.status === "success"
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                                }`}
                              />

                              {order.status}

                            </span>

                            <ChevronDown
                              size={14}
                              className="opacity-70 group-hover:rotate-180 transition-transform duration-200"
                            />

                          </button>

                          <div
                            className="
                              absolute top-[110%] left-0 w-full
                              opacity-0 invisible translate-y-2
                              group-hover:opacity-100
                              group-hover:visible
                              group-hover:translate-y-0
                              transition-all duration-200
                              z-50
                            "
                          >

                            <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/80 overflow-hidden p-1.5">

                              <button
                                onClick={() =>
                                  updateStatus(
                                    order.id,
                                    "pending"
                                  )
                                }
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-zinc-700 hover:text-amber-900 font-medium transition text-xs"
                              >

                                <span className="w-2 h-2 rounded-full bg-amber-500" />

                                Pending

                              </button>

                              <button
                                onClick={() =>
                                  updateStatus(
                                    order.id,
                                    "success"
                                  )
                                }
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-zinc-700 hover:text-emerald-900 font-medium transition text-xs"
                              >

                                <span className="w-2 h-2 rounded-full bg-emerald-500" />

                                Success

                              </button>

                            </div>

                          </div>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* ORDER DETAIL MODAL */}

        {selectedOrder && (

          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">

              {/* HEADER */}

              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200">

                <div>

                  <p className="text-xs uppercase tracking-wider text-[#007FFF] font-bold">

                    Order Detail

                  </p>

                  <h2 className="text-2xl font-bold text-zinc-900 mt-1">

                    #{selectedOrder.id}

                  </h2>

                </div>

                <button
                  onClick={() =>
                    setSelectedOrder(null)
                  }
                  className="w-10 h-10 rounded-xl hover:bg-zinc-100 flex items-center justify-center transition"
                >

                  <X size={20} />

                </button>

              </div>

              {/* CONTENT */}

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="bg-zinc-50 rounded-2xl p-4">

                    <p className="text-xs text-zinc-500 mb-2">

                      Customer

                    </p>

                    <h3 className="font-bold text-zinc-900 text-lg">

                      {selectedOrder.name}

                    </h3>

                  </div>

                  <div className="bg-zinc-50 rounded-2xl p-4">

                    <p className="text-xs text-zinc-500 mb-2">

                      Total Payment

                    </p>

                    <h3 className="font-bold text-[#007FFF] text-lg">

                      Rp{" "}
                      {Number(
                        selectedOrder.total_price
                      ).toLocaleString("id-ID")}

                    </h3>

                  </div>

                </div>

                <div className="space-y-4">

                  <div className="flex items-start gap-3">

                    <Phone
                      size={18}
                      className="text-[#007FFF] mt-0.5"
                    />

                    <div>

                      <p className="text-xs text-zinc-500">

                        Phone

                      </p>

                      <p className="font-medium text-zinc-900">

                        {selectedOrder.phone || "-"}

                      </p>

                    </div>

                  </div>

                  <div className="flex items-start gap-3">

                    <MapPin
                      size={18}
                      className="text-[#007FFF] mt-0.5"
                    />

                    <div>

                      <p className="text-xs text-zinc-500">

                        Address

                      </p>

                      <p className="font-medium text-zinc-900">

                        {selectedOrder.address || "-"}

                      </p>

                    </div>

                  </div>

                  <div className="flex items-start gap-3">

                    <CalendarDays
                      size={18}
                      className="text-[#007FFF] mt-0.5"
                    />

                    <div>

                      <p className="text-xs text-zinc-500">

                        Order Date

                      </p>

                      <p className="font-medium text-zinc-900">

                        {new Date(
                          selectedOrder.created_at
                        ).toLocaleString("id-ID")}

                      </p>

                    </div>

                  </div>

                </div>

                {/* ORDER ITEMS */}

                <div>

                  <h3 className="text-lg font-bold text-zinc-900 mb-4">

                    Produk Order

                  </h3>

                  <div className="space-y-4">

                    {selectedOrder.items?.map(
                      (item: any) => (

                        <div
                          key={item.id}
                          className="flex items-center gap-4 bg-zinc-50 rounded-2xl p-4"
                        >

                          <img
                            src={`http://127.0.0.1:8000/storage/${item.product?.thumbnail}`}
                            alt={item.product?.name}
                            className="w-16 h-16 rounded-2xl object-cover border"
                          />

                          <div className="flex-1">

                            <h4 className="font-bold text-zinc-900">

                              {item.product?.name}

                            </h4>

                            <p className="text-sm text-zinc-500 mt-1">

                              Qty: {item.quantity}

                            </p>

                          </div>

                          <div className="text-right">

                            <p className="font-bold text-[#007FFF]">

                              Rp{" "}
                              {Number(
                                item.price *
                                item.quantity
                              ).toLocaleString("id-ID")}

                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

                <div className="bg-zinc-50 rounded-2xl p-4">

                  <p className="text-xs text-zinc-500 mb-2">

                    Status

                  </p>

                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
                      selectedOrder.status === "success"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >

                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedOrder.status === "success"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />

                    {selectedOrder.status}

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}