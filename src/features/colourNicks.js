(function(context, $) {
    context.AdditionalFeatureManager.register(function(shoutboxAPI, view) {
        var defaultColour = '#a4bf37';
        var offlineColour = 'gray';
        var shouts = view.getShoutBoxMainObject();
        var optionName = 'colourNicks';
        var nicks = {};
        var regex = /color: (#[0-9a-fA-F]+);/;
        var value = context.ifNullTakeDefault(shoutboxAPI.getOptionValue(optionName), false);
        var button = view.registerOption(optionName);

        $('#upshrinkHeaderIC div.smalltext a').each(function(index, element) {
            var match;
            if (element.hasAttribute('style')) {
                match = regex.exec(element.getAttributeNode('style').value);
                if (match) {
                    nicks[element.text] = match[1];
                }
            } else {
                nicks[element.text] = defaultColour;
            }
        });

        updateButton();

        button.click(function() {
            value = !value;
            updateButton();
            shoutboxAPI.setOptionValue(optionName, value);
            window.location.reload(true);
        });

        shouts.on('shoutbox:view:notify', function() {
            if (value) {
                return;
            }

            shouts.find('.shoutNick > a').each(function(index, element) {
                $(element).css('color', getColour(element.text));
            });
        });

        function getColour(name) {
            if (nicks.hasOwnProperty(name)) {
                return nicks[name];
            }

            return offlineColour;
        }

        function updateButton() {
            if (value) {
                button.html('Pokazuj kolory na nickach');
            } else {
                button.html('Niepokazuj kolorów na nickach');
            }
        }
    });
})(ShoutBox, jQuery);
