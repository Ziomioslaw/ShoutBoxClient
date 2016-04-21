(function(context) {
    context.AdditionalFeatureManager.register(function(shoutboxAPI, view) {
        var $shoutbox = view.getShoutBoxMainObject();
        var textEdit = view.getShoutBoxEditorObject();

        view.registerOption('anchor', false)
            .setOnLabel('Zahacz')
            .setOffLabel('Odhacz')
            .setClickCallBack(function(value) {
                if (value) {
                    $shoutbox.on('shoutbox:view:refresh', viewRefresh);
                    window.location.hash = '#shoutbox';
                } else {
                    $shoutbox.off('shoutbox:view:refresh', viewRefresh);
                    window.history.pushState('', document.title, window.location.pathname);
                }
            })
            .run();

        function viewRefresh() {
            textEdit.focus();
        }
    });
})(ShoutBox);
