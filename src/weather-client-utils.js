function getOptions() {
    let options = [];
    for (let i = 1; i < 21; i++) {
        options.push({
            text: i,
            value: i
        })
    }
    return options;
}

export { getOptions };