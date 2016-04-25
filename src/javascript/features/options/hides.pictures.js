(function(context) {
    context.AdditionalFeatureManager.register(function(shoutboxAPI, view) {
        var replacementLabel = '[IMG]';
        var $shoutBox = view.getShoutBoxMainObject();

        view.registerOption('hidePictures', false)
            .setOnLabel('', 'Spłaszczaj obrazki do linków')
            .setOffLabel('', 'Pokazuj obrazki jako obrazki')
            .setOnClickCallback(function() {
                $shoutBox.on('shoutbox:view:notify', notifyHandler);
                notifyHandler();
            })
            .setOffClickCallback(function() {
                $shoutBox.off('shoutbox:view:notify', notifyHandler);

                $shoutBox
                    .find('.shoutMessage a')
                    .each(function(index, element) {
                        if (element.text !== replacementLabel) {
                            return;
                        }

                        var e = $(element);
                        e.replaceWith('<img src="' + e.attr('href') + '" alt="" />');
                    });
            })
            .run();

        function notifyHandler() {
            $shoutBox
                .find('.shoutMessage img[alt=""]')
                .each(function(index, element) {
                    var e = $(element);
                    e.replaceWith('<a href="' + e.attr('src') + '">' + replacementLabel + '</a>');
                });
        }
    });
})(ShoutBox);