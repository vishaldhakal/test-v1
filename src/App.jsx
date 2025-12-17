import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { API_BASE, fetchProduct, fetchProducts } from "./api";

function derivePage(pathname) {
  if (pathname === "/" || pathname === "/products") return "list";
  if (/^\/products\/\d+/.test(pathname)) return "detail";
  return "not-found";
}

function Header() {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">Server-rendered demo</p>
        <h1 className="headline">Demo Storefront</h1>
        <p className="lede">
          All product data is fetched on the server (dummyjson.com) and shipped
          in the initial HTML, so there are no client-side API calls to see the
          page.
        </p>
      </div>

      <nav className="nav">
        <a href="/products" className="nav-link">
          Products
        </a>
        <a href="/products/1" className="nav-link">
          Product detail
        </a>
      </nav>
    </header>
  );
}

function ProductCard({ product }) {
  return (
    <a className="product-card compact" href={`/products/${product.id}`}>
      <div className="product-media">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="product-image"
          loading="lazy"
        />
      </div>
      <div className="product-content">
        <p className="product-category">{product.category}</p>
        <h2 className="product-title">{product.title}</h2>
        <p className="product-description clamp">{product.description}</p>
        <div className="product-meta">
          <div>
            <p className="product-label">Price</p>
            <p className="product-price">${product.price}</p>
          </div>
          <div>
            <p className="product-label">Rating</p>
            <p className="product-rating">{product.rating} / 5</p>
          </div>
        </div>
      </div>
    </a>
  );
}

function ProductGrid({ products }) {
  if (!products?.length) return <p className="muted">No products available.</p>;
  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductDetail({ product }) {
  if (!product) return null;

  return (
    <article className="product-card">
      <div className="product-media">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="product-image"
          loading="lazy"
        />
      </div>
      <div className="product-content">
        <p className="product-category">{product.category}</p>
        <h1 className="product-title">{product.title}</h1>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          <div>
            <p className="product-label">Price</p>
            <p className="product-price">${product.price}</p>
          </div>
          <div>
            <p className="product-label">Rating</p>
            <p className="product-rating">{product.rating} / 5</p>
          </div>
          <div>
            <p className="product-label">Stock</p>
            <p className="product-stock">{product.stock} available</p>
          </div>
        </div>
        <div className="product-tags">
          {product.tags?.map((tag) => (
            <span key={tag} className="product-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function State({ title, message }) {
  return (
    <div className="state state-error">
      <p>{title}</p>
      {message ? <p className="state-meta">{message}</p> : null}
    </div>
  );
}

function App({ page = "list", products = [], product = null, error = null }) {
  const [currentPage, setCurrentPage] = useState(page);
  const [items, setItems] = useState(products);
  const [selected, setSelected] = useState(product);
  const [message, setMessage] = useState(error);
  const [loading, setLoading] = useState(false);

  const resolvedPage = useMemo(() => {
    if (typeof window === "undefined") return currentPage;
    return currentPage ?? derivePage(window.location.pathname);
  }, [currentPage]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathname = window.location.pathname;
    const pageFromPath = currentPage ?? derivePage(pathname);
    if (pageFromPath !== currentPage) {
      setCurrentPage(pageFromPath);
    }

    const needsList = pageFromPath === "list" && (!items || items.length === 0);
    const needsDetail = pageFromPath === "detail" && !selected;
    if (!needsList && !needsDetail) return;

    let cancelled = false;

    async function fetchClientData() {
      try {
        setLoading(true);
        setMessage(null);

        if (needsList) {
          const data = await fetchProducts();
          if (!cancelled) setItems(data ?? []);
        }

        if (needsDetail) {
          const match = pathname.match(/^\/products\/(\d+)/);
          const id = match?.[1];
          if (!id) throw new Error("Product id missing in URL.");
          const data = await fetchProduct(id);
          if (!cancelled) setSelected(data);
        }
      } catch (err) {
        if (!cancelled) {
          setMessage("Content could not be loaded on the client.");
          console.error("[Client] data fetch failed", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchClientData();

    return () => {
      cancelled = true;
    };
  }, [currentPage, items, selected]);

  return (
    <main className="page">
      <Header />

      {resolvedPage === "list" && !message && (
        <>
          {loading ? <p className="muted">Loading products…</p> : null}
          <ProductGrid products={items} />
        </>
      )}

      {resolvedPage === "detail" && !message && (
        <>
          {loading ? <p className="muted">Loading product…</p> : null}
          <ProductDetail product={selected} />
        </>
      )}

      {message && (
        <State
          title="We could not load this content right now."
          message={message}
        />
      )}

      {resolvedPage === "not-found" && !message && (
        <State
          title="Page not found."
          message="Try visiting /products or /products/1 for examples."
        />
      )}
    </main>
  );
}

export default App;
