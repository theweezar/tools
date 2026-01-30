/**
 * Popup script for Faker Form extension
 * Handles user interactions and sends messages to content script
 */

document.addEventListener("DOMContentLoaded", () => {
  const fillButton = document.getElementById("fillButton");

  fillButton.addEventListener("click", async () => {
    try {
      // Get current active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tabs.length === 0) {
        console.error("No active tab found");
        return;
      }

      const activeTab = tabs[0];

      // Send message to content script to fill forms
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "fillForms" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError.message);
            showMessage("Failed to fill forms. Please refresh the page and try again.", "error");
          } else if (response && response.status === "success") {
            showMessage("Forms filled successfully!", "success");
            // Close popup after 1.5 seconds
            setTimeout(() => window.close(), 1500);
          }
        }
      );
    } catch (error) {
      console.error("Error filling forms:", error);
      showMessage("An error occurred. Please try again.", "error");
    }
  });
});

/**
 * Show feedback message to user
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
function showMessage(message, type = "success") {
  const content = document.querySelector(".content");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = message;

  content.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}
