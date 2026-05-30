"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Shapes,
  ShoppingBag,
  Menu,
  X,
  Store,
  LogOut
} from "lucide-react";
import { useAuth, AuthProvider } from "@/contexts/AuthContext"; // Import AuthProvider juga di sini

// Komponen Internal Utama Layout Admin
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth(); // Sekarang aman dipanggil karena sudah di dalam AuthProvider

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menus = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Shapes },
    { name: "Orders", href: "/admin", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      
      {/* MOBILE HEADER */}
      <header className="md:hidden w-full h-16 bg-white border-b border-zinc-200 px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-[#007FFF] leading-none">Berbelanja</h1>
          <span className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Admin Panel</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 rounded-xl border border-zinc-200 bg-white text-zinc-600 flex items-center justify-center"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[270px] bg-white shadow-2xl flex flex-col p-4 justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <h1 className="text-xl font-black text-[#007FFF]">Berbelanja</h1>
                <button onClick={() => setIsOpen(false)} className="text-zinc-400"><X size={20} /></button>
              </div>
              <div className="space-y-2">
                {menus.map((menu) => {
                  const Icon = menu.icon;
                  return (
                    <Link
                      key={menu.name}
                      href={menu.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm ${
                        pathname === menu.href ? "bg-[#007FFF] text-white" : "text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      <Icon size={18} /> {menu.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Tombol Bawah di Mobile */}
            <div className="space-y-2 pt-4 border-t border-zinc-100">
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-zinc-600 hover:bg-zinc-100">
                <Store size={18} /> Kembali ke Toko
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-red-600 hover:bg-red-50">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="w-[260px] bg-white border-r border-zinc-200 hidden md:flex flex-col justify-between shrink-0 sticky top-0 h-screen p-4">
        <div className="space-y-6">
          <div className="px-2 py-4 border-b border-zinc-100">
            <h1 className="text-2xl font-black text-[#007FFF]">Berbelanja</h1>
            <p className="text-sm text-zinc-500 mt-1">Admin Panel</p>
          </div>
          <div className="space-y-2">
            {menus.map((menu) => {
              const Icon = menu.icon;
              return (
                <Link
                  key={menu.name}
                  href={menu.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold ${
                    pathname === menu.href ? "bg-[#007FFF] text-white shadow-lg shadow-[#007FFF]/20" : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <Icon size={20} /> {menu.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tombol Akses Toko & Logout di Desktop (Paling Bawah Sidebar) */}
        <div className="space-y-2 pt-4 border-t border-zinc-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-zinc-600 hover:bg-zinc-100 transition-all"
          >
            <Store size={20} />
            Kembali ke Toko
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-red-600 hover:bg-red-50 transition-all text-left"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 bg-[#F8FAFC] p-6 md:p-10">
        {children}
      </main>

    </div>
  );
}

// Export default wrapper yang menyediakan AuthContext untuk layout admin
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}