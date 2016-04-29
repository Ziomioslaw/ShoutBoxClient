context.Features.register(function(shoutboxAPI, view) {
    view.getShoutBoxMainObject().on('click', 'a.shoutDeleteButton', function(event) {
        if (context.confirm('Na pewno chcesz usunąć ten shout?')) {
            shoutboxAPI.deleteShout($(event.target).parent()[0].id.substr(6));
        }

        event.preventDefault();
        return false;
    });
});
