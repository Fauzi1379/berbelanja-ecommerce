import {
  ShoppingBag,
  Package,
  Star,
  ArrowRight,
} from "lucide-react";

import { cookies } from "next/headers";

import { getProducts } from "@/services/product";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { getCategories } from "@/services/category";
import api from "@/services/api";

async function getUser() {

  try {

    const cookieStore =
      await cookies();

    const token =
      cookieStore.get("token")?.value;

    if (!token) {

      return null;

    }

    const response =
      await api.get("/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    return response.data.user;

  } catch (error) {

    console.error(error);

    return null;

  }

}

export default async function DashboardPage() {

  const products =
    await getProducts();

  const categories =
    await getCategories();

  const user =
    await getUser();

  return (
    <div className="min-h-screen bg-[#F5F9FF]">

      <div className="max-w-7xl mx-auto px-5 py-10">

        {/* HERO */}

        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-[#007FFF] to-blue-400 p-10 text-white shadow-2xl">

          <div className="max-w-2xl">

            <p className="uppercase tracking-[0.3em] text-sm font-semibold text-blue-100">
              Dashboard
            </p>

            <h1 className="mt-5 text-5xl font-black leading-tight">

              Halo {user?.name || "User"} 👋

            </h1>

            <p className="mt-5 text-lg text-blue-50 leading-8">
              Selamat datang kembali di Berbelanja.
              Temukan produk terbaik dengan pengalaman
              belanja modern dan nyaman.
            </p>

            <button className="mt-8 bg-white text-[#007FFF] px-7 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition">

              Mulai Belanja

              <ArrowRight size={20} />

            </button>

          </div>

          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full" />

          <div className="absolute right-32 top-10 w-20 h-20 bg-white/10 rounded-full" />

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-zinc-500">
                  Total Product
                </p>

                <h2 className="text-4xl font-black mt-3 text-zinc-900">
                  {products.length}
                </h2>

              </div>

              <div className="w-16 h-16 rounded-2xl bg-[#007FFF]/10 flex items-center justify-center">

                <Package
                  size={30}
                  className="text-[#007FFF]"
                />

              </div>

            </div>

          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-zinc-500">
                  Wishlist
                </p>

                <h2 className="text-4xl font-black mt-3 text-zinc-900">
                  12
                </h2>

              </div>

              <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center">

                <Star
                  size={30}
                  className="text-yellow-500"
                />

              </div>

            </div>

          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-zinc-500">
                  Cart Item
                </p>

                <h2 className="text-4xl font-black mt-3 text-zinc-900">
                  3
                </h2>

              </div>

              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">

                <ShoppingBag
                  size={30}
                  className="text-green-600"
                />

              </div>

            </div>

          </div>

        </div>

        <DashboardClient
          products={products}
          categories={categories}
        />

      </div>

    </div>
  );
}