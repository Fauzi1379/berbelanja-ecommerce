"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Cookies from "js-cookie";

import api from "@/services/api";

import {
  MapPin,
  Phone,
  User,
  FileText,
  ShoppingBag,
} from "lucide-react";

import { useRouter } from "next/navigation";

export default function CheckoutPage() {

  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [carts, setCarts] =
    useState<any[]>([]);

  const [form, setForm] =
    useState({
      name: "",
      phone: "",
      address: "",
      notes: "",
    });

  async function fetchCart() {

    try {

      const token =
        Cookies.get("token");

      const response =
        await api.get("/carts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      setCarts(response.data);

    } catch (error) {

      console.error(error);

    }

  }

  useEffect(() => {

    fetchCart();

  }, []);

  const subtotal =
    useMemo(() => {

      return carts.reduce(
        (total, item) =>
          total +
          item.product.price *
          item.quantity,
        0
      );

    }, [carts]);

  async function handleCheckout() {

    try {

      setLoading(true);

      const token =
        Cookies.get("token");

      await api.post(
        "/orders",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Checkout berhasil");

      router.push("/orders");

    } catch (error) {

      console.error(error);

      alert("Checkout gagal");

    } finally {

      setLoading(false);

    }

  }

  return (
    <div className="min-h-screen bg-[#F5F9FF]">

      <div className="max-w-7xl mx-auto px-5 py-14">

        <div className="mb-10">

          <h1 className="text-5xl font-black text-zinc-900">

            Checkout

          </h1>

          <p className="text-zinc-500 mt-3 text-lg">

            Lengkapi informasi pesanan kamu

          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORM */}

          <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-zinc-100">

            <h2 className="text-3xl font-black">

              Informasi Pengiriman

            </h2>

            <div className="mt-8 space-y-6">

              {/* NAME */}

              <div>

                <label className="font-semibold text-zinc-700">

                  Nama Lengkap

                </label>

                <div className="relative mt-3">

                  <User
                    size={20}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />

                  <input
                    type="text"
                    placeholder="Masukkan nama"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    className="w-full border border-zinc-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-[#007FFF]"
                  />

                </div>

              </div>

              {/* PHONE */}

              <div>

                <label className="font-semibold text-zinc-700">

                  Nomor Telepon

                </label>

                <div className="relative mt-3">

                  <Phone
                    size={20}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />

                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    className="w-full border border-zinc-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-[#007FFF]"
                  />

                </div>

              </div>

              {/* ADDRESS */}

              <div>

                <label className="font-semibold text-zinc-700">

                  Alamat

                </label>

                <div className="relative mt-3">

                  <MapPin
                    size={20}
                    className="absolute left-5 top-5 text-zinc-400"
                  />

                  <textarea
                    rows={5}
                    placeholder="Masukkan alamat lengkap"
                    value={form.address}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: e.target.value,
                      })
                    }
                    className="w-full border border-zinc-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-[#007FFF]"
                  />

                </div>

              </div>

              {/* NOTES */}

              <div>

                <label className="font-semibold text-zinc-700">

                  Catatan

                </label>

                <div className="relative mt-3">

                  <FileText
                    size={20}
                    className="absolute left-5 top-5 text-zinc-400"
                  />

                  <textarea
                    rows={4}
                    placeholder="Catatan tambahan"
                    value={form.notes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notes: e.target.value,
                      })
                    }
                    className="w-full border border-zinc-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-[#007FFF]"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* SUMMARY */}

          <div>

            <div className="bg-white rounded-[32px] p-8 border border-zinc-100 sticky top-28">

              <h2 className="text-3xl font-black">

                Ringkasan Order

              </h2>

              <div className="mt-8 space-y-5">

                {carts.map((item) => (

                  <div
                    key={item.id}
                    className="flex items-center gap-4"
                  >

                    <img
                      src={`http://127.0.0.1:8000/storage/${item.product.thumbnail}`}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />

                    <div className="flex-1">

                      <h3 className="font-bold line-clamp-1">

                        {item.product.name}

                      </h3>

                      <p className="text-sm text-zinc-500">

                        Qty {item.quantity}

                      </p>

                    </div>

                    <p className="font-bold">

                      Rp {(item.product.price * item.quantity)
                        .toLocaleString("id-ID")}

                    </p>

                  </div>

                ))}

                <div className="border-t pt-5 flex justify-between text-2xl font-black">

                  <span>Total</span>

                  <span className="text-[#007FFF]">

                    Rp {subtotal
                      .toLocaleString("id-ID")}

                  </span>

                </div>

              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="mt-10 w-full bg-[#007FFF] hover:opacity-90 text-white py-4 rounded-2xl text-lg font-bold transition flex items-center justify-center gap-3"
              >

                <ShoppingBag size={20} />

                {loading
                  ? "Processing..."
                  : "Checkout Sekarang"}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}