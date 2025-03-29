const defaultOptions = {
    smoothScrolling: true,
    persistentCollapse: true,
    newestItems: true,
    updateLocation: true,
    updateLocationDelay: 2.0,
};

function getOption(options, key) {
    const option = options?.[key];
    return option !== undefined ? option : defaultOptions[key];
}
