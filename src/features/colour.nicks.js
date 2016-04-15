(function(context) {
    context.AdditionalFeatureManager.register('colourNicks', colourNicks, true);

    function colourNicks(shoutboxAPI, view) {
        var defaultColour = '#a4bf37';
        var shouts = view.getShoutBoxMainObject();
        var nicks = {};
        var regex = /color: (#[0-9a-fA-F]+);/;

        $('#upshrinkHeaderIC div.smalltext a').each(function(index, element) {
            var match;
            if (element.hasAttribute('style')) {
                match = regex.exec(element.getAttributeNode('style').value);
                if (match) {
                    nicks[element.text] = match[1];
                }
            }
        });

        shouts.on('shoutbox:view:notify', function() {
            shouts.find('.shoutNick > a').each(function(index, element) {
                $(element).css('color', getColour(element.text));
            });
        });

        function getColour(name) {
            if (nicks.hasOwnProperty(name)) {
                return nicks[name];
            }

            return defaultColour;
        }
    }
})(ShoutBox);
