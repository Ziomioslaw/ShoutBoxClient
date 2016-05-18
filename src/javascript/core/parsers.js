context.Parsers = (function() {
    var registred = [];

    // for IE (mostly)
    if (!Array.prototype.find) {
        Array.prototype.find = function(callback, thisArg) {
            for(var i = 0; i < this.length; i++){
                if(callback.call(thisArg || window, this[i], i, this)) {
                    return this[i];
                }
            }

            return null;
        };
    }

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
