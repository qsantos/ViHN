function getInputValue(input) {
    if (input.type === "checkbox") {
        return input.checked;
    } else if (input.type === "number") {
        return input.valueAsNumber;
    } else {
        return input.value;
    }
}

function setInputValue(input, value) {
    if (input.type === "checkbox") {
        input.checked = value;
    } else if (input.type === "number") {
        input.valueAsNumber = value;
    } else {
        input.value = value;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get((options) => {
        function onChange(event) {
            const input = event.target;
            // NOTE: getInputValue() can return NaN. That’s fine.
            options[input.name] = getInputValue(input);
            chrome.storage.sync.set(options);
        }

        for (const input of document.getElementsByTagName("input")) {
            const value = getOption(options, input.name);
            setInputValue(input, value);
            input.addEventListener("input", onChange);
        }
    });
});
