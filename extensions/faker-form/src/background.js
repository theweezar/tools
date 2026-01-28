/**
 * Background service worker for Faker Form extension (Manifest V3)
 * Handles extension lifecycle and events
 */

// Listen for extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Extension was installed
    console.log('Faker Form extension installed');
  } else if (details.reason === 'update') {
    // Extension was updated
    console.log('Faker Form extension updated');
  }
});

// Listen for runtime errors
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle any messages from popup or content scripts if needed
  if (request.action === 'log') {
    console.log('Content Script Log:', request.message);
    sendResponse({ status: 'logged' });
  }
});
