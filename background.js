chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.action == 'open') {
        chrome.tabs.create({
            active: message.active,
            url: message.url,
            index: sender.tab.index + 1,
        });
    }
});
