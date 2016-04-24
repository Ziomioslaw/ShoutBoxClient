(function(context) {
    context.AdditionalFeatureManager.register(shoutBoxAllShoutReadButton);
    context.AdditionalFeatureManager.register(addBeforeDeleteMessage);
    context.AdditionalFeatureManager.register(shoutAuthorsNicksToButton);

    function shoutBoxAllShoutReadButton(shoutboxAPI, view) {
        view.registerButton('Oznacz jako przeczytane', function(event) {
            shoutboxAPI.sendCommandToView('markAllShoutsAsRead');

            event.preventDefault();
            return false;
        });
    }

    function addBeforeDeleteMessage(shoutboxAPI, view) {
        view.getShoutBoxMainObject().on('click', 'a.shoutDeleteButton', function(event) {
            if (confirm('Na pewno chcesz usunąć ten shout?')) {
                shoutboxAPI.deleteShout($(event.target).parent()[0].id.substr(6));
            }

            event.preventDefault();
            return false;
        });
    }

    function shoutAuthorsNicksToButton(shoutboxAPI, view) {
        var shoutbox = view.getShoutBoxMainObject();

        shoutbox.on('click', '.shoutNick > a', function(event) {
            view.addTextValue('@' + event.target.innerHTML + ': ');

            event.preventDefault();
            return false;
        });
    }
})(ShoutBox);
