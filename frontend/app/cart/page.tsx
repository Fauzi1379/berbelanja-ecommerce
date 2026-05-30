"use client";

import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
} from "lucide-react";

import Cookies from "js-cookie";

import api from "@/services/api";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

export default function CartPage() {

  const [carts, setCarts] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

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

    } finally {

      setLoading(false);

    }

  }

  async function updateQty(
    cartId: number,
    quantity: number
  ) {

    if (quantity < 1) return;

    try {

      const token =
        Cookies.get("token");

      await api.put(
        `/carts/${cartId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchCart();

    } catch (error) {

      console.error(error);

    }

  }

  async function removeCart(
    cartId: number
  ) {

    try {

      const token =
        Cookies.get("token");

      await api.delete(
        `/carts/${cartId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchCart();

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

  if (loading) {

    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF]">

      <div className="max-w-7xl mx-auto px-5 py-14">

        <div className="mb-10">

          <h1 className="text-5xl font-black text-zinc-900">

            Shopping Cart

          </h1>

          <p className="text-zinc-500 mt-3 text-lg">

            Kelola produk belanja kamu

          </p>

        </div>

        {carts.length === 0 ? (

          <div className="bg-white rounded-[40px] p-20 text-center border border-zinc-100">

            <ShoppingBag
              size={80}
              className="mx-auto text-zinc-300"
            />

            <h2 className="mt-8 text-3xl font-black">

              Cart masih kosong

            </h2>

            <p className="mt-3 text-zinc-500">

              Yuk mulai belanja sekarang

            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* CART LIST */}

            <div className="lg:col-span-2 space-y-5">

              {carts.map((item) => (

                <div
                  key={item.id}
                  className="bg-white rounded-[32px] p-5 border border-zinc-100 flex flex-col md:flex-row gap-5"
                >

                  <img
                    src={`http://127.0.0.1:8000/storage/${item.product.thumbnail}`}
                    alt={item.product.name}
                    className="w-full md:w-40 h-40 object-cover rounded-3xl"
                  />

                  <div className="flex-1">

                    <h2 className="text-2xl font-black text-zinc-900">

                      {item.product.name}

                    </h2>

                    <p className="mt-3 text-[#007FFF] text-3xl font-black">

                      Rp {Number(item.product.price)
                        .toLocaleString("id-ID")}

                    </p>

                    <div className="mt-6 flex items-center justify-between flex-wrap gap-5">

                      {/* QTY */}

                      <div className="flex items-center gap-3">

                        <button
                          onClick={() =>
                            updateQty(
                              item.id,
                              item.quantity - 1
                            )
                          }
                          className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center"
                        >

                          <Minus size={18} />

                        </button>

                        <div className="w-12 text-center font-bold text-lg">

                          {item.quantity}

                        </div>

                        <button
                          onClick={() =>
                            updateQty(
                              item.id,
                              item.quantity + 1
                            )
                          }
                          className="w-10 h-10 rounded-xl bg-[#007FFF] text-white flex items-center justify-center"
                        >

                          <Plus size={18} />

                        </button>

                      </div>

                      {/* REMOVE */}

                      <button
                        onClick={() =>
                          removeCart(item.id)
                        }
                        className="flex items-center gap-2 text-red-500 font-semibold"
                      >

                        <Trash2 size={18} />

                        Hapus

                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

            {/* SUMMARY */}

            <div>

              <div className="bg-white rounded-[32px] p-8 border border-zinc-100 sticky top-28">

                <h2 className="text-3xl font-black">

                  Ringkasan Order

                </h2>

                <div className="mt-8 space-y-5">

                  <div className="flex justify-between text-zinc-600">

                    <span>Subtotal</span>

                    <span>

                      Rp {subtotal
                        .toLocaleString("id-ID")}

                    </span>

                  </div>

                  <div className="flex justify-between text-zinc-600">

                    <span>Shipping</span>

                    <span>Gratis</span>

                  </div>

                  <div className="border-t pt-5 flex justify-between text-2xl font-black">

                    <span>Total</span>

                    <span className="text-[#007FFF]">

                      Rp {subtotal
                        .toLocaleString("id-ID")}

                    </span>

                  </div>

                </div>
                  <a
                    href="/checkout"
                    className="mt-10 w-full bg-[#007FFF] hover:opacity-90 text-white py-4 rounded-2xl text-lg font-bold transition flex items-center justify-center"
                  >

                    Checkout Sekarang
                  </a>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}