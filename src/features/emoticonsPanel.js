(function(context) {
    context.AdditionalFeatureManager.register('emoticonPanel', shoutBoxEmoticonBox, true);

    function shoutBoxEmoticonBox(shoutboxAPI, view) {
        var labelEmoticonPanelOn = 'Pokaż emotikony';
        var labelEmoticonPanelOff = 'Schowaj emotikony';
        var emoticonPanelBox = $('#shoutbox-emoticons-box')
        var emoticonPanelButton = $('#shoutEmoticonsPanel');
        var optionName = 'emoticons';
        var emoticonPanelOn = shoutboxAPI.getOptionValue(optionName);

        view.registerOption();

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

})(ShoutBox);
