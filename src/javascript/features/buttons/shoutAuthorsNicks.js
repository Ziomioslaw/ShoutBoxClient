context.Features.register(function(shoutboxAPI, view) {
    var shoutbox = view.getShoutBoxMainObject();

    shoutbox.on('click', '.shoutNick > a', function(event) {
        view.addTextValue('@' + event.target.innerHTML + ': ');

        event.preventDefault();
        return false;
    });
});
