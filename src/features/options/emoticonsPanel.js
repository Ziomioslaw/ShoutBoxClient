(function(context, $) {
    context.AdditionalFeatureManager.register(function(shoutboxAPI, view) {
        var emoticonPanelBox = $('#shoutbox-emoticons-box');

        view.registerOption('emoticons', true)
            .setOnLabel('Pokaż emotikony')
            .setOffLabel('Schowaj emotikony')
            .setOnClickCallback(function() {
                emoticonPanelBox.show();
            })
            .setOffClickCallback(function() {
                emoticonPanelBox.hide();
            })
            .run();

        emoticonPanelBox.find('img').on('click', function(event) {
            var code = $(event.target).data('code');

            view.addTextValue(code);
            event.preventDefault();
            return;
        });
    });
})(ShoutBox, jQuery);
