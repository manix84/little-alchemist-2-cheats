import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

const redirectPath = new URLSearchParams(window.location.search).get("redirect");
if (redirectPath?.startsWith(import.meta.env.BASE_URL)) {
  window.history.replaceState(null, "", redirectPath);
}

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch((error) => console.error("Service worker registration failed", error));
  });
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
const routerBasename = import.meta.env.BASE_URL === "/" ? "/" : import.meta.env.BASE_URL.replace(/\/$/, "");

root.render(
  <React.StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
