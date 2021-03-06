context.Features.register(function(shoutboxAPI, view) {
    var $shoutbox = view.getShoutBoxMainObject();
    var textEdit = view.getShoutBoxEditorObject();

    view.registerOption('anchor', false)
        .setOnLabel('icon-attachment', 'Zahacz')
        .setOffLabel('icon-attachment', 'Odhacz')
        .setOnClickCallback(function() {
            $shoutbox.on('shoutbox:view:refresh', viewRefresh);
            window.location.hash = '#shoutbox';
        })
        .setOffClickCallback(function() {
            $shoutbox.off('shoutbox:view:refresh', viewRefresh);
            window.history.pushState('', document.title, window.location.pathname);
        })
        .run();

    function viewRefresh() {
        textEdit.focus();
    }
});
