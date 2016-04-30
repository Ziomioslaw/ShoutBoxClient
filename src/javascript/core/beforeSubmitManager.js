context.BeforeSubmitManager = (function() {
    var registred = [];

    return {
        register: function(f) {
            registred.push(f);
        },
        call: function(event) {
            var origin = event.origin;
            for (var i = 0, max = registred.length; i < max; i++) {
                event.origin = origin;
                event.message = registred[i](event.message, event);
                event.wasChanged = event.origin !== event.message;

                if (event.stop || event.cancel) {
                    return;
                }
            }
        }
    };
})();
