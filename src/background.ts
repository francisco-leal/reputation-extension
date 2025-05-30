// @ts-ignore: 'chrome' is provided by the browser extension environment
declare const chrome: any;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "search-reputation",
    title: "Search for reputation",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info: any, _tab: any) => {
  if (info.menuItemId === "search-reputation" && info.selectionText) {
    chrome.storage.local.set({ searchTerm: info.selectionText }, () => {
      chrome.runtime.sendMessage({
        type: "SEARCH_TERM_UPDATED",
        searchTerm: info.selectionText,
      });
    });
    const url = chrome.runtime.getURL(
      `index.html?search=${encodeURIComponent(info.selectionText)}`
    );
    chrome.windows.create({
      url,
      type: "popup",
      width: 400,
      height: 600,
    });
  }
});
