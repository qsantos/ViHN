const defaultOptions = {
    smoothScrolling: true,
    persistentCollapse: true,
    newestItems: true,
};

function getOption(options, key) {
    const option = options?.[key];
    return option !== undefined ? option : defaultOptions[key];
}
