"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Cookies from "js-cookie";

import api from "@/services/api";

import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {

  const router = useRouter();

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function handleLogin(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);

    try {

      const response = await api.post("/login", form);

      const token = response.data.token;

      Cookies.set("token", token, {
        expires: 7,
      });

      await login(token);

      router.push("/dashboard");

      router.refresh();

    } catch (error) {

      console.error(error);

      alert("Email atau password salah");

    } finally {

      setLoading(false);

    }

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f8ff] px-5">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-[#007FFF]/10">

        <div className="mb-8 text-center">

          <h1 className="text-4xl font-black text-[#007FFF]">
            Login
          </h1>

          <p className="text-zinc-500 mt-3">
            Masuk untuk mulai berbelanja
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>

            <label className="text-sm font-semibold text-zinc-700">
              Email
            </label>

            <input
              type="email"
              placeholder="ujicoba@berbelanja.com"
              className="mt-2 w-full border border-zinc-300 rounded-2xl px-4 py-3 outline-none focus:border-[#007FFF] text-black placeholder:text-zinc-400 bg-white"
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />

          </div>

          <div>

            <label className="text-sm font-semibold text-zinc-700">
              Password
            </label>

            <input
              type="password"
              placeholder="Masukkan password"
              className="mt-2 w-full border border-zinc-300 rounded-2xl px-4 py-3 outline-none focus:border-[#007FFF] text-black placeholder:text-zinc-400 bg-white"
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />

          </div>

          <button
            disabled={loading}
            className="w-full bg-[#007FFF] hover:bg-[#006ae6] text-white py-3 rounded-2xl font-bold transition"
          >
            {loading ? "Loading..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}