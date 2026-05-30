import api from "@/services/api";

import {
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  BadgeCheck,
} from "lucide-react";

import AddToCartButton
  from "@/components/AddToCartButton";

import BuyNowButton
  from "@/components/BuyNowButton";

async function getProduct(slug: string) {

  const response =
    await api.get(`/products/${slug}`);

  return response.data;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  const { slug } = await params;

  const product =
    await getProduct(slug);

  return (
    <div className="min-h-screen bg-[#F5F9FF]">

      <div className="max-w-7xl mx-auto px-5 py-14">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* IMAGE */}

          <div>

            <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-zinc-100">

              <img
                src={`http://127.0.0.1:8000/storage/${product.thumbnail}`}
                alt={product.name}
                className="w-full h-[650px] object-cover"
              />

            </div>

          </div>

          {/* CONTENT */}

          <div>

            {/* BADGES */}

            <div className="flex flex-wrap gap-3">

              <div className="bg-[#007FFF]/10 text-[#007FFF] px-5 py-2 rounded-2xl text-sm font-semibold">

                Premium Product

              </div>

              <div className="bg-green-100 text-green-700 px-5 py-2 rounded-2xl text-sm font-semibold">

                Ready Stock

              </div>

            </div>

            {/* TITLE */}

            <h1 className="mt-6 text-5xl font-black leading-tight text-zinc-900">

              {product.name}

            </h1>

            {/* RATING */}

            <div className="flex items-center gap-4 mt-6">

              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-2xl font-semibold">

                <Star size={18} />

                4.9 Rating

              </div>

              <p className="text-zinc-500">

                120+ Review Customer

              </p>

            </div>

            {/* PRICE */}

            <div className="mt-8">

              <p className="text-zinc-500 text-lg">
                Harga
              </p>

              <h2 className="text-5xl font-black text-[#007FFF] mt-2">

                Rp {Number(product.price)
                  .toLocaleString("id-ID")}

              </h2>

            </div>

            {/* STOCK */}

            <div className="mt-8 flex items-center gap-3">

              <BadgeCheck
                size={22}
                className="text-green-600"
              />

              <p className="text-lg text-zinc-700">

                Stock tersedia:
                <span className="font-bold ml-2">

                  {product.stock}

                </span>

              </p>

            </div>

            {/* BENEFITS */}

            <div className="mt-10 space-y-4">

              <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-zinc-100">

                <Truck className="text-[#007FFF]" />

                <div>

                  <h3 className="font-bold">
                    Free Shipping
                  </h3>

                  <p className="text-zinc-500 text-sm">
                    Gratis ongkir seluruh Indonesia
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-zinc-100">

                <ShieldCheck className="text-[#007FFF]" />

                <div>

                  <h3 className="font-bold">
                    Garansi Aman
                  </h3>

                  <p className="text-zinc-500 text-sm">
                    Produk dijamin original
                  </p>

                </div>

              </div>

            </div>

            {/* ACTION */}

            <div className="mt-10 flex flex-col sm:flex-row gap-4">

              <div className="flex-1">

                <AddToCartButton
                  productId={product.id}
                />

              </div>

              <div className="flex-1">

                <BuyNowButton
                  productId={product.id}
                />

              </div>

            </div>

            <p className="mt-4 text-sm text-zinc-500 text-center sm:text-left">

              Pembayaran Aman & Cepat

            </p>

            {/* DESCRIPTION */}

            <div className="mt-14 bg-white rounded-[32px] p-8 border border-zinc-100">

              <h2 className="text-2xl font-black text-zinc-900">

                Deskripsi Produk

              </h2>

              <div
                className="
                  mt-5
                  leading-9
                  text-zinc-600
                  text-lg
                  prose
                  max-w-none
                  prose-headings:text-zinc-900
                  prose-strong:text-zinc-900
                  prose-li:text-zinc-700
                "
                dangerouslySetInnerHTML={{
                  __html: product.description,
                }}
              />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}