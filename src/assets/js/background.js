function getPageDetails(callback) {
  chrome.tabs.executeScript(null, { file: './assets/js/content.js' });
  chrome.runtime.onMessage.addListener(function(message) {
    callback(message);
  });
};
