import "./index.css";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App";

const initialData = window.__INITIAL_DATA__ || {};

hydrateRoot(
  document.getElementById("root"),
  <StrictMode>
    <App
      page={initialData.page}
      products={initialData.products}
      product={initialData.product}
      error={initialData.error}
    />
  </StrictMode>
);
