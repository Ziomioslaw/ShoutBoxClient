context.Parsers = (function() {
    var registred = [];

    return {
        register: function(f) {
            registred.push(f);
        },
        parse: function(metadata) {
            var parse = registred.find(function(parse) {
                return parse.condition(metadata);
            });

            if (parse) {
                parse.action(metadata);
            }
        }
    };
})();
