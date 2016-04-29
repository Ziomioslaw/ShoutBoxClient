context.Features = (function() {
    var register = [];

    return {
        register: function(feature) {
            register.push(feature);
        },
        run: function(shoutboxApi, view) {
            register.forEach(function (feature) {
                feature(shoutboxApi, view);
            });
        }
    };
})();
