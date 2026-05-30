"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import Cookies from "js-cookie";

import api from "@/services/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function fetchUser(authToken: string) {

    try {

      const response = await api.get("/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setUser(response.data.user);

    } catch (error) {

      console.error(error);

      Cookies.remove("token");

      setUser(null);

      setToken(null);

    } finally {

      setLoading(false);

    }

  }

  async function login(authToken: string) {

    Cookies.set("token", authToken);

    setToken(authToken);

    await fetchUser(authToken);

  }

  function logout() {

    Cookies.remove("token");

    setUser(null);

    setToken(null);

    window.location.href = "/login";

  }

  useEffect(() => {

    const savedToken =
      Cookies.get("token");

    if (!savedToken) {

      setLoading(false);

      return;
    }

    setToken(savedToken);

    fetchUser(savedToken);

  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}