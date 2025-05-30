import "./index.css";
// @ts-ignore: 'chrome' is provided by the browser extension environment
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Sync searchTerm, pageUrl, and title from chrome.storage.local to localStorage for App
// @ts-ignore
chrome.storage.local.get(
  ["searchTerm", "pageUrl", "title"],
  (result: { searchTerm?: string; pageUrl?: string; title?: string }) => {
    if (result.searchTerm) {
      window.localStorage.setItem("searchTerm", result.searchTerm);
    } else {
      window.localStorage.removeItem("searchTerm");
    }
    if (result.pageUrl) {
      window.localStorage.setItem("pageUrl", result.pageUrl);
    } else {
      window.localStorage.removeItem("pageUrl");
    }
    if (result.title) {
      window.localStorage.setItem("title", result.title);
    } else {
      window.localStorage.removeItem("title");
    }
  }
);

// @ts-ignore
chrome.runtime.onMessage.addListener(
  (message: any, _sender: any, _sendResponse: (response?: any) => void) => {
    if (message.type === "CONTEXT_UPDATED") {
      if (message.searchTerm) {
        window.localStorage.setItem("searchTerm", message.searchTerm);
      } else {
        window.localStorage.removeItem("searchTerm");
      }
      if (message.pageUrl) {
        window.localStorage.setItem("pageUrl", message.pageUrl);
      } else {
        window.localStorage.removeItem("pageUrl");
      }
    }
  }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
