"use client";

import { useState } from "react";
import api from "@/services/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    try {
      await api.post("/register", form);

      alert("Register berhasil");

      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      alert("Register gagal");
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-5">Register</h1>

      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Nama"
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button className="bg-black text-white px-4 py-2">
          Register
        </button>
      </form>
    </div>
  );
}