"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import QuickAddToCart from "@/components/dashboard/QuickAddToCart";
import { Search, ShoppingBag, Star } from "lucide-react";

export default function DashboardClient({
  products,
  categories,
}: {
  products: any[];
  categories: any[];
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchCategory =
        selectedCategory === "all"
          ? true
          : product.category_id === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [products, search, selectedCategory]);

  return (
    <>
      {/* SEARCH SECTION */}
      <div className="mt-8 flex flex-col md:flex-row gap-5 md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">
            Product Marketplace
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Temukan produk terbaik pilihanmu
          </p>
        </div>

        <div className="relative w-full md:w-[360px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition focus:border-[#007FFF] focus:ring-2 focus:ring-blue-50"
          />
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex gap-2.5 overflow-x-auto mt-6 pb-2 scrollbar-none">
        {[
          { id: "all", name: "All" },
          ...categories,
        ].map((category: any) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition duration-200
            ${
              selectedCategory === category.id
                ? "bg-[#007FFF] text-white shadow-md shadow-blue-100"
                : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {filteredProducts.map((product: any) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            {/* Image Wrapper */}
            <div className="overflow-hidden bg-zinc-50 aspect-square relative">
              <img
                src={`http://127.0.0.1:8000/storage/${product.thumbnail}`}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star size={14} fill="currentColor" />
                <span>4.9 Rating</span>
              </div>

              <h3 className="mt-2 font-bold text-base text-zinc-800 group-hover:text-[#007FFF] transition-colors line-clamp-2 min-h-[3rem]">
                {product.name}
              </h3>

              <p className="mt-2 text-xl font-black text-[#007FFF]">
                Rp {Number(product.price).toLocaleString("id-ID")}
              </p>

              {/* Stock and Actions */}
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-50">
                <p className="text-zinc-400 text-xs font-medium">
                  Stock {product.stock}
                </p>

                <div className="flex items-center gap-2">
                  {/* Quick Add To Cart Wrapper */}
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <QuickAddToCart productId={product.id} />
                  </div>

                  {/* Detail Button */}
                  <button className="bg-zinc-50 text-zinc-700 p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold border border-zinc-200/60 hover:bg-zinc-100 hover:text-zinc-900 transition flex items-center gap-1.5">
                    <ShoppingBag size={14} />
                    <span className="hidden sm:inline">Detail</span>
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredProducts.length === 0 && (
        <div className="mt-16 bg-white border border-zinc-100 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
          <h2 className="text-xl font-bold text-zinc-800">
            Produk tidak ditemukan
          </h2>
          <p className="mt-1.5 text-zinc-500 text-sm">
            Coba gunakan kata kunci atau filter kategori lain.
          </p>
        </div>
      )}
    </>
  );
}