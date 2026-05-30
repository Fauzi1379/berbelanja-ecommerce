import api from "./api";

export async function login(
  email: string,
  password: string
) {
  const response = await api.post("/login", {
    email,
    password,
  });

  return response.data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  password_confirmation: string
) {
  const response = await api.post("/register", {
    name,
    email,
    password,
    password_confirmation,
  });

  return response.data;
}

export async function logout(token: string) {
  return api.post(
    "/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}