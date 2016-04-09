(function(context) {
    context.AdditionalFeatureManager.register('documentNotification', documentNotification, true);

    function documentNotification(shoutBoxAPI, view) {
        var oryginalPageTitle = document.title;
        var $shoutBox = view.getShoutBoxMainObject();

        $shoutBox.on('shoutbox:view:notify', function(event) {
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
        });

        $shoutBox.on('shoutbox:view:reset', function() {
            document.title = oryginalPageTitle;
        });
    }
})(ShoutBox);
