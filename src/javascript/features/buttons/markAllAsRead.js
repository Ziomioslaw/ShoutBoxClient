context.Features.register(function(shoutboxAPI, view) {
    view.registerButton('Oznacz jako przeczytane', function(event) {
        shoutboxAPI.sendCommandToView('markAllShoutsAsRead');

        event.preventDefault();
        return false;
    });
});
