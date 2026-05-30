import "./globals.css";

import Navbar from "@/components/Navbar";

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

export const metadata = {
  title: "Berbelanja",
  description: "Modern E-Commerce",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body suppressHydrationWarning className="bg-[#F5F9FF] text-zinc-900">

        <AuthProvider>

          <CartProvider>

            <Navbar />

            <main>
              {children}
            </main>

          </CartProvider>

        </AuthProvider>

      </body>

    </html>
  );
}