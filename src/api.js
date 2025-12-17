const API_BASE = "https://dummyjson.com";

export async function fetchProducts(limit = 12) {
  const response = await fetch(`${API_BASE}/products?limit=${limit}`);
  if (!response.ok)
    throw new Error(`Failed products fetch: ${response.status}`);
  const payload = await response.json();
  return payload.products ?? [];
}

export async function fetchProduct(id = "1") {
  const response = await fetch(`${API_BASE}/products/${id}`);
  if (!response.ok) throw new Error(`Failed product fetch: ${response.status}`);
  return response.json();
}

export { API_BASE };
