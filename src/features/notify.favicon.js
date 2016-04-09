(function(context) {
    context.AdditionalFeatureManager.register('faviconNotifier', faviconPainterNotifier, false);

    function faviconPainterNotifier(shoutBoxAPI, view) {
        var $shoutBox = view.getShoutBoxMainObject();

        $shoutBox.on('shoutbox:view:notify', function(event) {
            var newShouts = event.newShouts;
            var newShoutsForUser = event.newShoutsForUser;

            if (newShouts > 0) {
                $.faviconNotify('/favicon.ico', newShouts, newShoutsForUser, 'br', '#123456', '#FFD700');
            }
        });

        $shoutBox.on('shoutbox:view:reset', function() {
            $.faviconNotify('/favicon.ico');
        });
    }
})(ShoutBox);
