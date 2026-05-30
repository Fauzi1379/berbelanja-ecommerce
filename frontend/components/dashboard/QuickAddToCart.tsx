"use client";

import Cookies from "js-cookie";

import api from "@/services/api";

import { ShoppingCart } from "lucide-react";

import { useState } from "react";

import { useCart } from "@/contexts/CartContext";

export default function QuickAddToCart({
  productId,
}: {
  productId: number;
}) {

  const [loading, setLoading] =
    useState(false);

  const { fetchCart } = useCart();

  async function addToCart() {

    try {

      setLoading(true);

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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchCart();

    } catch (error) {

      console.error(error);

      alert("Gagal tambah cart");

    } finally {

      setLoading(false);

    }

  }

  return (
    <button
      onClick={addToCart}
      disabled={loading}
      className="bg-[#007FFF] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition flex items-center gap-2"
    >

      <ShoppingCart size={16} />

      {loading
        ? "Loading..."
        : "Tambah"}

    </button>
  );
}