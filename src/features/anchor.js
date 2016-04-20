(function(context) {
    context.AdditionalFeatureManager.register(function(shoutboxAPI, view) {
        var anchorText = 'Zahacz Shoutboksa';
        var unanchorText = 'Odhacz Shoutboksa';
        var $shoutbox = view.getShoutBoxMainObject();
        var textEdit = view.getShoutBoxEditorObject();
        var button = view.registerOption('anchor', true);

        setButtonLabel();
        button.click(buttonClick);
        $shoutbox.on('shoutbox:view:refresh', viewRefresh);

        function checkShoutBoxAnchored() {
            return window.location.hash === '#shoutbox';
        }

        function buttonClick() {
            if (checkShoutBoxAnchored()) {
                 window.history.pushState('', document.title, window.location.pathname);
            } else {
                 window.location.hash = '#shoutbox';
            }

            setButtonLabel();
            return false;
        }

        function setButtonLabel() {
            button.html(checkShoutBoxAnchored() ? unanchorText : anchorText);
        }

        function viewRefresh(e) {
            if (checkShoutBoxAnchored()) {
                textEdit.focus();
            }
        }
    });
})(ShoutBox);
