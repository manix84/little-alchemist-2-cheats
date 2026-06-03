import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ReactGA from "react-ga";
import { registerSW } from "virtual:pwa-register";

ReactGA.initialize("UA-30459282-1");
ReactGA.pageview(window.location.pathname + window.location.search);
registerSW({ immediate: true });

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
