"use strict";

/**
 * Decide whether to intercept this download
 * You can add rules here later (size, extension, domain, etc.)
 */
function shouldIntercept(downloadItem) {
  return true; // intercept all downloads for now
}

chrome.downloads.onCreated.addListener(async (downloadItem) => {
  try {
    if (!shouldIntercept(downloadItem)) {
      return;
    }

    // Cancel Chrome's default download
    await chrome.downloads.cancel(downloadItem.id);
    await chrome.downloads.erase({ id: downloadItem.id });

    // Prepare message for native host
    const message = {
      finalUrl: downloadItem.finalUrl,
      filename: downloadItem.filename || "",
      mime: downloadItem.mime || "",
      fileSize: downloadItem.fileSize || -1
    };

    console.log("Sending:", message);

    // Send to C++ Windows service
    chrome.runtime.sendNativeMessage(
      "com.provider.downloader.app",
      message,
      (response) => {
        console.log("Native host response:", response);
        if (chrome.runtime.lastError) {
          console.error("Native messaging error:", chrome.runtime.lastError.message);
          return;
        }
      }
    );
  } catch (err) {
    console.error("Download interception failed:", err);
  }
});
