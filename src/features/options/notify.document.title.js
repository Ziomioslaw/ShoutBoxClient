(function(context) {
    context.AdditionalFeatureManager.register(function(shoutBoxAPI, view) {
        var oryginalPageTitle = document.title;
        var $shoutBox = view.getShoutBoxMainObject();

        view.registerOption('pageTitle', true)
            .setOnLabel('Włącz powiadomienia w tytule')
            .setOffLabel('Wyłącz powiadomienia w tytule')
            .setClickCallBack(function(value) {
                if (value) {
                    $shoutBox.on('shoutbox:view:notify', notifyHandler);
                    $shoutBox.on('shoutbox:view:reset', resetHandler);
                } else {
                    $shoutBox.off('shoutbox:view:notify', notifyHandler);
                    $shoutBox.off('shoutbox:view:reset', resetHandler);
                }
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
