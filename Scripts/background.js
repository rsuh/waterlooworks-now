document.getElementById('myButton').addEventListener('click', function() {
	chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.executeScript(tab.id, {file: "./Scripts/content_script.js"});
  });
});