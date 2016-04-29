context.PreferenceByCookieManager = function() {
    var cookieName = 'ShoutBox';
    var preference = null;

    return {
        getValue: function(name) {
            if (!preference) {
                load();
            }

            return preference[name];
        },
        setValue: function(name, value) {
            preference[name] = value;
            save();
        }
    };

    function load() {
        var cookieValue = $.cookie(cookieName), tmp;

        if (typeof cookieValue !== 'undefined') {
            tmp = JSON.parse(cookieValue);
            if (!!tmp) {
                preference = tmp;
                return;
            }
        }

        preference = {
            title: true,
            sound: false,
            favicon: false
        };
    }

    function save() {
        var json = JSON.stringify(preference);
        $.cookie(cookieName, json);
    }
};
