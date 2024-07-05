document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get((options) => {
        function onChange(event) {
            const input = event.target;
            options[input.name] = input.checked;
            chrome.storage.sync.set(options);
        }

        for (const input of document.getElementsByTagName("input")) {
            input.checked = getOption(options, input.name);
            input.addEventListener("input", onChange);
        }
    });
});
