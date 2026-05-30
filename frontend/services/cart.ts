import api from "./api";

export async function getCarts(token: string) {
  const response = await api.get("/carts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function addToCart(
  productId: number,
  token: string
) {
  const response = await api.post(
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

  return response.data;
}

export async function deleteCart(
  cartId: number,
  token: string
) {
  return api.delete(`/carts/${cartId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function checkout(
  shipping_address: string,
  token: string
) {
  const response = await api.post(
    "/checkout",
    {
      shipping_address,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getOrders(token: string) {
  const response = await api.get("/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}