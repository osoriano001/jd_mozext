// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "corsBypassFetch") {
    fetch(message.url)
      .then(response => response.text())
      .then(htmlText => sendResponse({ success: true, data: htmlText }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keeps the communication channel open for asynchronous responses
  }
});
