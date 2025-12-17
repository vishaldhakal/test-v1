import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { API_BASE, fetchProduct, fetchProducts } from "./api";

/**
 * Very small router for SSR that decides what data to fetch based on URL.
 */
async function resolveRoute(pathname) {
  if (pathname === "/" || pathname === "/products") {
    try {
      const products = await fetchProducts();
      return { page: "list", products, product: null, error: null };
    } catch (error) {
      console.error("[SSR] products fetch failed", error);
      return {
        page: "list",
        products: [],
        product: null,
        error: "Unable to load products.",
      };
    }
  }

  const productDetailMatch = pathname.match(/^\/products\/(\d+)/);
  if (productDetailMatch) {
    const productId = productDetailMatch[1];
    try {
      const product = await fetchProduct(productId);
      return { page: "detail", product, products: [], error: null };
    } catch (error) {
      console.error("[SSR] product fetch failed", error);
      return {
        page: "detail",
        product: null,
        products: [],
        error: "Product not found or unavailable.",
      };
    }
  }

  return { page: "not-found", products: [], product: null, error: null };
}

/**
 * @param {string} _url
 */
export async function render(_url) {
  const url = new URL(_url, "http://localhost");
  const initialData = await resolveRoute(url.pathname);

  const appHtml = renderToString(
    <StrictMode>
      <App
        page={initialData.page}
        products={initialData.products}
        product={initialData.product}
        error={initialData.error}
      />
    </StrictMode>
  );

  const safeInitialData = JSON.stringify(initialData).replace(/</g, "\\u003c");

  const title =
    initialData.page === "detail" && initialData.product?.title
      ? `${initialData.product.title} | Demo Store`
      : initialData.page === "list"
      ? "Products | Demo Store"
      : "Page not found | Demo Store";

  const description =
    initialData.page === "detail" && initialData.product?.description
      ? initialData.product.description
      : "Server-rendered product pages demo with Vite + React.";

  const head = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="prefetch" href="${API_BASE}/products?limit=12" as="fetch" crossorigin="anonymous" />
    <script>window.__INITIAL_DATA__ = ${safeInitialData};</script>
  `;

  return { html: appHtml, head };
}
