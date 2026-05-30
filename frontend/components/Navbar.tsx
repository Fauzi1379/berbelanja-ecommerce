"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Menu,
  X,
  Home
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const { cartCount } = useCart();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const {
    user,
    token,
    logout,
  } = useAuth();

  // JIKA sedang di rute admin, matikan navbar utama ini agar tidak double/bertabrakan
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#007FFF]/10 bg-white/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link
          href="/"
          className="text-3xl font-black text-[#007FFF]"
        >
          Berbelanja
        </Link>

        {/* DESKTOP MENU (Hidden di mobile) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/"
            className="text-zinc-700 hover:text-[#007FFF] font-semibold transition px-3 py-2"
          >
            Home
          </Link>

          {token ? (
            <>
              {/* DASHBOARD */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-2 rounded-2xl border border-[#007FFF]/20 hover:bg-[#007FFF] hover:text-white font-semibold transition"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              {/* ADMIN */}
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-5 py-2 rounded-2xl border border-purple-200 hover:bg-purple-500 hover:text-white font-semibold transition"
                >
                  <LayoutDashboard size={18} />
                  Admin
                </Link>
              )}

              {/* ORDERS */}
              <Link
                href="/orders"
                className="flex items-center gap-2 px-5 py-2 rounded-2xl border border-[#007FFF]/20 hover:bg-[#007FFF] hover:text-white font-semibold transition"
              >
                <PackageCheck size={18} />
                Orders
              </Link>

              {/* CART */}
              <Link
                href="/cart"
                className="relative flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#007FFF] text-white font-semibold hover:opacity-90 transition"
              >
                <ShoppingCart size={18} />
                Cart
                {cartCount > 0 && (
                  <div className="absolute -top-2 -right-2 min-w-[24px] h-6 px-2 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                    {cartCount}
                  </div>
                )}
              </Link>

              {/* LOGOUT */}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              {/* LOGIN */}
              <Link
                href="/login"
                className="px-5 py-2 rounded-2xl border border-[#007FFF] text-[#007FFF] font-semibold hover:bg-[#007FFF] hover:text-white transition"
              >
                Login
              </Link>

              {/* REGISTER */}
              <Link
                href="/register"
                className="px-5 py-2 rounded-2xl bg-[#007FFF] text-white font-semibold hover:opacity-90 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white p-4 space-y-2 shadow-inner">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-700 hover:bg-zinc-50 font-semibold"
          >
            <Home size={18} /> Home
          </Link>

          {token ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-700 hover:bg-zinc-50 font-semibold"
              >
                <LayoutDashboard size={18} /> Dashboard
              </Link>

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-purple-700 bg-purple-50 font-semibold"
                >
                  <LayoutDashboard size={18} /> Admin Panel
                </Link>
              )}

              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-700 hover:bg-zinc-50 font-semibold"
              >
                <PackageCheck size={18} /> Orders
              </Link>

              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#007FFF] text-white font-semibold"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={18} /> Cart
                </div>
                {cartCount > 0 && (
                  <span className="bg-white text-[#007FFF] text-xs px-2 py-0.5 rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-left"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex justify-center items-center h-11 rounded-xl border border-[#007FFF] text-[#007FFF] font-semibold"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex justify-center items-center h-11 rounded-xl bg-[#007FFF] text-white font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}