"use client";

import { useState } from "react";

import {
  ShoppingCart,
  Loader2,
  Check,
} from "lucide-react";

import { addToCart } from "@/services/cart";

import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function AddToCartButton({
  productId,
}: {
  productId: number;
}) {

  const { token } =
    useAuth();

  const { fetchCart } =
    useCart();

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  async function handleAddToCart() {

    if (!token) {

      alert("Silakan login dahulu");

      window.location.href = "/login";

      return;
    }

    try {

      setLoading(true);

      await addToCart(
        productId,
        token
      );

      await fetchCart();

      setSuccess(true);

      setTimeout(() => {

        setSuccess(false);

      }, 2000);

    } catch (error) {

      console.error(error);

      alert("Gagal tambah cart");

    } finally {

      setLoading(false);

    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className={`
        w-full
        min-h-[60px]
        px-6 py-4
        rounded-2xl
        text-white
        font-bold
        flex items-center justify-center gap-3
        transition duration-300
        shadow-lg
        ${
          success
            ? "bg-green-500"
            : "bg-[#007FFF] hover:opacity-90"
        }
        ${
          loading
            ? "opacity-70 cursor-not-allowed"
            : ""
        }
      `}
    >

      {loading ? (
        <>

          <Loader2
            size={20}
            className="animate-spin"
          />

          Loading...

        </>
      ) : success ? (
        <>

          <Check size={20} />

          Berhasil Ditambahkan

        </>
      ) : (
        <>

          <ShoppingCart size={20} />

          Add To Cart

        </>
      )}

    </button>
  );
}