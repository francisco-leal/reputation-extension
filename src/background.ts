// @ts-ignore: 'chrome' is provided by the browser extension environment
declare const chrome: any;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "search-reputation",
    title: "Search for reputation",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info: any, tab: any) => {
  if (info.menuItemId === "search-reputation" && info.selectionText) {
    const context = {
      searchTerm: info.selectionText,
      pageUrl: info.pageUrl || (tab && tab.url) || "",
    };
    chrome.storage.local.set(context, () => {
      chrome.runtime.sendMessage(
        {
          type: "CONTEXT_UPDATED",
          searchTerm: context.searchTerm,
          pageUrl: context.pageUrl,
        },
        () => {
          if (chrome.runtime.lastError) {
            // No receiving end, ignore error
          }
        }
      );
    });
    const url = chrome.runtime.getURL(
      `index.html?search=${encodeURIComponent(
        info.selectionText
      )}&url=${encodeURIComponent(context.pageUrl)}`
    );
    chrome.windows.create({
      url,
      type: "popup",
      width: 400,
      height: 600,
    });
  }
});
