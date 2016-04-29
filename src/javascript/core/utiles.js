context.ifNullTakeDefault = function(value, defaultValue) {
    return (value !== null) ? value : defaultValue;
};

context.confirm = function(question) {
    return window.confirm(question);
};
