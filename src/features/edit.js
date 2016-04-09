(function(context) {
    /*
    // Edit feature (not finished)
    /*/
    function editFunctionality(shoutboxAPI, view) {
        privates.$shoutBoxTextBox.keypress(function(event) {
            if (event.keyCode !== 38) {
                    return;
            }

            var text = $.trim($('div#shout_' + privates.lastUserMessage + ' span.shoutMessage').text());
        });
    }
})(ShoutBox);
