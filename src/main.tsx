// @ts-ignore: 'chrome' is provided by the browser extension environment
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Sync searchTerm from chrome.storage.local to localStorage for App
// @ts-ignore
chrome.storage.local.get(["searchTerm"], (result: { searchTerm?: string }) => {
  if (result.searchTerm) {
    window.localStorage.setItem("searchTerm", result.searchTerm);
  } else {
    window.localStorage.removeItem("searchTerm");
  }
});

// @ts-ignore
chrome.runtime.onMessage.addListener(
  (message: any, _sender: any, _sendResponse: (response?: any) => void) => {
    if (message.type === "SEARCH_TERM_UPDATED") {
      window.localStorage.setItem("searchTerm", message.searchTerm);
    }
  }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
