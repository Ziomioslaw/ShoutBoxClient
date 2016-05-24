context.Features.register(function(shoutboxAPI, view) {
    view.getShoutBoxMainObject().on('click', 'a.shoutDeleteButton', function(event) {
        var shoutId = null;

        if (context.confirm('Na pewno chcesz usunąć ten shout?')) {
            shoutId = $(event.target).parent()[0].id.substr(6);
            shoutboxAPI.deleteShout(shoutId);
        }

        event.preventDefault();
        return false;
    });
});
