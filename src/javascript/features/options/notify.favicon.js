(function(context, $) {
    context.AdditionalFeatureManager.register(function(shoutBoxAPI, view) {
        var $shoutBox = view.getShoutBoxMainObject();

        view.registerOption('favicon', false)
            .setOnLabel('Włącz powiadomienia w favikonie')
            .setOffLabel('Wyłącz powiadomienia w favikonie')
            .setOnClickCallback(function() {
                $shoutBox.on('shoutbox:view:notify', notifyHandler);
                $shoutBox.on('shoutbox:view:reset', resetHandler);
            })
            .setOffClickCallback(function() {
                $shoutBox.off('shoutbox:view:notify', notifyHandler);
                $shoutBox.off('shoutbox:view:reset', resetHandler);
            })
            .run();

        function notifyHandler(event) {
            var newShouts = event.newShouts;
            var newShoutsForUser = event.newShoutsForUser;

            if (newShouts > 0) {
                $.faviconNotify('/favicon.ico', newShouts, newShoutsForUser, 'br', '#123456', '#FFD700');
            }
        }

        function resetHandler() {
            $.faviconNotify('/favicon.ico');
        }
    });
})(ShoutBox, jQuery);
