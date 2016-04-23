(function(context) {
    context.AdditionalFeatureManager.register(function(shoutBoxAPI, view) {
        var oryginalPageTitle = document.title;
        var $shoutBox = view.getShoutBoxMainObject();

        view.registerOption('pageTitle', true)
            .setOnLabel('icon-embed', 'Włącz powiadomienia w tytule')
            .setOffLabel('icon-embed2', 'Wyłącz powiadomienia w tytule')
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
            var result = oryginalPageTitle;

            if (newShouts > 0) {
                result = '(' + newShouts + ') ' + result;
            }

            if (newShoutsForUser > 0) {
                result = '(' + newShoutsForUser + '!) ' + result;
            }

            document.title = result;
        }

        function resetHandler() {
            document.title = oryginalPageTitle;
        }
    });
})(ShoutBox);
