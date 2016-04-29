function IntervalCallback(callback, delay) {
    var idInterval = null;

    return {
        start: function() {
            callback();
            idInterval = setInterval(callback, delay);
        },
        cancel: function() {
            clearInterval(idInterval);
            idInterval = null;
        }
    };
}
