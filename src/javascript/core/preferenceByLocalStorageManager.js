context.PreferenceByLocalStorageManager = function() {
    var prefix = 'shoutbox:';

    return {
        getValue: function(name) {
            var value = window.localStorage.getItem(prefix + name);
            if (value === null) {
                return null;
            }

            if (isFinite(value)) {
                return parseInt(value, 10);
            }

            return value;
        },
        setValue: function(name, value) {
            if (typeof value === "boolean") {
                value = value ? 1 : 0;
            }

            window.localStorage.setItem(prefix + name, value);
        }
    };
};
