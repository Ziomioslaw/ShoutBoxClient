(function(context, $) {
    context.AdditionalFeatureManager.register(function(shoutboxAPI, view) {
        var labelEmoticonPanelOff = 'Schowaj emotikony';
        var labelEmoticonPanelOn = 'Pokaż emotikony';

        var emoticonPanelBox = $('#shoutbox-emoticons-box')
        var emoticonPanelButton = $('#shoutEmoticonsPanel');
        var optionName = 'emoticons';
        var emoticonPanelOn = context.ifNullTakeDefault(shoutboxAPI.getOptionValue(optionName), true);
        var emoticonPanelButton = view.registerOption(optionName);

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
                emoticonPanelButton.html('<a>' + labelEmoticonPanelOff + '</a>');
            } else {
                emoticonPanelBox.hide();
                emoticonPanelButton.html('<a>' + labelEmoticonPanelOn + '</a>');
            }
        }
    });
})(ShoutBox, jQuery);
