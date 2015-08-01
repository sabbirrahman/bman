function getPageDetails(callback) { 
    chrome.tabs.executeScript(null, { file: 'js/content.js' }); 
    chrome.runtime.onMessage.addListener(function(message)  { 
        callback(message); 
    }); 
};