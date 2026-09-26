const API_URL = import.meta.env.VITE_API_URL || "";

const request = async (url, options = {}) => {
  const token = localStorage.getItem("authToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data?.message
        ? data.message
        : "Something went wrong",
    );
  }

  return data;
};

export const getProducts = () => request(`${API_URL}/api/products`);

export const createProduct = (product) =>
  request(`${API_URL}/api/products`, {
    method: "POST",
    body: JSON.stringify(product),
  });

export const updateProduct = (id, product) =>
  request(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });

export const deleteProduct = (id) =>
  request(`${API_URL}/api/products/${id}`, {
    method: "DELETE",
  });
