"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import Cookies from "js-cookie";

import api from "@/services/api";

interface CartContextType {
  cartCount: number;
  fetchCart: () => Promise<void>;
}

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [cartCount, setCartCount] =
    useState(0);

  async function fetchCart() {

    try {

      const token =
        Cookies.get("token");

      if (!token) return;

      const response =
        await api.get("/carts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      const totalQuantity =
        response.data.reduce(
            (total: number, item: any) =>
            total + item.quantity,
            0
        );

setCartCount(totalQuantity);

    } catch (error) {

      console.error(error);

    }

  }

  useEffect(() => {

    fetchCart();

  }, []);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {

  const context =
    useContext(CartContext);

  if (!context) {

    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}