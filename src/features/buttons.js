(function(context) {
    context.AdditionalFeatureManager.register('emoticonPanel', shoutBoxEmoticonBox, true);
    context.AdditionalFeatureManager.register('readAllButton', shoutBoxAllShoutReadButton, true);
    context.AdditionalFeatureManager.register('deleteButton', addBeforeDeleteMessage, true);
    context.AdditionalFeatureManager.register('nicksButton', shoutAuthorsNicksToButton, true);

    function shoutBoxEmoticonBox(shoutboxAPI, view) {
        var labelEmoticonPanelOn = 'Pokaż emotikony';
        var labelEmoticonPanelOff = 'Schowaj emotikony';
        var emoticonPanelBox = $('#shoutbox-emoticons-box')
        var emoticonPanelButton = $('#shoutEmoticonsPanel');
        var optionName = 'emoticons';
        var emoticonPanelOn = shoutboxAPI.getOptionValue(optionName);

        emoticonBox(emoticonPanelOn);

        emoticonPanelBox.find('img').on('click', function(event) {
            var code = $(event.target).data('code');

            view.addTextValue(code);
            event.preventDefault();
            return;
        });

        emoticonPanelButton.click(function() {
            emoticonPanelOn = !emoticonPanelOn;
            emoticonBox(emoticonPanelOn);
            shoutboxAPI.setOptionValue(optionName, emoticonPanelOn);
        });

        function emoticonBox(show) {
            if (show) {
                emoticonPanelBox.show();
                emoticonPanelButton.html(labelEmoticonPanelOff);
            } else {
                emoticonPanelBox.hide();
                emoticonPanelButton.html(labelEmoticonPanelOn);
            }
        }
    }

    function shoutBoxAllShoutReadButton(shoutboxAPI) {
        $('#shoutboxButtonSetAllShoutsRead').click(function() {
            shoutboxAPI.sendCommandToView('markAllShoutsAsRead');
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
