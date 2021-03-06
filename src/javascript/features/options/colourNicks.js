context.Features.register(function(shoutboxAPI, view) {
    var defaultColour = '#a4bf37';
    var offlineColour = 'gray';
    var shouts = view.getShoutBoxMainObject();
    var regex = /color: (.+);/;
    var nicks = {};

    nicks[shoutboxAPI.getShoutBoxInfoShoutNick()] = 'gold';

    view.registerOption('colourNicks', false)
        .setOnLabel('icon-bubble', 'Pokazuj kolory na nickach')
        .setOffLabel('icon-bubble2', 'Niepokazuj kolorów na nickach')
        .setOnClickCallback(function() {
            shouts.on('shoutbox:view:notify', colourNicks);
        })
        .setOffClickCallback(function() {
            shouts.off('shoutbox:view:notify', colourNicks);
        })
        .setAfterApplyCallback(function() {
            window.location.reload(true);
        })
        .run();

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

    function colourNicks() {
        shouts.find('.shoutNick > a').each(function(index, element) {
            $(element).css('color', getColour(element.text));
        });
    }

    function getColour(name) {
        if (nicks.hasOwnProperty(name)) {
            return nicks[name];
        }

        return offlineColour;
    }
});
