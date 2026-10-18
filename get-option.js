const defaultOptions = {
    smoothScrolling: true,
    persistentCollapse: true,
    newestItems: true,
    updateLocation: true,
    updateLocationDelay: 2.0,
    updateLocationOnClose: true,
};

// biome-ignore lint/correctness/noUnusedVariables: used by main.js and options.js
function getOption(options, key) {
    const option = options?.[key];
    return option !== undefined ? option : defaultOptions[key];
}
