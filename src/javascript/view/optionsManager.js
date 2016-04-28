context.OptionsManager = function(api, $shoutBoxOptions) {
    return {
        registerOption: registerOption
    };

    function registerOption(optionName, defaultValue) {
        var onClickCallback = null, offClickCallback = null, afterApplyCallback = null;
        var offLabel = null, onLabel = null, value = null, clickCount = 0;
        var id = 'shoutbox-option-' + optionName;
        var $button = $shoutBoxOptions
            .append('<div id="' + id + '" class="option"></div>')
            .find('#' + id)
            .click(function(event) {
                value = !value;

                clickCallback();

                clickCount++;
                api.setOptionValue(optionName, value);

                if (afterApplyCallback !== null) {
                    afterApplyCallback(event);
                }
            });


        return {
            setOffLabel: function(icon, title) {
                offLabel = '<span class="' + icon + '" title="' + title + '"></span>';
                return this;
            },
            setOnLabel: function(icon, title) {
                onLabel = '<span class="' + icon + '" title="' + title + '"></span>';
                return this;
            },
            setOnClickCallback: function(click) {
                onClickCallback = click;
                return this;
            },
            setOffClickCallback: function(click) {
                offClickCallback = click;
                return this;
            },
            setAfterApplyCallback: function(callback) {
                afterApplyCallback = callback;
                return this;
            },
            run: function() {
                value = context.ifNullTakeDefault(api.getOptionValue(optionName), defaultValue);
                clickCallback();
                return this;
            }
        };

        function clickCallback() {
            if (value) {
                onClickCallback(clickCount);
            } else {
                offClickCallback(clickCount);
            }

            buildTile();
        }

        function buildTile() {
            var label = value ? offLabel : onLabel;

            $button.html(label);
        }
    }
};
