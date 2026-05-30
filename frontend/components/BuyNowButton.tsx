"use client";

import Cookies from "js-cookie";

import { useRouter } from "next/navigation";

import api from "@/services/api";

import { ShoppingCart } from "lucide-react";

export default function BuyNowButton({
  productId,
}: {
  productId: number;
}) {

  const router = useRouter();

  async function handleBuyNow() {

    try {

      const token =
        Cookies.get("token");

      await api.post(
        "/carts",
        {
          product_id: productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      router.push("/checkout");

    } catch (error) {

      console.error(error);

      alert("Gagal checkout");

    }

  }

  return (
    <button
      onClick={handleBuyNow}
      className="
        w-full
        h-14
        flex
        items-center
        justify-center
        gap-3
        rounded-2xl
        bg-[#007FFF]
        text-white
        font-bold
        shadow-lg
        shadow-[#007FFF]/30
        hover:scale-[1.02]
        hover:opacity-95
        transition
      "
    >

      <ShoppingCart size={20} />

      Buy Now

    </button>
  );
}