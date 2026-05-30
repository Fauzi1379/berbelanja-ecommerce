import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { getProducts } from "@/services/product";

export default async function HomePage() {

  const products = (await getProducts()).slice(0, 4);

  return (
    <div className="bg-[#f5f9ff] min-h-screen">

      <section className="max-w-7xl mx-auto px-5 pt-16 pb-20">

        <div className="grid md:grid-cols-2 gap-16 items-center">

          <div>

            <p className="text-sm font-semibold text-[#007FFF] uppercase tracking-widest">
              Modern Marketplace
            </p>

            <h1 className="text-6xl font-black leading-tight mt-5 text-zinc-900">
              Belanja Jadi
              <span className="block text-[#007FFF]">
                Lebih Modern
              </span>
            </h1>

            <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
              Temukan produk terbaik dengan pengalaman
              belanja yang cepat, modern, dan nyaman.
            </p>

            <div className="flex gap-4 mt-8">

              <Link
                href="/dashboard"
                className="bg-[#007FFF] text-white px-7 py-4 rounded-2xl flex items-center gap-2 hover:opacity-90 transition"
              >
                Mulai Belanja
                <ArrowRight size={18} />
              </Link>

            </div>

          </div>

          <div className="bg-gradient-to-br from-[#007FFF] to-blue-400 rounded-[40px] h-[450px] flex items-center justify-center text-white text-5xl font-black shadow-2xl">

            Berbelanja

          </div>

        </div>

      </section>

      <section className="max-w-7xl mx-auto px-5 pb-20">

        <div className="flex items-center justify-between mb-10">

          <h2 className="text-4xl font-black text-zinc-900">
            Produk Terbaru
          </h2>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

          {products.map((product: any) => (

            <Link
              href={`/products/${product.slug}`}
              key={product.id}
              className="group bg-white rounded-3xl overflow-hidden border border-zinc-200 hover:shadow-2xl transition duration-300"
            >

              <div className="overflow-hidden">

                <img
                  src={`http://127.0.0.1:8000/storage/${product.thumbnail}`}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
                />

              </div>

              <div className="p-5">

                <h2 className="font-bold text-lg line-clamp-1 text-zinc-900">
                  {product.name}
                </h2>

                <p className="mt-3 text-2xl font-black text-[#007FFF]">
                  Rp {Number(product.price)
                    .toLocaleString("id-ID")}
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Stock {product.stock}
                </p>

              </div>

            </Link>

          ))}

        </div>

      </section>

    </div>
  );
}